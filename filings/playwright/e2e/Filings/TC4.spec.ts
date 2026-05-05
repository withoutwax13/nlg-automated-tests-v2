import { test, expect } from '../../support/pwtest';
import FilingGrid from "../../objects/FilingGrid";
import MunicipalityGrid from "../../objects/MunicipalityGrid";

const municipalFilingGrid = new FilingGrid({
  userType: "municipal",
});
const randomSeed = Math.floor(Math.random() * 100000);
const municipalityGrid = new MunicipalityGrid({
  userType: "ags",
});

test.describe("As an Municipal user, I should be able to see the custom field on the filing list", () => {
  test("Initiate test", () => {
    pw.login({ accountType: "ags", accountIndex: 3 });
    municipalityGrid.init();
    municipalityGrid.selectMunicipality("City of Arrakis");
    municipalityGrid.addCustomField(
      `Custom Field Title ${randomSeed}`,
      `Custom Field Name ${randomSeed}`
    );
    pw.logout();
    pw.login({ accountType: "municipal", notFirstLogin: true });
    municipalFilingGrid.init();
    municipalFilingGrid.isColumnExist(
      `Custom Field Title ${randomSeed}`,
      "isCustomFieldExist"
    );
    pw.get("@isCustomFieldExist").should("be.true");
    pw.logout();
    pw.login({ accountType: "ags", accountIndex: 3, notFirstLogin: true });
    municipalityGrid.init();
    municipalityGrid.selectMunicipality("City of Arrakis");
    municipalityGrid.removeCustomField(`Custom Field Name ${randomSeed}`);
  });
});
