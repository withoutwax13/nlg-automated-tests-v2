import { expect, test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import {
  createDraftFiling,
  deleteMatchingFilingAsTaxpayer
} from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to delete a draft filing.", () => {
  test("Initiate test", { tag: ["@slot-02", "@taxpayer"] }, async ({ page, resourceSlot }) => {
    await createDraftFiling(page, resourceSlot);
    await deleteMatchingFilingAsTaxpayer(page, resourceSlot);
    const taxpayerFilingGrid = new FilingGrid(page, { userType: "taxpayer" });
    await expect(taxpayerFilingGrid.getElement().noRecordFoundComponent()).toBeVisible();
  });
});
