import { getOrderOfColumns, validateFilterOperation } from "../../utils/Grid";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
const AGS_DEFAULT_GRID_COLUMNS = [
  "PDF",
  "Message",
  "Form Name",
  "Application Type",
  "Application Status",
  "Submitted Date",
  "Approved/Rejected By",
  "Total Due",
  "Reference ID",
  "Business Name (DBA)",
  "Business Address",
  "State Tax ID",
];
const MUNICIPAL_DEFAULT_GRID_COLUMNS = [
  "PDF",
  "Message",
  "Form Name",
  "Application Type",
  "Application Status",
  "Submitted Date",
  "Approved/Rejected By",
  "Total Due",
  "Reference ID",
  "Business Name (DBA)",
  "Business Address",
  "State Tax ID",
];

class ApprovalGrid {
  municipalitySelection?: string;
  defaultGridColumnsAlias: string;
  sortType: string;
  userType: string;
  constructor(props: {
    sortType?: string;
    municipalitySelection?: string;
    userType: string;
  }) {
    this.municipalitySelection =
      props.municipalitySelection || "City of Arrakis";
    this.defaultGridColumnsAlias = "defaultApprovalGridColumns";
    this.sortType = props.sortType ? props.sortType : "default";
    this.userType = props.userType;
  }
  private elements() {
    return {
      pageTitle: () => pw.get("h1"),
      helpText: () => this.getElement().pageTitle().next(),
      columns: () => pw.get("thead").find("tr").find("th"),
      rows: () => pw.get("tbody").find("tr"),
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
      searchMunicipalityDropdown: () =>
        pw.get('input[placeholder="Search government ..."]'),
      anyList: () => pw.get("li"),
      anyButton: () => pw.get("button"),
      pendingApplicationsInfo: () =>
        this.getElement().helpText().next().next().find("div").eq(0),
      startAllApprovalsButton: () =>
        pw.get(".NLGButtonPrimary"),
      exportButton: () => pw.get(".NLGNewLayoutSecondaryButton").contains("Export"),
      startApprovalForSelectedButton: () =>
        pw.get("*").contains("Enroll in workflow"),
      anyModal: () => pw.get(".k-window"),
    };
  }

  getElement() {
    return this.elements();
  }

  init() {
    pw.intercept("GET", "https://**.azavargovapps.com/users/**").as("getUserDetails");
    pw.intercept("GET", "https://**.azavargovapps.com/municipalities/**").as("getMunicipalityDetails");
    pw.intercept("GET", "https://**.azavargovapps.com/users/usersGridSettings/**").as("getGridSettings");
    pw.intercept("GET", "https://**.azavargovapps.com/filings/approval?municipalityId=**").as("getApprovals");
    pw.visit("/filingApp/approvalList");
    if (this.userType === "ags") {
      this.selectMunicipality(this.municipalitySelection);
      pw.waitForLoading(10);
      getOrderOfColumns(
        AGS_DEFAULT_GRID_COLUMNS,
        `${this.userType}_${this.defaultGridColumnsAlias}`
      );
    } else if (this.userType === "taxpayer") {
      throw new Error("Taxpayer user type is not allowed to access this page");
    } else if (this.userType === "municipal") {
      pw.wait("@getUserDetails").its("response.statusCode").should("eq", 200);
      pw.wait("@getMunicipalityDetails").its("response.statusCode").should("eq", 200);
      pw.wait("@getGridSettings").its("response.statusCode").should("eq", 200);
      pw.wait("@getApprovals").its("response.statusCode").should("eq", 200);
      pw.url().should("include", "/filingApp/approvalList?municipalityId=");
      getOrderOfColumns(
        MUNICIPAL_DEFAULT_GRID_COLUMNS,
        `${this.userType}_${this.defaultGridColumnsAlias}`
      );
    }
  }

  clickStartAllApprovals() {
    this.getElement().startAllApprovalsButton().click();
  }

  clickExportButton() {
    this.getElement().exportButton().click();
  }

  selectMunicipality(municipality: string) {
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
    this.clickColumn(index);
    this.sortType = isAscending ? "ascending" : "descending";
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
    pw.wait(5000);
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
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              pw.wrap($columns.eq(columnIndex)).as(targetColumnElementAlias);
            }
          });
      });
  }

  clickStartApprovalForSelectedButton() {
    this.getElement().startApprovalForSelectedButton().click();
  }

  selectRowToApprove(anchorColumnName: string, anchorValue: string) {
    this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    pw.waitForLoading();
    pw.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              pw.wrap($columns).eq(0).find("input").click();
            }
          });
      });
    pw.intercept("PATCH", "https://**.azavargovapps.com/filings/approval-status/**/status/Approved").as("approveFiling");
    this.clickStartApprovalForSelectedButton();
    pw.wait("@getFiling").its("response.statusCode").should("eq", 200);
    // TODO: Implement POM for Review Approval page
    pw.get(".NLGButtonPrimary").contains("Approve").click();
    pw.get(".k-dialog-content").find("textarea").type("Approved");
    pw.get(".k-dialog").find("button").contains("Approve").click();
    pw.wait("@approveFiling").its("response.statusCode").should("eq", 200);
  }

  selectRowToReject(anchorColumnName: string, anchorValue: string) {
    pw.intercept("PATCH", "https://**.azavargovapps.com/filings/approval-status/**/status/Rejected").as("rejectFiling");
    this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
    pw.waitForLoading();
    pw.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              pw.wrap($columns).eq(0).find("input").click();
            }
          });
      });
    this.clickStartApprovalForSelectedButton();
    // TODO: Implement POM for Review Approval page
    pw.get(".NLGButtonSecondary").contains("Reject").click();
    pw.get(".k-dialog-content").find("textarea").type("Rejected");
    pw.get(".k-dialog").find("button").contains("Reject").click();
    pw.wait("@rejectFiling").its("response.statusCode").should("eq", 200);
  }
}

export default ApprovalGrid;
