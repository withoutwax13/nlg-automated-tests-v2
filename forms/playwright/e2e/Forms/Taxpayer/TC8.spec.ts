import { expect, test } from "@playwright/test";
import ApplicationConfirmation from "../../../objects/ApplicationConfirmation";
import Filing from "../../../objects/Filing";
import FilingGrid from "../../../objects/FilingGrid";
import Form from "../../../objects/Form";
import FormPreview from "../../../objects/FormPreview";
import Payment from "../../../objects/Payment";
import { initTestRuntime, login, logout } from "../../../support/runtime";
import Login from "../../../utils/Login";

const form = new Form();
const formPreview = new FormPreview();
const payment = new Payment();
const filing = new Filing({ isResumingDraftApplication: false });
const applicationConfirmation = new ApplicationConfirmation();
const agsFilingGrid = new FilingGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

const deleteMultipleFiling = async (
  count: number,
  filterParams: [string, string, string?, string?],
  filingParams: [string, string]
) => {
  await agsFilingGrid.clickClearAllFiltersButton();
  await agsFilingGrid.filterColumn(...filterParams);
  await agsFilingGrid.deleteFiling(filingParams[0], filingParams[1]);
  if (count > 1) {
    await deleteMultipleFiling(count - 1, filterParams, filingParams);
  }
};

test.describe("As a taxpayer, I should not be able to submit to a closed business when submitting a form.", () => {
  test("Initiating test", async ({ page }, testInfo) => {
    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await Login.login({ accountType: "ags", accountIndex: 7 });
    await agsFilingGrid.init();
    await agsFilingGrid.filterColumn(
      "Location DBA",
      "Arrakis Sand Company 34855",
      "text",
      "Contains"
    );
    await agsFilingGrid.filterColumn(
      "Form Name",
      "Food and Beverage",
      "multi-select"
    );
    const rowsLength = await agsFilingGrid.getElement().rows().count();
    if (rowsLength > 0) {
      await deleteMultipleFiling(
        rowsLength,
        ["Form Name", "Food and Beverage", "multi-select"],
        ["Location DBA", "Arrakis Sand Company 34855"]
      );
    }
    await logout();

    await Login.login({ accountType: "taxpayer", accountIndex: 5, notFirstLogin: true });
    await filing.goToSubmitFormsTab();
    await filing.selectGovernment("City of Arrakis");
    await filing.selectForm("Food and Beverage");
    await filing.getElements().businessSelectionDropdown().click();
    await filing
      .getElements()
      .businessSelectionDropdown()
      .fill("Arrakis Sand Company 34855");
    await expect(
      filing.getElements().anyList().filter({ hasText: "Arrakis Sand Company 34855" })
    ).toHaveCount(0);
  });
});