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

const MUNICIPAL_APPLICATION_COLUMNS = [
  "",
  "Action",
  "Certificate",
  "Assigned to Me",
  "Messages",
  "Application Status",
  "Submission Date",
  "Form Name",
  "Business Name",
  "Business Address",
  "Registration Period",
  "Registration Type",
  "Due Date",
  "Total Paid",
  "Outstanding Balance",
  "Submission Payment Status",
  "Approval Payment Status",
  "Approved/Rejected Date",
  "Approved/Rejected By",
  "Active Agency",
  "Reference ID",
  "Registration Record ID",
];
const AGS_APPLICATION_COLUMNS = [
  "",
  "Action",
  "Certificate",
  "Assigned To Me",
  "Messages",
  "Application Status",
  "Submission Date",
  "Form Name",
  "Business Name",
  "Legal Business Address",
  "Location Address 1",
  "Location Address 2",
  "Registration Period",
  "Registration Type",
  "Due Date",
  "Total Paid",
  "Outstanding Balance",
  "Submission Payment Status",
  "Approval Payment Status",
  "Approval Check Number",
  "Approved/Rejected Date",
  "Approved/Rejected By",
  "Active Agency",
  "Reference ID",
  "Registration Record ID",
];
const TAXPAYER_APPLICATION_COLUMNS = [
  "Action Button",
  "Certificate",
  "Messages",
  "Government Name",
  "Application Status",
  "Renewal Availability",
  "Total Paid",
  "Outstanding Balance",
  "Submission Payment Status",
  "Approval Payment Status",
  "Approval Check Number",
  "Legal Business Address",
  "Location Address 1",
  "Location Address 2",
  "Submission Date",
  "Form Name",
  "Registration Period",
  "Frequency",
  "Due Date",
  "Approved/Rejected Date",
  "Reference ID",
  "Registration Record ID",
];

type ApplicationGridProps = {
  userType: "taxpayer" | "municipal" | "ags";
  sortType?: string;
  municipalitySelection?: string;
};

class ApplicationGrid {
  sortType: string;
  municipalitySelection?: string;
  private columnOrder: Record<string, number> = {};

  constructor(private readonly page: Page, private readonly props: ApplicationGridProps) {
    this.sortType = props.sortType || "default";
    this.municipalitySelection = props.municipalitySelection;
  }

  private get defaultColumns() {
    if (this.props.userType === "ags") return AGS_APPLICATION_COLUMNS;
    if (this.props.userType === "municipal") return MUNICIPAL_APPLICATION_COLUMNS;
    return TAXPAYER_APPLICATION_COLUMNS;
  }

  private elements() {
    return {
      columns: () => this.page.locator("thead tr th"),
      rows: () => this.page.locator("tbody tr").filter({ has: this.page.locator("td") }),
      noRecordFoundComponent: () => this.page.locator(".k-grid-norecords-template"),
      customizeTableViewButton: () => this.page.locator("*").filter({ hasText: "Customize" }).first(),
      specificColumnFilter: (columnOrder: number) => this.page.locator("thead tr th").nth(columnOrder).locator("span a").first(),
      itemsPerPageDropdown: () => this.page.locator(".k-dropdownlist").first(),
      itemsPerPageDropdownItem: (itemNumber: number) => this.page.locator("li").filter({ hasText: String(itemNumber) }).first(),
      filterOperationsDropdown: () => this.page.locator(".k-filter-menu-container .k-dropdownlist").first(),
      filterValueInput: () => this.page.locator(".k-filter-menu-container .k-input").first(),
      filterValueDateInput: () => this.page.locator(".k-dateinput input").first(),
      filterFilterButton: () => this.page.locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      searchMunicipalityDropdown: () => this.page.locator('input[placeholder="Search government"]'),
      anyList: () => this.page.locator("li"),
      startApplicationWorkflowForSelectedApplicationsButton: () => this.page.locator(".NLG-HyperlinkNoPadding").filter({ hasText: "Enroll in workflo" }).first(),
      clearAllFiltersButton: () => this.page.locator("*").filter({ hasText: "Clear All" }).first(),
    };
  }

  getElement() {
    return this.elements();
  }

  async init(firstInit = true) {
    await this.page.goto("/registrationApp/applicationsList");
    await waitForLoading(this.page, 5);
    if (this.props.userType === "ags") {
      if (!this.municipalitySelection) throw new Error("Municipality selection is required for AGS user type");
      if (firstInit) await this.selectMunicipality(this.municipalitySelection);
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

  async selectRowToReview(params: { anchorColumnName?: string; anchorValue?: string; numberToRandomlySelect?: number }) {
    if (params.anchorColumnName && params.anchorValue) {
      await this.filterColumn(params.anchorColumnName, params.anchorValue, "text", "Contains");
      const row = await this.getRowByAnchor(params.anchorColumnName, params.anchorValue);
      await row.locator("td").first().locator(".k-checkbox, input[type='checkbox']").first().click({ force: true });
      return;
    }

    const count = params.numberToRandomlySelect ?? 0;
    for (let index = 0; index < count; index += 1) {
      await this.getElement().rows().nth(index).locator(".k-checkbox, input[type='checkbox']").first().click({ force: true });
    }
  }

  async clickStartApplicationWorkflowForSelectedApplicationsButton() {
    await this.getElement().startApplicationWorkflowForSelectedApplicationsButton().click({ force: true });
  }

  async manuallyChangeApplicationPaymentStatus(toApprovalPaymentStatus: string, anchorColumnName: string, anchorValue: string) {
    const paymentStatusCell = await this.getElementOfColumn("Approval Payment Status", anchorColumnName, anchorValue);
    await paymentStatusCell.locator("i, button").first().click({ force: true });
    await clickByText(this.getElement().anyList(), "Update Status");
    await this.page.locator(".k-dialog-content label").filter({ hasText: toApprovalPaymentStatus }).first().click({ force: true });
    await this.page.locator(".NLGButtonPrimary").filter({ hasText: "Save" }).first().click({ force: true });
    await waitForLoading(this.page, 3);
  }

  async payApplication(anchorColumnName: string, anchorValue: string) {
    const applicationStatusCell = await this.getElementOfColumn("Application Status", anchorColumnName, anchorValue);
    await applicationStatusCell.locator("i, button").first().click({ force: true });
    await clickByText(this.getElement().anyList(), "Pay Now");
    await waitForLoading(this.page, 3);
  }
}

export default ApplicationGrid;
