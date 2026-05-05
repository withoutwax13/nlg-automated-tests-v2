import { test, expect } from '@playwright/test';
import FormGrid from "../../../objects/FormGrid";

const municipalFormGrid = new FormGrid({ userType: "municipal" });

test.describe("As a municipal user, I should be able to export forms.", () => {
  test("Initiate test", () => {
    cy.login({ accountType: "municipal" });
    municipalFormGrid.init();
    municipalFormGrid.clickExportButton();
  });
});
