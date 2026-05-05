import { test, expect } from '../../support/pwtest';
import Profile from "../../objects/Profile";

const profile = new Profile();
test.describe("As a municipal user, I should be able to reset my password.", () => {
  test("Initiating test", () => {
    const acountPassword =
      Cypress.env("validCredentials").municipal[3].password;
    cy.login({ accountType: "municipal", accountIndex: 3 });
    profile.init();
    profile.clickResetPassword();
    profile.typeOldPassword(acountPassword);
    profile.typeNewPassword(acountPassword);
    profile.typeConfirmPassword(acountPassword);
    profile.clickUpdatePasswordButton();
    profile.getElement().toastComponent().should("exist");

    cy.logout();
    cy.login({
      accountType: "municipal",
      accountIndex: 3,
      notFirstLogin: true,
    });
  });
});
