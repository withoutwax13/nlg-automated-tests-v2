import { test, expect } from '../../support/pwtest';
import FilingGrid from "../../objects/FilingGrid";

const municipalFilingGrid = new FilingGrid({
  userType: "municipal",
});

test.describe("As a municipal user, I should be able to see filings in 1 month ago.", () => {
  test("Initiate test", () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });

    pw.login({ accountType: "municipal", accountIndex: 6 });
    municipalFilingGrid.init();
    municipalFilingGrid.setStartDate({
      month: `${oneMonthAgo.getMonth() + 1}`,
      day: `${oneMonthAgo.getDate()}`,
      year: `${oneMonthAgo.getFullYear()}`,
    });
    municipalFilingGrid.sortColumn(true, "Filing Date");
    municipalFilingGrid.getColumnCellsData("Filing Date");
    pw.get("@columnCellsData").then((columnCellsData) => {
      Array.from(columnCellsData).forEach((cellData) => {
        const filingDate = new Date(String(cellData));
        expect(filingDate).to.be.gte(oneMonthAgo);
        expect(filingDate).to.be.lte(today);
      });
    });
  });
});
