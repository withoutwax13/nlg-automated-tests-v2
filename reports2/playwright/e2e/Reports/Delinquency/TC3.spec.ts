import { expect, test } from "@playwright/test";
import DelinquencyGrid from "../../../objects/DelinquencyGrid";
import ManageDelinquencyModal from "../../../objects/ManageDelinquencyModal";
import Login from "../../../utils/Login";

test.describe(
  "As an AGS user, I should be able to dismiss and revert a delinquency report item of a government.",
  () => {
    test("Initiating test", async ({ page }) => {
      const agsDelinquencyGrid = new DelinquencyGrid(page, {
        userType: "ags",
        municipalitySelection: "City of Arrakis",
      });
      const manageDelinquencyModal = new ManageDelinquencyModal(page);

      await Login.login(page, { accountType: "ags", accountIndex: 1 });
      await agsDelinquencyGrid.init();
      await agsDelinquencyGrid.manageDelinquencyItemByOrder(0);

      const testBusinessData = await manageDelinquencyModal.saveBusinessDetails();
      await manageDelinquencyModal.typeExplanation("Test explanation");
      await manageDelinquencyModal.clickDismissButton();

      await agsDelinquencyGrid.filterColumn(
        "Business Name (DBA)",
        testBusinessData.businessName,
        "text",
        "Is equal to"
      );
      await agsDelinquencyGrid.filterColumn(
        "Filing Period",
        testBusinessData.filingPeriod,
        "multi-select"
      );
      await agsDelinquencyGrid.filterColumn("Form Name", testBusinessData.formTitle, "multi-select");
      await expect(agsDelinquencyGrid.getElement().noRecordFoundComponent()).toBeVisible();

      await agsDelinquencyGrid.clickClearAllFiltersButton();
      await agsDelinquencyGrid.clickManageDelinquencyItem([
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

      await manageDelinquencyModal.clickRevertDismissalButton();
      await expect(agsDelinquencyGrid.getElement().noRecordFoundComponent()).toBeVisible();
    });
  }
);
