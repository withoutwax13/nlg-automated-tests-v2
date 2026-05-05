import { test, expect } from '@playwright/test';
import BusinessGrid from "../../objects/BusinessGrid";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });

test.describe("As a taxpayer user,  I should be able to reveal the full content of FEIN in business list.", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "taxpayer", accountIndex: 6 });
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
    cy.get("@feinCell").then(($feinCell) => {
      cy.wrap($feinCell)
        .find(".fa-eye-slash")
        .click()
        .then(() => {
          cy.wrap($feinCell).find("span").invoke("text").as("feinValueAfterClick");
        });
    });
    cy.get("@feinValueBeforeClick").then(($feinValueBeforeClick) => {
      cy.get("@feinValueAfterClick").should("not.eq", $feinValueBeforeClick);
    });
  });
});
