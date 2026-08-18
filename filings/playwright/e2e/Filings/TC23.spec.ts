import { test } from "@playwright/test";
import {
  DEFAULT_BUSINESS,
  MONTHLY_FORM,
  createTaxpayerFiling,
  loginFresh,
  openFilingFromGrid,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As a municipal, I should be able to to view a specific filing by selecting the View icon", () => {
  test("Initiate test", async ({ page }) => {
    await deleteMatchingFilingsAsAgs(page, { accountIndex: 0, businessName: DEFAULT_BUSINESS, formName: MONTHLY_FORM });
    const referenceId = await createTaxpayerFiling(page, {
      accountIndex: 6,
      businessName: DEFAULT_BUSINESS,
    });
    await loginFresh(page, { accountType: "municipal", accountIndex: 9, notFirstLogin: true });
    await openFilingFromGrid(page, referenceId, "municipal");
  });
});
