import { expect, test } from "@playwright/test";
import FormGrid from "../../../objects/FormGrid";
import { currentPage, initTestRuntime, login } from "../../../support/runtime";

const agsFormsGrid = new FormGrid({ userType: "ags" });

test.describe("As an AGS user, I should be able to navigate to the workflow builder via edit workflow button", () => {
  test("Initiate test", async ({ page }, testInfo) => {
    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await login({ accountType: "ags", accountIndex: 5 });
    await agsFormsGrid.init();
    await agsFormsGrid.toggleActionButton(
      "filter",
      "Edit Workflow",
      "Form Title",
      "Business License (Annual) - E2E #1"
    );
    await expect(currentPage()).toHaveURL(/registrationApp\/editWorkflow/);
  });
});
