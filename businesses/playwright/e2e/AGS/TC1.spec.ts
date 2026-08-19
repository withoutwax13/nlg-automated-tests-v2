import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As an AGS user, I should be able to set delinquency start date from the grid", () => {
  test("Initiating test", { tag: ["@slot-00", "@ags", "@business-active"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickClearAllFiltersButton();
    const beforeDelinquencyStartDate = await agsBusinessGrid.getDataOfColumn(
      "Delinquency Start Date",
      "DBA",
      resourceSlot.businesses.active
    );
    const targetYear = beforeDelinquencyStartDate.includes("2023") ? 2024 : 2023;
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.setDelinquencyStartDate(resourceSlot.businesses.active, {
      month: 1,
      date: 15,
      year: targetYear,
    });
    // await expect(agsBusinessGrid.getElement().toastComponent()).toBeVisible();
    await agsBusinessGrid.clickClearAllFiltersButton();
    const afterDelinquencyStartDate = await agsBusinessGrid.getDataOfColumn(
      "Delinquency Start Date",
      "DBA",
      resourceSlot.businesses.active
    );
    expect(beforeDelinquencyStartDate).not.toEqual(afterDelinquencyStartDate);
    expect(afterDelinquencyStartDate).toContain(String(targetYear));
  });
});
