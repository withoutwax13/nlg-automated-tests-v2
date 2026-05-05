import { test, expect } from '@playwright/test';
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import RegistrationRecord from "../../objects/RegistrationRecord";
import RegistrationGrid from "../../objects/RegistrationGrid";
import FormPreview from "../../objects/FormPreview";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import ApplicationGrid from "../../objects/ApplicationGrid";
import ApplicationReview from "../../objects/ApplicationReview";
import Payment from "../../objects/Payment";

const randomSeed = () => Math.floor(Math.random() * 100000);

test.describe("As a Government User, if the business user's application does not meet a specific condition set in the Certificate builder, the Registration Record should not have a certificate button under the Active Registration Card when it's registration status is changed to ACTIVE or approved via Application Reviewer.", () => {
  test("Initiating test", () => {
    const form = new Form({ isRenewal: false });
    const formPreviewPage = new FormPreview();
    const filing = new Filing();
    const applicationConfirmation = new ApplicationConfirmation();
    const registrationRecord = new RegistrationRecord();
    const registrationGrid = new RegistrationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    const taxpayerApplicationGrid = new ApplicationGrid({
      userType: "taxpayer",
    });
    const agsApplicationGrid = new ApplicationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    const applicationReview = new ApplicationReview({ userType: "ags" });
    const paymentPage = new Payment();

    cy.login({ accountType: "taxpayer", accountIndex: 5 });

    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Business License (Annual) - E2E #1");
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
        taxpayerApplicationGrid.init();
        cy.get("@referenceId").then((referenceId) => {
          taxpayerApplicationGrid.getDataOfColumn(
            "Registration Record ID",
            "Reference ID",
            String(referenceId),
            "registrationRecordId"
          );
        });
        cy.logout();
        cy.login({ accountType: "ags", notFirstLogin: true, accountIndex: 5 });
        agsApplicationGrid.init();
        cy.get("@registrationRecordId").then((registrationRecordId) => {
          agsApplicationGrid.selectRowToReview({
            anchorColumnName: "Registration Record ID",
            anchorValue: String(registrationRecordId),
          });
          agsApplicationGrid.clickStartApplicationWorkflowForSelectedApplicationsButton();
          applicationReview.clickReviewStepTab("Manual Steps");
          applicationReview.manualStepsTab.clickApproveButton();
          applicationReview.clickReviewStepTab("Business Details");
          applicationReview.updateBusinessDetailsTab.clickEditBusinessDetailsButton();
          applicationReview.updateBusinessDetailsTab.updateBusinessList.clickReviewBusinessButton(customData.locationInfo.locations[0].locationAddress1);
          applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.disregardSimilarBusinessRecords();
          applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.clicUpdateAddBusinessDetailsButton();
          applicationReview.updateBusinessDetailsTab.updateBusinessList.clickUpdateFormRequirements(customData.locationInfo.locations[0].locationAddress1);
          applicationReview.updateBusinessDetailsTab.updateBusinessList.formRequirementsModal.enableForm("Food and Beverage");
          applicationReview.updateBusinessDetailsTab.updateBusinessList.formRequirementsModal.selectDateDelinquencyTrackingStartDate(1, 1, 2024);
          applicationReview.updateBusinessDetailsTab.updateBusinessList.formRequirementsModal.clickSaveButton();
          applicationReview.toggleActions("Approve");
          applicationReview.clickGoBackApplicationsButton();
          cy.logout();
          
          cy.login({ accountType: "taxpayer", notFirstLogin: true, accountIndex: 5 });
          taxpayerApplicationGrid.init();
          taxpayerApplicationGrid.payApplication("Registration Record ID", String(registrationRecordId));
          paymentPage.payViaAnySavedPaymentMethod();
          applicationConfirmation.clickCloseButton();
          cy.logout();

          cy.login({ accountType: "ags", notFirstLogin: true, accountIndex: 5 });
          agsApplicationGrid.init();
          agsApplicationGrid.manuallyChangeApplicationPaymentStatus("Fully Paid", "Registration Record ID", String(registrationRecordId));

          registrationGrid.init();
          registrationGrid.toggleRegistrationActionButton("View", "Registration Record ID", String(registrationRecordId));
          registrationRecord.getElements().downloadCertificateButton().should("not.exist");
        });
      }
    );
  });
});
