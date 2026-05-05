import { Page } from "@playwright/test";
import { resolvePage } from "../../pageContext";
import { applyGridFilter, getColumnOrder } from "../../utils/Grid";

const VALID_ITEMS_PER_PAGE = [5, 10, 20];
const DEFAULT_COLUMNS = [
  "Status",
  "Requested Date",
  "Requested Filings From",
  "Requested Filings To",
  "Requested By",
];

class RequestedExtracts {
  sortType: string;
  private columnMap: Record<string, number> = {};

  constructor() {
    this.sortType = "default";
  }

  private elements(page: Page = resolvePage()) {
    return {
      pageTitle: () => page.locator("h1"),
      table: () => page.locator("table"),
      columns: () => page.locator("thead tr th"),
      rows: () => page.locator("tbody tr"),
      specificColumnFilter: (columnOrder: number) =>
        page.locator("thead tr th").nth(columnOrder).locator("span a").first(),
      itemsPerPageDropdown: () => page.locator(".k-dropdownlist").first(),
      itemsPerPageDropdownItem: (itemNumber: number) =>
        page.locator("li").filter({ hasText: String(itemNumber) }).first(),
      itemsData: () => page.locator(".k-pager-info"),
    };
  }

  getElement(page: Page = resolvePage()) {
    return this.elements(page);
  }

  async init(page: Page = resolvePage()) {
    this.columnMap = await getColumnOrder(DEFAULT_COLUMNS, this.getElement(page).columns());
  }

  private async getColumnIndex(page: Page = resolvePage(), columnName: string) {
    if (!this.columnMap[columnName]) {
      await this.init(page);
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
  }

  async changeItemsPerPage(page: Page = resolvePage(), itemNumber: number) {
    if (!VALID_ITEMS_PER_PAGE.includes(itemNumber)) {
      throw new Error("Invalid items per page number");
    }
    await this.getElement(page).itemsPerPageDropdown().click();
    await this.getElement(page).itemsPerPageDropdownItem(itemNumber).click();
  }

  async getTotalItems(page: Page = resolvePage()) {
    const text = await this.getElement(page).itemsData().innerText();
    return parseInt(text.split("of")[1].trim(), 10);
  }
}

export default RequestedExtracts;
