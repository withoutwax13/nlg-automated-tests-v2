import { expect, test } from "@playwright/test";
import FormGrid, { MUNICIPAL_FORM_GRID_COLUMNS as defaultColumns } from "../../../objects/FormGrid";
import { getAlias, initTestRuntime, login } from "../../../support/runtime";
import Login from "../../../utils/Login";

test.describe("As a municipal user, I should be able to reorganize the order of the columns", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const municipalFormGrid = new FormGrid({
      userType: "municipal",
    });

    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await Login.login({ accountType: "municipal", accountIndex: 4 });

    const columnPairs: Array<[string, string]> = [];
    const columnsToTest = defaultColumns.slice(1, 5);
    for (let i = 0; i < columnsToTest.length; i += 1) {
      for (let j = i + 1; j < columnsToTest.length; j += 1) {
        columnPairs.push([columnsToTest[i], columnsToTest[j]]);
      }
    }

    for (const [column, targetColumn] of columnPairs) {
      const columnAliasBase = column.replace(/\s+/g, "");
      const targetAliasBase = targetColumn.replace(/\s+/g, "");

      await municipalFormGrid.init();
      await municipalFormGrid.verifyColumnOrder(
        column,
        `${columnAliasBase}IndexBeforeMove`
      );
      await municipalFormGrid.verifyColumnOrder(
        targetColumn,
        `${targetAliasBase}IndexBeforeMove`
      );
      await municipalFormGrid.clickCustomizeTableViewButton();
      await municipalFormGrid.moveColumnToLocationOf(column, targetColumn);

      await municipalFormGrid.init(true);
      await municipalFormGrid.verifyColumnOrder(
        targetColumn,
        `${targetAliasBase}IndexAfterMove`
      );
      await municipalFormGrid.verifyColumnOrder(
        column,
        `${columnAliasBase}IndexAfterMove`
      );

      expect(getAlias<number>(`${columnAliasBase}IndexBeforeMove`)).not.toBe(
        getAlias<number>(`${columnAliasBase}IndexAfterMove`)
      );
      expect(getAlias<number>(`${targetAliasBase}IndexBeforeMove`)).not.toBe(
        getAlias<number>(`${targetAliasBase}IndexAfterMove`)
      );

      await municipalFormGrid.clickCustomizeTableViewButton();
      await municipalFormGrid.restoreDefaultGridSettings();
    }
  });
});