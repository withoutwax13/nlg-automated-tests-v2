import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../objects/ApplicationGrid";
import ApplicationReview from "../../objects/ApplicationReview";
import Login from "../../utils/Login";
import { logout } from "../../support/native-helpers";
import {
  getRegistrationRecordIdFromTaxpayerGrid,
  markApprovalPaymentStatus,
  payApplicationAsTaxpayer,
  reviewRegistrationApplication,
  submitBusinessLicenseRegistration,
} from "../helpers/registration-form-workflows";

const randomSeed = () => Math.floor(Math.random() * 100000000);

test.describe("As a Government User, if the business user's application does not meet a specific condition set in the Certificate builder, there should be no certificate under the Certificate Tab of the said record when it is APPROVED", () => {
  test("Initiating test", async ({ page }) => {
    test.setTimeout(600000);
    const { referenceId, customData } = await submitBusinessLicenseRegistration(page, {
      accountIndex: 5,
      randomSeed: randomSeed(),
    });
    const registrationRecordId = await getRegistrationRecordIdFromTaxpayerGrid(page, referenceId);
    await logout(page);

    const { applicationReview } = await reviewRegistrationApplication(page, {
      accountType: "municipal",
      accountIndex: 5,
      registrationRecordId,
      customData,
    });
    await applicationReview.clickGoBackApplicationsButton();
    await logout(page);
    await payApplicationAsTaxpayer(page, 5, registrationRecordId);
    await logout(page);
    await markApprovalPaymentStatus(page, 5, registrationRecordId);
    await logout(page);

    await Login.login(page, { accountType: "municipal", accountIndex: 5, notFirstLogin: true });
    const municipalApplicationGrid = new ApplicationGrid(page, { userType: "municipal" });
    const municipalApplicationReview = new ApplicationReview(page, { userType: "municipal" });
    await municipalApplicationGrid.init();
    await municipalApplicationGrid.selectRowToReview({
      anchorColumnName: "Registration Record ID",
      anchorValue: registrationRecordId,
    });
    await municipalApplicationGrid.clickStartApplicationWorkflowForSelectedApplicationsButton();
    await expect(municipalApplicationReview.getElements().reviewStepperTab().locator("text=Certificate")).toHaveCount(0);
  });
});
