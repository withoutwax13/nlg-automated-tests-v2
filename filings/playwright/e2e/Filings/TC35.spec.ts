import { test } from "../../fixtures/test";
import {
  MONTHLY_FORM,
  createTaxpayerFiling,
  openFilingFromGrid,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to to view a specific filing by selecting the View in the action dropdown button", () => {
  test("As a taxpayer, I should be able to to view a specific filing by selecting the View in the action dropdown button", { tag: ["@slot-05", "@ags", "@taxpayer", "@business-default"] }, async ({ page, resourceSlot }) => {
    await deleteMatchingFilingsAsAgs(page, resourceSlot, {
      businessName: resourceSlot.businesses.default,
      formName: MONTHLY_FORM,
    });
    const referenceId = await createTaxpayerFiling(page, resourceSlot, {
      businessName: resourceSlot.businesses.default,
    });
    await openFilingFromGrid(page, referenceId, "taxpayer");
  });
});
