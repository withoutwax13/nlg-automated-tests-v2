import { test, expect } from '../../support/pwtest';
import FilingGrid from "../../objects/FilingGrid";

const municipalFilingGrid = new FilingGrid({
  userType: "municipal",
});

test.describe("As a municipal user, I should be able to see filings in 6 month ago.", () => {
  test("Initiate test", () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });

    pw.login({ accountType: "municipal", accountIndex: 8 });
    municipalFilingGrid.init();
    municipalFilingGrid.setStartDate({
      month: `${sixMonthsAgo.getMonth() + 1}`,
      day: `${sixMonthsAgo.getDate()}`,
      year: `${sixMonthsAgo.getFullYear()}`,
    });
    municipalFilingGrid.sortColumn(true, "Filing Date");
    municipalFilingGrid.getColumnCellsData("Filing Date");
    pw.get("@columnCellsData").then((columnCellsData) => {
      Array.from(columnCellsData).forEach((cellData) => {
        const filingDate = new Date(String(cellData));
        expect(filingDate).to.be.gte(sixMonthsAgo);
        expect(filingDate).to.be.lte(today);
      });
    });
  });
});
