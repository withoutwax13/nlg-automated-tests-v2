import { test, expect } from '../../support/pwtest';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({ userType: "ags", municipalitySelection: "Arrakis" });
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });

test.describe("As a ags user, I should be able to delete notes to a business via the business details page", () => {
  // Skipped, assertions moved to TC55
  test.skip("Initiating test", () => {
    pw.login({ accountType: "ags", accountIndex: 7 });
    agsBusinessGrid.init();
    agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    agsBusinessDetails.clickNotesTab();
    agsBusinessDetails.addNote(
      `test note for this business data at ${new Date().getTime()}`
    );
    agsBusinessDetails
      .getElement()
      .noteItems()
      .its("length")
      .as("noteItemsLength");
    pw.get("@noteItemsLength").then((noteItemsLength) => {
      agsBusinessDetails.clickNoteItem(Number(noteItemsLength) - 1);
      agsBusinessDetails.deleteNoteItem(Number(noteItemsLength) - 1);
      agsBusinessDetails
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
