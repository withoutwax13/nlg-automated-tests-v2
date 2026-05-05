describe("Login Happy Path", () => {
  it("As a user, I should be able to login with valid credentials", () => {
    cy.login();
    cy.location("pathname").should("eq", "/cases");
    cy.get("h3").contains("Case Management").should("be.visible");
  });
  it("As a user, I should be able to logout", () => {
    cy.login();
    cy.location("pathname").should("eq", "/cases");
    cy.get("h3").contains("Case Management").should("be.visible");
    cy.logout();
    cy.location("pathname").should("eq", "/login");
  });
});
