import { Page } from "@playwright/test";
import { resolvePage } from "../../pageContext";
import { applyGridFilter, getColumnOrder, getRowByCellText } from "../../utils/Grid";
import { waitForLoading } from "../../utils/runtime";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
const COLUMNS = [
  "Actions",
  "Municipality Name",
  "State",
  "Government Type",
  "Subscriptions",
  "Alias",
  "HubSpot Link",
];

class MunicipalityGrid {
  private isPage(value: unknown): value is Page {
    return !!value && typeof value === "object" && "locator" in (value as Record<string, unknown>);
  }

  userType: string;
  sortType: string;
  defaultGridColumnsAlias: string;
  private columnMap: Record<string, number> = {};

  constructor(props: { userType: string; sortType?: string }) {
    this.userType = props.userType;
    this.sortType = props.sortType || "default";
    this.defaultGridColumnsAlias = `${this.userType}_defaultGovernmentColumns`;
  }

  private elements(page: Page = resolvePage()) {
    return {
      columns: () => page.locator("thead tr th"),
      rows: () => page.locator("tbody tr"),
      section: (header: string) => page.locator("h2").filter({ hasText: header }),
      customizeTableViewButton: () => page.getByText("Customize Table View"),
      clearAllFiltersButton: () => page.getByText("Clear All"),
      specificColumnFilter: (columnOrder: number) =>
        page.locator("thead tr th").nth(columnOrder).locator("span a").first(),
      itemsPerPageDropdown: () => page.locator(".k-dropdownlist").first(),
      itemsPerPageDropdownItem: (itemNumber: number) =>
        page.locator("li").filter({ hasText: String(itemNumber) }).first(),
      anyButton: () => page.locator("button"),
      anyList: () => page.locator("li"),
      customFieldTitleField: (isLast: boolean, order?: number) =>
        isLast
          ? page.locator('input[name^="ColumnsToAddToFilingList"][name$=".Title"]').last()
          : page.locator('input[name^="ColumnsToAddToFilingList"][name$=".Title"]').nth(order ?? 0),
      customFieldValueField: (isLast: boolean, order?: number) =>
        isLast
          ? page.locator('input[name^="ColumnsToAddToFilingList"][name$=".Name"]').last()
          : page.locator('input[name^="ColumnsToAddToFilingList"][name$=".Name"]').nth(order ?? 0),
      anyInput: () => page.locator("input"),
    };
  }

  getElement(page: Page = resolvePage()) {
    return this.elements(page);
  }

  private async loadColumnMap(page: Page = resolvePage()) {
    this.columnMap = await getColumnOrder(COLUMNS, this.getElement(page).columns());
  }

  async init(page: Page = resolvePage()) {
    await page.goto("/municipalityApp/list/:tab");
    await waitForLoading(page, 3);
    await this.loadColumnMap(page);
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
    await waitForLoading(page);
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

  async clickClearAllFiltersButton(page: Page = resolvePage()) {
    await this.getElement(page).clearAllFiltersButton().click();
  }

  async getElementOfColumn(
    page: Page,
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string
  ) {
    await this.filterColumn(page, anchorColumnName, anchorValue);
    const targetColumnIndex = await this.getColumnIndex(page, targetColumnName);
    const anchorColumnIndex = await this.getColumnIndex(page, anchorColumnName);
    const row = await getRowByCellText(this.getElement(page).rows(), anchorColumnIndex, anchorValue);
    return row.locator("td").nth(targetColumnIndex);
  }

  async toggleActionButton(page: Page = resolvePage(), action: string, anchorColumnName: string, anchorValue: string) {
    const actionCell = await this.getElementOfColumn(page, "Actions", anchorColumnName, anchorValue);
    await actionCell.click();
    await this.getElement(page).anyList().filter({ hasText: action }).first().click();
  }

  async selectMunicipality(pageOrMunicipality: Page | string = resolvePage(), maybeMunicipality?: string) {
    const page = this.isPage(pageOrMunicipality) ? pageOrMunicipality : resolvePage();
    const municipality = this.isPage(pageOrMunicipality)
      ? (maybeMunicipality as string)
      : pageOrMunicipality;
    await this.toggleActionButton(page, "View Details", "Municipality Name", municipality);
    await waitForLoading(page);
  }

  async addCustomField(pageOrTitle: Page | string = resolvePage(), titleOrName?: string, maybeName?: string) {
    const page = this.isPage(pageOrTitle) ? pageOrTitle : resolvePage();
    const customFieldTitle = this.isPage(pageOrTitle) ? (titleOrName as string) : pageOrTitle;
    const customFieldName = this.isPage(pageOrTitle) ? (maybeName as string) : (titleOrName as string);
    await this.getElement(page).section("Filing List Configuration").scrollIntoViewIfNeeded();
    await this.getElement(page).anyButton().filter({ hasText: "Add New Column" }).click();
    await this.getElement(page).customFieldTitleField(true).fill(customFieldTitle);
    await this.getElement(page).customFieldValueField(true).fill(customFieldName);
    await this.getElement(page).anyButton().filter({ hasText: "Save" }).click();
    await waitForLoading(page);
  }

  async removeCustomField(pageOrName: Page | string = resolvePage(), maybeName?: string) {
    const page = this.isPage(pageOrName) ? pageOrName : resolvePage();
    const customFieldName = this.isPage(pageOrName) ? (maybeName as string) : pageOrName;
    await this.getElement(page).section("Filing List Configuration").scrollIntoViewIfNeeded();
    const inputs = this.getElement(page).anyInput();
    const count = await inputs.count();
    for (let index = 0; index < count; index += 1) {
      if ((await inputs.nth(index).inputValue().catch(() => "")) === customFieldName) {
        await inputs
          .nth(index)
          .locator("xpath=../../div[last()]//button")
          .filter({ hasText: "Remove" })
          .click();
        break;
      }
    }
    await this.getElement(page).anyButton().filter({ hasText: "Save" }).click();
    await waitForLoading(page);
  }
}

export default MunicipalityGrid;
