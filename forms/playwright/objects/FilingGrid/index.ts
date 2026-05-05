import { Locator } from "@playwright/test";
import {
  currentPage,
  getAlias,
  setAlias,
  stubNewWindow,
  textOf,
  typeSpecial,
  waitForLoading,
  withText,
} from "../../support/runtime";
import { getOrderOfColumns, validateFilterOperation } from "../../utils/Grid";
import ExportFiling from "../ExportFiling";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
const AGS_FILING_COLUMNS = [
  "Actions",
  "Filing Period",
  "Location DBA",
  "Location Address 1",
  "Total Due",
  "Payment Status",
  "Transaction Date",
  "Funding Date",
  "Form Name",
  "Approval Status",
  "Filing Date",
  "Payment Type",
  "Reference ID",
  "State Tax ID",
  "Filing Frequency",
];
const MUNICIPAL_FILING_COLUMNS = [...AGS_FILING_COLUMNS];
const TAXPAYER_FILING_COLUMNS = [
  "Actions",
  "Filing Period",
  "Filing Status",
  "Location DBA",
  "Location Address 1",
  "Total Due",
  "Payment Status",
  "Government",
  "Transaction Date",
  "Form Name",
  "Approval Status",
  "Filing Date",
  "Payment Type",
  "Reference ID",
  "State Tax ID",
  "Filing Frequency",
];

const removeSpaces = (text: string) => text.replace(/\s/g, "");

class FilingGrid {
  userType: string;
  municipalitySelection: string;
  defaultGridColumnsAlias: string;
  sortType: string;

  constructor(props: {
    userType: string;
    municipalitySelection?: string;
    sortType?: string;
  }) {
    if (!["ags", "municipal", "taxpayer"].includes(props.userType)) {
      throw new Error("Invalid user type");
    }
    this.userType = props.userType;
    this.municipalitySelection = props.municipalitySelection ?? "City of Arrakis";
    this.defaultGridColumnsAlias = "defaultFilingGridColumns";
    this.sortType = props.sortType ?? "default";
  }

  async init() {
    await currentPage().goto("/filingApp/filingList");
    await waitForLoading();

    if (this.userType === "ags") {
      await this.selectMunicipality(this.municipalitySelection);
      await getOrderOfColumns(
        AGS_FILING_COLUMNS,
        `${this.userType}_${this.defaultGridColumnsAlias}`,
        true
      );
      return;
    }

    if (this.userType === "municipal") {
      await getOrderOfColumns(
        MUNICIPAL_FILING_COLUMNS,
        `${this.userType}_${this.defaultGridColumnsAlias}`,
        true
      );
      return;
    }

    await getOrderOfColumns(
      TAXPAYER_FILING_COLUMNS,
      `${this.userType}_${this.defaultGridColumnsAlias}`,
      true
    );
  }

  private elements() {
    const page = currentPage();
    return {
      searchBox: () => page.locator("div .fa-magnifying-glass").locator("xpath=.."),
      columns: () => page.locator("thead tr th"),
      rows: () => page.locator("tbody tr"),
      customizeTableViewButton: () => withText(page.locator("*"), "Customize"),
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
      searchMunicipalityDropdown: () => page.locator('input[placeholder="Select government..."]'),
      anyList: () => page.locator("li"),
      anyButton: () => page.locator("button"),
      clearAllFiltersButton: () => withText(page.locator("*"), "Clear All"),
      exportButton: () => withText(page.locator(".NLGButtonPrimary"), "Export"),
      viewRequestedExtractButton: () => withText(page.locator("a"), "View requested extracts"),
    };
  }

  getElement() {
    return this.elements();
  }

  private async getColumnIndexes() {
    return getAlias<Record<string, number>>(
      `${this.userType}_${this.defaultGridColumnsAlias}`
    );
  }

  private async getCell(row: Locator, columnName: string) {
    const columnIndexes = await this.getColumnIndexes();
    return row.locator("td").nth(columnIndexes[columnName]);
  }

