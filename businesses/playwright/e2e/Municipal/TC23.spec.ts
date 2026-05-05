import { test, expect } from '@playwright/test';
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const addBusinessPage = new BusinessAdd({ userType: "municipal" });

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

test.describe("As a municipal user, I should be able to delete a business.", () => {
  test.beforeEach(() => {
    cy.deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "municipal",
      notFirstLogin: false,
      accountIndex: 9,
    });
  });
  test("Initiating test", () => {
    cy.login({
      accountType: "municipal",
      notFirstLogin: true,
      accountIndex: 9,
    });
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickAddBusinessButton();
    addBusinessPage.fillFields(newBusinessData);
    addBusinessPage.clickSaveButton();
    municipalBusinessGrid.init(false, false);
    municipalBusinessGrid.clickClearAllFiltersButton();
    municipalBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    cy.url().should("include", "/BusinessesApp/BusinessDetails/");

    // delete business data
    municipalBusinessGrid.init(false, false);
    municipalBusinessGrid.deleteBusiness(newBusinessData.locationDba);
    municipalBusinessGrid.getElement().toastComponent().should("exist");
  });
});
