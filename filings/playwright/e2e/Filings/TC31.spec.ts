import { test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import {
  GOVERNMENT,
  expectDatesFromLastMonths,
  loginFresh,
} from "../helpers/filing-workflows";

test.describe("As a AGS user, I should be able to see filings in 1 month ago.", () => {
  test("As a AGS user, I should be able to see filings in 1 month ago.", { tag: ["@slot-04", "@ags"] }, async ({ page, resourceSlot }) => {
    await loginFresh(page, resourceSlot, { accountType: "ags" });
    const filingGrid = new FilingGrid(page, {
      userType: "ags",
      municipalitySelection: GOVERNMENT,
    });
    await filingGrid.init();
    await expectDatesFromLastMonths(filingGrid, 1);
  });
});
