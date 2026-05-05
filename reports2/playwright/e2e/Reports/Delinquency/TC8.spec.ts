import { expect, test } from "@playwright/test";
import DelinquencyGrid, {
  AGS_DELINQUENCY_GRID_COLUMNS as defaultColumns,
} from "../../../objects/DelinquencyGrid";
import Login from "../../../utils/Login";

test.describe.skip(
  "As a user, I should be able to hide/show columns on the delinquency list",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", async ({ page }) => {
      const delinquencyGrid = new DelinquencyGrid(page, {
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });

      await Login.login(page, { accountType: "ags", accountIndex: 9 });
      for (const column of defaultColumns.slice(1, 4)) {
        await delinquencyGrid.init();
        await delinquencyGrid.clickCustomizeTableViewButton();
        const beforeHide = await delinquencyGrid.verifyColumnVisibility(column);
        await delinquencyGrid.hideColumn(column);
        await delinquencyGrid.init();
        const afterHide = await delinquencyGrid.verifyColumnVisibility(column);
        expect(beforeHide).not.toBe(afterHide);

        await delinquencyGrid.clickCustomizeTableViewButton();
        const beforeShow = await delinquencyGrid.verifyColumnVisibility(column);
        await delinquencyGrid.showColumn(column);
        await delinquencyGrid.init();
        const afterShow = await delinquencyGrid.verifyColumnVisibility(column);
        expect(beforeShow).not.toBe(afterShow);
      }
    });
  }
);
