import { test, expect } from '../../../support/pwtest';
import DelinquencyGrid from "../../../objects/DelinquencyGrid";

test.describe(
  "As a Municipal user, I should be able to export the delinquency list",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", () => {
      const delinquencyGrid = new DelinquencyGrid({
        userType: "municipal",
      });
      pw.login({ accountType: "municipal" });
      delinquencyGrid.init();
      delinquencyGrid.getElement().exportButton().should("be.visible");
      delinquencyGrid.getElement().exportButton().should("not.be.disabled");
      delinquencyGrid.clickExportButton();
      delinquencyGrid.getElement().pageTitle().should("be.visible");
    });
  }
);
