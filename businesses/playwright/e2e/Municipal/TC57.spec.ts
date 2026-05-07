import { test, expect } from "@playwright/test";
import { deleteBusinessData, expectCurrentUrlToInclude, logout } from "../../support/native-helpers";
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const municipalBusinessDetails = new BusinessDetails({ userType: "municipal" });

test.describe("As a municipal user, I should be able to delete notes to a business via the business details page", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "municipal", accountIndex: 4 });
    await municipalBusinessGrid.init();
    await municipalBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    await municipalBusinessDetails.clickNotesTab();
    await municipalBusinessDetails.addNote(
      `test note for this business data at ${new Date().getTime()}`
    );
    const noteItemsLength = await municipalBusinessDetails.getElement().noteItems().count();
    await municipalBusinessDetails.clickNoteItem(noteItemsLength - 1);
    await municipalBusinessDetails.deleteNoteItem(noteItemsLength - 1);
    const newNoteItemsLength = await municipalBusinessDetails.getElement().noteItems().count();
    expect(newNoteItemsLength).toBeLessThan(noteItemsLength);
  });
});