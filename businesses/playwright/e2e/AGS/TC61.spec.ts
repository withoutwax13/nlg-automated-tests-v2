import { test, expect } from "@playwright/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessUpdate from "../../objects/BusinessUpdate";
import Login from "../../utils/Login";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });
const agsBusinessUpdatePage = new BusinessUpdate({ userType: "ags" });

test.describe("As a user, if there are no changes made in the update business page, the save button should not exist", () => {
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "ags", accountIndex: 1 });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13857");
    await agsBusinessDetails.clickEditBusinessInfoButton();
    await expect(agsBusinessUpdatePage.getElement().saveButton()).toHaveCount(0);
    await agsBusinessUpdatePage.getElement().locationDbaField().clear();
    await agsBusinessUpdatePage.getElement().stateTaxIdField().clear();
    await agsBusinessUpdatePage.getElement().locationAddress1Field().clear();
    await expect(agsBusinessUpdatePage.getElement().saveButton()).toBeDisabled();
  });
});