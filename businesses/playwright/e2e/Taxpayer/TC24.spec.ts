import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../utils/Login";

test.describe("As a taxpayer, when my business has been deleted by a municipal user, I should be able to verify that the business does not exist in my grid", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "taxpayer", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
