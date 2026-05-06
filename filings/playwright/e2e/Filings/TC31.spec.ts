import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import FilingGrid from "../../objects/FilingGrid";
import Login from "../../utils/Login";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

test.describe("As a AGS user, I should be able to see filings in 1 month ago.", () => {
  test("Initiate test", async ({ page }) => {

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });
    
    await Login.login({ accountType: "ags", accountIndex: 8 });
    await agsFilingGrid.init();
    await agsFilingGrid.setStartDate({
      month:
        oneMonthAgo.getMonth() + 1 < 10
          ? `0${oneMonthAgo.getMonth() + 1}`
          : `${oneMonthAgo.getMonth() + 1}`,
      day:
        oneMonthAgo.getDate() < 10
          ? `0${oneMonthAgo.getDate()}`
          : `${oneMonthAgo.getDate()}`,
      year: `${oneMonthAgo.getFullYear()}`,
    });
    await agsFilingGrid.sortColumn(true ,"Filing Date");
    const columnCellsData = await agsFilingGrid.getColumnCellsData("Filing Date");
    for (const cellData of columnCellsData) {
      const filingDate = new Date(String(cellData));
      expect(filingDate.getTime()).toBeGreaterThanOrEqual(oneMonthAgo.getTime());
      expect(filingDate.getTime()).toBeLessThanOrEqual(today.getTime());
    }
  });
});