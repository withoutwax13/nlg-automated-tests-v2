class ExportFiling {
  private elements() {
    return {
      modal: () => cy.get(".k-dialog"),
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
    this.getElement().exportFullDataButton().click();
  }

  clickExportViewButton() {
    this.getElement().exportViewButton().click();
  }

  clickCloseButton() {
    this.getElement().closeButton().click();
  }

  selectCSVFileType() {
    this.getElement().fileTypeRadioButton("CSV").click();
  }

  selectExcelFileType() {
    this.getElement().fileTypeRadioButton("Excel").click();
  }
}

export default ExportFiling;
