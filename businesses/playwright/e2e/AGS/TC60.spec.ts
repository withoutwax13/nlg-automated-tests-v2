import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });
const randomSeed = Math.floor(Math.random() * 100000);

test.describe("As a ags user, I should be able to upload documents to a business via the business details page", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "ags", accountIndex: 8 });
    agsBusinessGrid.init();
    agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    agsBusinessDetails.clickDocumentsTab();
    agsBusinessDetails.uploadDocument(`${randomSeed}example.json`);
  });
});