import { test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import { createZeroPaymentFiling } from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to submit a zero payment filing.", () => {
  test("As a taxpayer, I should be able to submit a zero payment filing.", { tag: ["@slot-09", "@taxpayer", "@business-zero-payment"] }, async ({ page, resourceSlot }) => {
    const referenceId = await createZeroPaymentFiling(page, resourceSlot);
    const taxpayerFilingGrid = new FilingGrid(page, { userType: "taxpayer" });
    await taxpayerFilingGrid.init();
    await taxpayerFilingGrid.toggleActionButton("View", "Reference ID", referenceId);
  });
});
