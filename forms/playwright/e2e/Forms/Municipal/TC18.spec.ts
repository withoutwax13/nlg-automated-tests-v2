import { expect, test } from "@playwright/test";
import FormGrid, { MUNICIPAL_FORM_GRID_COLUMNS as defaultColumns } from "../../../objects/FormGrid";
import { getAlias, initTestRuntime, login } from "../../../support/runtime";
import Login from "../../../utils/Login";

test.describe("As a municipal user, I should be able to hide/show columns in the form list", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const municipalityFormGrid = new FormGrid({
      userType: "municipal",
    });

    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await Login.login(page, { accountType: "municipal", accountIndex: 3 });

    for (const column of defaultColumns.slice(1, 3)) {
      const aliasBase = column.replace(/\s+/g, "");

      await municipalityFormGrid.init();
      await municipalityFormGrid.clickCustomizeTableViewButton();
      await municipalityFormGrid.verifyColumnVisibility(
        column,
        `${aliasBase}VisibilityBeforeHide`
      );
      await municipalityFormGrid.hideColumn(column);
      await municipalityFormGrid.init();
      await municipalityFormGrid.verifyColumnVisibility(
        column,
        `${aliasBase}VisibilityAfterHide`
      );
      expect(getAlias<boolean>(`${aliasBase}VisibilityBeforeHide`)).not.toBe(
        getAlias<boolean>(`${aliasBase}VisibilityAfterHide`)
      );

      await municipalityFormGrid.clickCustomizeTableViewButton();
      await municipalityFormGrid.verifyColumnVisibility(
        column,
        `${aliasBase}VisibilityBeforeShow`
      );
      await municipalityFormGrid.showColumn(column);
      await municipalityFormGrid.init();
      await municipalityFormGrid.verifyColumnVisibility(
        column,
        `${aliasBase}VisibilityAfterShow`
      );
      expect(getAlias<boolean>(`${aliasBase}VisibilityBeforeShow`)).not.toBe(
        getAlias<boolean>(`${aliasBase}VisibilityAfterShow`)
      );
    }
  });
});