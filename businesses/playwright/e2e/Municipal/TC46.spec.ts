import { test, expect } from "../../fixtures/test";
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user, I should be able to update business close date date in the business details page", () => {
  test("Initiating test", { tag: ["@slot-08", "@municipal", "@business-inactive"] }, async ({ page, resourceSlot }) => {
    const municipalBusinessDetails = new BusinessDetails(page, { userType: "municipal" });
    await Login.login(page, resourceSlot, { accountType: "municipal" });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.viewBusinessDetails(resourceSlot.businesses.inactive);
    await expect(page).toHaveURL(/\/BusinessesApp\/BusinessDetails\//);
    await municipalBusinessDetails.clickBusinessStatusTab();
    const closeDateInput = municipalBusinessDetails.getElement().businessCloseDateInput();
    const currentValue = await closeDateInput.inputValue();
    const targetYear = currentValue.includes("2029") ? 2030 : 2029;
    await municipalBusinessDetails.setBusinessCloseDate({
      month: 2,
      date: 15,
      year: targetYear,
    }, false);
    await municipalBusinessDetails.clickSaveButton();
    await expect(closeDateInput).toHaveValue(new RegExp(String(targetYear)));
    // await expect(municipalBusinessDetails.getElement().toastComponent()).toBeVisible();
  });
});
