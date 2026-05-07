import { test, expect } from "@playwright/test";
import { deleteBusinessData, expectCurrentUrlToInclude, logout } from "../../support/native-helpers";
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

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

// Skipped, assertions alrady covered in TC11
test.describe.skip("As a taxpayer, when a business has been added by an AGS user, I should be able to add the business in my account", () => {
  test.beforeEach(async () => {
    await deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "taxpayer",
      notFirstLogin: false,
      accountIndex: 1,
    });

    await deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "ags",
      notFirstLogin: true,
      accountIndex: 7,
    });
  });
  test("Initiating test", async () => {
    // add business data
    await Login.login(page, { accountType: "ags", notFirstLogin: true, accountIndex: 7 });
    agsBusinessGrid.init();
    agsBusinessGrid.clickAddBusinessButton();
    agsAddBusinessPage.fillFields(newBusinessData);
    agsAddBusinessPage.clickSaveButton();
    agsBusinessGrid.init();
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");
    await logout();

    // add business data to the taxpayer account
    await Login.login(page, { accountType: "taxpayer", notFirstLogin: true, accountIndex: 1 });
    taxpayerBusinessGrid.init();
    taxpayerBusinessGrid.clickAddBusinessButton();
    taxpayerAddBusinessPage.addBusinessOnAccount(newBusinessData.locationDba);
    taxpayerBusinessGrid.init();
    taxpayerBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");
    await logout();
  });
});