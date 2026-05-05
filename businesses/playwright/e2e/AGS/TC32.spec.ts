import { test, expect } from '../../support/pwtest';
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessResetModal from "../../objects/BusinessResetModal";
import BusinessAdd from "../../objects/BusinessAdd";

const addBusinessPage = new BusinessAdd({ userType: "ags" });
const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Pili",
});
const businessResetModal = new BusinessResetModal();

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

const addBusiness = () => {
  agsBusinessGrid.init(false, false);
  agsBusinessGrid.clickAddBusinessButton();
  addBusinessPage.fillFields(newBusinessData);
  addBusinessPage.clickSaveButton();
};

test.describe("I should be able to reset all data of a specific municipality", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "ags" });
    addBusiness();
    agsBusinessGrid.init();
    agsBusinessGrid.clickResetDataButton();
    businessResetModal.clickSureWantToDeleteDataCheckbox();
    businessResetModal.clickDeleteDataButton();
    agsBusinessGrid.getElement().noRecordFoundComponent().should("exist");

    // TODO: Assert that all other data in the municipality has been deleted as well (e.g. registration, filings, etc.)
  });
});
