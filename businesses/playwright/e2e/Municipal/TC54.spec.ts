import { test, expect } from "../../fixtures/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user, I should be able to add notes to a business via the business details page", () => {
  test("Initiating test", { tag: ["@slot-05", "@municipal", "@business-active"] }, async ({ page, resourceSlot }) => {
    const municipalBusinessDetails = new BusinessDetails(page, { userType: "municipal" });
    await Login.login(page, resourceSlot, { accountType: "municipal" });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.viewBusinessDetails(resourceSlot.businesses.active);
    await municipalBusinessDetails.clickNotesTab(); 
    await municipalBusinessDetails.addNote(
      `test note for this business data at ${new Date().getTime()}`
    );
    const noteItemsLength = await municipalBusinessDetails.getElement().noteItems().count();
    expect(noteItemsLength).toBeGreaterThan(0);
    await municipalBusinessDetails.clickNoteItem(noteItemsLength - 1);
    await municipalBusinessDetails.deleteNoteItem(noteItemsLength - 1);
    await expect(municipalBusinessDetails.getElement().noteItems()).toHaveCount(
      noteItemsLength - 1,
    );
  });
});
