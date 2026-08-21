import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As an AGS user, the default filter for the business list should be the Operating Status", () => {
  test("As an AGS user, the default filter for the business list should be the Operating Status", { tag: ["@slot-09", "@ags"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await expect(agsBusinessGrid.getElement().activeFilterChipsLabel()).toBeVisible();
    await expect(agsBusinessGrid.getElement().activeFilterChip("Operating Status")).toBeVisible();
  });
});
