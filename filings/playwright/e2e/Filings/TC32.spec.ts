import { test, expect } from '@playwright/test';
import FilingGrid from "../../objects/FilingGrid";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

test.describe("As a AGS user, I should be able to see filings in 3 month ago.", () => {
  test("Initiate test", () => {

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });
    
    cy.login({ accountType: "ags", accountIndex: 9 });
    agsFilingGrid.init();
    agsFilingGrid.setStartDate({
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
    agsFilingGrid.sortColumn(true ,"Filing Date");
    agsFilingGrid.getColumnCellsData("Filing Date");
    cy.get("@columnCellsData").then((columnCellsData) => {
      Array.from(columnCellsData).forEach((cellData) => {
        const filingDate = new Date(String(cellData));
        expect(filingDate).to.be.gte(threeMonthsAgo);
        expect(filingDate).to.be.lte(today);
      });
    });
  });
});
