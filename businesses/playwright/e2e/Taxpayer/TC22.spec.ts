import { test, expect } from "@playwright/test";
import { deleteBusinessData, expectCurrentUrlToInclude, logout } from "../../helpers/legacy-helpers";
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const taxpayerBusinessGrid = new BusinessGrid({ userType: "taxpayer" });
const addBusinessPage = new BusinessAdd({ userType: "municipal" });
const taxpayerAddBusinessPage = new BusinessAdd({ userType: "taxpayer" });
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

// Skipped, assertions alrady covered in TC24
test.describe.skip("As a taxpayer, when a business has been added by a municipal user, I should be able to add the business in my account", () => {
  test.beforeEach(async ({ page }) => {
    await deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "taxpayer",
      accountIndex: 2,
    });

    await deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "ags",
      accountIndex: 8,
    });
  });
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "municipal" });
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickAddBusinessButton();
    addBusinessPage.fillFields(newBusinessData);
    addBusinessPage.clickSaveButton();
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickClearAllFiltersButton();
    municipalBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");

    await logout();
    await Login.login(page, { accountType: "taxpayer", accountIndex: 2 });
    taxpayerBusinessGrid.init();
    taxpayerBusinessGrid.clickAddBusinessButton();
    taxpayerAddBusinessPage.addBusinessOnAccount(newBusinessData.locationDba);
    taxpayerBusinessGrid.clickAddBusinessButton();
    taxpayerBusinessGrid.init();
    taxpayerBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");
  });
});