import { test, expect } from '../../support/pwtest';
import FilingGrid from "../../objects/FilingGrid";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

test.describe("As an AGS user, I should be able to view filings data of a specific government.", () => {
  test("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 8 });
    agsFilingGrid.init();
    agsFilingGrid.getElement().rows().its("length").should("be.gt", 0);
  });
});
