import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({
  userType: "municipal"
});

test.describe("As a municipal user, I should be able to set delinquency start date from the grid", () => {
  test("Initiating test", { tag: ["@slot-09", "@municipal", "@business-active"] }, async ({ page, resourceSlot }) => {
    await Login.login(page, resourceSlot, { accountType: "municipal" });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const beforeDelinquencyStartDate = await municipalBusinessGrid.getDataOfColumn(
      "Delinquency Start Date",
      "DBA",
      resourceSlot.businesses.active
    );
    const targetYear = beforeDelinquencyStartDate.includes("2023") ? 2024 : 2023;
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.setDelinquencyStartDate(resourceSlot.businesses.active, {
      month: 1,
      date: 15,
      year: targetYear,
    });
    // await expect(municipalBusinessGrid.getElement().toastComponent()).toBeVisible();
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const afterDelinquencyStartDate = await municipalBusinessGrid.getDataOfColumn(
      "Delinquency Start Date",
      "DBA",
      resourceSlot.businesses.active
    );
    expect(beforeDelinquencyStartDate).not.toEqual(afterDelinquencyStartDate);
    expect(afterDelinquencyStartDate).toContain(String(targetYear));
  });
});
