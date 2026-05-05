import { test, expect } from '../../support/pwtest';
import FilingGrid from "../../objects/FilingGrid";

const municipalFilingGrid = new FilingGrid({
  userType: "municipal",
});

test.describe("As a municipal user, I should be able to export specific view of a filing data.", () => {
  test("Initiate test", () => {
    cy.login({ accountType: "municipal", accountIndex: 3 });
    municipalFilingGrid.init();
    municipalFilingGrid.clickExportButton(false);
  });
});
