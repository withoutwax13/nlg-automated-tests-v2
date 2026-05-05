import FormGrid from "../../../objects/FormGrid";
import FormsSetting from "../../../objects/FormGrid/FormsSetting";
import Filing from "../../../objects/Filing";

const agsFormGrid = new FormGrid({ userType: "ags" });
const formSetting = new FormsSetting();
const filing = new Filing({ isResumingDraftApplication: false });

describe("As an AGS user, I should be able to configure the taxpayer form display arrangement", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 8 });
    agsFormGrid.init();
    agsFormGrid.clickSettingsButton();
    formSetting.selectMunicipality("City of Arrakis");
    formSetting.saveFormOrders("agsFormOrderBeforeMove");
    formSetting.clickCancelButton();
    cy.logout();

    cy.login({ accountType: "taxpayer", notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    cy.wrap([]).as("taxpayerFormOrderBeforeMove");
    filing
      .getElements()
      .formList()
      .find("li")
      .each(($taxpayerDisplayedForm) => {
        cy.get("@taxpayerFormOrderBeforeMove").then((taxpayerFormOrder) => {
          cy.wrap([...taxpayerFormOrder, $taxpayerDisplayedForm.text()]).as(
            "taxpayerFormOrderBeforeMove"
          );
        });
      });
    cy.get("@taxpayerFormOrderBeforeMove").then((taxpayerFormOrder) => {
      cy.get("@agsFormOrderBeforeMove").then((agsFormOrder) => {
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
    cy.logout();

    cy.login({ accountType: "ags", accountIndex: 8, notFirstLogin: true });
    agsFormGrid.init();
    agsFormGrid.clickSettingsButton();
    formSetting.selectMunicipality("City of Arrakis");
    cy.get("@agsFormOrderBeforeMove").then((agsFormOrder) => {
      formSetting.moveFormToLocationOf(
        String(agsFormOrder[0]),
        String(agsFormOrder[agsFormOrder.length - 1])
      );
    });
    formSetting.saveFormOrders("agsFormOrderAfterMove");
    formSetting.clickSaveButton();
    cy.logout();

    cy.login({ accountType: "taxpayer", notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    cy.wrap([]).as("taxpayerFormOrderAfterMove");
    filing
      .getElements()
      .formList()
      .find("li")
      .each(($taxpayerDisplayedForm) => {
        cy.get("@taxpayerFormOrderAfterMove").then((taxpayerFormOrder) => {
          cy.wrap([...taxpayerFormOrder, $taxpayerDisplayedForm.text()]).as(
            "taxpayerFormOrderAfterMove"
          );
        });
      });
    cy.get("@taxpayerFormOrderAfterMove").then((taxpayerFormOrder) => {
      cy.get("@agsFormOrderAfterMove").then((agsFormOrder) => {
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
