import { test, expect } from '../../support/pwtest';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "Arrakis",
});
const agsBusinessDetails = new BusinessDetails({ userType: "ags" });

test.describe("When I update the business close date, system should show me the Set Business Status modal", () => {
  // Reason for skipping: This can be already covered in TC51 by adding an assertion to check if the Set Business Status modal is triggered after updating the business close date.
  test.skip("Initiating test", () => {
    pw.login({ accountType: "ags", accountIndex: 3 });
    agsBusinessGrid.init();
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.viewBusinessDetails("Arrakis Spice Company 13857");
    pw.url().should("include", "/BusinessesApp/BusinessDetails/");
    agsBusinessDetails.clickBusinessStatusTab();
    agsBusinessDetails.triggerSetBusinessStatusModal();
    agsBusinessDetails.setBusinessStatusModal.getElement().modal().should("exist");
  });
});
