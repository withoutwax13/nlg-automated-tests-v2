import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

const randomDate = {
  date: Math.floor(Math.random() * 28) + 1,
};

test.describe("As an AGS user, I should be able to set close date from the grid", () => {
  test("Initiating test", async () => {
    await login({ accountType: "ags", accountIndex: 1 });
    await agsBusinessGrid.init();
    await agsBusinessGrid.clickClearAllFiltersButton();
    const beforeCloseDate = await agsBusinessGrid.getDataOfColumn(
      "Close Date",
      "DBA",
      "Arrakis Spice Company 13857"
    );
    await agsBusinessGrid.clickClearAllFiltersButton();
    await agsBusinessGrid.setCloseDate("Arrakis Spice Company 13857", {
      month: 1,
      date: randomDate.date,
      year: 2029,
    });
    await expect(agsBusinessGrid.getElement().toastComponent()).toBeVisible();
    await agsBusinessGrid.clickClearAllFiltersButton();
    const afterCloseDate = await agsBusinessGrid.getDataOfColumn(
      "Close Date",
      "DBA",
      "Arrakis Spice Company 13857"
    );
    expect(beforeCloseDate).not.toEqual(afterCloseDate);
  });
});
