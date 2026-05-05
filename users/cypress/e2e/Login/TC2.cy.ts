describe("As a municipal user, I should be able to log into the system using valid username and password.", () => {
  it("Initiating test", () => {
    cy.login({ accountType: "municipal" });
  });
});
