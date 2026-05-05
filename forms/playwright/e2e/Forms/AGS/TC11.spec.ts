import { expect, test } from "@playwright/test";
import FormGrid from "../../../objects/FormGrid";
import { currentPage, getAlias, initTestRuntime, login } from "../../../support/runtime";

const agsFormGrid = new FormGrid({ userType: "ags" });

test.describe("As an AGS user, I should be able to navigate to the form editor via open in editor button", () => {
  test("Initiate test", async ({ page }, testInfo) => {
    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await login({ accountType: "ags", accountIndex: 4 });
    await agsFormGrid.init();
    await agsFormGrid.filterColumn("Draft Change Type", "Major");
    await agsFormGrid.filterColumn("Status", "Draft", "multi-select");
    await agsFormGrid.getDataOfColumnForNRow(1, "Form Title", "firstRowForm");
    await agsFormGrid.getDataOfColumnForNRow(1, "Version", "firstRowVersion");
    await agsFormGrid.clickClearAllFiltersButton();

    const firstRowForm = getAlias<string>("firstRowForm");
    const firstRowVersion = getAlias<string>("firstRowVersion");

    await agsFormGrid.init();
    await agsFormGrid.filterColumn("Form Title", String(firstRowForm));
    await agsFormGrid.filterColumn("Draft Change Type", "Major");
    await agsFormGrid.filterColumn("Status", "Draft", "multi-select");
    await agsFormGrid.toggleActionButton(
      "order",
      "Open in editor",
      undefined,
      undefined,
      0
    );

    await expect(currentPage()).toHaveURL(/formsApp/);
    await expect(currentPage()).toHaveURL(new RegExp(String(firstRowVersion)));
  });
});
