import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import FilingGrid from "../../objects/FilingGrid";
import MunicipalityGrid from "../../objects/MunicipalityGrid";
import Login from "../../utils/Login";

const municipalFilingGrid = new FilingGrid({
  userType: "municipal",
});
const randomSeed = Math.floor(Math.random() * 100000);
const municipalityGrid = new MunicipalityGrid({
  userType: "ags",
});

test.describe("As an Municipal user, I should be able to see the custom field on the filing list", () => {
  test("Initiate test", async ({ page }) => {
    await Login.login(page, { accountType: "ags", accountIndex: 3 });
    await municipalityGrid.init();
    await municipalityGrid.selectMunicipality("City of Arrakis");
    await municipalityGrid.addCustomField(
      `Custom Field Title ${randomSeed}`,
      `Custom Field Name ${randomSeed}`
    );
    await logout();
    await Login.login(page, { accountType: "municipal", notFirstLogin: true });
    await municipalFilingGrid.init();
    await expect(await municipalFilingGrid.isColumnExist(`Custom Field Title ${randomSeed}`)).toBeTruthy();
    await logout();
    await Login.login(page, { accountType: "ags", accountIndex: 3, notFirstLogin: true });
    await municipalityGrid.init();
    await municipalityGrid.selectMunicipality("City of Arrakis");
    await municipalityGrid.removeCustomField(`Custom Field Name ${randomSeed}`);
  });
});