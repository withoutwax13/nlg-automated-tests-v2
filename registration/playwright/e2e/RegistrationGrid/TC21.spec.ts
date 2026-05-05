import { test, expect } from '../../support/pwtest';
import RegistrationGrid from "../../objects/RegistrationGrid";
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessDetails from "../../objects/BusinessDetails";

const randomSeed = Math.floor(Math.random() * 100000);
const customData = {
  legalBusinessName: `TC21dummy data ${randomSeed}`,
  fein: "12-3456789",
  legalBusinessAddress1: `TC21123 Desert Road ${randomSeed}`,
  legalBusinessAddress2: "Suite 100",
  legalBusinessCity: "Dune",
  legalBusinessState: "Alaska",
  legalBusinessZipCode: "90210",
  locationDba: `TC21dummy dba data ${randomSeed}`,
  stateTaxId: "ST-9876543",
  locationOpenDate: {
    month: "01",
    day: "15",
    year: "2023",
  },
  businessOwnerFullName: `TC21Paul Atreides var #${randomSeed}`,
  businessOwnerEmailAddress: "paul@arrakis.com",
  businessOwnerPhoneNumber: "0000000000",
  businessOwnerSSN: "000000000",
  businessOwnerAddress1: "456 Sand Dune",
  businessOwnerAddress2: "Apt 202",
  businessOwnerCity: "Dune",
  businessOwnerState: "Alaska",
  businessOwnerZipCode: "90210",
};

test.describe("As an AGS User, when I select a form submission requirement in a business' details page and it is a RegistrationForm type and is Active, a Registration Record will automatically be generated for that business and form and appear in the Registration List. If no applications has been submitted for the Registration Record, the Registration Status will be “Not Registered” by default.", () => {
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

    cy.login({ accountType: "ags", accountIndex: 9 });
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
      "Registration Status",
      "Location DBA",
      customData.locationDba,
      "registrationStatus"
    );
    cy.get("@registrationStatus").should("eq", "Not Registered");
  });
});
