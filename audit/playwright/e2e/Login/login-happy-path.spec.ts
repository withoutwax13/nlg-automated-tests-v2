import { test, expect } from '../../support/pwtest';
test.describe("Login Happy Path", () => {
  test("As a user, I should be able to login with valid credentials", () => {
    pw.login();
    pw.location("pathname").should("eq", "/cases");
    pw.get("h3").contains("Case Management").should("be.visible");
  });
  test("As a user, I should be able to logout", () => {
    pw.login();
    pw.location("pathname").should("eq", "/cases");
    pw.get("h3").contains("Case Management").should("be.visible");
    pw.logout();
    pw.location("pathname").should("eq", "/login");
  });
});
