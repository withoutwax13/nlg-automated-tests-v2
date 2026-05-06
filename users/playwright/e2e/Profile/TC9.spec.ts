import { expect, test } from "@playwright/test";
import Profile from "../../objects/Profile";
import { bindRuntime, getValidCredentials, login, logout } from "../../support/runtime";
import Login from "../../utils/Login";

const profile = new Profile();

test.describe("As a taxpayer user, I should be able to reset my password.", () => {
  test("Initiating test", async ({ page, request }) => {
    bindRuntime(page, request);
    const accountPassword = getValidCredentials().taxpayer[4].password;
    await Login.login({ accountType: "taxpayer", accountIndex: 4 });
    await profile.init();
    await profile.clickResetPassword();
    await profile.typeOldPassword(accountPassword);
    await profile.typeNewPassword(accountPassword);
    await profile.typeConfirmPassword(accountPassword);
    await profile.clickUpdatePasswordButton();
    await expect(profile.getElement().toastComponent()).toBeVisible();
    await logout();
    await Login.login({ accountType: "taxpayer", accountIndex: 4, notFirstLogin: true });
  });
});