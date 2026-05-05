import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessGrid from "../../objects/BusinessGrid";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

test.describe("As a taxpayer user,  I should be able to reveal the full content of FEIN in business list.", () => {
  test("Initiating test", async () => {
    await login({ accountType: "taxpayer", accountIndex: 6 });
    await taxpayerBusinessList.init();
    const feinValueBeforeClick = await taxpayerBusinessList.getDataOfColumn(
      "FEIN",
      "DBA",
      "Arrakis Spice Company 13685"
    );
    await taxpayerBusinessList.clickClearAllFiltersButton();
    const feinCell = await taxpayerBusinessList.getElementOfColumn(
      "FEIN",
      "DBA",
      "Arrakis Spice Company 13685"
    );
    await feinCell.locator(".fa-eye-slash").click();
    const feinValueAfterClick = (await feinCell.locator("span").first().innerText()).trim();
    expect(feinValueBeforeClick).not.toEqual(feinValueAfterClick);
  });
});
