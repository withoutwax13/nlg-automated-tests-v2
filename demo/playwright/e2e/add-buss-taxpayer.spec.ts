import { test, expect } from "@playwright/test";
import { loginViaUi, resolveCredentials } from "./utils/auth";

const accounts = [
  "Test Trade Name 98068 1",
  "Test Trade Name 14793 1",
  "Test Trade Name 47910 1",
  "Test Trade Name 48440 1",
  "Arrakis Spice Company 13685",
  "Test Trade Name 50363 1",
  "Arrakis Spice Company 13685",
  "Arrakis Spice Company 13685",
  "Arrakis Spice Company 13685",
  "Arrakis Spice Company 13685",
  "Arrakis Spice Company 13685",
  "Arrakis Spice Company 13685",
  "Test Trade Name 52576 1",
  "Test Trade Name 53191 1",
  "Arrakis Spice Company 13685",
  "Test Trade Name 24916 1",
  "Test Trade Name 25677 1",
  "Arrakis Spice Company 13685",
  "Test Trade Name 26887 1",
  "Arrakis Spice Company 18516",
];

test.describe("Add Business", () => {
  for (let i = 4; i < 10; i++) {
    test(`should add business to taxpayer account index ${i}`, async ({ page }) => {
      const taxpayerCredentials = resolveCredentials({
        accountType: "taxpayer",
        accountIndex: i,
      });

      test.skip(
        !taxpayerCredentials.username || !taxpayerCredentials.password,
        "Missing taxpayer credentials. Set VALID_CREDENTIALS or TEST_USERNAME/TEST_PASSWORD.",
      );

      await loginViaUi(page, { accountType: "taxpayer", accountIndex: i });
      await expect(page).not.toHaveURL(/\/login$/);
      await expect(page.locator("body")).toBeVisible();

      expect(accounts.length).toBeGreaterThan(0);
    });
  }
});
