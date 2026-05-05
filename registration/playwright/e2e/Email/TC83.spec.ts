import { test, expect } from '../../support/pwtest';
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import ApplicationGrid from "../../objects/ApplicationGrid";
import ApplicationReview from "../../objects/ApplicationReview";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";

const randomSeed = () => Math.floor(Math.random() * 100000);

test.describe.skip("After submitting an application without making a payment, taxpayer user must receive an email with subject, content, and HTML structure similar to the editable template in the workflow.'", () => {
  test("Initiating test", () => {
    const expectedFormName = "Business License (Annual) - E2E #1";
    const expectedGovernmentName = "City of Arrakis";
    const testmailVars = PW.env("testmail");
    const ENDPOINT = `${testmailVars.endpoint}?apikey=${testmailVars.apiKey}&namespace=${testmailVars.namespace}`;

    const form = new Form({ isRenewal: false });
    const formPreviewPage = new FormPreview();
    const filing = new Filing();
    const applicationConfirmation = new ApplicationConfirmation();
    const taxpayerApplicationGrid = new ApplicationGrid({
      userType: "taxpayer",
    });
    const agsApplicationGrid = new ApplicationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    const applicationReview = new ApplicationReview({ userType: "ags" });

    pw.login({ accountType: "taxpayer", accountIndex: 10 });

    filing.goToSubmitFormsTab();
    filing.selectGovernment(expectedGovernmentName);
    filing.selectForm(expectedFormName);
    filing.clickSubmitNewRegistrationButton();
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
        formPreviewPage.clickSubmitButton();
        applicationConfirmation
          .getElement()
          .referenceIdData()
          .invoke("text")
          .then((referenceId) => {
            pw.wrap(referenceId).as("referenceId");
          });
        applicationConfirmation.clickCloseButton();
        taxpayerApplicationGrid.init();
        pw.get("@referenceId").then((referenceId) => {
          taxpayerApplicationGrid.getDataOfColumn(
            "Registration Record ID",
            "Reference ID",
            String(referenceId),
            "registrationRecordId"
          );
        });
        pw.logout();
        pw.login({ accountType: "ags", notFirstLogin: true, accountIndex: 1 });
        agsApplicationGrid.init();
        pw.get("@registrationRecordId").then((registrationRecordId) => {
          agsApplicationGrid.selectRowToReview({
            anchorColumnName: "Registration Record ID",
            anchorValue: String(registrationRecordId),
          });
          agsApplicationGrid.clickStartApplicationWorkflowForSelectedApplicationsButton();
          applicationReview.clickReviewStepTab("Manual Steps");
          applicationReview.manualStepsTab.clickApproveButton();
          applicationReview.clickReviewStepTab("Business Details");
          applicationReview.updateBusinessDetailsTab.clickEditBusinessDetailsButton();
          applicationReview.updateBusinessDetailsTab.updateBusinessList.clickReviewBusinessButton(
            customData.locationInfo.locations[0].locationAddress1
          );
          applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.disregardSimilarBusinessRecords();
          applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.clicUpdateAddBusinessDetailsButton();
          applicationReview.updateBusinessDetailsTab.updateBusinessList.clickUpdateFormRequirements(
            customData.locationInfo.locations[0].locationAddress1
          );
          applicationReview.updateBusinessDetailsTab.updateBusinessList.formRequirementsModal.enableForm(
            "Food and Beverage"
          );
          applicationReview.updateBusinessDetailsTab.updateBusinessList.formRequirementsModal.selectDateDelinquencyTrackingStartDate(
            1,
            1,
            2024
          );
          applicationReview.updateBusinessDetailsTab.updateBusinessList.formRequirementsModal.clickSaveButton();
          applicationReview.toggleActions("Approve");
          applicationReview.clickGoBackApplicationsButton();
          pw.logout();
        });
      }
    );
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
          "[Action Required] Complete Payment to Finalize Your Application Approval on Localgov"
        );
        pw.wrap(email.html).should(
          "include",
          "Status: Approved/Awaiting Payment"
        );
        pw.wrap(email.html).should(
          "include",
          `Reference ID: ${String(referenceId).toUpperCase()}`
        );
        pw.wrap(email.html).should("include", `Form Name: ${expectedFormName}`);
        pw.wrap(email.html).should(
          "include",
          `Government: ${expectedGovernmentName}`
        );
        pw.wrap(email.html).should("include", "Amount Due: $100");
      });
    });
  });
});
