import { currentPage, listItem, setStoredValue, typeSpecial, visit, waitForLoading, withText } from "../../support/runtime";
import { getOrderOfColumns, normalizeCellText, validateFilterOperation } from "../../utils/Grid";

class ApplicationGrid {
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
      customizeTableViewButton: () => this.page().getByText("Customize", { exact: false }).first(),
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
      reviewerCountSystemInfo: () => this.page().locator(".count-of-reviews"),
      startApplicationWorkflowForSelectedApplicationsButton: () =>
        this.page().locator(".NLG-HyperlinkNoPadding").filter({ hasText: "Enroll in workflow" }).first(),
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

  async init(firstInit = true) {
    await visit("/registrationApp/applicationsList");
    await waitForLoading(60);
    if (this.userType === "ags" && firstInit && this.municipalitySelection) {
      await this.selectMunicipality(this.municipalitySelection);
    }
    await this.ensureColumns();
  }

  async selectMunicipality(municipality: string) {
    await this.getElement().searchMunicipalityDropdown().fill(municipality);
    await listItem(municipality).click({ force: true });
    await waitForLoading(60);
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

  async getDataOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string,
    targetColumnDataAlias: string
  ) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.findRowByColumnValue(anchorColumnName, anchorValue);
    if (!row) {
      throw new Error(`Row not found for ${anchorColumnName}=${anchorValue}`);
    }
    const value = normalizeCellText(await row.locator("td").nth(this.columnIndexes[targetColumnName]).textContent());
    setStoredValue(targetColumnDataAlias, value);
    return value;
  }

  async getElementOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string,
    targetColumnElementAlias: string
  ) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.findRowByColumnValue(anchorColumnName, anchorValue);
    if (!row) {
      throw new Error(`Row not found for ${anchorColumnName}=${anchorValue}`);
    }
    const locator = row.locator("td").nth(this.columnIndexes[targetColumnName]);
    setStoredValue(targetColumnElementAlias, locator);
    return locator;
  }

  async clickStartApplicationWorkflowForSelectedApplicationsButton() {
    await this.getElement().startApplicationWorkflowForSelectedApplicationsButton().click({ force: true });
    await waitForLoading();
  }

  async selectRowToReview(params: {
    anchorColumnName?: string;
    anchorValue?: string;
    numberToRandomlySelect?: number;
  }) {
    if (params.anchorColumnName && params.anchorValue) {
      await this.filterColumn(params.anchorColumnName, params.anchorValue, "text", "Contains");
      const row = await this.findRowByColumnValue(params.anchorColumnName, params.anchorValue);
      if (row) {
        await row.locator(".k-checkbox").first().click({ force: true });
      }
      return;
    }

    const rows = this.getElement().rows();
    const count = Math.min(params.numberToRandomlySelect || 0, await rows.count());
    for (let index = 0; index < count; index += 1) {
      await rows.nth(index).locator(".k-checkbox").first().click({ force: true });
    }
  }

  async manuallyChangeApplicationPaymentStatus(
    toApprovalPaymentStatus: string,
    anchorColumnName: string,
    anchorValue: string
  ) {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const row = await this.findRowByColumnValue(anchorColumnName, anchorValue);
    if (!row) {
      throw new Error(`Row not found for ${anchorColumnName}=${anchorValue}`);
    }
    await row.locator("td").nth(this.columnIndexes["Approval Payment Status"]).locator("i").click({ force: true });
    await listItem("Update Status").click({ force: true });
    await this.page()
      .locator(".k-dialog-content label")
      .filter({ hasText: toApprovalPaymentStatus })
      .first()
      .click({ force: true });
    await withText(this.page().locator(".NLGButtonPrimary"), "Save").click({ force: true });
    await waitForLoading();
  }

  async payApplication(anchorColumnName: string, anchorValue: string) {
    const row = await this.findRowByColumnValue(anchorColumnName, anchorValue);
    if (!row) {
      throw new Error(`Row not found for ${anchorColumnName}=${anchorValue}`);
    }
    await row.locator("td").nth(this.columnIndexes["Application Status"]).locator("i").click({ force: true });
    await listItem("Pay Now").click({ force: true });
  }
}

export default ApplicationGrid;
