import { test, expect } from '../../support/pwtest';
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
    if(!requiredFormsBeforeCleaning.includes(requiredForm)) {
      municipalBusinessGrid.clickClearAllFiltersButton();
      municipalBusinessGrid.addRequiredForms(businessName, [requiredForm]);
    }
  });
};

test.describe("As a municipal user, I should be able to remove required forms from the grid", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "municipal", accountIndex: 3 });
    cleanTestData("Arrakis Spice Company 17829", "Food and Beverage Tax Return (Monthly)");
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickClearAllFiltersButton();
    // check the enabled required forms of a business
    municipalBusinessGrid.checkEnabledRequiredForms(
      "Arrakis Spice Company 17829",
      "beforeRemovingRequiredForms"
    );
    cy.get("@beforeRemovingRequiredForms").then((beforeRemovingRequiredForms) => {
      expect(beforeRemovingRequiredForms).to.be.include(
        "Food and Beverage Tax Return (Monthly)"
      );
    });
    municipalBusinessGrid.clickClearAllFiltersButton();
    municipalBusinessGrid.removeRequiredForms("Arrakis Spice Company 17829", [
      "Food and Beverage Tax Return (Monthly)",
    ]);
    municipalBusinessGrid.getElement().toastComponent().should("exist");
    municipalBusinessGrid.clickClearAllFiltersButton();
    // re-check the enabled required forms of a business
    municipalBusinessGrid.checkEnabledRequiredForms(
      "Arrakis Spice Company 17829",
      "afterRemovingRequiredForms"
    );
    cy.get("@afterRemovingRequiredForms").then((afterRemovingRequiredForms) => {
      expect(afterRemovingRequiredForms).to.not.be.include(
        "Food and Beverage Tax Return (Monthly)"
      );
    });
  });
});
