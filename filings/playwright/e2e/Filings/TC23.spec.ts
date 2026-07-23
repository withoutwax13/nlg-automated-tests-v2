import { test } from "@playwright/test";
import {
  DEFAULT_BUSINESS,
  createTaxpayerFiling,
  loginFresh,
  openFilingFromGrid,
} from "../helpers/filing-workflows";

test.describe("As a municipal, I should be able to to view a specific filing by selecting the View icon", () => {
  test("Initiate test", async ({ page }) => {
    const referenceId = await createTaxpayerFiling(page, {
      accountIndex: 6,
      businessName: DEFAULT_BUSINESS,
    });
    await loginFresh(page, { accountType: "municipal", notFirstLogin: true });
    await openFilingFromGrid(page, referenceId, "municipal");
  });
});
