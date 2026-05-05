import { expect, test } from "@playwright/test";
import DelinquencyGrid from "../../../objects/DelinquencyGrid";
import Login from "../../../utils/Login";

test.describe.skip(
  "As a municipal user, I should be able to view delinquency report.",
  { tags: ["regression"] },
  () => {
    test("Initiating test", async ({ page }) => {
      const municipalityDelinquencyGrid = new DelinquencyGrid(page, {
        userType: "municipal",
      });

      await Login.login(page, { accountType: "municipality", accountIndex: 2 });
      await municipalityDelinquencyGrid.init();
      await expect(municipalityDelinquencyGrid.getElement().noRecordFoundComponent()).toHaveCount(0);
    });
  }
);
