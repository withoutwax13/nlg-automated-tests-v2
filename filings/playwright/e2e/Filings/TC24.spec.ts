import { expect, test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import {
  createDraftFiling,
  deleteMatchingFilingAsTaxpayer,
  DRAFT_BUSINESS
} from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to delete a draft filing.", () => {
  test("Initiate test", async ({ page }) => {
    await createDraftFiling(page, 6);
    await deleteMatchingFilingAsTaxpayer(page, { accountIndex: 6, draftBusiness: DRAFT_BUSINESS })
    const taxpayerFilingGrid = new FilingGrid(page, { userType: "taxpayer" });
    await expect(taxpayerFilingGrid.getElement().noRecordFoundComponent()).toBeVisible();
  });
});
