import {
  getOrderOfColumns,
  validateFilterOperation,
  getVisibilityStatusOfColumns,
} from "../../utils/Grid";
import GridSetting from "../GridSetting";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
export const AGS_TRANSACTION_GRID_COLUMNS = [
  "Actions",
  "Transaction Date",
  "DBA",
  "Location Address",
  "Payment Status",
  "Period",
  "Total Due",
  "Base Tax/Fee Amount",
  "Interest",
  "Penalty",
  "Transaction Fee",
  "Funding Date",
  "Form Name",
  "Payment Method",
  "Payment Category",
  "Distribution ID",
  "Transaction ID",
  "Reference ID",
];
export const MUNICIPAL_TRANSACTION_GRID_COLUMNS = [
  "Actions",
  "Transaction Date",
  "DBA",
  "Location Address",
  "Payment Status",
  "Period",
  "Total Due",
  "Base Tax/Fee Amount",
  "Interest",
  "Penalty",
  "Transaction Fee",
  "Funding Date",
  "Form Name",
  "Payment Method",
  "Payment Category",
  "Distribution ID",
  "Transaction ID",
  "Reference ID",
];

const removeSpaces = (text: string) => text.replace(/\s/g, "");

class TransactionGrid {
  userType: string;
  municipalitySelection?: string;
  dateRange?: {
    startDate: { month: number; date: number; year: number };
    endDate: { month: number; date: number; year: number };
  };
  sortType?: string;
  defaultGridColumnsAlias: string;
  constructor(props: {
    userType: string;
    municipalitySelection?: string;
    dateRange?: {
      startDate: { month: number; date: number; year: number };
      endDate: { month: number; date: number; year: number };
    };
    sortType?: string;
  }) {
    this.userType = props.userType;
    this.municipalitySelection = props.municipalitySelection;
    this.dateRange = props.dateRange;
    this.defaultGridColumnsAlias = "defaultdelinquencygridcolumns";
    this.sortType = props.sortType ? props.sortType : "default";
  }

  private elements() {
    return {
      pageTitle: () => pw.get("h2"),
      noRecordFoundComponent: () => pw.get(".k-grid-norecords-template"),
      searchBox: () => pw.get("span").find(".fa-magnifying-glass").parent(),
      startDateInput: () => pw.get(".k-datepicker").first(),
      endDateInput: () => pw.get(".k-datepicker").last(),
      columns: () => pw.get("thead").find("tr").find("th"),
      rows: () =>
        pw.get("tbody").then(($tbody) => {
          if ($tbody.find("tr").length !== 0) {
            return $tbody.find("tr");
          }
        }),
      customizeTableViewButton: () =>
        pw.get("*").contains("Customize"),
      columnFilter: () => this.getElement().columns().find("span").find("a"),
      columnSort: () => this.getElement().columns().find("a").find("i"),
      specificColumnFilter: (columnOrder: number) =>
        this.getElement().columns().eq(columnOrder).find("span").find("a"),
      specificColumnSort: (columnOrder: number) =>
        this.getElement().columns().eq(columnOrder).find("a").find("i"),
      itemsPerPageDropdown: () => pw.get(".k-dropdownlist"),
      itemsPerPageDropdownItem: (itemNumber: number) =>
        pw.get("li").contains(itemNumber),
      pagination: () => pw.get(".k-pager-numbers-wrap"),
      goToFirstPageButton: () =>
        this.getElement().pagination().find("button").eq(0),
      goToPreviousPageButton: () =>
        this.getElement().pagination().find("button[").eq(1),
      goToNextPageButton: () =>
        this.getElement()
          .pagination()
          .find('button[title="Go to the next page"]'),
      goToLastPageButton: () =>
        this.getElement()
          .pagination()
          .find('button[title="Go to the last page"]'),
      filterOperationsDropdown: () =>
        pw.get(".k-filter-menu-container").find(".k-dropdownlist"),
      filterOperationsDropdownItem: (item: string) =>
        cy
          .get(".k-list-ul")
          .find("li")
          .find(".k-list-item-text")
          .contains(item),
      filterValueInput: () =>
        pw.get(".k-filter-menu-container").find(".k-input"),
      filterValueDateInput: () => pw.get(".k-dateinput"),
      filterMultiSelectItem: () => pw.get(".k-multicheck-wrap").find("li"),
      filterFilterButton: () =>
        cy
          .get(".k-filter-menu-container")
          .find(".k-actions")
          .find(".k-button")
          .contains("Filter"),
      searchMunicipalityDropdown: () =>
        pw.get('input[placeholder="Select government..."]'),
      anyList: () => pw.get("li"),
      anyButton: () => pw.get("button"),
      clearAllFiltersButton: () =>
        pw.get("*").contains("Clear All"),
      exportButton: () => pw.get(".NLGButtonPrimary").contains("Export"),
      searchButton: () => pw.get(".NLGButtonPrimary").contains("Search"),
      itemsData: () => pw.get(".k-pager-info"),
    };
  }

