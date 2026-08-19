import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As an AGS user, I should be able to set close date from the grid", () => {
  test("Initiating test", { tag: ["@slot-01", "@ags", "@business-inactive"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickClearAllFiltersButton();
    const beforeCloseDate = await agsBusinessGrid.getDataOfColumn(
      "Close Date",
      "DBA",
      resourceSlot.businesses.inactive
    );
    const targetYear = beforeCloseDate.includes("2029") ? 2030 : 2029;
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.setCloseDate(resourceSlot.businesses.inactive, {
      month: 1,
      date: 15,
      year: targetYear,
    });
    // await expect(agsBusinessGrid.getElement().toastComponent()).toBeVisible();
    await agsBusinessGrid.clickClearAllFiltersButton();
    const afterCloseDate = await agsBusinessGrid.getDataOfColumn(
      "Close Date",
      "DBA",
      resourceSlot.businesses.inactive
    );
    expect(beforeCloseDate).not.toEqual(afterCloseDate);
    expect(afterCloseDate).toContain(String(targetYear));
  });
});
