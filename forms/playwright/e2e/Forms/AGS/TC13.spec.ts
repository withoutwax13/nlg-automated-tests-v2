import { test } from "@playwright/test";
import FormGrid from "../../../objects/FormGrid";
import { initTestRuntime, login } from "../../../support/runtime";
import Login from "../../../utils/Login";

const agsFormsGrid = new FormGrid({ userType: "ags" });

test.describe("As an AGS user, I should be able to export a workflow of a specific form", () => {
  test("Initiate test", async ({ page }, testInfo) => {
    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await Login.login({ accountType: "ags", accountIndex: 6 });
    await agsFormsGrid.init();
    await agsFormsGrid.toggleActionButton(
      "filter",
      "Export Workflow",
      "Form Title",
      "Business License (Annual) - E2E #1"
    );
  });
});