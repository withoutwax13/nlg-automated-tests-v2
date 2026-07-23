import { test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import { loginFresh } from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to export filings data.", () => {
  test("Initiate test", async ({ page }) => {
    await loginFresh(page, { accountType: "taxpayer" });
    const filingGrid = new FilingGrid(page, { userType: "taxpayer" });
    await filingGrid.init();
    await filingGrid.clickExportButton();
  });
});
