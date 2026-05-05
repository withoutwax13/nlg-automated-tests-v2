import { test, expect } from "@playwright/test";
import path from "path";
import viewMunicipalities from "../../helpers/view-municipalities";
import selector from "../../fixtures/selector.json";

const exportMunicipalities = async (page: any, projectRoot: string) => {
  await viewMunicipalities(page, projectRoot);
  const exportButton = page.locator(selector.button).filter({ hasText: "Export" }).first();
  await expect(exportButton).toBeVisible();
  await expect(exportButton).toBeEnabled();
  await exportButton.click();
};

test.describe("As a government user, I want to be able to export the list of Municipalities", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await exportMunicipalities(page, projectRoot);
  });
});

export default exportMunicipalities;
