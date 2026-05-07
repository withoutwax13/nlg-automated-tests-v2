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

test.describe("As a taxpayer, when my business has been deleted by an AGS user, I should be able to verify that the business does not exist in my grid.", () => {
  test.beforeEach(async () => {
    await deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "taxpayer",
      notFirstLogin: false,
    });

    await deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "ags",
      notFirstLogin: true,
      accountIndex: 6,
    });
  });
  test("Initiating test", async () => {
    // add business data
    await Login.login(page, { accountType: "ags", notFirstLogin: true, accountIndex: 6 });
    await agsBusinessGrid.init();
    await agsBusinessGrid.clickAddBusinessButton();
    await agsAddBusinessPage.fillFields(newBusinessData);
    await agsAddBusinessPage.clickSaveButton();
    await agsBusinessGrid.init();
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");
    await logout();

    // add business data to the taxpayer account
    await Login.login(page, { accountType: "taxpayer", notFirstLogin: true });
    await taxpayerBusinessGrid.init();
    await taxpayerBusinessGrid.clickAddBusinessButton();
    await taxpayerAddBusinessPage.addBusinessOnAccount(newBusinessData.locationDba);
    await taxpayerBusinessGrid.init();
    await taxpayerBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await logout();

    // delete business data
    await Login.login(page, { accountType: "ags", notFirstLogin: true, accountIndex: 6 });
    await agsBusinessGrid.init();
    await agsBusinessGrid.deleteBusiness(newBusinessData.locationDba);
    await expect(agsBusinessGrid.getElement().toastComponent()).toBeVisible();
    await logout();

    // verify that the business does not exist in the taxpayer grid
    await Login.login(page, { accountType: "taxpayer", notFirstLogin: true });
    await taxpayerBusinessGrid.init();
    await taxpayerBusinessGrid.filterColumn("DBA", newBusinessData.locationDba);
    await expect(taxpayerBusinessGrid.getElement().noRecordFoundComponent()).toBeVisible();
  });
});