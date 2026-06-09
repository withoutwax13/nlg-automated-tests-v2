import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../objects/ApplicationGrid";
import { logout } from "../../support/native-helpers";
import Login from "../../utils/Login";
import {
  getRegistrationRecordIdFromTaxpayerGrid,
  payApplicationAsTaxpayer,
  reviewRegistrationApplication,
  submitBusinessLicenseRegistration,
} from "../helpers/registration-form-workflows";

const randomSeed = () => Math.floor(Math.random() * 100000000);

test.describe("As an AGS user, I want to be able to update the payment status for an application to Refunded manually", () => {
  test("Initiating test", async ({ page }) => {
    test.setTimeout(600000);
    const { referenceId, customData } = await submitBusinessLicenseRegistration(page, {
      accountIndex: 6,
      randomSeed: randomSeed(),
    });
    const registrationRecordId = await getRegistrationRecordIdFromTaxpayerGrid(page, referenceId);
    await logout(page);

    const { applicationReview } = await reviewRegistrationApplication(page, {
      accountType: "ags",
      accountIndex: 6,
      registrationRecordId,
      customData,
    });
    await expect(applicationReview.getElements().applicationStatusData()).toHaveText(/Approval Payment Required|Approved/);
    await applicationReview.clickGoBackApplicationsButton();
    await logout(page);

    await payApplicationAsTaxpayer(page, 6, registrationRecordId);
    await logout(page);

    const agsApplicationGrid = new ApplicationGrid(page, {
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    await Login.login(page, { accountType: "ags", accountIndex: 6, notFirstLogin: true });
    await agsApplicationGrid.init();
    const approvalPaymentStatusBeforeManualChange = await agsApplicationGrid.getDataOfColumn(
      "Approval Payment Status",
      "Registration Record ID",
      registrationRecordId
    );
    await agsApplicationGrid.clickClearAllFiltersButton();
    await agsApplicationGrid.manuallyChangeApplicationPaymentStatus(
      "Fully Paid",
      "Registration Record ID",
      registrationRecordId
    );
    await agsApplicationGrid.clickClearAllFiltersButton();
    const approvalPaymentStatusAfterManualChange = await agsApplicationGrid.getDataOfColumn(
      "Approval Payment Status",
      "Registration Record ID",
      registrationRecordId
    );

    expect(approvalPaymentStatusBeforeManualChange).not.toEqual(approvalPaymentStatusAfterManualChange);
    expect(approvalPaymentStatusBeforeManualChange).toContain("Pending");
    expect(approvalPaymentStatusAfterManualChange).toContain("Fully Paid");
  });
});
