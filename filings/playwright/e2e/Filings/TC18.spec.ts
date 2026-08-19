import { expect, test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import { loginFresh } from "../helpers/filing-workflows";

test.describe("As a municipal, I should be able to search filing list with data from its columns", () => {
  test("Initiate test", { tag: ["@slot-09", "@municipal"] }, async ({ page, resourceSlot }) => {
    await loginFresh(page, resourceSlot, { accountType: "municipal" });
    const filingGrid = new FilingGrid(page, { userType: "municipal" });
    await filingGrid.init();
    const locationDba = (await filingGrid.getColumnCellsData("Location DBA"))[0];
    expect(locationDba).toBeTruthy();
    await filingGrid.searchFiling(locationDba);
    await expect(filingGrid.getElement().rows().first()).toContainText(locationDba);
  });
});
