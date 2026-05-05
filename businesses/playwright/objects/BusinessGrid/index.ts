import { expect, type Locator, type Page } from "@playwright/test";
import {
  getOrderOfColumns,
  getVisibilityStatusOfColumns,
  validateFilterOperation,
} from "../../utils/Grid";
import { currentPage, fillDateInput, listItem, waitForLoading } from "../../support/runtime";
import BusinessDeleteModal from "../BusinessDeleteModal";
import GridSetting from "../GridSetting";
import SetBusinessStatusModal from "../SetBusinessStatusModal";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];

export const AGS_COLUMNS = [
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

export const TAXPAYER_COLUMNS = [
  "Actions",
  "Government Name",
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

export const MUNICIPAL_COLUMNS = [
  "Actions",
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
  private columnIndexes: Record<string, number> = {};
  private columnVisibility: Record<string, boolean> = {};

  constructor(props: { userType: string; municipalitySelection?: string }) {
    this.userType = props.userType;
    this.defaultGridColumnAlias = `${this.userType}_defaultBusinessGrid`;
    this.sortType = "default";
    this.municipalitySelection = props.municipalitySelection;
    this.businessDeleteModal = new BusinessDeleteModal({ userType: this.userType });
  }

  private page(): Page {
    return currentPage();
  }

  private expectedColumns() {
    if (this.userType === "taxpayer") {
      return TAXPAYER_COLUMNS;
    }

    if (this.userType === "municipal") {
      return AGS_COLUMNS;
    }

    return AGS_COLUMNS;
  }

  private normalize(value: string) {
    return value.replace(/\s+/g, " ").trim();
  }

  private async refreshGridMetadata(resetSavedGridSettingsInMemory?: boolean) {
    if (!Object.keys(this.columnIndexes).length || resetSavedGridSettingsInMemory) {
      this.columnIndexes = await getOrderOfColumns(this.expectedColumns());
    }

    if (!Object.keys(this.columnVisibility).length || resetSavedGridSettingsInMemory) {
      this.columnVisibility = await getVisibilityStatusOfColumns(this.expectedColumns());
    }
  }

  private async getColumnIndex(columnName: string) {
    await this.refreshGridMetadata();
    const columnIndex = this.columnIndexes[columnName];

    if (columnIndex === undefined) {
      throw new Error(`Column not found: ${columnName}`);
    }

    return columnIndex;
  }

  private elements() {
    return {
      pageTitle: () => this.page().locator("h2").first(),
      pageHelpContent: () => this.getElement().pageTitle().locator("xpath=following-sibling::*[1]").first(),
      anyList: () => this.page().locator("li"),
      noRecordFoundComponent: () => this.page().locator(".k-grid-norecords-template").first(),
      addBusinessButton: () => this.page().locator(".NLGNewLayoutSecondaryButton").filter({ hasText: "Add a Business" }).first(),
      uploadBusinessButton: () => this.page().locator(".NLGNewLayoutSecondaryButton").filter({ hasText: "Upload Businesses" }).first(),
      exportButton: () => this.page().locator(".NLGNewLayoutSecondaryButton").filter({ hasText: "Export" }).first(),
      resetDataButton: () => this.page().locator(".NLGNewLayoutSecondaryButton").filter({ hasText: "Reset All Data" }).first(),
      businessConfigurationButton: () => this.page().locator(".NLGNewLayoutSecondaryButton .a-magnifying-glass-plus").first(),
      searchBox: () => this.page().locator("span").filter({ has: this.page().locator(".fa-magnifying-glass") }).first(),
      columns: () => this.page().locator("thead tr th"),
      rows: () => this.page().locator("tbody tr"),
      customizeTableViewButton: () => this.page().getByText("Customize", { exact: false }).first(),
      specificColumnFilter: (columnOrder: number) => this.getElement().columns().nth(columnOrder).locator("span a").first(),
      itemsPerPageDropdown: () => this.page().locator(".k-dropdownlist").first(),
      itemsPerPageDropdownItem: (itemNumber: number) => this.page().locator("li").filter({ hasText: String(itemNumber) }).first(),
      pagination: () => this.page().locator(".k-pager-numbers-wrap").first(),
      filterOperationsDropdown: () => this.page().locator(".k-filter-menu-container .k-dropdownlist").first(),
      filterOperationsDropdownItem: (item: string) =>
        this.page().locator(".k-list-ul .k-list-item-text").filter({ hasText: item }).first(),
      filterValueInput: () => this.page().locator(".k-filter-menu-container .k-input").first(),
      filterValueDateInput: () => this.page().locator(".k-filter-menu-container .k-dateinput input").first(),
      filterMultiSelectItem: () => this.page().locator(".k-multicheck-wrap li"),
      filterFilterButton: () => this.page().locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      searchMunicipalityDropdown: () => this.page().locator('input[placeholder="Search government ..."]'),
      anyButton: () => this.page().locator("button"),
      clearAllFiltersButton: () => this.page().getByText("Clear All", { exact: false }).first(),
      toastComponent: () => this.page().locator(".Toastify").first(),
      gridPopup: () => this.page().locator(".k-popup").last(),
      gridPopupTitle: () => this.getElement().gridPopup().locator(".k-popup, .k-animation-container").locator("div").first(),
      gridPopupContent: () => this.getElement().gridPopup(),
      gridPopupSelectionItem: (labelName: string) =>
        this.getElement().gridPopup().locator(".k-label").filter({ hasText: labelName }).first().locator("xpath=.."),
      gridPopupDateInput: () => this.getElement().gridPopup().locator(".k-dateinput input").first(),
      gridPopupSaveButton: () => this.getElement().gridPopup().locator("button").filter({ hasText: "Save" }).first(),
      gridPopupCancelButton: () => this.getElement().gridPopup().locator("button").filter({ hasText: "Cancel" }).first(),
      activeFilterChipsContainer: () => this.page().locator("label").filter({ hasText: "Filtered By:" }).first().locator("xpath=.."),
      activeFilterChipsLabel: () => this.page().locator("label").filter({ hasText: "Filtered By:" }).first(),
      activeFilterChip: (columnName: string) =>
        this.getElement().activeFilterChipsLabel().locator("xpath=../following-sibling::*[1]").locator("div").filter({ hasText: columnName }).first(),
    };
  }

  async init(resetSavedGridSettingsInMemory?: boolean, isFirstTimeGridSettingsLoading = true) {
    const govBusinessConfig = this.page()
      .waitForResponse((response) => response.request().method() === "GET" && response.url().includes("/businesses/municipalityBusinessConfig/"))
      .catch(() => undefined);
    const municipalityId = this.page()
      .waitForResponse((response) => response.request().method() === "GET" && response.url().includes("lambda-url.us-east-1.on.aws/?municipalityId="))
      .catch(() => undefined);
    const activeTaxAndFees = this.page()
      .waitForResponse((response) => response.request().method() === "GET" && response.url().includes("/municipalities/ActiveTaxAndFeesSubscriptions"))
      .catch(() => undefined);
    const userGridSettings = isFirstTimeGridSettingsLoading
      ? this.page()
          .waitForResponse((response) => response.request().method() === "GET" && response.url().includes("/users/usersGridSettings/"))
          .catch(() => undefined)
      : Promise.resolve(undefined);
    const userDetailsRequest = this.page()
      .waitForResponse((response) => response.request().method() === "GET" && /\/users\/[^/]+/.test(response.url()))
      .catch(() => undefined);

    await this.page().goto("/BusinessesApp/BusinessesList");

    if (this.userType === "ags") {
      const activeResponse = await activeTaxAndFees;
      if (activeResponse) {
        expect(activeResponse.status()).toBe(200);
      }
    }

    const isArrakisMunicipality = String(this.municipalitySelection).includes("Arrakis");

    switch (this.userType) {
      case "taxpayer": {
        const detailsResponse = await userDetailsRequest;
        if (detailsResponse) {
          expect(detailsResponse.status()).toBe(200);
        }
        const settingsResponse = await userGridSettings;
        if (settingsResponse) {
          expect(settingsResponse.status()).toBe(200);
        }
        await expect(this.getElement().noRecordFoundComponent()).not.toBeVisible({ timeout: 1000 }).catch(() => undefined);
        break;
      }
      case "municipal": {
        const [configResponse, municipalityResponse, settingsResponse] = await Promise.all([
          govBusinessConfig,
          municipalityId,
          userGridSettings,
        ]);
        if (configResponse) expect(configResponse.status()).toBe(200);
        if (municipalityResponse) expect(municipalityResponse.status()).toBe(200);
        if (settingsResponse) expect(settingsResponse.status()).toBe(200);
        await expect(this.getElement().noRecordFoundComponent()).not.toBeVisible({ timeout: 1000 }).catch(() => undefined);
        break;
      }
      case "ags": {
        if (this.municipalitySelection) {
          await this.searchMunicipality(this.municipalitySelection);
        }
        const [configResponse, municipalityResponse, settingsResponse] = await Promise.all([
          govBusinessConfig,
          municipalityId,
          userGridSettings,
        ]);
        if (configResponse) expect(configResponse.status()).toBe(200);
        if (municipalityResponse) expect(municipalityResponse.status()).toBe(200);
        if (settingsResponse) expect(settingsResponse.status()).toBe(200);
        if (isArrakisMunicipality) {
          await expect(this.getElement().noRecordFoundComponent()).not.toBeVisible({ timeout: 1000 }).catch(() => undefined);
        }
        break;
      }
      default:
        break;
    }

    await this.refreshGridMetadata(resetSavedGridSettingsInMemory);
  }

  getElement() {
    return this.elements();
  }

  async searchMunicipality(municipalityName: string) {
    await this.getElement().searchMunicipalityDropdown().fill(municipalityName);
    await listItem(municipalityName).click();
  }

  private async clickColumn(index: number) {
    await this.getElement().columns().nth(index).click();
  }

  private async handleDBASorting(index: number, isAscending: boolean) {
    if (!isAscending && this.sortType === "default") {
      await this.clickColumn(index);
      this.sortType = "descending";
    } else if (isAscending && this.sortType === "descending") {
      await this.clickColumn(index);
      this.sortType = "ascending";
    }
  }

  private async handleGeneralSorting(index: number, isAscending: boolean) {
    if (isAscending && (this.sortType === "default" || this.sortType === "descending")) {
      await this.clickColumn(index);
      this.sortType = "ascending";
    } else if (!isAscending && this.sortType === "ascending") {
      await this.clickColumn(index);
      this.sortType = "descending";
    }
  }

  async sortColumn(isAscending: boolean, columnName: string) {
    const columnIndex = await this.getColumnIndex(columnName);
    await this.clickColumn(columnIndex);
    if (columnName === "DBA") {
      await this.handleDBASorting(columnIndex, isAscending);
    } else {
      await this.handleGeneralSorting(columnIndex, isAscending);
    }
  }

  private async handleTextFilter(columnIndex: number, filterValue: string, filterOperation: string) {
    validateFilterOperation("text", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    if (filterOperation !== "Is not null" && filterOperation !== "Is null") {
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
    await this.getElement().filterMultiSelectItem().filter({ hasText: filterValue }).first().click();
    await this.getElement().filterFilterButton().click();
  }

  async isGridFiltered() {
    return (await this.getElement().activeFilterChipsLabel().count()) > 0;
  }

  async isNoRecordsVisible() {
    return await this.getElement().noRecordFoundComponent().isVisible().catch(() => false);
  }

  async filterColumn(
    columnName: string,
    filterValue: string,
    filterType = "text",
    filterOperation = "Contains",
  ) {
    const columnIndex = await this.getColumnIndex(columnName);
    await this.page().waitForTimeout(1500);

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
        throw new Error(`Unsupported filter type: ${filterType}`);
    }
  }

  async changeItemsPerPage(itemNumber: number) {
    if (!VALID_ITEMS_PER_PAGE.includes(itemNumber)) {
      throw new Error("Invalid items per page number");
    }
    await this.getElement().itemsPerPageDropdown().click();
    await this.getElement().itemsPerPageDropdownItem(itemNumber).click();
  }

  async clickCustomizeTableViewButton() {
    await this.getElement().customizeTableViewButton().click();
  }

  async clickClearAllFiltersButton() {
    if (await this.getElement().clearAllFiltersButton().isVisible().catch(() => false)) {
      await this.getElement().clearAllFiltersButton().click();
    }
  }

  async getDataOfColumn(targetColumnName: string, anchorColumnName: string, anchorValue: string) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const targetColumn = await this.getElementOfColumn(targetColumnName, anchorColumnName, anchorValue);
    return this.normalize(await targetColumn.innerText());
  }

  async getElementOfColumn(targetColumnName: string, anchorColumnName: string, anchorValue: string) {
    const columnIndex = await this.getColumnIndex(targetColumnName);
    const anchorColumnIndex = await this.getColumnIndex(anchorColumnName);
    const rows = this.getElement().rows();
    const rowCount = await rows.count();

    for (let index = 0; index < rowCount; index += 1) {
      const row = rows.nth(index);
      const columns = row.locator("td");
      const cellText = this.normalize(await columns.nth(anchorColumnIndex).innerText());
      if (cellText === anchorValue) {
        return columns.nth(columnIndex);
      }
    }

    throw new Error(`Unable to find row with ${anchorColumnName}=${anchorValue}`);
  }

  async clickAddBusinessButton() {
    await this.getElement().addBusinessButton().click();
  }

  async clickExportButton() {
    await this.getElement().exportButton().click();
  }

  async clickUploadBusinessButton() {
    await this.getElement().uploadBusinessButton().click();
  }

  async clickResetDataButton() {
    await this.getElement().resetDataButton().click();
  }

  async clickBusinessConfigurationButton() {
    await this.getElement().businessConfigurationButton().click();
  }

  async deleteBusiness(businessDba: string) {
    const deleteBusiness = this.page().waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        response.url().includes(this.userType !== "taxpayer" ? "/businesses/municipalityBusiness/" : "/businesses/taxpayerBusiness/"),
    );
    const actionButton = await this.getElementOfColumn("Actions", "DBA", businessDba);
    await actionButton.click();
    await this.getElement().anyList().filter({ hasText: "Delete" }).first().click();
    await this.businessDeleteModal.clickDeleteButton();
    expect((await deleteBusiness).status()).toBe(200);
  }

  async viewBusinessDetails(businessDba: string) {
    const actionButton = await this.getElementOfColumn("Actions", "DBA", businessDba);
    await actionButton.click();
    await this.getElement().anyList().filter({ hasText: "View Details" }).first().click();
  }

  async setDelinquencyStartDate(businessDba: string, date: { month: number; date: number; year: number }) {
    const updateBusiness = this.page().waitForResponse(
      (response) => response.request().method() === "PUT" && response.url().includes("/businesses/municipalityBusiness/update"),
    );
    const delinquencyCell = await this.getElementOfColumn("Delinquency Start Date", "DBA", businessDba);
    await delinquencyCell.click();
    await fillDateInput(this.getElement().gridPopupDateInput(), date);
    await expect(this.getElement().gridPopupSaveButton()).toBeEnabled();
    await this.getElement().gridPopupSaveButton().click();
    expect((await updateBusiness).status()).toBe(200);
  }

  async setCloseDate(businessDba: string, date: { month: number; date: number; year: number }) {
    const setCloseDateModal = new SetBusinessStatusModal();
    const updateBusiness = this.page().waitForResponse(
      (response) => response.request().method() === "PUT" && response.url().includes("/businesses/municipalityBusiness/update"),
    );

    await (await this.getElementOfColumn("Close Date", "DBA", businessDba)).click();
    await setCloseDateModal.setBusinessCloseDate(date);
    await waitForLoading();
    await setCloseDateModal.setBusinessStatus("Closed");
    await waitForLoading();
    await setCloseDateModal.clickSaveButton();
    expect((await updateBusiness).status()).toBe(200);
  }

  async addRequiredForms(businessDba: string, forms: string[]) {
    const updateBusiness = this.page().waitForResponse(
      (response) => response.request().method() === "PUT" && response.url().includes("/businesses/municipalityBusiness/update"),
    );
    await (await this.getElementOfColumn("Required Forms", "DBA", businessDba)).click();

    for (const form of forms) {
      const row = this.getElement().gridPopupSelectionItem(form);
      if ((await row.locator(".k-switch").getAttribute("aria-checked")) === "false") {
        await row.locator("input").scrollIntoViewIfNeeded();
        await row.locator("input").click({ force: true });
      }
    }

    await this.getElement().pageTitle().click();
    expect((await updateBusiness).status()).toBe(200);
  }

  async removeRequiredForms(businessDba: string, forms: string[]) {
    const updateBusiness = this.page().waitForResponse(
      (response) => response.request().method() === "PUT" && response.url().includes("/businesses/municipalityBusiness/update"),
    );
    await (await this.getElementOfColumn("Required Forms", "DBA", businessDba)).click();

    for (const form of forms) {
      const row = this.getElement().gridPopupSelectionItem(form);
      if ((await row.locator(".k-switch").getAttribute("aria-checked")) === "true") {
        await row.locator(".k-switch").scrollIntoViewIfNeeded();
        await row.locator(".k-switch").click();
      }
    }

    await this.getElement().pageTitle().click();
    expect((await updateBusiness).status()).toBe(200);
  }

  async checkEnabledRequiredForms(businessDba: string) {
    await (await this.getElementOfColumn("Required Forms", "DBA", businessDba)).click();
    const forms = this.getElement().gridPopupContent().locator(".k-switch").locator("xpath=..");
    const enabledForms: string[] = [];
    const count = await forms.count();

    for (let index = 0; index < count; index += 1) {
      const form = forms.nth(index);
      if ((await form.locator(".k-switch").getAttribute("aria-checked")) === "true") {
        enabledForms.push(this.normalize(await form.locator(".k-label").innerText()));
      }
    }

    return enabledForms;
  }

  async showColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: this.defaultGridColumnAlias,
      visibilityStatusAlias: `${this.defaultGridColumnAlias}_visibility`,
    });
    await gridSetting.showColumn(columnName);
    await waitForLoading();
    this.columnVisibility[columnName] = true;
  }

  async hideColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: this.defaultGridColumnAlias,
      visibilityStatusAlias: `${this.defaultGridColumnAlias}_visibility`,
    });
    await gridSetting.hideColumn(columnName);
    await waitForLoading();
    this.columnVisibility[columnName] = false;
  }

  async feezeColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: this.defaultGridColumnAlias,
      visibilityStatusAlias: `${this.defaultGridColumnAlias}_visibility`,
    });
    await gridSetting.freezeColumn(columnName);
    await waitForLoading();
  }

  async unfreezeColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: this.defaultGridColumnAlias,
      visibilityStatusAlias: `${this.defaultGridColumnAlias}_visibility`,
    });
    await gridSetting.unfreezeColumn(columnName);
    await waitForLoading();
  }

  async verifyColumnVisibility(columnName: string) {
    await this.refreshGridMetadata(true);
    return this.columnVisibility[columnName];
  }

  async verifyColumnOrder(columnName: string) {
    await this.refreshGridMetadata(true);
    return this.columnIndexes[columnName];
  }

  async restoreDefaultGridSettings() {
    const gridSetting = new GridSetting({
      columnOrderAlias: this.defaultGridColumnAlias,
      visibilityStatusAlias: `${this.defaultGridColumnAlias}_visibility`,
    });
    await gridSetting.restoreDefaultSettings();
    await waitForLoading();
    await this.refreshGridMetadata(true);
  }

  async moveColumnToLocationOf(columnName: string, targetColumnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: this.defaultGridColumnAlias,
      visibilityStatusAlias: `${this.defaultGridColumnAlias}_visibility`,
    });
    await gridSetting.moveColumnToLocationOf(columnName, targetColumnName);
    await waitForLoading();
    await this.refreshGridMetadata(true);
  }
}

export default BusinessGrid;
