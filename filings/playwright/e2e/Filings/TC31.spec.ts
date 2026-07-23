import { test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import {
  GOVERNMENT,
  expectDatesFromLastMonths,
  loginFresh,
} from "../helpers/filing-workflows";

test.describe("As a AGS user, I should be able to see filings in 1 month ago.", () => {
  test("Initiate test", async ({ page }) => {
    await loginFresh(page, { accountType: "ags", accountIndex: 8 });
    const filingGrid = new FilingGrid(page, {
      userType: "ags",
      municipalitySelection: GOVERNMENT,
    });
    await filingGrid.init();
    await expectDatesFromLastMonths(filingGrid, 1);
  });
});
