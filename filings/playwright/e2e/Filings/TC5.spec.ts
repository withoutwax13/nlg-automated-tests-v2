import { test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import {
  DEFAULT_BUSINESS,
  MONTHLY_FORM,
  createTaxpayerFiling,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to download the PDF of specific filing by selecting 'Download' in the action button dropdown", () => {
  test("Initiate test", async ({ page }) => {
    await deleteMatchingFilingsAsAgs(page, { accountIndex: 0, businessName: DEFAULT_BUSINESS, formName: MONTHLY_FORM });
    const referenceId = await createTaxpayerFiling(page, {
      accountIndex: 0,
      businessName: DEFAULT_BUSINESS,
    });

    const taxpayerFilingGrid = new FilingGrid(page, { userType: "taxpayer" });
    await taxpayerFilingGrid.init();
    await taxpayerFilingGrid.toggleActionButton("Download", "Reference ID", referenceId);
  });
});
