class ExportFiling {
  private elements() {
    return {
      modal: () => pw.get(".k-dialog"),
      modalTitle: () => this.getElement().modal().find(".k-dialog-title"),
      closeButton: () =>
        this.getElement().modal().find('button[aria-label="Close"]'),
      modalContent: () => this.getElement().modal().find(".k-dialog-content"),
      fileTypeRadioButton: (type: "CSV" | "Excel") =>
        this.getElement()
          .modal()
          .find(".k-radio-list")
          .find("label")
          .contains(type),
      exportFullDataButton: () =>
        this.getElement().modal().find("button").contains("Export Full Data"),
      exportViewButton: () =>
        this.getElement().modal().find("button").contains("Export View"),
    };
  }

  getElement() {
    return this.elements();
  }

  clickExportFullDataButton() {
    this.getElement().exportFullDataButton().click( {force: true} );
  }

  clickExportViewButton() {
    this.getElement().exportViewButton().click( {force: true} );
  }

  clickCloseButton() {
    this.getElement().closeButton().click( {force: true} );
  }

  selectCSVFileType() {
    this.getElement().fileTypeRadioButton("CSV").click( {force: true} );
  }

  selectExcelFileType() {
    this.getElement().fileTypeRadioButton("Excel").click( {force: true} );
  }
}

export default ExportFiling;
