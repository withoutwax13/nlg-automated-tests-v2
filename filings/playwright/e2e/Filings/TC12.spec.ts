import { expect, test } from "@playwright/test";
import FilingGrid from "../../objects/FilingGrid";
import { GOVERNMENT, loginFresh } from "../helpers/filing-workflows";

test.describe("As an AGS user, I should be able to view filings data of a specific government.", () => {
  test("Initiate test", async ({ page }) => {
    await loginFresh(page, { accountType: "ags", accountIndex: 8 });
    const filingGrid = new FilingGrid(page, {
      userType: "ags",
      municipalitySelection: GOVERNMENT,
    });
    await filingGrid.init();
    await expect.poll(async () => filingGrid.getElement().rows().count()).toBeGreaterThan(0);
  });
});
