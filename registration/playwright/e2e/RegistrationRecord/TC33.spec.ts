import { expect, test } from "@playwright/test";
import RegistrationGrid from "../../objects/RegistrationGrid";
import RegistrationRecord from "../../objects/RegistrationRecord";
import { logout } from "../../support/native-helpers";
import Login from "../../utils/Login";
import {
  approvePayAndFundRegistration,
  getRegistrationRecordIdFromTaxpayerGrid,
  submitBusinessLicenseRegistration,
} from "../helpers/registration-form-workflows";

const randomSeed = () => Math.floor(Math.random() * 100000000);

test.describe("As a Government User, if the business user's application meet a specific condition set in the Certificate builder, the Registration Record should have a certificate button under the Active Registration Card when it's registration status is changed to ACTIVE or approved via Application Reviewer.", () => {
  test("Initiating test", async ({ page }) => {
    test.setTimeout(600000);
    const { referenceId, customData } = await submitBusinessLicenseRegistration(page, {
      accountIndex: 6,
      customValues: { legalBusinessName: "certificate" },
      randomSeed: randomSeed(),
    });
    const registrationRecordId = await getRegistrationRecordIdFromTaxpayerGrid(page, referenceId);
    await logout(page);

    await approvePayAndFundRegistration(page, {
      accountIndex: 6,
      registrationRecordId,
      customData,
    });
    await logout(page);

    await Login.login(page, { accountType: "ags", accountIndex: 6, notFirstLogin: true });
    const registrationGrid = new RegistrationGrid(page, {
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    const registrationRecord = new RegistrationRecord(page);
    await registrationGrid.init();
    await registrationGrid.toggleRegistrationActionButton("View", "Registration Record ID", registrationRecordId);
    await expect(registrationRecord.getElements().downloadCertificateButton()).toBeVisible();
  });
});
