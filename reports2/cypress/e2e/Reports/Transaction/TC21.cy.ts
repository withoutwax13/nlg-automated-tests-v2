import TransactionGrid from "../../../objects/TransactionGrid";

describe(
  "As a municipal user, I should be able to export the transaction report",
  { tags: ["sanity", "regression"] },
  () => {
    it("Initiating test", () => {
      const transactionGrid = new TransactionGrid({
        userType: "municipal",
      });
      cy.login({ accountType: "municipal", accountIndex: 6 });
      transactionGrid.init();
      transactionGrid.getElement().exportButton().should("be.visible");
      transactionGrid.getElement().exportButton().should("not.be.disabled");
      transactionGrid.clickExportButton();
      transactionGrid.getElement().pageTitle().should("be.visible");
    });
  }
);
