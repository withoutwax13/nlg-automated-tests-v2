import { test, expect } from '@playwright/test';
import DelinquencyGrid from "../../../objects/DelinquencyGrid";
import ManageDelinquencyModal from "../../../objects/ManageDelinquencyModal";

test.describe(
  "As a municipal user, I should be able to dismiss and revert a delinquency report item of a government",
  { tags: ["regression"] },
  () => {
    test("Initiating test", () => {
      const municipalDelinquencyGrid = new DelinquencyGrid({
        userType: "municipal",
        municipalitySelection: "City of Arrakis",
      });
      const manageDelinquencyModal = new ManageDelinquencyModal();
      cy.login({ accountType: "municipal", accountIndex: 1 });
      municipalDelinquencyGrid.init();
      municipalDelinquencyGrid
        .getElement()
        .noRecordFoundComponent()
        .should("not.exist");
      municipalDelinquencyGrid.manageDelinquencyItemByOrder(2);
      manageDelinquencyModal.saveBusinessDetails("testBusinessData");
      manageDelinquencyModal.typeExplanation("Test explanation");
      manageDelinquencyModal.clickDismissButton();
      cy.get("@testBusinessData").then((testBusinessData: any) => {
        municipalDelinquencyGrid.filterColumn(
          "Business Name (DBA)",
          testBusinessData.businessName,
          "text",
          "Is equal to"
        );
        municipalDelinquencyGrid.filterColumn(
          "Filing Period",
          testBusinessData.filingPeriod,
          "multi-select"
        );
        municipalDelinquencyGrid.filterColumn(
          "Form Name",
          testBusinessData.formTitle,
          "multi-select"
        );
      });
      municipalDelinquencyGrid
        .getElement()
        .noRecordFoundComponent()
        .should("exist");
      municipalDelinquencyGrid.clickClearAllFiltersButton();
      cy.get("@testBusinessData").then((testBusinessData: any) => {
        municipalDelinquencyGrid.clickManageDelinquencyItem([
          {
            anchorColumnName: "Is Dismissed",
            anchorValue: "Yes",
          },
          {
            anchorColumnName: "Business Name (DBA)",
            anchorValue: testBusinessData.businessName,
          },
          {
            anchorColumnName: "Filing Period",
            anchorValue: testBusinessData.filingPeriod,
          },
          {
            anchorColumnName: "Form Name",
            anchorValue: testBusinessData.formTitle,
          },
        ]);
      });
      manageDelinquencyModal.clickRevertDismissalButton();
      municipalDelinquencyGrid
        .getElement()
        .noRecordFoundComponent()
        .should("exist");
    });
  }
);
