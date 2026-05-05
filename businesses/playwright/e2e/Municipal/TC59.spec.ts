import { test, expect } from '../../support/pwtest';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const municipalBusinessGrid = new BusinessGrid({
  userType: "municipal",
});
const municipalBusinessDetails = new BusinessDetails({ userType: "municipal" });
const randomSeed = Math.floor(Math.random() * 100000);

test.describe("As a municipal user, I should be able to upload documents to a business via the business details page", () => {
  test("Initiating test", () => {
    pw.login({ accountType: "municipal", accountIndex: 9 });
    municipalBusinessGrid.init();
    municipalBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    municipalBusinessDetails.clickDocumentsTab();
    municipalBusinessDetails.uploadDocument(`${randomSeed}example.json`);
  });
});
