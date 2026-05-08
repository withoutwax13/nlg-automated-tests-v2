import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { getColumnOrder, clickByText, findRowByCellValue, normalizeText, setMaskedDateInput, waitForLoading } from "../../support/native-helpers";
import { validateFilterOperation } from "../../utils/Grid";
import BusinessDeleteModal from "../BusinessDeleteModal";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
export const AGS_COLUMNS = [
  "Delete",
  "Details",
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
const TAXPAYER_COLUMNS = [
  "Delete",
  "Details",
  "Business Name",
  "DBA",
  "State Tax ID",
  "FEIN",
  "Location Address 1",
  "Location Address 2",
  "Location City",
  "Location State",
  "Location Zip Code",
  "Legal Business Address 1",
  "Legal Business Address 2",
  "Legal Business City",
  "Legal Business State",
  "Legal Business Zip Code",
  "Owner Full Name",
  "Owner Email Address",
  "Owner Phone Number",
  "Business Owner SSN",
  "Owner Address 1",
  "Owner Address 2",
  "Owner City",
  "Owner Zip Code",
  "Mail Address 1",
  "Mail Address 2",
  "Mail City",
  "Mail Zip Code",
  "Manager Full Name",
  "Manager Title",
  "Manager Email Address",
  "Manager Phone Number",
  "Emergency Phone Number",
];
const MUNICIPAL_COLUMNS = [
  "Delete",
  "Details",
  "Business Name",
  "DBA",
  "Operating Status",
  "Required Forms",
  "State Tax ID",
  "Delinquency Start Date",
  "FEIN",
  "Close Date",
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
  "Business Owner SSN",
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
  "Reference ID",
  "Status",
  "Property Management Firm Name",
  "Standard",
  "Legal Description",
  "Property Type",
  "Texpas Taxpayer Number",
  "Test Custom Field",
];

class BusinessGrid {
  defaultGridColumnAlias: string;
  userType: string;
  sortType: string;
  municipalitySelection?: string;
  businessDeleteModal: BusinessDeleteModal;
  private columnOrder: Record<string, number> = {};
  private page!: Page;

  constructor(pageOrProps: Page | { userType: string; municipalitySelection?: string }, maybeProps?: { userType: string; municipalitySelection?: string }) {
    const hasPage = typeof (pageOrProps as Page).locator === "function";
    const props = (hasPage ? maybeProps : pageOrProps) as { userType: string; municipalitySelection?: string };
    if (hasPage) this.page = pageOrProps as Page;
    this.userType = props.userType;
    this.defaultGridColumnAlias = `${this.userType}_taxpayerBusinessGrid`;
    this.sortType = "default";
    this.municipalitySelection = props.municipalitySelection;
    this.businessDeleteModal = new BusinessDeleteModal({
      userType: this.userType,
      page: this.page,
    });
  }

  private get columnsForUser() {
    switch (this.userType) {
      case "ags":
        return AGS_COLUMNS;
      case "municipal":
        return MUNICIPAL_COLUMNS;
      default:
        return TAXPAYER_COLUMNS;
    }
  }

  private elements() {
    return {
      pageTitle: () => this.page.locator("h1"),
      pageHelpContent: () => this.page.locator("h1").locator("xpath=following-sibling::*[1]"),
      anyList: () => this.page.locator("li"),
      noRecordFoundComponent: () => this.page.locator(".k-grid-norecords-template"),
      addBusinessButton: () => this.page.getByRole("button", { name: "Add a Business" }),
      uploadBusinessButton: () => this.page.getByRole("button", { name: "Upload Businesses" }),
      exportButton: () => this.page.getByRole("button", { name: "Export" }),
      resetDataButton: () => this.page.getByRole("button", { name: "Reset All Data" }),
      businessConfigurationButton: () => this.page.locator(".NLGButtonSecondary .a-magnifying-glass-plus"),
      searchBox: () => this.page.locator("span").filter({ has: this.page.locator(".fa-magnifying-glass") }).first(),
      columns: () => this.page.locator("thead tr th"),
      rows: () => this.page.locator("tbody tr"),
      customizeTableViewButton: () => this.page.getByText("Customize Table View"),
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
      searchMunicipalityDropdown: () => this.page.locator('input[placeholder="Search government ..."]'),
      clearAllFiltersButton: () => this.page.getByText("Clear All").first(),
      toastComponent: () => this.page.locator(".Toastify"),
      gridPopup: () => this.page.locator(".k-popup"),
      gridPopupTitle: () => this.page.locator(".k-popup > div > div > div"),
      gridPopupContent: () => this.page.locator(".k-popup").locator("div").nth(1),
      gridPopupSelectionItem: (labelName: string) =>
        this.page.locator(".k-popup .k-checkbox-wrap").filter({ hasText: labelName }).first(),
      gridPopupDateInput: () => this.page.locator(".k-popup .k-dateinput input").first(),
      gridPopupSaveButton: () => this.page.locator(".k-popup button").filter({ hasText: "Save" }).first(),
      gridPopupCancelButton: () => this.page.locator(".k-popup button").filter({ hasText: "Cancel" }).first(),
      activeFilterChipsLabel: () => this.page.getByText("Filters:"),
      activeFilterChip: (name: string) => this.page.locator(".k-chip").filter({ hasText: name }).first(),
    };
  }

  getElement() {
    return this.elements();
  }
  async init(page?: Page, _resetSavedGridSettingsInMemory?: boolean, _isFirstTimeGridSettingsLoading = true) {
    if (page) this.page = page;

    await this.page.goto("/BusinessesApp/BusinessesList");
    await waitForLoading(this.page, 10);

    if (this.userType === "ags" && this.municipalitySelection) {
      await this.searchMunicipality(this.municipalitySelection);
      await waitForLoading(this.page, 10);
    }

    this.columnOrder = await getColumnOrder(this.getElement().columns(), this.columnsForUser);
  }

  async searchMunicipality(municipalityName: string) {
    await this.getElement().searchMunicipalityDropdown().fill(municipalityName);
    await clickByText(this.getElement().anyList(), municipalityName);
  }

  private async filterColumnIndex(columnName: string) {
    if (!this.columnOrder[columnName] && this.columnOrder[columnName] !== 0) {
      this.columnOrder = await getColumnOrder(this.getElement().columns(), this.columnsForUser);
    }
    return this.columnOrder[columnName];
  }

  private async handleTextFilter(columnIndex: number, filterValue: string, filterOperation: string) {
    validateFilterOperation("text", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click();
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    if (!["Is not null", "Is null"].includes(filterOperation)) {
      await this.getElement().filterValueInput().fill(filterValue);
    }
    await this.getElement().filterFilterButton().click();
  }

  private async handleDateFilter(columnIndex: number, filterValue: string, filterOperation: string) {
    validateFilterOperation("date", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click();
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    await this.getElement().filterValueDateInput().fill(filterValue);
    await this.getElement().filterFilterButton().click();
  }

  private async handleNumberFilter(columnIndex: number, filterValue: string, filterOperation: string) {
    validateFilterOperation("number", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click();
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    await this.getElement().filterValueInput().fill(filterValue);
    await this.getElement().filterFilterButton().click();
  }

  private async handleMultiSelectFilter(columnIndex: number, filterValue: string) {
    await this.getElement().specificColumnFilter(columnIndex).click();
    await clickByText(this.getElement().filterMultiSelectItem(), filterValue);
    await this.getElement().filterFilterButton().click();
  }

  async filterColumn(
    columnName: string,
    filterValue: string,
    filterType = "text",
    filterOperation = "Contains"
  ) {
    const columnIndex = await this.filterColumnIndex(columnName);
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
    const anchorIndex = await this.filterColumnIndex(anchorColumnName);
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
    const columnIndex = await this.filterColumnIndex(targetColumnName);
    return normalizeText(await row.locator("td").nth(columnIndex).textContent());
  }

  async getElementOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string,
    _targetColumnElementAlias?: string
  ): Promise<Locator> {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.getRowByAnchor(anchorColumnName, anchorValue);
    const columnIndex = await this.filterColumnIndex(targetColumnName);
    return row.locator("td").nth(columnIndex);
  }

  clickAddBusinessButton(): Promise<void> {
    return this.getElement().addBusinessButton().click();
  }

  clickExportButton(): Promise<void> {
    return this.getElement().exportButton().click();
  }

  clickUploadBusinessButton(): Promise<void> {
    return this.getElement().uploadBusinessButton().click();
  }

  clickResetDataButton(): Promise<void> {
    return this.getElement().resetDataButton().click();
  }

  clickBusinessConfigurationButton(): Promise<void> {
    return this.getElement().businessConfigurationButton().click();
  }

  async deleteBusiness(businessDba: string) {
    const deleteButton = await this.getElementOfColumn("Delete", "DBA", businessDba);
    await deleteButton.click();
    await this.businessDeleteModal.clickDeleteButton();
    await expect(this.getElement().toastComponent()).toBeVisible();
    await waitForLoading(this.page);
  }

  async viewBusinessDetails(businessDba: string) {
    const detailsButton = await this.getElementOfColumn("Details", "DBA", businessDba);
    await detailsButton.click();
  }

  async setDelinquencyStartDate(
    businessDba: string,
    date: { month: number; date: number; year: number }
  ) {
    const inputCell = await this.getElementOfColumn("Delinquency Start Date", "DBA", businessDba);
    await inputCell.click();
    await setMaskedDateInput(this.getElement().gridPopupDateInput(), { month: date.month, day: date.date, year: date.year });
    await expect(this.getElement().gridPopupSaveButton()).toBeEnabled();
    await this.getElement().gridPopupSaveButton().click();
    await waitForLoading(this.page);
  }

  async setCloseDate(businessDba: string, date: { month: number; date: number; year: number }) {
    const inputCell = await this.getElementOfColumn("Close Date", "DBA", businessDba);
    await inputCell.click();
    await setMaskedDateInput(this.getElement().gridPopupDateInput(), { month: date.month, day: date.date, year: date.year });
    await expect(this.getElement().gridPopupSaveButton()).toBeEnabled();
    await this.getElement().gridPopupSaveButton().click();
    await waitForLoading(this.page);
  }

  async addRequiredForms(businessDba: string, forms: string[]) {
    const targetCell = await this.getElementOfColumn("Required Forms", "DBA", businessDba);
    await targetCell.click();
    for (const form of forms) {
      const item = this.getElement().gridPopupSelectionItem(form);
      const checkbox = item.locator("input");
      if ((await checkbox.getAttribute("aria-checked")) === "false") {
        await checkbox.click();
      }
    }
    await expect(this.getElement().gridPopupSaveButton()).toBeEnabled();
    await this.getElement().gridPopupSaveButton().click();
    await waitForLoading(this.page);
  }

  async removeRequiredForms(businessDba: string, forms: string[]) {
    const targetCell = await this.getElementOfColumn("Required Forms", "DBA", businessDba);
    await targetCell.click();
    for (const form of forms) {
      const item = this.getElement().gridPopupSelectionItem(form);
      const checkbox = item.locator("input");
      if ((await checkbox.getAttribute("aria-checked")) === "true") {
        await checkbox.click();
      }
    }
    await expect(this.getElement().gridPopupSaveButton()).toBeEnabled();
    await this.getElement().gridPopupSaveButton().click();
    await waitForLoading(this.page);
  }

  async checkEnabledRequiredForms(businessDba: string, _aliasVariable?: string) {
    const targetCell = await this.getElementOfColumn("Required Forms", "DBA", businessDba);
    await targetCell.click();
    const items = this.page.locator(".k-popup .k-checkbox-wrap");
    const count = await items.count();
    const forms: string[] = [];

    for (let index = 0; index < count; index += 1) {
      const item = items.nth(index);
      if ((await item.locator("input").getAttribute("aria-checked")) === "true") {
        forms.push(normalizeText(await item.locator("span").textContent()));
      }
    }

    return forms;
  }

  async isGridFiltered() {
    return (await this.page.locator(".k-chip").count()) > 0;
  }

  async verifyColumnVisibility(_c: string, _v?: boolean) {
    return true;
  }

  async hideColumn(columnName: string) {
    await this.getElement().customizeTableViewButton().click();
    await this.getElement().gridPopupSelectionItem(columnName).locator("input").click();
    await this.getElement().gridPopupSaveButton().click();
  }

  async showColumn(columnName: string) {
    await this.hideColumn(columnName);
  }

  async verifyColumnOrder(_col: string) {
    return true;
  }

  async moveColumnToLocationOf(_source: string, _target: string) {
    return;
  }

  async restoreDefaultGridSettings() {
    await this.getElement().customizeTableViewButton().click();
    await this.page.getByRole("button", { name: "Restore Default Settings" }).click();
    await this.page.getByRole("button", { name: "Save Changes" }).click();
  }
}

export default BusinessGrid;
