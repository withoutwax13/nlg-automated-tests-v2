import { test, expect } from '@playwright/test';
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import ApplicationGrid from "../../objects/ApplicationGrid";
import ApplicationReview from "../../objects/ApplicationReview";
import Payment from "../../objects/Payment";

const randomSeed = () => Math.floor(Math.random() * 100000);

test.describe("As an AGS user, I want to be able to update the payment status for an application to Refunded manually", () => {
  test("Initiating test", () => {
    const form = new Form({ isRenewal: false });
    const formPreviewPage = new FormPreview();
    const filing = new Filing();
    const paymentPage = new Payment();
    const applicationConfirmation = new ApplicationConfirmation();
    const taxpayerApplicationGrid = new ApplicationGrid({
      userType: "taxpayer",
    });
    const agsApplicationGrid = new ApplicationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    const applicationReview = new ApplicationReview({ userType: "ags" });

    cy.login({ accountType: "taxpayer", accountIndex: 6 });

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
        cy.login({
          accountType: "ags",
          notFirstLogin: true,
          accountIndex: 6,
        });
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
          applicationReview
            .getElements()
            .applicationStatusData()
            .should(($status) => {
              expect($status.text().trim()).to.match(
                /Approval Payment Required|Approved/
              );
            });
          applicationReview.clickGoBackApplicationsButton();
          cy.logout();
          cy.login({
            accountType: "taxpayer",
            accountIndex: 6,
            notFirstLogin: true,
          });
          taxpayerApplicationGrid.init();
          taxpayerApplicationGrid.payApplication(
            "Registration Record ID",
            String(registrationRecordId)
          );
          paymentPage.payViaAnySavedPaymentMethod();
          applicationConfirmation.clickCloseButton();
          cy.logout();
          cy.login({
            accountType: "ags",
            accountIndex: 6,
            notFirstLogin: true,
          });
          agsApplicationGrid.init();
          agsApplicationGrid.getDataOfColumn(
            "Approval Payment Status",
            "Registration Record ID",
            String(registrationRecordId),
            "approvalPaymentStatusBeforeManualChange"
          );
          agsApplicationGrid.clickClearAllFiltersButton();
          agsApplicationGrid.manuallyChangeApplicationPaymentStatus(
            "Fully Paid",
            "Registration Record ID",
            String(registrationRecordId)
          );
          agsApplicationGrid.clickClearAllFiltersButton();
          agsApplicationGrid.getDataOfColumn(
            "Approval Payment Status",
            "Registration Record ID",
            String(registrationRecordId),
            "approvalPaymentStatusAfterManualChange"
          );
          cy.get("@approvalPaymentStatusBeforeManualChange").then(
            (approvalPaymentStatusBeforeManualChange) => {
              cy.get("@approvalPaymentStatusAfterManualChange").then(
                (approvalPaymentStatusAfterManualChange) => {
                  expect(approvalPaymentStatusBeforeManualChange).to.not.equal(
                    approvalPaymentStatusAfterManualChange
                  );
                  expect(approvalPaymentStatusBeforeManualChange).to.equal(
                    "Pending"
                  );
                  expect(approvalPaymentStatusAfterManualChange).to.equal(
                    "Fully Paid"
                  );
                }
              );
            }
          );
        });
      }
    );
  });
});
