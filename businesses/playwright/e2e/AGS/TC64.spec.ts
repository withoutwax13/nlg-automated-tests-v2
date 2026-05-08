import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import { AGS_COLUMNS as defaultColumns } from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const businessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "Arrakis",
});

test.describe("As a user, I should be able to reorganize the order of the columns.", () => {
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "ags", accountIndex: 9 });
    const columnPairs: [string, string][] = [];
    const columnsToTest = defaultColumns.slice(2, 4); // Limiting to 2 columns to save resource usage
    for (let i = 0; i < columnsToTest.length; i++) {
      for (let j = i + 1; j < columnsToTest.length; j++) {
        columnPairs.push([columnsToTest[i], columnsToTest[j]]);
      }
    }

    for (const [column, targetColumn] of columnPairs) {
      await businessGrid.init(page);
      const beforeColumnMove = await businessGrid.verifyColumnOrder(column);
      const beforeTargetMove = await businessGrid.verifyColumnOrder(targetColumn);
      await businessGrid.clickCustomizeTableViewButton();
      await businessGrid.moveColumnToLocationOf(column, targetColumn);

      await businessGrid.init(page, true);
      const afterTargetMove = await businessGrid.verifyColumnOrder(targetColumn);
      const afterColumnMove = await businessGrid.verifyColumnOrder(column);
      expect(beforeColumnMove).not.toEqual(afterColumnMove);
      expect(beforeTargetMove).not.toEqual(afterTargetMove);
      await businessGrid.clickCustomizeTableViewButton();
      await businessGrid.restoreDefaultGridSettings();
    }
  });
});