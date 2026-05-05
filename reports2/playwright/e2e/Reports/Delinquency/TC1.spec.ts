import { expect, test } from "@playwright/test";
import DelinquencyGrid from "../../../objects/DelinquencyGrid";
import Login from "../../../utils/Login";

test.describe(
  "As an AGS user, I should be able to export delinquency report of a government.",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", async ({ page }) => {
      const delinquencyGrid = new DelinquencyGrid(page, {
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });

      await Login.login(page, { accountType: "ags" });
      await delinquencyGrid.init();
      await expect(delinquencyGrid.getElement().exportButton()).toBeVisible();
      await expect(delinquencyGrid.getElement().exportButton()).toBeEnabled();
      await delinquencyGrid.clickExportButton();
      await delinquencyGrid.getElement().pageTitle().scrollIntoViewIfNeeded();
      await expect(delinquencyGrid.getElement().pageTitle()).toBeVisible();
    });
  }
);
