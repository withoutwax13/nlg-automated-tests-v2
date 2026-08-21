import { test } from "../../fixtures/test";
import {
  MONTHLY_FORM,
  createTaxpayerFiling,
  loginFresh,
  openFilingFromGrid,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As a AGS, I should be able to to view a specific filing by selecting the View icon", () => {
  test("As a AGS, I should be able to to view a specific filing by selecting the View icon", { tag: ["@slot-07", "@ags", "@taxpayer", "@business-funded"] }, async ({ page, resourceSlot }) => {
    await deleteMatchingFilingsAsAgs(page, resourceSlot, {
      businessName: resourceSlot.businesses.funded,
      formName: MONTHLY_FORM,
    });
    const referenceId = await createTaxpayerFiling(page, resourceSlot, {
      businessName: resourceSlot.businesses.funded,
    });
    await loginFresh(page, resourceSlot, { accountType: "ags", notFirstLogin: true });
    await openFilingFromGrid(page, referenceId, "ags");
  });
});
