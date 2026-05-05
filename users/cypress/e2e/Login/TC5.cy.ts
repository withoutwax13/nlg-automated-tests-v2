describe("As an IATX user, I should be able to log into the system using valid username and password.", () => {
  it("Initiating test", () => {
    cy.login({ accountType: "iatx", accountIndex: 2 });
  });
});
