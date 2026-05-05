import { test, expect } from '@playwright/test';
import BusinessGrid from "../../objects/BusinessGrid";

const municipalBusinessGrid = new BusinessGrid({
  userType: "municipal"
});

const cleanTestData = (businessName: string, requiredForm: string) => {
  municipalBusinessGrid.init();
  municipalBusinessGrid.clickClearAllFiltersButton();
  municipalBusinessGrid.checkEnabledRequiredForms(
    businessName,
    "requiredFormsBeforeCleaning"
  );
  cy.get("@requiredFormsBeforeCleaning").then((requiredFormsBeforeCleaning) => {
    if(requiredFormsBeforeCleaning.includes(requiredForm)) {
      municipalBusinessGrid.clickClearAllFiltersButton();
      municipalBusinessGrid.removeRequiredForms(businessName, [requiredForm]);
    }
  });
};

test.describe("As a municipal user, I should be able to add required forms from the grid", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "municipal", accountIndex: 2 });
    cleanTestData("Arrakis Spice Company 17829", "Food and Beverage Tax Return (Monthly)");
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickClearAllFiltersButton();
    // check the enabled required forms of a business
    municipalBusinessGrid.checkEnabledRequiredForms(
      "Arrakis Spice Company 17829",
      "beforeAddingRequiredForms"
    );
    cy.get("@beforeAddingRequiredForms").then((beforeAddingRequiredForms) => {
      expect(beforeAddingRequiredForms).to.be.not.include(
        "Food and Beverage Tax Return (Monthly)"
      );
    });
    municipalBusinessGrid.clickClearAllFiltersButton();
    municipalBusinessGrid.addRequiredForms("Arrakis Spice Company 17829", [
      "Food and Beverage Tax Return (Monthly)",
    ]);
    municipalBusinessGrid.getElement().toastComponent().should("exist");
    municipalBusinessGrid.clickClearAllFiltersButton();
    // re-check the enabled required forms of a business
    municipalBusinessGrid.checkEnabledRequiredForms(
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
