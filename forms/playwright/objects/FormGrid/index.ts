import { Locator } from "@playwright/test";
import {
  currentPage,
  getAlias,
  setAlias,
  textOf,
  typeSpecial,
  waitForLoading,
  withText,
} from "../../support/runtime";
import {
  getOrderOfColumns,
  validateFilterOperation,
  getVisibilityStatusOfColumns,
} from "../../utils/Grid";
import GridSetting from "../GridSetting";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];

export const AGS_FORM_GRID_COLUMNS = [
  "Action Button",
  "Form Title",
  "Clients",
  "Approval",
  "Created By",
  "Version",
  "Last Modification Date",
  "Published Date",
  "Draft Change Type",
  "Next Version Number",
  "Filing Frequency",
  "Status",
];

export const MUNICIPAL_FORM_GRID_COLUMNS = [
  "Action Button",
  "Form Title",
  "Version",
  "Last Modification Date",
  "Published Date",
  "Filing Frequency",
  "Status",
];

const removeSpaces = (text: string) => text.replace(/\s/g, "");

class FormGrid {
  userType: string;
  defaultColumnAlias: string;
  sortType: string;

  constructor(props: { userType: string; sortType?: string }) {
    if (!["ags", "municipal"].includes(props.userType)) {
      throw new Error("Invalid user type");
    }

    this.userType = props.userType;
    this.defaultColumnAlias = `${this.userType}FormGridDefaultColumns`;
    this.sortType = props.sortType ?? "default";
  }

  async init(resetSavedGridSettingsInMemory = false) {
    await currentPage().goto("/formsApp");
    await waitForLoading(30);
    if (this.userType === "ags") {
      await getOrderOfColumns(
        AGS_FORM_GRID_COLUMNS,
        this.defaultColumnAlias,
        resetSavedGridSettingsInMemory
      );
      await getVisibilityStatusOfColumns(
        AGS_FORM_GRID_COLUMNS,
        `${this.defaultColumnAlias}_visibility`
      );
      return;
    }

    await getOrderOfColumns(
      MUNICIPAL_FORM_GRID_COLUMNS,
      this.defaultColumnAlias,
      resetSavedGridSettingsInMemory
    );
    await getVisibilityStatusOfColumns(
      MUNICIPAL_FORM_GRID_COLUMNS,
      `${this.defaultColumnAlias}_visibility`
    );
  }

  private elements() {
    const page = currentPage();
    return {
      pageTitle: () => page.locator("h1"),
      formActionsButton: () => withText(page.locator("button"), "Form Actions"),
      createNewFormButton: () => page.locator("li").filter({ hasText: "Create New Form" }).first(),
      uploadFileInput: () => page.locator("#files"),
      exportButton: () =>
        this.userType === "ags"
          ? page.locator("li").filter({ hasText: "Export" }).first()
          : page.locator("button").filter({ hasText: "Export" }).first(),
      settingsButton: () =>
        this.userType === "ags"
          ? page.locator("li").filter({ hasText: "Form Settings" }).first()
          : page.locator("button").filter({ hasText: "Settings" }).first(),
      createFormFromLibraryButton: () =>
        page.locator("li").filter({ hasText: "Create Form From Library" }).first(),
      formLibrarySettingsButton: () =>
        page.locator("li").filter({ hasText: "Form Library Settings" }).first(),
      customizeTableViewButton: () =>
        page.locator(".NLGNewLayoutSecondaryButton").filter({ hasText: "Customize" }).first(),
      columns: () => page.locator("thead tr th"),
      rows: () => page.locator("tbody tr"),
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
      anyList: () => page.locator("li"),
      anyButton: () => page.locator("button"),
      clearAllFiltersButton: () => withText(page.locator("*"), "Clear All"),
    };
  }

  getElement() {
    return this.elements();
  }

  private get gridSetting() {
    return new GridSetting({
      columnOrderAlias: this.defaultColumnAlias,
      visibilityStatusAlias: `${this.defaultColumnAlias}_visibility`,
    });
  }

