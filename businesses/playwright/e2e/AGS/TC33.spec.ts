import { test, expect } from '../../support/pwtest';
import BusinessGrid from "../../objects/BusinessGrid";
const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

test.describe("As an AGS, Gov user, I want the system to prevent deleting a business record with filings", () => {
  test("Initiating test", () => {
    pw.login({ accountType: "ags" });
    agsBusinessGrid.init();
    agsBusinessGrid.deleteBusiness("Test Trade Name 50363 1");
    agsBusinessGrid.getElement().noRecordFoundComponent().should("not.exist");
  });
});
