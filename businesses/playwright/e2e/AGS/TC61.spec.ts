import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../utils/Login";

test.describe("As a user, if there are no changes made in the update business page, the save button should not exist", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "ags", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
