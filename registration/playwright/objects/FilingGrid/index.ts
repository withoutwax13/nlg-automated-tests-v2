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
const MUNICIPAL_FILING_COLUMNS = [...AGS_FILING_COLUMNS];
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
      columns: () => this.page.locator("thead tr th"),
      rows: () => this.page.locator("tbody tr").filter({ has: this.page.locator("td") }),
      noRecordFoundComponent: () => this.page.locator(".k-grid-norecords-template"),
      specificColumnFilter: (columnOrder: number) => this.page.locator("thead tr th").nth(columnOrder).locator("span a").first(),
      filterOperationsDropdown: () => this.page.locator(".k-filter-menu-container .k-dropdownlist").first(),
      filterValueInput: () => this.page.locator(".k-filter-menu-container .k-input").first(),
      filterValueDateInput: () => this.page.locator(".k-dateinput input").first(),
      filterFilterButton: () => this.page.locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      searchMunicipalityDropdown: () => this.page.locator('input[placeholder="Select government..."], input[placeholder="Search government"]').first(),
      anyList: () => this.page.locator("li"),
      clearAllFiltersButton: () => this.page.locator("*").filter({ hasText: "Clear All" }).first(),
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
    await waitForLoading(this.page, 10);
  }

  private async getColumnIndex(columnName: string) {
    if (this.columnOrder[columnName] === undefined) await this.refreshGridState();
    return this.columnOrder[columnName];
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

  async deleteFiling(anchorColumnName: string, anchorValue: string) {
    if (this.props.userType !== "ags" && this.props.userType !== "taxpayer") {
      throw new Error("Delete action is not available for this user type");
    }

    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.getRowByAnchor(anchorColumnName, anchorValue);

    if (this.props.userType === "taxpayer") {
      const actionCell = await this.getElementOfColumn("Actions", anchorColumnName, anchorValue);
      await actionCell.click({ force: true });
      await clickByText(this.getElement().anyList(), "Delete");
    } else {
      const paymentColumnIndex = await this.getColumnIndex("Payment Status");
      await row.locator("td").nth(paymentColumnIndex).locator("button, i").first().click({ force: true });
      await clickByText(this.getElement().anyList(), "Delete Filing");
    }

    const deletePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        (response.url().includes("/filings/delete/ReferenceId/") || response.url().includes("/filings/")),
      { timeout: 15000 }
    ).catch(() => null);
    await this.page.locator(".k-dialog-actions button").filter({ hasText: "Delete" }).first().click({ force: true });
    const response = await deletePromise;
    if (response) expect([200, 201, 204]).toContain(response.status());
    await waitForLoading(this.page, 3);
  }

  async updateStatus(newStatus: string, anchorColumnName: string, anchorValue: string) {
    if (this.props.userType !== "ags") {
      throw new Error("Update status action is not available for this user type");
    }

    const paymentStatusCell = await this.getElementOfColumn("Payment Status", anchorColumnName, anchorValue);
    await paymentStatusCell.locator('button[aria-label="Payment status actions"], button, i').first().click({ force: true });
    await clickByText(this.getElement().anyList(), "Update Status");
    const statusInput = this.page.locator(`.k-window-content input[value="${newStatus}"], .k-dialog input[value="${newStatus}"]`).first();
    if (await statusInput.count()) {
      await statusInput.click({ force: true });
    } else {
      await this.page.locator(".k-window-content label, .k-dialog label").filter({ hasText: newStatus }).first().click({ force: true });
    }
    const responsePromise = this.page
      .waitForResponse(
        (response) =>
          ["PATCH", "PUT", "POST"].includes(response.request().method()) &&
          response.url().includes("azavargovapps.com") &&
          response.url().includes("/filings/"),
        { timeout: 15000 }
      )
      .catch(() => null);
    await this.page.locator(".k-dialog-actions button, .k-window-content button").filter({ hasText: "Save" }).first().click({ force: true });
    const response = await responsePromise;
    if (response) expect([200, 201, 204]).toContain(response.status());
    await waitForLoading(this.page, 3);
  }
}

export default FilingGrid;
