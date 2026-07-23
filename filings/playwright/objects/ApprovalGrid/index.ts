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

const DEFAULT_GRID_COLUMNS = [
  "PDF",
  "Message",
  "Form Name",
  "Application Type",
  "Application Status",
  "Submitted Date",
  "Approved/Rejected By",
  "Total Due",
  "Reference ID",
  "Business Name (DBA)",
  "Business Address",
  "State Tax ID",
];

type ApprovalGridProps = {
  sortType?: string;
  municipalitySelection?: string;
  userType: "ags" | "municipal" | "taxpayer";
};

class ApprovalGrid {
  municipalitySelection: string;
  sortType: string;
  private columnOrder: Record<string, number> = {};

  constructor(private readonly page: Page, private readonly props: ApprovalGridProps) {
    this.municipalitySelection = props.municipalitySelection || "City of Arrakis";
    this.sortType = props.sortType || "default";
  }

  private elements() {
    return {
      pageTitle: () => this.page.locator("h1"),
      helpText: () => this.page.locator("h1").first().locator("xpath=following-sibling::*[1]"),
      columns: () => this.page.locator("thead tr th"),
      rows: () => this.page.locator("tbody tr").filter({ has: this.page.locator("td") }),
      customizeTableViewButton: () => this.page.locator("*").filter({ hasText: "Customize Table View" }).first(),
      specificColumnFilter: (columnOrder: number) => this.page.locator("thead tr th").nth(columnOrder).locator("span a").first(),
      filterOperationsDropdown: () => this.page.locator(".k-filter-menu-container .k-dropdownlist").first(),
      filterValueInput: () => this.page.locator(".k-filter-menu-container .k-input").first(),
      filterValueDateInput: () => this.page.locator(".k-dateinput input").first(),
      filterFilterButton: () => this.page.locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      searchMunicipalityDropdown: () => this.page.locator('input[placeholder="Search government ..."], input[placeholder="Search government"]').first(),
      anyList: () => this.page.locator("li"),
      startAllApprovalsButton: () => this.page.locator(".NLGButtonPrimary").first(),
      exportButton: () => this.page.locator(".NLGNewLayoutSecondaryButton, button").filter({ hasText: "Export" }).first(),
      startApprovalForSelectedButton: () => this.page.locator("*").filter({ hasText: "Enroll in workflow" }).first(),
      anyModal: () => this.page.locator(".k-window, .k-dialog").last(),
    };
  }

  getElement() {
    return this.elements();
  }

  async init() {
    if (this.props.userType === "taxpayer") throw new Error("Taxpayer user type is not allowed to access this page");
    await this.page.goto("/filingApp/approvalList");
    await waitForLoading(this.page, 5);
    if (this.props.userType === "ags") await this.selectMunicipality(this.municipalitySelection);
    await this.refreshGridState();
  }

  async refreshGridState() {
    this.columnOrder = await getColumnOrder(this.getElement().columns(), DEFAULT_GRID_COLUMNS);
  }

  async clickStartAllApprovals() {
    await this.getElement().startAllApprovalsButton().click({ force: true });
    await waitForLoading(this.page, 3);
  }

  async clickExportButton() {
    const downloadPromise = this.page.waitForEvent("download", { timeout: 10000 }).catch(() => null);
    await this.getElement().exportButton().click({ force: true });
    await downloadPromise;
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
  }

  async filterColumn(columnName: string, filterValue: string, filterType = "text", filterOperation = "Contains") {
    const columnIndex = await this.getColumnIndex(columnName);
    switch (filterType) {
      case "text":
        validateFilterOperation("text", filterOperation);
        await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
        await selectFilterOperation(this.page, this.getElement().filterOperationsDropdown(), filterOperation);
        if (!["Is not null", "Is null"].includes(filterOperation)) await this.getElement().filterValueInput().fill(filterValue);
        await this.getElement().filterFilterButton().click({ force: true });
        break;
      case "date":
        validateFilterOperation("date", filterOperation);
        await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
        await selectFilterOperation(this.page, this.getElement().filterOperationsDropdown(), filterOperation);
        await this.getElement().filterValueDateInput().fill(filterValue);
        await this.getElement().filterFilterButton().click({ force: true });
        break;
      case "number":
        validateFilterOperation("number", filterOperation);
        await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
        await selectFilterOperation(this.page, this.getElement().filterOperationsDropdown(), filterOperation);
        await this.getElement().filterValueInput().fill(filterValue);
        await this.getElement().filterFilterButton().click({ force: true });
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

  async clickStartApprovalForSelectedButton() {
    await this.getElement().startApprovalForSelectedButton().click({ force: true });
  }

  private async selectRow(anchorColumnName: string, anchorValue: string) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.getRowByAnchor(anchorColumnName, anchorValue);
    await row.locator("td").first().locator("input, .k-checkbox").first().click({ force: true });
  }

  async selectRowToApprove(anchorColumnName: string, anchorValue: string) {
    await this.selectRow(anchorColumnName, anchorValue);
    await this.clickStartApprovalForSelectedButton();
    await this.page.locator(".NLGButtonPrimary").filter({ hasText: "Approve" }).first().click({ force: true });
    await this.page.locator(".k-dialog-content textarea").first().fill("Approved");
    const responsePromise = this.page
      .waitForResponse((response) => response.request().method() === "PATCH" && response.url().includes("/approval-status/"), { timeout: 15000 })
      .catch(() => null);
    await this.page.locator(".k-dialog button").filter({ hasText: "Approve" }).first().click({ force: true });
    const response = await responsePromise;
    if (response) expect(response.status()).toBe(200);
  }

  async selectRowToReject(anchorColumnName: string, anchorValue: string) {
    await this.selectRow(anchorColumnName, anchorValue);
    await this.clickStartApprovalForSelectedButton();
    await this.page.locator(".NLGButtonSecondary").filter({ hasText: "Reject" }).first().click({ force: true });
    await this.page.locator(".k-dialog-content textarea").first().fill("Rejected");
    const responsePromise = this.page
      .waitForResponse((response) => response.request().method() === "PATCH" && response.url().includes("/approval-status/"), { timeout: 15000 })
      .catch(() => null);
    await this.page.locator(".k-dialog button").filter({ hasText: "Reject" }).first().click({ force: true });
    const response = await responsePromise;
    if (response) expect(response.status()).toBe(200);
  }
}

export default ApprovalGrid;
