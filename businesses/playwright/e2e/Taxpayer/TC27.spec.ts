import { test, expect } from '../../support/pwtest';
import BusinessGrid from "../../objects/BusinessGrid";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

test.describe("As a taxpayer user,  I should be able to reveal the full content of FEIN in business list.", () => {
  test("Initiating test", () => {
    pw.login({ accountType: "taxpayer", accountIndex: 6 });
    taxpayerBusinessList.init();
    taxpayerBusinessList.getDataOfColumn(
      "FEIN",
      "DBA",
      "Arrakis Spice Company 13685",
      "feinValueBeforeClick"
    );
    taxpayerBusinessList.clickClearAllFiltersButton();
    taxpayerBusinessList.getElementOfColumn(
      "FEIN",
      "DBA",
      "Arrakis Spice Company 13685",
      "feinCell"
    );
    pw.get("@feinCell").then(($feinCell) => {
      pw.wrap($feinCell)
        .find(".fa-eye-slash")
        .click()
        .then(() => {
          pw.wrap($feinCell).find("span").invoke("text").as("feinValueAfterClick");
        });
    });
    pw.get("@feinValueBeforeClick").then(($feinValueBeforeClick) => {
      pw.get("@feinValueAfterClick").should("not.eq", $feinValueBeforeClick);
    });
  });
});
