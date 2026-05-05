import {
  getOrderOfColumns,
  validateFilterOperation,
  getVisibilityStatusOfColumns,
} from "../../utils/Grid";
import BusinessDeleteModal from "../BusinessDeleteModal";
import GridSetting from "../GridSetting";
import SetBusinessStatusModal from "../SetBusinessStatusModal";

const VALID_ITEMS_PER_PAGE = [5, 10, 20, 50];
export const AGS_COLUMNS = [
  "Actions",
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
export const TAXPAYER_COLUMNS = [
  "Actions",
  "Government Name",
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
export const MUNICIPAL_COLUMNS = [
  "Actions",
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
    this.defaultGridColumnAlias = `${this.userType}_defaultBusinessGrid`;
    this.sortType = "default";
    this.municipalitySelection = props.municipalitySelection;
    this.businessDeleteModal = new BusinessDeleteModal({
      userType: this.userType,
    });
  }
  private elements() {
    return {
      pageTitle: () => pw.get("h2"),
      pageHelpContent: () => this.getElement().pageTitle().next(),
      anyList: () => pw.get("li"),
      noRecordFoundComponent: () => pw.get(".k-grid-norecords-template"),
      addBusinessButton: () =>
        pw.get(".NLGNewLayoutSecondaryButton").contains("Add a Business"),
      uploadBusinessButton: () =>
        pw.get(".NLGNewLayoutSecondaryButton").contains("Upload Businesses"),
      exportButton: () => pw.get(".NLGNewLayoutSecondaryButton").contains("Export"),
      resetDataButton: () =>
        pw.get(".NLGNewLayoutSecondaryButton").contains("Reset All Data"),
      businessConfigurationButton: () =>
        pw.get(".NLGNewLayoutSecondaryButton").find(".a-magnifying-glass-plus"),
      searchBox: () => pw.get("span").find(".fa-magnifying-glass").parent(),
      columns: () => pw.get("thead").find("tr").find("th"),
      rows: () =>
        pw.get("tbody").then(($tbody) => {
          if ($tbody.find("tr").length !== 0) {
            return $tbody.find("tr");
          }
        }),
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
        pw.get('input[placeholder="Search government ..."]'),
      anyButton: () => pw.get("button"),
      clearAllFiltersButton: () => pw.get("*").contains("Clear All"),
      toastComponent: () => pw.get(".Toastify"),
      gridPopup: () => pw.get(".k-popup"),
      gridPopupTitle: () =>
        this.getElement().gridPopup().find("div").find("div").find("div"),
      gridPopupContent: () => this.getElement().gridPopupTitle().next(),
      gridPopupSelectionItem: (labelName: string) =>
        this.getElement()
          .gridPopupContent()
          .find(".k-label")
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
      activeFilterChipsContainer: () =>
        pw.get("label").contains("Filtered By:").parent(),
      activeFilterChipsLabel: () => pw.get("label").contains("Filtered By:"),
      activeFilterChip: (columnName: string) =>
        this.getElement()
          .activeFilterChipsLabel()
          .parent()
          .next()
          .find("div")
          .contains(columnName),
    };
  }

  init(resetSavedGridSettingsInMemory?: boolean, isFirstTimeGridSettingsLoading: boolean = true) {
    pw.intercept(
      "GET",
      "https://**.azavargovapps.com/businesses/municipalityBusinessConfig/**"
    ).as("govBusinessConfig");
    pw.intercept("GET", "https://**.lambda-url.us-east-1.on.aws/?municipalityId=**").as("lambdaRequestMunicipalityId");
    pw.intercept("GET", "https://**.azavargovapps.com/municipalities/ActiveTaxAndFeesSubscriptions").as("activeTaxAndFeesSubscriptions");
    pw.intercept(
      "GET",
      "https://**.azavargovapps.com/users/usersGridSettings/**"
    ).as("userGridSettings");
    pw.intercept("GET", "https://**.azavargovapps.com/users/**").as("userDetailsRequest");
    pw.visit("/BusinessesApp/BusinessesList");
    if (this.userType === "ags") {
      pw.wait("@activeTaxAndFeesSubscriptions");
      pw.get("@activeTaxAndFeesSubscriptions").its("response.statusCode").should("eq", 200);
    }
    const isArrakisMunicipality = String(this.municipalitySelection).includes(
      "Arrakis"
    );
    switch (this.userType) {
      case "taxpayer":
        pw.wait("@userDetailsRequest");
        pw.get("@userDetailsRequest").its("response.statusCode").should("eq", 200);
        if (isFirstTimeGridSettingsLoading) {
          pw.get("@userGridSettings").its("response.statusCode").should("eq", 200);
        }
        this.getElement().noRecordFoundComponent().should("not.exist");
        getOrderOfColumns(
          TAXPAYER_COLUMNS,
          this.defaultGridColumnAlias,
          resetSavedGridSettingsInMemory ? true : false
        );
        getVisibilityStatusOfColumns(
          TAXPAYER_COLUMNS,
          `${this.defaultGridColumnAlias}_visibility`
        );
        break;
      case "municipal":
        pw.wait("@govBusinessConfig");
        pw.wait("@lambdaRequestMunicipalityId");
        if (isFirstTimeGridSettingsLoading) {
          pw.wait("@userGridSettings");
        }
        pw.get("@govBusinessConfig").its("response.statusCode").should("eq", 200);
        pw.get("@lambdaRequestMunicipalityId").its("response.statusCode").should("eq", 200);
        if (isFirstTimeGridSettingsLoading) {
          pw.get("@userGridSettings").its("response.statusCode").should("eq", 200);
        }
        this.getElement().noRecordFoundComponent().should("not.exist");
        getOrderOfColumns(
          AGS_COLUMNS,
          this.defaultGridColumnAlias,
          resetSavedGridSettingsInMemory ? true : false
        );
        getVisibilityStatusOfColumns(
          AGS_COLUMNS,
          `${this.defaultGridColumnAlias}_visibility`
        );
        break;
      case "ags":
        this.searchMunicipality(this.municipalitySelection);
        pw.wait("@govBusinessConfig");
        pw.wait("@lambdaRequestMunicipalityId");
        if (isFirstTimeGridSettingsLoading) {
          pw.wait("@userGridSettings");
        }
        pw.get("@govBusinessConfig").its("response.statusCode").should("eq", 200);
        pw.get("@lambdaRequestMunicipalityId").its("response.statusCode").should("eq", 200);
        if (isFirstTimeGridSettingsLoading) {
          pw.get("@userGridSettings").its("response.statusCode").should("eq", 200);
        }

        if (isArrakisMunicipality) {
          this.getElement().noRecordFoundComponent().should("not.exist");
          getOrderOfColumns(
            AGS_COLUMNS,
            this.defaultGridColumnAlias,
            resetSavedGridSettingsInMemory ? true : false
          );
          getVisibilityStatusOfColumns(
            AGS_COLUMNS,
            `${this.defaultGridColumnAlias}_visibility`
          );
        }
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
    pw.get(`@${this.defaultGridColumnAlias}`)
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

  isGridFiltered() {
    return pw.get("body").then($body => {
      if ($body.find("label:contains('Filtered By:')").length > 0) {
        return pw.wrap(true);
      } else {
        return pw.wrap(false);
      }
    });
  }

  filterColumn(
    columnName: string,
    filterValue: string,
    filterType: string = "text",
    filterOperation: string = "Contains"
  ) {
    pw.get(`@${this.defaultGridColumnAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        const columnIndex = columnIndexes[columnName];
        switch (filterType) {
          case "text":
            pw.wait(1500); // wait to avoid jquery delay issue causing flakiness
            this.handleTextFilter(columnIndex, filterValue, filterOperation);
            break;
          case "date":
            pw.wait(1500); // wait to avoid jquery delay issue causing flakiness
            this.handleDateFilter(columnIndex, filterValue, filterOperation);
            break;
          case "number":
            pw.wait(1500); // wait to avoid jquery delay issue causing flakiness
            this.handleNumberFilter(columnIndex, filterValue, filterOperation);
            break;
          case "multi-select":
            pw.wait(1500); // wait to avoid jquery delay issue causing flakiness
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
    pw.get(`@${this.defaultGridColumnAlias}`)
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
    pw.get(`@${this.defaultGridColumnAlias}`)
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
              pw.wrap($columns.eq(columnIndex)).as(targetColumnElementAlias);
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
    pw.intercept("DELETE", this.userType !== "taxpayer" ? "https://**.azavargovapps.com/businesses/municipalityBusiness/**" : "https://**.azavargovapps.com/businesses/taxpayerBusiness/**").as("deleteBusiness");
    this.getElementOfColumn("Actions", "DBA", businessDba, "actionButton");
    pw.get("@actionButton").click();
    this.getElement().anyList().contains("Delete").click();
    this.businessDeleteModal.clickDeleteButton();
    this.getElement().toastComponent().should("exist");
    pw.wait("@deleteBusiness");
    pw.get("@deleteBusiness").its("response.statusCode").should("eq", 200);
  }

  viewBusinessDetails(businessDba: string) {
    this.getElementOfColumn(
      "Actions",
      "DBA",
      businessDba,
      "actionButton"
    );
    pw.get("@actionButton").click();
    this.getElement().anyList().contains("View Details").click();
  }

  setDelinquencyStartDate(
    businessDba: string,
    date: { month: number; date: number; year: number }
  ) {
    pw.intercept("PUT", "https://**.azavargovapps.com/businesses/municipalityBusiness/update").as("updateBusiness");
    this.getElementOfColumn(
      "Delinquency Start Date",
      "DBA",
      businessDba,
      "delinquencyStartDateInput"
    );
    pw.get("@delinquencyStartDateInput").click();
    this.getElement().gridPopupDateInput().click();
    this.getElement().gridPopupDateInput().type(`${date.month}`);

    this.getElement().gridPopupDateInput().click();
    this.getElement().gridPopupDateInput().type(`{rightarrow}${date.date}`);

    this.getElement().gridPopupDateInput().click();
    this.getElement()
      .gridPopupDateInput()
      .type(`{rightarrow}{rightarrow}0000${date.year}`);
    this.getElement().gridPopupSaveButton().should("not.be.disabled").click();
    pw.wait("@updateBusiness");
    pw.get("@updateBusiness").its("response.statusCode").should("eq", 200);
  }

  setCloseDate(
    businessDba: string,
    date: { month: number; date: number; year: number }
  ) {
    const setCloseDateModal = new SetBusinessStatusModal();

    pw.intercept("PUT", "https://**.azavargovapps.com/businesses/municipalityBusiness/update").as("updateBusiness");
    this.getElementOfColumn("Close Date", "DBA", businessDba, "closeDateInput");
    pw.get("@closeDateInput").click();
    setCloseDateModal.setBusinessCloseDate({
      month: date.month,
      date: date.date,
      year: date.year,
    });
    pw.waitForLoading();
    setCloseDateModal.setBusinessStatus("Closed");
    pw.waitForLoading();
    setCloseDateModal.clickSaveButton();
    pw.wait("@updateBusiness");
    pw.get("@updateBusiness").its("response.statusCode").should("eq", 200);
  }

  addRequiredForms(businessDba: string, forms: string[]) {
    this.getElementOfColumn(
      "Required Forms",
      "DBA",
      businessDba,
      "requiredFormsCellAdd"
    );
    pw.intercept("PUT", "https://**.azavargovapps.com/businesses/municipalityBusiness/update").as("updateBusiness");
    pw.get("@requiredFormsCellAdd").click();
    forms.forEach((form) => {
      this.getElement()
        .gridPopupSelectionItem(form)
        .find(".k-switch")
        .invoke("attr", "aria-checked")
        .then((isChecked) => {
          if (isChecked === "false") {
            this.getElement()
              .gridPopupSelectionItem(form)
              .find("input")
              .scrollIntoView()
              .click({ force: true });
          }
        });
    });
    this.getElement().pageTitle().click();
    pw.wait("@updateBusiness");
    pw.get("@updateBusiness").its("response.statusCode").should("eq", 200);
  }

  removeRequiredForms(businessDba: string, forms: string[]) {
    this.getElementOfColumn(
      "Required Forms",
      "DBA",
      businessDba,
      "requiredFormsCellRemove"
    );
    pw.intercept("PUT", "https://**.azavargovapps.com/businesses/municipalityBusiness/update").as("updateBusiness");
    pw.get("@requiredFormsCellRemove").click();
    forms.forEach((form) => {
      this.getElement()
        .gridPopupSelectionItem(form)
        .find(".k-switch")
        .invoke("attr", "aria-checked")
        .then((isChecked) => {
          if (isChecked === "true") {
            this.getElement()
              .gridPopupSelectionItem(form)
              .find(".k-switch")
              .scrollIntoView()
              .click();
          }
        });
    });
    this.getElement().pageTitle().click();
    pw.wait("@updateBusiness");
    pw.get("@updateBusiness").its("response.statusCode").should("eq", 200);
  }

  checkEnabledRequiredForms(businessDba: string, aliasVariable: string) {
    pw.wrap([]).as(aliasVariable);
    this.getElementOfColumn(
      "Required Forms",
      "DBA",
      businessDba,
      "requiredFormsCellCheck"
    );
    pw.get("@requiredFormsCellCheck").click();
    this.getElement()
      .gridPopupContent()
      .find(".k-switch")
      .parent()
      .each(($form, $index) => {
        const label = $form.find(".k-label").text();
        this.getElement()
          .gridPopupContent()
          .find(".k-switch")
          .eq($index)
          .invoke("attr", "aria-checked")
          .then((isChecked) => {
            if (isChecked === "true") {
              pw.get(`@${aliasVariable}`).then((forms) => {
                pw.wrap([...forms, label]).as(aliasVariable);
              });
            }
          });
      });
  }

  showColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: this.defaultGridColumnAlias,
      visibilityStatusAlias: `${this.defaultGridColumnAlias}_visibility`,
    });
    gridSetting.showColumn(columnName);
    pw.waitForLoading();
  }

  hideColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: this.defaultGridColumnAlias,
      visibilityStatusAlias: `${this.defaultGridColumnAlias}_visibility`,
    });
    gridSetting.hideColumn(columnName);
    pw.waitForLoading();
  }

  feezeColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: this.defaultGridColumnAlias,
      visibilityStatusAlias: `${this.defaultGridColumnAlias}_visibility`,
    });
    gridSetting.freezeColumn(columnName);
    pw.waitForLoading();
  }

  unfreezeColumn(columnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: this.defaultGridColumnAlias,
      visibilityStatusAlias: `${this.defaultGridColumnAlias}_visibility`,
    });
    gridSetting.unfreezeColumn(columnName);
    pw.waitForLoading();
  }

  verifyColumnVisibility(columnName: string, isVisibleAlias: string) {
    pw.get(`@${this.defaultGridColumnAlias}_visibility`)
      .should("exist")
      .then((visibilityStatus: any) => {
        pw.wrap(visibilityStatus[columnName]).as(isVisibleAlias);
      });
  }

  verifyColumnOrder(columnName: string, orderAlias: string) {
    pw.get(`@${this.defaultGridColumnAlias}`)
      .should("exist")
      .then((columnIndexes: any) => {
        pw.wrap(columnIndexes[columnName]).as(orderAlias);
      });
  }

  restoreDefaultGridSettings() {
    const gridSetting = new GridSetting({
      columnOrderAlias: this.defaultGridColumnAlias,
      visibilityStatusAlias: `${this.defaultGridColumnAlias}_visibility`,
    });
    gridSetting.restoreDefaultSettings();
    pw.waitForLoading();
  }

  moveColumnToLocationOf(columnName: string, targetColumnName: string) {
    const gridSetting = new GridSetting({
      columnOrderAlias: this.defaultGridColumnAlias,
      visibilityStatusAlias: `${this.defaultGridColumnAlias}_visibility`,
    });
    gridSetting.moveColumnToLocationOf(columnName, targetColumnName);
    pw.waitForLoading();
  }
}

export default BusinessGrid;
