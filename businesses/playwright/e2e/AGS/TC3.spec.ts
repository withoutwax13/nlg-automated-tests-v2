import { test, expect } from '../../support/pwtest';
import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

const cleanTestData = (businessName: string, requiredForm: string) => {
  agsBusinessGrid.init();
  agsBusinessGrid.clickClearAllFiltersButton();
  agsBusinessGrid.checkEnabledRequiredForms(
    businessName,
    "requiredFormsBeforeCleaning"
  );
  cy.get("@requiredFormsBeforeCleaning").then((requiredFormsBeforeCleaning) => {
    if (requiredFormsBeforeCleaning.includes(requiredForm)) {
      agsBusinessGrid.clickClearAllFiltersButton();
      agsBusinessGrid.removeRequiredForms(businessName, [requiredForm]);
    }
  });
};

test.describe("As an AGS user, I should be able to add required forms from the grid", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "ags", accountIndex: 2 });
    cleanTestData("Arrakis Spice Company 17829", "Food and Beverage Tax Return (Monthly)");
    agsBusinessGrid.clickClearAllFiltersButton();
    // check the enabled required forms of a business
    agsBusinessGrid.checkEnabledRequiredForms(
      "Arrakis Spice Company 17829",
      "beforeAddingRequiredForms"
    );
    cy.get("@beforeAddingRequiredForms").then((beforeAddingRequiredForms) => {
      expect(beforeAddingRequiredForms).to.be.not.include(
        "Food and Beverage Tax Return (Monthly)"
      );
    });
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.addRequiredForms("Arrakis Spice Company 17829", [
      "Food and Beverage Tax Return (Monthly)",
    ]);
    agsBusinessGrid.getElement().toastComponent().should("exist");
    agsBusinessGrid.clickClearAllFiltersButton();
    // re-check the enabled required forms of a business
    agsBusinessGrid.checkEnabledRequiredForms(
      "Arrakis Spice Company 17829",
      "afterAddingRequiredForms"
    );
    cy.get("@afterAddingRequiredForms").then((afterAddingRequiredForms) => {
      expect(afterAddingRequiredForms).to.be.include(
        "Food and Beverage Tax Return (Monthly)"
      );
    });
  });
});
