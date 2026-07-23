import { expect, type Locator, type Page } from "@playwright/test";
import {
  clickByText,
  findRowByCellValue,
  getColumnOrder,
  normalizeText,
  selectFilterOperation,
  selectMultiCheckFilterItem,
  waitForLoading,
} from "../../support/native-helpers";
import { validateFilterOperation } from "../../utils/Grid";
import ExportFiling from "../ExportFiling";

const AGS_FILING_COLUMNS = [
  "",
  "Actions",
  "Filing Period",
  "Location DBA",
  "Location Address 1",
  "Location City",
  "Total Due",
  "Payment Status",
  "Transaction Date",
  "Funding Date",
  "Form Name",
  "Approval Status",
  "Filing Date",
  "Payment Type",
  "Check Number",
  "Reference ID",
  "State Tax ID",
  "Filing Frequency",
];
const MUNICIPAL_FILING_COLUMNS = AGS_FILING_COLUMNS.filter((column) => column !== "");
const TAXPAYER_FILING_COLUMNS = [
  "Actions",
  "Filing Period",
  "Filing Status",
  "Location DBA",
  "Location Address 1",
  "Location City",
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

type FilingGridProps = {
  userType: "ags" | "municipal" | "taxpayer";
  municipalitySelection?: string;
  sortType?: string;
};

class FilingGrid {
  municipalitySelection: string;
  sortType: string;
  private columnOrder: Record<string, number> = {};

  constructor(private readonly page: Page, private readonly props: FilingGridProps) {
    this.municipalitySelection = props.municipalitySelection || "City of Arrakis";
    this.sortType = props.sortType || "default";
  }

  private get defaultColumns() {
    if (this.props.userType === "ags") return AGS_FILING_COLUMNS;
    if (this.props.userType === "municipal") return MUNICIPAL_FILING_COLUMNS;
    return TAXPAYER_FILING_COLUMNS;
  }

  private elements() {
    return {
      searchBox: () => this.page.locator('div[role="search"]').locator(".fa-magnifying-glass").locator("xpath=..").first(),
      columns: () => this.page.locator("thead tr th"),
      rows: () => this.page.locator("tbody tr").filter({ has: this.page.locator("td") }),
      noRecordFoundComponent: () => this.page.locator(".k-grid-norecords-template"),
      customizeTableViewButton: () => this.page.locator("*").filter({ hasText: "Customize" }).first(),
      specificColumnFilter: (columnOrder: number) => this.page.locator("thead tr th").nth(columnOrder).locator("span a").first(),
      filterOperationsDropdown: () => this.page.locator(".k-filter-menu-container .k-dropdownlist").first(),
      filterValueInput: () => this.page.locator(".k-filter-menu-container .k-input").first(),
      filterValueDateInput: () => this.page.locator(".k-dateinput input").first(),
      filterFilterButton: () => this.page.locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      searchMunicipalityDropdown: () => this.page.locator('input[placeholder="Select government..."], input[placeholder="Search government"]').first(),
      anyList: () => this.page.locator("li"),
      anyButton: () => this.page.locator("button"),
      clearAllFiltersButton: () => this.page.locator("*").filter({ hasText: "Clear All" }).first(),
      exportButton: () => this.page.locator(".NLGButtonPrimary").filter({ hasText: "Export" }).first(),
      viewRequestedExtractButton: () => this.page.locator("*").filter({ hasText: "View requested extracts" }).first(),
    };
  }

  getElement() {
    return this.elements();
  }

  async init() {
    await this.page.goto("/filingApp/filingList");
    await waitForLoading(this.page, 5);
    if (this.props.userType === "ags") {
      await this.selectMunicipality(this.municipalitySelection);
    }
    await this.refreshGridState();
  }

  async refreshGridState() {
    this.columnOrder = await getColumnOrder(this.getElement().columns(), this.defaultColumns);
  }

  async selectMunicipality(municipality: string) {
    await this.getElement().searchMunicipalityDropdown().fill(municipality);
    await clickByText(this.getElement().anyList(), municipality);
    await waitForLoading(this.page, 5);
  }

  private async getColumnIndex(columnName: string) {
    if (this.columnOrder[columnName] === undefined) await this.refreshGridState();
    return this.columnOrder[columnName];
  }

  async sortColumn(isAscending: boolean, columnName: string) {
    const columnIndex = await this.getColumnIndex(columnName);
    await this.getElement().columns().nth(columnIndex).click({ force: true });
    this.sortType = isAscending ? "ascending" : "descending";
    await waitForLoading(this.page, 2);
  }

  private async handleTextFilter(columnIndex: number, filterValue: string, filterOperation: string) {
    validateFilterOperation("text", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await selectFilterOperation(this.page, this.getElement().filterOperationsDropdown(), filterOperation);
    if (!["Is not null", "Is null"].includes(filterOperation)) {
      await this.getElement().filterValueInput().fill(filterValue);
    }
    await this.getElement().filterFilterButton().click({ force: true });
  }

  private async handleDateFilter(columnIndex: number, filterValue: string, filterOperation: string) {
    validateFilterOperation("date", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await selectFilterOperation(this.page, this.getElement().filterOperationsDropdown(), filterOperation);
    await this.getElement().filterValueDateInput().fill(filterValue);
    await this.getElement().filterFilterButton().click({ force: true });
  }

  private async handleNumberFilter(columnIndex: number, filterValue: string, filterOperation: string) {
    validateFilterOperation("number", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await selectFilterOperation(this.page, this.getElement().filterOperationsDropdown(), filterOperation);
    await this.getElement().filterValueInput().fill(filterValue);
    await this.getElement().filterFilterButton().click({ force: true });
  }

  async filterColumn(columnName: string, filterValue: string, filterType = "text", filterOperation = "Contains") {
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
        await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
        await selectMultiCheckFilterItem(this.page, filterValue);
        break;
      default:
        break;
    }
    await waitForLoading(this.page, 3);
  }

  async changeItemsPerPage(itemNumber: number) {
    if (![5, 10, 20, 50].includes(itemNumber)) throw new Error("Invalid items per page number");
    await this.page.locator(".k-dropdownlist").first().click({ force: true });
    await this.getElement().anyList().filter({ hasText: String(itemNumber) }).first().click({ force: true });
  }

  async clickCustomizeTableViewButton() {
    await this.getElement().customizeTableViewButton().click({ force: true });
  }

  async clickClearAllFiltersButton() {
    if (await this.getElement().clearAllFiltersButton().isVisible().catch(() => false)) {
      await this.getElement().clearAllFiltersButton().click({ force: true });
      await waitForLoading(this.page, 2);
    }
  }

  private async getRowByAnchor(anchorColumnName: string, anchorValue: string) {
    const anchorColumnIndex = await this.getColumnIndex(anchorColumnName);
    const row = await findRowByCellValue(this.getElement().rows(), anchorColumnIndex, anchorValue, true);
    if (row) return row;
    const fallback = this.getElement().rows().filter({ hasText: anchorValue }).first();
    if (await fallback.count()) return fallback;
    throw new Error(`Row not found for ${anchorColumnName}: ${anchorValue}`);
  }

  async getDataOfColumn(targetColumnName: string, anchorColumnName: string, anchorValue: string, _alias?: string) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.getRowByAnchor(anchorColumnName, anchorValue);
    const columnIndex = await this.getColumnIndex(targetColumnName);
    return normalizeText(await row.locator("td").nth(columnIndex).textContent());
  }

  async getElementOfColumn(targetColumnName: string, anchorColumnName: string, anchorValue: string, _alias?: string): Promise<Locator> {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.getRowByAnchor(anchorColumnName, anchorValue);
    const columnIndex = await this.getColumnIndex(targetColumnName);
    return row.locator("td").nth(columnIndex);
  }

  async toggleActionButton(action: string, anchorColumnName: string, anchorValue: string) {
    const actionCell = await this.getElementOfColumn("Actions", anchorColumnName, anchorValue);
    const popupPromise = action === "View" || action === "Download" ? Promise.resolve(null) : Promise.resolve(null);
    await actionCell.locator("button, i, a").first().click({ force: true });
    await clickByText(this.getElement().anyList(), action);
    await popupPromise;
    await waitForLoading(this.page, 2);
  }

  async deleteFiling(anchorColumnName: string, anchorValue: string) {
    if (this.props.userType !== "ags" && this.props.userType !== "taxpayer") {
      throw new Error("Delete action is not available for this user type");
    }

    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.getRowByAnchor(anchorColumnName, anchorValue);

    if (this.props.userType === "taxpayer") {
      await this.toggleActionButton("Delete", anchorColumnName, anchorValue);
    } else {
      const paymentColumnIndex = await this.getColumnIndex("Payment Status");
      await row.locator("td").nth(paymentColumnIndex).locator('button[aria-haspopup="menu"], button, i').first().click({ force: true });
      await clickByText(this.getElement().anyList(), "Delete Filing");
    }

    const deletePromise = this.page
      .waitForResponse((response) => response.request().method() === "DELETE" && response.url().includes("/filings/"), { timeout: 15000 })
      .catch(() => null);
    await this.page.locator(".k-dialog-actions button, .k-dialog button").filter({ hasText: "Delete" }).first().click({ force: true });
    const response = await deletePromise;
    if (response) expect([200, 201, 204]).toContain(response.status());
    await waitForLoading(this.page, 3);
  }

  async updateStatus(newStatus: string, anchorColumnName: string, anchorValue: string) {
    if (this.props.userType !== "ags") {
      throw new Error("Update status action is not available for this user type");
    }
    const paymentStatusCell = await this.getElementOfColumn("Payment Status", anchorColumnName, anchorValue);
    await paymentStatusCell.locator('button[aria-haspopup="menu"], button, i').first().click({ force: true });
    await clickByText(this.getElement().anyList(), "Update Status");
    const statusInput = this.page.locator(`.k-window-content input[value="${newStatus}"], .k-dialog input[value="${newStatus}"]`).first();
    if (await statusInput.count()) {
      await statusInput.click({ force: true });
    } else {
      await this.page.locator(".k-window-content label, .k-dialog label").filter({ hasText: newStatus }).first().click({ force: true });
    }
    const responsePromise = this.page
      .waitForResponse((response) => ["PATCH", "PUT", "POST"].includes(response.request().method()) && response.url().includes("/filings/"), { timeout: 15000 })
      .catch(() => null);
    await this.page.locator(".k-dialog-actions button, .k-window-content button").filter({ hasText: "Save" }).first().click({ force: true });
    const response = await responsePromise;
    if (response) expect([200, 201, 204]).toContain(response.status());
    await waitForLoading(this.page, 3);
  }

  async checkAuditLog(anchorColumnName: string, anchorValue: string) {
    const paymentStatusCell = await this.getElementOfColumn("Payment Status", anchorColumnName, anchorValue);
    await paymentStatusCell.locator('button[aria-haspopup="menu"], button, i').first().click({ force: true });
    const popupPromise = this.page.waitForEvent("popup", { timeout: 10000 }).catch(() => null);
    await clickByText(this.getElement().anyList(), "Audit Log");
    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState("domcontentloaded");
      return popup;
    }
    await waitForLoading(this.page, 3);
    return this.page;
  }

  async clickExportButton(isExportFullData = true, fileType: "CSV" | "Excel" = "CSV") {
    const exportModal = new ExportFiling(this.page);
    const downloadPromise = this.page.waitForEvent("download", { timeout: 10000 }).catch(() => null);
    await this.getElement().exportButton().click({ force: true });
    if (this.props.userType !== "taxpayer") {
      if (fileType === "Excel") await exportModal.selectExcelFileType();
      else await exportModal.selectCSVFileType();
      if (isExportFullData) await exportModal.clickExportFullDataButton();
      else await exportModal.clickExportViewButton();
    }
    await downloadPromise;
  }

  async clickViewRequestedExtractButton() {
    await this.getElement().viewRequestedExtractButton().click({ force: true });
    await waitForLoading(this.page, 5);
  }

  async searchFiling(searchValue: string) {
    const searchInput = this.getElement().searchBox().locator("input").first();
    if (await searchInput.count()) await searchInput.fill(searchValue);
    else await this.getElement().searchBox().fill(searchValue);
    await waitForLoading(this.page, 5);
  }

  async setStartDate({ month, day, year }: { month: string; day: string; year: string }) {
    await this.page.locator(".fa-calendar-days").first().click({ force: true });
    await this.page.locator(".k-animation-container input").first().fill(`${month}/${day}/${year}`);
    await this.page.locator(".k-animation-container button").filter({ hasText: "Filter" }).first().click({ force: true });
    await waitForLoading(this.page, 3);
  }

  async getColumnCellsData(columnName: string) {
    const columnIndex = await this.getColumnIndex(columnName);
    const result: string[] = [];
    const count = await this.getElement().rows().count();
    for (let index = 0; index < count; index += 1) {
      result.push(normalizeText(await this.getElement().rows().nth(index).locator("td").nth(columnIndex).textContent()));
    }
    return result;
  }

  async isColumnExist(columnName: string, _variableAlias?: string) {
    await this.refreshGridState();
    if (this.columnOrder[columnName] !== undefined) return true;
    const headerCount = await this.getElement().columns().count();
    for (let index = 0; index < headerCount; index += 1) {
      if (normalizeText(await this.getElement().columns().nth(index).textContent()) === columnName) return true;
    }
    return false;
  }
}

export default FilingGrid;
