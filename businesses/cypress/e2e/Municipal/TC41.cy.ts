import BusinessGrid from "../../objects/BusinessGrid";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

describe("As a municipal user, the default filter for the business list should be the Operating Status", () => {
  it("Initiating test", () => {
    cy.login({ accountType: "municipal" });
    municipalBusinessGrid.init();
    municipalBusinessGrid.getElement().activeFilterChipsLabel().should("exist");
    municipalBusinessGrid
      .getElement()
      .activeFilterChip("Operating Status")
      .should("exist");
  });
});
