import { test, expect } from "@playwright/test";
import { deleteBusinessData, expectCurrentUrlToInclude, logout } from "../../support/native-helpers";
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const municipalBusinessDetails = new BusinessDetails({ userType: "municipal" });
const randomMonth = Math.floor(Math.random() * 12) + 1;
const randomDate = Math.floor(Math.random() * 28) + 1;

test.describe("As a municipal user, I should be able to update business close date date in the business details page", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "municipal", accountIndex: 2 });
    await municipalBusinessGrid.init();
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13857");
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");
    await municipalBusinessDetails.clickBusinessStatusTab();
    await municipalBusinessDetails.setBusinessCloseDate({
      month: randomMonth,
      date: randomDate,
      year: 2029,
    }, false);
    await municipalBusinessDetails.clickSaveButton();
    await expect(municipalBusinessDetails.getElement().toastComponent()).toBeVisible();
  });
});