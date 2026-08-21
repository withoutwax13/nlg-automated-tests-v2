import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user, I should be able to Show only the businesses that are not required to remit taxes for any form in the business list", () => {
  test("As a municipal user, I should be able to Show only the businesses that are not required to remit taxes for any form in the business list", { tag: ["@slot-08", "@municipal", "@business-required-forms"] }, async ({ page, resourceSlot }) => {
    await Login.login(page, resourceSlot, { accountType: "municipal" });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickClearAllFiltersButton();
    await municipalBusinessGrid.filterColumn("Required Forms", "None", "multi-select");
    const matchingBusiness = await municipalBusinessGrid.getDataOfColumn(
      "DBA",
      "DBA",
      resourceSlot.businesses.requiredForms,
    );
    expect(matchingBusiness).toBe(resourceSlot.businesses.requiredForms);
  });
});
