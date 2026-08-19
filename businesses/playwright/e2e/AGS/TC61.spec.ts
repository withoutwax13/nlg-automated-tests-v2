import { test, expect } from "../../fixtures/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessUpdate from "../../objects/BusinessUpdate";
import Login from "../../utils/Login";

test.describe("As a user, if there are no changes made in the update business page, the save button should not exist", () => {
  test("Initiating test", { tag: ["@slot-09", "@ags", "@business-inactive"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    const agsBusinessUpdatePage = new BusinessUpdate(page, { userType: "ags" });
    const agsBusinessDetails = new BusinessDetails(page, { userType: "ags" });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.viewBusinessDetails(resourceSlot.businesses.inactive);
    await agsBusinessDetails.clickEditBusinessInfoButton();
    await expect(agsBusinessUpdatePage.getElement().saveButton()).toHaveCount(0);
    await agsBusinessUpdatePage.getElement().locationDbaField().clear();
    await agsBusinessUpdatePage.getElement().stateTaxIdField().clear();
    await agsBusinessUpdatePage.getElement().locationAddress1Field().clear();
    await expect(agsBusinessUpdatePage.getElement().saveButton()).toBeDisabled();
  });
});
