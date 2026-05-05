import { test, expect } from '../../support/pwtest';
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import Payment from "../../objects/Payment";

const randomSeed = () => Math.floor(Math.random() * 100000);

test.describe.skip("After submitting an application with fee, taxpayer user must receive an email with subject, content, and HTML structure similar to the editable template in the workflow.'", () => {
  test("Initiating test", () => {
    const expectedFormName = "Business License (One-Time) - E2E #2";
    const expectedGovernmentName = "City of Arrakis";
    const testmailVars = PW.env("testmail");
    const ENDPOINT = `${testmailVars.endpoint}?apikey=${testmailVars.apiKey}&namespace=${testmailVars.namespace}`;

    const form = new Form({ isRenewal: false });
    const formPreviewPage = new FormPreview();
    const filing = new Filing();
    const applicationConfirmation = new ApplicationConfirmation();
    const payment = new Payment();

    pw.login({ accountType: "taxpayer", accountIndex: 10 });
    filing.goToSubmitFormsTab();
    filing.selectGovernment(expectedGovernmentName);
    filing.selectForm(expectedFormName);
    filing.clickSubmitNewRegistrationButton(true);
    form.clickNextbutton();
    form.selectIsRegisteringMultipleLocations(false);

    pw.getUniqueRegistrationData(randomSeed(), false).then(
      (customData: {
        basicInfo: any;
        locationInfo: { locations: any[] };
        applicantInfo: any;
      }) => {
        form.enterBusinessOwnerInformation(customData.basicInfo);
        form.enterLegalBusinessInformation(customData.basicInfo);
        form.checkForConsistentLegalBusinessAddressAndBusinessOwnerInformation();
        form.enterEmergencyPhoneNumbers(customData.basicInfo);
        form.clickNextbutton();
        form.enterLocationDetails(customData.locationInfo.locations);
        form.clickNextbutton();
        form.enterApplicantDetails(customData.applicantInfo, true);
        form.clickNextbutton();
        pw.intercept(
          "GET",
          "https://api-dev.azavargovapps.com/payments/payment/**"
        ).as("getPaymentData");
        formPreviewPage.clickSubmitButton();
        payment.payViaAnySavedPaymentMethod();
        pw.wait("@getPaymentData").then((interception) => {
          const paymentData = interception.response.body;
          pw.wrap(paymentData.PaymentId).as("transactionId");
          pw.wrap(paymentData.Amount).as("paymentAmount");
        });
        applicationConfirmation
          .getElement()
          .referenceIdData()
          .invoke("text")
          .then((referenceId) => {
            pw.wrap(referenceId).as("referenceId");
          });
        applicationConfirmation.clickCloseButton();
        pw.wait(5000); // Waiting for email to be sent
        pw.get("@referenceId").then((referenceId) => {
          pw.request("GET", `${ENDPOINT}&livequery=true`).then((response) => {
            const email = response.body.emails[0];
            console.log(email);

            // Verify sender and subject
            pw.wrap(email.from).should(
              "equal",
              "Localgov <no-reply@azavargovapps.com>"
            );
            pw.wrap(email.subject).should(
              "equal",
              "An Application Has Been Submitted on Localgov [With Fee]"
            );
            pw.wrap(email.html).should("include", "Status: Pending");
            pw.wrap(email.html).should(
              "include",
              `Reference ID: ${String(referenceId).toUpperCase()}`
            );
            pw.wrap(email.html).should(
              "include",
              `Form Name: ${expectedFormName}`
            );
            pw.wrap(email.html).should(
              "include",
              `Government: ${expectedGovernmentName}`
            );
            pw.get("@paymentAmount").then((paymentAmount) => {
              pw.wrap(email.html).should(
                "include",
                `Total Payment Paid: $${paymentAmount}`
              );
            });
            pw.get("@transactionId").then((transactionId) => {
              pw.wrap(email.html).should(
                "include",
                `Transaction ID: ${transactionId}`
              );
            });
          });
        });
      }
    );
  });
});
