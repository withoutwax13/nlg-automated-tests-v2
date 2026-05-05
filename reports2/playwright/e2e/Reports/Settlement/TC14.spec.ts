import { test, expect } from '../../../support/pwtest';
import SettlementGrid from "../../../objects/SettlementGrid";

test.describe(
  "As an AGS user, I should be able to export a settlement report of a government.",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", () => {
      const settlementGrid = new SettlementGrid({
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });
      cy.login({ accountType: "ags", accountIndex: 4 });
      settlementGrid.init();
      settlementGrid.getElement().exportButton().should("be.visible");
      settlementGrid.getElement().exportButton().should("not.be.disabled");
      settlementGrid.clickExportButton();
      settlementGrid.getElement().pageTitle().should("be.visible");
    });
  }
);
