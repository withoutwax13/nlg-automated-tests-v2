import { expect, test } from "@playwright/test";
import DelinquencyGrid from "../../../objects/DelinquencyGrid";
import Login from "../../../utils/Login";

test.describe.skip(
  "As an AGS user, I should be able to view delinquency report of a government.",
  () => {
    test("Initiating test", async ({ page }) => {
      const agsDelinquencyGrid = new DelinquencyGrid(page, {
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });

      await Login.login(page, page, { accountType: "ags", accountIndex: 2 });
      await agsDelinquencyGrid.init();
      await expect(agsDelinquencyGrid.getElement().searchMunicipalityDropdown()).toHaveValue(
        "City of Arrakis"
      );
      await expect(agsDelinquencyGrid.getElement().noRecordFoundComponent()).toHaveCount(0);
    });
  }
);
