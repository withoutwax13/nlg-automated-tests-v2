import { test, expect } from "@playwright/test";
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";
import { logout } from "../../support/native-helpers";

const randomSeed = Math.floor(Math.random() * 100000);
const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const taxpayerBusinessGrid = new BusinessGrid({ userType: "taxpayer" });

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

// Skipped, assertions alrady covered in TC26
test.describe.skip("As a taxpayer user, I should be able to add a business.", () => {
  
  test("Initiating test", async ({ page }) => {
    const taxpayerAddBusinessPage = new BusinessAdd(page, { userType: "taxpayer" });
    const addBusinessPage = new BusinessAdd(page, { userType: "municipal" });
    await Login.login(page, {
      accountType: "municipal",
      accountIndex: 2,
    });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickAddBusinessButton();
    await addBusinessPage.fillFields(newBusinessData, page);
    await addBusinessPage.clickSaveButton();
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);
    await logout(page);
    
    await Login.login(page, { accountType: "taxpayer", accountIndex: 4 });
    await taxpayerBusinessGrid.init(page);
    await taxpayerBusinessGrid.clickAddBusinessButton();
    await taxpayerAddBusinessPage.addBusinessOnAccount(newBusinessData.locationDba);
    await taxpayerBusinessGrid.clickAddBusinessButton();
    await taxpayerBusinessGrid.init(page);
    await taxpayerBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);
  });
});