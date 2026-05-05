import { expect, type Locator, type Page } from "@playwright/test";
import { clickByText, expectStatus, findRowByCellValue, getColumnOrder, getVisibilityStatus, normalizeText, waitForLoading, waitForResponse } from "../../support/native-helpers";
import { validateFilterOperation } from "../../utils/Grid";
import ExportDelinquencies from "../ExportDelinquencies";
import GridSetting from "../GridSetting";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
export const AGS_DELINQUENCY_GRID_COLUMNS = [
  "Actions",
  "Business Name (DBA)",
  "Business License Number",
  "Business Address",
  "Form Name",
  "Filing Period",
  "Date Delinquent",
  "Is Dismissed",
  "Date Dismissed",
];

export const MUNICIPAL_DELINQUENCY_GRID_COLUMNS = [...AGS_DELINQUENCY_GRID_COLUMNS];

export const TAXPAYER_DELINQUENCY_GRID_COLUMNS = [
  "Actions",
  "Business Name",
  "Business Address",
  "Government Name",
  "Form Name",
  "Filing Frequency",
  "Filing Period",
  "Date Delinquent",
];

class DelinquencyGrid {
  userType: string;
  municipalitySelection?: string;
  defaultGridColumnsAlias: string;
  sortType: string;
  private readonly page: Page;
  private columnOrder: Record<string, number> = {};
  private visibilityStatus: Record<string, boolean> = {};

  constructor(
    page: Page,
    props: {
      userType: string;
      municipalitySelection?: string;
      sortType?: string;
    }
  ) {
    this.page = page;
    this.userType = props.userType;
    this.municipalitySelection = props.municipalitySelection;
    this.defaultGridColumnsAlias = "defaultdelinquencygridcolumns";
    this.sortType = props.sortType ? props.sortType : "default";
  }

  private get defaultColumns() {
    if (this.userType === "ags") return AGS_DELINQUENCY_GRID_COLUMNS;
    if (this.userType === "municipal") return MUNICIPAL_DELINQUENCY_GRID_COLUMNS;
    return TAXPAYER_DELINQUENCY_GRID_COLUMNS;
  }

  private elements() {
    return {
      pageTitle: () => this.page.locator("h2"),
      noRecordFoundComponent: () => this.page.locator(".k-grid-norecords-template"),
      searchBox: () => this.page.locator("span").filter({ has: this.page.locator(".fa-magnifying-glass") }).first(),
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
      refreshReportDataButton: () => this.page.getByRole("button", { name: "Refresh Report Data" }),
      createNewFilingButton: () => this.page.getByRole("button", { name: "Create a New Filing" }),
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
    const delinquencyGridUrl =
      this.userType === "taxpayer"
        ? "/reports/taxpayerDelinquencyReport"
        : "/reports/delinquency";

    await this.page.goto(delinquencyGridUrl);

    if (this.userType === "ags") {
      if (!this.municipalitySelection) {
        throw new Error("Municipality selection is required for AGS user type");
      }
      await this.selectMunicipality(this.municipalitySelection);
      await waitForLoading(this.page, 5);
      await expect(this.getElement().columns().first()).toBeVisible();
    } else {
      await waitForLoading(this.page, 5);
    }

    await this.refreshGridState();
  }

  async selectMunicipality(municipality: string) {
    const subscribedPromise = this.page.waitForResponse((response) =>
      response.url().includes("/municipalities/ActiveTaxAndFeesSubscriptions")
    );
    await this.getElement().searchMunicipalityDropdown().fill(municipality);
    await clickByText(this.getElement().anyList(), municipality);
    await expectStatus(subscribedPromise, 200);
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

  private async getRowByFilters(filterParams: { anchorColumnName: string; anchorValue: string }[]) {
    for (const filterParam of filterParams) {
      const filterType =
        ["Filing Period", "Form Name", "Form Title", "Is Dismissed"].includes(filterParam.anchorColumnName)
          ? "multi-select"
          : "text";
      const operation = filterType === "text" ? "Contains" : "Contains";
      await this.filterColumn(filterParam.anchorColumnName, filterParam.anchorValue, filterType, operation);
    }

    return this.getElement().rows().first();
  }

  async getDataOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string,
    _targetColumnDataAlias?: string
  ) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const anchorIndex = await this.getColumnIndex(anchorColumnName);
    const row = await findRowByCellValue(this.getElement().rows(), anchorIndex, anchorValue, true);
    if (!row) {
      throw new Error(`Row not found for ${anchorColumnName}: ${anchorValue}`);
    }
    const columnIndex = await this.getColumnIndex(targetColumnName);
    return normalizeText(await row.locator("td").nth(columnIndex).textContent());
  }

