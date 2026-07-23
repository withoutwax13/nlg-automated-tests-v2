import { expect, test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import MunicipalityGrid from "../../objects/MunicipalityGrid";
import { GOVERNMENT, loginFresh } from "../helpers/filing-workflows";

test.describe("As an AGS user, I should be able to see the custom field on the filing list", () => {
  test("Initiate test", async ({ page }) => {
    const customField = `Playwright Field ${Date.now()}`;
    const municipalityGrid = new MunicipalityGrid(page);

    try {
      await loginFresh(page, { accountType: "ags", accountIndex: 3, notFirstLogin: true });
      await municipalityGrid.init();
      await municipalityGrid.selectMunicipality(GOVERNMENT);
      await municipalityGrid.addCustomField(GOVERNMENT, customField);

      const filingGrid = new FilingGrid(page, {
        userType: "ags",
        municipalitySelection: GOVERNMENT,
      });
      await filingGrid.init();
      expect(await filingGrid.isColumnExist(customField)).toBeTruthy();
    } finally {
      await loginFresh(page, { accountType: "ags", accountIndex: 3, notFirstLogin: true });
      await municipalityGrid.init();
      await municipalityGrid.selectMunicipality(GOVERNMENT);
      await municipalityGrid.removeCustomField(GOVERNMENT, customField).catch(() => undefined);
    }
  });
});
