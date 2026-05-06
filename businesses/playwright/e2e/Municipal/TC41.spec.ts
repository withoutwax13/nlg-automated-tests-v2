import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user, the default filter for the business list should be the Operating Status", () => {
  test("Initiating test", async () => {
    await Login.login({ accountType: "municipal" });
    await municipalBusinessGrid.init();
    await expect(municipalBusinessGrid.getElement().activeFilterChipsLabel()).toBeVisible();
    await expect(municipalBusinessGrid.getElement().activeFilterChip("Operating Status")).toBeVisible();
  });
});