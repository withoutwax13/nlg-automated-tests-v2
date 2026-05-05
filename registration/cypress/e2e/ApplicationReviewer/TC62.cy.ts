import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import ApplicationGrid from "../../objects/ApplicationGrid";
import ApplicationReview from "../../objects/ApplicationReview";

const randomSeed = () => Math.floor(Math.random() * 100000);

describe("As a reviewer user, I should be able to link/unlink an application record to a business/registration record.", () => {
  it("Initiating test", () => {
    const form = new Form({ isRenewal: false });
    const formPreviewPage = new FormPreview();
    const filing = new Filing();
    const applicationConfirmation = new ApplicationConfirmation();
    const taxpayerApplicationGrid = new ApplicationGrid({
      userType: "taxpayer",
    });
    const municipalApplicationGrid = new ApplicationGrid({
      userType: "municipal",
    });
    const applicationReview = new ApplicationReview({ userType: "municipal" });

    cy.login({ accountType: "taxpayer", accountIndex: 7 });

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
          accountType: "municipal",
          notFirstLogin: true,
          accountIndex: 7,
        });
        municipalApplicationGrid.init();
        cy.get("@registrationRecordId").then((registrationRecordId) => {
          municipalApplicationGrid.selectRowToReview({
            anchorColumnName: "Registration Record ID",
            anchorValue: String(registrationRecordId),
          });
          municipalApplicationGrid.clickStartApplicationWorkflowForSelectedApplicationsButton();
          applicationReview.clickReviewStepTab("Manual Steps");
          applicationReview.manualStepsTab.clickApproveButton();
          applicationReview.clickReviewStepTab("Business Details");
          applicationReview.updateBusinessDetailsTab.clickEditBusinessDetailsButton();
          applicationReview.updateBusinessDetailsTab.updateBusinessList.clickReviewBusinessButton(
            customData.locationInfo.locations[0].locationAddress1
          );
          applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.disregardSimilarBusinessRecords();
          applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.toggleLinkExistingBusiness();
          applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.selectBusinessLocationToLink(
            "11038"
          );
          applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.clickLinkUpdateLinkedBusinessButton();
          applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal
            .getElements()
            .linkExistingComponent()
            .should("exist");
          applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal.clickUndoLinkingButton();
          applicationReview.updateBusinessDetailsTab.updateBusinessList.reviewBusinessListModal
            .getElements()
            .linkExistingComponent()
            .should("not.exist");
        });
      }
    );
  });
});
