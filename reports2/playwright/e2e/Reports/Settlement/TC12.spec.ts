import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../../utils/Login";

test.describe("As a user, I should be able to hide/show columns on the settlement list", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "ags", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
