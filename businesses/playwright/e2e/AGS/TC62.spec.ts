import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
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

test.describe("As a user, if I clear the required fields in the update business page, the save button should remain disabled", () => {
  // Skipped, assertion moved to TC61
  test.skip("Initiating test", async () => {
    await Login.login({ accountType: "ags", accountIndex: 2 });
    await agsBusinessGrid.init();
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    await agsBusinessDetails.clickEditBusinessInfoButton();
    await agsBusinessUpdatePage.getElement().locationDbaField().clear();
    await agsBusinessUpdatePage.getElement().stateTaxIdField().clear();
    await agsBusinessUpdatePage.getElement().locationAddress1Field().clear();
    await expect(agsBusinessUpdatePage.getElement().saveButton()).toBeDisabled();
  });
});