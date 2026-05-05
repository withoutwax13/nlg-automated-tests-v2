import { currentPage, listItem, setStoredValue, visit, waitForLoading } from "../../support/runtime";
import { getOrderOfColumns, normalizeCellText, validateFilterOperation } from "../../utils/Grid";

class FilingGrid {
  userType: string;
  municipalitySelection?: string;
  private columnIndexes: Record<string, number> = {};

  constructor(props: { userType: string; municipalitySelection?: string }) {
    this.userType = props.userType;
    this.municipalitySelection = props.municipalitySelection;
  }

  private page() {
    return currentPage();
  }

  private elements() {
    return {
      columns: () => this.page().locator("thead tr th"),
      rows: () => this.page().locator("tbody tr"),
      specificColumnFilter: (columnOrder: number) => this.page().locator("thead tr th").nth(columnOrder).locator("span a").first(),
      filterOperationsDropdown: () => this.page().locator(".k-filter-menu-container .k-dropdownlist").first(),
      filterOperationsDropdownItem: (item: string) => this.page().locator(".k-list-ul li .k-list-item-text").filter({ hasText: item }).first(),
      filterValueInput: () => this.page().locator(".k-filter-menu-container .k-input").first(),
      filterFilterButton: () => this.page().locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      searchMunicipalityDropdown: () => this.page().locator('input[placeholder="Search government …"]'),
      anyList: () => this.page().locator("li"),
    };
  }

  private async ensureColumns() {
    if (Object.keys(this.columnIndexes).length === 0) {
      this.columnIndexes = await getOrderOfColumns(this.elements().columns());
    }
  }

  async init() {
    await visit("/filingApp/filingList");
    await waitForLoading(60);
    if (this.userType === "ags" && this.municipalitySelection) {
      await this.elements().searchMunicipalityDropdown().fill(this.municipalitySelection);
      await listItem(this.municipalitySelection).click({ force: true });
      await waitForLoading(60);
    }
    await this.ensureColumns();
  }

  async filterColumn(
    columnName: string,
    filterValue: string,
    filterType: "text" | "date" | "number" | "multi-select" = "text",
    filterOperation = "Contains"
  ) {
    await this.ensureColumns();
    validateFilterOperation(filterType === "multi-select" ? "text" : filterType, filterOperation);
    const columnIndex = this.columnIndexes[columnName];
    await this.elements().specificColumnFilter(columnIndex).click({ force: true });
    await this.elements().filterOperationsDropdown().click({ force: true });
    await this.elements().filterOperationsDropdownItem(filterOperation).click({ force: true });
    await this.elements().filterValueInput().fill(filterValue);
    await this.elements().filterFilterButton().click({ force: true });
    await waitForLoading();
  }

  private async findRowByColumnValue(anchorColumnName: string, anchorValue: string) {
    await this.ensureColumns();
    const anchorColumnIndex = this.columnIndexes[anchorColumnName];
    const rows = this.elements().rows();
    const count = await rows.count();

    for (let index = 0; index < count; index += 1) {
      const row = rows.nth(index);
      const value = normalizeCellText(await row.locator("td").nth(anchorColumnIndex).textContent());
      if (value === anchorValue) {
        return row;
      }
    }

    return undefined;
  }

  async getDataOfColumn(targetColumnName: string, anchorColumnName: string, anchorValue: string, alias: string) {
    await this.filterColumn(anchorColumnName, anchorValue);
    const row = await this.findRowByColumnValue(anchorColumnName, anchorValue);
    if (!row) {
      throw new Error(`Row not found for ${anchorColumnName}=${anchorValue}`);
    }
    const value = normalizeCellText(await row.locator("td").nth(this.columnIndexes[targetColumnName]).textContent());
    setStoredValue(alias, value);
    return value;
  }

  async deleteFiling(anchorColumnName: string, anchorValue: string) {
    await this.filterColumn(anchorColumnName, anchorValue);
    const row = await this.findRowByColumnValue(anchorColumnName, anchorValue);
    if (!row) {
      throw new Error(`Row not found for ${anchorColumnName}=${anchorValue}`);
    }

    if (this.userType === "taxpayer") {
      await row.locator("td").nth(this.columnIndexes["Actions"]).click({ force: true });
      await listItem("Delete").click({ force: true });
    } else {
      await row.locator("td").nth(this.columnIndexes["Payment Status"]).locator("button").click({ force: true });
      await listItem("Delete Filing").click({ force: true });
    }

    await this.page().locator(".k-dialog-actions button").filter({ hasText: "Delete" }).first().click({ force: true });
    await waitForLoading();
  }
}

export default FilingGrid;
