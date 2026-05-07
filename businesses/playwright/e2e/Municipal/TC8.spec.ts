import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({
  userType: "municipal"
});

const cleanTestData = async (businessName: string, requiredForm: string) => {
  await municipalBusinessGrid.init();
  await municipalBusinessGrid.clickClearAllFiltersButton();
  const requiredFormsBeforeCleaning = await municipalBusinessGrid.checkEnabledRequiredForms(businessName);
  if (!requiredFormsBeforeCleaning.includes(requiredForm)) {
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.addRequiredForms(businessName, [requiredForm]);
  }
};

test.describe("As a municipal user, I should be able to remove required forms from the grid", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "municipal", accountIndex: 3 });
    await cleanTestData("Arrakis Spice Company 17829", "Food and Beverage Tax Return (Monthly)");
    await municipalBusinessGrid.init();
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const beforeRemovingRequiredForms = await municipalBusinessGrid.checkEnabledRequiredForms("Arrakis Spice Company 17829");
    expect(beforeRemovingRequiredForms).toContain("Food and Beverage Tax Return (Monthly)");
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.removeRequiredForms("Arrakis Spice Company 17829", [
      "Food and Beverage Tax Return (Monthly)",
    ]);
    await expect(municipalBusinessGrid.getElement().toastComponent()).toBeVisible();
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const afterRemovingRequiredForms = await municipalBusinessGrid.checkEnabledRequiredForms("Arrakis Spice Company 17829");
    expect(afterRemovingRequiredForms).not.toContain("Food and Beverage Tax Return (Monthly)");
  });
});