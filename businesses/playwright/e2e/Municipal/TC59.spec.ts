import { test, expect } from "@playwright/test";

import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({
  userType: "municipal",
});
const randomSeed = Math.floor(Math.random() * 100000);

test.describe("As a municipal user, I should be able to upload documents to a business via the business details page", () => {
  test("Initiating test", async ({ page }) => {
    const municipalBusinessDetails = new BusinessDetails(page, { userType: "municipal" });
    await Login.login(page, { accountType: "municipal", accountIndex: 9 });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    await municipalBusinessDetails.clickDocumentsTab();
    await municipalBusinessDetails.uploadDocument(`${randomSeed}example.json`);
  });
});