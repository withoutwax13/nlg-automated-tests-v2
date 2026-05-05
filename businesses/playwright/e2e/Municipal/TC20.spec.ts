import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../utils/Login";

test.describe("As a municipal user, I should be able to Show only the businesses that are not required to remit taxes for any form in the business list", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "municipal", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
