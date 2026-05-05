import { expect, test } from "@playwright/test";
import TransactionGrid, {
  AGS_TRANSACTION_GRID_COLUMNS as defaultColumns,
} from "../../../objects/TransactionGrid";
import Login from "../../../utils/Login";

test.describe(
  "As a user, I should be able to hide/show columns on the transaction list",
  { tags: ["sanity", "regression"] },
  () => {
    test.skip("Initiating test", async ({ page }) => {
      const transactionGrid = new TransactionGrid(page, {
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });

      await Login.login(page, { accountType: "ags", accountIndex: 9 });
      for (const column of defaultColumns.slice(1, 4)) {
        await transactionGrid.init();
        await transactionGrid.clickCustomizeTableViewButton();
        const beforeHide = await transactionGrid.verifyColumnVisibility(column);
        await transactionGrid.hideColumn(column);
        await transactionGrid.init();
        const afterHide = await transactionGrid.verifyColumnVisibility(column);
        expect(beforeHide).not.toBe(afterHide);

        await transactionGrid.clickCustomizeTableViewButton();
        const beforeShow = await transactionGrid.verifyColumnVisibility(column);
        await transactionGrid.showColumn(column);
        await transactionGrid.init();
        const afterShow = await transactionGrid.verifyColumnVisibility(column);
        expect(beforeShow).not.toBe(afterShow);
      }
    });
  }
);
