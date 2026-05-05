import { test, expect } from '@playwright/test';
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";

const addBusinessPage = new BusinessAdd({ userType: "municipal" });
const businessGrid = new BusinessGrid({ userType: "municipal" });
const randomSeed = Math.floor(Math.random() * 100000);

const newBusinessData = {
  legalBusinessName: `Arrakis Spice Company ${randomSeed}`,
  fein: "12-3456789",
  legalBusinessAddress1: "123 Desert Road",
  legalBusinessAddress2: "Suite 100",
  legalBusinessCity: "Dune",
  legalBusinessState: "Alaska",
  legalBusinessZipCode: "90210",
  locationDba: `Arrakis Spice Company ${randomSeed}`,
  stateTaxId: "ST-9876543",
  locationOpenDate: {
    month: "01",
    day: "15",
    year: "2023",
  },
  businessOwnerFullName: "Paul Atreides",
  businessOwnerEmailAddress: "paul@arrakis.com",
  businessOwnerPhoneNumber: "0000000000",
  businessOwnerSSN: "000000000",
  businessOwnerAddress1: "456 Sand Dune",
  businessOwnerAddress2: "Apt 202",
  businessOwnerCity: "Dune",
  businessOwnerState: "Alaska",
  businessOwnerZipCode: "90210",
};

test.describe("As a municipal user, I should be able to add a business.", () => {
  test("Initiating test", () => {
    cy.login({
      accountType: "municipal",
      accountIndex: 4,
    });
    businessGrid.init();
    businessGrid.clickAddBusinessButton();
    addBusinessPage.fillFields(newBusinessData);
    addBusinessPage.clickSaveButton();
    businessGrid.init();
    businessGrid.clickClearAllFiltersButton();
    businessGrid.viewBusinessDetails(newBusinessData.locationDba);
    cy.url().should("include", "/BusinessesApp/BusinessDetails/");
    cy.logout();
  });
});
