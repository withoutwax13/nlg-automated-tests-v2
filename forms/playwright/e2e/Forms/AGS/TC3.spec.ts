import { test } from "@playwright/test";
import FormGrid from "../../../objects/FormGrid";
import { getAlias, initTestRuntime, login } from "../../../support/runtime";
import Login from "../../../utils/Login";

const agsFormGrid = new FormGrid({ userType: "ags" });

test.describe("As an AGS user, I should be able to open a form draft in form editor.", () => {
  test("Initiate test", async ({ page }, testInfo) => {
    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await Login.login({ accountType: "ags", accountIndex: 2 });
    await agsFormGrid.init();
    await agsFormGrid.filterColumn("Draft Change Type", "None");
    await agsFormGrid.getDataOfColumnForNRow(0, "Form Title", "firstRowForm");
    await agsFormGrid.getDataOfColumnForNRow(0, "Clients", "firstRowClient");
    await agsFormGrid.clickClearAllFiltersButton();

    const firstRowForm = getAlias<string>("firstRowForm");
    const firstRowClient = getAlias<string>("firstRowClient");

    await agsFormGrid.init();
    await agsFormGrid.filterColumn(
      "Form Title",
      String(firstRowForm),
      "text",
      "Is equal to"
    );
    await agsFormGrid.filterColumn(
      "Clients",
      String(firstRowClient),
      "text",
      "Is equal to"
    );
    await agsFormGrid.toggleActionButton(
      "order",
      "Open draft in editor",
      undefined,
      undefined,
      0
    );
  });
});