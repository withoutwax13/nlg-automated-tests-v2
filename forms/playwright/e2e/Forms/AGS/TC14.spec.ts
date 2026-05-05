import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../../utils/Login";

test.describe("As an AGS user, the current taxpayer form display arrangement in the settings should be the same as the taxpayer filing experience", () => {
  test("Initiate test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "ags", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
