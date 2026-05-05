import { getOrderOfColumns, validateFilterOperation } from "../../utils/Grid";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
const COLUMNS = [
  "Actions",
  "Municipality Name",
  "State",
  "Government Type",
  "Subscriptions",
  "Alias",
  "HubSpot Link",
];

const removeSpaces = (text: string) => text.replace(/\s/g, "");

class MunicipalityGrid {
  userType: string;
  sortType: string;
  defaultGridColumnsAlias: string;

  constructor(props: { userType: string; sortType?: string }) {
    if (props.userType !== "ags") {
      throw new Error("User type is not ags");
    }
    this.userType = props.userType;
    this.sortType = props.sortType || "default";
    this.defaultGridColumnsAlias = `${this.userType}_defaultGovernmentColumns`;
  }

  private elements() {
    return {
      columns: () => cy.get("thead").find("tr").find("th"),
      rows: () => cy.get("tr"),
      rowsOfMunicipality: (municipality: string) =>
        this.getElement().rows().contains(municipality),
      section: (header: string) =>
        cy.get("h2").contains(header).scrollIntoView(),
      customizeTableViewButton: () =>
        cy.get("*").contains("Customize Table View"),
      clearAllFiltersButton: () =>
        cy.get("*").contains("Clear All"),
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
      anyButton: () => cy.get("button"),
      anyList: () => cy.get("li"),
      customFieldTitleField: (isLast: boolean, order?: number) => {
        if (isLast) {
          return cy
            .get('input[name^="ColumnsToAddToFilingList"][name$=".Title"]')
            .last();
        } else {
          return cy
            .get('input[name^="ColumnsToAddToFilingList"][name$=".Title"]')
            .eq(order);
        }
      },
      customFieldValueField: (isLast: boolean, order?: number) => {
        if (isLast) {
          return cy
            .get('input[name^="ColumnsToAddToFilingList"][name$=".Name"]')
            .last();
        } else {
          return cy
            .get('input[name^="ColumnsToAddToFilingList"][name$=".Name"]')
            .eq(order);
        }
      },
      anyInput: () => cy.get("input"),
    };
  }

  getElement() {
    return this.elements();
  }
  init() {
    cy.intercept("GET", "https://**.azavargovapps.com/users/**").as("getUserDetails");
    cy.intercept("GET", "https://**.azavargovapps.com/municipalities/projected").as("getMunicipalities");
    cy.intercept("GET", "https://**.azavargovapps.com/municipalities/subscriptions").as("getMunicipalitySubscriptions");
    cy.intercept("GET", "https://**.azavargovapps.com/users/usersGridSettings/**").as("getGridSettings");
    cy.visit("/municipalityApp/list/:tab");
    cy.wait("@getUserDetails").its("response.statusCode").should("eq", 200);
    cy.wait("@getMunicipalities").its("response.statusCode").should("eq", 200);
    cy.wait("@getMunicipalitySubscriptions").its("response.statusCode").should("eq", 200);
    cy.wait("@getGridSettings").its("response.statusCode").should("eq", 200);
    cy.url().should("include", "/municipalityApp/list");
    getOrderOfColumns(COLUMNS, this.defaultGridColumnsAlias);
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
    cy.get(`@${this.defaultGridColumnsAlias}`)
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
    this.getElement()
      .filterMultiSelectItem()
      .contains(filterValue)
      .parent()
      .find("input")
      .click();
    this.getElement().filterFilterButton().click();
  }

  filterColumn(
    columnName: string,
    filterValue: string,
    filterType: string = "text",
    filterOperation: string = "Contains"
  ) {
    cy.get(`@${this.defaultGridColumnsAlias}`)
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
    cy.waitForLoading();
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
    cy.get(`@${this.defaultGridColumnsAlias}`)
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
    cy.get(`@${this.defaultGridColumnsAlias}`)
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

  toggleActionButton(
    action: string,
    anchorColumnName: string,
    anchorValue: string
  ) {
    if (this.userType !== "ags") {
      throw new Error("Action button is not available for this user type");
    }
    cy.waitForLoading();
    this.getElementOfColumn(
      "Actions",
      anchorColumnName,
      anchorValue,
      `${removeSpaces(action)}${removeSpaces(anchorColumnName)}${removeSpaces(
        anchorValue
      )}`
    );
    cy.get(
      `@${removeSpaces(action)}${removeSpaces(anchorColumnName)}${removeSpaces(
        anchorValue
      )}`
    ).click();
    this.getElement().anyList().contains(action).click();
  }

  selectMunicipality(municipality: string) {
    this.toggleActionButton("View Details", "Municipality Name", municipality);
    cy.waitForLoading();
  }

  addCustomField(customFieldTitle: string, customFieldName: string) {
    cy.intercept("PATCH", "https://**.azavargovapps.com/municipalities/**").as("updateMunicipality");
    this.getElement().section("Filing List Configuration");
    this.getElement().anyButton().contains("Add New Column").click();
    this.getElement().customFieldTitleField(true).type(customFieldTitle);
    this.getElement().customFieldValueField(true).type(customFieldName);
    this.getElement().anyButton().contains("Save").click();
    cy.wait("@updateMunicipality").its("response.statusCode").should("eq", 200);
    cy.url().should("include", "/municipalityApp/list");
  }

  removeCustomField(customFieldName: string) {
    cy.intercept("PATCH", "https://**.azavargovapps.com/municipalities/**").as("updateMunicipality");
    this.getElement().section("Filing List Configuration");
    this.getElement()
      .anyInput()
      .each(($input, $index) => {
        if ($input.val() === customFieldName) {
          cy.wrap($index).as("customFieldIndex");
        }
      });
    cy.get("@customFieldIndex").then((customFieldIndex) => {
      this.getElement()
        .anyInput()
        .eq(Number(customFieldIndex))
        .parent()
        .parent()
        .find("div")
        .last()
        .find("button")
        .contains("Remove")
        .click();
    });
    this.getElement().anyButton().contains("Save").click();
    cy.wait("@updateMunicipality").its("response.statusCode").should("eq", 200);
    cy.url().should("include", "/municipalityApp/list");
  }
}

export default MunicipalityGrid;
