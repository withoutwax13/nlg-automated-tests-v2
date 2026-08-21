import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const cleanTestData = async (agsBusinessGrid: BusinessGrid, page: any, businessName: string, requiredForm: string) => {
  await agsBusinessGrid.init(page);
  await agsBusinessGrid.clickClearAllFiltersButton();
  const requiredFormsBeforeCleaning = await agsBusinessGrid.checkEnabledRequiredForms(businessName);
  if (requiredFormsBeforeCleaning.includes(requiredForm)) {
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.removeRequiredForms(businessName, [requiredForm]);
  }
};

test.describe("As an AGS user, I should be able to add required forms from the grid", () => {
  test("As an AGS user, I should be able to add required forms from the grid", { tag: ["@slot-02", "@ags", "@business-required-forms"] }, async ({ page, resourceSlot }) => {
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: resourceSlot.municipality,
    });
    await Login.login(page, resourceSlot, { accountType: "ags" });
    await cleanTestData(agsBusinessGrid, page, resourceSlot.businesses.requiredForms, "Food and Beverage Tax Return (Monthly)");
    await agsBusinessGrid.clickClearAllFiltersButton();
    const beforeAddingRequiredForms = await agsBusinessGrid.checkEnabledRequiredForms(resourceSlot.businesses.requiredForms);
    expect(beforeAddingRequiredForms).not.toContain("Food and Beverage Tax Return (Monthly)");
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.addRequiredForms(resourceSlot.businesses.requiredForms, [
      "Food and Beverage Tax Return (Monthly)",
    ]);
    // await expect(agsBusinessGrid.getElement().toastComponent()).toBeVisible();
    await agsBusinessGrid.clickClearAllFiltersButton();
    const afterAddingRequiredForms = await agsBusinessGrid.checkEnabledRequiredForms(resourceSlot.businesses.requiredForms);
    expect(afterAddingRequiredForms).toContain("Food and Beverage Tax Return (Monthly)");
  });
});
