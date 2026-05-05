import MunicipalityGrid from "../../objects/MunicipalityGrid";

const randomSeed = Math.floor(Math.random() * 100000);
const municipalityGrid = new MunicipalityGrid({
  userType: "ags",
});

describe.skip("As an AGS user, I should be able to add a custom field on the filing list", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "ags" });
    municipalityGrid.init();
    municipalityGrid.selectMunicipality("City of Arrakis");
    municipalityGrid.addCustomField(
      `Custom Field Title ${randomSeed}`,
      `Custom Field Name ${randomSeed}`
    );
    cy.logout();
    cy.login({ accountType: "ags", notFirstLogin: true });
    municipalityGrid.init();
    municipalityGrid.selectMunicipality("City of Arrakis");
    municipalityGrid.removeCustomField(`Custom Field Name ${randomSeed}`);
  });
});
