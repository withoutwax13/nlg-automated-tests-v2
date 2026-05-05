import { getOrderOfColumns, validateFilterOperation } from "../../utils/Grid";
import BusinessDeleteModal from "../BusinessDeleteModal";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
const AGS_COLUMNS = [
  "Delete",
  "Details",
  "Business Name",
  "DBA",
  "Operating Status",
  "Required Forms",
  "Delinquency Start Date",
  "Close Date",
  "State Tax ID",
  "FEIN",
  "Location Address 1",
  "Location Address 2",
  "Location City",
  "Location State",
  "Location Zip Code",
  "Legal Business Address 1",
  "Legal Business Address 2",
  "Location Open Date",
  "Legal Business City",
  "Legal Business State",
  "Legal Business Zip Code",
  "Owner Full Name",
  "Owner Email Address",
  "Owner Phone Number",
  "Owner SSN",
  "Owner Address 1",
  "Owner Address 2",
  "Owner City",
  "Owner Zip Code",
  "Mailing Address 1",
  "Mailing Address 2",
  "Mailing City",
  "Mailing State",
  "Mailing Zip Code",
  "Manager Full Name",
  "Manager Title",
  "Manager Email Address",
  "Manager Phone Number",
  "Emergency Phone Number",
];
const TAXPAYER_COLUMNS = [
  "Delete",
  "Details",
  "Business Name",
  "DBA",
  "State Tax ID",
  "FEIN",
  "Location Address 1",
  "Location Address 2",
  "Location City",
  "Location State",
  "Location Zip Code",
  "Legal Business Address 1",
  "Legal Business Address 2",
  "Legal Business City",
  "Legal Business State",
  "Legal Business Zip Code",
  "Owner Full Name",
  "Owner Email Address",
  "Owner Phone Number",
  "Business Owner SSN",
  "Owner Address 1",
  "Owner Address 2",
  "Owner City",
  "Owner Zip Code",
  "Mail Address 1",
  "Mail Address 2",
  "Mail City",
  "Mail Zip Code",
  "Manager Full Name",
  "Manager Title",
  "Manager Email Address",
  "Manager Phone Number",
  "Emergency Phone Number",
];
const MUNICIPAL_COLUMNS = [
  "Delete",
  "Details",
  "Business Name",
  "DBA",
  "Operating Status",
  "Required Forms",
  "State Tax ID",
  "Delinquency Start Date",
  "FEIN",
  "Close Date",

  "Location Address 1",
  "Location Address 2",
  "Location City",
  "Location State",
  "Location Zip Code",
  "Legal Business Address 1",
  "Legal Business Address 2",
  "Location Open Date",
  "Legal Business City",
  "Legal Business State",
  "Legal Business Zip Code",
  "Owner Full Name",
  "Owner Email Address",
  "Owner Phone Number",
  "Business Owner SSN",
  "Owner Address 1",
  "Owner Address 2",
  "Owner City",
  "Owner Zip Code",
  "Mailing Address 1",
  "Mailing Address 2",
  "Mailing City",
  "Mailing State",
  "Mailing Zip Code",
  "Manager Full Name",
  "Manager Title",
  "Manager Email Address",
  "Manager Phone Number",
  "Emergency Phone Number",
  "Reference ID",
  "Status",
  "Property Management Firm Name",
  "Standard",
  "Legal Description",
  "Property Type",
  "Texpas Taxpayer Number",
  "Test Custom Field",
];

class BusinessGrid {
  defaultGridColumnAlias: string;
  userType: string;
  sortType: string;
  municipalitySelection: string;
  businessDeleteModal: BusinessDeleteModal;

