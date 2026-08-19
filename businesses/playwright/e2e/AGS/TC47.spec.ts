import { test, expect } from "../../fixtures/test";
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a ags user, I should be able to update business close date date in the business details page", () => {
  test("Initiating test", { tag: ["@slot-07", "@ags", "@business-inactive"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    const agsBusinessDetails = new BusinessDetails(page, { userType: "ags" });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.viewBusinessDetails(resourceSlot.businesses.inactive);
    await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);
    await agsBusinessDetails.clickBusinessStatusTab();
    const closeDateInput = agsBusinessDetails.getElement().businessCloseDateInput();
    const currentValue = await closeDateInput.inputValue();
    const targetYear = currentValue.includes("2029") ? 2030 : 2029;
    await agsBusinessDetails.setBusinessCloseDate({
      month: 2,
      date: 15,
      year: targetYear,
    }, true);
    await agsBusinessDetails.clickSaveButton();
    await expect(closeDateInput).toHaveValue(new RegExp(String(targetYear)));
    // await expect(agsBusinessDetails.getElement().toastComponent()).toBeVisible();
  });
});
