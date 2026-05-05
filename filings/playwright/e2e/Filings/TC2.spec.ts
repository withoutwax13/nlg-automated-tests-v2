import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
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
  test("Initiate test", async ({ page }) => {
    await login({ accountType: "ags", accountIndex: 1 });
    await municipalityGrid.init();
    await municipalityGrid.selectMunicipality("City of Arrakis");
    await municipalityGrid.addCustomField(
      `Custom Field Title ${randomSeed}`,
      `Custom Field Name ${randomSeed}`
    );
    await logout();
    await login({ accountType: "ags", notFirstLogin: true, accountIndex: 1 });
    await agsFilingGrid.init();
    await expect(await agsFilingGrid.isColumnExist(`Custom Field Title ${randomSeed}`)).toBeTruthy();
    await logout();
    await login({ accountType: "ags", notFirstLogin: true, accountIndex: 1 });
    await municipalityGrid.init();
    await municipalityGrid.selectMunicipality("City of Arrakis");
    await municipalityGrid.removeCustomField(`Custom Field Name ${randomSeed}`);
  });
});
