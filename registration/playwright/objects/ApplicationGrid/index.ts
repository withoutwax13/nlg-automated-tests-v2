import { validateFilterOperation, getOrderOfColumns } from "../../utils/Grid";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
const MUNICIPAL_APPLICATION_COLUMNS = [
  "",
  "Action",
  "Certificate",
  "Assigned to Me",
  "Messages",
  "Application Status",
  "Submission Date",
  "Form Name",
  "Business Name",
  "Business Address",
  "Registration Period",
  "Registration Type",
  "Due Date",
  "Total Paid",
  "Outstanding Balance",
  "Submission Payment Status",
  "Approval Payment Status",
  "Approved/Rejected Date",
  "Approved/Rejected By",
  "Active Agency",
  "Reference ID",
  "Registration Record ID",
];
const AGS_APPLICATION_COLUMNS = [
  "",
  "Action",
  "Certificate",
  "Assigned To Me",
  "Messages",
  "Application Status",
  "Submission Date",
  "Form Name",
  "Business Name",
  "Legal Business Address",
  "Location Address 1",
  "Location Address 2",
  "Registration Period",
  "Registration Type",
  "Due Date",
  "Total Paid",
  "Outstanding Balance",
  "Submission Payment Status",
  "Approval Payment Status",
  "Approval Check Number",
  "Approved/Rejected Date",
  "Approved/Rejected By",
  "Active Agency",
  "Reference ID",
  "Registration Record ID",
  
];
const TAXPAYER_APPLICATION_COLUMNS = [
  "Action Button",
  "Certificate",
  "Messages",
  "Government Name",
  "Application Status",
  "Renewal Availability",
  "Total Paid",
  "Outstanding Balance",
  "Submission Payment Status",
  "Approval Payment Status",
  "Approval Check Number",
  "Legal Business Address",
  "Location Address 1",
  "Location Address 2",
  "Submission Date",
  "Form Name",
  "Registration Period",
  "Frequency",
  "Due Date",
  "Approved/Rejected Date",
  "Reference ID",
  "Registration Record ID",
];

/**
 * Page Object Model (POM) class representing the Application Grid.
 */
class ApplicationGrid {
  userType: string;
  defaultGridColumnsAlias: string;
  sortType: string;
  municipalitySelection: string;

  /**
   * Create an application grid instance.
   * @param {Object} props - The properties of the application grid.
   * @param {boolean} props.userType - Indicates the type of user that is accessing the application grid. Possible values are "taxpayer", "municipal", and "ags".
   * @param {boolean} props.sortType - The default sort type of the application grid.
   * @param {boolean} props.municipalitySelection - The municipality selection for AGS user type. Example: "City of Toronto".
   */
  constructor(props: {
    userType: string;
    sortType?: string;
    municipalitySelection?: string;
  }) {
    if (
      !["taxpayer", "municipal", "ags"].includes(props.userType.toLowerCase())
    ) {
      throw new Error("Invalid user type");
    }
    this.userType = props.userType;
    this.defaultGridColumnsAlias = `${props.userType}defaultGridColumns`;
    this.sortType = props.sortType ? props.sortType : "default";
    this.municipalitySelection = props.municipalitySelection;
  }

  /**
   * Initializes the application grid. This method should be called before interacting with the grid.
   * @returns {void}
   */
  init(firstInit = true) {
    pw.visit("/registrationApp/applicationsList");
    pw.waitForLoading(60);
    if (this.userType === "municipal") {
      getOrderOfColumns(
        MUNICIPAL_APPLICATION_COLUMNS,
        this.defaultGridColumnsAlias
      );
    } else if (this.userType === "ags") {
      if (this.municipalitySelection === undefined) {
        throw new Error("Municipality selection is required for AGS user type");
      }
      firstInit && this.selectMunicipality(this.municipalitySelection);
      getOrderOfColumns(AGS_APPLICATION_COLUMNS, this.defaultGridColumnsAlias);
    } else if (this.userType === "taxpayer") {
      getOrderOfColumns(
        TAXPAYER_APPLICATION_COLUMNS,
        this.defaultGridColumnsAlias
      );
    }
  }

  /**
   * Get the elements used in the application grid.
   * @returns {Object} The elements used in the application grid.
   */
  private elements() {
    return {
      columns: () => pw.get("thead").find("tr").find("th"),
      rows: () => pw.get("tbody").find("tr"),
      noRecordFoundComponent: () => pw.get(".k-grid-norecords-template"),
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
        pw.get('input[placeholder="Search government …"]'),
      anyList: () => pw.get("li"),
      reviewerCountSytemInfo: () => pw.get(".count-of-reviews"),
      startApplicationWorkflowForSelectedApplicationsButton: () =>
        cy
          .get(".NLG-HyperlinkNoPadding")
          .contains("Enroll in workflo"),
      selectedApplicationCount: () =>
        this.getElement()
          .startApplicationWorkflowForSelectedApplicationsButton()
          .parent()
          .prev(),
      clearAllFiltersButton: () =>
        pw.get("*").contains("Clear All"),
    };
  }

