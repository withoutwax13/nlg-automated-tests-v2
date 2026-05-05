import { expect, test } from "@playwright/test";
import TransactionGrid, {
  AGS_TRANSACTION_GRID_COLUMNS as defaultColumns,
} from "../../../objects/TransactionGrid";
import Login from "../../../utils/Login";

test.describe(
  "As a user, I should be able to reorganize the order of columns on the transaction list",
  { tags: ["sanity", "regression"] },
  () => {
    test.skip("Initiating test", async ({ page }) => {
      const transactionGrid = new TransactionGrid(page, {
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });

      await Login.login(page, { accountType: "ags", accountIndex: 9 });

      const columnPairs: Array<[string, string]> = [];
      const columnsToTest = defaultColumns.slice(1, 4);
      for (let i = 0; i < columnsToTest.length; i += 1) {
        for (let j = i + 1; j < columnsToTest.length; j += 1) {
          columnPairs.push([columnsToTest[i], columnsToTest[j]]);
        }
      }

      for (const [column, targetColumn] of columnPairs) {
        await transactionGrid.init();
        const columnIndexBeforeMove = await transactionGrid.verifyColumnOrder(column);
        const targetColumnIndexBeforeMove = await transactionGrid.verifyColumnOrder(targetColumn);
        await transactionGrid.clickCustomizeTableViewButton();
        await transactionGrid.moveColumnToLocationOf(column, targetColumn);

        await transactionGrid.init();
        const targetColumnIndexAfterMove = await transactionGrid.verifyColumnOrder(targetColumn);
        const columnIndexAfterMove = await transactionGrid.verifyColumnOrder(column);
        expect(columnIndexBeforeMove).not.toBe(columnIndexAfterMove);
        expect(targetColumnIndexBeforeMove).not.toBe(targetColumnIndexAfterMove);

        await transactionGrid.clickCustomizeTableViewButton();
        await transactionGrid.restoreDefaultGridSettings();
      }
    });
  }
);
