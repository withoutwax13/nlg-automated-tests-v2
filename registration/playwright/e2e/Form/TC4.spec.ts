import { expect, test } from "@playwright/test";
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import { getUniqueRegistrationData, initTestRuntime, login, waitForLoading } from "../../support/runtime";
import Login from "../../utils/Login";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("User should not be able to proceed to Applicant info step if the required details are not provided on the Location info step", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const form = new Form({ isRenewal: false });
    const filing = new Filing();
    const customData = await getUniqueRegistrationData(randomSeed, false, [
      "locationInfo.locations[0].locationDBA",
    ]);

    await Login.login(page, { accountType: "taxpayer", accountIndex: 3 });
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
    await waitForLoading();
    await expect(form.getElement().nextButton()).toBeDisabled();
  });
});