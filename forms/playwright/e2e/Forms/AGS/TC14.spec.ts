import { expect, test } from "@playwright/test";
import Filing from "../../../objects/Filing";
import FormGrid from "../../../objects/FormGrid";
import FormsSetting from "../../../objects/FormGrid/FormsSetting";
import { getAlias, initTestRuntime, login, logout } from "../../../support/runtime";

const agsFormsGrid = new FormGrid({ userType: "ags" });
const formsSettingModal = new FormsSetting();
const filing = new Filing({ isResumingDraftApplication: false });

test.describe("As an AGS user, the current taxpayer form display arrangement in the settings should be the same as the taxpayer filing experience", () => {
  test("Initiate test", async ({ page }, testInfo) => {
    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await login({ accountType: "ags", accountIndex: 7 });
    await agsFormsGrid.init();
    await agsFormsGrid.clickSettingsButton();
    await formsSettingModal.selectMunicipality("City of Arrakis");
    await formsSettingModal.saveFormOrders("arrakisTaxpayerForms");
    await formsSettingModal.clickSaveButton();
    await logout();

    await login({ accountType: "taxpayer", notFirstLogin: true });
    await filing.goToSubmitFormsTab();
    await filing.selectGovernment("City of Arrakis");

    const arrakisTaxpayerForms = getAlias<string[]>("arrakisTaxpayerForms");

    for (const [index, formName] of arrakisTaxpayerForms.entries()) {
      await expect(filing.getElements().formLinkItem(formName)).toHaveCount(1);
      await expect(filing.getElements().formList().locator("li").nth(index)).toContainText(formName);
    }
  });
});
