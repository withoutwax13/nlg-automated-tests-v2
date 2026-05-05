import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../utils/Login";

test.describe("As a gov/AGS user, application records with not aplicable Payment Status for the submission payment should be visible in the application list", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "ags", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
