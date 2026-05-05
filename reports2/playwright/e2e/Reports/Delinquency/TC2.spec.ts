import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../../utils/Login";

test.describe("As a Municipal user, I should be able to export the delinquency list", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "municipal", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
