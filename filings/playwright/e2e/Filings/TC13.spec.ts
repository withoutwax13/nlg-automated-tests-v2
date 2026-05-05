import { test, expect } from '@playwright/test';
import FilingGrid from "../../objects/FilingGrid";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

test.describe("As an AGS user, I should be able to view requested extract.", () => {
  test("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 8 });
    agsFilingGrid.init();
    agsFilingGrid.clickViewRequestedExtractButton();
    cy.url().should("include", "/filingsExtractRequests?");
  });
});
