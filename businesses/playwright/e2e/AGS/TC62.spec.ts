import { test, expect } from "../../fixtures/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessUpdate from "../../objects/BusinessUpdate";
import Login from "../../utils/Login";

const agsBusinessUpdatePage = new BusinessUpdate({ userType: "ags" });

test.describe("As a user, if I clear the required fields in the update business page, the save button should remain disabled", () => {
  // Skipped, assertion moved to TC61
  test.skip("As a user, if I clear the required fields in the update business page, the save button should remain disabled", async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    const agsBusinessDetails = new BusinessDetails(page, { userType: "ags" });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.viewBusinessDetails(resourceSlot.businesses.active);
    await agsBusinessDetails.clickEditBusinessInfoButton();
    await agsBusinessUpdatePage.getElement().locationDbaField().clear();
    await agsBusinessUpdatePage.getElement().stateTaxIdField().clear();
    await agsBusinessUpdatePage.getElement().locationAddress1Field().clear();
    await expect(agsBusinessUpdatePage.getElement().saveButton()).toBeDisabled();
  });
});
