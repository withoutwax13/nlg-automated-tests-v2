import { test, expect } from "@playwright/test";
import { deleteBusinessData, expectCurrentUrlToInclude, logout } from "../../support/native-helpers";
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
  test.beforeEach(async () => {
    await deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "taxpayer",
      notFirstLogin: false,
      accountIndex: 3,
    });

    await deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "municipal",
      notFirstLogin: true,
      accountIndex: 1,
    });
  });
  test("Initiating test", async () => {
    await Login.login(page, {
      accountType: "municipal",
      notFirstLogin: true,
      accountIndex: 1,
    });
    await municipalBusinessGrid.init();
    await municipalBusinessGrid.clickAddBusinessButton();
    await addBusinessPage.fillFields(newBusinessData);
    await addBusinessPage.clickSaveButton();
    await municipalBusinessGrid.init();
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");

    await logout();
    await Login.login(page, { accountType: "taxpayer", notFirstLogin: true, accountIndex: 3 });
    await taxpayerBusinessGrid.init();
    await taxpayerBusinessGrid.clickAddBusinessButton();
    await taxpayerAddBusinessPage.addBusinessOnAccount(newBusinessData.locationDba);
    await taxpayerBusinessGrid.clickAddBusinessButton();
    await taxpayerBusinessGrid.init();
    await taxpayerBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");

    await logout();
    await Login.login(page, {
      accountType: "municipal",
      notFirstLogin: true,
      accountIndex: 1,
    });
    // delete business data
    await municipalBusinessGrid.init();
    await municipalBusinessGrid.deleteBusiness(newBusinessData.locationDba);
    await expect(municipalBusinessGrid.getElement().toastComponent()).toBeVisible();

    await logout();
    await Login.login(page, { accountType: "taxpayer", notFirstLogin: true, accountIndex: 3 });
    await taxpayerBusinessGrid.init();
    await taxpayerBusinessGrid.filterColumn("DBA", newBusinessData.locationDba);
    await expect(taxpayerBusinessGrid.getElement().noRecordFoundComponent()).toBeVisible();
  });
});