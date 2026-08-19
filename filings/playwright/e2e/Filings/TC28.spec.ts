import { expect, test } from "../../fixtures/test";
import Filing from "../../objects/Filing";
import FilingGrid from "../../objects/FilingGrid";
import Form from "../../objects/Form";
import { createDraftFiling } from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to resume a draft filing.", () => {
  test("Initiate test", { tag: ["@slot-03", "@taxpayer"] }, async ({ page, resourceSlot }) => {
    await createDraftFiling(page, resourceSlot);
    const filing = new Filing(page);
    const taxpayerFilingGrid = new FilingGrid(page, { userType: "taxpayer" });
    const form = new Form(page);
    await taxpayerFilingGrid.init();
    await taxpayerFilingGrid.toggleActionButton("Resume", "Location DBA", resourceSlot.businesses.draft);
    await form.clickBackButton();
    await expect(filing.getElements().businessSelectionDropdown()).toHaveValue(
      resourceSlot.businesses.draft,
    );
  });
});
