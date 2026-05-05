import { test, expect } from '../../../support/pwtest';
import DelinquencyGrid from "../../../objects/DelinquencyGrid";

test.describe(
  "As an AGS user, I should be able to export delinquency report of a government.",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", () => {
      const delinquencyGrid = new DelinquencyGrid({
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });
      pw.login({ accountType: "ags" });
      delinquencyGrid.init();
      delinquencyGrid.getElement().exportButton().should("be.visible");
      delinquencyGrid.getElement().exportButton().should("not.be.disabled");
      delinquencyGrid.clickExportButton();
      delinquencyGrid.getElement().pageTitle().scrollIntoView();
      delinquencyGrid.getElement().pageTitle().should("be.visible");
    });
  }
);
