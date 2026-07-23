import { type Locator, type Page } from "@playwright/test";
import {
  getColumnOrder,
  getPagerTotal,
  normalizeText,
  selectFilterOperation,
  waitForLoading,
} from "../../support/native-helpers";
import { validateFilterOperation } from "../../utils/Grid";

const REQUESTED_EXTRACT_COLUMNS = [
  "Requested Date",
  "Requested By",
  "Export Type",
  "File Type",
  "Status",
  "Actions",
];

class RequestedExtracts {
  private columnOrder: Record<string, number> = {};

  constructor(private readonly page: Page) {}

  private elements() {
    return {
      columns: () => this.page.locator("thead tr th"),
      rows: () => this.page.locator("tbody tr").filter({ has: this.page.locator("td") }),
      pagerInfo: () => this.page.locator(".k-pager-info, .k-pager-numbers-wrap").last(),
      specificColumnFilter: (columnOrder: number) =>
        this.page.locator("thead tr th").nth(columnOrder).locator("span a").first(),
      filterOperationsDropdown: () => this.page.locator(".k-filter-menu-container .k-dropdownlist").first(),
      filterValueInput: () => this.page.locator(".k-filter-menu-container .k-input").first(),
      filterValueDateInput: () => this.page.locator(".k-dateinput input").first(),
      filterFilterButton: () =>
        this.page.locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      pageSizeDropdown: () => this.page.locator(".k-pager-sizes .k-dropdownlist, .k-pager-sizes select").first(),
      anyList: () => this.page.locator("li"),
    };
  }

  getElement() {
    return this.elements();
  }

  async init() {
    await this.page.goto("/filingApp/filingsExtractRequests");
    await waitForLoading(this.page, 5);
    await this.refreshGridState();
  }

  async refreshGridState() {
    this.columnOrder = await getColumnOrder(this.getElement().columns(), REQUESTED_EXTRACT_COLUMNS);
  }

  private async getColumnIndex(columnName: string) {
    if (this.columnOrder[columnName] === undefined) await this.refreshGridState();
    return this.columnOrder[columnName];
  }

  async sortColumn(isAscending: boolean, columnName: string) {
    const columnIndex = await this.getColumnIndex(columnName);
    await this.getElement().columns().nth(columnIndex).click({ force: true });
    if (!isAscending) {
      await this.getElement().columns().nth(columnIndex).click({ force: true });
    }
    await waitForLoading(this.page, 2);
  }

  async filterColumn(columnName: string, filterValue: string, filterType = "text", filterOperation = "Contains") {
    const columnIndex = await this.getColumnIndex(columnName);
    switch (filterType) {
      case "date":
        validateFilterOperation("date", filterOperation);
        await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
        await selectFilterOperation(this.page, this.getElement().filterOperationsDropdown(), filterOperation);
        await this.getElement().filterValueDateInput().fill(filterValue);
        await this.getElement().filterFilterButton().click({ force: true });
        break;
      case "text":
      default:
        validateFilterOperation("text", filterOperation);
        await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
        await selectFilterOperation(this.page, this.getElement().filterOperationsDropdown(), filterOperation);
        if (!["Is not null", "Is null"].includes(filterOperation)) {
          await this.getElement().filterValueInput().fill(filterValue);
        }
        await this.getElement().filterFilterButton().click({ force: true });
        break;
    }
    await waitForLoading(this.page, 3);
  }

  async changeItemsPerPage(itemNumber: number) {
    if (![5, 10, 20, 50].includes(itemNumber)) throw new Error("Invalid items per page number");
    const dropdown = this.getElement().pageSizeDropdown();
    await dropdown.click({ force: true });
    await this.getElement().anyList().filter({ hasText: String(itemNumber) }).first().click({ force: true });
    await waitForLoading(this.page, 2);
  }

  async getTotalItems() {
    const total = await getPagerTotal(this.getElement().pagerInfo());
    if (total) return total;
    const rowCount = await this.getElement().rows().count();
    if (rowCount > 0) return rowCount;
    const text = normalizeText(await this.page.locator("body").textContent());
    const match = text.match(/of\s+([\d,]+)/i);
    return match ? Number(match[1].replace(/,/g, "")) : 0;
  }

  async getColumnCellsData(columnName: string) {
    const columnIndex = await this.getColumnIndex(columnName);
    const result: string[] = [];
    const count = await this.getElement().rows().count();
    for (let index = 0; index < count; index += 1) {
      result.push(normalizeText(await this.getElement().rows().nth(index).locator("td").nth(columnIndex).textContent()));
    }
    return result;
  }
}

export default RequestedExtracts;
