import { test, expect } from '../../support/pwtest';
import FilingGrid from "../../objects/FilingGrid";

const municipalFilingGrid = new FilingGrid({
  userType: "municipal",
});

test.describe("As a municipal user, I should be able to see filings in 3 month ago.", () => {
  test("Initiate test", () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });

    pw.login({ accountType: "municipal", accountIndex: 7 });
    municipalFilingGrid.init();
    municipalFilingGrid.setStartDate({
      month: `${threeMonthsAgo.getMonth() + 1}`,
      day: `${threeMonthsAgo.getDate()}`,
      year: `${threeMonthsAgo.getFullYear()}`,
    });
    municipalFilingGrid.sortColumn(true, "Filing Date");
    municipalFilingGrid.getColumnCellsData("Filing Date");
    pw.get("@columnCellsData").then((columnCellsData) => {
      Array.from(columnCellsData).forEach((cellData) => {
        const filingDate = new Date(String(cellData));
        expect(filingDate).to.be.gte(threeMonthsAgo);
        expect(filingDate).to.be.lte(today);
      });
    });
  });
});
