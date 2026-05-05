import { test } from "@playwright/test";
import FormGrid from "../../../objects/FormGrid";
import { initTestRuntime, login } from "../../../support/runtime";

const agsFormGrid = new FormGrid({ userType: "ags" });

test.describe("As an AGS user, I should be able to export a specific form.", () => {
  test("Initiate test", async ({ page }, testInfo) => {
    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await login({ accountType: "ags", accountIndex: 1 });
    await agsFormGrid.init();
    await agsFormGrid.toggleActionButton(
      "filter",
      "Export",
      "Form Title",
      "Business License (Annual) - E2E #1"
    );
  });
});
