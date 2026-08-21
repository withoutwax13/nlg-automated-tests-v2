import { test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import {
  GOVERNMENT,
  expectDatesFromLastMonths,
  loginFresh,
} from "../helpers/filing-workflows";

test.describe("As a AGS user, I should be able to see filings in 1 year ago.", () => {
  test("As a AGS user, I should be able to see filings in 1 year ago.", { tag: ["@slot-01", "@ags"] }, async ({ page, resourceSlot }) => {
    await loginFresh(page, resourceSlot, { accountType: "ags" });
    const filingGrid = new FilingGrid(page, {
      userType: "ags",
      municipalitySelection: GOVERNMENT,
    });
    await filingGrid.init();
    await expectDatesFromLastMonths(filingGrid, 12);
  });
});
