import { expect, test } from "@playwright/test";
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import { getUniqueRegistrationData, initTestRuntime, login, textOf } from "../../support/runtime";
import Login from "../../utils/Login";

const randomSeed = Math.floor(Math.random() * 1000);

test.describe("User must see the current date on the Applicant info step", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const form = new Form({ isRenewal: false });
    const filing = new Filing();
    const customData = await getUniqueRegistrationData(randomSeed, false);
    const today = new Date().toLocaleDateString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    await Login.login(page, { accountType: "taxpayer", accountIndex: 9 });
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
    await form.enterApplicantDetails(customData.applicantInfo as any, true);
    expect([today, tomorrow, yesterday]).toContain(
      await textOf(form.getElement().applicantInfoDateData())
    );
  });
});