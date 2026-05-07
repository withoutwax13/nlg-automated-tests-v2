import { test, expect } from "@playwright/test";
import { deleteBusinessData, expectCurrentUrlToInclude, logout } from "../../support/native-helpers";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user, the default filter for the business list should be the Operating Status", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "municipal" });
    await municipalBusinessGrid.init();
    await expect(municipalBusinessGrid.getElement().activeFilterChipsLabel()).toBeVisible();
    await expect(municipalBusinessGrid.getElement().activeFilterChip("Operating Status")).toBeVisible();
  });
});