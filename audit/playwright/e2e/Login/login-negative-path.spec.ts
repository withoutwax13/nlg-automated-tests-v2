import { test, expect } from "@playwright/test";
import { loginViaUi } from "../../utils/Login";

test.describe("Login Negative Path", () => {
  test("As a user, I should not be able to login with invalid credentials", async ({ page }) => {
    await loginViaUi(page, { kind: "invalid" });

    const emailInput = page.locator('input[name="email"], input[type="email"]').first();

    await expect(emailInput).toHaveCSS("border-color", "rgb(240, 113, 0)");
    await expect(page.locator(".text-error")).toContainText(
      "Incorrect username or password."
    );
    await expect(page).toHaveURL(/\/login/);
  });
});
