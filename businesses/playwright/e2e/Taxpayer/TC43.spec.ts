import { test, expect } from '../../support/pwtest';
import BusinessGrid from "../../objects/BusinessGrid";

const taxpayerBusinessGrid = new BusinessGrid({ userType: "taxpayer" });

test.describe("As a taxpayer user, there should not be any default filter in the business list", () => {
  test("Initiating test", () => {
    pw.login({ accountType: "taxpayer", accountIndex: 2 });
    taxpayerBusinessGrid.init();
    taxpayerBusinessGrid
      .isGridFiltered()
      .then(isFiltered => {
        expect(isFiltered).to.be.false;
      });
  });
});
