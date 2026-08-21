import { expect, test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import { GOVERNMENT, loginFresh } from "../helpers/filing-workflows";

test.describe("As a ags, I should be able to search filing list with data from its columns", () => {
  test("As a ags, I should be able to search filing list with data from its columns", { tag: ["@slot-08", "@ags"] }, async ({ page, resourceSlot }) => {
    await loginFresh(page, resourceSlot, { accountType: "ags", notFirstLogin: true });
    const filingGrid = new FilingGrid(page, {
      userType: "ags",
      municipalitySelection: GOVERNMENT,
    });
    await filingGrid.init();
    const locationDba = (await filingGrid.getColumnCellsData("Location DBA"))[0];
    expect(locationDba).toBeTruthy();
    await filingGrid.searchFiling(locationDba);
    await expect(filingGrid.getElement().rows().first()).toContainText(locationDba);
  });
});