  constructor(props: { userType: string; municipalitySelection?: string }) {
    this.userType = props.userType;
    this.defaultGridColumnAlias = `${this.userType}_taxpayerBusinessGrid`;
    this.sortType = "default";
    this.municipalitySelection = props.municipalitySelection;
    this.businessDeleteModal = new BusinessDeleteModal({
      userType: this.userType,
    });
  }
  private elements() {
    return {
      pageTitle: () => cy.get("h1"),
      pageHelpContent: () => this.getElement().pageTitle().next(),
      anyList: () => cy.get("li"),
      noRecordFoundComponent: () => cy.get(".k-grid-norecords-template"),
      addBusinessButton: () =>
        cy.get(".NLGButtonSecondary").contains("Add a Business"),
      uploadBusinessButton: () =>
        cy.get(".NLGButtonSecondary").contains("Upload Businesses"),
      exportButton: () => cy.get(".NLGButtonSecondary").contains("Export"),
      resetDataButton: () =>
        cy.get(".NLGButtonSecondaryDanger").contains("Reset All Data"),
      businessConfigurationButton: () =>
        cy.get(".NLGButtonSecondary").find(".a-magnifying-glass-plus"),
      searchBox: () => cy.get("span").find(".fa-magnifying-glass").parent(),
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
      anyButton: () => cy.get("button"),
      clearAllFiltersButton: () =>
        cy.get("*").contains("Clear All"),
      toastComponent: () => cy.get(".Toastify"),
      gridPopup: () => cy.get(".k-popup"),
      gridPopupTitle: () =>
        this.getElement().gridPopup().find("div").find("div").find("div"),
      gridPopupContent: () => this.getElement().gridPopupTitle().next(),
      gridPopupSelectionItem: (labelName: string) =>
        this.getElement()
          .gridPopupContent()
          .find(".k-checkbox-wrap")
          .contains(labelName)
          .parent()
          .scrollIntoView(),
      gridPopupDateInput: () =>
        this.getElement()
          .gridPopupTitle()
          .next()
          .find(".k-dateinput")
          .find("input"),
      gridPopupSaveButton: () =>
        this.getElement().gridPopup().find("button").contains("Save"),
      gridPopupCancelButton: () =>
        this.getElement().gridPopup().find("button").contains("Cancel"),
    };
  }

  init() {
    cy.intercept(
      "GET",
      "https://**.amazonaws.com/municipalityBusinessConfig/**"
    ).as("govBusinessConfig");
cy.intercept("GET", "https://**.amazonaws.com/usersGridSettings/**").as("userGridSettings");
    cy.visit("/BusinessesApp/BusinessesList");
    cy.waitForLoading(10);
    switch (this.userType) {
      case "taxpayer":
        cy.wait("@userGridSettings").its("response.statusCode").should("eq", 200);
        getOrderOfColumns(TAXPAYER_COLUMNS, this.defaultGridColumnAlias);
        break;
      case "municipal":
        cy.wait("@userGridSettings").its("response.statusCode").should("eq", 200);
        getOrderOfColumns(MUNICIPAL_COLUMNS, this.defaultGridColumnAlias);
        break;
      case "ags":
        this.searchMunicipality(this.municipalitySelection);
        cy.waitForLoading(10);
        cy.wait("@userGridSettings").its("response.statusCode").should("eq", 200);
        getOrderOfColumns(AGS_COLUMNS, this.defaultGridColumnAlias);
        break;
      default:
        break;
    }
  }

  getElement() {
    return this.elements();
  }

