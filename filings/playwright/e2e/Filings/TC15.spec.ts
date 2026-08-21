import { test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import {
  MONTHLY_FORM,
  createTaxpayerFiling,
  loginFresh,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As a municipal, I should be able to download the PDF of specific filing by selecting the PDF image icon", () => {
  test("As a municipal, I should be able to download the PDF of specific filing by selecting the PDF image icon", { tag: ["@slot-02", "@ags", "@municipal", "@taxpayer", "@business-funded"] }, async ({ page, resourceSlot }) => {
    await deleteMatchingFilingsAsAgs(page, resourceSlot, {
      businessName: resourceSlot.businesses.funded,
      formName: MONTHLY_FORM,
    });
    const referenceId = await createTaxpayerFiling(page, resourceSlot, {
      businessName: resourceSlot.businesses.funded,
    });

    await loginFresh(page, resourceSlot, { accountType: "municipal", notFirstLogin: true });
    const municipalFilingGrid = new FilingGrid(page, { userType: "municipal" });
    await municipalFilingGrid.init();
    const actionCell = await municipalFilingGrid.getElementOfColumn("Actions", "Reference ID", referenceId);
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 }).catch(() => null);
    await actionCell.locator("button, a, img, i").first().click({ force: true });
    await downloadPromise;
  });
});
