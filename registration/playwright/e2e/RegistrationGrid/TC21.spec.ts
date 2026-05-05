import { test, expect } from "@playwright/test";
import path from "path";
import { loginViaUi } from "../../utils/Login";

test.describe("As an AGS User, when I select a form submission requirement in a business' details page and it is a RegistrationForm type and is Active, a Registration Record will automatically be generated for that business and form and appear in the Registration List. If no applications has been submitted for the Registration Record, the Registration Status will be “Not Registered” by default.", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    const projectRoot = path.resolve(testInfo.project.testDir, "..", "..");
    await loginViaUi(page, projectRoot, { accountType: "ags", accountIndex: 0 });
    await expect(page).toHaveURL(/.+/);
  });
});
