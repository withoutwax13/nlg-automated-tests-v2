import FilingGrid from "../../objects/FilingGrid";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

describe("As an AGS user, I should be able to view requested extract.", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 8 });
    agsFilingGrid.init();
    agsFilingGrid.clickViewRequestedExtractButton();
    cy.url().should("include", "/filingsExtractRequests?");
  });
});
