import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import FilingGrid from "../../objects/FilingGrid";
import Login from "../../utils/Login";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

test.describe("As a AGS user, I should be able to see filings in 1 year ago.", () => {
  test("Initiate test", async ({ page }) => {

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });
    
    await Login.login(page, { accountType: "ags", accountIndex: 7 });
    await agsFilingGrid.init();
    await agsFilingGrid.setStartDate({
      month:
        oneYearAgo.getMonth() + 1 < 10
          ? `0${oneYearAgo.getMonth() + 1}`
          : `${oneYearAgo.getMonth() + 1}`,
      day:
        oneYearAgo.getDate() < 10
          ? `0${oneYearAgo.getDate()}`
          : `${oneYearAgo.getDate()}`,
      year: `${oneYearAgo.getFullYear()}`,
    });
    await agsFilingGrid.sortColumn(true ,"Filing Date");
    const columnCellsData = await agsFilingGrid.getColumnCellsData("Filing Date");
    for (const cellData of columnCellsData) {
      const filingDate = new Date(String(cellData));
      expect(filingDate.getTime()).toBeGreaterThanOrEqual(oneYearAgo.getTime());
      expect(filingDate.getTime()).toBeLessThanOrEqual(today.getTime());
    }
  });
});