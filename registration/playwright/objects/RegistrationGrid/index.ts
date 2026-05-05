import { currentPage, listItem, setStoredValue, typeSpecial, visit, waitForLoading, withText } from "../../support/runtime";
import { getOrderOfColumns, normalizeCellText, validateFilterOperation } from "../../utils/Grid";

class RegistrationGrid {
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
      noRecordFoundComponent: () => this.page().locator(".k-grid-norecords-template"),
      specificColumnFilter: (columnOrder: number) => this.page().locator("thead tr th").nth(columnOrder).locator("span a").first(),
      filterOperationsDropdown: () => this.page().locator(".k-filter-menu-container .k-dropdownlist").first(),
      filterOperationsDropdownItem: (item: string) => this.page().locator(".k-list-ul li .k-list-item-text").filter({ hasText: item }).first(),
      filterValueInput: () => this.page().locator(".k-filter-menu-container .k-input").first(),
      filterValueDateInput: () => this.page().locator(".k-filter-menu-container .k-dateinput input").first(),
      filterMultiSelectItem: (item: string) =>
        this.page().locator(".k-multicheck-wrap li").filter({ hasText: item }).first(),
      filterFilterButton: () =>
        this.page().locator(".k-filter-menu-container .k-actions .k-button").filter({ hasText: "Filter" }).first(),
      searchMunicipalityDropdown: () => this.page().locator('input[placeholder="Search government …"]'),
      anyList: () => this.page().locator("li"),
      clearAllFiltersButton: () => this.page().getByText("Clear All", { exact: false }).first(),
    };
  }

  getElement() {
    return this.elements();
  }

  private async ensureColumns() {
    if (Object.keys(this.columnIndexes).length === 0) {
      this.columnIndexes = await getOrderOfColumns(this.getElement().columns());
    }
  }

  async init() {
    await visit("/registrationApp/registrationList");
    await waitForLoading(this.userType === "municipal" ? 120 : 30);
    if (this.userType === "ags" && this.municipalitySelection) {
      await this.selectMunicipality(this.municipalitySelection);
    }
    await this.ensureColumns();
  }

  async selectMunicipality(municipality: string) {
    await this.getElement().searchMunicipalityDropdown().fill(municipality);
    await listItem(municipality).click({ force: true });
    await waitForLoading(120);
    this.columnIndexes = {};
    await this.ensureColumns();
  }

  private async findRowByColumnValue(anchorColumnName: string, anchorValue: string) {
    await this.ensureColumns();
    const anchorColumnIndex = this.columnIndexes[anchorColumnName];
    const rows = this.getElement().rows();
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

  async filterColumn(
    columnName: string,
    filterValue: string,
    filterType: "text" | "date" | "number" | "multi-select" = "text",
    filterOperation = "Contains"
  ) {
    await this.ensureColumns();
    const columnIndex = this.columnIndexes[columnName];
    await this.getElement().specificColumnFilter(columnIndex).click({ force: true });

    if (filterType === "multi-select") {
      await this.getElement().filterMultiSelectItem(filterValue).locator("input").click({ force: true });
      await this.getElement().filterFilterButton().click({ force: true });
      await waitForLoading();
      return;
    }

    validateFilterOperation(filterType, filterOperation);
    await this.getElement().filterOperationsDropdown().click({ force: true });
    await this.getElement().filterOperationsDropdownItem(filterOperation).click({ force: true });

    if (!["Is not null", "Is null"].includes(filterOperation)) {
      if (filterType === "date") {
        await typeSpecial(this.getElement().filterValueDateInput(), filterValue.split("/").join("{rightArrow}"));
      } else {
        await this.getElement().filterValueInput().fill(filterValue);
      }
    }

    await this.getElement().filterFilterButton().click({ force: true });
    await waitForLoading();
  }

  async clickClearAllFiltersButton() {
    await this.getElement().clearAllFiltersButton().click({ force: true });
    await waitForLoading();
  }

  async getDataOfColumn(targetColumnName: string, anchorColumnName: string, anchorValue: string, alias: string) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.findRowByColumnValue(anchorColumnName, anchorValue);
    if (!row) {
      throw new Error(`Row not found for ${anchorColumnName}=${anchorValue}`);
    }
    const value = normalizeCellText(await row.locator("td").nth(this.columnIndexes[targetColumnName]).textContent());
    setStoredValue(alias, value);
    return value;
  }

  async toggleRegistrationActionButton(action: string, anchorColumnName: string, anchorValue: string) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.findRowByColumnValue(anchorColumnName, anchorValue);
    if (!row) {
      throw new Error(`Row not found for ${anchorColumnName}=${anchorValue}`);
    }
    await row.locator("td").nth(this.columnIndexes["Action"]).click({ force: true });
    await listItem(action).click({ force: true });
    await waitForLoading();
  }

  async manuallyChangeRegistrationStatus(toRegStatus: string, anchorColumnName: string, anchorValue: string) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.findRowByColumnValue(anchorColumnName, anchorValue);
    if (!row) {
      throw new Error(`Row not found for ${anchorColumnName}=${anchorValue}`);
    }
    await row.locator("td").nth(this.columnIndexes["Registration Status"]).locator("i").click({ force: true });
    await listItem(toRegStatus).click({ force: true });
    await withText(this.page().locator(".NLGButtonPrimary"), `Update status to ${toRegStatus}`).click({ force: true });

    if (toRegStatus === "Active") {
      await this.page().locator('button[aria-label="Toggle calendar"]').click({ force: true });
      await this.page().locator(".k-button-text").filter({ hasText: "TODAY" }).first().click({ force: true });
      await withText(this.page().locator(".NLGButtonPrimary"), `Update status to ${toRegStatus}`).click({ force: true });
    }

    await waitForLoading();
  }

  async manuallyChangeRegistrationDate(
    datePickerColumnName: string,
    value: string,
    anchorColumnName: string,
    anchorValue: string,
    isToday?: boolean
  ) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.findRowByColumnValue(anchorColumnName, anchorValue);
    if (!row) {
      throw new Error(`Row not found for ${anchorColumnName}=${anchorValue}`);
    }
    await row.locator("td").nth(this.columnIndexes[datePickerColumnName]).locator("i").click({ force: true });
    if (isToday === undefined) {
      await typeSpecial(this.page().locator(".k-datepicker input").first(), value.split("/").join("{rightArrow}"));
    } else {
      await this.page().locator('button[aria-label="Toggle calendar"]').click({ force: true });
      await this.page().locator(".k-button-text").filter({ hasText: "TODAY" }).first().click({ force: true });
    }
    await withText(this.page().locator(".NLGButtonPrimary"), "Update Date").click({ force: true });
    await waitForLoading();
  }
}

export default RegistrationGrid;
