import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import { legacy } from '../../utils/legacy';
import Filing from "../../objects/Filing";
import FilingGrid from "../../objects/FilingGrid";
import Form from "../../objects/Form";
import Login from "../../utils/Login";

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

test.describe("As a taxpayer, I should be able to delete a draft filing.", () => {
  test("Initiate test", async ({ page }) => {
    await Login.login(page, { accountType: "ags", accountIndex: 3 });
    agsFilingGrid.init();
    await agsFilingGrid.filterColumn(
      "Location DBA",
      "Arrakis Spice Company 2759",
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
          ["Location DBA", "Arrakis Spice Company 2759"]
        );
      }
    });
    await logout();

    await Login.login(page, { accountType: "taxpayer", accountIndex: 8, notFirstLogin: true });
    filing.goToSubmitFormsTab();
    filing.selectGovernment("City of Arrakis");
    filing.selectForm("Food and Beverage");
    filing.selectBusinessToFile("Arrakis Spice Company 2759");
    form.clickNextbutton(false);
    form.saveAndCloseFiling();

    taxpayerFilingGrid.init();
    taxpayerFilingGrid.filterColumn(
      "Filing Status",
      "Draft",
      "multi-select"
    );
    taxpayerFilingGrid.deleteFiling("Location DBA", "Arrakis Spice Company 2759");
  });
});