  async selectMunicipality(municipality: string) {
    await this.getElement().searchMunicipalityDropdown().fill(municipality);
    await this.getElement().anyList().filter({ hasText: municipality }).first().click();
    await waitForLoading();
    await waitForLoading();
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
    await withText(currentPage().locator(".k-filter-menu-container .k-actions .k-button"), "Filter").click();
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
    await withText(currentPage().locator(".k-filter-menu-container .k-actions .k-button"), "Filter").click();
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
    await withText(currentPage().locator(".k-filter-menu-container .k-actions .k-button"), "Filter").click();
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
    await withText(currentPage().locator(".k-filter-menu-container .k-actions .k-button"), "Filter").click();
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
    await waitForLoading();
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

  async toggleActionButton(
    action: string,
    anchorColumnName: string,
    anchorValue: string
  ) {
    const alias = `${removeSpaces(action)}${removeSpaces(anchorColumnName)}${removeSpaces(anchorValue)}`;
    await this.getElementOfColumn("Actions", anchorColumnName, anchorValue, alias);
    await getAlias<Locator>(alias).click();
    await this.getElement().anyList().filter({ hasText: action }).first().click();
  }

  async deleteFiling(anchorColumnName: string, anchorValue: string) {
    if (this.userType === "taxpayer") {
      await this.toggleActionButton("Delete", anchorColumnName, anchorValue);
      await withText(currentPage().locator(".k-dialog-actions button"), "Delete").click();
      return;
    }

    if (this.userType === "ags") {
      await this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
      const rows = this.getElement().rows();
      const rowCount = await rows.count();
      for (let index = 0; index < rowCount; index += 1) {
        const row = rows.nth(index);
        const anchorText = (await textOf(await this.getCell(row, anchorColumnName))).replace(/\s+/g, " ").trim();
        if (anchorText === anchorValue) {
          await (await this.getCell(row, "Payment Status")).locator("button").click();
          await this.getElement().anyList().filter({ hasText: "Delete Filing" }).first().click();
          await withText(currentPage().locator(".k-dialog-actions button"), "Delete").click();
          await waitForLoading();
          return;
        }
      }
      return;
    }

    throw new Error("Delete action is not available for this user type");
  }

  async updateStatus(
    newStatus: string,
    anchorColumnName: string,
    anchorValue: string
  ) {
    if (this.userType !== "ags") {
      throw new Error("Update status action is not available for this user type");
    }
    const alias = `paymentStatus_${removeSpaces(anchorColumnName)}${removeSpaces(anchorValue)}`;
    await this.getElementOfColumn("Payment Status", anchorColumnName, anchorValue, alias);
    await getAlias<Locator>(alias).locator("button").click();
    await this.getElement().anyList().filter({ hasText: "Update Status" }).first().click();
    await currentPage()
      .locator(".k-window-content .k-radio-list")
      .locator(`input[value="${newStatus}"]`)
      .click();
    await withText(currentPage().locator(".k-dialog-actions button"), "Save").click();
    await waitForLoading();
  }

  async checkAuditLog(anchorColumnName: string, anchorValue: string) {
    await stubNewWindow("windowOpen");
    const alias = `paymentStatus_${removeSpaces(anchorColumnName)}${removeSpaces(anchorValue)}`;
    await this.getElementOfColumn("Payment Status", anchorColumnName, anchorValue, alias);
    await getAlias<Locator>(alias).locator("button").click();
    await this.getElement().anyList().filter({ hasText: "Audit Log" }).first().click();
    await waitForLoading();
  }

  async clickExportButton(
    isExportFullData = true,
    fileType: "CSV" | "Excel" = "CSV"
  ) {
    const filingExportModal = new ExportFiling();
    await this.getElement().exportButton().click();
    if (this.userType === "taxpayer") {
      return;
    }

    if (fileType === "Excel") {
      await filingExportModal.selectExcelFileType();
    } else {
      await filingExportModal.selectCSVFileType();
    }

    if (isExportFullData) {
      await filingExportModal.clickExportFullDataButton();
    } else {
      await filingExportModal.clickExportViewButton();
    }
  }
}

export default FilingGrid;
