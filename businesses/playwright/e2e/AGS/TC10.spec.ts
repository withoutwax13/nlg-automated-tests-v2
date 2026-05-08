import { test, expect } from "@playwright/test";
import { deleteBusinessData, expectCurrentUrlToInclude } from "../../helpers/legacy-helpers";
import BusinessAdd from "../../objects/BusinessAdd";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const addBusinessPage = new BusinessAdd({ userType: "ags" });
const businessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "Arrakis",
});
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

test.describe("As an AGS user, I should be able to delete a business.", () => {
  test.beforeEach(async ({ page }) => {
    await deleteBusinessData({
      dba: newBusinessData.locationDba,
      userType: "ags",
      accountIndex: 5,
    });
  });
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "ags", accountIndex: 5 });
    await businessGrid.init();
    await businessGrid.clickAddBusinessButton();
    await addBusinessPage.fillFields(newBusinessData);
    await addBusinessPage.clickSaveButton();
    await businessGrid.init(false, false);
    await businessGrid.clickClearAllFiltersButton();
    await businessGrid.viewBusinessDetails(newBusinessData.locationDba);
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");

    await businessGrid.init();
    await businessGrid.clickClearAllFiltersButton();
    await businessGrid.deleteBusiness(newBusinessData.locationDba);
    await expect(businessGrid.getElement().toastComponent()).toBeVisible();
  });
});