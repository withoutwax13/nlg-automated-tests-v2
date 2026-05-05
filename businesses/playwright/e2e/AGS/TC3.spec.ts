import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

const cleanTestData = async (businessName: string, requiredForm: string) => {
  await agsBusinessGrid.init();
  await agsBusinessGrid.clickClearAllFiltersButton();
  const requiredFormsBeforeCleaning = await agsBusinessGrid.checkEnabledRequiredForms(businessName);
  if (requiredFormsBeforeCleaning.includes(requiredForm)) {
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.removeRequiredForms(businessName, [requiredForm]);
  }
};

test.describe("As an AGS user, I should be able to add required forms from the grid", () => {
  test("Initiating test", async () => {
    await login({ accountType: "ags", accountIndex: 2 });
    await cleanTestData("Arrakis Spice Company 17829", "Food and Beverage Tax Return (Monthly)");
    await agsBusinessGrid.clickClearAllFiltersButton();
    const beforeAddingRequiredForms = await agsBusinessGrid.checkEnabledRequiredForms("Arrakis Spice Company 17829");
    expect(beforeAddingRequiredForms).not.toContain("Food and Beverage Tax Return (Monthly)");
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.addRequiredForms("Arrakis Spice Company 17829", [
      "Food and Beverage Tax Return (Monthly)",
    ]);
    await expect(agsBusinessGrid.getElement().toastComponent()).toBeVisible();
    await agsBusinessGrid.clickClearAllFiltersButton();
    const afterAddingRequiredForms = await agsBusinessGrid.checkEnabledRequiredForms("Arrakis Spice Company 17829");
    expect(afterAddingRequiredForms).toContain("Food and Beverage Tax Return (Monthly)");
  });
});
