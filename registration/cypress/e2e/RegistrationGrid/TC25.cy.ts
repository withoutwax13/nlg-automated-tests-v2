import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import RegistrationGrid from "../../objects/RegistrationGrid";
import FormPreview from "../../objects/FormPreview";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import ApplicationGrid from "../../objects/ApplicationGrid";
import ApplicationReview from "../../objects/ApplicationReview";
import Payment from "../../objects/Payment";

const randomSeed = () => Math.floor(Math.random() * 100000);

describe.skip("As an AGS user, an active registration that cannot renew yet should be able to do so if I manually change the next due date to today", () => {
  it("Initiating test", () => {
    const form = new Form({ isRenewal: false });
    const formPreviewPage = new FormPreview();
    const filing = new Filing();
    const applicationConfirmation = new ApplicationConfirmation();
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

    cy.login({ accountType: "taxpayer", accountIndex: 3 });

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
        cy.login({ accountType: "ags", notFirstLogin: true, accountIndex: 3 });
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
          applicationReview.clickGoBackApplicationsButton();
          cy.logout();

          cy.login({
            accountType: "taxpayer",
            notFirstLogin: true,
            accountIndex: 3,
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
            notFirstLogin: true,
            accountIndex: 3,
          });
          agsApplicationGrid.init();
          agsApplicationGrid.manuallyChangeApplicationPaymentStatus(
            "Fully Paid",
            "Registration Record ID",
            String(registrationRecordId)
          );

          registrationGrid.init();
          registrationGrid.getDataOfColumn(
            "Can Renew",
            "Registration Record ID",
            String(registrationRecordId),
            "canRenewStatusInitial"
          );
          cy.get("@canRenewStatusInitial").should("eq", "Not Available");

          const today = new Date();
          const tenDaysBefore = new Date(today.setDate(today.getDate() - 10));
          const formattedDate = `${
            tenDaysBefore.getMonth() + 1
          }/${tenDaysBefore.getDate()}/${tenDaysBefore.getFullYear()}`;
          registrationGrid.clickClearAllFiltersButton();
          registrationGrid.manuallyChangeRegistrationDate(
            "Next Due Date",
            String(formattedDate),
            "Registration Record ID",
            String(registrationRecordId),
            true
          );

          registrationGrid.clickClearAllFiltersButton();
          registrationGrid.getDataOfColumn(
            "Can Renew",
            "Registration Record ID",
            String(registrationRecordId),
            "canRenewStatusFinal"
          );
          cy.get("@canRenewStatusFinal").should("eq", "Available");
        });
      }
    );
  });
});
