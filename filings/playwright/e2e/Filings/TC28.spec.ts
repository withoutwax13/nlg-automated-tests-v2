import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import { legacy } from '../../utils/legacy';
import Filing from "../../objects/Filing";
import FilingGrid from "../../objects/FilingGrid";
import Form from "../../objects/Form";

const taxpayerFilingGrid = new FilingGrid({
  userType: "taxpayer",
});
const filing = new Filing({ isResumingDraftApplication: false });
const form = new Form();
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

test.describe("As a taxpayer, I should be able to resume a draft filing.", () => {
  test("Initiate test", async ({ page }) => {
    await login({ accountType: "ags", accountIndex: 5 });
    agsFilingGrid.init();
    await agsFilingGrid.filterColumn(
      "Location DBA",
      "Arrakis Spice Company 40337",
      "text",
      "Contains"
    );
    await agsFilingGrid.filterColumn(
      "Form Name",
      "Food and Beverage",
      "multi-select"
    );
    agsFilingGrid.getElement();
    legacy.wrap(await agsFilingGrid.getElement().rows().count()).as("rowsLength");
    legacy.get("").then(async (rowsLength) => {
      if (Number(rowsLength) > 0) {
        deleteMultipleFiling(
          Number(rowsLength),
          ["Form Name", "Food and Beverage", "multi-select"],
          ["Location DBA", "Arrakis Spice Company 40337"]
        );
      }
    });
    await logout();

    await login({ accountType: "taxpayer", accountIndex: 1, notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Food and Beverage");
    filing.selectBusinessToFile("Arrakis Spice Company 40337");
    form.clickNextbutton(false);
    form.saveAndCloseFiling();

    taxpayerFilingGrid.init();
    taxpayerFilingGrid.filterColumn(
      "Filing Status",
      "Draft",
      "multi-select"
    );
    taxpayerFilingGrid.toggleActionButton("Resume", "Location DBA", "Arrakis Spice Company 40337");
    legacy.url().assert("include", "/filingApp/filings");
  });
});
