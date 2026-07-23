import { test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import { expectDatesFromLastMonths, loginFresh } from "../helpers/filing-workflows";

test.describe("As a municipal user, I should be able to see filings in 6 month ago.", () => {
  test("Initiate test", async ({ page }) => {
    await loginFresh(page, { accountType: "municipal" });
    const filingGrid = new FilingGrid(page, { userType: "municipal" });
    await filingGrid.init();
    await expectDatesFromLastMonths(filingGrid, 6);
  });
});
