import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../utils/Login";

test.describe("As a taxpayer, I should only have details and delete as options in my action button column", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "taxpayer", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
