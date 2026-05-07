import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import FilingGrid from "../../objects/FilingGrid";
import RequestedExtracts from "../../objects/RequestedExtracts";
import Login from "../../utils/Login";

const municipalFilingGrid = new FilingGrid({
  userType: "municipal",
});
const requestedExtractPage = new RequestedExtracts();

test.describe("As a municipal user, I should be able to export full filing data.", () => {
  test("Initiate test", async ({ page }) => {
    await Login.login(page, { accountType: "municipal", accountIndex: 2 });
    await municipalFilingGrid.init();
    await municipalFilingGrid.clickViewRequestedExtractButton();
    const preClickItemTotal = await requestedExtractPage.getTotalItems(page);

    await municipalFilingGrid.init();
    await municipalFilingGrid.clickExportButton(page, true, "Excel");
    await municipalFilingGrid.clickViewRequestedExtractButton();
    const postClickItemTotal = await requestedExtractPage.getTotalItems(page);
    expect(postClickItemTotal).toBeGreaterThan(preClickItemTotal);
  });
});