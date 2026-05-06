import { expect, test } from "@playwright/test";
import Filing from "../../../objects/Filing";
import FormGrid from "../../../objects/FormGrid";
import FormsSetting from "../../../objects/FormGrid/FormsSetting";
import { collectTexts, getAlias, initTestRuntime, login, logout } from "../../../support/runtime";
import Login from "../../../utils/Login";

const agsFormGrid = new FormGrid({ userType: "ags" });
const formSetting = new FormsSetting();
const filing = new Filing({ isResumingDraftApplication: false });

const normalizeFormOrder = (items: Array<string | null | undefined>) =>
  items
    .filter((item): item is string => item !== undefined && item !== null)
    .map((item) => item.trim().replace(/\s+/g, ""));

test.describe("As an AGS user, I should be able to configure the taxpayer form display arrangement", () => {
  test("Initiate test", async ({ page }, testInfo) => {
    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await Login.login({ accountType: "ags", accountIndex: 8 });
    await agsFormGrid.init();
    await agsFormGrid.clickSettingsButton();
    await formSetting.selectMunicipality("City of Arrakis");
    await formSetting.saveFormOrders("agsFormOrderBeforeMove");
    await formSetting.clickCancelButton();
    await logout();

    await Login.login({ accountType: "taxpayer", notFirstLogin: true });
    await filing.goToSubmitFormsTab();
    await filing.selectGovernment("City of Arrakis");
    const taxpayerFormOrderBeforeMove = await collectTexts(
      filing.getElements().formList().locator("li")
    );
    const agsFormOrderBeforeMove = getAlias<string[]>("agsFormOrderBeforeMove");
    expect(normalizeFormOrder(taxpayerFormOrderBeforeMove)).toEqual(
      normalizeFormOrder(agsFormOrderBeforeMove)
    );
    await logout();

    await Login.login({ accountType: "ags", accountIndex: 8, notFirstLogin: true });
    await agsFormGrid.init();
    await agsFormGrid.clickSettingsButton();
    await formSetting.selectMunicipality("City of Arrakis");
    const agsFormOrderBeforeUpdate = getAlias<string[]>("agsFormOrderBeforeMove");
    await formSetting.moveFormToLocationOf(
      String(agsFormOrderBeforeUpdate[0]),
      String(agsFormOrderBeforeUpdate[agsFormOrderBeforeUpdate.length - 1])
    );
    await formSetting.saveFormOrders("agsFormOrderAfterMove");
    await formSetting.clickSaveButton();
    await logout();

    await Login.login({ accountType: "taxpayer", notFirstLogin: true });
    await filing.goToSubmitFormsTab();
    await filing.selectGovernment("City of Arrakis");
    const taxpayerFormOrderAfterMove = await collectTexts(
      filing.getElements().formList().locator("li")
    );
    const agsFormOrderAfterMove = getAlias<string[]>("agsFormOrderAfterMove");
    expect(normalizeFormOrder(taxpayerFormOrderAfterMove)).toEqual(
      normalizeFormOrder(agsFormOrderAfterMove)
    );
  });
});