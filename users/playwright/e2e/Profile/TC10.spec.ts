import { expect, test } from "@playwright/test";
import Profile from "../../objects/Profile";
import { bindRuntime, getValidCredentials, login, logout } from "../../support/runtime";

const profile = new Profile();

test.describe("As a municipal user, I should be able to reset my password.", () => {
  test("Initiating test", async ({ page, request }) => {
    bindRuntime(page, request);
    const accountPassword = getValidCredentials().municipal[3].password;
    await login({ accountType: "municipal", accountIndex: 3 });
    await profile.init();
    await profile.clickResetPassword();
    await profile.typeOldPassword(accountPassword);
    await profile.typeNewPassword(accountPassword);
    await profile.typeConfirmPassword(accountPassword);
    await profile.clickUpdatePasswordButton();
    await expect(profile.getElement().toastComponent()).toBeVisible();
    await logout();
    await login({ accountType: "municipal", accountIndex: 3, notFirstLogin: true });
  });
});
