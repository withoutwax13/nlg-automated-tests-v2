import { test, expect } from '../../../support/pwtest';
import DelinquencyGrid from "../../../objects/DelinquencyGrid";

test.describe.skip(
  "As an AGS user, I should be able to view delinquency report of a government.",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", () => {
      const agsDelinquencyGrid = new DelinquencyGrid({
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });
      pw.login({ accountType: "ags", accountIndex: 2 });
      agsDelinquencyGrid.init();
      agsDelinquencyGrid
        .getElement()
        .searchMunicipalityDropdown()
        .should("have.value", "City of Arrakis");
      agsDelinquencyGrid
        .getElement()
        .noRecordFoundComponent()
        .should("not.exist");
    });
  }
);
