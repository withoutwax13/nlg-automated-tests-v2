class ExportModal {
  private elements() {
    return {
      modal: () => pw.get(".k-dialog"),
      modalTitle: () => pw.get(".k-dialog-title"),
      closeButton: () => pw.get('button[aria-label="Close"]'),
      csvOption: () => pw.get(".k-radio-item").eq(0),
      excelOption: () => pw.get(".k-radio-item").eq(1),
      exportFullOption: () => pw.get(".k-radio-item").eq(2),
      exportViewOption: () => pw.get(".k-radio-item").eq(3),
      exportWithUsersInfoYesOption: () => pw.get(".k-radio-item").eq(4),
      exportWithUsersInfoNoOption: () => pw.get(".k-radio-item").eq(5),
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
    // pw.intercept("GET", 'https://**.azavargovapps.com/businesses/municipalityBusinesses/**/withTaxpayersInfo').as('exportWithUsersInfo');
    // pw.intercept("GET", "https://**.azavargovapps.com/businesses/LastUploadedHeaders/**").as("exportFull");
    this.getElement().exportWithUsersInfoYesOption().click();
    // pw.wait('@exportWithUsersInfo');
    // pw.get("@exportWithUsersInfo").its("response.statusCode").should("eq", 200);
    // pw.wait('@exportFull');
    // pw.get("@exportFull").its("response.statusCode").should("eq", 200);
  }

  clickExportWithoutUsersInfoOption() {
    this.getElement().exportWithUsersInfoNoOption().click();
  }

  clickExportViewOption() {
    this.getElement().exportViewOption().click();
  }

  clickExportFullOption() {
    pw.log("Clicking Export Full Option");
    this.getElement().exportFullOption().click();
  }

  clickExportButton() {
    this.getElement().exportButton().click();
  }
}

export default ExportModal;
