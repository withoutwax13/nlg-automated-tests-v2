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
  pw.get("@requiredFormsBeforeCleaning").then((requiredFormsBeforeCleaning) => {
    if(!requiredFormsBeforeCleaning.includes(requiredForm)) {
      agsBusinessGrid.clickClearAllFiltersButton();
      agsBusinessGrid.addRequiredForms(businessName, [requiredForm]);
    }
  });
};

test.describe("As an AGS user, I should be able to remove required forms from the grid", () => {
  test("Initiating test", () => {
    pw.login({ accountType: "ags", accountIndex: 3 });
    cleanTestData("Arrakis Spice Company 17829", "Food and Beverage Tax Return (Monthly)");
    agsBusinessGrid.clickClearAllFiltersButton();
    // check the enabled required forms of a business
    agsBusinessGrid.checkEnabledRequiredForms(
      "Arrakis Spice Company 17829",
      "beforeRemovingRequiredForms"
    );
    pw.get("@beforeRemovingRequiredForms").then((beforeRemovingRequiredForms) => {
      expect(beforeRemovingRequiredForms).to.be.include(
        "Food and Beverage Tax Return (Monthly)"
      );
    });
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.removeRequiredForms("Arrakis Spice Company 17829", [
      "Food and Beverage Tax Return (Monthly)",
    ]);
    agsBusinessGrid.getElement().toastComponent().should("exist");
    agsBusinessGrid.clickClearAllFiltersButton();
    // re-check the enabled required forms of a business
    agsBusinessGrid.checkEnabledRequiredForms(
      "Arrakis Spice Company 17829",
      "afterRemovingRequiredForms"
    );
    pw.get("@afterRemovingRequiredForms").then((afterRemovingRequiredForms) => {
      expect(afterRemovingRequiredForms).to.not.be.include(
        "Food and Beverage Tax Return (Monthly)"
      );
    });
  });
});
