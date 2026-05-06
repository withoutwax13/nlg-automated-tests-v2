import { expect, test } from "@playwright/test";
import TransactionGrid from "../../../objects/TransactionGrid";
import Login from "../../../utils/Login";

test.describe(
  "As a municipal user, I should be able to export the transaction report",
  { tag: ["sanity", "regression"] },
  () => {
    test("Initiating test", async ({ page }) => {
      const transactionGrid = new TransactionGrid(page, {
        userType: "municipal",
      });

      await Login.login(page, { accountType: "municipal", accountIndex: 6 });
      await transactionGrid.init();
      await expect(transactionGrid.getElement().exportButton()).toBeVisible();
      await expect(transactionGrid.getElement().exportButton()).toBeEnabled();
      await transactionGrid.clickExportButton();
      await expect(transactionGrid.getElement().pageTitle()).toBeVisible();
    });
  }
);
