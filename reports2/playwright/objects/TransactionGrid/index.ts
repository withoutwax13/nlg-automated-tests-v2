import type { Locator, Page } from "@playwright/test";
import { clickByText, findRowByCellValue, getColumnOrder, getPagerTotal, getVisibilityStatus, setMaskedDateInput, waitForLoading } from "../../support/native-helpers";
import { validateFilterOperation } from "../../utils/Grid";
import GridSetting from "../GridSetting";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
export const AGS_TRANSACTION_GRID_COLUMNS = [
  "Actions",
  "Transaction Date",
  "DBA",
  "Location Address",
  "Payment Status",
  "Period",
  "Total Due",
  "Base Tax/Fee Amount",
  "Interest",
  "Penalty",
  "Transaction Fee",
  "Funding Date",
  "Form Name",
  "Payment Method",
  "Payment Category",
  "Distribution ID",
  "Transaction ID",
  "Reference ID",
];
export const MUNICIPAL_TRANSACTION_GRID_COLUMNS = [...AGS_TRANSACTION_GRID_COLUMNS];

class TransactionGrid {
  userType: string;
  municipalitySelection?: string;
  dateRange?: {
    startDate: { month: number; date: number; year: number };
    endDate: { month: number; date: number; year: number };
  };
  sortType?: string;
  defaultGridColumnsAlias: string;
  private columnOrder: Record<string, number> = {};
  private visibilityStatus: Record<string, boolean> = {};
  private readonly page: Page;

  constructor(
    page: Page,
    props: {
      userType: string;
      municipalitySelection?: string;
      dateRange?: {
        startDate: { month: number; date: number; year: number };
        endDate: { month: number; date: number; year: number };
      };
      sortType?: string;
    }
  ) {
    this.page = page;
    this.userType = props.userType;
    this.municipalitySelection = props.municipalitySelection;
    this.dateRange = props.dateRange;
    this.defaultGridColumnsAlias = "defaultdelinquencygridcolumns";
    this.sortType = props.sortType ? props.sortType : "default";
  }

  private get defaultColumns() {
    return this.userType === "ags" ? AGS_TRANSACTION_GRID_COLUMNS : MUNICIPAL_TRANSACTION_GRID_COLUMNS;
  }

  private elements() {
    return {
      pageTitle: () => this.page.locator("h2"),
      noRecordFoundComponent: () => this.page.locator(".k-grid-norecords-template"),
      searchBox: () => this.page.locator("span").filter({ has: this.page.locator(".fa-magnifying-glass") }).first(),
      startDateInput: () => this.page.locator(".k-datepicker").first(),
      endDateInput: () => this.page.locator(".k-datepicker").last(),
      columns: () => this.page.locator("thead tr th"),
      rows: () => this.page.locator("tbody tr"),
      customizeTableViewButton: () => this.page.getByText("Customize"),
      specificColumnFilter: (columnOrder: number) => this.page.locator("thead tr th").nth(columnOrder).locator("span a"),
      itemsPerPageDropdown: () => this.page.locator(".k-dropdownlist"),
      itemsPerPageDropdownItem: (itemNumber: number) => this.page.locator("li").filter({ hasText: String(itemNumber) }).first(),
      filterOperationsDropdown: () => this.page.locator(".k-filter-menu-container .k-dropdownlist"),
      filterOperationsDropdownItem: (item: string) =>
        this.page.locator(".k-list-ul .k-list-item-text").filter({ hasText: item }).first(),
      filterValueInput: () => this.page.locator(".k-filter-menu-container .k-input").first(),
      filterValueDateInput: () => this.page.locator(".k-dateinput input").first(),
      filterMultiSelectItem: () => this.page.locator(".k-multicheck-wrap li"),
      filterFilterButton: () => this.page.locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      searchMunicipalityDropdown: () => this.page.locator('input[placeholder="Select government..."]'),
      anyList: () => this.page.locator("li"),
      clearAllFiltersButton: () => this.page.getByText("Clear All").first(),
      exportButton: () => this.page.getByRole("button", { name: "Export" }),
      searchButton: () => this.page.getByRole("button", { name: "Search" }),
      itemsData: () => this.page.locator(".k-pager-info"),
    };
  }

  getElement() {
    return this.elements();
  }

  private async refreshGridState() {
    this.columnOrder = await getColumnOrder(this.getElement().columns(), this.defaultColumns);
    this.visibilityStatus = getVisibilityStatus(this.defaultColumns, this.columnOrder);
  }

  async init() {
    await this.page.goto("/reports/transactionsReport");
    await waitForLoading(this.page, 10);
    if (!["ags", "municipal"].includes(this.userType)) {
      throw new Error("Invalid user type");
    }
    if (this.userType === "ags" && this.municipalitySelection) {
      await this.selectMunicipality(this.municipalitySelection);
    }
    await waitForLoading(this.page, 20);
    await this.refreshGridState();
  }

  async selectMunicipality(municipality: string) {
    await this.getElement().searchMunicipalityDropdown().fill(municipality);
    await clickByText(this.getElement().anyList(), municipality);
    await waitForLoading(this.page);
  }

