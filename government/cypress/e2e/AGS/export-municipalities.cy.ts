import viewMunicipalities from "./view-municipalities.cy";
import selector from "../../fixtures/selector.json";

const exportMunicipalities = () => {
  viewMunicipalities();

  // Find and click the "Export" button
  cy.get(selector.button)
    .contains("Export")
    .should("exist")
    .and("be.enabled")
    .click();
  
};

describe("As a government user, I want to be able to export the list of Municipalities", () => {
  it("Initiating test", exportMunicipalities);
});

export default exportMunicipalities;
