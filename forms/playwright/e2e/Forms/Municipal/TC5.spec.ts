import { test, expect } from '../../../support/pwtest';
import FormGrid from "../../../objects/FormGrid";

const municipalFormGrid = new FormGrid({ userType: "municipal" });

test.describe("As a municipal user, I should be able to export forms.", () => {
  test("Initiate test", () => {
    pw.login({ accountType: "municipal", accountIndex: 1 });
    municipalFormGrid.init();
    municipalFormGrid.toggleActionButton(
      "filter",
      "Preview",
      "Form Title",
      "Business License (Annual) - E2E #1"
    );
  });
});
