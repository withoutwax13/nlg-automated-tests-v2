import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessGrid from "../../objects/BusinessGrid";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user, I should be able to Show only the businesses that are not required to remit taxes for any form in the business list", () => {
  test("Initiating test", async () => {
    await login({ accountType: "municipal", accountIndex: 7 });
    await municipalBusinessGrid.init();
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.filterColumn("Required Forms", "None", "multi-select");
    await expect(municipalBusinessGrid.getElement().noRecordFoundComponent()).not.toBeVisible();
  });
});
