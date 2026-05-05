import { test, expect } from '@playwright/test';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });

test.describe("As a user, when the business is not active, I should not be able to update form submission requirements in the business details page", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "ags" });
    agsBusinessGrid.init();
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13857");
    agsBusinessDetails
      .getElement()
      .formsSectionFormList()
      .each(($form) => {
        cy.wrap($form).find(".k-switch").invoke("attr", "aria-disabled").then((isDisabled) => {
          expect(isDisabled).to.equal("true");
        });
      });
  });
});
