import { test, expect } from "../../fixtures/test";
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user, I should be able to update start date for delinquency tracking in the business details page", () => {
  test("As a municipal user, I should be able to update start date for delinquency tracking in the business details page", { tag: ["@slot-04", "@municipal", "@business-active"] }, async ({ page, resourceSlot }) => {
    const municipalBusinessDetails = new BusinessDetails(page, { userType: "municipal" });
    await Login.login(page, resourceSlot, { accountType: "municipal" });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.viewBusinessDetails(resourceSlot.businesses.active);
    await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);
    await municipalBusinessDetails.clickBusinessStatusTab();
    const delinquencyInput = municipalBusinessDetails.getElement().startDateDelinquencyTrackingInput();
    const currentValue = await delinquencyInput.inputValue();
    const targetYear = currentValue.includes("2024") ? 2025 : 2024;

    await municipalBusinessDetails.setStartDateDelinquencyTracking({
      month: 1,
      date: 15,
      year: targetYear,
    });
    await municipalBusinessDetails.clickSaveButton();
    await expect(delinquencyInput).toHaveValue(new RegExp(String(targetYear)));
    // await expect(municipalBusinessDetails.getElement().toastComponent()).toBeVisible();
  });
});
