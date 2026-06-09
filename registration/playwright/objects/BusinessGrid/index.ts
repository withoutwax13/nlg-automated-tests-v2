import { type Locator, type Page } from "@playwright/test";
import {
  clickByText,
  findRowByCellValue,
  getColumnOrder,
  normalizeText,
  selectFilterOperation,
  waitForLoading,
} from "../../support/native-helpers";
import { validateFilterOperation } from "../../utils/Grid";
import BusinessDeleteModal from "../BusinessDeleteModal";

const AGS_COLUMNS = [
  "Actions",
  "Business Name",
  "DBA",
  "Operating Status",
  "Required Forms",
  "Delinquency Start Date",
  "Close Date",
  "State Tax ID",
  "FEIN",
  "Location Address 1",
  "Location Address 2",
  "Location City",
  "Location State",
  "Location Zip Code",
  "Legal Business Address 1",
  "Legal Business Address 2",
  "Location Open Date",
  "Legal Business City",
  "Legal Business State",
  "Legal Business Zip Code",
  "Owner Full Name",
  "Owner Email Address",
  "Owner Phone Number",
  "Owner SSN",
  "Owner Address 1",
  "Owner Address 2",
  "Owner City",
  "Owner Zip Code",
  "Mailing Address 1",
  "Mailing Address 2",
  "Mailing City",
  "Mailing State",
  "Mailing Zip Code",
  "Manager Full Name",
  "Manager Title",
  "Manager Email Address",
  "Manager Phone Number",
  "Emergency Phone Number",
];

type BusinessGridProps = {
  userType: "ags" | "municipal" | "taxpayer";
  municipalitySelection?: string;
};

class BusinessGrid {
  businessDeleteModal: BusinessDeleteModal;
  private columnOrder: Record<string, number> = {};

  constructor(private readonly page: Page, private readonly props: BusinessGridProps) {
    this.businessDeleteModal = new BusinessDeleteModal(page);
  }

  private elements() {
    return {
      addBusinessButton: () => this.page.locator(".NLGNewLayoutSecondaryButton, button").filter({ hasText: "Add a Business" }).first(),
      columns: () => this.page.locator("thead tr th"),
      rows: () => this.page.locator("tbody tr").filter({ has: this.page.locator("td") }),
      anyList: () => this.page.locator("li"),
      noRecordFoundComponent: () => this.page.locator(".k-grid-norecords-template"),
      searchMunicipalityDropdown: () => this.page.locator('input[placeholder="Search government ..."], input[placeholder="Search government"]').first(),
      specificColumnFilter: (columnOrder: number) => this.page.locator("thead tr th").nth(columnOrder).locator("span a").first(),
      filterOperationsDropdown: () => this.page.locator(".k-filter-menu-container .k-dropdownlist").first(),
      filterValueInput: () => this.page.locator(".k-filter-menu-container .k-input").first(),
      filterFilterButton: () => this.page.locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
    };
  }

  getElement() {
    return this.elements();
  }

  async init() {
    await this.page.goto("/BusinessesApp/BusinessesList");
    await waitForLoading(this.page, 5);
    if (this.props.userType === "ags" && this.props.municipalitySelection) {
      await this.searchMunicipality(this.props.municipalitySelection);
    }
    await this.refreshGridState();
  }

  async refreshGridState() {
    this.columnOrder = await getColumnOrder(this.getElement().columns(), AGS_COLUMNS);
  }

  async searchMunicipality(municipalityName: string) {
    await this.getElement().searchMunicipalityDropdown().fill(municipalityName);
    await clickByText(this.getElement().anyList(), municipalityName);
    await waitForLoading(this.page, 5);
  }

  async clickAddBusinessButton() {
    await this.getElement().addBusinessButton().click({ force: true });
    await waitForLoading(this.page, 5);
  }

  private async getColumnIndex(columnName: string) {
    if (this.columnOrder[columnName] === undefined) await this.refreshGridState();
    return this.columnOrder[columnName];
  }

  async filterColumn(columnName: string, filterValue: string, filterType = "text", filterOperation = "Contains") {
    if (filterType !== "text") return;
    validateFilterOperation("text", filterOperation);
    const columnIndex = await this.getColumnIndex(columnName);
    await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await selectFilterOperation(this.page, this.getElement().filterOperationsDropdown(), filterOperation);
    if (!["Is not null", "Is null"].includes(filterOperation)) {
      await this.getElement().filterValueInput().fill(filterValue);
    }
    await this.getElement().filterFilterButton().click({ force: true });
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
    await this.filterColumn(anchorColumnName, anchorValue);
    const row = await this.getRowByAnchor(anchorColumnName, anchorValue);
    const columnIndex = await this.getColumnIndex(targetColumnName);
    return normalizeText(await row.locator("td").nth(columnIndex).textContent());
  }

  async getElementOfColumn(targetColumnName: string, anchorColumnName: string, anchorValue: string, _alias?: string): Promise<Locator> {
    await this.filterColumn(anchorColumnName, anchorValue);
    const row = await this.getRowByAnchor(anchorColumnName, anchorValue);
    const columnIndex = await this.getColumnIndex(targetColumnName);
    return row.locator("td").nth(columnIndex);
  }

  async viewBusinessDetails(businessDba: string) {
    const actionCell = await this.getElementOfColumn("Actions", "DBA", businessDba);
    await actionCell.locator("button, i").first().click({ force: true });
    await clickByText(this.getElement().anyList(), "View Details");
    await waitForLoading(this.page, 5);
  }

  async deleteBusiness(businessDba: string) {
    const actionCell = await this.getElementOfColumn("Actions", "DBA", businessDba);
    await actionCell.locator("button, i").first().click({ force: true });
    await clickByText(this.getElement().anyList(), "Delete");
    await this.businessDeleteModal.clickDeleteButton();
  }
}

export default BusinessGrid;
