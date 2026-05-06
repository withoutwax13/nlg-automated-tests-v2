import { expect, test } from "@playwright/test";
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import { getUniqueRegistrationData, initTestRuntime, login } from "../../support/runtime";
import Login from "../../utils/Login";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("If user clicks the 'Add Location' button on the location info step, a new set of input fields must be visible", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const form = new Form({ isRenewal: false });
    const filing = new Filing();
    const customData = await getUniqueRegistrationData(randomSeed, true);

    await Login.login({ accountType: "taxpayer", accountIndex: 5 });
    await filing.goToSubmitFormsTab();
    await filing.selectGovernment("City of Arrakis");
    await filing.selectForm("Business License (Annual) - E2E #1");
    await filing.clickSubmitNewRegistrationButton();
    await form.clickNextbutton();
    await form.selectIsRegisteringMultipleLocations(true);
    await form.enterBusinessOwnerInformation(customData.basicInfo as any);
    await form.enterLegalBusinessInformation(customData.basicInfo as any);
    await form.checkForConsistentLegalBusinessAddressAndBusinessOwnerInformation();
    await form.enterEmergencyPhoneNumbers(customData.basicInfo as any);
    await form.clickNextbutton();
    await expect(form.getElement().addLocationButton()).toHaveCount(1);
    await form.clickAddLocationButton();
    await expect(form.getElement().locationAddress1().nth(1)).toBeVisible();
    await expect(form.getElement().locationAddress2().nth(1)).toBeVisible();
    await expect(form.getElement().locationCity().nth(1)).toBeVisible();
    await expect(form.getElement().locationMailingStateDropdown().nth(1)).toBeVisible();
    await expect(form.getElement().locationMailingZipCode().nth(1)).toBeVisible();
    await expect(form.getElement().managerOperatorFullName().nth(1)).toBeVisible();
    await expect(form.getElement().managerOperatorPhoneNumber().nth(1)).toBeVisible();
  });
});