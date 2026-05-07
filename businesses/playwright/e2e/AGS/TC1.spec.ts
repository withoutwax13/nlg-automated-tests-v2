import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

const randomDate = {
  date: Math.floor(Math.random() * 28) + 1,
};

test.describe("As an AGS user, I should be able to set delinquency start date from the grid", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "ags" });
    await agsBusinessGrid.init();
    await agsBusinessGrid.clickClearAllFiltersButton();
    const beforeDelinquencyStartDate = await agsBusinessGrid.getDataOfColumn(
      "Delinquency Start Date",
      "DBA",
      "Arrakis Spice Company 13685"
    );
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.setDelinquencyStartDate("Arrakis Spice Company 13685", {
      month: 1,
      date: randomDate.date,
      year: 2023,
    });
    await expect(agsBusinessGrid.getElement().toastComponent()).toBeVisible();
    await agsBusinessGrid.clickClearAllFiltersButton();
    const afterDelinquencyStartDate = await agsBusinessGrid.getDataOfColumn(
      "Delinquency Start Date",
      "DBA",
      "Arrakis Spice Company 13685"
    );
    expect(beforeDelinquencyStartDate).not.toEqual(afterDelinquencyStartDate);
  });
});