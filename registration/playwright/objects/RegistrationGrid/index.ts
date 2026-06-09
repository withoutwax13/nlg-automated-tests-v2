import { type Locator, type Page } from "@playwright/test";
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

const MUNICIPAL_REGISTRATION_COLUMNS = [
  "",
  "Actions",
  "Certificate",
  "Legal Business Name",
  "Registration Status",
  "Owner Name",
  "Location DBA",
  "Location Address 1",
  "Location Address 2",
  "Form Name",
  "Registration Type",
  "Issued Date",
  "Expiration Date",
  "Next Due Date",
  "Can Renew",
  "Active Agency",
  "Registration Start Date",
  "Registration Record ID",
  "Parent Registration Record ID",
  "Test Form ID",
];
const AGS_REGISTRATION_COLUMNS = [
  "",
  "Actions",
  "Certificate",
  "Legal Business Name",
  "Registration Status",
  "Owner Name",
  "Location DBA",
  "Location Address 1",
  "Location Address 2",
  "Form Name",
  "Registration Type",
  "Issued Date",
  "Expiration Date",
  "Next Due Date",
  "Can Renew",
  "Active Agency",
  "Registration Start Date",
  "Registration Record ID",
  "Parent Registration Record ID",
  "Standard",
  "Test Form ID",
];

type RegistrationGridProps = {
  userType: "municipal" | "ags";
  sortType?: string;
  municipalitySelection?: string;
};

class RegistrationGrid {
  sortType: string;
  municipalitySelection?: string;
  private columnOrder: Record<string, number> = {};

  constructor(private readonly page: Page, private readonly props: RegistrationGridProps) {
    this.sortType = props.sortType || "default";
    this.municipalitySelection = props.municipalitySelection;
  }

  private get defaultColumns() {
    return this.props.userType === "ags" ? AGS_REGISTRATION_COLUMNS : MUNICIPAL_REGISTRATION_COLUMNS;
  }

  private elements() {
    return {
      columns: () => this.page.locator("thead tr th"),
      rows: () => this.page.locator("tbody tr").filter({ has: this.page.locator("td") }),
      noRecordFoundComponent: () => this.page.locator(".k-grid-norecords-template"),
      customizeTableViewButton: () => this.page.locator("*").filter({ hasText: "Customize" }).first(),
      specificColumnFilter: (columnOrder: number) => this.page.locator("thead tr th").nth(columnOrder).locator("span a").first(),
      filterOperationsDropdown: () => this.page.locator(".k-filter-menu-container .k-dropdownlist").first(),
      filterValueInput: () => this.page.locator(".k-filter-menu-container .k-input").first(),
      filterValueDateInput: () => this.page.locator(".k-dateinput input").first(),
      filterFilterButton: () => this.page.locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      searchMunicipalityDropdown: () => this.page.locator('input[placeholder="Search government"]'),
      searchGrid: () => this.page.locator('input[placeholder="Search registrations"]'),
      anyList: () => this.page.locator("li"),
      clearAllFiltersButton: () => this.page.locator("*").filter({ hasText: "Clear All" }).first(),
      toastComponent: () => this.page.locator(".Toastify"),
    };
  }

  getElement() {
    return this.elements();
  }

  async init() {
    await this.page.goto("/registrationApp/registrationList");
    await waitForLoading(this.page, 5);
    if (this.props.userType === "ags") {
      if (!this.municipalitySelection) throw new Error("Municipality selection is required for AGS user type");
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

  async searchGrid(term: string) {
    await this.getElement().searchGrid().fill(term);
    await this.page.waitForTimeout(1000);
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

  async toggleRegistrationActionButton(action: string, anchorColumnName: string, anchorValue: string) {
    await this.searchGrid(anchorValue);
    const actionCell = await this.getElementOfColumn("Actions", anchorColumnName, anchorValue);
    await actionCell.click({ force: true });
    await clickByText(this.getElement().anyList(), action);
    await waitForLoading(this.page, 3);
  }

  async manuallyChangeRegistrationStatus(toRegStatus: string, anchorColumnName: string, anchorValue: string) {
    const regStatusCell = await this.getElementOfColumn("Registration Status", anchorColumnName, anchorValue);
    await regStatusCell.locator("i, button").first().click({ force: true });
    await clickByText(this.getElement().anyList(), toRegStatus);
    await this.page.locator(".NLGButtonPrimary").filter({ hasText: `Update status to ${toRegStatus}` }).first().click({ force: true });
    if (toRegStatus === "Active") {
      await this.page.locator('button[aria-label="Toggle calendar"]').click({ force: true });
      await clickByText(this.page.locator(".k-button-text"), "TODAY");
      await this.page.locator(".NLGButtonPrimary").filter({ hasText: `Update status to ${toRegStatus}` }).first().click({ force: true });
    }
    await waitForLoading(this.page, 3);
  }

  async manuallyChangeRegistrationDate(datePickerColumnName: string, value: string, anchorColumnName: string, anchorValue: string, isToday?: boolean) {
    const dateCell = await this.getElementOfColumn(datePickerColumnName, anchorColumnName, anchorValue);
    await dateCell.locator("i, button").first().click({ force: true });
    if (isToday === undefined) {
      await this.page.locator(".k-datepicker input").fill(value);
    } else {
      await this.page.locator('button[aria-label="Toggle calendar"]').click({ force: true });
      await clickByText(this.page.locator(".k-button-text"), "TODAY");
    }
    await this.page.locator(".NLGButtonPrimary").filter({ hasText: "Update Date" }).first().click({ force: true });
    await waitForLoading(this.page, 3);
  }
}

export default RegistrationGrid;
