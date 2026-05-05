import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({ userType: "ags", municipalitySelection: "Arrakis" });

describe("As an AGS user, the default filter for the business list should be the Operating Status", () => {
  it("Initiating test", () => {
    cy.login({ accountType: "ags" });
    agsBusinessGrid.init();
    agsBusinessGrid.getElement().activeFilterChipsLabel().should("exist");
    agsBusinessGrid
      .getElement()
      .activeFilterChip("Operating Status")
      .should("exist");
  });
});
