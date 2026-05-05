import { test, expect } from '../../support/pwtest';
test.describe("Login Negative Path", () => {
    test("As a user, I should not be able to login with invalid credentials", () => {
        pw.login({ manualAuth: true});
        pw.get('input[name="email"]').should("have.css", "border-color", "rgb(240, 113, 0)");
        pw.get(".text-error").contains("Incorrect username or password.").should("be.visible");
        pw.location("pathname").should("eq", "/login");
    });
  });
  