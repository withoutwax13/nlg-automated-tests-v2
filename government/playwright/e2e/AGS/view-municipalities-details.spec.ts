import { test, expect } from "@playwright/test";
import path from "path";
import selector from "../../fixtures/selector.json";
import viewMunicipalities from "../../helpers/view-municipalities";

test.describe("As a government user, I want to be able to view the specific details of Municipalities", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await viewMunicipalities(page, projectRoot);

    await expect(page.locator(selector.detailsIcon).first()).toBeVisible();
    await page.locator(selector.detailsIcon).first().click();

    await expect(page).toHaveURL(/\/municipalityApp\/view\//);
    await expect(page.locator(selector.heading2Title).filter({ hasText: "Basic information" })).toBeVisible();
  });
});
