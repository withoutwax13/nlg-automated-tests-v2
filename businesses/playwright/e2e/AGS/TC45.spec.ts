import { test, expect } from "@playwright/test";
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "Arrakis",
});
const randomMonth = Math.floor(Math.random() * 12) + 1;
const randomDate = Math.floor(Math.random() * 28) + 1;

test.describe("As a ags user, I should be able to update start date for delinquency tracking in the business details page", () => {
  test("Initiating test", async ({ page }) => {
    const agsBusinessDetails = new BusinessDetails(page, { userType: "ags" });
    await Login.login(page, { accountType: "ags", accountIndex: 1 });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 74829");
    await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);
    await agsBusinessDetails.clickBusinessStatusTab();

    await agsBusinessDetails.setStartDateDelinquencyTracking({
      month: randomMonth,
      date: randomDate,
      year: 2024,
    });
    await agsBusinessDetails.clickSaveButton();
    // await expect(agsBusinessDetails.getElement().toastComponent()).toBeVisible();
  });
});