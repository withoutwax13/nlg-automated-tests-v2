import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, I should be able to expand the business list", () => {
  test("As a user, I should be able to expand the business list", { tag: ["@slot-08", "@ags"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickMapViewRadio();
    await agsBusinessGrid.waitForBusinessCardListToLoad();
    await agsBusinessGrid.clickCollapseBusinessListButton();
    await expect(agsBusinessGrid.getElement().businessCardList().first()).not.toBeVisible();
    await agsBusinessGrid.clickExpandBusinessListButton();
    await expect(agsBusinessGrid.getElement().businessCardList().first()).toBeVisible();
  });
});
