import { expect, test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import {
  DEFAULT_BUSINESS,
  createTaxpayerFiling,
  loginFresh,
} from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to reattempt a declined filing.", () => {
  test("Initiate test", async ({ page }) => {
    const referenceId = await createTaxpayerFiling(page, {
      accountIndex: 7,
      businessName: DEFAULT_BUSINESS,
    });

    await loginFresh(page, { accountType: "ags", accountIndex: 7, notFirstLogin: true });
    const agsFilingGrid = new FilingGrid(page, {
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    await agsFilingGrid.init();
    await agsFilingGrid.updateStatus("Declined", "Reference ID", referenceId);

    await loginFresh(page, { accountType: "taxpayer", accountIndex: 7, notFirstLogin: true });
    const taxpayerFilingGrid = new FilingGrid(page, { userType: "taxpayer" });
    await taxpayerFilingGrid.init();
    await taxpayerFilingGrid.toggleActionButton("Reattempt", "Reference ID", referenceId);
    await expect(page.locator("body")).toContainText(/Submit|Filing|Review/i);
  });
});
