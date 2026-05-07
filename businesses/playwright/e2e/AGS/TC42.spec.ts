import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const agsBusinessGrid = new BusinessGrid({ userType: "ags", municipalitySelection: "Arrakis" });

test.describe("As an AGS user, the default filter for the business list should be the Operating Status", () => {
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "ags" });
    await agsBusinessGrid.init();
    await expect(agsBusinessGrid.getElement().activeFilterChipsLabel()).toBeVisible();
    await expect(agsBusinessGrid.getElement().activeFilterChip("Operating Status")).toBeVisible();
  });
});