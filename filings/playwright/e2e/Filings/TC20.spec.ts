import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import FilingGrid from "../../objects/FilingGrid";

const municipalFilingGrid = new FilingGrid({
  userType: "municipal",
});

test.describe("As a municipal user, I should be able to see filings in 1 month ago.", () => {
  test("Initiate test", async ({ page }) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });

    await login({ accountType: "municipal", accountIndex: 6 });
    await municipalFilingGrid.init();
    await municipalFilingGrid.setStartDate({
      month: `${oneMonthAgo.getMonth() + 1}`,
      day: `${oneMonthAgo.getDate()}`,
      year: `${oneMonthAgo.getFullYear()}`,
    });
    await municipalFilingGrid.sortColumn(true, "Filing Date");
    const columnCellsData = await municipalFilingGrid.getColumnCellsData("Filing Date");
    for (const cellData of columnCellsData) {
      const filingDate = new Date(String(cellData));
      expect(filingDate.getTime()).toBeGreaterThanOrEqual(oneMonthAgo.getTime());
      expect(filingDate.getTime()).toBeLessThanOrEqual(today.getTime());
    }
  });
});
