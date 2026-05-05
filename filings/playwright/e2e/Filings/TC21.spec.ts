import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import FilingGrid from "../../objects/FilingGrid";

const municipalFilingGrid = new FilingGrid({
  userType: "municipal",
});

test.describe("As a municipal user, I should be able to see filings in 3 month ago.", () => {
  test("Initiate test", async ({ page }) => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });

    await login({ accountType: "municipal", accountIndex: 7 });
    await municipalFilingGrid.init();
    await municipalFilingGrid.setStartDate({
      month: `${threeMonthsAgo.getMonth() + 1}`,
      day: `${threeMonthsAgo.getDate()}`,
      year: `${threeMonthsAgo.getFullYear()}`,
    });
    await municipalFilingGrid.sortColumn(true, "Filing Date");
    const columnCellsData = await municipalFilingGrid.getColumnCellsData("Filing Date");
    for (const cellData of columnCellsData) {
      const filingDate = new Date(String(cellData));
      expect(filingDate.getTime()).toBeGreaterThanOrEqual(threeMonthsAgo.getTime());
      expect(filingDate.getTime()).toBeLessThanOrEqual(today.getTime());
    }
  });
});
