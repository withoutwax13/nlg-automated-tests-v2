import { test, expect } from '@playwright/test';
import viewMunicipalities from "../../helpers/view-municipalities";
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

test.describe("As a government user, I want to be able to export the list of Municipalities", () => {
  test("Initiating test", exportMunicipalities);
});

export default exportMunicipalities;
