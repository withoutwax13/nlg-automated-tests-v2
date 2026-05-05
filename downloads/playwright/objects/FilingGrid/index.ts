import type { Locator, Page } from "@playwright/test";
import { getOrderOfColumns, validateFilterOperation } from "../../utils/Grid";
import { clickLocatorByText, waitForLoading } from "../../support/native-helpers";

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
  page: Page;
  private columnIndexes?: Record<string, number>;

  constructor(
    page: Page,
    props: {
      userType: string;
      municipalitySelection?: string;
      sortType?: string;
    }
  ) {
    if (["ags", "municipal", "taxpayer"].indexOf(props.userType) === -1) {
      throw new Error("Invalid user type");
    }
    this.page = page;
    this.userType = props.userType;
    this.municipalitySelection = props.municipalitySelection || "City of Arrakis";
    this.defaultGridColumnsAlias = "defaultFilingGridColumns";
    this.sortType = props.sortType ? props.sortType : "default";
  }

  async init() {
    await this.page.goto("/filingApp/filingList");
    await waitForLoading(this.page);
    if (this.userType === "ags") {
      await this.selectMunicipality(this.municipalitySelection);
      this.columnIndexes = await getOrderOfColumns(this.page, AGS_FILING_COLUMNS);
    } else if (this.userType === "municipal") {
      this.columnIndexes = await getOrderOfColumns(this.page, MUNICIPAL_FILING_COLUMNS);
    } else {
      this.columnIndexes = await getOrderOfColumns(this.page, TAXPAYER_FILING_COLUMNS);
    }
    await waitForLoading(this.page);
  }

  private elements() {
    return {
      searchBox: () => this.page.locator("div").filter({ has: this.page.locator(".fa-magnifying-glass") }).first(),
      columns: () => this.page.locator("thead tr th"),
      rows: () => this.page.locator("tbody tr"),
      customizeTableViewButton: () => this.page.getByText("Customize Table View", { exact: false }).first(),
      specificColumnFilter: (columnOrder: number) =>
        this.page.locator("thead tr th").nth(columnOrder).locator("span a").first(),
      itemsPerPageDropdown: () => this.page.locator(".k-dropdownlist").first(),
      itemsPerPageDropdownItem: (itemNumber: number) =>
        this.page.locator("li").filter({ hasText: String(itemNumber) }).first(),
      pagination: () => this.page.locator(".k-pager-numbers-wrap"),
      goToNextPageButton: () =>
        this.page.locator('button[title="Go to the next page"]').first(),
      filterOperationsDropdown: () =>
        this.page.locator(".k-filter-menu-container .k-dropdownlist").first(),
      filterOperationsDropdownItem: (item: string) =>
        this.page.locator(".k-list-ul li .k-list-item-text").filter({ hasText: item }).first(),
      filterValueInput: () => this.page.locator(".k-filter-menu-container .k-input").first(),
      filterValueDateInput: () => this.page.locator(".k-dateinput").first(),
      filterMultiSelectItem: () => this.page.locator(".k-multicheck-wrap li"),
      filterFilterButton: () =>
        this.page.locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      searchMunicipalityDropdown: () =>
        this.page.locator('input[placeholder="Search government ..."]').first(),
      anyList: () => this.page.locator("li"),
      anyButton: () => this.page.locator("button"),
      clearAllFiltersButton: () => this.page.getByText("Clear All", { exact: false }).first(),
      exportButton: () => this.page.locator(".NLGButtonSecondary").filter({ hasText: "Export" }).first(),
      viewRequestedExtractButton: () => this.page.locator("a").filter({ hasText: "View requested extracts" }).first(),
    };
  }

  getElement() {
    return this.elements();
  }

  private async getColumnIndexes() {
    if (!this.columnIndexes) {
      this.columnIndexes = await getOrderOfColumns(
        this.page,
        this.userType === "ags"
          ? AGS_FILING_COLUMNS
          : this.userType === "municipal"
            ? MUNICIPAL_FILING_COLUMNS
            : TAXPAYER_FILING_COLUMNS
      );
    }

    return this.columnIndexes;
  }

  async selectMunicipality(municipality: string) {
    await this.getElement().searchMunicipalityDropdown().fill(municipality);
    await this.getElement().anyList().filter({ hasText: municipality }).first().click();
    await waitForLoading(this.page);
    await clickLocatorByText(this.getElement().anyButton(), "Search");
    await waitForLoading(this.page);
  }

  private async clickColumn(index: number) {
    await this.getElement().columns().nth(index).click();
  }

  private async handleDBASorting(index: number, isAscending: boolean) {
    if (!isAscending && this.sortType === "default") {
      await this.clickColumn(index);
      this.sortType = "descending";
    } else if (isAscending && this.sortType === "descending") {
      await this.clickColumn(index);
      this.sortType = "ascending";
    }
  }

  private async handleGeneralSorting(index: number, isAscending: boolean) {
    if (
      isAscending &&
      (this.sortType === "default" || this.sortType === "descending")
    ) {
      await this.clickColumn(index);
      this.sortType = "ascending";
    } else if (!isAscending && this.sortType === "ascending") {
      await this.clickColumn(index);
      this.sortType = "descending";
    }
  }

  async sortColumn(isAscending: boolean, columnName: string) {
    const columnIndexes = await this.getColumnIndexes();
    const columnIndex = columnIndexes[columnName];
    await this.clickColumn(columnIndex);
    if (columnName === "DBA") {
      await this.handleDBASorting(columnIndex, isAscending);
    } else {
      await this.handleGeneralSorting(columnIndex, isAscending);
    }
  }

  private async handleTextFilter(columnIndex: number, filterValue: string, filterOperation: string) {
    validateFilterOperation("text", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click();
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    if (filterOperation !== "Is not null" && filterOperation !== "Is null") {
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
    const item = this.getElement().filterMultiSelectItem().filter({ hasText: filterValue }).first();
    await item.locator("input").click();
    await this.getElement().filterFilterButton().click();
  }

  async filterColumn(
    columnName: string,
    filterValue: string,
    filterType: string = "text",
    filterOperation: string = "Contains"
  ) {
    const columnIndexes = await this.getColumnIndexes();
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
    await waitForLoading(this.page);
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

  async getDataOfColumn(targetColumnName: string, anchorColumnName: string, anchorValue: string) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const columnIndexes = await this.getColumnIndexes();
    const columnIndex = columnIndexes[targetColumnName];
    const anchorColumnIndex = columnIndexes[anchorColumnName];
    const rows = await this.getElement().rows().all();

    for (const row of rows) {
      const cells = row.locator("td");
      if ((await cells.nth(anchorColumnIndex).innerText()).trim() === anchorValue) {
        return (await cells.nth(columnIndex).innerText()).trim();
      }
    }

    return "";
  }

  async getElementOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string
  ) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const columnIndexes = await this.getColumnIndexes();
    const columnIndex = columnIndexes[targetColumnName];
    const anchorColumnIndex = columnIndexes[anchorColumnName];
    const rows = await this.getElement().rows().all();

    for (const row of rows) {
      const cells = row.locator("td");
      if ((await cells.nth(anchorColumnIndex).innerText()).replace(/\s+/g, " ").trim() === anchorValue) {
        return cells.nth(columnIndex);
      }
    }

    return this.page.locator("__missing__");
  }

  async toggleActionButton(action: string, anchorColumnName: string, anchorValue: string) {
    if (this.userType !== "taxpayer") {
      throw new Error("Action button is not available for this user type");
    }
    const actionCell = await this.getElementOfColumn("Action Button", anchorColumnName, anchorValue);
    await actionCell.click();
    await clickLocatorByText(this.getElement().anyList(), action);
  }

  async deleteFiling(anchorColumnName: string, anchorValue: string) {
    if (this.userType === "taxpayer") {
      await this.toggleActionButton("Delete", anchorColumnName, anchorValue);
      await this.page.locator(".k-dialog-actions button").filter({ hasText: "Delete" }).first().click();
    } else if (this.userType === "ags") {
      const columnIndexes = await this.getColumnIndexes();
      await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
      const paymentStatusColumnIndex = columnIndexes["Payment Status"];
      const anchorColumnIndex = columnIndexes[anchorColumnName];
      const rows = await this.getElement().rows().all();

      for (const row of rows) {
        const cells = row.locator("td");
        if ((await cells.nth(anchorColumnIndex).innerText()).replace(/\s+/g, " ").trim() === anchorValue) {
          await cells.nth(paymentStatusColumnIndex).locator("button").first().click();
          await clickLocatorByText(this.getElement().anyList(), "Delete Filing");
          await this.page.locator(".k-dialog-actions button").filter({ hasText: "Delete" }).first().click();
          await waitForLoading(this.page);
          break;
        }
      }
    } else {
      throw new Error("Delete action is not available for this user type");
    }
  }

  async updateStatus(newStatus: string, anchorColumnName: string, anchorValue: string) {
    if (this.userType !== "ags") {
      throw new Error("Update status action is not available for this user type");
    }
    const paymentStatusCell = await this.getElementOfColumn("Payment Status", anchorColumnName, anchorValue);
    await paymentStatusCell.locator("button").first().click();
    await clickLocatorByText(this.getElement().anyList(), "Update Status");
    await this.page.locator(`.k-window-content .k-radio-list input[value="${newStatus}"]`).click();
    await this.page.locator(".k-dialog-actions button").filter({ hasText: "Save" }).first().click();
    await waitForLoading(this.page);
  }

  async checkAuditLog(anchorColumnName: string, anchorValue: string) {
    const paymentStatusCell = await this.getElementOfColumn("Payment Status", anchorColumnName, anchorValue);
    await paymentStatusCell.locator("button").first().click();
    await clickLocatorByText(this.getElement().anyList(), "Audit Log");
    await waitForLoading(this.page);
  }

  async clickExportButton(isExportFullData: boolean = true) {
    await this.getElement().exportButton().click();
    if (this.userType !== "taxpayer") {
      await this.page
        .locator(".k-actions button")
        .filter({ hasText: isExportFullData ? "Export Full Data" : "Export View" })
        .first()
        .click();
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
    await this.page.locator(":nth-child(1) > .k-datepicker").fill(`${month}/${day}/${year}`);
    await this.page.locator(".NLGButtonPrimary").first().click();
    await waitForLoading(this.page);
  }

  async getColumnCellsData(columnName: string) {
    const columnIndexes = await this.getColumnIndexes();
    const columnIndex = columnIndexes[columnName];
    const rows = await this.getElement().rows().all();
    const columnCellsData: string[] = [];

    for (const row of rows) {
      columnCellsData.push((await row.locator("td").nth(columnIndex).innerText()).trim());
    }

    return columnCellsData;
  }

  async addCustomField(customFieldTitle: string, customFieldName: string) {
    if (this.userType === "ags") {
      await this.page.goto("/municipalityApp/list/:tab");
      const row = this.page.locator("tr").filter({ hasText: this.municipalitySelection }).first();
      await row.locator("td").nth(0).locator("i").click();
      await waitForLoading(this.page);
      await this.page.locator("h2").filter({ hasText: "Filing List Configuration" }).scrollIntoViewIfNeeded();
      await clickLocatorByText(this.page.locator("button"), "Add New Column");
      await this.page.locator('input[name^="ColumnsToAddToFilingList"][name$=".Title"]').last().fill(customFieldTitle);
      await this.page.locator('input[name^="ColumnsToAddToFilingList"][name$=".Name"]').last().fill(customFieldName);
      await clickLocatorByText(this.page.locator("button"), "Save");
      await waitForLoading(this.page);
    }
  }

  async removeCustomField(customFieldName: string) {
    await this.page.goto("/municipalityApp/list/:tab");
    const row = this.page.locator("tr").filter({ hasText: this.municipalitySelection }).first();
    await row.locator("td").nth(0).locator("i").click();
    await waitForLoading(this.page);
    await this.page.locator("h2").filter({ hasText: "Filing List Configuration" }).scrollIntoViewIfNeeded();

    const inputs = this.page.locator("input");
    const count = await inputs.count();
    for (let index = 0; index < count; index += 1) {
      if ((await inputs.nth(index).inputValue()) === customFieldName) {
        await inputs
          .nth(index)
          .locator("..")
          .locator("..")
          .locator("div")
          .last()
          .locator("button")
          .filter({ hasText: "Remove" })
          .click();
        break;
      }
    }

    await clickLocatorByText(this.page.locator("button"), "Save");
    await waitForLoading(this.page);
  }

  async isColumnExist(columnName: string) {
    const columnIndexes = await getOrderOfColumns(
      this.page,
      AGS_FILING_COLUMNS.includes(columnName)
        ? AGS_FILING_COLUMNS
        : [...AGS_FILING_COLUMNS, columnName]
    );
    return columnIndexes[columnName] !== undefined;
  }
}

export default FilingGrid;
