import { test, expect } from '@playwright/test';
test.describe("As a municipal user, I should be able to log into the system using valid username and password.", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "municipal" });
  });
});
