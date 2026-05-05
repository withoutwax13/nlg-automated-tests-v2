import { validateFilterOperation, getOrderOfColumns } from "../../utils/Grid";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
const MUNICIPAL_REGISTRATION_COLUMNS = [
  "",
  "Action",
  "Certificate",
  "Legal Business Name",
  "Registration Status",
  "Owner Name",
  "Location DBA",
  "Location Address 1",
  "Location Address 2",
  "Form Name",
  "Registration Type",
  "Issued Date",
  "Expiration Date",
  "Next Due Date",
  "Can Renew",
  "Active Agency",
  "Registration Start Date",
  "Registration Record ID",
  "Parent Registration Record ID",
  "Test Form ID",
];
const AGS_REGISTRATION_COLUMNS = [
  "",
  "Action",
  "Certificate",
  "Legal Business Name",
  "Registration Status",
  "Owner Name",
  "Location DBA",
  "Location Address 1",
  "Location Address 2",
  "Form Name",
  "Registration Type",
  "Issued Date",
  "Expiration Date",
  "Next Due Date",
  "Can Renew",
  "Active Agency",
  "Registration Start Date",
  "Registration Record ID",
  "Parent Registration Record ID",
  "Standard",
  "Test Form ID",
];

class RegistrationGrid {
  userType: string;
  defaultGridColumnsAlias: string;
  sortType: string;
  municipalitySelection: string;

  constructor(props: {
    userType: string;
    sortType?: string;
    municipalitySelection?: string;
  }) {
    if (!["municipal", "ags"].includes(props.userType.toLowerCase())) {
      throw new Error("Invalid user type");
    }
    this.userType = props.userType;
    this.defaultGridColumnsAlias = "defaultGridColumns";
    this.sortType = props.sortType ? props.sortType : "default";
    this.municipalitySelection = props.municipalitySelection;
  }

  init() {
    cy.visit("/registrationApp/registrationList");
    if (this.userType === "municipal") {
      cy.waitForLoading(120);
      getOrderOfColumns(
        MUNICIPAL_REGISTRATION_COLUMNS,
        this.defaultGridColumnsAlias
      );
    } else if (this.userType === "ags") {
      if (this.municipalitySelection === undefined) {
        throw new Error("Municipality selection is required for AGS user type");
      }
      this.selectMunicipality(this.municipalitySelection);
      getOrderOfColumns(AGS_REGISTRATION_COLUMNS, this.defaultGridColumnsAlias);
    }
  }

  private elements() {
    return {
      columns: () => cy.get("thead").find("tr").find("th"),
      rows: () => cy.get("tbody").find("tr"),
      noRecordFoundComponent: () => cy.get(".k-grid-norecords-template"),
      customizeTableViewButton: () => cy.get("*").contains("Customize"),
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
        cy.get('input[placeholder="Search government …"]'),
      anyList: () => cy.get("li"),
      clearAllFiltersButton: () =>
        cy.get("*").contains("Clear All"),
      toastComponent: () => cy.get(".Toastify"),
    };
  }

  getElement() {
    return this.elements();
  }

  selectMunicipality(municipality: string) {
    this.getElement().searchMunicipalityDropdown().type(municipality);
    this.getElement().anyList().contains(municipality).click( {force: true} );
    cy.waitForLoading(120);
  }

  private clickColumn(index: number) {
    this.getElement().columns().eq(index).click( {force: true} );
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
    this.clickColumn(index);
    this.sortType = isAscending ? "ascending" : "descending";
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
    this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    this.getElement().filterOperationsDropdown().click( {force: true} );
    this.getElement().filterOperationsDropdownItem(filterOperation).click( {force: true} );
    if (filterOperation !== "Is not null" && filterOperation !== "Is null") {
      this.getElement().filterValueInput().type(filterValue);
    }
    this.getElement().filterFilterButton().click( {force: true} );
  }

  private handleDateFilter(
    columnIndex: number,
    filterValue: string,
    filterOperation: string
  ) {
    validateFilterOperation("date", filterOperation);
    this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    this.getElement().filterOperationsDropdown().click( {force: true} );
    this.getElement().filterOperationsDropdownItem(filterOperation).click( {force: true} );
    this.getElement()
      .filterValueDateInput()
      .type(filterValue.split("/").join("{rightArrow}"));
    this.getElement().filterFilterButton().click( {force: true} );
  }

  private handleNumberFilter(
    columnIndex: number,
    filterValue: string,
    filterOperation: string
  ) {
    validateFilterOperation("number", filterOperation);
    this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    this.getElement().filterOperationsDropdown().click( {force: true} );
    this.getElement().filterOperationsDropdownItem(filterOperation).click( {force: true} );
    this.getElement().filterValueInput().type(filterValue);
    this.getElement().filterFilterButton().click( {force: true} );
  }

  private handleMultiSelectFilter(columnIndex: number, filterValue: string) {
    this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    this.getElement()
      .filterMultiSelectItem()
      .contains(filterValue)
      .parent()
      .find("input")
      .click( {force: true} );
    this.getElement().filterFilterButton().click( {force: true} );
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
  }

  changeItemsPerPage(itemNumber: number) {
    if (!VALID_ITEMS_PER_PAGE.includes(itemNumber)) {
      throw new Error("Invalid items per page number");
    }
    this.getElement().itemsPerPageDropdown().click( {force: true} );
    this.getElement().itemsPerPageDropdownItem(itemNumber).click( {force: true} );
  }

  clickCustomizeTableViewButton() {
    this.getElement().customizeTableViewButton().click( {force: true} );
  }

