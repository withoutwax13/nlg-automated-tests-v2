import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({
  userType: "municipal"
});

const cleanTestData = async (page: any, businessName: string, requiredForm: string) => {
  await municipalBusinessGrid.init(page);
  await municipalBusinessGrid.clickClearAllFiltersButton();
  const requiredFormsBeforeCleaning = await municipalBusinessGrid.checkEnabledRequiredForms(businessName);
  if (requiredFormsBeforeCleaning.includes(requiredForm)) {
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.removeRequiredForms(businessName, [requiredForm]);
  }
};

test.describe("As a municipal user, I should be able to add required forms from the grid", () => {
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "municipal", accountIndex: 2 });
    await cleanTestData(page, "Arrakis Spice Company 17829", "Food and Beverage Tax Return (Monthly)");
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const beforeAddingRequiredForms = await municipalBusinessGrid.checkEnabledRequiredForms("Arrakis Spice Company 17829");
    expect(beforeAddingRequiredForms).not.toContain("Food and Beverage Tax Return (Monthly)");
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.addRequiredForms("Arrakis Spice Company 17829", [
      "Food and Beverage Tax Return (Monthly)",
    ]);
    await expect(municipalBusinessGrid.getElement().toastComponent()).toBeVisible();
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const afterAddingRequiredForms = await municipalBusinessGrid.checkEnabledRequiredForms("Arrakis Spice Company 17829");
    expect(afterAddingRequiredForms).toContain("Food and Beverage Tax Return (Monthly)");
  });
});