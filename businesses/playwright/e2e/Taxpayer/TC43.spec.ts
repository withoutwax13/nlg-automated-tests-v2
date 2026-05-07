import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const taxpayerBusinessGrid = new BusinessGrid({ userType: "taxpayer" });

test.describe("As a taxpayer user, there should not be any default filter in the business list", () => {
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "taxpayer", accountIndex: 2 });
    taxpayerBusinessGrid.init();
    const isFiltered = await taxpayerBusinessGrid.isGridFiltered();
    expect(isFiltered).toBeFalsy();
  });
});