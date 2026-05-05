import { validateFilterOperation, getOrderOfColumns } from "../../utils/Grid";

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
  defaultGridColumnsAlias: string;
  constructor() {
    this.sortType = "default";
    this.defaultGridColumnsAlias = "defaultGridColumns";
  }
  private elements() {
    return {
      pageTitle: () => pw.get("h1"),
      table: () => pw.get("table"),
      columns: () => pw.get("thead").find("tr").find("th"),
      rows: () => pw.get("tbody").find("tr"),
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
      itemsData: () => pw.get(".k-pager-info"),
    };
  }
  getElement() {
    return this.elements();
  }

  init() {
    getOrderOfColumns(DEFAULT_COLUMNS, this.defaultGridColumnsAlias);
  }
  private clickColumn(index: number) {
    this.getElement().columns().eq(index).click();
  }

  private handleGeneralSorting(index: number, isAscending: boolean) {
    this.clickColumn(index);
    this.sortType = isAscending ? "ascending" : "descending";
  }

  sortColumn(isAscending: boolean, columnName: string) {
    pw.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes[columnName];
        this.clickColumn(columnIndex);
        this.handleGeneralSorting(columnIndex, isAscending);
      });
  }

  private handleTextFilter(
    columnIndex: number,
    filterValue: string,
    filterOperation: string
  ) {
    validateFilterOperation("text", filterOperation);
    this.getElement().specificColumnFilter(columnIndex).click();
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
    this.getElement().specificColumnFilter(columnIndex).click();
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
    this.getElement().specificColumnFilter(columnIndex).click();
    this.getElement().filterOperationsDropdown().click();
    this.getElement().filterOperationsDropdownItem(filterOperation).click();
    this.getElement().filterValueInput().type(filterValue);
    this.getElement().filterFilterButton().click();
  }

  private handleMultiSelectFilter(columnIndex: number, filterValue: string) {
    this.getElement().specificColumnFilter(columnIndex).click();
    this.getElement().filterMultiSelectItem().contains(filterValue).click();
    this.getElement().filterFilterButton().click();
  }

  filterColumn(
    columnName: string,
    filterValue: string,
    filterType: string = "text",
    filterOperation: string = "Contains"
  ) {
    pw.get(`@${this.defaultGridColumnsAlias}`)
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

  getTotalItems(alias: string) {
    this.getElement().itemsData().invoke("text").then((text: string) => {
      const totalItems = text.split("of")[1].trim();
      pw.wrap(parseInt(totalItems)).as(alias);
    });
  }
}

export default RequestedExtracts;
