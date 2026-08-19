import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const taxpayerBusinessGrid = new BusinessGrid({ userType: "taxpayer" });

test.describe("As a taxpayer user, there should not be any default filter in the business list", () => {
  test("Initiating test", { tag: ["@slot-04", "@taxpayer"] }, async ({ page, resourceSlot }) => {
    await Login.login(page, resourceSlot, { accountType: "taxpayer" });
    await taxpayerBusinessGrid.init(page);
    const isFiltered = await taxpayerBusinessGrid.isGridFiltered();
    expect(isFiltered).toBeFalsy();
  });
});
