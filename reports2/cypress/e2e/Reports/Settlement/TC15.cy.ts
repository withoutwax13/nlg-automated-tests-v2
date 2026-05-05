import SettlementGrid from "../../../objects/SettlementGrid";

describe(
  "As a municipal user, I should be able to export a settlement report",
  { tags: ["sanity", "regression"] },
  () => {
    it("Initiating test", () => {
      const settlementGrid = new SettlementGrid({
        userType: "municipal",
      });
      cy.login({ accountType: "municipal", accountIndex: 4 });
      settlementGrid.init();
      settlementGrid.getElement().exportButton().should("be.visible");
      settlementGrid.getElement().exportButton().should("not.be.disabled");
      settlementGrid.clickExportButton();
      settlementGrid.getElement().pageTitle().should("be.visible");
    });
  }
);
