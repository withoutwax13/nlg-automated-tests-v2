import { expect, test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import { GOVERNMENT, loginFresh } from "../helpers/filing-workflows";

test.describe("As an AGS user, I should be able to view filings data of a specific government.", () => {
  test("As an AGS user, I should be able to view filings data of a specific government.", { tag: ["@slot-02", "@ags"] }, async ({ page, resourceSlot }) => {
    await loginFresh(page, resourceSlot, { accountType: "ags" });
    const filingGrid = new FilingGrid(page, {
      userType: "ags",
      municipalitySelection: GOVERNMENT,
    });
    await filingGrid.init();
    await expect.poll(async () => filingGrid.getElement().rows().count()).toBeGreaterThan(0);
  });
});
