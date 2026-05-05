import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import FilingGrid from "../../objects/FilingGrid";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

test.describe("As an AGS user, I should be able to view requested extract.", () => {
  test("Initiate test", async ({ page }) => {
    await login({ accountType: "ags", accountIndex: 8 });
    await agsFilingGrid.init();
    await agsFilingGrid.clickViewRequestedExtractButton();
    await expect(page).toHaveURL(/\/filingsExtractRequests\?/);
  });
});
