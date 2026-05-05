import { test, expect } from '@playwright/test';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const municipalBusinessDetails = new BusinessDetails({ userType: "municipal" });

test.describe("As a municipal user, I should be able to delete notes to a business via the business details page", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "municipal", accountIndex: 4 });
    municipalBusinessGrid.init();
    municipalBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    municipalBusinessDetails.clickNotesTab();
    municipalBusinessDetails.addNote(
      `test note for this business data at ${new Date().getTime()}`
    );
    municipalBusinessDetails
      .getElement()
      .noteItems()
      .its("length")
      .as("noteItemsLength");
    cy.get("@noteItemsLength").then((noteItemsLength) => {
      municipalBusinessDetails.clickNoteItem(Number(noteItemsLength) - 1);
      municipalBusinessDetails.deleteNoteItem(Number(noteItemsLength) - 1);
      municipalBusinessDetails
        .getElement()
        .noteItems()
        .its("length")
        .then((newNoteItemsLength) => {
          expect(Number(newNoteItemsLength)).to.be.lessThan(
            Number(noteItemsLength)
          );
        });
    });
  });
});
