import { test, expect } from "@playwright/test";
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

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
  test.beforeEach(async ({ page }) => {
  });
  test("Initiating test", async ({ page }) => {
    await Login.login(page, {
      accountType: "municipal",
      accountIndex: 1,
    });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickAddBusinessButton();
    await addBusinessPage.fillFields(newBusinessData);
    await addBusinessPage.clickSaveButton();
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expect(page).toHaveURL(new RegExp(String("/BusinessesApp/BusinessDetails/")));
    await Login.login(page, { accountType: "taxpayer", accountIndex: 3 });
    await taxpayerBusinessGrid.init(page);
    await taxpayerBusinessGrid.clickAddBusinessButton();
    await taxpayerAddBusinessPage.addBusinessOnAccount(newBusinessData.locationDba);
    await taxpayerBusinessGrid.clickAddBusinessButton();
    await taxpayerBusinessGrid.init(page);
    await taxpayerBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expect(page).toHaveURL(new RegExp(String("/BusinessesApp/BusinessDetails/")));
    await Login.login(page, {
      accountType: "municipal",
      accountIndex: 1,
    });
    // delete business data
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.deleteBusiness(newBusinessData.locationDba);
    await expect(municipalBusinessGrid.getElement().toastComponent()).toBeVisible();
    await Login.login(page, { accountType: "taxpayer", accountIndex: 3 });
    await taxpayerBusinessGrid.init(page);
    await taxpayerBusinessGrid.filterColumn("DBA", newBusinessData.locationDba);
    await expect(taxpayerBusinessGrid.getElement().noRecordFoundComponent()).toBeVisible();
  });
});