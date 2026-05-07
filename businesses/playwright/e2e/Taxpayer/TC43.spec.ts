import { test, expect } from "@playwright/test";
import { deleteBusinessData, expectCurrentUrlToInclude, logout } from "../../support/native-helpers";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const taxpayerBusinessGrid = new BusinessGrid({ userType: "taxpayer" });

test.describe("As a taxpayer user, there should not be any default filter in the business list", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "taxpayer", accountIndex: 2 });
    taxpayerBusinessGrid.init();
    const isFiltered = await taxpayerBusinessGrid.isGridFiltered();
    expect(isFiltered).toBeFalsy();
  });
});