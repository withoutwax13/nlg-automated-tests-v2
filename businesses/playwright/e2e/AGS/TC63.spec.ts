import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import { AGS_COLUMNS as defaultColumns } from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe.skip("As a user, I should be able to hide/show columns", () => {
  test("Initiating test", async ({ page, resourceSlot }) => {
    const businessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    for (const column of defaultColumns.slice(2, 4)) {
      await businessGrid.init(page);
      await businessGrid.clickCustomizeTableViewButton();
      const beforeHide = await businessGrid.verifyColumnVisibility(column);
      await businessGrid.hideColumn(column);
      await businessGrid.init(page);
      const afterHide = await businessGrid.verifyColumnVisibility(column);
      expect(beforeHide).not.toEqual(afterHide);

      await businessGrid.clickCustomizeTableViewButton();
      const beforeShow = await businessGrid.verifyColumnVisibility(column);
      await businessGrid.showColumn(column);
      await businessGrid.init(page);
      const afterShow = await businessGrid.verifyColumnVisibility(column);
      expect(beforeShow).not.toEqual(afterShow);
    }
  });
});
