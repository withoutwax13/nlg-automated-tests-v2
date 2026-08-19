import { test } from "../../fixtures/test";
import {
  MONTHLY_FORM,
  createTaxpayerFiling,
  loginFresh,
  openFilingFromGrid,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As a municipal, I should be able to to view a specific filing by selecting the View icon", () => {
  test("Initiate test", { tag: ["@slot-03", "@ags", "@municipal", "@taxpayer"] }, async ({ page, resourceSlot }) => {
    await deleteMatchingFilingsAsAgs(page, resourceSlot, {
      businessName: resourceSlot.businesses.default,
      formName: MONTHLY_FORM,
    });
    const referenceId = await createTaxpayerFiling(page, resourceSlot, {
      businessName: resourceSlot.businesses.default,
    });
    await loginFresh(page, resourceSlot, { accountType: "municipal", notFirstLogin: true });
    await openFilingFromGrid(page, referenceId, "municipal");
  });
});
