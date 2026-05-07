import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import FilingGrid from "../../objects/FilingGrid";
import Login from "../../utils/Login";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

test.describe("As a AGS user, I should be able to see filings in 3 month ago.", () => {
  test("Initiate test", async ({ page }) => {

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });
    
    await Login.login(page, { accountType: "ags", accountIndex: 9 });
    await agsFilingGrid.init();
    await agsFilingGrid.setStartDate({
      month:
        threeMonthsAgo.getMonth() + 1 < 10
          ? `0${threeMonthsAgo.getMonth() + 1}`
          : `${threeMonthsAgo.getMonth() + 1}`,
      day:
        threeMonthsAgo.getDate() < 10
          ? `0${threeMonthsAgo.getDate()}`
          : `${threeMonthsAgo.getDate()}`,
      year: `${threeMonthsAgo.getFullYear()}`,
    });
    await agsFilingGrid.sortColumn(true ,"Filing Date");
    const columnCellsData = await agsFilingGrid.getColumnCellsData("Filing Date");
    for (const cellData of columnCellsData) {
      const filingDate = new Date(String(cellData));
      expect(filingDate.getTime()).toBeGreaterThanOrEqual(threeMonthsAgo.getTime());
      expect(filingDate.getTime()).toBeLessThanOrEqual(today.getTime());
    }
  });
});