import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({
  userType: "municipal"
});

test.describe("As a municipal user, I should be able to set close date from the grid", () => {
  test("Initiating test", { tag: ["@slot-00", "@municipal", "@business-inactive"] }, async ({ page, resourceSlot }) => {
    await Login.login(page, resourceSlot, { accountType: "municipal" });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const beforeCloseDate = await municipalBusinessGrid.getDataOfColumn(
      "Close Date",
      "DBA",
      resourceSlot.businesses.inactive
    );
    const targetYear = beforeCloseDate.includes("2029") ? 2030 : 2029;
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.setCloseDate(resourceSlot.businesses.inactive, {
      month: 1,
      date: 15,
      year: targetYear,
    });
    // await expect(municipalBusinessGrid.getElement().toastComponent()).toBeVisible();
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const afterCloseDate = await municipalBusinessGrid.getDataOfColumn(
      "Close Date",
      "DBA",
      resourceSlot.businesses.inactive
    );
    expect(beforeCloseDate).not.toEqual(afterCloseDate);
    expect(afterCloseDate).toContain(String(targetYear));
  });
});
