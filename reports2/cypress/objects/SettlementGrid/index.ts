import {
  getOrderOfColumns,
  getVisibilityStatusOfColumns,
  validateFilterOperation,
} from "../../utils/Grid";
import GridSetting from "../GridSetting";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
export const AGS_SETTLEMENT_GRID_COLUMNS = [
  "Expected Funding Date",
  "Distribution ID",
  "Funded Amount",
  "Funding ID",
];
export const MUNICIPAL_SETTLEMENT_GRID_COLUMNS = [
  "Expected Funding Date",
  "Distribution ID",
  "Funded Amount",
  "Funding ID",
];

const removeSpaces = (text: string) => text.replace(/\s/g, "");

class SettlementGrid {
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
      pageTitle: () => cy.get("h2"),
      noRecordFoundComponent: () => cy.get(".k-grid-norecords-template"),
      searchBox: () => cy.get("span").find(".fa-magnifying-glass").parent(),
      startDateInput: () => cy.get(".k-datepicker").first(),
      endDateInput: () => cy.get(".k-datepicker").last(),
      columns: () => cy.get("thead").find("tr").find("th"),
      rows: () =>
        cy.get("tbody").then(($tbody) => {
          if ($tbody.find("tr").length !== 0) {
            return $tbody.find("tr");
          }
        }),
      customizeTableViewButton: () =>
        cy.get(".NLGNewLayoutSecondaryButton").contains("Customize"),
      columnFilter: () => this.getElement().columns().find("span").find("a"),
      columnSort: () => this.getElement().columns().find("a").find("i"),
      specificColumnFilter: (columnOrder: number) =>
        this.getElement().columns().eq(columnOrder).find("span").find("a"),
      specificColumnSort: (columnOrder: number) =>
        this.getElement().columns().eq(columnOrder).find("a").find("i"),
      itemsPerPageDropdown: () => cy.get(".k-dropdownlist"),
      itemsPerPageDropdownItem: (itemNumber: number) =>
        cy.get("li").contains(itemNumber),
      pagination: () => cy.get(".k-pager-numbers-wrap"),
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
        cy.get(".k-filter-menu-container").find(".k-dropdownlist"),
      filterOperationsDropdownItem: (item: string) =>
        cy
          .get(".k-list-ul")
          .find("li")
          .find(".k-list-item-text")
          .contains(item),
      filterValueInput: () =>
        cy.get(".k-filter-menu-container").find(".k-input"),
      filterValueDateInput: () => cy.get(".k-dateinput"),
      filterMultiSelectItem: () => cy.get(".k-multicheck-wrap").find("li"),
      filterFilterButton: () =>
        cy
          .get(".k-filter-menu-container")
          .find(".k-actions")
          .find(".k-button")
          .contains("Filter"),
      searchMunicipalityDropdown: () =>
        cy.get('input[placeholder="Select government..."]'),
      anyList: () => cy.get("li"),
      anyButton: () => cy.get("button"),
      clearAllFiltersButton: () =>
        cy.get("*").contains("Clear All"),
      exportButton: () =>
        cy.get(".NLGButtonPrimary").contains("Export"),
      generateReportButton: () =>
        cy.get(".NLGButtonPrimary").contains("Generate Report"),
      itemsData: () => cy.get(".k-pager-info"),
    };
  }

  getElement() {
    return this.elements();
  }

  init(resetSavedGridSettingsInMemory?: boolean) {
    cy.visit("/reports/settlementReport");
    cy.waitForLoading(10);
    if (!["ags", "municipal"].includes(this.userType)) {
      throw new Error("Invalid user type");
    }
    if (this.userType === "ags") {
      this.selectMunicipality(this.municipalitySelection);
    }
    getOrderOfColumns(
      this.userType === "ags"
        ? AGS_SETTLEMENT_GRID_COLUMNS
        : MUNICIPAL_SETTLEMENT_GRID_COLUMNS,
      `${this.userType}_${this.defaultGridColumnsAlias}`,
      resetSavedGridSettingsInMemory ? true : false
    );
    getVisibilityStatusOfColumns(
      this.userType === "ags"
        ? AGS_SETTLEMENT_GRID_COLUMNS
        : MUNICIPAL_SETTLEMENT_GRID_COLUMNS,
      `${this.userType}_${this.defaultGridColumnsAlias}_visibility`
    );
  }

  selectMunicipality(municipality: string) {
    this.getElement().searchMunicipalityDropdown().clear();
    this.getElement().searchMunicipalityDropdown().type(municipality);
    this.getElement().anyList().contains(municipality).click();
    cy.waitForLoading();
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
    cy.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
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
    cy.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
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
    cy.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes[targetColumnName];
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              cy.wrap($columns.eq(columnIndex).text()).as(
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
    cy.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
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
              cy.wrap($columns.eq(columnIndex)).as(targetColumnElementAlias);
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
    cy.get(props.selector).type(`${props.date.month}`);
    this.getElement().pageTitle().click();
    cy.get(props.selector).type(`{rightArrow}${props.date.day}`);
    this.getElement().pageTitle().click();
    cy.get(props.selector).type(`{rightArrow}{rightArrow}${props.date.year}`);
    this.getElement().pageTitle().click();
    cy.get(props.selector)
      .invoke("attr", "value")
      .then(($dateValue) => {
        if ($dateValue !== props.intendedDateValue) {
          console.log("Date value: ", $dateValue);
          console.log("Intended date value: ", props.intendedDateValue);
          cy.get(props.selector).type(`{backspace}`);
          this.getElement().pageTitle().click();
          cy.get(props.selector).type(`{leftArrow}{backspace}`);
          this.getElement().pageTitle().click();
          cy.get(props.selector).type(`{leftArrow}{leftArrow}{backspace}`);
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
    cy.get(".fa-calendar-days").click();
    cy.get(".k-animation-container input")
      .first()
      .type(`${month}{rightArrow}${day}{rightArrow}${year}`);
    cy.get(".k-animation-container").find("button").contains("Filter").click();
    cy.waitForLoading();
  }

  clickGenerateReportButton() {
    this.getElement().generateReportButton().click();
    cy.waitForLoading(10);
  }

  getTotalItems(variableAlias: string) {
    this.getElement()
      .itemsData()
      .invoke("text")
      .then((text: string) => {
        const totalItems = parseInt(text.split("of")[1].replace(/\D/g, ""));
        cy.wrap(totalItems).as(variableAlias);
      });
  }

  showColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    gridSetting.showColumn(columnName);
    cy.waitForLoading();
  }

  hideColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    gridSetting.hideColumn(columnName);
    cy.waitForLoading();
  }

  feezeColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    gridSetting.freezeColumn(columnName);
    cy.waitForLoading();
  }

  unfreezeColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    gridSetting.unfreezeColumn(columnName);
    cy.waitForLoading();
  }

  verifyColumnVisibility(columnName: string, isVisibleAlias: string) {
    cy.get(`@${this.userType}_${this.defaultGridColumnsAlias}_visibility`)
      .should("exist")
      .then((visibilityStatus: any) => {
        cy.wrap(visibilityStatus[columnName]).as(isVisibleAlias);
      });
  }

  verifyColumnOrder(columnName: string, orderAlias: string) {
    cy.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        cy.wrap(columnIndexes[columnName]).as(orderAlias);
      });
  }

  restoreDefaultGridSettings() {
    const gridSetting = new GridSetting({
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    gridSetting.restoreDefaultSettings();
    cy.waitForLoading();
  }

  moveColumnToLocationOf(columnName: string, targetColumnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: `${this.userType}_${this.defaultGridColumnsAlias}`,
      visibilityStatusAlias: `${this.userType}_${this.defaultGridColumnsAlias}_visibility`,
    });
    gridSetting.moveColumnToLocationOf(columnName, targetColumnName);
    cy.waitForLoading();
  }
}

export default SettlementGrid;
