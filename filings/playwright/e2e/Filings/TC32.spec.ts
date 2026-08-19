import { test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import {
  GOVERNMENT,
  expectDatesFromLastMonths,
  loginFresh,
} from "../helpers/filing-workflows";

test.describe("As a AGS user, I should be able to see filings in 3 month ago.", () => {
  test("Initiate test", { tag: ["@slot-05", "@ags"] }, async ({ page, resourceSlot }) => {
    await loginFresh(page, resourceSlot, { accountType: "ags" });
    const filingGrid = new FilingGrid(page, {
      userType: "ags",
      municipalitySelection: GOVERNMENT,
    });
    await filingGrid.init();
    await expectDatesFromLastMonths(filingGrid, 3);
  });
});
