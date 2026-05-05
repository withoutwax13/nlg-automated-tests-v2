import { test, expect } from '../../../support/pwtest';
import FormGrid from "../../../objects/FormGrid";
import FormsSetting from "../../../objects/FormGrid/FormsSetting";
import Filing from "../../../objects/Filing";

const agsFormGrid = new FormGrid({ userType: "ags" });
const formSetting = new FormsSetting();
const filing = new Filing({ isResumingDraftApplication: false });

test.describe("As an AGS user, I should be able to configure the taxpayer form display arrangement", () => {
  test("Initiate test", () => {
    pw.login({ accountType: "ags", accountIndex: 8 });
    agsFormGrid.init();
    agsFormGrid.clickSettingsButton();
    formSetting.selectMunicipality("City of Arrakis");
    formSetting.saveFormOrders("agsFormOrderBeforeMove");
    formSetting.clickCancelButton();
    pw.logout();

    pw.login({ accountType: "taxpayer", notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    pw.wrap([]).as("taxpayerFormOrderBeforeMove");
    filing
      .getElements()
      .formList()
      .find("li")
      .each(($taxpayerDisplayedForm) => {
        pw.get("@taxpayerFormOrderBeforeMove").then((taxpayerFormOrder) => {
          pw.wrap([...taxpayerFormOrder, $taxpayerDisplayedForm.text()]).as(
            "taxpayerFormOrderBeforeMove"
          );
        });
      });
    pw.get("@taxpayerFormOrderBeforeMove").then((taxpayerFormOrder) => {
      pw.get("@agsFormOrderBeforeMove").then((agsFormOrder) => {
        console.log(taxpayerFormOrder);
        console.log(agsFormOrder);
        expect(
          taxpayerFormOrder
            .filter((item) => item !== undefined && item !== null)
            .map((item) => String(item).trim().replace(/\s+/g, ""))
        ).to.deep.equal(
          agsFormOrder
            .filter((item) => item !== undefined && item !== null)
            .map((item) => String(item).trim().replace(/\s+/g, ""))
        );
      });
    });
    pw.logout();

    pw.login({ accountType: "ags", accountIndex: 8, notFirstLogin: true });
    agsFormGrid.init();
    agsFormGrid.clickSettingsButton();
    formSetting.selectMunicipality("City of Arrakis");
    pw.get("@agsFormOrderBeforeMove").then((agsFormOrder) => {
      formSetting.moveFormToLocationOf(
        String(agsFormOrder[0]),
        String(agsFormOrder[agsFormOrder.length - 1])
      );
    });
    formSetting.saveFormOrders("agsFormOrderAfterMove");
    formSetting.clickSaveButton();
    pw.logout();

    pw.login({ accountType: "taxpayer", notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    pw.wrap([]).as("taxpayerFormOrderAfterMove");
    filing
      .getElements()
      .formList()
      .find("li")
      .each(($taxpayerDisplayedForm) => {
        pw.get("@taxpayerFormOrderAfterMove").then((taxpayerFormOrder) => {
          pw.wrap([...taxpayerFormOrder, $taxpayerDisplayedForm.text()]).as(
            "taxpayerFormOrderAfterMove"
          );
        });
      });
    pw.get("@taxpayerFormOrderAfterMove").then((taxpayerFormOrder) => {
      pw.get("@agsFormOrderAfterMove").then((agsFormOrder) => {
        expect(
          taxpayerFormOrder
            .filter((item) => item !== undefined && item !== null)
            .map((item) => String(item).trim().replace(/\s+/g, ""))
        ).to.deep.equal(
          agsFormOrder
            .filter((item) => item !== undefined && item !== null)
            .map((item) => String(item).trim().replace(/\s+/g, ""))
        );
      });
    });
  });
});
