import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({
  userType: "municipal"
});

const cleanTestData = async (page: any, businessName: string, requiredForm: string) => {
  await municipalBusinessGrid.init(page);
  await municipalBusinessGrid.clickClearAllFiltersButton();
  const requiredFormsBeforeCleaning = await municipalBusinessGrid.checkEnabledRequiredForms(businessName);
  if (!requiredFormsBeforeCleaning.includes(requiredForm)) {
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.addRequiredForms(businessName, [requiredForm]);
  }
};

test.describe.skip("As a municipal user, I should be able to remove required forms from the grid", () => {
  test("As a municipal user, I should be able to remove required forms from the grid", async ({ page, resourceSlot }) => {
    await Login.login(page, resourceSlot, { accountType: "municipal" });
    await cleanTestData(page, resourceSlot.businesses.requiredForms, "Food and Beverage Tax Return (Monthly)");
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const beforeRemovingRequiredForms = await municipalBusinessGrid.checkEnabledRequiredForms(resourceSlot.businesses.requiredForms);
    expect(beforeRemovingRequiredForms).toContain("Food and Beverage Tax Return (Monthly)");
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.removeRequiredForms(resourceSlot.businesses.requiredForms, [
      "Food and Beverage Tax Return (Monthly)",
    ]);
    // await expect(municipalBusinessGrid.getElement().toastComponent()).toBeVisible();
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const afterRemovingRequiredForms = await municipalBusinessGrid.checkEnabledRequiredForms(resourceSlot.businesses.requiredForms);
    expect(afterRemovingRequiredForms).not.toContain("Food and Beverage Tax Return (Monthly)");
  });
});
