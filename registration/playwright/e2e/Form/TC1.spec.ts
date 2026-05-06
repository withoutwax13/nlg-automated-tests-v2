import { expect, test } from "@playwright/test";
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import { getUniqueRegistrationData, initTestRuntime, login } from "../../support/runtime";
import Login from "../../utils/Login";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("User should be able to add locations if opted for registering multiple business locations in the basic info step", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const form = new Form({ isRenewal: false });
    const filing = new Filing();
    const customData = await getUniqueRegistrationData(randomSeed, true);

    await Login.login({ accountType: "taxpayer" });
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
    await expect(form.getElement().addLocationButton()).toBeVisible();
    await form.enterLocationDetails((customData.locationInfo as any).locations);
  });
});