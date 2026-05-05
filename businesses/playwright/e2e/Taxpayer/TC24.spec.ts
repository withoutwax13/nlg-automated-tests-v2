import { test, expect } from '../../support/pwtest';
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";

const randomSeed = Math.floor(Math.random() * 100000);
const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const taxpayerBusinessGrid = new BusinessGrid({ userType: "taxpayer" });
const addBusinessPage = new BusinessAdd({ userType: "municipal" });
const taxpayerAddBusinessPage = new BusinessAdd({ userType: "taxpayer" });

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

test.describe("As a taxpayer, when my business has been deleted by a municipal user, I should be able to verify that the business does not exist in my grid", () => {
  test.beforeEach(() => {
    cy.deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "taxpayer",
      notFirstLogin: false,
      accountIndex: 3,
    });

    cy.deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "municipal",
      notFirstLogin: true,
      accountIndex: 1,
    });
  });
  test("Initiating test", () => {
    cy.login({
      accountType: "municipal",
      notFirstLogin: true,
      accountIndex: 1,
    });
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickAddBusinessButton();
    addBusinessPage.fillFields(newBusinessData);
    addBusinessPage.clickSaveButton();
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickClearAllFiltersButton();
    municipalBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    cy.url().should("include", "/BusinessesApp/BusinessDetails/");

    cy.logout();
    cy.login({ accountType: "taxpayer", notFirstLogin: true, accountIndex: 3 });
    taxpayerBusinessGrid.init();
    taxpayerBusinessGrid.clickAddBusinessButton();
    taxpayerAddBusinessPage.addBusinessOnAccount(newBusinessData.locationDba);
    taxpayerBusinessGrid.clickAddBusinessButton();
    taxpayerBusinessGrid.init();
    taxpayerBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    cy.url().should("include", "/BusinessesApp/BusinessDetails/");

    cy.logout();
    cy.login({
      accountType: "municipal",
      notFirstLogin: true,
      accountIndex: 1,
    });
    // delete business data
    municipalBusinessGrid.init();
    municipalBusinessGrid.deleteBusiness(newBusinessData.locationDba);
    municipalBusinessGrid.getElement().toastComponent().should("exist");

    cy.logout();
    cy.login({ accountType: "taxpayer", notFirstLogin: true, accountIndex: 3 });
    taxpayerBusinessGrid.init();
    taxpayerBusinessGrid.filterColumn("DBA", newBusinessData.locationDba);
    taxpayerBusinessGrid.getElement().noRecordFoundComponent().should("exist");
  });
});
