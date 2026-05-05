import { test, expect } from '../../../support/pwtest';
import FormGrid from "../../../objects/FormGrid";

const agsFormGrid = new FormGrid({ userType: "ags" });

test.describe("As an AGS user, I should be able to navigate to the form editor via create new form button", () => {
  test("Initiate test", () => {
    pw.login({ accountType: "ags", accountIndex: 3 });
    agsFormGrid.init();
    agsFormGrid.clickAddNeWFormButton();
    pw.url().should("include", "createNewForm");
  });
});
