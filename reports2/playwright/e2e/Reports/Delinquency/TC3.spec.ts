import { test, expect } from '../../../support/pwtest';
import DelinquencyGrid from "../../../objects/DelinquencyGrid";
import ManageDelinquencyModal from "../../../objects/ManageDelinquencyModal";

test.describe(
  "As an AGS user, I should be able to dismiss and revert a delinquency report item of a government.",
  { tags: ["sanity", "regression"] },
  () => {
    test("Initiating test", () => {
      const agsDelinquencyGrid = new DelinquencyGrid({
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });
      const manageDelinquencyModal = new ManageDelinquencyModal();
      pw.login({ accountType: "ags", accountIndex: 1 });
      agsDelinquencyGrid.init();
      agsDelinquencyGrid.manageDelinquencyItemByOrder(0);
      manageDelinquencyModal.saveBusinessDetails("testBusinessData");
      manageDelinquencyModal.typeExplanation("Test explanation");
      manageDelinquencyModal.clickDismissButton();
      pw.get("@testBusinessData").then((testBusinessData: any) => {
        agsDelinquencyGrid.filterColumn(
          "Business Name (DBA)",
          testBusinessData.businessName,
          "text",
          "Is equal to"
        );
        agsDelinquencyGrid.filterColumn(
          "Filing Period",
          testBusinessData.filingPeriod,
          "multi-select"
        );
        agsDelinquencyGrid.filterColumn(
          "Form Name",
          testBusinessData.formTitle,
          "multi-select"
        );
      });
      agsDelinquencyGrid.getElement().noRecordFoundComponent().should("exist");
      agsDelinquencyGrid.clickClearAllFiltersButton();
      pw.get("@testBusinessData").then((testBusinessData: any) => {
        agsDelinquencyGrid.clickManageDelinquencyItem([
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
      agsDelinquencyGrid.getElement().noRecordFoundComponent().should("exist");
    });
  }
);
