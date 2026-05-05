import {
  getOrderOfColumns,
  validateFilterOperation,
  getVisibilityStatusOfColumns,
} from "../../utils/Grid";
import ExportDelinquencies from "../ExportDelinquencies";
import GridSetting from "../GridSetting";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
export const AGS_DELINQUENCY_GRID_COLUMNS = [
  "Actions",
  "Business Name (DBA)",
  "Business License Number",
  "Business Address",
  "Form Name",
  "Filing Period",
  "Date Delinquent",
  "Is Dismissed",
  "Date Dismissed",
];

export const MUNICIPAL_DELINQUENCY_GRID_COLUMNS = [
  "Actions",
  "Business Name (DBA)",
  "Business License Number",
  "Business Address",
  "Form Name",
  "Filing Period",
  "Date Delinquent",
  "Is Dismissed",
  "Date Dismissed",
];

export const TAXPAYER_DELINQUENCY_GRID_COLUMNS = [
  "Actions",
  "Business Name",
  "Business Address",
  "Government Name",
  "Form Name",
  "Filing Frequency",
  "Filing Period",
  "Date Delinquent",
];

const removeSpaces = (text: string) => text.replace(/\s/g, "");

class DelinquencyGrid {
  userType: string;
  municipalitySelection: string;
  defaultGridColumnsAlias: string;
  sortType: string;

  constructor(props: {
    userType: string;
    municipalitySelection?: string;
    sortType?: string;
  }) {
    this.userType = props.userType;
    this.municipalitySelection = props.municipalitySelection;
    this.defaultGridColumnsAlias = "defaultdelinquencygridcolumns";
    this.sortType = props.sortType ? props.sortType : "default";
  }