  private async getColumnIndex(columnName: string) {
    if (this.columnOrder[columnName] === undefined) {
      await this.refreshGridState();
    }
    return this.columnOrder[columnName];
  }

  private async handleTextFilter(columnIndex: number, filterValue: string, filterOperation: string) {
    validateFilterOperation("text", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    if (!["Is not null", "Is null"].includes(filterOperation)) {
      await this.getElement().filterValueInput().fill(filterValue);
    }
    await this.getElement().filterFilterButton().click();
  }

  private async handleDateFilter(columnIndex: number, filterValue: string, filterOperation: string) {
    validateFilterOperation("date", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    await this.getElement().filterValueDateInput().fill(filterValue);
    await this.getElement().filterFilterButton().click();
  }

  private async handleNumberFilter(columnIndex: number, filterValue: string, filterOperation: string) {
    validateFilterOperation("number", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    await this.getElement().filterValueInput().fill(filterValue);
    await this.getElement().filterFilterButton().click();
  }

  private async handleMultiSelectFilter(columnIndex: number, filterValue: string) {
    await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await clickByText(this.getElement().filterMultiSelectItem(), filterValue);
    await this.getElement().filterFilterButton().click();
  }

  async filterColumn(
    columnName: string,
    filterValue: string,
    filterType = "text",
    filterOperation = "Contains"
  ) {
    const columnIndex = await this.getColumnIndex(columnName);
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

  clickCustomizeTableViewButton(): Promise<void> {
    return this.getElement().customizeTableViewButton().click();
  }

  clickClearAllFiltersButton(): Promise<void> {
    return this.getElement().clearAllFiltersButton().click();
  }

  private async getRowByAnchor(anchorColumnName: string, anchorValue: string) {
    const anchorIndex = await this.getColumnIndex(anchorColumnName);
    const row = await findRowByCellValue(this.getElement().rows(), anchorIndex, anchorValue, true);
    if (!row) {
      throw new Error(`Row not found for ${anchorColumnName}: ${anchorValue}`);
    }
    return row;
  }

  async getDataOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string,
    _targetColumnDataAlias?: string
  ) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.getRowByAnchor(anchorColumnName, anchorValue);
    const columnIndex = await this.getColumnIndex(targetColumnName);
    return row.locator("td").nth(columnIndex).textContent();
  }

  async getElementOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string,
    _targetColumnElementAlias?: string
  ): Promise<Locator> {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.getRowByAnchor(anchorColumnName, anchorValue);
    const columnIndex = await this.getColumnIndex(targetColumnName);
    return row.locator("td").nth(columnIndex);
  }

  clickExportButton(): Promise<void> {
    return this.getElement().exportButton().click();
  }

  async setStartDate({
    month,
    day,
    year,
  }: {
    month: string | number;
    day: string | number;
    year: string | number;
  }) {
    await this.page.locator(".fa-calendar-days").first().click();
    await setMaskedDateInput(this.page.locator(".k-animation-container input").first(), {
      month,
      day,
      year,
    });
    await this.page.locator(".k-animation-container button").filter({ hasText: "Filter" }).first().click();
    await waitForLoading(this.page);
  }

  async clickSearchButton() {
    await this.getElement().searchButton().click();
    await waitForLoading(this.page, 10);
  }

  getTotalItems(_variableAlias?: string) {
    return getPagerTotal(this.getElement().itemsData());
  }

  async showColumn(columnName: string) {
    const gridSetting = new GridSetting(this.page, {
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    await gridSetting.showColumn(columnName);
    await waitForLoading(this.page);
  }

  async hideColumn(columnName: string) {
    const gridSetting = new GridSetting(this.page, {
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    await gridSetting.hideColumn(columnName);
    await waitForLoading(this.page);
  }

  async feezeColumn(columnName: string) {
    const gridSetting = new GridSetting(this.page, {
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    await gridSetting.freezeColumn(columnName);
    await waitForLoading(this.page);
  }

  async unfreezeColumn(columnName: string) {
    const gridSetting = new GridSetting(this.page, {
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    await gridSetting.unfreezeColumn(columnName);
    await waitForLoading(this.page);
  }

  async verifyColumnVisibility(columnName: string, _isVisibleAlias?: string) {
    await this.refreshGridState();
    return this.visibilityStatus[columnName];
  }

  async verifyColumnOrder(columnName: string, _orderAlias?: string) {
    await this.refreshGridState();
    return this.columnOrder[columnName];
  }

  async restoreDefaultGridSettings() {
    const gridSetting = new GridSetting(this.page, {
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    await gridSetting.restoreDefaultSettings();
    await waitForLoading(this.page);
  }

  async moveColumnToLocationOf(columnName: string, targetColumnName: string) {
    const gridSetting = new GridSetting(this.page, {
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    await gridSetting.moveColumnToLocationOf(columnName, targetColumnName);
    await waitForLoading(this.page);
  }
}

export default TransactionGrid;