  getElement() {
    return this.elements();
  }

  init(resetSavedGridSettingsInMemory?: boolean) {
    pw.visit("/reports/transactionsReport");
    pw.waitForLoading(10);
    if (!["ags", "municipal"].includes(this.userType)) {
      throw new Error("Invalid user type");
    }
    if (this.userType === "ags") {
      this.selectMunicipality(this.municipalitySelection);
    }
    pw.waitForLoading(20);
    getOrderOfColumns(
      this.userType === "ags"
        ? AGS_TRANSACTION_GRID_COLUMNS
        : MUNICIPAL_TRANSACTION_GRID_COLUMNS,
      `${this.userType}_${this.defaultGridColumnsAlias}`,
      resetSavedGridSettingsInMemory ? true : false
    );
    getVisibilityStatusOfColumns(
      this.userType === "ags"
        ? AGS_TRANSACTION_GRID_COLUMNS
        : MUNICIPAL_TRANSACTION_GRID_COLUMNS,
      `${this.userType}_${this.defaultGridColumnsAlias}_visibility`
    );
  }

  selectMunicipality(municipality: string) {
    this.getElement().searchMunicipalityDropdown().clear();
    this.getElement().searchMunicipalityDropdown().type(municipality);
    this.getElement().anyList().contains(municipality).click();
    pw.waitForLoading();
  }

  private clickColumn(index: number) {
    this.getElement().columns().eq(index).click();
  }

  private handleDBASorting(index: number, isAscending: boolean) {
    if (!isAscending && this.sortType === "default") {
      this.clickColumn(index);
      this.sortType = "descending";
    } else if (isAscending && this.sortType === "descending") {
      this.clickColumn(index);
      this.sortType = "ascending";
    }
  }

  private handleGeneralSorting(index: number, isAscending: boolean) {
    if (
      isAscending &&
      (this.sortType === "default" || this.sortType === "descending")
    ) {
      this.clickColumn(index);
      this.sortType = "ascending";
    } else if (!isAscending && this.sortType === "ascending") {
      this.clickColumn(index);
      this.sortType = "descending";
    }
  }

