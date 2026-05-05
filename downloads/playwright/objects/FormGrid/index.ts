import { getOrderOfColumns, validateFilterOperation } from "../../utils/Grid";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];

const AGS_FORM_GRID_COLUMNS = [
  "Action Button",
  "Form Title",
  "Clients",
  "Approval",
  "Created By",
  "Version",
  "Last Modification Date",
  "Published Date",
  "Draft Change Type",
  "Next Version Number",
  "Filing Frequency",
  "Status",
];

const MUNICIPAL_FORM_GRID_COLUMNS = [
  "Action Button",
  "Form Title",
  "Version",
  "Last Modification Date",
  "Published Date",
  "Filing Frequency",
  "Status",
  "Approval",
];

const removeSpaces = (text: string) => text.replace(/\s/g, "");

class FormGrid {
  userType: string;
  defaultColumnAlias: string;
  sortType: string;

  constructor(props: { userType: string; sortType?: string }) {
    if (!["ags", "municipal"].includes(props.userType)) {
      throw new Error("Invalid user type");
    }

    this.userType = props.userType;
    this.defaultColumnAlias = `${this.userType}FormGridDefaultColumns`;
    this.userType = props.userType;
  }
  init() {
    pw.visit("/formsApp");
    pw.waitForLoading();
    switch (this.userType) {
      case "ags":
        getOrderOfColumns(AGS_FORM_GRID_COLUMNS, this.defaultColumnAlias);
        break;
      case "municipal":
        getOrderOfColumns(MUNICIPAL_FORM_GRID_COLUMNS, this.defaultColumnAlias);
      default:
        break;
    }
  }

  private elements() {
    return {
      pageTitle: () => pw.get("h1"),
      formActionsButton: () => pw.get("button").contains("Form Actions"),
      createNewFormButton: () =>
        this.getElement().anyList().contains("Create New Form"),
      uploadFileInput: () => pw.get("#files"),
      exportButton: () => {
        if (this.userType === "ags") {
          return this.getElement().anyList().contains("Export");
        } else {
          return this.getElement().anyButton().contains("Export");
        }
      },
      settingsButton: () => {
        if (this.userType === "ags") {
          return this.getElement().anyList().contains("Form Settings");
        } else {
          return this.getElement().anyButton().contains("Settings");
        }
      },
      createFormFromLibraryButton: () =>
        this.getElement().anyList().contains("Create Form From Library"),
      formLibrarySettingsButton: () =>
        this.getElement().anyList().contains("Form Library Settings"),
      customizeTableViewButton: () =>
        pw.get(".NLG-HyperlinkNoPadding").contains("Customize Table View"),
      columns: () => pw.get("thead").find("tr").find("th"),
      rows: () =>
        pw.get("tbody").then(($tbody) => {
          if ($tbody.find("tr").length !== 0) {
            return $tbody.find("tr");
          }
        }),
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
    pw.get(`@${this.defaultColumnAlias}`)
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
    pw.get(`@${this.defaultColumnAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        console.log(columnIndexes);
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
    pw.get(`@${this.defaultColumnAlias}`)
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

  getDataOfColumnForNRow(
    rowPosition: number,
    targetColumnName: string,
    targetColumnDataAlias: string
  ) {
    pw.get(`@${this.defaultColumnAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes[targetColumnName];
        this.getElement()
          .rows()
          .eq(rowPosition)
          .then(($row) => {
            const $columns = $row.find("td");
            pw.wrap($columns.eq(columnIndex).text()).as(targetColumnDataAlias);
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
    pw.get(`@${this.defaultColumnAlias}`)
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

  getElementOfColumnForNRow(
    rowPosition: number,
    targetColumnName: string,
    targetColumnElementAlias: string
  ) {
    pw.get(`@${this.defaultColumnAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes[targetColumnName];
        this.getElement()
          .rows()
          .eq(rowPosition)
          .then(($row) => {
            const $columns = $row.find("td");
            pw.wrap($columns.eq(columnIndex)).as(targetColumnElementAlias);
          });
      });
  }

  toggleActionButton(
    type: "order" | "filter",
    action?: string,
    anchorColumnName?: string,
    anchorValue?: string,
    order?: number
  ) {
    if (type === "filter") {
      this.getElementOfColumn(
        "Action Button",
        anchorColumnName,
        anchorValue,
        `${removeSpaces(action)}${removeSpaces(anchorColumnName)}${removeSpaces(
          anchorValue
        )}`
      );
      pw.get(
        `@${removeSpaces(action)}${removeSpaces(
          anchorColumnName
        )}${removeSpaces(anchorValue)}`
      ).click();
      this.getElement().anyList().contains(action).click();
    } else if (type === "order") {
      this.getElementOfColumnForNRow(
        order,
        "Action Button",
        "firstRowActionButton"
      );
      pw.get("@firstRowActionButton").click();
      this.getElement().anyList().contains(action).click();
    }
  }

  clickExportButton() {
    if (this.userType === "ags") {
      this.getElement().formActionsButton().click();
      this.getElement().exportButton().click();
    } else {
      this.getElement().exportButton().click();
    }
  }

  clickAddNeWFormButton() {
    this.getElement().formActionsButton().click();
    this.getElement().createNewFormButton().click();
  }

  clickSettingsButton() {
    if (this.userType === "ags") {
      this.getElement().formActionsButton().click();
      this.getElement().settingsButton().click();
    } else {
      this.getElement().settingsButton().click();
    }
  }

  clickCreateFormFromLibraryButton() {
    this.getElement().formActionsButton().click();
    this.getElement().createFormFromLibraryButton().click();
  }

  clickFormLibrarySettingsButton() {
    this.getElement().formActionsButton().click();
    this.getElement().formLibrarySettingsButton().click();
  }

  getTotalItems(alias: string) {
    this.getElement()
      .itemsData()
      .invoke("text")
      .then((text: string) => {
        const totalItems = text.split("of")[1].trim();
        pw.wrap(parseInt(totalItems)).as(alias);
      });
  }

  getArrayDataOfColumn(
    columnName: string,
    alias: string,
    persistAliasData: boolean = false
  ) {
    const collectData = (columnIndex: number, columnData: string[]) => {
      this.getElement()
        .rows()
        .each(($row) => {
          const $columns = $row.find("td");
          columnData.push($columns.eq(columnIndex).text());
        });
      pw.wrap(columnData).as(alias);
    };

    const processNextPage = (columnIndex: number, columnData: string[]) => {
      this.getElement()
        .goToNextPageButton()
        .invoke("attr", "aria-disabled")
        .then((isDisabled) => {
          if (isDisabled !== "true") {
            this.getElement().goToNextPageButton().click();
            pw.wait(1000); // wait for the next page to load
            collectData(columnIndex, columnData);
            processNextPage(columnIndex, columnData);
          }
        });
    };

    pw.get(`@${this.defaultColumnAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes[columnName];
        let columnData: string[] = [];
        if (persistAliasData) {
          pw.get(`@${alias}`).then((data: any) => {
            columnData = data || [];
          });
        }
        collectData(columnIndex, columnData);
        processNextPage(columnIndex, columnData);
      });
  }
}

export default FormGrid;
