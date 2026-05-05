class SetBusinessStatusModal {
  private elements() {
    return {
      modal: () => pw.get(".k-dialog"),
      modalTitle: () => this.elements().modal().find(".k-dialog-title"),
      businessCloseDateInput: () =>
        this.getElement()
          .modal()
          .find("label")
          .contains("Business Close Date")
          .next()
          .find("input"),
      lastAcceptFilingDateInput: () =>
        this.getElement()
          .modal()
          .find("label")
          .contains("Last date to accept filings/applications")
          .next()
          .find("input"),
      businessStatusDropdown: () =>
        this.getElement()
          .modal()
          .find("label")
          .contains("Business Status")
          .next(),
      saveButton: () =>
        this.getElement().modal().find("button").contains("Save"),
      cancelButton: () =>
        this.getElement().modal().find("button").contains("Cancel"),
      closeButton: () =>
        this.getElement().modal().find("button[aria-label='Close']"),
      anyList: () => pw.get("li"),
    };
  }

  getElement() {
    return this.elements();
  }

  clickSaveButton() {
    this.getElement().saveButton().click();
    pw.waitForLoading();
  }

  clickCancelButton() {
    this.getElement().cancelButton().click();
  }

  clickCloseButton() {
    this.getElement().closeButton().click();
  }

  setBusinessCloseDate(date: { month: number; date: number; year: number }) {
    this.getElement().businessCloseDateInput().click();
    this.getElement().businessCloseDateInput().type(`${date.month}`);
    this.getElement().businessCloseDateInput().type(`{rightArrow}${date.date}`);
    this.getElement()
      .businessCloseDateInput()
      .type(`{rightArrow}{rightArrow}{backspace}${date.year}`);
  }

  setLastAcceptFilingDate(date: { month: number; date: number; year: number }) {
    this.getElement().lastAcceptFilingDateInput().click();
    this.getElement().lastAcceptFilingDateInput().type(`${date.month}`);
    this.getElement().lastAcceptFilingDateInput().type(`{rightArrow}${date.date}`);
    this.getElement()
      .lastAcceptFilingDateInput()
      .type(`{rightArrow}{rightArrow}{backspace}${date.year}`);
  }

  setBusinessStatus(status: string) {
    this.getElement().businessStatusDropdown().click();
    this.getElement().anyList().contains(status).click();
  }
}

export default SetBusinessStatusModal;