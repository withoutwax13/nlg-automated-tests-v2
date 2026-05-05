import { test, expect } from '../../support/pwtest';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });

test.describe("As a user, I should not be able to add blank notes in the business details page", () => {
  // Skipped, assertion moved to TC55
  test.skip("Initiating test", () => {
    cy.login({ accountType: "ags", accountIndex: 6 });
    agsBusinessGrid.init();
    agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    agsBusinessDetails.clickNotesTab();
    agsBusinessDetails.clickAddNoteButton();
    agsBusinessDetails.getElement().saveButton().should("be.disabled");
  });
});
