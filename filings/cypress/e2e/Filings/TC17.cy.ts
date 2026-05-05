import FilingGrid from "../../objects/FilingGrid";

const municipalFilingGrid = new FilingGrid({
  userType: "municipal",
});

describe("As a municipal user, I should be able to export specific view of a filing data.", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "municipal", accountIndex: 3 });
    municipalFilingGrid.init();
    municipalFilingGrid.clickExportButton(false);
  });
});
