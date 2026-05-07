import { test, expect } from "@playwright/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const municipalBusinessDetails = new BusinessDetails({ userType: "municipal" });

test.describe("As a municipal user, I should be able to add notes to a business via the business details page", () => {
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "municipal", accountIndex: 3 });
    municipalBusinessGrid.init();
    municipalBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    municipalBusinessDetails.clickNotesTab(); 
    municipalBusinessDetails.addNote(
      `test note for this business data at ${new Date().getTime()}`
    );
  });
});