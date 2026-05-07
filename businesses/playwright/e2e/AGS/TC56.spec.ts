import { test, expect } from "@playwright/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });

test.describe("As a user, I should not be able to add blank notes in the business details page", () => {
  // Skipped, assertion moved to TC55
  test.skip("Initiating test", async () => {
    await Login.login(page, { accountType: "ags", accountIndex: 6 });
    await agsBusinessGrid.init();
    await agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    await agsBusinessDetails.clickNotesTab();
    await agsBusinessDetails.clickAddNoteButton();
    await expect(agsBusinessDetails.getElement().saveButton()).toBeDisabled();
  });
});