import { test } from "@playwright/test";
import FormGrid from "../../../objects/FormGrid";
import { initTestRuntime, login } from "../../../support/runtime";

const agsFormGrid = new FormGrid({ userType: "ags" });

test.describe("As an AGS user, I should be able to export forms.", () => {
  test("Initiate test", async ({ page }, testInfo) => {
    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await login({ accountType: "ags" });
    await agsFormGrid.init();
    await agsFormGrid.clickExportButton();
  });
});
