import FilingGrid from "../../objects/FilingGrid";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

describe("As a AGS user, I should be able to see filings in 1 year ago.", () => {
  it("Initiate test", () => {

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const today = new Date();
    today.toLocaleString("en-US", { timeZone: "America/Chicago" });
    
    cy.login({ accountType: "ags", accountIndex: 7 });
    agsFilingGrid.init();
    agsFilingGrid.setStartDate({
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
    agsFilingGrid.sortColumn(true ,"Filing Date");
    agsFilingGrid.getColumnCellsData("Filing Date");
    cy.get("@columnCellsData").then((columnCellsData) => {
      Array.from(columnCellsData).forEach((cellData) => {
        const filingDate = new Date(String(cellData));
        expect(filingDate).to.be.gte(oneYearAgo);
        expect(filingDate).to.be.lte(today);
      });
    });
  });
});
