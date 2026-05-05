import { test, expect } from '../../../support/pwtest';
import FormGrid from "../../../objects/FormGrid";

const agsFormGrid = new FormGrid({ userType: "ags" });

test.describe("As an AGS user, I should be able to export a specific form.", () => {
  test("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 1 });
    agsFormGrid.init();
    agsFormGrid.toggleActionButton(
      "filter",
      "Export",
      "Form Title",
      "Business License (Annual) - E2E #1"
    );
  });
});
