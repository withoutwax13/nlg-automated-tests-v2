import { expect, test } from "@playwright/test";
import FormGrid from "../../../objects/FormGrid";
import { currentPage, initTestRuntime, login } from "../../../support/runtime";
import Login from "../../../utils/Login";

const agsFormGrid = new FormGrid({ userType: "ags" });

test.describe("As an AGS user, I should be able to navigate to the form editor via create new form button", () => {
  test("Initiate test", async ({ page }, testInfo) => {
    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await Login.login(page, { accountType: "ags", accountIndex: 3 });
    await agsFormGrid.init();
    await agsFormGrid.clickAddNeWFormButton();
    await expect(currentPage()).toHaveURL(/createNewForm/);
  });
});