  async getElementOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string,
    _targetColumnElementAlias?: string
  ): Promise<Locator> {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const anchorIndex = await this.getColumnIndex(anchorColumnName);
    const row = await findRowByCellValue(this.getElement().rows(), anchorIndex, anchorValue, true);
    if (!row) {
      throw new Error(`Row not found for ${anchorColumnName}: ${anchorValue}`);
    }
    const columnIndex = await this.getColumnIndex(targetColumnName);
    return row.locator("td").nth(columnIndex);
  }

  private async toggleActionButton(
    action: string,
    filterParams: { anchorColumnName: string; anchorValue: string }[]
  ) {
    const row = await this.getRowByFilters(filterParams);
    const actionIndex = await this.getColumnIndex("Actions");
    await row.locator("td").nth(actionIndex).click();
    await clickByText(this.getElement().anyList(), action);
  }

  clickManageDelinquencyItem(
    filterParams: { anchorColumnName: string; anchorValue: string }[]
  ) {
    return this.toggleActionButton("Manage", filterParams);
  }

  viewDelinquencyItem(filterParams: { anchorColumnName: string; anchorValue: string }[]) {
    return this.toggleActionButton("View Record", filterParams);
  }

  async clickRefreshReportDataButton() {
    await this.getElement().refreshReportDataButton().click();
    await waitForLoading(this.page, 10);
  }

  async clickExportButton(
    isExportFullData = true,
    fileType: "CSV" | "Excel" = "CSV"
  ) {
    const delinquenciesExportModal = new ExportDelinquencies(this.page);
    await this.getElement().exportButton().click();
    if (this.userType !== "taxpayer") {
      if (fileType === "Excel") {
        await delinquenciesExportModal.selectExcelFileType();
      } else {
        await delinquenciesExportModal.selectCSVFileType();
      }

      if (isExportFullData) {
        await delinquenciesExportModal.clickExportFullDataButton();
      } else {
        await delinquenciesExportModal.clickExportViewButton();
      }
    }
  }

  manageDelinquencyItemByOrder(order?: number) {
    return this.toggleActionButtonForNthDelinquencyItem("Manage", order);
  }

  private async startFiling() {
    const modal = this.page.locator(".k-dialog-titlebar");
    if ((await modal.count()) > 0 && (await modal.first().textContent())?.includes("Resume Draft Filing")) {
      const deletePromise = this.page.waitForResponse(
        (response) =>
          response.request().method() === "DELETE" &&
          response.url().includes("/filings/") &&
          response.url().includes("/delete")
      );
      await this.getElement().createNewFilingButton().click();
      await expectStatus(deletePromise, 201);
    }
    await expect(this.page).toHaveURL(/\/filingApp\/filings\//);
  }

  async toggleActionButtonForNthDelinquencyItem(action: string, order = 0) {
    const filingPromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === "GET" &&
        response.url().includes("/forms/full/"),
      { timeout: 30000 }
    ).catch(() => null);

    const actionIndex = await this.getColumnIndex("Actions");
    await this.getElement().rows().nth(order).locator("td").nth(actionIndex).click();
    await clickByText(this.getElement().anyList(), action);

    if (action === "Submit Now") {
      const formsPromise = this.page.waitForResponse((response) =>
        response.url().includes("/forms/municipality/")
      );
      await expectStatus(formsPromise, 200);
      await filingPromise;
      await this.startFiling();
    }
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

export default DelinquencyGrid;
