import { test, expect } from '@playwright/test';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({ userType: "ags", municipalitySelection: "Arrakis" });
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });

test.describe("As a ags user, I should be able to add notes to a business via the business details page", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "ags", accountIndex: 5 });
    agsBusinessGrid.init();
    agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    agsBusinessDetails.clickNotesTab();
    agsBusinessDetails.clickAddNoteButton();
    agsBusinessDetails.getElement().saveButton().should("be.disabled"); // TC56 assertion
    agsBusinessDetails.clickCancelNoteButton();
    agsBusinessDetails.addNote(
      `test note for this business data at ${new Date().getTime()}`
    );
    agsBusinessDetails
      .getElement()
      .noteItems()
      .its("length")
      .as("noteItemsLength");
    cy.get("@noteItemsLength").then((noteItemsLength) => {
      agsBusinessDetails.clickNoteItem(Number(noteItemsLength) - 1);
      agsBusinessDetails.deleteNoteItem(Number(noteItemsLength) - 1);
      agsBusinessDetails
        .getElement()
        .noteItems()
        .its("length")
        .then((newNoteItemsLength) => {
          // TC58 assertion
          expect(Number(newNoteItemsLength)).to.be.lessThan(
            Number(noteItemsLength)
          );
        });
    });
  });
});
