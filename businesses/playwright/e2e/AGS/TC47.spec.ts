import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });
const randomMonth = Math.floor(Math.random() * 12) + 1;
const randomDate = Math.floor(Math.random() * 28) + 1;

test.describe("As a ags user, I should be able to update business close date date in the business details page", () => {
  test("Initiating test", async () => {
    await Login.login({ accountType: "ags", accountIndex: 2 });
    await agsBusinessGrid.init();
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13857");
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");
    await agsBusinessDetails.clickBusinessStatusTab();
    await agsBusinessDetails.setBusinessCloseDate({
      month: randomMonth,
      date: randomDate,
      year: 2029,
    }, false);
    await agsBusinessDetails.clickSaveButton();
    await expect(agsBusinessDetails.getElement().toastComponent()).toBeVisible();
  });
});