import { Page } from "@playwright/test";
import { resolvePage } from "../../pageContext";
import { applyGridFilter, getColumnOrder, getRowByCellText, normalizeCellText } from "../../utils/Grid";
import { waitForLoading } from "../../utils/runtime";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
const DEFAULT_COLUMNS = [
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

class ApprovalGrid {
  municipalitySelection?: string;
  defaultGridColumnsAlias: string;
  sortType: string;
  userType: string;
  private columnMap: Record<string, number> = {};

  constructor(props: { sortType?: string; municipalitySelection?: string; userType: string }) {
    this.municipalitySelection = props.municipalitySelection || "City of Arrakis";
    this.defaultGridColumnsAlias = "defaultApprovalGridColumns";
    this.sortType = props.sortType || "default";
    this.userType = props.userType;
  }

  private elements(page: Page = resolvePage()) {
    return {
      pageTitle: () => page.locator("h1"),
      helpText: () => page.locator("h1").locator("xpath=following-sibling::*[1]"),
      columns: () => page.locator("thead tr th"),
      rows: () => page.locator("tbody tr"),
      customizeTableViewButton: () => page.getByText("Customize Table View"),
      specificColumnFilter: (columnOrder: number) =>
        page.locator("thead tr th").nth(columnOrder).locator("span a").first(),
      itemsPerPageDropdown: () => page.locator(".k-dropdownlist").first(),
      itemsPerPageDropdownItem: (itemNumber: number) =>
        page.locator("li").filter({ hasText: String(itemNumber) }).first(),
      searchMunicipalityDropdown: () =>
        page.locator('input[placeholder="Search government ..."]'),
      anyList: () => page.locator("li"),
      pendingApplicationsInfo: () => page.locator("h1").locator("xpath=following-sibling::div[2]/div[1]"),
      startAllApprovalsButton: () => page.locator(".NLGButtonPrimary").first(),
      exportButton: () => page.locator(".NLGNewLayoutSecondaryButton").filter({ hasText: "Export" }).first(),
      startApprovalForSelectedButton: () => page.getByText("Enroll in workflow"),
      anyModal: () => page.locator(".k-window"),
    };
  }

  getElement(page: Page = resolvePage()) {
    return this.elements(page);
  }

  private async loadColumnMap(page: Page = resolvePage()) {
    this.columnMap = await getColumnOrder(DEFAULT_COLUMNS, this.getElement(page).columns());
  }

  async init(page: Page = resolvePage()) {
    await page.goto("/filingApp/approvalList");
    if (this.userType === "ags") {
      await this.selectMunicipality(page, this.municipalitySelection || "City of Arrakis");
    }
    await waitForLoading(page, this.userType === "ags" ? 10 : 3);
    await this.loadColumnMap(page);
  }

  async clickStartAllApprovals(page: Page = resolvePage()) {
    await this.getElement(page).startAllApprovalsButton().click();
  }

  async clickExportButton(page: Page = resolvePage()) {
    await this.getElement(page).exportButton().click();
  }

  async selectMunicipality(page: Page = resolvePage(), municipality: string) {
    await this.getElement(page).searchMunicipalityDropdown().fill(municipality);
    await this.getElement(page).anyList().filter({ hasText: municipality }).first().click();
    await waitForLoading(page);
  }

  private async getColumnIndex(page: Page = resolvePage(), columnName: string) {
    if (!this.columnMap[columnName]) {
      await this.loadColumnMap(page);
    }
    return this.columnMap[columnName];
  }

  async sortColumn(page: Page = resolvePage(), isAscending: boolean, columnName: string) {
    const index = await this.getColumnIndex(page, columnName);
    await this.getElement(page).columns().nth(index).click();
    if (!isAscending) {
      await this.getElement(page).columns().nth(index).click();
    }
  }

  async filterColumn(
    page: Page,
    columnName: string,
    filterValue: string,
    filterType = "text",
    filterOperation = "Contains"
  ) {
    const index = await this.getColumnIndex(page, columnName);
    await applyGridFilter({
      page,
      filterButton: this.getElement(page).specificColumnFilter(index),
      filterType,
      filterValue,
      filterOperation,
    });
    await waitForLoading(page, 5);
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

  async getDataOfColumn(page: Page = resolvePage(), targetColumnName: string, anchorColumnName: string, anchorValue: string) {
    await this.filterColumn(page, anchorColumnName, anchorValue, "text", "Contains");
    const targetColumnIndex = await this.getColumnIndex(page, targetColumnName);
    const anchorColumnIndex = await this.getColumnIndex(page, anchorColumnName);
    const row = await getRowByCellText(this.getElement(page).rows(), anchorColumnIndex, anchorValue);
    return normalizeCellText(await row.locator("td").nth(targetColumnIndex).innerText());
  }

  async getElementOfColumn(page: Page = resolvePage(), targetColumnName: string, anchorColumnName: string, anchorValue: string) {
    await this.filterColumn(page, anchorColumnName, anchorValue, "text", "Contains");
    const targetColumnIndex = await this.getColumnIndex(page, targetColumnName);
    const anchorColumnIndex = await this.getColumnIndex(page, anchorColumnName);
    const row = await getRowByCellText(this.getElement(page).rows(), anchorColumnIndex, anchorValue);
    return row.locator("td").nth(targetColumnIndex);
  }

  async clickStartApprovalForSelectedButton(page: Page = resolvePage()) {
    await this.getElement(page).startApprovalForSelectedButton().click();
  }

  private async selectRow(page: Page = resolvePage(), anchorColumnName: string, anchorValue: string) {
    await this.filterColumn(page, anchorColumnName, anchorValue, "text", "Contains");
    const anchorColumnIndex = await this.getColumnIndex(page, anchorColumnName);
    const row = await getRowByCellText(this.getElement(page).rows(), anchorColumnIndex, anchorValue);
    await row.locator("td").nth(0).locator("input").click();
  }

  async selectRowToApprove(page: Page = resolvePage(), anchorColumnName: string, anchorValue: string) {
    await this.selectRow(page, anchorColumnName, anchorValue);
    await this.clickStartApprovalForSelectedButton(page);
    await page.locator(".NLGButtonPrimary").filter({ hasText: "Approve" }).click();
    await page.locator(".k-dialog-content textarea").fill("Approved");
    await page.locator(".k-dialog button").filter({ hasText: "Approve" }).last().click();
  }

  async selectRowToReject(page: Page = resolvePage(), anchorColumnName: string, anchorValue: string) {
    await this.selectRow(page, anchorColumnName, anchorValue);
    await this.clickStartApprovalForSelectedButton(page);
    await page.locator(".NLGButtonSecondary").filter({ hasText: "Reject" }).click();
    await page.locator(".k-dialog-content textarea").fill("Rejected");
    await page.locator(".k-dialog button").filter({ hasText: "Reject" }).last().click();
  }
}

export default ApprovalGrid;
