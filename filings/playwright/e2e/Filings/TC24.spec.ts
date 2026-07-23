import { expect, test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import { createDraftFiling } from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to delete a draft filing.", () => {
  test("Initiate test", async ({ page }) => {
    const referenceId = await createDraftFiling(page, 6);
    const taxpayerFilingGrid = new FilingGrid(page, { userType: "taxpayer" });
    await taxpayerFilingGrid.init();
    await taxpayerFilingGrid.deleteFiling("Reference ID", referenceId);
    await taxpayerFilingGrid.init();
    await taxpayerFilingGrid.filterColumn("Reference ID", referenceId, "text", "Contains");
    await expect(taxpayerFilingGrid.getElement().noRecordFoundComponent()).toBeVisible();
  });
});
