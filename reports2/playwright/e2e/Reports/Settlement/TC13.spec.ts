import { expect, test } from "@playwright/test";
import SettlementGrid, {
  AGS_SETTLEMENT_GRID_COLUMNS as defaultColumns,
} from "../../../objects/SettlementGrid";
import Login from "../../../utils/Login";

test.describe(
  "As a user, I should be able to reorganize the order of columns on the settlement list",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", async ({ page }) => {
      const settlementGrid = new SettlementGrid(page, {
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
        await settlementGrid.init();
        const columnIndexBeforeMove = await settlementGrid.verifyColumnOrder(column);
        const targetColumnIndexBeforeMove = await settlementGrid.verifyColumnOrder(targetColumn);
        await settlementGrid.clickCustomizeTableViewButton();
        await settlementGrid.moveColumnToLocationOf(column, targetColumn);

        await settlementGrid.init();
        const targetColumnIndexAfterMove = await settlementGrid.verifyColumnOrder(targetColumn);
        const columnIndexAfterMove = await settlementGrid.verifyColumnOrder(column);
        expect(columnIndexBeforeMove).not.toBe(columnIndexAfterMove);
        expect(targetColumnIndexBeforeMove).not.toBe(targetColumnIndexAfterMove);

        await settlementGrid.clickCustomizeTableViewButton();
        await settlementGrid.restoreDefaultGridSettings();
      }
    });
  }
);
