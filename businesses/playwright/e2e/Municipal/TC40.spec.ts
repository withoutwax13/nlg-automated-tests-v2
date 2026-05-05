import { test, expect } from '../../support/pwtest';
import BusinessGrid from "../../objects/BusinessGrid";
import BusinessDetails from "../../objects/BusinessDetails";

const municipalBusinessList = new BusinessGrid({ userType: "municipal" });
const municipalBusinessDetails = new BusinessDetails({ userType: "municipal" });

test.describe("As a user, I should be able to reveal the full content of FEIN in business details page", () => {
  test("Initiating test", () => {
    pw.login({ accountType: "municipal", accountIndex: 6 });
    municipalBusinessList.init();
    municipalBusinessList.clickClearAllFiltersButton();
    municipalBusinessList.viewBusinessDetails("Arrakis Spice Company 13685");
    municipalBusinessDetails.getBusinessData("FEIN/SSN", "feinBeforeClick");
    pw.get(".fa-eye-slash").click();
    municipalBusinessDetails.getBusinessData("FEIN/SSN", "feinAfterClick");
    pw.get("@feinBeforeClick").then(($feinBeforeClick) => {
      pw.get("@feinAfterClick").then(($feinAfterClick) => {
        expect($feinBeforeClick).to.not.equal($feinAfterClick);
      });
    });
  });
});
