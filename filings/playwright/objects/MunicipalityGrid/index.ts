import { type Locator, type Page } from "@playwright/test";
import {
  clickByText,
  findRowByCellValue,
  getColumnOrder,
  normalizeText,
  selectFilterOperation,
  selectMultiCheckFilterItem,
  waitForLoading,
} from "../../support/native-helpers";
import { validateFilterOperation } from "../../utils/Grid";

const MUNICIPALITY_COLUMNS = [
  "Municipality Name",
  "State",
  "Government Type",
  "Subscriptions",
  "Alias",
  "HubSpot Link",
  "Actions",
];

class MunicipalityGrid {
  private columnOrder: Record<string, number> = {};

  constructor(private readonly page: Page) {}

  private elements() {
    return {
      columns: () => this.page.locator("thead tr th"),
      rows: () => this.page.locator("tbody tr").filter({ has: this.page.locator("td") }),
      municipalitySearch: () =>
        this.page.locator('input[placeholder="Search government"], input[placeholder="Search government ..."], input[placeholder="Select government..."]').first(),
      anyList: () => this.page.locator("li"),
      specificColumnFilter: (columnOrder: number) =>
        this.page.locator("thead tr th").nth(columnOrder).locator("span a").first(),
      filterOperationsDropdown: () => this.page.locator('[role="dialog"] .k-dropdownlist').first(),
      filterValueInput: () => this.page.locator("[role='dialog'] .k-input").first(),
      filterFilterButton: () => this.page.locator("[role='dialog'] button").filter({ hasText: "Filter" }).first(),
      customFieldInput: () =>
        this.page.locator('.k-dialog input, .k-window input, input[name*="custom"], input[placeholder*="field" i]').first(),
      customFieldAddButton: () =>
        this.page.locator(".k-dialog button, .k-window button, button").filter({ hasText: /^Add$/ }).first(),
      customFieldSaveButton: () =>
        this.page.locator(".k-dialog button, .k-window button, button").filter({ hasText: /save|done|close/i }).first(),
      easyFilterMenuButton: () => this.page.locator(".filterButton"),
      easyFilterModalContainer: () => this.page.locator('[role="dialog"]'),
      easyFilterColumnsLink: () => this.page.locator('[role="dialog"] div div div div span'),
    };
  }

  getElement() {
    return this.elements();
  }

  async init() {
    await this.page.goto("/municipalityApp/list/");
    await waitForLoading(this.page, 5);
    await this.refreshGridState();
  }

  async refreshGridState() {
    this.columnOrder = await getColumnOrder(this.getElement().columns(), MUNICIPALITY_COLUMNS);
  }

  async selectMunicipality(municipality: string) {
    const search = this.getElement().municipalitySearch();
    if (await search.count()) {
      await search.fill(municipality);
      await this.toggleActionButton("View Details", "Municipality Name", municipality);
      await waitForLoading(this.page, 5);
    } else {
      // await this.filterColumn("Name", municipality, "text", "Contains");
      await this.toggleActionButton("View Details", "Municipality Name", municipality);
    }
  }

  private async getColumnIndex(columnName: string) {
    if (this.columnOrder[columnName] === undefined) await this.refreshGridState();
    return this.columnOrder[columnName];
  }

  async toggleActionButton(action: string, anchorColumnName: string, anchorValue: string) {
    const actionCell = await this.getElementOfColumn("Actions", anchorColumnName, anchorValue);
    const popupPromise = action === "View Details" || action === "View Users" ? Promise.resolve(null) : Promise.resolve(null);
    await actionCell.locator("button, i, a").first().click({ force: true });
    await clickByText(this.getElement().anyList(), action);
    await popupPromise;
    await waitForLoading(this.page, 2);
  }

  private async handleTextFilter(columnName: string, filterValue: string, filterOperation: string) {
    validateFilterOperation("text", filterOperation);
    // await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await this.getElement().easyFilterMenuButton().click({ force: true });
    await this.getElement().easyFilterColumnsLink().filter({ hasText: columnName }).click({ force: true })
    await selectFilterOperation(this.page, this.getElement().filterOperationsDropdown(), filterOperation);
    if (!["Is not null", "Is null"].includes(filterOperation)) {
      await this.getElement().filterValueInput().fill(filterValue);
    }
    await this.getElement().filterFilterButton().click({ force: true });
  }

  private async handleNumberFilter(columnName: string, filterValue: string, filterOperation: string) {
    validateFilterOperation("number", filterOperation);
    // await this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    await this.getElement().easyFilterMenuButton().click({ force: true });
    await this.getElement().easyFilterColumnsLink().filter({ hasText: columnName }).click({ force: true })
    await selectFilterOperation(this.page, this.getElement().filterOperationsDropdown(), filterOperation);
    await this.getElement().filterValueInput().fill(filterValue);
    await this.getElement().filterFilterButton().click({ force: true });
  }

  async filterColumn(columnName: string, filterValue: string, filterType = "text", filterOperation = "Contains") {
    const columnIndex = await this.getColumnIndex(columnName);
    switch (filterType) {
      case "text":
        await this.handleTextFilter(columnName, filterValue, filterOperation);
        break;
      case "number":
        await this.handleNumberFilter(columnName, filterValue, filterOperation);
        break;
      case "multi-select":
        await this.getElement().easyFilterMenuButton().click({ force: true });
        await this.getElement().easyFilterColumnsLink().filter({ hasText: columnName }).click({ force: true })
        await selectMultiCheckFilterItem(this.page, filterValue);
        break;
      default:
        break;
    }
    await waitForLoading(this.page, 3);
  }

  async getDataOfColumn(targetColumnName: string, anchorColumnName: string, anchorValue: string) {
    const cell = await this.getElementOfColumn(targetColumnName, anchorColumnName, anchorValue);
    return normalizeText(await cell.textContent());
  }

  async getElementOfColumn(targetColumnName: string, anchorColumnName: string, anchorValue: string): Promise<Locator> {
    await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    const anchorColumnIndex = await this.getColumnIndex(anchorColumnName);
    const row =
      (await findRowByCellValue(this.getElement().rows(), anchorColumnIndex, anchorValue, true)) ||
      this.getElement().rows().filter({ hasText: anchorValue }).first();
    const targetColumnIndex = await this.getColumnIndex(targetColumnName);
    return row.locator("td").nth(targetColumnIndex);
  }

  async addCustomField(municipality: string, customFieldName: string) {
    const customFieldCell = await this.getElementOfColumn("Custom Fields", "Name", municipality);
    await customFieldCell.locator("button, a, i").first().click({ force: true });
    const input = this.getElement().customFieldInput();
    await input.fill(customFieldName);
    if (await this.getElement().customFieldAddButton().isVisible().catch(() => false)) {
      await this.getElement().customFieldAddButton().click({ force: true });
    }
    await this.getElement().customFieldSaveButton().click({ force: true });
    await waitForLoading(this.page, 3);
  }

  async removeCustomField(municipality: string, customFieldName: string) {
    const customFieldCell = await this.getElementOfColumn("Custom Fields", "Name", municipality);
    await customFieldCell.locator("button, a, i").first().click({ force: true });
    const fieldRow = this.page.locator(".k-dialog, .k-window").last().locator("*").filter({ hasText: customFieldName }).first();
    if (await fieldRow.count()) {
      await fieldRow.locator("button, a, i").last().click({ force: true });
    }
    await this.getElement().customFieldSaveButton().click({ force: true });
    await waitForLoading(this.page, 3);
  }
}

export default MunicipalityGrid;
