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

test.describe("As a taxpayer user, I should be able to delete a business.", () => {
  test.beforeEach(() => {
    pw.deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "taxpayer",
      notFirstLogin: false,
      accountIndex: 5,
    });
    pw.deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "municipal",
      notFirstLogin: true,
      accountIndex: 3,
    });
  });
  test("Initiating test", () => {
    pw.login({
      accountType: "municipal",
      notFirstLogin: true,
      accountIndex: 3,
    });
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickAddBusinessButton();
    addBusinessPage.fillFields(newBusinessData);
    addBusinessPage.clickSaveButton();
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickClearAllFiltersButton();
    municipalBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    pw.url().should("include", "/BusinessesApp/BusinessDetails/");

    pw.logout();
    pw.login({ accountType: "taxpayer", notFirstLogin: true, accountIndex: 5 });
    taxpayerBusinessGrid.init();
    taxpayerBusinessGrid.clickAddBusinessButton();
    taxpayerAddBusinessPage.addBusinessOnAccount(newBusinessData.locationDba);
    taxpayerBusinessGrid.clickAddBusinessButton();
    taxpayerBusinessGrid.init();
    taxpayerBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    pw.url().should("include", "/BusinessesApp/BusinessDetails/");

    taxpayerBusinessGrid.init();
    taxpayerBusinessGrid.deleteBusiness(newBusinessData.locationDba);
    taxpayerBusinessGrid.getElement().toastComponent().should("exist");
    pw.logout();
  });
  test.afterEach(() => {
    // delete business data
    pw.deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "municipal",
      notFirstLogin: true,
      accountIndex: 3,
    });
  });
});
