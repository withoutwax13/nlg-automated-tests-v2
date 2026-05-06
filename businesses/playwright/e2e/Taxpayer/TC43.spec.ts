import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessGrid from "../../objects/BusinessGrid";

const taxpayerBusinessGrid = new BusinessGrid({ userType: "taxpayer" });

test.describe("As a taxpayer user, there should not be any default filter in the business list", () => {
  test("Initiating test", async () => {
    await login({ accountType: "taxpayer", accountIndex: 2 });
    taxpayerBusinessGrid.init();
    const isFiltered = await taxpayerBusinessGrid.isGridFiltered();
    expect(isFiltered).toBeFalsy();
  });
});
