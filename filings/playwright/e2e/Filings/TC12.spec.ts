import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import FilingGrid from "../../objects/FilingGrid";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

test.describe("As an AGS user, I should be able to view filings data of a specific government.", () => {
  test("Initiate test", async ({ page }) => {
    await login({ accountType: "ags", accountIndex: 8 });
    await agsFilingGrid.init();
    expect(await agsFilingGrid.getElement(page).rows().count()).toBeGreaterThan(0);
  });
});
