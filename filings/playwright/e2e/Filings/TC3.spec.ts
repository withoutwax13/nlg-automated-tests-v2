import { test, expect } from '@playwright/test';
import MunicipalityGrid from "../../objects/MunicipalityGrid";

const randomSeed = Math.floor(Math.random() * 100000);
const municipalityGrid = new MunicipalityGrid({
  userType: "ags",
});

test.describe.skip("As an AGS user, I should be able to remove the custom field on the filing list", () => {
  test("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 2 });
    municipalityGrid.init();
    municipalityGrid.selectMunicipality("City of Arrakis");
    municipalityGrid.addCustomField(
      `Custom Field Title ${randomSeed}`,
      `Custom Field Name ${randomSeed}`
    );
    cy.logout();
    cy.login({ accountType: "ags", accountIndex: 2, notFirstLogin: true });
    municipalityGrid.init();
    municipalityGrid.selectMunicipality("City of Arrakis");
    municipalityGrid.removeCustomField(`Custom Field Name ${randomSeed}`);
  });
});
