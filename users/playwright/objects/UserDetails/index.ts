import { getOrderOfColumns, validateFilterOperation } from "../../utils/Grid";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
const LOGIN_ACTIVITY_COLUMNS = ["Date", "Result"];
const USER_GROUP_COLUMNS = ["Is Member?", "Group Name"];

const removeSpaces = (text: string) => text.replace(/\s/g, "");

class UserDetails {
  defaultGridColumnsAlias: string;
  sortType: string;
  constructor() {
    this.defaultGridColumnsAlias = "defaultUserDetailcolumns";
    this.sortType = "default";
  }
  private elements() {
    return {
      pageTitle: () => pw.get("h1"),
      noRecordFoundComponent: () => pw.get(".k-grid-norecords-template"),
      columns: () => pw.get("thead").find("tr").find("th"),
      rows: () =>
        pw.get("tbody").then(($tbody) => {
          if ($tbody.find("tr").length !== 0) {
            return $tbody.find("tr");
          }
        }),
      customizeTableViewButton: () =>
        pw.get("*").contains("Customize Table View"),
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
      anyList: () => pw.get("li"),
      anyButton: () => pw.get("button"),
      clearAllFiltersButton: () =>
        pw.get("*").contains("Clear All"),
      itemsData: () => pw.get(".k-pager-info"),
      getUserDetailsData: (labelName: string) =>
        pw.get("label").contains(labelName).parent().next(),
      firstNameData: () => this.getElement().getUserDetailsData("First Name:"),
      lastNameData: () => this.getElement().getUserDetailsData("Last Name:"),
      emailData: () => this.getElement().getUserDetailsData("Email:"),
      statusData: () => this.getElement().getUserDetailsData("Status:"),
      enabledData: () => this.getElement().getUserDetailsData("Enabled:"),
      userTypeData: () => this.getElement().getUserDetailsData("User Type:"),
      userCreatedDateData: () =>
        this.getElement().getUserDetailsData("User Created Date:"),
      userLastModifiedDateData: () =>
        this.getElement().getUserDetailsData("User Last Modified Date:"),
      loginActivityTab: () =>
        pw.get(".k-tabstrip-items").contains("Login Activity"),
      userGroupsTab: () => pw.get(".k-tabstrip-items").contains("User Groups"),
    };
  }

  getElement() {
    return this.elements();
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
    pw.get(`@${this.defaultGridColumnsAlias}`)
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
    pw.get(`@${this.defaultGridColumnsAlias}`)
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
    pw.get(`@${this.defaultGridColumnsAlias}`)
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

  getTotalItems(variableAlias: string) {
    this.getElement()
      .itemsData()
      .invoke("text")
      .then((text: string) => {
        const totalItems = parseInt(text.split("of")[1].replace(/\D/g, ""));
        pw.wrap(totalItems).as(variableAlias);
      });
  }

  clickLoginActivityTab() {
    this.getElement().loginActivityTab().click();
    this.defaultGridColumnsAlias = `${this.defaultGridColumnsAlias}LoginActivity`;
    getOrderOfColumns(
      LOGIN_ACTIVITY_COLUMNS,
      `${this.defaultGridColumnsAlias}`
    );
    pw.waitForLoading();
  }

  clickUserGroupsTab() {
    this.getElement().userGroupsTab().click();
    this.defaultGridColumnsAlias = `${this.defaultGridColumnsAlias}UserGroups`;
    getOrderOfColumns(USER_GROUP_COLUMNS, `${this.defaultGridColumnsAlias}`);
    pw.waitForLoading();
  }

  enableUserGroup(groupName: string) {
    this.clickUserGroupsTab();
    this.filterColumn("Group Name", groupName, "text", "Contains");
    pw.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes["Is Member?"];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            pw.wrap($columns.eq(columnIndex))
              .invoke("text")
              .then((text) => {
                if (text.includes("No")) {
                  pw.wrap($columns.eq(columnIndex)).find('span[role="switch"]').click();
                  pw.waitForLoading();
                }
              });
          });
      });
  }

  disableUserGroup(groupName: string) {
    this.clickUserGroupsTab();
    this.filterColumn("Group Name", groupName, "text", "Contains");
    pw.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes["Is Member?"];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            pw.wrap($columns.eq(columnIndex))
              .invoke("text")
              .then((text) => {
                if (text.includes("Yes")) {
                  pw.wrap($columns.eq(columnIndex)).find('span[role="switch"]').click();
                  pw.waitForLoading();
                }
              });
          });
      });
  }
}

export default UserDetails;
