import { test, expect } from '@playwright/test';
import BusinessAdd from "../../../businesses/playwright/objects/BusinessAdd";
import BusinessGrid from "../../../businesses/playwright/objects/BusinessGrid";

test.describe("Add Business", () => {
  let accounts = [
    "Test Trade Name 98068 1",
    "Test Trade Name 14793 1",
    "Test Trade Name 47910 1",
    "Test Trade Name 48440 1",
    "Arrakis Spice Company 13685",
    "Test Trade Name 50363 1",
    "Arrakis Spice Company 13685",
    "Arrakis Spice Company 13685",
    "Arrakis Spice Company 13685",
    "Arrakis Spice Company 13685",
    "Arrakis Spice Company 13685",
    "Arrakis Spice Company 13685",
    "Test Trade Name 52576 1",
    "Test Trade Name 53191 1",
    "Arrakis Spice Company 13685",
    "Test Trade Name 24916 1",
    "Test Trade Name 25677 1",
    "Arrakis Spice Company 13685",
    "Test Trade Name 26887 1",
    "Arrakis Spice Company 18516",
  ];
  for (let i = 4; i < 10; i++) {
    test(`should add business to taxpayer account index ${i}`, () => {
      const businessGridTaxpayer = new BusinessGrid({ userType: "taxpayer" });
      const businessAdd = new BusinessAdd({ userType: "taxpayer" });
      cy.login({ accountType: "taxpayer", accountIndex: i });
      businessGridTaxpayer.init();
      accounts.forEach((account, index) => {
        businessGridTaxpayer.filterColumn("DBA", account);
        cy.get("body").then(($body) => {
          if ($body.find(".k-grid-norecords-template").length !== 0) {
            businessGridTaxpayer.clickAddBusinessButton();
            businessAdd.addBusinessOnAccount(account);
            cy.waitForLoading(5);
          } else {
            businessGridTaxpayer.clickClearAllFiltersButton();
          }
        });
      });
    });
  }
});
