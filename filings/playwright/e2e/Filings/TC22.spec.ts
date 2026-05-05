import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import FilingGrid from "../../objects/FilingGrid";

const municipalFilingGrid = new FilingGrid({
  userType: "municipal",
});

test.describe("As a municipal user, I should be able to see filings in 6 month ago.", () => {
  test("Initiate test", async ({ page }) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });

    await login({ accountType: "municipal", accountIndex: 8 });
    await municipalFilingGrid.init();
    await municipalFilingGrid.setStartDate({
      month: `${sixMonthsAgo.getMonth() + 1}`,
      day: `${sixMonthsAgo.getDate()}`,
      year: `${sixMonthsAgo.getFullYear()}`,
    });
    await municipalFilingGrid.sortColumn(true, "Filing Date");
    const columnCellsData = await municipalFilingGrid.getColumnCellsData("Filing Date");
    for (const cellData of columnCellsData) {
      const filingDate = new Date(String(cellData));
      expect(filingDate.getTime()).toBeGreaterThanOrEqual(sixMonthsAgo.getTime());
      expect(filingDate.getTime()).toBeLessThanOrEqual(today.getTime());
    }
  });
});
