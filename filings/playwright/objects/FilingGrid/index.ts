import { expect, Locator, Page } from "@playwright/test";
import { resolvePage } from "../../pageContext";
import {
  applyGridFilter,
  getColumnOrder,
  getColumnTexts,
  getRowByCellText,
  normalizeCellText,
} from "../../utils/Grid";
import { waitForLoading } from "../../utils/runtime";
import ExportFiling from "../ExportFiling";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
const AGS_FILING_COLUMNS = [
  "Actions",
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
const TAXPAYER_FILING_COLUMNS = [
  "Actions",
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

class FilingGrid {
  userType: string;
  municipalitySelection: string;
  sortType: string;
  private columnMap: Record<string, number> = {};

  constructor(props: { userType: string; municipalitySelection?: string; sortType?: string }) {
    this.userType = props.userType;
    this.municipalitySelection = props.municipalitySelection || "City of Arrakis";
    this.sortType = props.sortType || "default";
  }

  private elements(page: Page = resolvePage()) {
    return {
      searchBox: () => page.locator("div").filter({ has: page.locator(".fa-magnifying-glass") }).first(),
      columns: () => page.locator("thead tr th"),
      rows: () => page.locator("tbody tr"),
      customizeTableViewButton: () => page.getByText("Customize").first(),
      specificColumnFilter: (columnOrder: number) =>
        page.locator("thead tr th").nth(columnOrder).locator("span a").first(),
      itemsPerPageDropdown: () => page.locator(".k-dropdownlist").first(),
      itemsPerPageDropdownItem: (itemNumber: number) =>
        page.locator("li").filter({ hasText: String(itemNumber) }).first(),
      clearAllFiltersButton: () => page.getByText("Clear All").first(),
      searchMunicipalityDropdown: () =>
        page.locator('input[placeholder="Select government..."]'),
      anyList: () => page.locator("li"),
      exportButton: () => page.locator(".NLGButtonPrimary").filter({ hasText: "Export" }).first(),
      viewRequestedExtractButton: () => page.getByText("View requested extracts").first(),
    };
  }

  getElement(page: Page = resolvePage()) {
    return this.elements(page);
  }

  private isPage(value: unknown): value is Page {
    return !!value && typeof value === "object" && "locator" in (value as Record<string, unknown>);
  }

  private async loadColumnMap(page: Page = resolvePage()) {
    const columns =
      this.userType === "taxpayer" ? TAXPAYER_FILING_COLUMNS : AGS_FILING_COLUMNS;
    this.columnMap = await getColumnOrder(columns, this.getElement(page).columns());
    return this.columnMap;
  }

  async init(page: Page = resolvePage()) {
    await page.goto("/filingApp/filingList");
    if (this.userType === "ags") {
      await expect(page).toHaveURL(/\/filingApp\/filingList/);
      await this.selectMunicipality(page, this.municipalitySelection);
    }
    await waitForLoading(page, 3);
    await this.loadColumnMap(page);
  }

  async selectMunicipality(pageOrMunicipality: Page | string = resolvePage(), maybeMunicipality?: string) {
    const page = this.isPage(pageOrMunicipality) ? pageOrMunicipality : resolvePage();
    const municipality = this.isPage(pageOrMunicipality)
      ? (maybeMunicipality as string)
      : pageOrMunicipality;
    await this.getElement(page).searchMunicipalityDropdown().fill(municipality);
    await this.getElement(page).anyList().filter({ hasText: municipality }).first().click();
    await waitForLoading(page);
  }

  private async getColumnIndex(page: Page = resolvePage(), columnName: string) {
    if (!this.columnMap[columnName]) {
      await this.loadColumnMap(page);
    }
    const index = this.columnMap[columnName];
    if (index === undefined) {
      throw new Error(`Column not found: ${columnName}`);
    }
    return index;
  }

  async sortColumn(pageOrAscending: Page | boolean, ascendingOrColumn: boolean | string, maybeColumn?: string) {
    const page = this.isPage(pageOrAscending) ? pageOrAscending : resolvePage();
    const isAscending = this.isPage(pageOrAscending) ? (ascendingOrColumn as boolean) : pageOrAscending;
    const columnName = this.isPage(pageOrAscending) ? (maybeColumn as string) : (ascendingOrColumn as string);
    const index = await this.getColumnIndex(page, columnName);
    const header = this.getElement(page).columns().nth(index);
    await header.click();
    if (!isAscending) {
      await header.click();
    }
    this.sortType = isAscending ? "ascending" : "descending";
  }

  async filterColumn(
    page: Page | string = resolvePage(),
    columnName?: string,
    filterValue?: string,
    filterType = "text",
    filterOperation = "Contains"
  ) {
    if (typeof page === "string") {
      filterOperation = filterType;
      filterType = filterValue || "text";
      filterValue = columnName;
      columnName = page;
      page = resolvePage();
    }
    const index = await this.getColumnIndex(page, columnName!);
    await applyGridFilter({
      page,
      filterButton: this.getElement(page).specificColumnFilter(index),
      filterType,
      filterValue: filterValue || "",
      filterOperation,
    });
    await waitForLoading(page);
  }

  async changeItemsPerPage(page: Page = resolvePage(), itemNumber: number) {
    if (!VALID_ITEMS_PER_PAGE.includes(itemNumber)) {
      throw new Error("Invalid items per page number");
    }
    await this.getElement(page).itemsPerPageDropdown().click();
    await this.getElement(page).itemsPerPageDropdownItem(itemNumber).click();
  }

  async clickCustomizeTableViewButton(page: Page = resolvePage()) {
    await this.getElement(page).customizeTableViewButton().click();
  }

  async clickClearAllFiltersButton(page: Page = resolvePage()) {
    await this.getElement(page).clearAllFiltersButton().click();
    await waitForLoading(page);
  }

  async getDataOfColumn(
    pageOrTarget: Page | string,
    targetOrAnchor: string,
    anchorOrValue: string,
    maybeAnchorValue?: string
  ) {
    const page = this.isPage(pageOrTarget) ? pageOrTarget : resolvePage();
    const targetColumnName = this.isPage(pageOrTarget) ? targetOrAnchor : pageOrTarget;
    const anchorColumnName = this.isPage(pageOrTarget) ? anchorOrValue : targetOrAnchor;
    const anchorValue = this.isPage(pageOrTarget) ? (maybeAnchorValue as string) : anchorOrValue;
    await this.filterColumn(page, anchorColumnName, anchorValue, "text", "Contains");
    const targetColumnIndex = await this.getColumnIndex(page, targetColumnName);
    const anchorColumnIndex = await this.getColumnIndex(page, anchorColumnName);
    const row = await getRowByCellText(this.getElement(page).rows(), anchorColumnIndex, anchorValue);
    return normalizeCellText(await row.locator("td").nth(targetColumnIndex).innerText());
  }

  async getElementOfColumn(
    pageOrTarget: Page | string,
    targetOrAnchor: string,
    anchorOrValue: string,
    maybeAnchorValue?: string
  ): Promise<any> {
    const page = this.isPage(pageOrTarget) ? pageOrTarget : resolvePage();
    const targetColumnName = this.isPage(pageOrTarget) ? targetOrAnchor : pageOrTarget;
    const anchorColumnName = this.isPage(pageOrTarget) ? anchorOrValue : targetOrAnchor;
    const anchorValue = this.isPage(pageOrTarget) ? (maybeAnchorValue as string) : anchorOrValue;
    await this.filterColumn(page, anchorColumnName, anchorValue, "text", "Contains");
    const targetColumnIndex = await this.getColumnIndex(page, targetColumnName);
    const anchorColumnIndex = await this.getColumnIndex(page, anchorColumnName);
    const row = await getRowByCellText(this.getElement(page).rows(), anchorColumnIndex, anchorValue);
    return row.locator("td").nth(targetColumnIndex);
  }

  async toggleActionButton(
    pageOrAction: Page | string,
    actionOrAnchor: string,
    anchorOrValue: string,
    maybeAnchorValue?: string
  ) {
    const page = this.isPage(pageOrAction) ? pageOrAction : resolvePage();
    const action = this.isPage(pageOrAction) ? actionOrAnchor : pageOrAction;
    const anchorColumnName = this.isPage(pageOrAction) ? anchorOrValue : actionOrAnchor;
    const anchorValue = this.isPage(pageOrAction) ? (maybeAnchorValue as string) : anchorOrValue;
    const actionCell = await this.getElementOfColumn(page, "Actions", anchorColumnName, anchorValue);
    await actionCell.click();
    await this.getElement(page).anyList().filter({ hasText: action }).first().click();
  }

  async deleteFiling(pageOrAnchor: Page | string, anchorOrValue: string, maybeValue?: string) {
    const page = this.isPage(pageOrAnchor) ? pageOrAnchor : resolvePage();
    const anchorColumnName = this.isPage(pageOrAnchor) ? anchorOrValue : pageOrAnchor;
    const anchorValue = this.isPage(pageOrAnchor) ? (maybeValue as string) : anchorOrValue;
    if (this.userType === "taxpayer") {
      await this.toggleActionButton(page, "Delete", anchorColumnName, anchorValue);
      await page.locator(".k-dialog-actions button").filter({ hasText: "Delete" }).click();
    } else if (this.userType === "ags") {
      const actionCell = await this.getElementOfColumn(page, "Payment Status", anchorColumnName, anchorValue);
      await actionCell.locator('button[aria-haspopup="menu"]').click();
      await page.locator("li").filter({ hasText: "Delete Filing" }).first().click();
      await page.locator(".k-dialog-actions button").filter({ hasText: "Delete" }).click();
    } else {
      throw new Error("Delete action is not available for this user type");
    }
    await waitForLoading(page);
  }

  async updateStatus(pageOrNewStatus: Page | string, newStatusOrAnchor: string, anchorOrValue: string, maybeValue?: string) {
    const page = this.isPage(pageOrNewStatus) ? pageOrNewStatus : resolvePage();
    const newStatus = this.isPage(pageOrNewStatus) ? newStatusOrAnchor : pageOrNewStatus;
    const anchorColumnName = this.isPage(pageOrNewStatus) ? anchorOrValue : newStatusOrAnchor;
    const anchorValue = this.isPage(pageOrNewStatus) ? (maybeValue as string) : anchorOrValue;
    const cell = await this.getElementOfColumn(page, "Payment Status", anchorColumnName, anchorValue);
    await cell.locator('button[aria-haspopup="menu"]').click();
    await page.locator("li").filter({ hasText: "Update Status" }).first().click();
    await page.locator(`.k-window-content .k-radio-list input[value="${newStatus}"]`).click();
    await page.locator(".k-dialog-actions button").filter({ hasText: "Save" }).click();
    await waitForLoading(page);
  }

  async checkAuditLog(pageOrAnchor: Page | string, anchorOrValue: string, maybeValue?: string) {
    const page = this.isPage(pageOrAnchor) ? pageOrAnchor : resolvePage();
    const anchorColumnName = this.isPage(pageOrAnchor) ? anchorOrValue : pageOrAnchor;
    const anchorValue = this.isPage(pageOrAnchor) ? (maybeValue as string) : anchorOrValue;
    const popup = page.waitForEvent("popup").catch(() => null);
    const cell = await this.getElementOfColumn(page, "Payment Status", anchorColumnName, anchorValue);
    await cell.locator('button[aria-haspopup="menu"]').first().click();
    await page.locator("li").filter({ hasText: "Audit Log" }).first().click();
    const popupPage = await popup;
    if (popupPage) {
      await popupPage.waitForLoadState("domcontentloaded");
      await popupPage.bringToFront();
    }
  }

  async clickExportButton(
    pageOrIsExportFullData: Page | boolean = resolvePage(),
    isExportFullData = true,
    fileType: "CSV" | "Excel" = "CSV"
  ) {
    const page = this.isPage(pageOrIsExportFullData) ? pageOrIsExportFullData : resolvePage();
    const exportFullData = this.isPage(pageOrIsExportFullData) ? isExportFullData : pageOrIsExportFullData;
    const filingExportModal = new ExportFiling();
    await this.getElement(page).exportButton().click();
    if (this.userType !== "taxpayer") {
      if (fileType === "Excel") {
        await filingExportModal.selectExcelFileType(page);
      } else {
        await filingExportModal.selectCSVFileType(page);
      }
      if (exportFullData) {
        await filingExportModal.clickExportFullDataButton(page);
      } else {
        await filingExportModal.clickExportViewButton(page);
      }
    }
  }

  async clickViewRequestedExtractButton(page: Page = resolvePage()) {
    await this.getElement(page).viewRequestedExtractButton().click();
    await waitForLoading(page, 5);
  }

  async searchFiling(pageOrSearchValue: Page | string, maybeSearchValue?: string) {
    const page = this.isPage(pageOrSearchValue) ? pageOrSearchValue : resolvePage();
    const searchValue = this.isPage(pageOrSearchValue) ? (maybeSearchValue as string) : pageOrSearchValue;
    await this.getElement(page).searchBox().fill(searchValue);
    await waitForLoading(page, 5);
  }

  async setStartDate(
    pageOrDate: Page | { month: string; day: string; year: string },
    maybeDate?: { month: string; day: string; year: string }
  ) {
    const page = this.isPage(pageOrDate) ? pageOrDate : resolvePage();
    const { month, day, year } = this.isPage(pageOrDate) ? (maybeDate as { month: string; day: string; year: string }) : pageOrDate;
    await page.locator(".fa-calendar-days").click();
    await page.locator(".k-animation-container input").first().fill(`${month}/${day}/${year}`);
    await page.locator(".k-animation-container button").filter({ hasText: "Filter" }).click();
    await waitForLoading(page);
  }

  async getColumnCellsData(pageOrColumnName: Page | string, maybeColumnName?: string) {
    const page = this.isPage(pageOrColumnName) ? pageOrColumnName : resolvePage();
    const columnName = this.isPage(pageOrColumnName) ? (maybeColumnName as string) : pageOrColumnName;
    const columnIndex = await this.getColumnIndex(page, columnName);
    return getColumnTexts(this.getElement(page).rows(), columnIndex);
  }

  async isColumnExist(pageOrColumnName: Page | string, maybeColumnName?: string) {
    const page = this.isPage(pageOrColumnName) ? pageOrColumnName : resolvePage();
    const columnName = this.isPage(pageOrColumnName) ? (maybeColumnName as string) : pageOrColumnName;
    const currentMap = await getColumnOrder(
      AGS_FILING_COLUMNS.includes(columnName)
        ? AGS_FILING_COLUMNS
        : [...AGS_FILING_COLUMNS, columnName],
      this.getElement(page).columns()
    );
    return currentMap[columnName] !== undefined;
  }
}

export default FilingGrid;
