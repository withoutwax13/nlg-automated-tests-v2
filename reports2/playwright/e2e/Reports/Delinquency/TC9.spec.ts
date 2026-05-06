import { expect, test } from "@playwright/test";
import DelinquencyGrid, {
  AGS_DELINQUENCY_GRID_COLUMNS as defaultColumns,
} from "../../../objects/DelinquencyGrid";
import Login from "../../../utils/Login";

test.describe.skip(
  "As a user, I should be able to reorganize the order of columns on the delinquency list",
  { tag: ["sanity", "regression"] },
  () => {
    test("Initiating test", async ({ page }) => {
      const delinquencyGrid = new DelinquencyGrid(page, {
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
        await delinquencyGrid.init();
        const columnIndexBeforeMove = await delinquencyGrid.verifyColumnOrder(column);
        const targetColumnIndexBeforeMove = await delinquencyGrid.verifyColumnOrder(targetColumn);
        await delinquencyGrid.clickCustomizeTableViewButton();
        await delinquencyGrid.moveColumnToLocationOf(column, targetColumn);

        await delinquencyGrid.init();
        const targetColumnIndexAfterMove = await delinquencyGrid.verifyColumnOrder(targetColumn);
        const columnIndexAfterMove = await delinquencyGrid.verifyColumnOrder(column);
        expect(columnIndexBeforeMove).not.toBe(columnIndexAfterMove);
        expect(targetColumnIndexBeforeMove).not.toBe(targetColumnIndexAfterMove);

        await delinquencyGrid.clickCustomizeTableViewButton();
        await delinquencyGrid.restoreDefaultGridSettings();
      }
    });
  }
);
