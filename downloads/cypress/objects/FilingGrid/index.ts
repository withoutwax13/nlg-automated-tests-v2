import { getOrderOfColumns, validateFilterOperation } from "../../utils/Grid";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
const AGS_FILING_COLUMNS = [
  "PDF",
  "View",
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
const MUNICIPAL_FILING_COLUMNS = [
  "PDF",
  "View",
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
const TAXPAYER_FILING_COLUMNS = [
  "Action Button",
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
    if (["ags", "municipal", "taxpayer"].indexOf(props.userType) === -1) {
      throw new Error("Invalid user type");
    }
    this.userType = props.userType;
    this.municipalitySelection =
      props.municipalitySelection || "City of Arrakis";
    this.defaultGridColumnsAlias = "defaultFilingGridColumns";
    this.sortType = props.sortType ? props.sortType : "default";
  }

  init() {
    cy.visit("/filingApp/filingList");
    cy.waitForLoading();
    if (this.userType === "ags") {
      if (this.municipalitySelection === undefined) {
        throw new Error("Municipality selection is required for AGS user type");
      }
      this.selectMunicipality(this.municipalitySelection);
      getOrderOfColumns(
        AGS_FILING_COLUMNS,
        `${this.userType}_${this.defaultGridColumnsAlias}`
      );
    } else if (this.userType === "municipal") {
      getOrderOfColumns(
        MUNICIPAL_FILING_COLUMNS,
        `${this.userType}_${this.defaultGridColumnsAlias}`
      );
    } else {
      getOrderOfColumns(
        TAXPAYER_FILING_COLUMNS,
        `${this.userType}_${this.defaultGridColumnsAlias}`
      );
    }
    cy.waitForLoading();
  }

  private elements() {
    return {
      searchBox: () => cy.get("div").find(".fa-magnifying-glass").parent(),
      columns: () => cy.get("thead").find("tr").find("th"),
      rows: () =>
        cy.get("tbody").then(($tbody) => {
          if ($tbody.find("tr").length !== 0) {
            return $tbody.find("tr");
          }
        }),
      customizeTableViewButton: () =>
        cy.get("*").contains("Customize Table View"),
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
        cy.get('input[placeholder="Search government ..."]'),
      anyList: () => cy.get("li"),
      anyButton: () => cy.get("button"),
      clearAllFiltersButton: () =>
        cy.get("*").contains("Clear All"),
      exportButton: () => cy.get(".NLGButtonSecondary").contains("Export"),
      viewRequestedExtractButton: () =>
        cy.get("a").contains("View requested extracts"),
    };
  }

  getElement() {
    return this.elements();
  }

  selectMunicipality(municipality: string) {
    this.getElement().searchMunicipalityDropdown().type(municipality);
    this.getElement().anyList().contains(municipality).click();
    cy.waitForLoading();
    this.getElement().anyButton().contains("Search").click();
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

  toggleActionButton(
    action: string,
    anchorColumnName: string,
    anchorValue: string
  ) {
    if (this.userType !== "taxpayer") {
      throw new Error("Action button is not available for this user type");
    }
    this.getElementOfColumn(
      "Action Button",
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

  deleteFiling(anchorColumnName: string, anchorValue: string) {
    if (this.userType === "taxpayer") {
      this.toggleActionButton("Delete", anchorColumnName, anchorValue);
      // TODO: Add delete confirmation POM
      cy.get(".k-dialog-actions").find("button").contains("Delete").click();
    } else if (this.userType === "ags") {
      cy.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
        .should("exist")
        .then((columnIndexes: any) => {
          this.filterColumn(anchorColumnName, anchorValue, "text", "Contains");
          const columnIndex = columnIndexes["Payment Status"];
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
                cy.wrap($columns.eq(columnIndex)).find("button").click();
                this.getElement().anyList().contains("Delete Filing").click();
                // TODO: Add delete confirmation POM
                cy.get(".k-dialog-actions")
                  .find("button")
                  .contains("Delete")
                  .click();
                cy.waitForLoading();
                return false;
              }
            });
        });
    } else if (this.userType === "municipal") {
      throw new Error("Delete action is not available for this user type");
    }
  }

  updateStatus(
    newStatus: string,
    anchorColumnName: string,
    anchorValue: string
  ) {
    if (this.userType !== "ags") {
      throw new Error(
        "Update status action is not available for this user type"
      );
    }
    this.getElementOfColumn(
      "Payment Status",
      anchorColumnName,
      anchorValue,
      `paymentStatus_${removeSpaces(anchorColumnName)}${removeSpaces(
        anchorValue
      )}`
    );
    cy.get(
      `@paymentStatus_${removeSpaces(anchorColumnName)}${removeSpaces(
        anchorValue
      )}`
    )
      .find("button")
      .click();
    this.getElement().anyList().contains("Update Status").click();
    // TODO: Add update status modal POM
    cy.get(".k-window-content")
      .find(".k-radio-list")
      .find(`input[value="${newStatus}"]`)
      .click();
    cy.get(".k-dialog-actions").find("button").contains("Save").click();
    cy.waitForLoading();
  }

  checkAuditLog(anchorColumnName: string, anchorValue: string) {
    this.getElementOfColumn(
      "Payment Status",
      anchorColumnName,
      anchorValue,
      `paymentStatus_${removeSpaces(anchorColumnName)}${removeSpaces(
        anchorValue
      )}`
    );
    cy.get(
      `@paymentStatus_${removeSpaces(anchorColumnName)}${removeSpaces(
        anchorValue
      )}`
    )
      .find("button")
      .click();
    this.getElement().anyList().contains("Audit Log").click();
    cy.waitForLoading();
  }

  clickExportButton(isExportFullData: boolean = true) {
    this.getElement().exportButton().click();
    if (this.userType !== "taxpayer") {
      // TODO: Add export modal POM
      if (isExportFullData) {
        cy.get(".k-actions")
          .find("button")
          .contains("Export Full Data")
          .click();
      } else {
        cy.get(".k-actions").find("button").contains("Export View").click();
      }
    }
  }

  clickViewRequestedExtractButton() {
    this.getElement().viewRequestedExtractButton().click();
  }

  searchFiling(searchValue: string) {
    this.getElement().searchBox().type(searchValue);
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
    cy.get(":nth-child(1) > .k-datepicker").type(
      `${month}{rightArrow}${day}{rightArrow}${year}`
    );
    cy.get(".NLGButtonPrimary").click();
    cy.waitForLoading();
  }

  getColumnCellsData(columnName: string) {
    cy.wrap([]).as("columnCellsData");
    cy.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes[columnName];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            cy.get("@columnCellsData").then((columnCellsData: any) => {
              cy.wrap([...columnCellsData, $columns.eq(columnIndex).text()]).as(
                "columnCellsData"
              );
            });
          });
      });
  }

  addCustomField(customFieldTitle: string, customFieldName: string) {
    if (this.userType === "ags") {
      // TODO: Add government page POM
      cy.visit("/municipalityApp/list/:tab");
      cy.get("tr")
        .contains(this.municipalitySelection)
        .parent()
        .find("td")
        .eq(0)
        .find("i")
        .click();
      cy.waitForLoading();
      cy.get("h2").contains("Filing List Configuration").scrollIntoView();
      cy.get("button").contains("Add New Column").click();
      cy.get('input[name^="ColumnsToAddToFilingList"][name$=".Title"]')
        .last()
        .type(customFieldTitle);
      cy.get('input[name^="ColumnsToAddToFilingList"][name$=".Name"]')
        .last()
        .type(customFieldName);
      cy.get("button").contains("Save").click();
      cy.url().should("contains", "/municipalityApp/list");
    }
  }

  removeCustomField(customFieldName: string) {
    // TODO: Add government page POM
    cy.visit("/municipalityApp/list/:tab");
    cy.get("tr")
      .contains(this.municipalitySelection)
      .parent()
      .find("td")
      .eq(0)
      .find("i")
      .click();
    cy.waitForLoading();
    cy.get("h2").contains("Filing List Configuration").scrollIntoView();
    cy.get("input").each(($input, $index) => {
      if ($input.val() === customFieldName) {
        cy.wrap($index).as("customFieldIndex");
      }
    });
    cy.get("@customFieldIndex").then((customFieldIndex) => {
      cy.get("input")
        .eq(Number(customFieldIndex))
        .parent()
        .parent()
        .find("div")
        .last()
        .find("button")
        .contains("Remove")
        .click();
    });
    cy.get("button").contains("Save").click();
    cy.url().should("contains", "/municipalityApp/list");
  }

  isColumnExist(columnName: string, variableAlias: string) {
    getOrderOfColumns(
      AGS_FILING_COLUMNS.includes(columnName)
        ? AGS_FILING_COLUMNS
        : [...AGS_FILING_COLUMNS, columnName],
      `${this.userType}_${this.defaultGridColumnsAlias}AfterAdditionalColumn`
    );
    cy.get(
      `@${this.userType}_${this.defaultGridColumnsAlias}AfterAdditionalColumn`
    )
      .should("exist")
      .then((columnIndexes: any) => {
        if (columnIndexes[columnName] !== undefined) {
          cy.wrap(true).as(variableAlias);
        } else {
          cy.wrap(false).as(variableAlias);
        }
      });
  }
}

export default FilingGrid;
