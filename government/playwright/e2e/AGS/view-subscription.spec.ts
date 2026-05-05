import { test } from "@playwright/test";
import path from "path";
import viewSubscription from "../../helpers/view-subscription";

test.describe("As a government user, I want to be able to view the list of Subscriptions", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await viewSubscription(page, projectRoot);
  });
});
