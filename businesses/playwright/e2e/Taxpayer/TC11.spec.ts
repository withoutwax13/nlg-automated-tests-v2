import { test, expect } from '@playwright/test';
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";

const agsAddBusinessPage = new BusinessAdd({ userType: "ags" });
const taxpayerAddBusinessPage = new BusinessAdd({ userType: "taxpayer" });
const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "Arrakis",
});
const taxpayerBusinessGrid = new BusinessGrid({ userType: "taxpayer" });
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

test.describe("As a taxpayer, when my business has been deleted by an AGS user, I should be able to verify that the business does not exist in my grid.", () => {
  test.beforeEach(() => {
    cy.deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "taxpayer",
      notFirstLogin: false,
    });

    cy.deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "ags",
      notFirstLogin: true,
      accountIndex: 6,
    });
  });
  test("Initiating test", () => {
    // add business data
    cy.login({ accountType: "ags", notFirstLogin: true, accountIndex: 6 });
    agsBusinessGrid.init();
    agsBusinessGrid.clickAddBusinessButton();
    agsAddBusinessPage.fillFields(newBusinessData);
    agsAddBusinessPage.clickSaveButton();
    agsBusinessGrid.init();
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    cy.url().should("include", "/BusinessesApp/BusinessDetails/");
    cy.logout();

    // add business data to the taxpayer account
    cy.login({ accountType: "taxpayer", notFirstLogin: true });
    taxpayerBusinessGrid.init();
    taxpayerBusinessGrid.clickAddBusinessButton();
    taxpayerAddBusinessPage.addBusinessOnAccount(newBusinessData.locationDba);
    taxpayerBusinessGrid.init();
    taxpayerBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    cy.logout();

    // delete business data
    cy.login({ accountType: "ags", notFirstLogin: true, accountIndex: 6 });
    agsBusinessGrid.init();
    agsBusinessGrid.deleteBusiness(newBusinessData.locationDba);
    agsBusinessGrid.getElement().toastComponent().should("exist");
    cy.logout();

    // verify that the business does not exist in the taxpayer grid
    cy.login({ accountType: "taxpayer", notFirstLogin: true });
    taxpayerBusinessGrid.init();
    taxpayerBusinessGrid.filterColumn("DBA", newBusinessData.locationDba);
    taxpayerBusinessGrid.getElement().noRecordFoundComponent().should("exist");
  });
});
