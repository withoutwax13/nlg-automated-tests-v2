import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({
  userType: "municipal"
});

const randomDate = {
  date: Math.floor(Math.random() * 28) + 1,
};

test.describe("As a municipal user, I should be able to set delinquency start date from the grid", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "municipal" });
    await municipalBusinessGrid.init();
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const beforeDelinquencyStartDate = await municipalBusinessGrid.getDataOfColumn(
      "Delinquency Start Date",
      "DBA",
      "Arrakis Spice Company 13685"
    );
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.setDelinquencyStartDate("Arrakis Spice Company 13685", {
      month: 1,
      date: randomDate.date,
      year: 2023,
    });
    await expect(municipalBusinessGrid.getElement().toastComponent()).toBeVisible();
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const afterDelinquencyStartDate = await municipalBusinessGrid.getDataOfColumn(
      "Delinquency Start Date",
      "DBA",
      "Arrakis Spice Company 13685"
    );
    expect(beforeDelinquencyStartDate).not.toEqual(afterDelinquencyStartDate);
  });
});