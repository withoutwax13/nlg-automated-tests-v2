import { expect, test } from "@playwright/test";
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import { getUniqueRegistrationData, initTestRuntime, login } from "../../support/runtime";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("If user opted for not an agency registering in behalf of the customer, the corresponding fields and labels must be visible on the Applicant info step", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const form = new Form({ isRenewal: false });
    const filing = new Filing();
    const customData = await getUniqueRegistrationData(randomSeed, false);

    await login({ accountType: "taxpayer", accountIndex: 7 });
    await filing.goToSubmitFormsTab();
    await filing.selectGovernment("City of Arrakis");
    await filing.selectForm("Business License (Annual) - E2E #1");
    await filing.clickSubmitNewRegistrationButton();
    await form.clickNextbutton();
    await form.selectIsRegisteringMultipleLocations(false);
    await form.enterBusinessOwnerInformation(customData.basicInfo as any);
    await form.enterLegalBusinessInformation(customData.basicInfo as any);
    await form.checkForConsistentLegalBusinessAddressAndBusinessOwnerInformation();
    await form.enterEmergencyPhoneNumbers(customData.basicInfo as any);
    await form.clickNextbutton();
    await form.enterLocationDetails((customData.locationInfo as any).locations);
    await form.clickNextbutton();
    await form.enterApplicantDetails(customData.applicantInfo as any, false);
    await expect(form.getElement().agencyName()).toBeVisible();
    await expect(form.getElement().agencyTypeDropdown()).toBeVisible();
    await expect(form.getElement().preparerFullName()).toBeVisible();
    await expect(form.getElement().preparerPhone()).toBeVisible();
    await expect(form.getElement().preparerEmailAddress()).toBeVisible();
    await expect(form.getElement().signature()).toBeVisible();
  });
});
