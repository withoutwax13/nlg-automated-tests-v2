import { test } from "@playwright/test";
import FormGrid from "../../../objects/FormGrid";
import { initTestRuntime, login } from "../../../support/runtime";
import Login from "../../../utils/Login";

const municipalFormGrid = new FormGrid({ userType: "municipal" });

test.describe("As a municipal user, I should be able to export forms.", () => {
  test("Initiate test", async ({ page }, testInfo) => {
    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await Login.login(page, { accountType: "municipal" });
    await municipalFormGrid.init();
    await municipalFormGrid.clickExportButton();
  });
});