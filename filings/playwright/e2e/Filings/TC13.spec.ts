import { expect, test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import { GOVERNMENT, loginFresh } from "../helpers/filing-workflows";

test.describe("As an AGS user, I should be able to view requested extract.", () => {
  test("As an AGS user, I should be able to view requested extract.", { tag: ["@slot-07", "@ags"] }, async ({ page, resourceSlot }) => {
    await loginFresh(page, resourceSlot, { accountType: "ags" });
    const filingGrid = new FilingGrid(page, {
      userType: "ags",
      municipalitySelection: GOVERNMENT,
    });
    await filingGrid.init();
    await filingGrid.clickViewRequestedExtractButton();
    await expect(page).toHaveURL(/filingsExtractRequests/i);
  });
});
