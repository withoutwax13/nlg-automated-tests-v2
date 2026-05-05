import { test, expect } from '../../support/pwtest';
import Profile from "../../objects/Profile";
import { TAXPAYER_DEFAULT_HOME_PAGE as pageOptions } from "../../objects/Profile";

const profile = new Profile();

test.describe("As a taxpayer user, I should be able to set my default home page", () => {
  test("Initiating test", () => {
    pw.login({
      accountType: "taxpayer",
      accountIndex: 10,
      customRedirectionAfterLoginAssertion: () =>
        pw.url().should("contain", "/"),
    });
    Object.keys(pageOptions).forEach((page) => {
      profile.init();
      profile.selectDefaultHomePage(page);
      pw.logout();
      pw.login({
        accountType: "taxpayer",
        accountIndex: 10,
        notFirstLogin: true,
        customRedirectionAfterLoginAssertion: () =>
          pw.url().should("contain", pageOptions[page]),
      });
    });
  });
});
