import type { Locator, Page } from "@playwright/test";
import { getOrderOfColumns, validateFilterOperation } from "../../utils/Grid";
import { clickLocatorByText, waitForLoading } from "../../support/native-helpers";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];

const AGS_FORM_GRID_COLUMNS = [
  "Action Button",
  "Form Title",
  "Clients",
  "Approval",
  "Created By",
  "Version",
  "Last Modification Date",
  "Published Date",
  "Draft Change Type",
  "Next Version Number",
  "Filing Frequency",
  "Status",
];

const MUNICIPAL_FORM_GRID_COLUMNS = [
  "Action Button",
  "Form Title",
  "Version",
  "Last Modification Date",
  "Published Date",
  "Filing Frequency",
  "Status",
  "Approval",
];

const removeSpaces = (text: string) => text.replace(/\s/g, "");

class FormGrid {
  userType: string;
  defaultColumnAlias: string;
  sortType: string;
  page: Page;
  private columnIndexes?: Record<string, number>;

  constructor(page: Page, props: { userType: string; sortType?: string }) {
    if (!["ags", "municipal"].includes(props.userType)) {
      throw new Error("Invalid user type");
    }

    this.page = page;
    this.userType = props.userType;
    this.defaultColumnAlias = `${this.userType}FormGridDefaultColumns`;
    this.sortType = props.sortType || "default";
  }

  async init() {
    await this.page.goto("/formsApp");
    await waitForLoading(this.page);
    this.columnIndexes = await getOrderOfColumns(
      this.page,
      this.userType === "ags"
        ? AGS_FORM_GRID_COLUMNS
        : MUNICIPAL_FORM_GRID_COLUMNS
    );
  }

  private elements() {
    return {
      pageTitle: () => this.page.locator("h1"),
      formActionsButton: () => this.page.getByRole("button", { name: "Form Actions" }),
      createNewFormButton: () => this.page.locator("li").filter({ hasText: "Create New Form" }).first(),
      uploadFileInput: () => this.page.locator("#files"),
      exportButton: () =>
        this.userType === "ags"
          ? this.page.locator("li").filter({ hasText: "Export" }).first()
          : this.page.getByRole("button", { name: "Export" }).first(),
      settingsButton: () =>
        this.userType === "ags"
          ? this.page.locator("li").filter({ hasText: "Form Settings" }).first()
          : this.page.getByRole("button", { name: "Settings" }).first(),
      createFormFromLibraryButton: () =>
        this.page.locator("li").filter({ hasText: "Create Form From Library" }).first(),
      formLibrarySettingsButton: () =>
        this.page.locator("li").filter({ hasText: "Form Library Settings" }).first(),
      customizeTableViewButton: () =>
        this.page.locator(".NLG-HyperlinkNoPadding").filter({ hasText: "Customize Table View" }).first(),
      columns: () => this.page.locator("thead tr th"),
      rows: () => this.page.locator("tbody tr"),
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
      filterValueInput: () =>
        this.page.locator(".k-filter-menu-container .k-input").first(),
      filterValueDateInput: () => this.page.locator(".k-dateinput").first(),
      filterMultiSelectItem: () => this.page.locator(".k-multicheck-wrap li"),
      filterFilterButton: () =>
        this.page.locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      anyList: () => this.page.locator("li"),
      anyButton: () => this.page.locator("button"),
      clearAllFiltersButton: () => this.page.getByText("Clear All", { exact: false }).first(),
      itemsData: () => this.page.locator(".k-pager-info").first(),
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
          ? AGS_FORM_GRID_COLUMNS
          : MUNICIPAL_FORM_GRID_COLUMNS
      );
    }

