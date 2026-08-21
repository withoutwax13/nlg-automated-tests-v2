import { expect, test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import MunicipalityGrid from "../../objects/MunicipalityGrid";
import MunicipalityDetails from "../../objects/MunicipalityDetails";
import { GOVERNMENT, loginFresh } from "../helpers/filing-workflows";

test.describe("As an AGS user, I should be able to see the custom field on the filing list", () => {
  test("As an AGS user, I should be able to see the custom field on the filing list", { tag: ["@slot-00", "@ags", "@municipal"] }, async ({ page, resourceSlot }) => {
    const customField = {
      title: `title ${resourceSlot.id} ${Date.now()}`,
      name: `name ${resourceSlot.id} ${Date.now()}`,
      type: "text"
    };
    const municipalityGrid = new MunicipalityGrid(page);
    const municipalityDetails = new MunicipalityDetails(page);

    try {
      await loginFresh(page, resourceSlot, { accountType: "ags", notFirstLogin: true });
      await municipalityGrid.init();
      await municipalityGrid.selectMunicipality(GOVERNMENT);
      await municipalityDetails.addCustomField(customField.title, customField.name, customField.type);

      await loginFresh(page, resourceSlot, { accountType: "municipal", notFirstLogin: true });
      const municipalFilingGrid = new FilingGrid(page, { userType: "municipal" });
      await municipalFilingGrid.init();
      expect(await municipalFilingGrid.isColumnExist(customField.title)).toBeTruthy();
    } finally {
      await loginFresh(page, resourceSlot, { accountType: "ags", notFirstLogin: true });
      await municipalityGrid.init();
      await municipalityGrid.selectMunicipality(GOVERNMENT);
      await municipalityDetails.removeCustomField(customField.title, customField.name, customField.type);
    }
  });
});
