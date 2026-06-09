import { expect, test } from "@playwright/test";
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import Login from "../../utils/Login";
import { logout } from "../../support/native-helpers";
import {
  approvePayAndFundRegistration,
  enterBasicInformation,
  getRegistrationRecordIdFromTaxpayerGrid,
  submitBusinessLicenseRegistration,
  BUSINESS_LICENSE_FORM,
  ARRAKIS_GOVERNMENT,
} from "../helpers/registration-form-workflows";

const randomSeed = () => Math.floor(Math.random() * 100000000);

test.describe("As a taxpayer, I want the system to prohibit me from sending duplicate registrations", () => {
  test("Initiating test", async ({ page }) => {
    test.setTimeout(700000);
    const { referenceId, customData } = await submitBusinessLicenseRegistration(page, {
      accountIndex: 9,
      randomSeed: randomSeed(),
    });
    const registrationRecordId = await getRegistrationRecordIdFromTaxpayerGrid(page, referenceId);
    await logout(page);

    await approvePayAndFundRegistration(page, {
      accountIndex: 9,
      registrationRecordId,
      customData,
    });
    await logout(page);

    const filing = new Filing(page);
    const form = new Form(page, { isRenewal: false });
    const formPreviewPage = new FormPreview(page);

    await Login.login(page, { accountType: "taxpayer", accountIndex: 9, notFirstLogin: true });
    await filing.goToSubmitFormsTab();
    await filing.selectGovernment(ARRAKIS_GOVERNMENT);
    await filing.selectForm(BUSINESS_LICENSE_FORM);
    await filing.clickSubmitNewRegistrationButton();
    await form.clickNextbutton();
    await form.selectIsRegisteringMultipleLocations(false);
    await enterBasicInformation(form, customData.basicInfo);
    await form.clickNextbutton();
    await form.enterLocationDetails(customData.locationInfo.locations as any[]);
    await form.clickNextbutton();
    await form.enterApplicantDetails(customData.applicantInfo as any, true);
    await form.clickNextbutton();

    await expect(formPreviewPage.getElement().duplicateRegistrationWarning()).toBeVisible();
  });
});
