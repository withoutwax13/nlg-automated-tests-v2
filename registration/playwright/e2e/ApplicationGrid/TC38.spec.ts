import { test, expect } from '../../support/pwtest';
import Filing from "../../objects/Filing";
import Form from "../../objects/Form";
import FormPreview from "../../objects/FormPreview";
import ApplicationConfirmation from "../../objects/ApplicationConfirmation";
import ApplicationGrid from "../../objects/ApplicationGrid";
import FilingGrid from "../../objects/FilingGrid";
import Payment from "../../objects/Payment";

const randomSeed = () => Math.floor(Math.random() * 100000);

test.describe("As a gov/AGS user, application records with not funded Payment Status in the filing list of credit card payment should be visible in the application list", () => {
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
    const filingGrid = new FilingGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    const payment = new Payment();

    cy.login({ accountType: "taxpayer", accountIndex: 2 });

    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Business License (One-Time) - E2E #2");
    filing.clickSubmitNewRegistrationButton(true);
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
        payment.payViaAnySavedPaymentMethod();
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
        cy.login({ accountType: "ags", notFirstLogin: true, accountIndex: 2 });
        cy.get("@referenceId").then((referenceId) => {
          filingGrid.init();
          filingGrid.getDataOfColumn(
            "Payment Status",
            "Reference ID",
            String(referenceId),
            "paymentStatus"
          );
          cy.get("@paymentStatus").then((paymentStatus) => {
            expect(paymentStatus).to.not.equal("Funded");
          });
        });
        cy.get("@registrationRecordId").then((registrationRecordId) => {
          agsApplicationGrid.init();
          agsApplicationGrid.filterColumn(
            "Registration Record ID",
            String(registrationRecordId)
          );
          agsApplicationGrid
            .getElement()
            .noRecordFoundComponent()
            .should("not.exist");
        });
      }
    );
  });
});
