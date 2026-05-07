import { test, expect } from "@playwright/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const agsBusinessGrid = new BusinessGrid({ userType: "ags", municipalitySelection: "Arrakis" });
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });

test.describe("As a ags user, I should be able to delete notes to a business via the business details page", () => {
  // Skipped, assertions moved to TC55
  test.skip("Initiating test", async () => {
    await Login.login(page, { accountType: "ags", accountIndex: 7 });
    await agsBusinessGrid.init();
    await agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    await agsBusinessDetails.clickNotesTab();
    await agsBusinessDetails.addNote(
      `test note for this business data at ${new Date().getTime()}`
    );
    const noteItemsLength = await agsBusinessDetails.getElement().noteItems().count();
    await agsBusinessDetails.clickNoteItem(noteItemsLength - 1);
    await agsBusinessDetails.deleteNoteItem(noteItemsLength - 1);
    const newNoteItemsLength = await agsBusinessDetails.getElement().noteItems().count();
    expect(newNoteItemsLength).toBeLessThan(noteItemsLength);
  });
});