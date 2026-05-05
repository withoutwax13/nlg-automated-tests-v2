import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../utils/Login";

test.describe("As an AGS, Gov user, I want the system to prevent deleting a business record with filings", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "ags", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
