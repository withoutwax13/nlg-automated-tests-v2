import { test, expect } from '@playwright/test';
import FilingGrid from "../../objects/FilingGrid";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

test.describe("As a AGS user, I should be able to see filings in 6 month ago.", () => {
  test("Initiate test", () => {

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });
    
    cy.login({ accountType: "ags" });
    agsFilingGrid.init();
    agsFilingGrid.setStartDate({
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
    agsFilingGrid.sortColumn(true ,"Filing Date");
    agsFilingGrid.getColumnCellsData("Filing Date");
    cy.get("@columnCellsData").then((columnCellsData) => {
      Array.from(columnCellsData).forEach((cellData) => {
        const filingDate = new Date(String(cellData));
        expect(filingDate).to.be.gte(sixMonthsAgo);
        expect(filingDate).to.be.lte(today);
      });
    });
  });
});
