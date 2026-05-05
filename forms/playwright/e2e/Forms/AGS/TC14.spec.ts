import { test, expect } from '../../../support/pwtest';
import Filing from "../../../objects/Filing";
import FormGrid from "../../../objects/FormGrid";
import FormsSetting from "../../../objects/FormGrid/FormsSetting";

const agsFormsGrid = new FormGrid({ userType: "ags" });
const formsSettingModal = new FormsSetting();
const filing = new Filing({ isResumingDraftApplication: false });

test.describe("As an AGS user, the current taxpayer form display arrangement in the settings should be the same as the taxpayer filing experience", () => {
  test("Initiate test", () => {
    pw.login({ accountType: "ags", accountIndex: 7 });
    agsFormsGrid.init();
    agsFormsGrid.clickSettingsButton();
    formsSettingModal.selectMunicipality("City of Arrakis");
    formsSettingModal.saveFormOrders("arrakisTaxpayerForms");
    formsSettingModal.clickSaveButton();
    pw.logout();

    pw.login({ accountType: "taxpayer", notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    pw.get("@arrakisTaxpayerForms").then((arrakisTaxpayerForms) => {
      arrakisTaxpayerForms.forEach((formName: string, index: number) => {
        filing.getElements().formLinkItem(formName).should("exist");
        filing
          .getElements()
          .formList()
          .find("li")
          .eq(index)
          .should("contain.text", formName);
      });
    });
  });
});
