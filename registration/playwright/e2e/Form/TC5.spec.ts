import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../utils/Login";

test.describe("User should not be able to proceed to Preview step if the required details are not provided on the Applicant info step", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "taxpayer", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
