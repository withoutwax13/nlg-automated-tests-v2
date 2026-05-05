import { test, expect } from '@playwright/test';
import Profile from "../../objects/Profile";
import { TAXPAYER_DEFAULT_HOME_PAGE as pageOptions } from "../../objects/Profile";

const profile = new Profile();

test.describe("As a taxpayer user, I should be able to set my default home page", () => {
  test("Initiating test", () => {
    cy.login({
      accountType: "taxpayer",
      accountIndex: 10,
      customRedirectionAfterLoginAssertion: () =>
        cy.url().should("contain", "/"),
    });
    Object.keys(pageOptions).forEach((page) => {
      profile.init();
      profile.selectDefaultHomePage(page);
      cy.logout();
      cy.login({
        accountType: "taxpayer",
        accountIndex: 10,
        notFirstLogin: true,
        customRedirectionAfterLoginAssertion: () =>
          cy.url().should("contain", pageOptions[page]),
      });
    });
  });
});
