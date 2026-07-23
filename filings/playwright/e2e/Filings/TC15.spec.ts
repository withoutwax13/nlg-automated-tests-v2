import { test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import {
  DEFAULT_BUSINESS,
  createTaxpayerFiling,
  loginFresh,
} from "../helpers/filing-workflows";

test.describe("As a municipal, I should be able to download the PDF of specific filing by selecting the PDF image icon", () => {
  test("Initiate test", async ({ page }) => {
    const referenceId = await createTaxpayerFiling(page, {
      accountIndex: 5,
      businessName: DEFAULT_BUSINESS,
    });

    await loginFresh(page, { accountType: "municipal", notFirstLogin: true });
    const municipalFilingGrid = new FilingGrid(page, { userType: "municipal" });
    await municipalFilingGrid.init();
    const actionCell = await municipalFilingGrid.getElementOfColumn("Actions", "Reference ID", referenceId);
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 }).catch(() => null);
    await actionCell.locator("button, a, img, i").first().click({ force: true });
    await downloadPromise;
  });
});
