import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../utils/Login";

test.describe("As a gov user, I want to be able to do final approval", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "taxpayer", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
