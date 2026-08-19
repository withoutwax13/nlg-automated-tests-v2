import { test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import {
  MONTHLY_FORM,
  createTaxpayerFiling,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to download the PDF of specific filing by selecting 'Download' in the action button dropdown", () => {
  test("Initiate test", { tag: ["@slot-09", "@ags", "@taxpayer"] }, async ({ page, resourceSlot }) => {
    await deleteMatchingFilingsAsAgs(page, resourceSlot, {
      businessName: resourceSlot.businesses.default,
      formName: MONTHLY_FORM,
    });
    const referenceId = await createTaxpayerFiling(page, resourceSlot, {
      businessName: resourceSlot.businesses.default,
    });

    const taxpayerFilingGrid = new FilingGrid(page, { userType: "taxpayer" });
    await taxpayerFilingGrid.init();
    await taxpayerFilingGrid.toggleActionButton("Download", "Reference ID", referenceId);
  });
});
