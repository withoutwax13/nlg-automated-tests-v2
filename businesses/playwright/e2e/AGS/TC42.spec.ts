import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({ userType: "ags", municipalitySelection: "Arrakis" });

test.describe("As an AGS user, the default filter for the business list should be the Operating Status", () => {
  test("Initiating test", async () => {
    await login({ accountType: "ags" });
    await agsBusinessGrid.init();
    await expect(agsBusinessGrid.getElement().activeFilterChipsLabel()).toBeVisible();
    await expect(agsBusinessGrid.getElement().activeFilterChip("Operating Status")).toBeVisible();
  });
});
