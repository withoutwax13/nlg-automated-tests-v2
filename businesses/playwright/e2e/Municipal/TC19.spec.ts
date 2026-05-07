import { test, expect } from "@playwright/test";
import { deleteBusinessData, expectCurrentUrlToInclude, logout } from "../../support/native-helpers";
import BusinessGrid from "../../objects/BusinessGrid";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user,  I should be able to reveal the full content of FEIN in business list.", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "municipal", accountIndex: 6 });
    await municipalBusinessGrid.init();
    const feinValueBeforeClick = await municipalBusinessGrid.getDataOfColumn(
      "FEIN",
      "DBA",
      "Arrakis Spice Company 13685"
    );
    await municipalBusinessGrid.clickClearAllFiltersButton();
    const feinCell = await municipalBusinessGrid.getElementOfColumn(
      "FEIN",
      "DBA",
      "Arrakis Spice Company 13685"
    );
    await feinCell.locator(".fa-eye-slash").click();
    const feinValueAfterClick = (await feinCell.locator("span").first().innerText()).trim();
    expect(feinValueAfterClick).not.toEqual(feinValueBeforeClick);
  });
});