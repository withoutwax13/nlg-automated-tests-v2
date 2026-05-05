class ExportModal {
  private elements() {
    return {
      modal: () => cy.get(".k-dialog"),
      modalTitle: () => cy.get(".k-dialog-title"),
      closeButton: () => cy.get('button[aria-label="Close"]'),
      csvOption: () => cy.get(".k-radio-item").eq(0),
      excelOption: () => cy.get(".k-radio-item").eq(1),
      exportFullOption: () => cy.get(".k-radio-item").eq(2),
      exportViewOption: () => cy.get(".k-radio-item").eq(3),
      exportWithUsersInfoYesOption: () => cy.get(".k-radio-item").eq(4),
      exportWithUsersInfoNoOption: () => cy.get(".k-radio-item").eq(5),
      exportButton: () =>
        this.getElement()
          .modal()
          .find(".NLGButtonSecondary")
          .contains("Export"),
    };
  }

  getElement() {
    return this.elements();
  }

  clickCloseButton() {
    this.getElement().closeButton().click();
  }

  clickCsvOption() {
    this.getElement().csvOption().click();
  }

  clickExcelOption() {
    this.getElement().excelOption().click();
  }

  clickExportWithUsersInfoOption() {
    // cy.intercept("GET", 'https://**.azavargovapps.com/businesses/municipalityBusinesses/**/withTaxpayersInfo').as('exportWithUsersInfo');
    // cy.intercept("GET", "https://**.azavargovapps.com/businesses/LastUploadedHeaders/**").as("exportFull");
    this.getElement().exportWithUsersInfoYesOption().click();
    // cy.wait('@exportWithUsersInfo');
    // cy.get("@exportWithUsersInfo").its("response.statusCode").should("eq", 200);
    // cy.wait('@exportFull');
    // cy.get("@exportFull").its("response.statusCode").should("eq", 200);
  }

  clickExportWithoutUsersInfoOption() {
    this.getElement().exportWithUsersInfoNoOption().click();
  }

  clickExportViewOption() {
    this.getElement().exportViewOption().click();
  }

  clickExportFullOption() {
    cy.log("Clicking Export Full Option");
    this.getElement().exportFullOption().click();
  }

  clickExportButton() {
    this.getElement().exportButton().click();
  }
}

export default ExportModal;
