import { expect, test } from "@playwright/test";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import Payment from "../../objects/Payment";
import { currentPage, getTestmail, getUniqueRegistrationData, initTestRuntime, login, requestJson, textOf } from "../../support/runtime";
import Login from "../../utils/Login";

type TestmailResponse = {
  emails: Array<{
    from: string;
    subject: string;
    html: string;
  }>;
};

const randomSeed = () => Math.floor(Math.random() * 100000);

test.describe.skip("After submitting an application with fee, taxpayer user must receive an email with subject, content, and HTML structure similar to the editable template in the workflow.'", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const expectedFormName = "Business License (One-Time) - E2E #2";
    const expectedGovernmentName = "City of Arrakis";
    const testmailVars = getTestmail();
    const endpoint = `${testmailVars.endpoint}?apikey=${testmailVars.apiKey}&namespace=${testmailVars.namespace}`;

    const form = new Form({ isRenewal: false });
    const formPreviewPage = new FormPreview();
    const filing = new Filing();
    const applicationConfirmation = new ApplicationConfirmation();
    const payment = new Payment();
    const customData = await getUniqueRegistrationData(randomSeed(), false);

    await Login.login({ accountType: "taxpayer", accountIndex: 10 });
    await filing.goToSubmitFormsTab();
    await filing.selectGovernment(expectedGovernmentName);
    await filing.selectForm(expectedFormName);
    await filing.clickSubmitNewRegistrationButton(true);
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
    await form.clickNextbutton();

    const paymentResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "GET" && response.url().includes("/payments/payment/")
    );

    await formPreviewPage.clickSubmitButton();
    await payment.payViaAnySavedPaymentMethod();

    const paymentResponse = await paymentResponsePromise;
    const paymentData = (await paymentResponse.json()) as { PaymentId: string; Amount: string | number };
    const referenceId = await textOf(applicationConfirmation.getElement().referenceIdData());
    await applicationConfirmation.clickCloseButton();

    await currentPage().waitForTimeout(5000);
    const response = await requestJson<TestmailResponse>(`${endpoint}&livequery=true`);
    const email = response.emails[0];

    expect(email.from).toBe("Localgov <no-reply@azavargovapps.com>");
    expect(email.subject).toBe("An Application Has Been Submitted on Localgov [With Fee]");
    expect(email.html).toContain("Status: Pending");
    expect(email.html).toContain(`Reference ID: ${String(referenceId).toUpperCase()}`);
    expect(email.html).toContain(`Form Name: ${expectedFormName}`);
    expect(email.html).toContain(`Government: ${expectedGovernmentName}`);
    expect(email.html).toContain(`Total Payment Paid: $${paymentData.Amount}`);
    expect(email.html).toContain(`Transaction ID: ${paymentData.PaymentId}`);
  });
});