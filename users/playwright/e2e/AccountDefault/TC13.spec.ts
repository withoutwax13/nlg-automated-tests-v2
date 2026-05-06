import { expect, test } from "@playwright/test";
import Profile, { MUNICIPAL_DEFAULT_HOME_PAGE as pageOptions } from "../../objects/Profile";
import { bindRuntime, login, logout } from "../../support/runtime";
import Login from "../../utils/Login";

const profile = new Profile();

test.describe("As a municipal user, I should be able to set my default home page", () => {
  test("Initiating test", async ({ page, request }) => {
    bindRuntime(page, request);
    await Login.login({
      accountType: "municipal",
      accountIndex: 10,
      customRedirectionAfterLoginAssertion: async () => {
        await expect(page).toHaveURL(/filingApp\/filingList$/);
      },
    });

    for (const pageName of Object.keys(pageOptions)) {
      await profile.init();
      await profile.selectDefaultHomePage(pageName);
      await logout();
      await Login.login({
        accountType: "municipal",
        accountIndex: 10,
        notFirstLogin: true,
        customRedirectionAfterLoginAssertion: async () => {
          await expect(page).toHaveURL(new RegExp(`${pageOptions[pageName].replace(/\//g, "\\/")}`));
        },
      });
    }
  });
});