  /**
   * Get the elements used in the application grid.
   * @returns {Object} The elements used in the application grid.
   */
  getElement() {
    return this.elements();
  }

  /**
   * Selects a municipality from the dropdown.
   * @param {string} municipality - The name of the municipality to select.
   */
  selectMunicipality(municipality: string) {
    this.getElement().searchMunicipalityDropdown().type(municipality);
    this.getElement().anyList().contains(municipality).click( {force: true} )
    pw.waitForLoading(60);
  }

  /**
   * Private method to click a specific column in the grid.
   * @param index - The index of the column to click.
   */
  private clickColumn(index: number) {
    this.getElement().columns().eq(index).click( {force: true} );
  }

  /**
   * Private method to handle sorting for DBA column.
   * @param index - The index of the column to sort.
   * @param isAscending - Indicates whether the sorting is ascending or descending.
   */
  private handleDBASorting(index: number, isAscending: boolean) {
    if (!isAscending && this.sortType === "default") {
      this.clickColumn(index);
      this.sortType = "descending";
    } else if (isAscending && this.sortType === "descending") {
      this.clickColumn(index);
      this.sortType = "ascending";
    }
  }

  /**
   * Private method to handle sorting for general columns.
   * @param index - The index of the column to sort.
   * @param isAscending - Indicates whether the sorting is ascending or descending.
   */
  private handleGeneralSorting(index: number, isAscending: boolean) {
    this.clickColumn(index);
    this.sortType = isAscending ? "ascending" : "descending";
  }

  /**
   * Method to sort a column in the grid.
   * @param isAscending - Indicates whether the sorting is ascending or descending.
   * @param columnName - The name of the column to sort.
   */
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

  /**
   * Private method to handle text filtering for column.
   * @param columnIndex - The index of the column to filter.
   * @param filterValue - The value to filter the column by.
   * @param filterOperation - The operation to use for the filter.
   */
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

