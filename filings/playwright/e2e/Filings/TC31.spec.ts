import { test, expect } from '../../support/pwtest';
import FilingGrid from "../../objects/FilingGrid";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

test.describe("As a AGS user, I should be able to see filings in 1 month ago.", () => {
  test("Initiate test", () => {

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });
    
    cy.login({ accountType: "ags", accountIndex: 8 });
    agsFilingGrid.init();
    agsFilingGrid.setStartDate({
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
    agsFilingGrid.sortColumn(true ,"Filing Date");
    agsFilingGrid.getColumnCellsData("Filing Date");
    cy.get("@columnCellsData").then((columnCellsData) => {
      Array.from(columnCellsData).forEach((cellData) => {
        const filingDate = new Date(String(cellData));
        expect(filingDate).to.be.gte(oneMonthAgo);
        expect(filingDate).to.be.lte(today);
      });
    });
  });
});
