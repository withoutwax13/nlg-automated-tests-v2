import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({
  userType: "municipal"
});

const randomDate = {
  date: Math.floor(Math.random() * 28) + 1,
};

test.describe("As a municipal user, I should be able to set close date from the grid", () => {
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "municipal", accountIndex: 1 });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const beforeCloseDate = await municipalBusinessGrid.getDataOfColumn(
      "Close Date",
      "DBA",
      "Arrakis Spice Company 13857"
    );
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.setCloseDate("Arrakis Spice Company 13857", {
      month: 1,
      date: randomDate.date,
      year: 2029,
    });
    await expect(municipalBusinessGrid.getElement().toastComponent()).toBeVisible();
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const afterCloseDate = await municipalBusinessGrid.getDataOfColumn(
      "Close Date",
      "DBA",
      "Arrakis Spice Company 13857"
    );
    expect(beforeCloseDate).not.toEqual(afterCloseDate);
  });
});