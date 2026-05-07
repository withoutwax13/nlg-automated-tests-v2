import { expect, test } from "@playwright/test";
import { expectPathname, login, logout } from "../../support/native-helpers";
import Login from "../../utils/Login";

test.describe("Login Happy Path", () => {
  test("As a user, I should be able to login with valid credentials", async ({ page }) => {
    await Login.login(page, page);
    await expectPathname(page, "/cases");
    await expect(page.getByRole("heading", { level: 3, name: "Case Management" })).toBeVisible();
  });

  test("As a user, I should be able to logout", async ({ page }) => {
    await Login.login(page, page);
    await expectPathname(page, "/cases");
    await expect(page.getByRole("heading", { level: 3, name: "Case Management" })).toBeVisible();

    await logout(page);
    await expectPathname(page, "/login");
  });
});