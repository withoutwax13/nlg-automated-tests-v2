import { currentPage, expectPathname, listItem, normalizeWhitespace, setStoredValue, waitForLoading } from "../../support/runtime";
import { getOrderOfColumns, validateFilterOperation } from "../../utils/Grid";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
const AGS_FILING_COLUMNS = [
  "PDF",
  "View",
  "Filing Period",
  "Location DBA",
  "Location Address 1",
  "Total Due",
  "Payment Status",
  "Transaction Date",
  "Funding Date",
  "Form Name",
  "Approval Status",
  "Filing Date",
  "Payment Type",
  "Reference ID",
  "State Tax ID",
  "Filing Frequency",
];
const MUNICIPAL_FILING_COLUMNS = [...AGS_FILING_COLUMNS];
const TAXPAYER_FILING_COLUMNS = [
  "Action Button",
  "Filing Period",
  "Filing Status",
  "Location DBA",
  "Location Address 1",
  "Total Due",
  "Payment Status",
  "Government",
  "Transaction Date",
  "Form Name",
  "Approval Status",
  "Filing Date",
  "Payment Type",
  "Reference ID",
  "State Tax ID",
  "Filing Frequency",
];

const removeSpaces = (text: string) => text.replace(/\s/g, "");

class FilingGrid {
  userType: string;
  municipalitySelection: string;
  defaultGridColumnsAlias: string;
  sortType: string;

  constructor(props: {
    userType: string;
    municipalitySelection?: string;
    sortType?: string;
  }) {
    if (!["ags", "municipal", "taxpayer"].includes(props.userType)) {
      throw new Error("Invalid user type");
    }
    this.userType = props.userType;
    this.municipalitySelection = props.municipalitySelection || "City of Arrakis";
    this.defaultGridColumnsAlias = "defaultFilingGridColumns";
    this.sortType = props.sortType || "default";
  }

  private get columnsForUserType() {
    if (this.userType === "ags") return AGS_FILING_COLUMNS;
    if (this.userType === "municipal") return MUNICIPAL_FILING_COLUMNS;
    return TAXPAYER_FILING_COLUMNS;
  }

  private elements() {
    return {
      searchBox: () => currentPage().locator("span").filter({ has: currentPage().locator(".fa-magnifying-glass") }).first(),
      columns: () => currentPage().locator("thead tr th"),
      rows: () => currentPage().locator("tbody tr"),
      customizeTableViewButton: () => currentPage().getByText("Customize Table View").first(),
      specificColumnFilter: (columnOrder: number) => this.getElement().columns().nth(columnOrder).locator("span a").first(),
      itemsPerPageDropdown: () => currentPage().locator(".k-dropdownlist").first(),
      itemsPerPageDropdownItem: (itemNumber: number) => currentPage().locator("li").filter({ hasText: `${itemNumber}` }).first(),
      filterOperationsDropdown: () => currentPage().locator(".k-filter-menu-container .k-dropdownlist").first(),
      filterOperationsDropdownItem: (item: string) =>
        currentPage().locator(".k-list-ul li .k-list-item-text").filter({ hasText: item }).first(),
      filterValueInput: () => currentPage().locator(".k-filter-menu-container .k-input").first(),
      filterValueDateInput: () => currentPage().locator(".k-dateinput").first(),
      filterMultiSelectItem: () => currentPage().locator(".k-multicheck-wrap li"),
      filterFilterButton: () =>
        currentPage().locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      searchMunicipalityDropdown: () => currentPage().locator('input[placeholder="Search government ..."]').first(),
      clearAllFiltersButton: () => currentPage().getByText("Clear All").first(),
      exportButton: () => currentPage().locator(".NLGButtonSecondary").filter({ hasText: "Export" }).first(),
      viewRequestedExtractButton: () => currentPage().locator("a").filter({ hasText: "View requested extracts" }).first(),
    };
  }

  private async columnIndexes() {
    return getOrderOfColumns(this.columnsForUserType, `${this.userType}_${this.defaultGridColumnsAlias}`);
  }

  private async rowForValue(anchorColumnName: string, anchorValue: string) {
    const columnIndexes = await this.columnIndexes();
    const anchorColumnIndex = columnIndexes[anchorColumnName];
    const rows = this.getElement().rows();
    const count = await rows.count();

    for (let index = 0; index < count; index += 1) {
      const row = rows.nth(index);
      const cell = row.locator("td").nth(anchorColumnIndex);
      if (normalizeWhitespace(await cell.textContent()) === anchorValue) {
        return row;
      }
    }

    throw new Error(`Row not found for ${anchorColumnName}=${anchorValue}`);
  }

  private async clickColumn(index: number) {
    await this.getElement().columns().nth(index).click();
  }