  sortColumn(isAscending: boolean, columnName: string) {
    pw.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes[columnName];
        this.clickColumn(columnIndex);
        if (columnName === "DBA") {
          this.handleDBASorting(columnIndex, isAscending);
        } else {
          this.handleGeneralSorting(columnIndex, isAscending);
        }
      });
  }

  private handleTextFilter(
    columnIndex: number,
    filterValue: string,
    filterOperation: string
  ) {
    validateFilterOperation("text", filterOperation);
    this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    this.getElement().filterOperationsDropdown().click();
    this.getElement().filterOperationsDropdownItem(filterOperation).click();
    if (filterOperation !== "Is not null" && filterOperation !== "Is null") {
      this.getElement().filterValueInput().type(filterValue);
    }
    this.getElement().filterFilterButton().click();
  }

  private handleDateFilter(
    columnIndex: number,
    filterValue: string,
    filterOperation: string
  ) {
    validateFilterOperation("date", filterOperation);
    this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    this.getElement().filterOperationsDropdown().click();
    this.getElement().filterOperationsDropdownItem(filterOperation).click();
    this.getElement()
      .filterValueDateInput()
      .type(filterValue.split("/").join("{rightarrow}"));
    this.getElement().filterFilterButton().click();
  }

  private handleNumberFilter(
    columnIndex: number,
    filterValue: string,
    filterOperation: string
  ) {
    validateFilterOperation("number", filterOperation);
    this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    this.getElement().filterOperationsDropdown().click();
    this.getElement().filterOperationsDropdownItem(filterOperation).click();
    this.getElement().filterValueInput().type(filterValue);
    this.getElement().filterFilterButton().click();
  }

  private handleMultiSelectFilter(columnIndex: number, filterValue: string) {
    this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    this.getElement().filterMultiSelectItem().contains(filterValue).click();
    this.getElement().filterFilterButton().click();
  }

  filterColumn(
    columnName: string,
    filterValue: string,
    filterType: string = "text",
    filterOperation: string = "Contains"
  ) {
    pw.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes[columnName];
        switch (filterType) {
          case "text":
            this.handleTextFilter(columnIndex, filterValue, filterOperation);
            break;
          case "date":
            this.handleDateFilter(columnIndex, filterValue, filterOperation);
            break;
          case "number":
            this.handleNumberFilter(columnIndex, filterValue, filterOperation);
            break;
          case "multi-select":
            this.handleMultiSelectFilter(columnIndex, filterValue);
            break;
          default:
            break;
        }
      });
  }

  changeItemsPerPage(itemNumber: number) {
    if (!VALID_ITEMS_PER_PAGE.includes(itemNumber)) {
      throw new Error("Invalid items per page number");
    }
    this.getElement().itemsPerPageDropdown().click();
    this.getElement().itemsPerPageDropdownItem(itemNumber).click();
  }

  clickCustomizeTableViewButton() {
    this.getElement().customizeTableViewButton().click();
  }

  clickClearAllFiltersButton() {
    this.getElement().clearAllFiltersButton().click();
  }

  getDataOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string,
    targetColumnDataAlias: string
  ) {
    this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    pw.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes[targetColumnName];
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              pw.wrap($columns.eq(columnIndex).text()).as(
                targetColumnDataAlias
              );
            }
          });
      });
  }

  getElementOfColumn(
    targetColumnName: string,
    anchorColumnName: string,
    anchorValue: string,
    targetColumnElementAlias: string
  ) {
    this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    pw.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes[targetColumnName];
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if (
              String($columns.eq(anchorColumnIndex).text())
                .replace(/\s+/g, " ")
                .trim() === anchorValue
            ) {
              pw.wrap($columns.eq(columnIndex)).as(targetColumnElementAlias);
            }
          });
      });
  }

  clickExportButton() {
    this.getElement().exportButton().click();
  }

  private recursiveDateInput(props: {
    date: { month: number; day: number; year: number };
    selector: any;
    intendedDateValue: string;
  }) {
    pw.get(props.selector).type(`${props.date.month}`);
    this.getElement().pageTitle().click();
    pw.get(props.selector).type(`{rightArrow}${props.date.day}`);
    this.getElement().pageTitle().click();
    pw.get(props.selector).type(`{rightArrow}{rightArrow}${props.date.year}`);
    this.getElement().pageTitle().click();
    pw.get(props.selector)
      .invoke("attr", "value")
      .then(($dateValue) => {
        if ($dateValue !== props.intendedDateValue) {
          console.log("Date value: ", $dateValue);
          console.log("Intended date value: ", props.intendedDateValue);
          pw.get(props.selector).type(`{backspace}`);
          this.getElement().pageTitle().click();
          pw.get(props.selector).type(`{leftArrow}{backspace}`);
          this.getElement().pageTitle().click();
          pw.get(props.selector).type(`{leftArrow}{leftArrow}{backspace}`);
          this.getElement().pageTitle().click();
          this.recursiveDateInput(props);
        }
      });
  }

  setStartDate({
    month,
    day,
    year,
  }: {
    month: string;
    day: string;
    year: string;
  }) {
    pw.get(".fa-calendar-days").click();
    pw.get(".k-animation-container input")
      .first()
      .type(`${month}{rightArrow}${day}{rightArrow}${year}`);
    pw.get(".k-animation-container").find("button").contains("Filter").click();
    pw.waitForLoading();
  }

  clickSearchButton() {
    this.getElement().searchButton().click();
    pw.waitForLoading(10);
  }

  getTotalItems(variableAlias: string) {
    this.getElement()
      .itemsData()
      .invoke("text")
      .then((text: string) => {
        const totalItems = parseInt(text.split("of")[1].replace(/\D/g, ""));
        pw.wrap(totalItems).as(variableAlias);
      });
  }

  showColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    gridSetting.showColumn(columnName);
    pw.waitForLoading();
  }

  hideColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    gridSetting.hideColumn(columnName);
    pw.waitForLoading();
  }

  feezeColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    gridSetting.freezeColumn(columnName);
    pw.waitForLoading();
  }

  unfreezeColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    gridSetting.unfreezeColumn(columnName);
    pw.waitForLoading();
  }

  verifyColumnVisibility(columnName: string, isVisibleAlias: string) {
    pw.get(`@${this.userType}_${this.defaultGridColumnsAlias}_visibility`)
      .should("exist")
      .then((visibilityStatus: any) => {
        pw.wrap(visibilityStatus[columnName]).as(isVisibleAlias);
      });
  }

  verifyColumnOrder(columnName: string, orderAlias: string) {
    pw.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        pw.wrap(columnIndexes[columnName]).as(orderAlias);
      });
  }

  restoreDefaultGridSettings() {
    const gridSetting = new GridSetting({
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    gridSetting.restoreDefaultSettings();
    pw.waitForLoading();
  }

  moveColumnToLocationOf(columnName: string, targetColumnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    gridSetting.moveColumnToLocationOf(columnName, targetColumnName);
    pw.waitForLoading();
  }
}

export default TransactionGrid;
