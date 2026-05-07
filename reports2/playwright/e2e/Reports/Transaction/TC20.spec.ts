import { expect, test } from "@playwright/test";
import TransactionGrid from "../../../objects/TransactionGrid";
import Login from "../../../utils/Login";

test.describe(
  "As an AGS, I should be able to export the transaction report of a government",
  () => {
    test("Initiating test", async ({ page }) => {
      const transactionGrid = new TransactionGrid(page, {
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });

      await Login.login(page, { accountType: "ags", accountIndex: 6 });
      await transactionGrid.init();
      await expect(transactionGrid.getElement().exportButton()).toBeVisible();
      await expect(transactionGrid.getElement().exportButton()).toBeEnabled();
      await transactionGrid.clickExportButton();
      await expect(transactionGrid.getElement().pageTitle()).toBeVisible();
    });
  }
);