  private async getColumnIndexes() {
    return getAlias<Record<string, number>>(this.defaultColumnAlias);
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
      .locator("xpath=..")
      .locator("input")
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

  async getDataOfColumnForNRow(
    rowPosition: number,
    targetColumnName: string,
    targetColumnDataAlias: string
  ) {
    const row = this.getElement().rows().nth(rowPosition);
    setAlias(targetColumnDataAlias, await textOf(await this.getCell(row, targetColumnName)));
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

  async getElementOfColumnForNRow(
    rowPosition: number,
    targetColumnName: string,
    targetColumnElementAlias: string
  ) {
    const row = this.getElement().rows().nth(rowPosition);
    setAlias(targetColumnElementAlias, await this.getCell(row, targetColumnName));
  }

  async toggleActionButton(
    type: "order" | "filter",
    action?: string,
    anchorColumnName?: string,
    anchorValue?: string,
    order?: number
  ) {
    if (!action) {
      throw new Error("Action is required");
    }

    if (type === "filter") {
      const alias = `${removeSpaces(action)}${removeSpaces(anchorColumnName ?? "")}${removeSpaces(anchorValue ?? "")}`;
      await this.getElementOfColumn("Action Button", anchorColumnName ?? "", anchorValue ?? "", alias);
      await getAlias<Locator>(alias).click();
      await this.getElement().anyList().filter({ hasText: action }).first().click();
      return;
    }

    await this.getElementOfColumnForNRow(order ?? 0, "Action Button", "firstRowActionButton");
    await getAlias<Locator>("firstRowActionButton").click();
    await this.getElement().anyList().filter({ hasText: action }).first().click();
  }

  async clickExportButton() {
    if (this.userType === "ags") {
      await this.getElement().formActionsButton().click();
      await this.getElement().exportButton().click();
      return;
    }
    await this.getElement().exportButton().click();
  }

  async clickAddNeWFormButton() {
    await this.getElement().formActionsButton().click();
    await this.getElement().createNewFormButton().click();
  }

  async clickSettingsButton() {
    if (this.userType === "ags") {
      await this.getElement().formActionsButton().click();
      await this.getElement().settingsButton().click();
      return;
    }
    await this.getElement().settingsButton().click();
  }

  async clickCreateFormFromLibraryButton() {
    await this.getElement().formActionsButton().click();
    await this.getElement().createFormFromLibraryButton().click();
  }

  async clickFormLibrarySettingsButton() {
    await this.getElement().formActionsButton().click();
    await this.getElement().formLibrarySettingsButton().click();
  }

  async showColumn(columnName: string) {
    await this.gridSetting.showColumn(columnName);
    await waitForLoading();
  }

  async hideColumn(columnName: string) {
    await this.gridSetting.hideColumn(columnName);
    await waitForLoading();
  }

  async feezeColumn(columnName: string) {
    await this.gridSetting.freezeColumn(columnName);
    await waitForLoading();
  }

  async unfreezeColumn(columnName: string) {
    await this.gridSetting.unfreezeColumn(columnName);
    await waitForLoading();
  }

  async verifyColumnVisibility(columnName: string, isVisibleAlias: string) {
    const visibilityStatus = getAlias<Record<string, boolean>>(
      `${this.defaultColumnAlias}_visibility`
    );
    setAlias(isVisibleAlias, visibilityStatus[columnName]);
  }

  async verifyColumnOrder(columnName: string, orderAlias: string) {
    const columnIndexes = await this.getColumnIndexes();
    setAlias(orderAlias, columnIndexes[columnName]);
  }

  async restoreDefaultGridSettings() {
    await this.gridSetting.restoreDefaultSettings();
    await waitForLoading();
  }

  async moveColumnToLocationOf(columnName: string, targetColumnName: string) {
    await this.gridSetting.moveColumnToLocationOf(columnName, targetColumnName);
    await waitForLoading();
  }
}

export default FormGrid;
