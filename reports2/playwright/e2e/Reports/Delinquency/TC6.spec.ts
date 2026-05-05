import { test, expect } from '../../../support/pwtest';
import DelinquencyGrid from "../../../objects/DelinquencyGrid";

test.describe.skip(
  "As a municipal user, I should be able to view delinquency report.",
  { tags: ["regression"] },
  () => {
    test("Initiating test", () => {
      const municipalityDelinquencyGrid = new DelinquencyGrid({
        userType: "municipality",
      });
      pw.login({ accountType: "municipality", accountIndex: 2 });
      municipalityDelinquencyGrid.init();
      municipalityDelinquencyGrid
        .getElement()
        .noRecordFoundComponent()
        .should("not.exist");
    });
  }
);
