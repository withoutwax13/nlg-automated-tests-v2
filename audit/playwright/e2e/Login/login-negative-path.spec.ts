import { expect, test } from "@playwright/test";
import { expectPathname, login } from "../../support/native-helpers";

test.describe("Login Negative Path", () => {
  test("As a user, I should not be able to login with invalid credentials", async ({ page }) => {
    await login(page, { manualAuth: true });

    await expect(page.locator('input[name="email"]')).toHaveCSS(
      "border-color",
      "rgb(240, 113, 0)"
    );
    await expect(page.locator(".text-error").getByText("Incorrect username or password.")).toBeVisible();
    await expectPathname(page, "/login");
  });
});