  private async handleGeneralSorting(index: number, isAscending: boolean) {
    if (isAscending && (this.sortType === "default" || this.sortType === "descending")) {
      await this.clickColumn(index);
      this.sortType = "ascending";
    } else if (!isAscending && this.sortType === "ascending") {
      await this.clickColumn(index);
      this.sortType = "descending";
    }
  }

  private async handleTextFilter(columnIndex: number, filterValue: string, filterOperation: string) {
    validateFilterOperation("text", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click();
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    if (!["Is not null", "Is null"].includes(filterOperation)) {
      await this.getElement().filterValueInput().fill(filterValue);
    }
    await this.getElement().filterFilterButton().click();
  }

  private async handleDateFilter(columnIndex: number, filterValue: string, filterOperation: string) {
    validateFilterOperation("date", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click();
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    await this.getElement().filterValueDateInput().fill(filterValue);
    await this.getElement().filterFilterButton().click();
  }

  private async handleNumberFilter(columnIndex: number, filterValue: string, filterOperation: string) {
    validateFilterOperation("number", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click();
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    await this.getElement().filterValueInput().fill(filterValue);
    await this.getElement().filterFilterButton().click();
  }

  private async handleMultiSelectFilter(columnIndex: number, filterValue: string) {
    await this.getElement().specificColumnFilter(columnIndex).click();
    await this.getElement().filterMultiSelectItem().filter({ hasText: filterValue }).first().click();
    await this.getElement().filterFilterButton().click();
  }

  getElement() {
    return this.elements();
  }

  async init() {
    await currentPage().goto("/filingApp/filingList");
    await waitForLoading();
    if (this.userType === "ags") {
      await this.selectMunicipality(this.municipalitySelection);
    }
    await this.columnIndexes();
  }

  async selectMunicipality(municipality: string) {
    await this.getElement().searchMunicipalityDropdown().fill(municipality);
    await listItem(municipality).click();
    await waitForLoading();
    await currentPage().locator("button").filter({ hasText: "Search" }).first().click();
    await waitForLoading();
  }

  async sortColumn(isAscending: boolean, columnName: string) {
    const columnIndexes = await this.columnIndexes();
    await this.clickColumn(columnIndexes[columnName]);
    await this.handleGeneralSorting(columnIndexes[columnName], isAscending);
  }

  async filterColumn(
    columnName: string,
    filterValue: string,
    filterType = "text",
    filterOperation = "Contains"
  ) {
    const columnIndexes = await this.columnIndexes();
    const columnIndex = columnIndexes[columnName];

    switch (filterType) {
      case "text":
        await this.handleTextFilter(columnIndex, filterValue, filterOperation);
        break;
      case "date":
        await this.handleDateFilter(columnIndex, filterValue, filterOperation);
        break;
      case "number":
        await this.handleNumberFilter(columnIndex, filterValue, filterOperation);
        break;
      case "multi-select":
        await this.handleMultiSelectFilter(columnIndex, filterValue);
        break;
      default:
        break;
    }
  }

  async changeItemsPerPage(itemNumber: number) {
    if (!VALID_ITEMS_PER_PAGE.includes(itemNumber)) {
      throw new Error("Invalid items per page number");
    }
    await this.getElement().itemsPerPageDropdown().click();
    await this.getElement().itemsPerPageDropdownItem(itemNumber).click();
  }

  async clickCustomizeTableViewButton() {
    await this.getElement().customizeTableViewButton().click();
  }

  async clickClearAllFiltersButton() {
    await this.getElement().clearAllFiltersButton().click();
  }

  async getDataOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string,
    targetColumnDataAlias: string
  ) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const columnIndexes = await this.columnIndexes();
    const row = await this.rowForValue(anchorColumnName, anchorValue);
    const text = normalizeWhitespace(
      await row.locator("td").nth(columnIndexes[targetColumnName]).textContent()
    );
    return setStoredValue(targetColumnDataAlias, text);
  }

  async getElementOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string,
    targetColumnElementAlias: string
  ) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const columnIndexes = await this.columnIndexes();
    const row = await this.rowForValue(anchorColumnName, anchorValue);
    return setStoredValue(
      targetColumnElementAlias,
      row.locator("td").nth(columnIndexes[targetColumnName])
    );
  }

  async toggleActionButton(action: string, anchorColumnName: string, anchorValue: string) {
    if (this.userType !== "taxpayer") {
      throw new Error("Action button is not available for this user type");
    }
    const row = await this.rowForValue(anchorColumnName, anchorValue);
    await row.locator("button").first().click();
    await listItem(action).click();
  }

  async deleteFiling(anchorColumnName: string, anchorValue: string) {
    const row = await this.rowForValue(anchorColumnName, anchorValue);
    if (this.userType === "taxpayer") {
      await this.toggleActionButton("Delete", anchorColumnName, anchorValue);
      await currentPage().locator(".k-dialog-actions button").filter({ hasText: "Delete" }).first().click();
      return;
    }
    if (this.userType === "ags") {
      await row.locator("button").first().click();
      await listItem("Delete Filing").click();
      await currentPage().locator(".k-dialog-actions button").filter({ hasText: "Delete" }).first().click();
      await waitForLoading();
      return;
    }
    throw new Error("Delete action is not available for this user type");
  }

  async updateStatus(newStatus: string, anchorColumnName: string, anchorValue: string) {
    if (this.userType !== "ags") {
      throw new Error("Update status action is not available for this user type");
    }
    const row = await this.rowForValue(anchorColumnName, anchorValue);
    await row.locator("button").first().click();
    await listItem("Update Status").click();
    await currentPage().locator(`.k-window-content .k-radio-list input[value="${newStatus}"]`).first().click();
    await currentPage().locator(".k-dialog-actions button").filter({ hasText: "Save" }).first().click();
    await waitForLoading();
  }

  async checkAuditLog(anchorColumnName: string, anchorValue: string) {
    const row = await this.rowForValue(anchorColumnName, anchorValue);
    await row.locator("button").first().click();
    await listItem("Audit Log").click();
    await waitForLoading();
  }

  async clickExportButton(isExportFullData = true) {
    await this.getElement().exportButton().click();
    if (this.userType !== "taxpayer") {
      const buttonText = isExportFullData ? "Export Full Data" : "Export View";
      await currentPage().locator(".k-actions button").filter({ hasText: buttonText }).first().click();
    }
  }

  async clickViewRequestedExtractButton() {
    await this.getElement().viewRequestedExtractButton().click();
  }

  async searchFiling(searchValue: string) {
    await this.getElement().searchBox().fill(searchValue);
  }

  async setStartDate({
    month,
    day,
    year,
  }: {
    month: string;
    day: string;
    year: string;
  }) {
    await currentPage().locator(":nth-child(1) > .k-datepicker").fill(`${month}/${day}/${year}`);
    await currentPage().locator(".NLGButtonPrimary").first().click();
    await waitForLoading();
  }

  async getColumnCellsData(columnName: string) {
    const columnIndexes = await this.columnIndexes();
    const rows = this.getElement().rows();
    const count = await rows.count();
    const values: string[] = [];

    for (let index = 0; index < count; index += 1) {
      values.push(
        normalizeWhitespace(
          await rows.nth(index).locator("td").nth(columnIndexes[columnName]).textContent()
        )
      );
    }

    return setStoredValue("columnCellsData", values);
  }

  async addCustomField(customFieldTitle: string, customFieldName: string) {
    if (this.userType !== "ags") {
      return;
    }
    await currentPage().goto("/municipalityApp/list/:tab");
    const row = currentPage().locator("tr").filter({ hasText: this.municipalitySelection }).first();
    await row.locator("td").nth(0).locator("i").first().click();
    await waitForLoading();
    await currentPage().locator("h2").filter({ hasText: "Filing List Configuration" }).first().scrollIntoViewIfNeeded();
    await currentPage().locator("button").filter({ hasText: "Add New Column" }).first().click();
    await currentPage().locator('input[name^="ColumnsToAddToFilingList"][name$=".Title"]').last().fill(customFieldTitle);
    await currentPage().locator('input[name^="ColumnsToAddToFilingList"][name$=".Name"]').last().fill(customFieldName);
    await currentPage().locator("button").filter({ hasText: /^Save$/ }).first().click();
    await expectPathname("/municipalityApp/list/:tab");
  }

  async removeCustomField(customFieldName: string) {
    await currentPage().goto("/municipalityApp/list/:tab");
    const row = currentPage().locator("tr").filter({ hasText: this.municipalitySelection }).first();
    await row.locator("td").nth(0).locator("i").first().click();
    await waitForLoading();
    await currentPage().locator("h2").filter({ hasText: "Filing List Configuration" }).first().scrollIntoViewIfNeeded();

    const inputs = currentPage().locator("input");
    const count = await inputs.count();
    for (let index = 0; index < count; index += 1) {
      if ((await inputs.nth(index).inputValue()) === customFieldName) {
        await inputs
          .nth(index)
          .locator("xpath=../..")
          .locator("div")
          .last()
          .locator("button")
          .filter({ hasText: "Remove" })
          .first()
          .click();
        break;
      }
    }

    await currentPage().locator("button").filter({ hasText: /^Save$/ }).first().click();
    await expectPathname("/municipalityApp/list/:tab");
  }

  async isColumnExist(columnName: string, variableAlias: string) {
    const columns = this.columnsForUserType.includes(columnName)
      ? this.columnsForUserType
      : [...this.columnsForUserType, columnName];
    const columnIndexes = await getOrderOfColumns(
      columns,
      `${this.userType}_${this.defaultGridColumnsAlias}AfterAdditionalColumn`
    );
    return setStoredValue(variableAlias, columnIndexes[columnName] !== undefined);
  }
}

export default FilingGrid;
