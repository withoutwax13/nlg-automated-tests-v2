import { expect, test } from "@playwright/test";
import SettlementGrid from "../../../objects/SettlementGrid";
import Login from "../../../utils/Login";

test.describe(
  "As a municipal user, I should be able to export a settlement report",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", async ({ page }) => {
      const settlementGrid = new SettlementGrid(page, {
        userType: "municipal",
      });

      await Login.login(page, { accountType: "municipal", accountIndex: 4 });
      await settlementGrid.init();
      await expect(settlementGrid.getElement().exportButton()).toBeVisible();
      await expect(settlementGrid.getElement().exportButton()).toBeEnabled();
      await settlementGrid.clickExportButton();
      await expect(settlementGrid.getElement().pageTitle()).toBeVisible();
    });
  }
);