  clickClearAllFiltersButton() {
    this.getElement().clearAllFiltersButton().click( {force: true} );
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
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              cy.wrap($columns.eq(columnIndex)).as(targetColumnElementAlias);
            }
          });
      });
  }

  toggleParentRegistration(
    isExpand: boolean,
    anchorColumnName: string,
    anchorValue: string
  ) {
    this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    cy.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              if (isExpand) {
                cy.wrap($columns)
                  .eq(0)
                  .find("i")
                  .invoke("attr", "class")
                  .then((iconClass) => {
                    if (iconClass.includes("fa-angle-right")) {
                      cy.wrap($columns).eq(0).find("i").click( {force: true} );
                    }
                  });
              }
            }
          });
      });
  }

  toggleRegistrationActionButton(
    action: string,
    anchorColumnName: string,
    anchorValue: string
  ) {
    this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    cy.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        const actionColumnIndex = columnIndexes["Action"];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              cy.wrap($columns)
                .eq(actionColumnIndex)

                .click( {force: true} );
              this.getElement().anyList().contains(action).click( {force: true} );
              cy.waitForLoading();
            }
          });
      });
  }

  manuallyChangeRegistrationStatus(
    toRegStatus: string,
    anchorColumnName: string,
    anchorValue: string
  ) {
    this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    cy.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        const regStatusColumnIndex = columnIndexes["Registration Status"];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              cy.wrap($columns).eq(regStatusColumnIndex).find("i").click( {force: true} );
              this.getElement().anyList().contains(toRegStatus).click( {force: true} );
            }
          });
      });

    // TODO: manually change registration status modal POM
    cy.get(".NLGButtonPrimary")
      .contains(`Update status to ${toRegStatus}`)
      .click( {force: true} );

    if (toRegStatus === "Active") {
      cy.get('button[aria-label="Toggle calendar"]').click( {force: true} );
      cy.get(".k-button-text").contains("TODAY").click( {force: true} );

      cy.get(".NLGButtonPrimary")
        .contains(`Update status to ${toRegStatus}`)
        .click( {force: true} );
    }

    cy.waitForLoading();
  }

  manuallyChangeRegistrationDateByYear(
    datePickerColumnName: string,
    isAddYear: boolean,
    yearFactor: number,
    anchorColumnName: string,
    anchorValue: string
  ) {
    this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    cy.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        const datePickerColumnIndex = columnIndexes[datePickerColumnName];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              cy.wrap($columns).eq(datePickerColumnIndex).find("i").click( {force: true} );
            }
          });
      });
    const toAdjust = isAddYear
      ? "{upArrow}".repeat(yearFactor)
      : "{downArrow}".repeat(yearFactor);
    cy.get(".k-datepicker").find("input").click( {force: true} );
    cy.get(".k-datepicker")
      .find("input")
      .type(`{rightArrow}{rightArrow}{rightArrow}${toAdjust}`);
    cy.get(".NLGButtonPrimary").contains("Update Date").click( {force: true} );
  }

  manuallyChangeRegistrationDateByDay(
    datePickerColumnName: string,
    isAddDay: boolean,
    dayFactor: number,
    anchorColumnName: string,
    anchorValue: string
  ) {
    this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    cy.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        const datePickerColumnIndex = columnIndexes[datePickerColumnName];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              cy.wrap($columns).eq(datePickerColumnIndex).find("i").click( {force: true} );
            }
          });
      });
    const toAdjust = isAddDay
      ? "{upArrow}".repeat(dayFactor)
      : "{downArrow}".repeat(dayFactor);
    cy.get(".k-datepicker")
      .find("input")
      .type(`{rightArrow}{rightArrow}${toAdjust}`);
    cy.get(".NLGButtonPrimary").contains("Update Date").click( {force: true} );
  }

  manuallyChangeRegistrationDateByMonth(
    datePickerColumnName: string,
    isAddMonth: boolean,
    monthFactor: number,
    anchorColumnName: string,
    anchorValue: string
  ) {
    this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    cy.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        const datePickerColumnIndex = columnIndexes[datePickerColumnName];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              cy.wrap($columns).eq(datePickerColumnIndex).find("i").click( {force: true} );
            }
          });
      });
    const toAdjust = isAddMonth
      ? "{upArrow}".repeat(monthFactor)
      : "{downArrow}".repeat(monthFactor);
    cy.get(".k-datepicker").find("input").type(`{rightArrow}${toAdjust}`);
    cy.get(".NLGButtonPrimary").contains("Update Date").click( {force: true} );
  }

  manuallyChangeRegistrationDate(
    datePickerColumnName: string,
    value: string,
    anchorColumnName: string,
    anchorValue: string,
    isToday?: boolean
  ) {
    this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    cy.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        const datePickerColumnIndex = columnIndexes[datePickerColumnName];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              cy.wrap($columns).eq(datePickerColumnIndex).find("i").click( {force: true} );
            }
          });
      });
    // TODO: manually change registration date modal POM
    if (isToday === undefined) {
      cy.get(".k-datepicker")
        .find("input")
        .type(`${value.split("/").join("{rightArrow}")}`);
      cy.get(".NLGButtonPrimary").contains("Update Date").click( {force: true} );
    } else {
      cy.get('button[aria-label="Toggle calendar"]').click( {force: true} );
      cy.get(".k-button-text").contains("TODAY").click( {force: true} );
      cy.get(".NLGButtonPrimary").contains("Update Date").click( {force: true} );
    }
  }
}

export default RegistrationGrid;
