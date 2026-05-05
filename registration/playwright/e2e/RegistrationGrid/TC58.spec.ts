import { test, expect } from '@playwright/test';
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import ApplicationGrid from "../../objects/ApplicationGrid";
import ApplicationReview from "../../objects/ApplicationReview";
import Payment from "../../objects/Payment";
import RegistrationGrid from "../../objects/RegistrationGrid";

const randomSeed = () => Math.floor(Math.random() * 100000);

test.describe("When the business is linked and the application is approved, the current registration will be deleted, and a new one will be created with the linked business info.", () => {
  test.beforeEach(() => {
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
    const applicationReview = new ApplicationReview({ userType: "municipal" });
    const paymentPage = new Payment();
    const agsRegistrationGrid = new RegistrationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });

    cy.login({ accountType: "taxpayer", accountIndex: 4 });

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
        cy.wrap(customData).as("initialRegistrationData");
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
            "revokedRegistrationRecordId"
          );
        });
        cy.logout();
        cy.login({ accountType: "ags", notFirstLogin: true, accountIndex: 4 });
        agsApplicationGrid.init();
        cy.get("@revokedRegistrationRecordId").then(
          (revokedRegistrationRecordId) => {
            agsApplicationGrid.selectRowToReview({
              anchorColumnName: "Registration Record ID",
              anchorValue: String(revokedRegistrationRecordId),
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
            cy.logout();

            cy.login({ accountType: "taxpayer", notFirstLogin: true, accountIndex: 4 });
            taxpayerApplicationGrid.init();
            taxpayerApplicationGrid.payApplication(
              "Registration Record ID",
              String(revokedRegistrationRecordId)
            );
            paymentPage.payViaAnySavedPaymentMethod();
            applicationConfirmation.clickCloseButton();
            cy.logout();

            cy.login({ accountType: "ags", notFirstLogin: true, accountIndex: 4 });
            agsApplicationGrid.init();
            agsApplicationGrid.manuallyChangeApplicationPaymentStatus(
              "Fully Paid",
              "Registration Record ID",
              String(revokedRegistrationRecordId)
            );
            agsRegistrationGrid.init();
            agsRegistrationGrid.manuallyChangeRegistrationStatus(
              "Revoked",
              "Registration Record ID",
              String(revokedRegistrationRecordId)
            );
            cy.logout();
          }
        );
      }
    );
  });
  test("Initiating test", () => {
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
    const paymentPage = new Payment();
    const agsRegistrationGrid = new RegistrationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });

    cy.login({ accountType: "taxpayer", notFirstLogin: true, accountIndex: 4 });

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
        cy.login({ accountType: "ags", notFirstLogin: true, accountIndex: 4 });
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
          applicationReview.updateBusinessDetailsTab.updateBusinessList.clickReviewBusinessButton(
            customData.locationInfo.locations[0].locationAddress1
          );
          cy.get("@initialRegistrationData").then((data) => {
            const initialRegistrationData = data as any;
            applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.disregardSimilarBusinessRecords();
            applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.toggleLinkExistingBusiness();
            applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.selectBusinessLocationToLink(
              initialRegistrationData.locationInfo.locations[0].locationDBA.match(
                /\d+/
              )[0]
            );
            applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.clickLinkUpdateLinkedBusinessButton();
          });
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
          cy.logout();

          cy.login({ accountType: "taxpayer", notFirstLogin: true, accountIndex: 4 });
          taxpayerApplicationGrid.init();
          taxpayerApplicationGrid.payApplication(
            "Registration Record ID",
            String(registrationRecordId)
          );
          paymentPage.payViaAnySavedPaymentMethod();
          applicationConfirmation.clickCloseButton();
          cy.logout();

          cy.login({ accountType: "ags", notFirstLogin: true, accountIndex: 4 });
          agsApplicationGrid.init();
          agsApplicationGrid.manuallyChangeApplicationPaymentStatus(
            "Fully Paid",
            "Registration Record ID",
            String(registrationRecordId)
          );
          cy.get("@revokedRegistrationRecordId").then(
            (revokedRegistrationRecordId) => {
              agsRegistrationGrid.init();
              agsRegistrationGrid.filterColumn(
                "Registration Record ID",
                String(revokedRegistrationRecordId)
              );
              agsRegistrationGrid
                .getElement()
                .noRecordFoundComponent()
                .should("not.exist");

              agsRegistrationGrid.clickClearAllFiltersButton();
              agsRegistrationGrid.filterColumn(
                "Registration Record ID",
                String(registrationRecordId)
              );
              agsRegistrationGrid
                .getElement()
                .noRecordFoundComponent()
                .should("not.exist");
            }
          );
        });
      }
    );
  });
});
