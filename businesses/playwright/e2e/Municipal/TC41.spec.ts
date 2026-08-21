import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user, the default filter for the business list should be the Operating Status", () => {
  test("As a municipal user, the default filter for the business list should be the Operating Status", { tag: ["@slot-09", "@municipal"] }, async ({ page, resourceSlot }) => {
    await Login.login(page, resourceSlot, { accountType: "municipal" });
    await municipalBusinessGrid.init(page);
    await expect(municipalBusinessGrid.getElement().activeFilterChipsLabel()).toBeVisible();
    await expect(municipalBusinessGrid.getElement().activeFilterChip("Operating Status")).toBeVisible();
  });
});
