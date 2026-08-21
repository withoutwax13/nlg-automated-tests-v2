import { test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import { loginFresh } from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to export filings data.", () => {
  test("As a taxpayer, I should be able to export filings data.", { tag: ["@slot-00", "@taxpayer"] }, async ({ page, resourceSlot }) => {
    await loginFresh(page, resourceSlot, { accountType: "taxpayer" });
    const filingGrid = new FilingGrid(page, { userType: "taxpayer" });
    await filingGrid.init();
    await filingGrid.clickExportButton();
  });
});
