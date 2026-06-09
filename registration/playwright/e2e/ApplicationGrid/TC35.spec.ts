import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../objects/ApplicationGrid";
import { logout } from "../../support/native-helpers";
import {
  approvePayAndFundRegistration,
  getRegistrationRecordIdFromTaxpayerGrid,
  submitBusinessLicenseRegistration,
} from "../helpers/registration-form-workflows";

const randomSeed = () => Math.floor(Math.random() * 100000000);

test.describe("As a Government User, if the business user's application does not meet a specific condition set in the Certificate builder, the Application Record should not have a certificate button when it's registration status is Approved", () => {
  test("Initiating test", async ({ page }) => {
    test.setTimeout(600000);
    const { referenceId, customData } = await submitBusinessLicenseRegistration(page, {
      accountIndex: 1,
      randomSeed: randomSeed(),
    });
    const registrationRecordId = await getRegistrationRecordIdFromTaxpayerGrid(page, referenceId);
    await logout(page);

    await approvePayAndFundRegistration(page, {
      accountIndex: 1,
      registrationRecordId,
      customData,
    });

    const agsApplicationGrid = new ApplicationGrid(page, {
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    await agsApplicationGrid.init();
    const certificateCell = await agsApplicationGrid.getElementOfColumn(
      "Certificate",
      "Registration Record ID",
      registrationRecordId
    );
    await expect(certificateCell.locator("svg")).toHaveCount(0);
  });
});
