import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

test.describe("As a taxpayer, I should only have details and delete as options in my action button column", () => {
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "taxpayer", accountIndex: 7 });
    await taxpayerBusinessList.init();
    const actionButton = await taxpayerBusinessList.getElementOfColumn(
      "Actions",
      "DBA",
      "Arrakis Spice Company 13685"
    );
    await actionButton.click();
    await expect(taxpayerBusinessList.getElement().anyList().filter({ hasText: "View Details" }).first()).toBeVisible();
    await expect(taxpayerBusinessList.getElement().anyList().filter({ hasText: "Delete" }).first()).toBeVisible();
  });
});