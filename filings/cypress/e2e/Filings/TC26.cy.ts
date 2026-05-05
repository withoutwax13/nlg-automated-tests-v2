import FilingGrid from "../../objects/FilingGrid";

const taxpayerFilingGrid = new FilingGrid({
  userType: "taxpayer",
});

describe("As a taxpayer, I should be able to export filings data.", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "taxpayer", accountIndex: 8 });
    taxpayerFilingGrid.init();
    taxpayerFilingGrid.clickExportButton();
  });
});