  private elements() {
    return {
      pageTitle: () => cy.get("h2"),
      noRecordFoundComponent: () => cy.get(".k-grid-norecords-template"),
      searchBox: () => cy.get("span").find(".fa-magnifying-glass").parent(),
      columns: () => cy.get("thead").find("tr").find("th"),
      rows: () =>
        cy.get("tbody").then(($tbody) => {
          return $tbody.find("tr");
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
      clearAllFiltersButton: () => cy.get("*").contains("Clear All"),
      exportButton: () =>
        cy.get(".NLGButtonPrimary").contains("Export"),
      refreshReportDataButton: () =>
        cy.get(".NLGNewLayoutSecondaryButton").contains("Refresh Report Data"),
      createNewFilingButton: () =>
        cy.get(".NLGButtonSecondary").contains("Create a New Filing"),
    };
  }

  getElement() {
    return this.elements();
  }

  init(resetSavedGridSettingsInMemory?: boolean) {
    cy.intercept("GET", "https://**.azavargovapps.com/users/**").as("getUserDetails");
    cy.intercept("GET", "https://**.azavargovapps.com/municipalities/**").as("getMunicipalityDetails");
    cy.intercept("GET", "https://**.azavargovapps.com/reports/LastUpdatedDelinquencyReport/**").as("getLastUpdatedDelinquencyReport");
    cy.intercept("GET", "https://**.azavargovapps.com/forms/municipality/**?status=Active").as("getFormsForMunicipality");
    cy.intercept("GET", "https://**.azavargovapps.com/reports/DelinquencyReports/**").as("getDelinquencyReportData");
    cy.intercept("GET", "**/users/usersGridSettings*").as("getUserGridSettings");
    cy.intercept("GET", "https://**.azavargovapps.com/reports/DelinquencyReport/Taxpayer").as("getTaxpayerDelinquencyReportData");

    const delinquencyGridUrl =
      this.userType === "taxpayer"
        ? "/reports/taxpayerDelinquencyReport"
        : "/reports/delinquency";
    cy.visit(delinquencyGridUrl);
    cy.wait("@getUserDetails").its("response.statusCode").should("eq", 200);
    if (this.userType === "ags") {
      if (!this.municipalitySelection) {
        throw new Error("Municipality selection is required for AGS user type");
      }
      this.selectMunicipality(this.municipalitySelection);
      cy.wait("@getFormsForMunicipality").its("response.statusCode").should("eq", 200);
      cy.wait("@getDelinquencyReportData").its("response.statusCode").should("eq", 200);
      cy.wait("@getLastUpdatedDelinquencyReport").its("response.statusCode").should("eq", 200);
      // TEMP EXCEPTION (intercept instability for AGS flow): use bounded time wait instead of @getUserGridSettings
      // cy.wait("@getUserGridSettings").its("response.statusCode").should("eq", 200);
      cy.wait(5000);
      this.getElement().columns().should("exist");
      getOrderOfColumns(
        AGS_DELINQUENCY_GRID_COLUMNS,
        `${this.userType}_${this.defaultGridColumnsAlias}`,
        resetSavedGridSettingsInMemory ? true : false
      );
      getVisibilityStatusOfColumns(
        AGS_DELINQUENCY_GRID_COLUMNS,
        `${this.userType}_${this.defaultGridColumnsAlias}_visibility`
      );
    } else if (this.userType === "municipal") {
      cy.wait("@getMunicipalityDetails").its("response.statusCode").should("eq", 200);
      cy.wait("@getLastUpdatedDelinquencyReport").its("response.statusCode").should("eq", 200);
      cy.wait("@getFormsForMunicipality").its("response.statusCode").should("eq", 200);
      cy.wait("@getDelinquencyReportData").its("response.statusCode").should("eq", 200);
      // TEMP EXCEPTION (intercept instability for municipal flow): use bounded time wait instead of @getUserGridSettings
      // cy.wait("@getUserGridSettings").its("response.statusCode").should("eq", 200);
      cy.wait(5000);
      getOrderOfColumns(
        MUNICIPAL_DELINQUENCY_GRID_COLUMNS,
        `${this.userType}_${this.defaultGridColumnsAlias}`,
        resetSavedGridSettingsInMemory ? true : false
      );
      getVisibilityStatusOfColumns(
        MUNICIPAL_DELINQUENCY_GRID_COLUMNS,
        `${this.userType}_${this.defaultGridColumnsAlias}_visibility`
      );
    } else if (this.userType === "taxpayer") {
      cy.wait("@getTaxpayerDelinquencyReportData").its("response.statusCode").should("eq", 200);
      // TEMP EXCEPTION (intercept instability for taxpayer flow): use bounded time wait instead of @getUserGridSettings
      // cy.wait("@getUserGridSettings").its("response.statusCode").should("eq", 200);
      cy.wait(5000);
      getOrderOfColumns(
        TAXPAYER_DELINQUENCY_GRID_COLUMNS,
        `${this.userType}_${this.defaultGridColumnsAlias}`,
        resetSavedGridSettingsInMemory ? true : false
      );
      getVisibilityStatusOfColumns(
        TAXPAYER_DELINQUENCY_GRID_COLUMNS,
        `${this.userType}_${this.defaultGridColumnsAlias}_visibility`
      );
    }
  }

  selectMunicipality(municipality: string) {
    cy.intercept("GET", "**/municipalities/ActiveTaxAndFeesSubscriptions*").as("getSubscribedMunicipalities");
    this.getElement().searchMunicipalityDropdown().clear();
    this.getElement().searchMunicipalityDropdown().type(municipality);
    this.getElement().anyList().contains(municipality).click();
    cy.wait("@getSubscribedMunicipalities").its("response.statusCode").should("eq", 200);
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

  toggleActionButton(
    action: string,
    filterParams: { anchorColumnName: string; anchorValue: string }[]
  ) {
    filterParams.forEach((filterParam) => {
      if (
        !["Filing Period", "Form Name", "Form Title", "Is Dismissed"].includes(
          filterParam.anchorColumnName
        )
      ) {
        this.filterColumn(
          filterParam.anchorColumnName,
          filterParam.anchorValue,
          "text",
          "Contains"
        );
      } else {
        this.filterColumn(
          filterParam.anchorColumnName,
          filterParam.anchorValue,
          "multi-select"
        );
      }
    });
    cy.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = this.userType === "taxpayer" ? columnIndexes["Actions"] : columnIndexes["Actions"];
        this.getElement()
          .rows()
          .each(($row) => {
            // this assumes that the filterParams filters the rows to only one row
            const $columns = $row.find("td");
            cy.wrap($columns.eq(columnIndex)).as("actionButton");
            cy.get("@actionButton").click();
            this.getElement().anyList().contains(action).click();
          });
      });
  }

  clickManageDelinquencyItem(
    filterParams: { anchorColumnName: string; anchorValue: string }[]
  ) {
    this.toggleActionButton("Manage", filterParams);
  }

  viewDelinquencyItem(
    filterParams: { anchorColumnName: string; anchorValue: string }[]
  ) {
    this.toggleActionButton("View Record", filterParams);
  }

  clickRefreshReportDataButton() {
    this.getElement().refreshReportDataButton().click();
    cy.waitForLoading(10);
  }

  clickExportButton(
    isExportFullData: boolean = true,
    fileType: "CSV" | "Excel" = "CSV"
  ) {
    const delinquenciesExportModal = new ExportDelinquencies();
    this.getElement().exportButton().click();
    if (this.userType !== "taxpayer") {
      switch (fileType) {
        case "CSV":
          delinquenciesExportModal.selectCSVFileType();
          break;
        case "Excel":
          delinquenciesExportModal.selectExcelFileType();
          break;
        default:
          delinquenciesExportModal.selectCSVFileType();
          break;
      }

      if (isExportFullData) {
        delinquenciesExportModal.clickExportFullDataButton();
      } else {
        delinquenciesExportModal.clickExportViewButton();
      }
    }
  }

  manageDelinquencyItemByOrder(order?: number) {
    this.toggleActionButtonForNthDelinquencyItem("Manage", order);
  }

  private startFiling() {
    cy.get("body").then(($body) => {
      const modal = $body.find(".k-dialog-titlebar");
      if (modal.length > 0) {
        if (modal.text().includes("Resume Draft Filing")) {
          cy.intercept("DELETE", "https://**.azavargovapps.com/filings/**/delete").as("deleteDraftFiling");
          this.getElement().createNewFilingButton().click();
          cy.wait("@deleteDraftFiling").its("response.statusCode").should("eq", 201);
        }
      }
    });
    cy.wait("@getFilingFullForm").its("response.statusCode").should("eq", 200);
    cy.url().should("include", "/filingApp/filings/");
  }

  toggleActionButtonForNthDelinquencyItem(action: string, order?: number) {
    cy.intercept("GET", "https://**.azavargovapps.com/forms/full/**").as("getFilingFullForm");
    cy.get(`@${this.userType}_${this.defaultGridColumnsAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = this.userType === "taxpayer" ? columnIndexes["Actions"] : columnIndexes["Actions"];
        this.getElement()
          .rows()
          .eq(order ? order : 0)
          .then(($row) => {
            const $columns = $row.find("td");
            cy.wrap($columns.eq(columnIndex)).as("actionButton");
            cy.get("@actionButton").click();
            this.getElement().anyList().contains(action).click();
          });
      });
    if (action === "Submit Now") {
      cy.wait("@getFormsForMunicipality").its("response.statusCode").should("eq", 200);
      this.startFiling();
    }
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
      .should((visibilityStatus: any) => {
        expect(visibilityStatus[columnName]).to.not.equal(undefined);
      })
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

export default DelinquencyGrid;