  searchMunicipality(municipalityName: string) {
    this.getElement().searchMunicipalityDropdown().type(municipalityName);
    this.getElement().anyList().contains(municipalityName).click();
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
    cy.get(`@${this.defaultGridColumnAlias}`)
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
    cy.get(`@${this.defaultGridColumnAlias}`)
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
    cy.get(`@${this.defaultGridColumnAlias}`)
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
    cy.get(`@${this.defaultGridColumnAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes[targetColumnName];
        const anchorColumnIndex = columnIndexes[anchorColumnName];
        this.getElement()
          .rows()
          .each(($row) => {
            const $columns = $row.find("td");
            console.log(columnIndex);
            console.log($columns.eq(anchorColumnIndex));
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

  clickAddBusinessButton() {
    this.getElement().addBusinessButton().click();
  }

  clickExportButton() {
    this.getElement().exportButton().click();
  }

  clickUploadBusinessButton() {
    this.getElement().uploadBusinessButton().click();
  }

  clickResetDataButton() {
    this.getElement().resetDataButton().click();
  }

  clickBusinessConfigurationButton() {
    this.getElement().businessConfigurationButton().click();
  }

  deleteBusiness(businessDba: string) {
    this.getElementOfColumn("Delete", "DBA", businessDba, "deleteButton");
    cy.get("@deleteButton").click();
    this.businessDeleteModal.clickDeleteButton();
    this.getElement().toastComponent().should("exist");
    cy.waitForLoading();
  }

  viewBusinessDetails(businessDba: string) {
    this.getElementOfColumn("Details", "DBA", businessDba, "detailsButton");
    cy.get("@detailsButton").click();
  }

  setDelinquencyStartDate(
    businessDba: string,
    date: { month: number; date: number; year: number }
  ) {
    this.getElementOfColumn(
      "Delinquency Start Date",
      "DBA",
      businessDba,
      "delinquencyStartDateInput"
    );
    cy.get("@delinquencyStartDateInput").click();
    this.getElement().gridPopupDateInput().click();
    this.getElement().gridPopupDateInput().type(`${date.month}`);

    this.getElement().gridPopupDateInput().click();
    this.getElement().gridPopupDateInput().type(`{rightarrow}${date.date}`);

    this.getElement().gridPopupDateInput().click();
    this.getElement()
      .gridPopupDateInput()
      .type(`{rightarrow}{rightarrow}0000${date.year}`);
    this.getElement().gridPopupSaveButton().should("not.be.disabled").click();
    cy.waitForLoading();
  }

  setCloseDate(
    businessDba: string,
    date: { month: number; date: number; year: number }
  ) {
    this.getElementOfColumn("Close Date", "DBA", businessDba, "closeDateInput");
    cy.get("@closeDateInput").click();
    this.getElement().gridPopupDateInput().click();
    this.getElement().gridPopupDateInput().type(`${date.month}`);

    this.getElement().gridPopupDateInput().click();
    this.getElement().gridPopupDateInput().type(`{rightarrow}${date.date}`);

    this.getElement().gridPopupDateInput().click();
    this.getElement()
      .gridPopupDateInput()
      .type(`{rightarrow}{rightarrow}0000${date.year}`);
    this.getElement().gridPopupSaveButton().should("not.be.disabled").click();
    cy.waitForLoading();
  }

  addRequiredForms(businessDba: string, forms: string[]) {
    this.getElementOfColumn(
      "Required Forms",
      "DBA",
      businessDba,
      "requiredFormsCellAdd"
    );
    cy.get("@requiredFormsCellAdd").click();
    forms.forEach((form) => {
      this.getElement()
        .gridPopupSelectionItem(form)
        .find("input")
        .invoke("attr", "aria-checked")
        .then((isChecked) => {
          if (isChecked === "false") {
            this.getElement()
              .gridPopupSelectionItem(form)
              .find("input")
              .click();
          }
        });
    });
    this.getElement().gridPopupSaveButton().should("not.be.disabled").click();
    cy.waitForLoading();
  }

  removeRequiredForms(businessDba: string, forms: string[]) {
    this.getElementOfColumn(
      "Required Forms",
      "DBA",
      businessDba,
      "requiredFormsCellRemove"
    );
    cy.get("@requiredFormsCellRemove").click();
    forms.forEach((form) => {
      this.getElement()
        .gridPopupSelectionItem(form)
        .find("input")
        .invoke("attr", "aria-checked")
        .then((isChecked) => {
          if (isChecked === "true") {
            this.getElement()
              .gridPopupSelectionItem(form)
              .find("input")
              .click();
          }
        });
    });
    this.getElement().gridPopupSaveButton().should("not.be.disabled").click();
    cy.waitForLoading();
  }

  checkEnabledRequiredForms(businessDba: string, aliasVariable: string) {
    cy.wrap([]).as(aliasVariable);
    this.getElementOfColumn(
      "Required Forms",
      "DBA",
      businessDba,
      "requiredFormsCellCheck"
    );
    cy.get("@requiredFormsCellCheck").click();
    this.getElement()
      .gridPopupContent()
      .find(".k-checkbox-wrap")
      .each(($form, $index) => {
        const label = $form.find("span").text();
        this.getElement()
          .gridPopupContent()
          .find(".k-checkbox-wrap")
          .eq($index)
          .find("input")
          .invoke("attr", "aria-checked")
          .then((isChecked) => {
            if (isChecked === "true") {
              cy.get(`@${aliasVariable}`).then((forms) => {
                cy.wrap([...forms, label]).as(aliasVariable);
              });
            }
          });
      });
  }
}

export default BusinessGrid;
