import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });
const randomSeed = Math.floor(Math.random() * 100000);

describe("As a ags user, I should be able to upload documents to a business via the business details page", () => {
  it("Initiating test", () => {
    cy.login({ accountType: "ags", accountIndex: 8 });
    agsBusinessGrid.init();
    agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13685");
    agsBusinessDetails.clickDocumentsTab();
    agsBusinessDetails.uploadDocument(`${randomSeed}example.json`);
  });
});
