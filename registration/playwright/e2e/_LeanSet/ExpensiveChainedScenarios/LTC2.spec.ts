import { expect, test } from "@playwright/test";
import ApplicationConfirmation from "../../../objects/ApplicationConfirmation";
import FormPreview from "../../../objects/FormPreview";
import RegistrationGrid from "../../../objects/RegistrationGrid";
import RegistrationRecord from "../../../objects/RegistrationRecord";
import { getUniqueRegistrationData, logout } from "../../../support/native-helpers";
import Login from "../../../utils/Login";
import {
  approvePayAndFundRegistration,
  enterBasicInformation,
  getRegistrationRecordIdFromTaxpayerGrid,
  startBusinessLicenseRegistration,
} from "../../helpers/registration-form-workflows";

const randomSeed = () => Math.floor(Math.random() * 100000000);

test.describe("Verify taxpayer can submit a multi-location registration, add and remove a location, and after AGS review/approval/payment the registration record has a certificate button", () => {
  test.skip("Initiating test", async ({ page }) => {
    test.setTimeout(700000);
    const { form } = await startBusinessLicenseRegistration(page, 6, true);
    const formPreviewPage = new FormPreview(page);
    const applicationConfirmation = new ApplicationConfirmation(page);
    const customData = getUniqueRegistrationData(randomSeed(), true, undefined, {
      legalBusinessName: "certificate",
    });

    await enterBasicInformation(form, customData.basicInfo);
    await form.clickNextbutton();

    await expect(form.getElement().addLocationButton()).toBeVisible();
    await form.clickAddLocationButton();
    await expect(form.getElement().locationAddress1().nth(1)).toBeVisible();
    await expect(form.getElement().locationAddress2().nth(1)).toBeVisible();
    await expect(form.getElement().locationCity().nth(1)).toBeVisible();
    await expect(form.getElement().locationMailingStateDropdown().nth(1)).toBeVisible();
    await expect(form.getElement().locationMailingZipCode().nth(1)).toBeVisible();
    await expect(form.getElement().managerOperatorFullName().nth(1)).toBeVisible();
    await expect(form.getElement().managerOperatorPhoneNumber().nth(1)).toBeVisible();

    await form.clickRemoveLocationButton();
    await expect(form.getElement().locationAddress1().nth(1)).toHaveCount(0);
    await expect(form.getElement().locationAddress2().nth(1)).toHaveCount(0);
    await expect(form.getElement().locationCity().nth(1)).toHaveCount(0);
    await expect(form.getElement().locationMailingStateDropdown().nth(1)).toHaveCount(0);
    await expect(form.getElement().locationMailingZipCode().nth(1)).toHaveCount(0);
    await expect(form.getElement().managerOperatorFullName().nth(1)).toHaveCount(0);
    await expect(form.getElement().managerOperatorPhoneNumber().nth(1)).toHaveCount(0);

    await form.enterLocationDetails(customData.locationInfo.locations as any[]);
    await form.clickNextbutton();
    await form.enterApplicantDetails(customData.applicantInfo as any, true);
    await form.clickNextbutton();
    await formPreviewPage.clickSubmitButton();
    const referenceId = await applicationConfirmation.getReferenceId();
    await applicationConfirmation.clickCloseButton();
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
