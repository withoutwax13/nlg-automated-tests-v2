import { test, expect } from '../../../support/pwtest';
import TransactionGrid from "../../../objects/TransactionGrid";

test.describe(
  "As an AGS, I should be able to export the transaction report of a government",
  
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", () => {
      const transactionGrid = new TransactionGrid({
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });
      pw.login({ accountType: "ags", accountIndex: 6 });
      transactionGrid.init();
      transactionGrid.getElement().exportButton().should("be.visible");
      transactionGrid.getElement().exportButton().should("not.be.disabled");
      transactionGrid.clickExportButton();
      transactionGrid.getElement().pageTitle().should("be.visible");
    });
  }
);
