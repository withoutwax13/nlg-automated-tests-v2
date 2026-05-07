import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import { AGS_COLUMNS as defaultColumns } from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const businessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "Arrakis",
});

test.describe("As a user, I should be able to hide/show columns", () => {
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "ags", accountIndex: 9 });
    for (const column of defaultColumns.slice(2, 4)) {
      await businessGrid.init();
      await businessGrid.clickCustomizeTableViewButton();
      const beforeHide = await businessGrid.verifyColumnVisibility(column);
      await businessGrid.hideColumn(column);
      await businessGrid.init();
      const afterHide = await businessGrid.verifyColumnVisibility(column);
      expect(beforeHide).not.toEqual(afterHide);

      await businessGrid.clickCustomizeTableViewButton();
      const beforeShow = await businessGrid.verifyColumnVisibility(column);
      await businessGrid.showColumn(column);
      await businessGrid.init();
      const afterShow = await businessGrid.verifyColumnVisibility(column);
      expect(beforeShow).not.toEqual(afterShow);
    }
  });
});