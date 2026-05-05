import { test, expect } from '../../support/pwtest';
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

const deleteMultipleFiling = (
  count: number,
  filterParams: [string, string, string?, string?],
  filingParams: [string, string]
) => {
  agsFilingGrid.clickClearAllFiltersButton();
  agsFilingGrid.filterColumn(...filterParams);
  agsFilingGrid.deleteFiling(filingParams[0], filingParams[1]);
  if (count > 1) {
    deleteMultipleFiling(count - 1, filterParams, filingParams);
  }
};

test.describe("As a taxpayer, I should be able to delete a draft filing.", () => {
  test("Initiate test", () => {
    pw.login({ accountType: "ags", accountIndex: 3 });
    agsFilingGrid.init();
    agsFilingGrid.filterColumn(
      "Location DBA",
      "Arrakis Spice Company 2759",
      "text",
      "Contains"
    );
    agsFilingGrid.filterColumn(
      "Form Name",
      "Food and Beverage",
      "multi-select"
    );
    agsFilingGrid.getElement().rows().its("length").as("rowsLength");
    pw.get("@rowsLength").then((rowsLength) => {
      if (Number(rowsLength) > 0) {
        deleteMultipleFiling(
          Number(rowsLength),
          ["Form Name", "Food and Beverage", "multi-select"],
          ["Location DBA", "Arrakis Spice Company 2759"]
        );
      }
    });
    pw.logout();

    pw.login({ accountType: "taxpayer", accountIndex: 8, notFirstLogin: true });
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
