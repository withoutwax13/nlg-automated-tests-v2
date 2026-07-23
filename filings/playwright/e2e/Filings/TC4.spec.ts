import { expect, test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import MunicipalityGrid from "../../objects/MunicipalityGrid";
import { GOVERNMENT, loginFresh } from "../helpers/filing-workflows";

test.describe("As an Municipal user, I should be able to see the custom field on the filing list", () => {
  test("Initiate test", async ({ page }) => {
    const customField = `Playwright Municipal Field ${Date.now()}`;
    const municipalityGrid = new MunicipalityGrid(page);

    try {
      await loginFresh(page, { accountType: "ags", accountIndex: 3, notFirstLogin: true });
      await municipalityGrid.init();
      await municipalityGrid.selectMunicipality(GOVERNMENT);
      await municipalityGrid.addCustomField(GOVERNMENT, customField);

      await loginFresh(page, { accountType: "municipal", notFirstLogin: true });
      const municipalFilingGrid = new FilingGrid(page, { userType: "municipal" });
      await municipalFilingGrid.init();
      expect(await municipalFilingGrid.isColumnExist(customField)).toBeTruthy();
    } finally {
      await loginFresh(page, { accountType: "ags", accountIndex: 3, notFirstLogin: true });
      await municipalityGrid.init();
      await municipalityGrid.selectMunicipality(GOVERNMENT);
      await municipalityGrid.removeCustomField(GOVERNMENT, customField).catch(() => undefined);
    }
  });
});
