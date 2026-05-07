import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user, I should be able to Show only the businesses that are not required to remit taxes for any form in the business list", () => {
  test("Initiating test", async ({ page }) => {
    await Login.login(page, { accountType: "municipal", accountIndex: 7 });
    await municipalBusinessGrid.init();
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.filterColumn("Required Forms", "None", "multi-select");
    await expect(municipalBusinessGrid.getElement().noRecordFoundComponent()).not.toBeVisible();
  });
});