import { test, expect } from '@playwright/test';
import Profile from "../../objects/Profile";

const profile = new Profile();
test.describe("As a ags user, I should be able to reset my password.", () => {
  test("Initiating test", () => {
    const accountPassword = Cypress.env("validCredentials").ags[3].password;
    cy.login({ accountType: "ags", accountIndex: 3 });
    profile.init();
    profile.clickResetPassword();
    profile.typeOldPassword(accountPassword);
    profile.typeNewPassword(accountPassword);
    profile.typeConfirmPassword(accountPassword);
    profile.clickUpdatePasswordButton();
    profile.getElement().toastComponent().should("exist");

    cy.logout();
    cy.login({ accountType: "ags", accountIndex: 3, notFirstLogin: true });
  });
});
