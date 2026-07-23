import { expect, test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import { DRAFT_BUSINESS, createDraftFiling } from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to resume a draft filing.", () => {
  test("Initiate test", async ({ page }) => {
    const referenceId = await createDraftFiling(page, 8);
    const taxpayerFilingGrid = new FilingGrid(page, { userType: "taxpayer" });
    await taxpayerFilingGrid.init();
    await taxpayerFilingGrid.toggleActionButton("Resume", "Reference ID", referenceId);
    await expect(page.locator("body")).toContainText(DRAFT_BUSINESS);
  });
});
