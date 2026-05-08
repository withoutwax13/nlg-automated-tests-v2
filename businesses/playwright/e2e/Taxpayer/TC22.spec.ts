import { test, expect } from "@playwright/test";
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
  });
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "municipal" });
    municipalBusinessGrid.init(page);
    municipalBusinessGrid.clickAddBusinessButton();
    addBusinessPage.fillFields(newBusinessData);
    addBusinessPage.clickSaveButton();
    municipalBusinessGrid.init(page);
    municipalBusinessGrid.clickClearAllFiltersButton();
    municipalBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expect(page).toHaveURL(new RegExp(String("/BusinessesApp/BusinessDetails/")));
    await Login.login(page, { accountType: "taxpayer", accountIndex: 2 });
    taxpayerBusinessGrid.init(page);
    taxpayerBusinessGrid.clickAddBusinessButton();
    taxpayerAddBusinessPage.addBusinessOnAccount(newBusinessData.locationDba);
    taxpayerBusinessGrid.clickAddBusinessButton();
    taxpayerBusinessGrid.init(page);
    taxpayerBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expect(page).toHaveURL(new RegExp(String("/BusinessesApp/BusinessDetails/")));
  });
});