import { test, expect } from '../../support/pwtest';
import FilingGrid from "../../objects/FilingGrid";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

test.describe("As an AGS user, I should be able to view requested extract.", () => {
  test("Initiate test", () => {
    pw.login({ accountType: "ags", accountIndex: 8 });
    agsFilingGrid.init();
    agsFilingGrid.clickViewRequestedExtractButton();
    pw.url().should("include", "/filingsExtractRequests?");
  });
});
