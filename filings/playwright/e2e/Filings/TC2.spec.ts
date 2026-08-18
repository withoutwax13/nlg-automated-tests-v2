import { expect, test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import MunicipalityGrid from "../../objects/MunicipalityGrid";
import MunicipalityDetails from "../../objects/MunicipalityDetails";
import { GOVERNMENT, loginFresh } from "../helpers/filing-workflows";

test.describe("As an AGS user, I should be able to see the custom field on the filing list", () => {
  test("Initiate test", async ({ page }) => {
    const customField = {
      title: `title ${Date.now()}`,
      name: `name ${Date.now()}`,
      type: "text"
    };
    const municipalityGrid = new MunicipalityGrid(page);
    const municipalityDetails = new MunicipalityDetails(page);

    try {
      await loginFresh(page, { accountType: "ags", accountIndex: 3, notFirstLogin: true });
      await municipalityGrid.init();
      await municipalityGrid.selectMunicipality(GOVERNMENT);
      await municipalityDetails.addCustomField(customField.title, customField.name, customField.type);

      await loginFresh(page, { accountType: "municipal", notFirstLogin: true, accountIndex: 2 });
      const municipalFilingGrid = new FilingGrid(page, { userType: "municipal" });
      await municipalFilingGrid.init();
      expect(await municipalFilingGrid.isColumnExist(customField.title)).toBeTruthy();
    } finally {
      await loginFresh(page, { accountType: "ags", accountIndex: 3, notFirstLogin: true });
      await municipalityGrid.init();
      await municipalityGrid.selectMunicipality(GOVERNMENT);
      await municipalityDetails.removeCustomField(customField.title, customField.name, customField.type);
    }
  });
});
