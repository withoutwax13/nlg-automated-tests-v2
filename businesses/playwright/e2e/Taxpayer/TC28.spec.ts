import { test, expect } from "@playwright/test";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

// Skipped, assertions in TC38
test.describe.skip("As a taxpayer user, I should be able to view business details.", () => {
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "taxpayer", accountIndex: 7 });
    await taxpayerBusinessList.init(page);
    await taxpayerBusinessList.viewBusinessDetails("Arrakis Spice Company 13685");
    await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);
  });
});