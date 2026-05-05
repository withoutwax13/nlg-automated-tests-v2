import { test, expect } from '../../support/pwtest';
import FilingGrid from "../../objects/FilingGrid";

const taxpayerFilingGrid = new FilingGrid({
  userType: "taxpayer",
});

test.describe("As a taxpayer, I should be able to export filings data.", () => {
  test("Initiate test", () => {
    pw.login({ accountType: "taxpayer", accountIndex: 8 });
    taxpayerFilingGrid.init();
    taxpayerFilingGrid.clickExportButton();
  });
});
