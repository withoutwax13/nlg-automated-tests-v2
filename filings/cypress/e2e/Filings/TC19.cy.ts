import FilingGrid from "../../objects/FilingGrid";

const municipalFilingGrid = new FilingGrid({
  userType: "municipal",
});

describe("As a municipal user, I should be able to see filings in 1 year ago.", () => {
  it("Initiate test", () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });

    cy.login({ accountType: "municipal", accountIndex: 5 });
    municipalFilingGrid.init();
    municipalFilingGrid.setStartDate({
      month: `${oneYearAgo.getMonth() + 1}`,
      day: `${oneYearAgo.getDate()}`,
      year: `${oneYearAgo.getFullYear()}`,
    });
    municipalFilingGrid.sortColumn(true, "Filing Date");
    municipalFilingGrid.getColumnCellsData("Filing Date");
    cy.get("@columnCellsData").then((columnCellsData) => {
      Array.from(columnCellsData).forEach((cellData) => {
        const filingDate = new Date(String(cellData));
        expect(filingDate).to.be.gte(oneYearAgo);
        expect(filingDate).to.be.lte(today);
      });
    });
  });
});
