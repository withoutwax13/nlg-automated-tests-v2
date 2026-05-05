import { expect, test } from "@playwright/test";
import Profile, { TAXPAYER_DEFAULT_HOME_PAGE as pageOptions } from "../../objects/Profile";
import { bindRuntime, login, logout } from "../../support/runtime";

const profile = new Profile();

test.describe("As a taxpayer user, I should be able to set my default home page", () => {
  test("Initiating test", async ({ page, request }) => {
    bindRuntime(page, request);
    await login({
      accountType: "taxpayer",
      accountIndex: 10,
      customRedirectionAfterLoginAssertion: async () => {
        await expect(page).toHaveURL(/\/$/);
      },
    });

    for (const pageName of Object.keys(pageOptions)) {
      await profile.init();
      await profile.selectDefaultHomePage(pageName);
      await logout();
      await login({
        accountType: "taxpayer",
        accountIndex: 10,
        notFirstLogin: true,
        customRedirectionAfterLoginAssertion: async () => {
          await expect(page).toHaveURL(new RegExp(`${pageOptions[pageName].replace(/\//g, "\\/")}`));
        },
      });
    }
  });
});
