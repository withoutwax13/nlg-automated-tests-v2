import { test, expect } from '@playwright/test';
import RegistrationGrid from "../../objects/RegistrationGrid";
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessDetails from "../../objects/BusinessDetails";

const randomSeed = Math.floor(Math.random() * 100000);
const customData = {
  legalBusinessName: `dummy data ${randomSeed}`,
  fein: "12-3456789",
  legalBusinessAddress1: `123 Desert Road ${randomSeed}`,
  legalBusinessAddress2: "Suite 100",
  legalBusinessCity: "Dune",
  legalBusinessState: "Alaska",
  legalBusinessZipCode: "90210",
  locationDba: `dummy dba data ${randomSeed}`,
  stateTaxId: "ST-9876543",
  locationOpenDate: {
    month: "01",
    day: "15",
    year: "2023",
  },
  businessOwnerFullName: `Paul Atreides var #${randomSeed}`,
  businessOwnerEmailAddress: "paul@arrakis.com",
  businessOwnerPhoneNumber: "0000000000",
  businessOwnerSSN: "000000000",
  businessOwnerAddress1: "456 Sand Dune",
  businessOwnerAddress2: "Apt 202",
  businessOwnerCity: "Dune",
  businessOwnerState: "Alaska",
  businessOwnerZipCode: "90210",
};

test.describe.skip("As an AGS User, If I delete a business record associated to an ACTIVE Registration record, the Registration Status of the said registration record should be deleted.", () => {
  test("Initiating test", () => {
    const registrationGrid = new RegistrationGrid({
      userType: "ags",
      municipalitySelection: "Arrakis",
    });
    const businessAddPage = new BusinessAdd({ userType: "ags" });
    const businessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: "Arrakis",
    });
    const businessDetailsPage = new BusinessDetails({ userType: "ags" });

    cy.login({ accountType: "ags", accountIndex: 2 });
    businessGrid.init();
    businessGrid.clickAddBusinessButton();
    businessAddPage.fillFields(customData);
    businessAddPage.clickSaveButton();
    businessGrid.init();
    businessGrid.viewBusinessDetails(customData.locationDba);
    cy.url().should("include", "/BusinessesApp/BusinessDetails/");
    businessDetailsPage.clickFormsTab();
    businessDetailsPage.enableForm("Business License (Annual) - E2E #1");

    cy.waitForLoading(); // wait for the backend to finish processing the form enablement
    registrationGrid.init();
    registrationGrid.getDataOfColumn(
      "Registration Record ID",
      "Location DBA",
      customData.locationDba,
      "regRecordId"
    );
    registrationGrid.clickClearAllFiltersButton();
    registrationGrid.manuallyChangeRegistrationStatus(
      "Active",
      "Location DBA",
      customData.locationDba
    );
    registrationGrid.clickClearAllFiltersButton();
    cy.get("@regRecordId").then(($regRecordId) => {
      registrationGrid.getDataOfColumn(
        "Registration Status",
        "Registration Record ID",
        String($regRecordId),
        "registrationStatus"
      );
    });
    cy.get("@registrationStatus").then(($registrationStatus) => {
      expect($registrationStatus).to.equal("Active");
    });

    businessGrid.init();
    businessGrid.deleteBusiness(customData.locationDba);

    cy.logout();
    cy.login({ accountType: "ags", notFirstLogin: true, accountIndex: 2 });
    registrationGrid.init();
    registrationGrid.filterColumn("Location DBA", customData.locationDba);
    registrationGrid.getElement().noRecordFoundComponent().should("exist");
  });
});
