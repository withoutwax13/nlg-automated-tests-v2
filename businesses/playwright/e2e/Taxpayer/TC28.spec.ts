import { test, expect } from '../../support/pwtest';
import BusinessGrid from "../../objects/BusinessGrid";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

// Skipped, assertions in TC38
test.describe.skip("As a taxpayer user, I should be able to view business details.", () => {
  test("Initiating test", () => {
    pw.login({ accountType: "taxpayer", accountIndex: 7 });
    taxpayerBusinessList.init();
    taxpayerBusinessList.viewBusinessDetails("Arrakis Spice Company 13685");
    pw.url().should("include", "/BusinessesApp/BusinessDetails/");
  });
});
