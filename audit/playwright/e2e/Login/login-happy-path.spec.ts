import { test, expect } from "@playwright/test";
import { loginViaUi, logoutViaUi } from "../../utils/Login";

test.describe("Login Happy Path", () => {
  test("As a user, I should be able to login with valid credentials", async ({ page }) => {
    await loginViaUi(page, { kind: "valid" });

    await expect(page).toHaveURL(/\/cases/);
    await expect(page.locator("h3", { hasText: "Case Management" })).toBeVisible();
  });

  test("As a user, I should be able to logout", async ({ page }) => {
    await loginViaUi(page, { kind: "valid" });

    await expect(page).toHaveURL(/\/cases/);
    await expect(page.locator("h3", { hasText: "Case Management" })).toBeVisible();

    await logoutViaUi(page);
    await expect(page).toHaveURL(/\/login/);
  });
});
