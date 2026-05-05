import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import FilingGrid from "../../objects/FilingGrid";

const taxpayerFilingGrid = new FilingGrid({
  userType: "taxpayer",
});

test.describe("As a taxpayer, I should be able to export filings data.", () => {
  test("Initiate test", async ({ page }) => {
    await login({ accountType: "taxpayer", accountIndex: 8 });
    taxpayerFilingGrid.init();
    taxpayerFilingGrid.clickExportButton();
  });
});
