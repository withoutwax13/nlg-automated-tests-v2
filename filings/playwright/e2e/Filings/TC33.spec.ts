import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import FilingGrid from "../../objects/FilingGrid";
import Login from "../../utils/Login";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

test.describe("As a AGS user, I should be able to see filings in 6 month ago.", () => {
  test("Initiate test", async ({ page }) => {

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });
    
    await Login.login(page, { accountType: "ags" });
    await agsFilingGrid.init();
    await agsFilingGrid.setStartDate({
      month:
        sixMonthsAgo.getMonth() + 1 < 10
          ? `0${sixMonthsAgo.getMonth() + 1}`
          : `${sixMonthsAgo.getMonth() + 1}`,
      day:
        sixMonthsAgo.getDate() < 10
          ? `0${sixMonthsAgo.getDate()}`
          : `${sixMonthsAgo.getDate()}`,
      year: `${sixMonthsAgo.getFullYear()}`,
    });
    await agsFilingGrid.sortColumn(true ,"Filing Date");
    const columnCellsData = await agsFilingGrid.getColumnCellsData("Filing Date");
    for (const cellData of columnCellsData) {
      const filingDate = new Date(String(cellData));
      expect(filingDate.getTime()).toBeGreaterThanOrEqual(sixMonthsAgo.getTime());
      expect(filingDate.getTime()).toBeLessThanOrEqual(today.getTime());
    }
  });
});