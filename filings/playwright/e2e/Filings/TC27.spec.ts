import { expect, test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import {
  MONTHLY_FORM,
  createTaxpayerFiling,
  loginFresh,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to reattempt a declined filing.", () => {
  test("Initiate test", { tag: ["@slot-08", "@ags", "@taxpayer"] }, async ({ page, resourceSlot }) => {
    await deleteMatchingFilingsAsAgs(page, resourceSlot, {
      businessName: resourceSlot.businesses.default,
      formName: MONTHLY_FORM,
    });
    const referenceId = await createTaxpayerFiling(page, resourceSlot, {
      businessName: resourceSlot.businesses.default,
    });

    await loginFresh(page, resourceSlot, { accountType: "ags", notFirstLogin: true });
    const agsFilingGrid = new FilingGrid(page, {
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    await agsFilingGrid.init();
    await agsFilingGrid.updateStatus("Declined", "Reference ID", referenceId);

    await loginFresh(page, resourceSlot, { accountType: "taxpayer", notFirstLogin: true });
    const taxpayerFilingGrid = new FilingGrid(page, { userType: "taxpayer" });
    await taxpayerFilingGrid.init();
    await taxpayerFilingGrid.toggleActionButton("Reattempt", "Reference ID", referenceId);
    await expect(page.locator("body")).toContainText(/Submit|Filing|Review/i);
  });
});
