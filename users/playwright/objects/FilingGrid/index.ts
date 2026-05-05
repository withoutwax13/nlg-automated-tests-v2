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
    pw.visit("/filingApp/filingList");
    pw.waitForLoading();
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
  }

  private elements() {
    return {
      searchBox: () => pw.get("span").find(".fa-magnifying-glass").parent(),
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
      searchMunicipalityDropdown: () =>
        pw.get('input[placeholder="Search government ..."]'),
      anyList: () => pw.get("li"),
      anyButton: () => pw.get("button"),
      clearAllFiltersButton: () =>
        pw.get("*").contains("Clear All"),
      exportButton: () => pw.get(".NLGButtonSecondary").contains("Export"),
      viewRequestedExtractButton: () =>
        pw.get("a").contains("View requested extracts"),
    };
  }

  getElement() {
    return this.elements();
  }

  selectMunicipality(municipality: string) {
    this.getElement().searchMunicipalityDropdown().type(municipality);
    this.getElement().anyList().contains(municipality).click();
    pw.waitForLoading();
    this.getElement().anyButton().contains("Search").click();
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
    pw.get(
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
      pw.get(".k-dialog-actions").find("button").contains("Delete").click();
    } else if (this.userType === "ags") {
      pw.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
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
                pw.wrap($columns.eq(columnIndex)).find("button").click();
                this.getElement().anyList().contains("Delete Filing").click();
                // TODO: Add delete confirmation POM
                pw.get(".k-dialog-actions")
                  .find("button")
                  .contains("Delete")
                  .click();
                pw.waitForLoading();
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
    pw.get(
      `@paymentStatus_${removeSpaces(anchorColumnName)}${removeSpaces(
        anchorValue
      )}`
    )
      .find("button")
      .click();
    this.getElement().anyList().contains("Update Status").click();
    // TODO: Add update status modal POM
    pw.get(".k-window-content")
      .find(".k-radio-list")
      .find(`input[value="${newStatus}"]`)
      .click();
    pw.get(".k-dialog-actions").find("button").contains("Save").click();
    pw.waitForLoading();
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
    pw.get(
      `@paymentStatus_${removeSpaces(anchorColumnName)}${removeSpaces(
        anchorValue
      )}`
    )
      .find("button")
      .click();
    this.getElement().anyList().contains("Audit Log").click();
    pw.waitForLoading();
  }

  clickExportButton(isExportFullData: boolean = true) {
    this.getElement().exportButton().click();
    if (this.userType !== "taxpayer") {
      // TODO: Add export modal POM
      if (isExportFullData) {
        pw.get(".k-actions")
          .find("button")
          .contains("Export Full Data")
          .click();
      } else {
        pw.get(".k-actions").find("button").contains("Export View").click();
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
    pw.get(":nth-child(1) > .k-datepicker").type(
      `${month}{rightArrow}${day}{rightArrow}${year}`
    );
    pw.get(".NLGButtonPrimary").click();
    pw.waitForLoading();
  }

  getColumnCellsData(columnName: string) {
    pw.wrap([]).as("columnCellsData");
    pw.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes[columnName];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            pw.get("@columnCellsData").then((columnCellsData: any) => {
              pw.wrap([...columnCellsData, $columns.eq(columnIndex).text()]).as(
                "columnCellsData"
              );
            });
          });
      });
  }

  addCustomField(customFieldTitle: string, customFieldName: string) {
    if (this.userType === "ags") {
      // TODO: Add government page POM
      pw.visit("/municipalityApp/list/:tab");
      pw.get("tr")
        .contains(this.municipalitySelection)
        .parent()
        .find("td")
        .eq(0)
        .find("i")
        .click();
      pw.waitForLoading();
      pw.get("h2").contains("Filing List Configuration").scrollIntoView();
      pw.get("button").contains("Add New Column").click();
      pw.get('input[name^="ColumnsToAddToFilingList"][name$=".Title"]')
        .last()
        .type(customFieldTitle);
      pw.get('input[name^="ColumnsToAddToFilingList"][name$=".Name"]')
        .last()
        .type(customFieldName);
      pw.get("button").contains("Save").click();
      pw.url().should("contains", "/municipalityApp/list");
    }
  }

  removeCustomField(customFieldName: string) {
    // TODO: Add government page POM
    pw.visit("/municipalityApp/list/:tab");
    pw.get("tr")
      .contains(this.municipalitySelection)
      .parent()
      .find("td")
      .eq(0)
      .find("i")
      .click();
    pw.waitForLoading();
    pw.get("h2").contains("Filing List Configuration").scrollIntoView();
    pw.get("input").each(($input, $index) => {
      if ($input.val() === customFieldName) {
        pw.wrap($index).as("customFieldIndex");
      }
    });
    pw.get("@customFieldIndex").then((customFieldIndex) => {
      pw.get("input")
        .eq(Number(customFieldIndex))
        .parent()
        .parent()
        .find("div")
        .last()
        .find("button")
        .contains("Remove")
        .click();
    });
    pw.get("button").contains("Save").click();
    pw.url().should("contains", "/municipalityApp/list");
  }

  isColumnExist(columnName: string, variableAlias: string) {
    getOrderOfColumns(
      AGS_FILING_COLUMNS.includes(columnName)
        ? AGS_FILING_COLUMNS
        : [...AGS_FILING_COLUMNS, columnName],
      `${this.userType}_${this.defaultGridColumnsAlias}AfterAdditionalColumn`
    );
    pw.get(
      `@${this.userType}_${this.defaultGridColumnsAlias}AfterAdditionalColumn`
    )
      .should("exist")
      .then((columnIndexes: any) => {
        if (columnIndexes[columnName] !== undefined) {
          pw.wrap(true).as(variableAlias);
        } else {
          pw.wrap(false).as(variableAlias);
        }
      });
  }
}

export default FilingGrid;
