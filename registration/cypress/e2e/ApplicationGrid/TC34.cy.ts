import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import RegistrationGrid from "../../objects/RegistrationGrid";
import FormPreview from "../../objects/FormPreview";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import ApplicationGrid from "../../objects/ApplicationGrid";

const randomSeed = () => Math.floor(Math.random() * 100000);

describe("As a Business User, when a Registration Record is added into my Registration List, I can see a unique “Registration Record ID” in the application data grid column.", () => {
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

    cy.login({ accountType: "taxpayer" });

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
        cy.get("@registrationRecordId").then((registrationRecordId) => {
          taxpayerApplicationGrid.filterColumn(
            "Registration Record ID",
            String(registrationRecordId)
          );
          taxpayerApplicationGrid.getElement().rows().should("have.length", 1);
        });
      }
    );
  });
});
