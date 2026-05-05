import { test, expect } from '@playwright/test';
import Profile from "../../objects/Profile";

const profile = new Profile();
test.describe("As a taxpayer user, I should be able to reset my password.", () => {
  test("Initiating test", () => {
    const accountPassword =
      Cypress.env("validCredentials").taxpayer[4].password;
    cy.login({ accountType: "taxpayer", accountIndex: 4 });
    profile.init();
    profile.clickResetPassword();
    profile.typeOldPassword(accountPassword);
    profile.typeNewPassword(accountPassword);
    profile.typeConfirmPassword(accountPassword);
    profile.clickUpdatePasswordButton();
    profile.getElement().toastComponent().should("exist");

    cy.logout();
    cy.login({ accountType: "taxpayer", accountIndex: 4, notFirstLogin: true });
  });
});
