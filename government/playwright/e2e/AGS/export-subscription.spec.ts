import { test, expect } from "@playwright/test";
import path from "path";
import viewSubscription from "../../helpers/view-subscription";
import selector from "../../fixtures/selector.json";

const exportSubscription = async (page: any, projectRoot: string) => {
  await viewSubscription(page, projectRoot);
  const exportButton = page.locator(selector.button).filter({ hasText: "Export" }).first();
  await expect(exportButton).toBeVisible();
  await expect(exportButton).toBeEnabled();
  await exportButton.click();
};

test.describe("As a government user, I want to be able to export the list of Subscriptions", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await exportSubscription(page, projectRoot);
  });
});

export default exportSubscription;
