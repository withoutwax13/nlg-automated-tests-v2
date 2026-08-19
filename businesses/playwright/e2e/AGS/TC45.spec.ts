import { test, expect } from "../../fixtures/test";
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

test.describe("As a ags user, I should be able to update start date for delinquency tracking in the business details page", () => {
  test("Initiating test", { tag: ["@slot-07", "@ags", "@business-delinquency"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    const agsBusinessDetails = new BusinessDetails(page, { userType: "ags" });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await agsBusinessGrid.init(page);
    await agsBusinessGrid.viewBusinessDetails(resourceSlot.businesses.delinquency);
    await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);
    await agsBusinessDetails.clickBusinessStatusTab();
    const delinquencyInput = agsBusinessDetails.getElement().startDateDelinquencyTrackingInput();
    const currentValue = await delinquencyInput.inputValue();
    const targetYear = currentValue.includes("2024") ? 2025 : 2024;

    await agsBusinessDetails.setStartDateDelinquencyTracking({
      month: 1,
      date: 15,
      year: targetYear,
    });
    await agsBusinessDetails.clickSaveButton();
    await expect(delinquencyInput).toHaveValue(new RegExp(String(targetYear)));
    // await expect(agsBusinessDetails.getElement().toastComponent()).toBeVisible();
  });
});