  /**
   * Private method to handle date filtering for column.
   * @param columnIndex - The index of the column to filter.
   * @param filterValue - The value to filter the column by.
   * @param filterOperation - The operation to use for the filter.
   */
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
      .type(filterValue.split("/").join("{rightarrow}"));
    this.getElement().filterFilterButton().click( {force: true} );
  }

  /**
   * Private method to handle number filtering for column.
   * @param columnIndex - The index of the column to filter.
   * @param filterValue - The value to filter the column by.
   * @param filterOperation - The operation to use for the filter.
   */
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

  /**
   * Private method to handle multi-select filtering for column.
   * @param columnIndex - The index of the column to filter.
   * @param filterValue - The value of the item to be selected in the multi-select filter.
   */
  private handleMultiSelectFilter(columnIndex: number, filterValue: string) {
    this.getElement().specificColumnFilter(columnIndex).click({ force: true });
    this.getElement().filterMultiSelectItem().contains(filterValue).click( {force: true} );
    this.getElement().filterFilterButton().click( {force: true} );
  }

  /**
   * Filter a column in the grid.
   * @param columnName - The name of the column to filter.
   * @param filterValue - The value to filter the column by.
   * @param filterType - The type of filter to apply. Possible values are "text", "date", "number", and "multi-select".
   * @param filterOperation - The operation to use for the filter. Default value is "Contains".
   */
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

  /**
   * Method to change the number of items displayed per page in the grid.
   * @param itemNumber - The number of items to display per page. Possible values are 5, 10, 20, and 50.
   */
  changeItemsPerPage(itemNumber: number) {
    if (!VALID_ITEMS_PER_PAGE.includes(itemNumber)) {
      throw new Error("Invalid items per page number");
    }
    this.getElement().itemsPerPageDropdown().click( {force: true} );
    this.getElement().itemsPerPageDropdownItem(itemNumber).click( {force: true} );
  }

  /**
   * Clicks the "Customize Table View" button.
   */
  clickCustomizeTableViewButton() {
    this.getElement().customizeTableViewButton().click( {force: true} );
  }

  /**
   * Clicks the "Clear All" button.
   */
  clickClearAllFiltersButton() {
    this.getElement().clearAllFiltersButton().click( {force: true} );
  }

  /**
   * Gets the data in a cell of a column filtered by a value of an anchor column. The data is stored in an alias.
   * @param targetColumnName - The name of the column to get the data from.
   * @param anchorColumnName - The name of the column to filter by.
   * @param anchorValue - The value to filter the anchor column by.
   * @param targetColumnDataAlias - The alias to store the data in.
   */
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

  /**
   * Gets a chainable element reference in a column filtered by a value of an anchor column. The element is stored in an alias.
   * @param targetColumnName - The name of the column to get the element from.
   * @param anchorColumnName - The name of the column to filter by.
   * @param anchorValue - The value to filter the anchor column by.
   * @param targetColumnElementAlias - The alias to store the element in.
   */
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
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              pw.wrap($columns.eq(columnIndex)).as(targetColumnElementAlias);
            }
          });
      });
  }

  /**
   * Clicks the next page button of the grid pagination.
   */
  clickNextPageButton() {
    this.getElement().goToNextPageButton().click( {force: true} );
  }

  /**
   * Clicks the previous page button of the grid pagination.
   */
  clickPreviousPageButton() {
    this.getElement().goToPreviousPageButton().click( {force: true} );
  }

  /**
   * Clicks the first page button of the grid pagination.
   */
  clickFirstPageButton() {
    this.getElement().goToFirstPageButton().click( {force: true} );
  }

  /**
   * Clicks the last page button of the grid pagination.
   */
  clickLastPageButton() {
    this.getElement().goToLastPageButton().click( {force: true} );
  }

  /**
   * Clicks the "Start Application Workflow for Selected" button.
   */
  clickStartApplicationWorkflowForSelectedApplicationsButton() {
    this.getElement()
      .startApplicationWorkflowForSelectedApplicationsButton()
      .click( {force: true} );
  }

  /**
   * Selects a row to review in the grid. The final action is to click the checkbox of the row.
   * @param anchorColumnName - The name of the column to filter by.
   * @param anchorValue - The value to filter the anchor column by.
   */
  selectRowToReview(params: {
    anchorColumnName?: string;
    anchorValue?: string;
    numberToRandomlySelect?: number;
  }) {
    const { anchorColumnName, anchorValue, numberToRandomlySelect } = params;
    pw.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        if (anchorColumnName && anchorValue) {
          this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
          const anchorColumnIndex = columnIndexes[anchorColumnName];
          this.getElement()
            .rows()
            .each(($row) => {
              const $columns = $row.find("td");
              if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
                pw.wrap($columns).eq(0).find(".k-checkbox").click( {force: true} );
              }
            });
        } else if (numberToRandomlySelect) {
          this.getElement()
            .rows()
            .each(($row, index) => {
              if (index < numberToRandomlySelect) {
                pw.wrap($row).find(".k-checkbox").click( {force: true} );
              }
            });
        }
      });
  }

  /**
   * Clicks the Application Certificate button of a row in the grid.
   * @param anchorColumnName - The name of the column to filter by.
   * @param anchorValue - The value to filter the anchor column by.
   */
  clickApplicationCertificate(anchorColumnName: string, anchorValue: string) {
    pw.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        const certificateColumnIndex = columnIndexes["Certificate"];
        this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              pw.wrap($columns).eq(certificateColumnIndex).click( {force: true} );
            }
          });
      });
  }

  /**
   * Clicks the Application Message button of a row in the grid.
   * @param anchorColumnName - The name of the column to filter by.
   * @param anchorValue - The value to filter the anchor column by.
   */
  clickApplicationMessage(anchorColumnName: string, anchorValue: string) {
    pw.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        const messageColumnIndex = columnIndexes["Messages"];
        this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              pw.wrap($columns).eq(messageColumnIndex).find("i").click( {force: true} );
            }
          });
      });
  }

  /**
   * Clicks the Application PDF button of a row in the grid.
   * @param anchorColumnName - The name of the column to filter by.
   * @param anchorValue - The value to filter the anchor column by.
   */
  clickApplicationPDF(anchorColumnName: string, anchorValue: string) {
    pw.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        const pdfColumnIndex = columnIndexes["PDF"];
        this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              pw.wrap($columns).eq(pdfColumnIndex).click( {force: true} );
            }
          });
      });
  }

  /**
   * Change the approval payment status of an application.
   * @param toApprovalPaymentStatus - The approval payment status to change to.
   * @param anchorColumnName - The name of the column to filter by.
   * @param anchorValue - The value to filter the anchor column by.
   */
  manuallyChangeApplicationPaymentStatus(
    toApprovalPaymentStatus: string,
    anchorColumnName: string,
    anchorValue: string
  ) {
    pw.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        pw.log(anchorColumnName);
        pw.log(columnIndexes[anchorColumnName]);
        this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        const approvalPaymentStatusColumnIndex =
          columnIndexes["Approval Payment Status"];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              pw.wrap($columns)
                .eq(approvalPaymentStatusColumnIndex)
                .find("i")
                .click( {force: true} );
              this.getElement().anyList().contains(`Update Status`).click( {force: true} );
            }
          });
      });
    // TODO: Manually change the approval payment status modal POM
    pw.get(".k-dialog-content")
      .find("label")
      .contains(toApprovalPaymentStatus)
      .click( {force: true} );
    pw.get(".NLGButtonPrimary").contains("Save").click( {force: true} );
    pw.waitForLoading();
  }

  /**
   * Pay an application.
   * @param anchorColumnName - The name of the column to filter by.
   * @param anchorValue - The value to filter the anchor column by.
   */
  payApplication(anchorColumnName: string, anchorValue: string) {
    pw.get(`@${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        const applicationStatusIndex = columnIndexes["Application Status"];
        // this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            if ($columns.eq(anchorColumnIndex).text() === anchorValue) {
              pw.wrap($columns).eq(applicationStatusIndex).find("i").click( {force: true} );
              this.getElement().anyList().contains(`Pay Now`).click( {force: true} );
            }
          });
      });
  }
}

export default ApplicationGrid;
