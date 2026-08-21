import { test, expect } from "../../fixtures/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a user, I should not be able to add blank notes in the business details page", () => {
  // Skipped, assertion moved to TC55
  test.skip("As a user, I should not be able to add blank notes in the business details page", async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    const agsBusinessDetails = new BusinessDetails(page, { userType: "ags" });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.viewBusinessDetails(resourceSlot.businesses.active);
    await agsBusinessDetails.clickNotesTab();
    await agsBusinessDetails.clickAddNoteButton();
    await expect(agsBusinessDetails.getElement().saveButton()).toBeDisabled();
  });
});
