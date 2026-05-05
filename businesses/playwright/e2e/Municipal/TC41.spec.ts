import { test, expect } from '../../support/pwtest';
import BusinessGrid from "../../objects/BusinessGrid";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user, the default filter for the business list should be the Operating Status", () => {
  test("Initiating test", () => {
    pw.login({ accountType: "municipal" });
    municipalBusinessGrid.init();
    municipalBusinessGrid.getElement().activeFilterChipsLabel().should("exist");
    municipalBusinessGrid
      .getElement()
      .activeFilterChip("Operating Status")
      .should("exist");
  });
});
