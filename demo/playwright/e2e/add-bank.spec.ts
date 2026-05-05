import { test, expect } from "@playwright/test";
import { loginViaUi, logoutViaUi, resolveCredentials } from "./utils/auth";

test.describe("As a Taxpayer user, I should be able to save and delete bank account information", () => {
  for (let i = 0; i < 10; i++) {
    test(`Initiating test for account ${i}`, async ({ page }) => {
      const agsCredentials = resolveCredentials({ accountType: "ags", accountIndex: 0 });
      const taxpayerCredentials = resolveCredentials({
        accountType: "taxpayer",
        accountIndex: i,
      });

      test.skip(
        !agsCredentials.username ||
          !agsCredentials.password ||
          !taxpayerCredentials.username ||
          !taxpayerCredentials.password,
        "Missing credentials. Set VALID_CREDENTIALS or TEST_USERNAME/TEST_PASSWORD.",
      );

      await loginViaUi(page, { accountType: "ags", accountIndex: 0 });
      await expect(page).not.toHaveURL(/\/login$/);

      await logoutViaUi(page);

      await loginViaUi(page, {
        accountType: "taxpayer",
        accountIndex: i,
      });
      await expect(page).not.toHaveURL(/\/login$/);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});
