import { test, expect } from '../../support/pwtest';
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";

const randomSeed = () => Math.floor(Math.random() * 100000);

test.describe.skip("After submitting an application without fee, taxpayer user must receive an email with subject, content, and HTML structure similar to the editable template in the workflow.'", () => {
  test("Initiating test", () => {
    const expectedFormName = "Business License (Annual) - E2E #1";
    const expectedGovernmentName = "City of Arrakis";
    const testmailVars = Cypress.env("testmail");
    const testmailTag = "taxpayeronly1";
    const ENDPOINT = `${testmailVars.endpoint}?apikey=${testmailVars.apiKey}&namespace=${testmailVars.namespace}&tag=${testmailTag}`;

    const form = new Form({ isRenewal: false });
    const formPreviewPage = new FormPreview();
    const filing = new Filing();
    const applicationConfirmation = new ApplicationConfirmation();

    cy.login({ accountType: "taxpayer", accountIndex: 10 });
    filing.goToSubmitFormsTab();
    filing.selectGovernment(expectedGovernmentName);
    filing.selectForm(expectedFormName);
    filing.clickSubmitNewRegistrationButton();
    form.clickNextbutton();
    form.selectIsRegisteringMultipleLocations(false);

    cy.getUniqueRegistrationData(randomSeed(), false).then(
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
        formPreviewPage.clickSubmitButton();
        applicationConfirmation
          .getElement()
          .referenceIdData()
          .invoke("text")
          .then((referenceId) => {
            cy.wrap(referenceId).as("referenceId");
          });
        applicationConfirmation.clickCloseButton();
        cy.wait(30000); // Waiting for email to be sent
        cy.get("@referenceId").then((referenceId) => {
          cy.request("GET", `${ENDPOINT}&livequery=true`).then((response) => {
            const email = response.body.emails[0];
            console.log(email);

            // Verify sender and subject
            cy.wrap(email.from).should(
              "equal",
              "Localgov <no-reply@azavargovapps.com>"
            );
            cy.wrap(email.subject).should(
              "equal",
              "An Application Has Been Submitted on Localgov [Without Fee]"
            );
            cy.wrap(email.html).should("include", "Status: Pending");
            cy.wrap(email.html).should(
              "include",
              `Reference ID: ${String(referenceId).toUpperCase()}`
            );
            cy.wrap(email.html).should(
              "include",
              `Form Name: ${expectedFormName}`
            );
            cy.wrap(email.html).should(
              "include",
              `Government: ${expectedGovernmentName}`
            );
          });
        });
      }
    );
  });
});
