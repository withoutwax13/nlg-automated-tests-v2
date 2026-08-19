import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

test.describe("As a taxpayer user,  I should be able to reveal the full content of FEIN in business list.", () => {
  test("Initiating test", { tag: ["@slot-00", "@taxpayer", "@business-active"] }, async ({ page, resourceSlot }) => {
    await Login.login(page, resourceSlot, { accountType: "taxpayer" });
    await taxpayerBusinessList.init(page);
    const feinValueBeforeClick = await taxpayerBusinessList.getDataOfColumn(
      "FEIN",
      "DBA",
      resourceSlot.businesses.active
    );
    await taxpayerBusinessList.clickClearAllFiltersButton();
    const feinCell = await taxpayerBusinessList.getElementOfColumn(
      "FEIN",
      "DBA",
      resourceSlot.businesses.active
    );
    await feinCell.locator(".fa-eye-slash").click();
    const feinValueAfterClick = (await feinCell.locator("span").first().innerText()).trim();
    expect(feinValueBeforeClick).not.toEqual(feinValueAfterClick);
  });
});
