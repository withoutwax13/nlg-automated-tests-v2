import { test, expect } from '../../support/pwtest';
test.describe("As an IAIL user, I should be able to log into the system using valid username and password.", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "iail", accountIndex: 1 });
  });
});
