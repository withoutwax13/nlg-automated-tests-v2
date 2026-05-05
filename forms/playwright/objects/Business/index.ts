import { expect, Locator } from "@playwright/test";
import { currentPage, getAlias, setAlias, textOf, typeSpecial, waitForLoading, withText } from "../../support/runtime";
import { getOrderOfColumns, validateFilterOperation } from "../../utils/Grid";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
const TAXPAYER_COLUMNS = [
  "Actions",
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

class Business {
  defaultGridColumnAlias: string;
  userType: string;
  sortType: string;

  constructor() {
    this.userType = "taxpayer";
    this.defaultGridColumnAlias = `${this.userType}_taxpayerBusinessGrid`;
    this.sortType = "default";
  }

  private elements() {
    const page = currentPage();
    return {
      backButton: () => withText(page.locator("header button"), "Back"),
      pageTitle: () => page.locator("h1"),
      pageHelpContent: () => page.locator("h1").locator("xpath=following-sibling::*[1]"),
      businessDetailsDropdown: () =>
        withText(page.locator("label"), "Business Details")
          .locator("xpath=following-sibling::*[1]")
          .locator('input[role="combobox"]'),
      anyList: () => page.locator("li"),
      addBusinessButton: () => withText(page.locator(".NLGButtonPrimary"), "Add Business"),
      addABusinessButton: () => withText(page.locator(".NLGButtonSecondary"), "Add a Business"),
      searchBox: () => page.locator("span .fa-magnifying-glass").locator("xpath=.."),
      columns: () => page.locator("thead tr th"),
      rows: () => page.locator("tbody tr"),
      customizeTableViewButton: () => withText(page.locator("*"), "Customize Table View"),
      specificColumnFilter: (columnOrder: number) =>
        page.locator("thead tr th").nth(columnOrder).locator("span a"),
      itemsPerPageDropdown: () => page.locator(".k-dropdownlist"),
      itemsPerPageDropdownItem: (itemNumber: number) =>
        page.locator("li").filter({ hasText: String(itemNumber) }).first(),
      filterOperationsDropdown: () => page.locator(".k-filter-menu-container .k-dropdownlist"),
      filterOperationsDropdownItem: (item: string) =>
        page.locator(".k-list-ul li .k-list-item-text").filter({ hasText: item }).first(),
      filterValueInput: () => page.locator(".k-filter-menu-container .k-input"),
      filterValueDateInput: () => page.locator(".k-dateinput"),
      filterMultiSelectItem: () => page.locator(".k-multicheck-wrap li"),
      filterFilterButton: () =>
        page.locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      searchMunicipalityDropdown: () => page.locator('input[placeholder="Search government ..."]'),
      anyButton: () => page.locator("button"),
      clearAllFiltersButton: () => withText(page.locator("*"), "Clear All"),
      toastComponent: () => page.locator(".Toastify"),
    };
  }

  async init() {
    await currentPage().goto("/BusinessesApp/BusinessesList");
    await waitForLoading(10);
    await getOrderOfColumns(TAXPAYER_COLUMNS, this.defaultGridColumnAlias, true);
  }

  getElement() {
    return this.elements();
  }

  private async getColumnIndexes() {
    return getAlias<Record<string, number>>(this.defaultGridColumnAlias);
  }

  private async getCell(row: Locator, columnName: string) {
    const columnIndexes = await this.getColumnIndexes();
    return row.locator("td").nth(columnIndexes[columnName]);
  }

  private async handleTextFilter(
    columnIndex: number,
    filterValue: string,
    filterOperation: string
  ) {
    validateFilterOperation("text", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    if (!["Is not null", "Is null"].includes(filterOperation)) {
      await this.getElement().filterValueInput().fill(filterValue);
    }
    await this.getElement().filterFilterButton().click();
  }

  private async handleDateFilter(
    columnIndex: number,
    filterValue: string,
    filterOperation: string
  ) {
    validateFilterOperation("date", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    await typeSpecial(
      this.getElement().filterValueDateInput(),
      filterValue.split("/").join("{rightarrow}")
    );
    await this.getElement().filterFilterButton().click();
  }

  private async handleNumberFilter(
    columnIndex: number,
    filterValue: string,
    filterOperation: string
  ) {
    validateFilterOperation("number", filterOperation);
    await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await this.getElement().filterOperationsDropdown().click();
    await this.getElement().filterOperationsDropdownItem(filterOperation).click();
    await this.getElement().filterValueInput().fill(filterValue);
    await this.getElement().filterFilterButton().click();
  }

  private async handleMultiSelectFilter(columnIndex: number, filterValue: string) {
    await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await this.getElement()
      .filterMultiSelectItem()
      .filter({ hasText: filterValue })
      .first()
      .click();
    await this.getElement().filterFilterButton().click();
  }

  async filterColumn(
    columnName: string,
    filterValue: string,
    filterType = "text",
    filterOperation = "Contains"
  ) {
    const columnIndexes = await this.getColumnIndexes();
    const columnIndex = columnIndexes[columnName];
    if (filterType === "text") {
      await this.handleTextFilter(columnIndex, filterValue, filterOperation);
    } else if (filterType === "date") {
      await this.handleDateFilter(columnIndex, filterValue, filterOperation);
    } else if (filterType === "number") {
      await this.handleNumberFilter(columnIndex, filterValue, filterOperation);
    } else if (filterType === "multi-select") {
      await this.handleMultiSelectFilter(columnIndex, filterValue);
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
    if ((await this.getElement().clearAllFiltersButton().count()) > 0) {
      await this.getElement().clearAllFiltersButton().click();
    }
  }

  async getDataOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string,
    targetColumnDataAlias: string
  ) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const rows = this.getElement().rows();
    const rowCount = await rows.count();
    for (let index = 0; index < rowCount; index += 1) {
      const row = rows.nth(index);
      if ((await textOf(await this.getCell(row, anchorColumnName))) === anchorValue) {
        setAlias(targetColumnDataAlias, await textOf(await this.getCell(row, targetColumnName)));
        return;
      }
    }
  }

  async getElementOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string,
    targetColumnElementAlias: string
  ) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const rows = this.getElement().rows();
    const rowCount = await rows.count();
    for (let index = 0; index < rowCount; index += 1) {
      const row = rows.nth(index);
      const anchorText = (await textOf(await this.getCell(row, anchorColumnName))).replace(/\s+/g, " ").trim();
      if (anchorText === anchorValue) {
        setAlias(targetColumnElementAlias, await this.getCell(row, targetColumnName));
        return;
      }
    }
  }

  async clickBackButton() {
    await this.getElement().backButton().click();
  }

  async clickAddABusinessButton() {
    await this.getElement().addABusinessButton().click();
  }

  async addBusinessOnAccount(businessDba: string) {
    await this.getElement().businessDetailsDropdown().fill(businessDba);
    await this.getElement().anyList().filter({ hasText: businessDba }).first().click();
    await this.getElement().pageTitle().click();
    await this.getElement().addBusinessButton().click();
    await waitForLoading();
  }

  async deleteBusiness(businessDba: string) {
    await this.getElementOfColumn("Actions", "DBA", businessDba, "actionButton");
    const actionButton = getAlias<Locator>("actionButton");
    await actionButton.click();
    await this.getElement().anyList().filter({ hasText: "Delete" }).first().click();
    await withText(currentPage().locator("button"), "Delete Business").click();
    await expect(this.getElement().toastComponent()).toBeVisible();
    await waitForLoading();
  }

  async viewBusinessDetails(businessDba: string) {
    await this.getElementOfColumn("Actions", "DBA", businessDba, "actionButton");
    const actionButton = getAlias<Locator>("actionButton");
    await actionButton.click();
    await this.getElement().anyList().filter({ hasText: "Details" }).first().click();
  }
}

export default Business;
