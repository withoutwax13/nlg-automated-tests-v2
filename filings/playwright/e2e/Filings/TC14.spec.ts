import { test } from "@playwright/test";
import {
  FUNDED_BUSINESS,
  MONTHLY_FORM,
  createTaxpayerFiling,
  loginFresh,
  openFilingFromGrid,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As a AGS, I should be able to to view a specific filing by selecting the View icon", () => {
  test("Initiate test", async ({ page }) => {
    await deleteMatchingFilingsAsAgs(page, { accountIndex: 0, businessName: FUNDED_BUSINESS, formName: MONTHLY_FORM });
    const referenceId = await createTaxpayerFiling(page, {
      accountIndex: 4,
      businessName: FUNDED_BUSINESS,
    });
    await loginFresh(page, { accountType: "ags", accountIndex: 8, notFirstLogin: true });
    await openFilingFromGrid(page, referenceId, "ags");
  });
});
