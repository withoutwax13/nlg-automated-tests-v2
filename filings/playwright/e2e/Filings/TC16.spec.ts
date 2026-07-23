import { expect, test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import RequestedExtracts from "../../objects/RequestedExtracts";
import { loginFresh } from "../helpers/filing-workflows";

test.describe("As a municipal user, I should be able to export full filing data.", () => {
  test("Initiate test", async ({ page }) => {
    await loginFresh(page, { accountType: "municipal" });
    const requestedExtracts = new RequestedExtracts(page);
    await requestedExtracts.init();
    const beforeTotal = await requestedExtracts.getTotalItems();

    const filingGrid = new FilingGrid(page, { userType: "municipal" });
    await filingGrid.init();
    await filingGrid.clickExportButton(true, "Excel");

    await requestedExtracts.init();
    expect(await requestedExtracts.getTotalItems()).toBeGreaterThanOrEqual(beforeTotal);
  });
});
