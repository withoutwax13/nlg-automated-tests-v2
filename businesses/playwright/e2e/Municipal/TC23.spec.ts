import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const addBusinessPage = new BusinessAdd({ userType: "municipal" });

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

test.describe("As a municipal user, I should be able to delete a business.", () => {
  test.beforeEach(async () => {
    await deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "municipal",
      notFirstLogin: false,
      accountIndex: 9,
    });
  });
  test("Initiating test", async () => {
    await Login.login({
      accountType: "municipal",
      notFirstLogin: true,
      accountIndex: 9,
    });
    await municipalBusinessGrid.init();
    await municipalBusinessGrid.clickAddBusinessButton();
    await addBusinessPage.fillFields(newBusinessData);
    await addBusinessPage.clickSaveButton();
    await municipalBusinessGrid.init(false, false);
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");

    // delete business data
    await municipalBusinessGrid.init(false, false);
    await municipalBusinessGrid.deleteBusiness(newBusinessData.locationDba);
    await expect(municipalBusinessGrid.getElement().toastComponent()).toBeVisible();
  });
});