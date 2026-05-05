import BusinessGrid from "../../objects/BusinessGrid";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

// Skipped, assertions in TC38
describe.skip("As a taxpayer user, I should be able to view business details.", () => {
  it("Initiating test", () => {
    cy.login({ accountType: "taxpayer", accountIndex: 7 });
    taxpayerBusinessList.init();
    taxpayerBusinessList.viewBusinessDetails("Arrakis Spice Company 13685");
    cy.url().should("include", "/BusinessesApp/BusinessDetails/");
  });
});
