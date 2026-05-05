import { test, expect } from '../../support/pwtest';
test.describe("Login Negative Path", () => {
    test("As a user, I should not be able to login with invalid credentials", () => {
        cy.login({ manualAuth: true});
        cy.get('input[name="email"]').should("have.css", "border-color", "rgb(240, 113, 0)");
        cy.get(".text-error").contains("Incorrect username or password.").should("be.visible");
        cy.location("pathname").should("eq", "/login");
    });
  });
  