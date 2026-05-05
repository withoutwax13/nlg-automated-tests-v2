import { test, expect } from '../../../support/pwtest';
import FormGrid from "../../../objects/FormGrid";

const agsFormGrid = new FormGrid({ userType: "ags" });

test.describe("As an AGS user, I should be able to export forms.", () => {
  test("Initiate test", () => {
    cy.login({ accountType: "ags" });
    agsFormGrid.init();
    agsFormGrid.clickExportButton();
  });
});
