import { currentPage, listItem, normalizeWhitespace, setStoredValue, waitForLoading } from "../../support/runtime";
import { getOrderOfColumns, validateFilterOperation } from "../../utils/Grid";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
const COLUMNS = [
  "First Name",
  "Last Name",
  "Email",
  "User Type",
  "Government",
  "Status",
  "Is Enabled?",
];

const removeSpaces = (text: string) => text.replace(/\s/g, "");

class UserGrid {
  defaultGridColumnsAlias: string;
  sortType: string;

  constructor() {
    this.defaultGridColumnsAlias = "defaultUsergridcolumns";
    this.sortType = "default";
  }

  private elements() {
    return {
      pageTitle: () => currentPage().locator("h1").first(),
      noRecordFoundComponent: () => currentPage().locator(".k-grid-norecords-template").first(),
      columns: () => currentPage().locator("thead tr th"),
      rows: () => currentPage().locator("tbody tr"),
      customizeTableViewButton: () => currentPage().getByText("Customize Table View").first(),
      specificColumnFilter: (columnOrder: number) => this.getElement().columns().nth(columnOrder).locator("span a").first(),
      itemsPerPageDropdown: () => currentPage().locator(".k-dropdownlist").first(),
      itemsPerPageDropdownItem: (itemNumber: number) => currentPage().locator("li").filter({ hasText: `${itemNumber}` }).first(),
      pagination: () => currentPage().locator(".k-pager-numbers-wrap").first(),
      filterOperationsDropdown: () => currentPage().locator(".k-filter-menu-container .k-dropdownlist").first(),
      filterOperationsDropdownItem: (item: string) =>
        currentPage().locator(".k-list-ul li .k-list-item-text").filter({ hasText: item }).first(),
      filterValueInput: () => currentPage().locator(".k-filter-menu-container .k-input").first(),
      filterValueDateInput: () => currentPage().locator(".k-dateinput").first(),
      filterMultiSelectItem: () => currentPage().locator(".k-multicheck-wrap li"),
      filterFilterButton: () =>
        currentPage().locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      clearAllFiltersButton: () => currentPage().getByText("Clear All").first(),
      exportButton: () => currentPage().locator(".NLGButtonSecondary").filter({ hasText: "Export" }).first(),
      migrateUserDataButton: () =>
        currentPage().locator(".NLGButtonSecondary").filter({ hasText: "Migrate User Data" }).first(),
      inviteUserButton: () => currentPage().locator(".NLGButtonSecondary").filter({ hasText: "Invite User" }).first(),
      itemsData: () => currentPage().locator(".k-pager-info").first(),
    };
  }

  private async columnIndexes() {
    return getOrderOfColumns(COLUMNS, this.defaultGridColumnsAlias);
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
    await currentPage().goto("/appUsers");
    await waitForLoading(10);
    await this.columnIndexes();
  }

  async sortColumn(isAscending: boolean, columnName: string) {
    const columnIndexes = await this.columnIndexes();
    const columnIndex = columnIndexes[columnName];
    await this.clickColumn(columnIndex);
    if (columnName === "DBA") {
      await this.handleDBASorting(columnIndex, isAscending);
    } else {
      await this.handleGeneralSorting(columnIndex, isAscending);
    }
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

  async clickExportButton() {
    await this.getElement().exportButton().click();
  }

  async clickMigrateUserDataButton() {
    await this.getElement().migrateUserDataButton().click();
  }

  async clickInviteUserButton() {
    await this.getElement().inviteUserButton().click();
  }

  async getTotalItems(variableAlias: string) {
    const text = (await this.getElement().itemsData().textContent()) || "";
    const totalItems = parseInt(text.split("of")[1].replace(/\D/g, ""), 10);
    return setStoredValue(variableAlias, totalItems);
  }

  async goToUserDetail(anchorColumnName: string, anchorValue: string) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.rowForValue(anchorColumnName, anchorValue);
    await row.locator("td").first().click();
  }

  async editUser(anchorColumnName: string, anchorValue: string) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.rowForValue(anchorColumnName, anchorValue);
    await row.locator("button").filter({ hasText: "Edit" }).first().click();
  }

  async removeUser(anchorColumnName: string, anchorValue: string) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.rowForValue(anchorColumnName, anchorValue);
    await row.locator("button").filter({ hasText: "Remove" }).first().click();
  }
}

export default UserGrid;
