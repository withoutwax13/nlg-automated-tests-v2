import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });

describe("As a user, when the business is active, I should be able to update form submission requirements in the business details page", () => {
  it("Initiating test", () => {
    cy.login({ accountType: "ags" });
    agsBusinessGrid.init();
    agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    agsBusinessDetails
      .getElement()
      .formsSectionFormList()
      .each(($form) => {
        cy.wrap($form).find("input").should("be.enabled");
      });
  });
});
