import { expect, test } from "@playwright/test";
import DelinquencyGrid from "../../../objects/DelinquencyGrid";
import Login from "../../../utils/Login";

test.describe(
  "As a Municipal user, I should be able to export the delinquency list",
  () => {
    test("Initiating test", async ({ page }) => {
      const delinquencyGrid = new DelinquencyGrid(page, {
        userType: "municipal",
      });

      await Login.login(page, page, { accountType: "municipal" });
      await delinquencyGrid.init();
      await expect(delinquencyGrid.getElement().exportButton()).toBeVisible();
      await expect(delinquencyGrid.getElement().exportButton()).toBeEnabled();
      await delinquencyGrid.clickExportButton();
      await expect(delinquencyGrid.getElement().pageTitle()).toBeVisible();
    });
  }
);
