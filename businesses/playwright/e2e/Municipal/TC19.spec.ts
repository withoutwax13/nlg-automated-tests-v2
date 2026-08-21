import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user,  I should be able to reveal the full content of FEIN in business list.", () => {
  test("As a municipal user,  I should be able to reveal the full content of FEIN in business list.", { tag: ["@slot-01", "@municipal", "@business-active"] }, async ({ page, resourceSlot }) => {
    await Login.login(page, resourceSlot, { accountType: "municipal" });
    await municipalBusinessGrid.init(page);
    const feinValueBeforeClick = await municipalBusinessGrid.getDataOfColumn(
      "FEIN",
      "DBA",
      resourceSlot.businesses.active
    );
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const feinCell = await municipalBusinessGrid.getElementOfColumn(
      "FEIN",
      "DBA",
      resourceSlot.businesses.active
    );
    await feinCell.locator(".fa-eye-slash").click();
    const feinValueAfterClick = (await feinCell.locator("span").first().innerText()).trim();
    expect(feinValueAfterClick).not.toEqual(feinValueBeforeClick);
  });
});
