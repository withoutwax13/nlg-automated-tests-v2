import { expect, test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import { loginFresh } from "../helpers/filing-workflows";

test.describe("As a taxpayer, I should be able to search filing list with data from its columns", () => {
  test("Initiate test", async ({ page }) => {
    await loginFresh(page, { accountType: "taxpayer" });
    const filingGrid = new FilingGrid(page, { userType: "taxpayer" });
    await filingGrid.init();
    const locationDba = (await filingGrid.getColumnCellsData("Location DBA"))[0];
    expect(locationDba).toBeTruthy();
    await filingGrid.searchFiling(locationDba);
    await expect(filingGrid.getElement().rows().first()).toContainText(locationDba);
  });
});