    return this.columnIndexes;
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
      return;
    }

    await this.handleGeneralSorting(columnIndex, isAscending);
  }

  private async handleTextFilter(
    columnIndex: number,
    filterValue: string,
    filterOperation: string
  ) {
    validateFilterOperation("text", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click();
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    if (filterOperation !== "Is not null" && filterOperation !== "Is null") {
      await this.getElement().filterValueInput().fill(filterValue);
    }
    await this.getElement().filterFilterButton().click();
  }

  private async handleDateFilter(
    columnIndex: number,
    filterValue: string,
    filterOperation: string
  ) {
    validateFilterOperation("date", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click();
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    await this.getElement().filterValueDateInput().fill(filterValue);
    await this.getElement().filterFilterButton().click();
  }

  private async handleNumberFilter(
    columnIndex: number,
    filterValue: string,
    filterOperation: string
  ) {
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

  private async getRows() {
    return this.getElement().rows();
  }

  async getDataOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string
  ) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const columnIndexes = await this.getColumnIndexes();
    const columnIndex = columnIndexes[targetColumnName];
    const anchorColumnIndex = columnIndexes[anchorColumnName];
    const rows = await this.getRows().all();

    for (const row of rows) {
      const cells = row.locator("td");
      if ((await cells.nth(anchorColumnIndex).innerText()).trim() === anchorValue) {
        return (await cells.nth(columnIndex).innerText()).trim();
      }
    }

    return "";
  }

  async getDataOfColumnForNRow(rowPosition: number, targetColumnName: string) {
    const columnIndexes = await this.getColumnIndexes();
    const columnIndex = columnIndexes[targetColumnName];
    const row = this.getElement().rows().nth(rowPosition);
    return (await row.locator("td").nth(columnIndex).innerText()).trim();
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
    const rows = await this.getRows().all();

    for (const row of rows) {
      const cells = row.locator("td");
      if (
        (await cells.nth(anchorColumnIndex).innerText()).replace(/\s+/g, " ").trim() ===
        anchorValue
      ) {
        return cells.nth(columnIndex);
      }
    }

    return this.page.locator("__missing__");
  }

  async getElementOfColumnForNRow(rowPosition: number, targetColumnName: string) {
    const columnIndexes = await this.getColumnIndexes();
    const columnIndex = columnIndexes[targetColumnName];
    return this.getElement().rows().nth(rowPosition).locator("td").nth(columnIndex);
  }

  async toggleActionButton(
    type: "order" | "filter",
    action?: string,
    anchorColumnName?: string,
    anchorValue?: string,
    order?: number
  ) {
    let actionCell: Locator;

    if (type === "filter") {
      actionCell = await this.getElementOfColumn(
        "Action Button",
        anchorColumnName || "",
        anchorValue || ""
      );
    } else {
      actionCell = await this.getElementOfColumnForNRow(order || 0, "Action Button");
    }

    await actionCell.click();
    if (action) {
      await clickLocatorByText(this.getElement().anyList(), action);
    }
  }

  async clickExportButton() {
    if (this.userType === "ags") {
      await this.getElement().formActionsButton().click();
      await this.getElement().exportButton().click();
      return;
    }

    await this.getElement().exportButton().click();
  }

  async clickAddNeWFormButton() {
    await this.getElement().formActionsButton().click();
    await this.getElement().createNewFormButton().click();
  }

  async clickSettingsButton() {
    if (this.userType === "ags") {
      await this.getElement().formActionsButton().click();
      await this.getElement().settingsButton().click();
      return;
    }

    await this.getElement().settingsButton().click();
  }

  async clickCreateFormFromLibraryButton() {
    await this.getElement().formActionsButton().click();
    await this.getElement().createFormFromLibraryButton().click();
  }

  async clickFormLibrarySettingsButton() {
    await this.getElement().formActionsButton().click();
    await this.getElement().formLibrarySettingsButton().click();
  }

  async getTotalItems() {
    const text = await this.getElement().itemsData().innerText();
    const totalItems = text.split("of")[1]?.trim() || "0";
    return Number.parseInt(totalItems, 10);
  }

  async getArrayDataOfColumn(columnName: string) {
    const columnIndexes = await this.getColumnIndexes();
    const columnIndex = columnIndexes[columnName];
    const columnData: string[] = [];

    while (true) {
      const rows = await this.getRows().all();
      for (const row of rows) {
        columnData.push((await row.locator("td").nth(columnIndex).innerText()).trim());
      }

      const nextButton = this.getElement().goToNextPageButton();
      const isDisabled = await nextButton.getAttribute("aria-disabled");
      if (isDisabled === "true") {
        break;
      }

      await nextButton.click();
      await this.page.waitForTimeout(1000);
    }

    return columnData;
  }
}

export default FormGrid;
