import { expect, test } from "@playwright/test";
import SettlementGrid, {
  AGS_SETTLEMENT_GRID_COLUMNS as defaultColumns,
} from "../../../objects/SettlementGrid";
import Login from "../../../utils/Login";

test.describe(
  "As a user, I should be able to hide/show columns on the settlement list",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", async ({ page }) => {
      const settlementGrid = new SettlementGrid(page, {
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });

      await Login.login(page, { accountType: "ags", accountIndex: 9 });
      for (const column of defaultColumns.slice(1, 4)) {
        await settlementGrid.init();
        await settlementGrid.clickCustomizeTableViewButton();
        const beforeHide = await settlementGrid.verifyColumnVisibility(column);
        await settlementGrid.hideColumn(column);
        await settlementGrid.init();
        const afterHide = await settlementGrid.verifyColumnVisibility(column);
        expect(beforeHide).not.toBe(afterHide);

        await settlementGrid.clickCustomizeTableViewButton();
        const beforeShow = await settlementGrid.verifyColumnVisibility(column);
        await settlementGrid.showColumn(column);
        await settlementGrid.init();
        const afterShow = await settlementGrid.verifyColumnVisibility(column);
        expect(beforeShow).not.toBe(afterShow);
      }
    });
  }
);
