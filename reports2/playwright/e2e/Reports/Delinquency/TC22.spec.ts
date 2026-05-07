import { expect, test } from "@playwright/test";
import DelinquencyGrid from "../../../objects/DelinquencyGrid";
import Login from "../../../utils/Login";

test.describe.skip(
  "As a taxpayer, I should be able to submit an application via delinquency list action button",
  () => {
    test("Initiating test", async ({ page }) => {
      const taxpayerDelinquencyGrid = new DelinquencyGrid(page, {
        userType: "taxpayer",
      });
      const getFilingForm = page.waitForResponse((response) =>
        response.request().method() === "GET" &&
        response.url().includes("/forms/municipality/")
      );

      await Login.login(page, { accountType: "taxpayer" });
      await taxpayerDelinquencyGrid.init();
      await expect(taxpayerDelinquencyGrid.getElement().noRecordFoundComponent()).toHaveCount(0);
      await taxpayerDelinquencyGrid.toggleActionButtonForNthDelinquencyItem("Submit Now", 1);

      expect((await getFilingForm).status()).toBe(200);
    });
  }
);
