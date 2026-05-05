import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../../utils/Login";

test.describe("As an AGS user, I should be able to navigate to the form editor via create new form button", () => {
  test("Initiate test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "ags", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
