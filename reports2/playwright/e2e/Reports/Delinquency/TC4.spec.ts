import { expect, test } from "@playwright/test";
import DelinquencyGrid from "../../../objects/DelinquencyGrid";
import ManageDelinquencyModal from "../../../objects/ManageDelinquencyModal";
import Login from "../../../utils/Login";

test.describe(
  "As a municipal user, I should be able to dismiss and revert a delinquency report item of a government",
  { tags: ["regression"] },
  () => {
    test("Initiating test", async ({ page }) => {
      const municipalDelinquencyGrid = new DelinquencyGrid(page, {
        userType: "municipal",
        municipalitySelection: "City of Arrakis",
      });
      const manageDelinquencyModal = new ManageDelinquencyModal(page);

      await Login.login(page, { accountType: "municipal", accountIndex: 1 });
      await municipalDelinquencyGrid.init();
      await expect(municipalDelinquencyGrid.getElement().noRecordFoundComponent()).toHaveCount(0);

      await municipalDelinquencyGrid.manageDelinquencyItemByOrder(2);
      const testBusinessData = await manageDelinquencyModal.saveBusinessDetails();
      await manageDelinquencyModal.typeExplanation("Test explanation");
      await manageDelinquencyModal.clickDismissButton();

      await municipalDelinquencyGrid.filterColumn(
        "Business Name (DBA)",
        testBusinessData.businessName,
        "text",
        "Is equal to"
      );
      await municipalDelinquencyGrid.filterColumn(
        "Filing Period",
        testBusinessData.filingPeriod,
        "multi-select"
      );
      await municipalDelinquencyGrid.filterColumn(
        "Form Name",
        testBusinessData.formTitle,
        "multi-select"
      );
      await expect(municipalDelinquencyGrid.getElement().noRecordFoundComponent()).toBeVisible();

      await municipalDelinquencyGrid.clickClearAllFiltersButton();
      await municipalDelinquencyGrid.clickManageDelinquencyItem([
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
      await expect(municipalDelinquencyGrid.getElement().noRecordFoundComponent()).toBeVisible();
    });
  }
);
