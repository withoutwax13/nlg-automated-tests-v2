import { test, expect } from '../../support/pwtest';
import FilingGrid from "../../objects/FilingGrid";
import MunicipalityGrid from "../../objects/MunicipalityGrid";

const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});
const randomSeed = Math.floor(Math.random() * 100000);
const municipalityGrid = new MunicipalityGrid({
  userType: "ags",
});

test.describe("As an AGS user, I should be able to see the custom field on the filing list", () => {
  test("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 1 });
    municipalityGrid.init();
    municipalityGrid.selectMunicipality("City of Arrakis");
    municipalityGrid.addCustomField(
      `Custom Field Title ${randomSeed}`,
      `Custom Field Name ${randomSeed}`
    );
    cy.logout();
    cy.login({ accountType: "ags", notFirstLogin: true, accountIndex: 1 });
    agsFilingGrid.init();
    agsFilingGrid.isColumnExist(`Custom Field Title ${randomSeed}`, "isCustomFieldExist");
    cy.get("@isCustomFieldExist").should("be.true");
    cy.logout();
    cy.login({ accountType: "ags", notFirstLogin: true, accountIndex: 1 });
    municipalityGrid.init();
    municipalityGrid.selectMunicipality("City of Arrakis");
    municipalityGrid.removeCustomField(`Custom Field Name ${randomSeed}`);
  });
});
