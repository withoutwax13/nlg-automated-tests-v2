import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../utils/Login";

test.describe("User should not be able to add locations if opted for registering single business location in the basic info step", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "taxpayer", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
