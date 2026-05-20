import { test, expect } from "@playwright/test";
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";
import { logout } from "../../support/native-helpers";

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
  
  test("Initiating test", async ({ page }) => {
    const agsAddBusinessPage = new BusinessAdd(page, { userType: "ags" });
    const taxpayerAddBusinessPage = new BusinessAdd(page, { userType: "taxpayer" });
    // add business data
    await Login.login(page, { accountType: "ags", accountIndex: 7 });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickAddBusinessButton();
    await agsAddBusinessPage.fillFields(newBusinessData, page);
    await agsAddBusinessPage.clickSaveButton();
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);
    await logout(page);

    // add business data to the taxpayer account
    await Login.login(page, { accountType: "taxpayer", accountIndex: 1 });
    await taxpayerBusinessGrid.init(page);
    await taxpayerBusinessGrid.clickAddBusinessButton();
    await taxpayerAddBusinessPage.addBusinessOnAccount(newBusinessData.locationDba);
    await taxpayerBusinessGrid.init(page);
    await taxpayerBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);
  });
});