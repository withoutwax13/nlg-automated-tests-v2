import { test, expect } from '../../../support/pwtest';
import FormGrid from "../../../objects/FormGrid";

const agsFormGrid = new FormGrid({ userType: "ags" });

test.describe("As an AGS user, I should be able to navigate to the form editor via open in editor button", () => {
  test("Initiate test", () => {
    pw.login({ accountType: "ags", accountIndex: 4 });
    agsFormGrid.init();
    agsFormGrid.filterColumn("Draft Change Type", "Major");
    agsFormGrid.filterColumn("Status", "Draft", "multi-select");
    agsFormGrid.getDataOfColumnForNRow(1, "Form Title", "firstRowForm");
    agsFormGrid.getDataOfColumnForNRow(1, "Version", "firstRowVersion");
    agsFormGrid.clickClearAllFiltersButton();
    pw.get("@firstRowForm").then(($firstRowForm) => {
      agsFormGrid.init();
      agsFormGrid.filterColumn("Form Title", String($firstRowForm));
      agsFormGrid.filterColumn("Draft Change Type", "Major");
      agsFormGrid.filterColumn("Status", "Draft", "multi-select");
      agsFormGrid.toggleActionButton(
        "order",
        "Open in editor",
        undefined,
        undefined,
        0
      );
    });
    pw.get("@firstRowVersion").then(($firstRowVersion) => {
      pw.url().should("include", "formsApp");
      pw.url().should("include", $firstRowVersion);
    });
  });
});
