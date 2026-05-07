import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

const cleanTestData = async (businessName: string, requiredForm: string) => {
  await agsBusinessGrid.init();
  await agsBusinessGrid.clickClearAllFiltersButton();
  const requiredFormsBeforeCleaning = await agsBusinessGrid.checkEnabledRequiredForms(businessName);
  if (!requiredFormsBeforeCleaning.includes(requiredForm)) {
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.addRequiredForms(businessName, [requiredForm]);
  }
};

test.describe("As an AGS user, I should be able to remove required forms from the grid", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "ags", accountIndex: 3 });
    await cleanTestData("Arrakis Spice Company 17829", "Food and Beverage Tax Return (Monthly)");
    await agsBusinessGrid.clickClearAllFiltersButton();
    const beforeRemovingRequiredForms = await agsBusinessGrid.checkEnabledRequiredForms("Arrakis Spice Company 17829");
    expect(beforeRemovingRequiredForms).toContain("Food and Beverage Tax Return (Monthly)");
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.removeRequiredForms("Arrakis Spice Company 17829", [
      "Food and Beverage Tax Return (Monthly)",
    ]);
    await expect(agsBusinessGrid.getElement().toastComponent()).toBeVisible();
    await agsBusinessGrid.clickClearAllFiltersButton();
    const afterRemovingRequiredForms = await agsBusinessGrid.checkEnabledRequiredForms("Arrakis Spice Company 17829");
    expect(afterRemovingRequiredForms).not.toContain("Food and Beverage Tax Return (Monthly)");
  });
});