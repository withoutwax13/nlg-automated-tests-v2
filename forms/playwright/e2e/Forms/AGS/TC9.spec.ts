import { test, expect } from '@playwright/test';
import FormGrid from "../../../objects/FormGrid";

const agsFormGrid = new FormGrid({ userType: "ags" });

test.describe("As an AGS user, I should be able to navigate to the form editor via create new form button", () => {
  test("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 3 });
    agsFormGrid.init();
    agsFormGrid.clickAddNeWFormButton();
    cy.url().should("include", "createNewForm");
  });
});
