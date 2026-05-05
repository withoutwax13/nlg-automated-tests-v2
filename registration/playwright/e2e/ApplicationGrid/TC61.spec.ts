import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../utils/Login";

test.describe("As a user, pending application should be deleted if the corresponding filing is deleted.", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "ags", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
