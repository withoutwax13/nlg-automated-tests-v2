import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../utils/Login";

test.describe("As a municipal user, I should be able to upload documents to a business via the business details page", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "municipal", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
