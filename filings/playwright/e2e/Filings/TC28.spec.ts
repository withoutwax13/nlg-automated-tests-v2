import { expect, test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import Form from "../../objects/Form";
import {
  DRAFT_BUSINESS,
  createDraftFiling
} from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to resume a draft filing.", () => {
  test("Initiate test", async ({ page }) => {
    await createDraftFiling(page, 8);
    const taxpayerFilingGrid = new FilingGrid(page, { userType: "taxpayer" });
    const form = new Form(page);
    await taxpayerFilingGrid.init();
    await taxpayerFilingGrid.toggleActionButton("Resume", "Location DBA", DRAFT_BUSINESS);
    await form.clickBackButton();
    await expect(page.locator(`input[value='${DRAFT_BUSINESS}']`).first()).toBeVisible();
  });
});
