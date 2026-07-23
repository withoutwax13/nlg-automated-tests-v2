import { test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import { createZeroPaymentFiling } from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to submit a zero payment filing.", () => {
  test("Initiate test", async ({ page }) => {
    const referenceId = await createZeroPaymentFiling(page, 3);
    const taxpayerFilingGrid = new FilingGrid(page, { userType: "taxpayer" });
    await taxpayerFilingGrid.init();
    await taxpayerFilingGrid.toggleActionButton("View", "Reference ID", referenceId);
  });
});
