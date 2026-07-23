import { test } from "@playwright/test";
import {
  DEFAULT_BUSINESS,
  createTaxpayerFiling,
  openFilingFromGrid,
} from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to to view a specific filing by selecting the View in the action dropdown button", () => {
  test("Initiate test", async ({ page }) => {
    const referenceId = await createTaxpayerFiling(page, {
      accountIndex: 9,
      businessName: DEFAULT_BUSINESS,
    });
    await openFilingFromGrid(page, referenceId, "taxpayer");
  });
});
