class BusinessResetModal {
  private elements() {
    return {
      modal: () => pw.get(".k-dialog"),
      modalTitle: () => pw.get(".k-dialog-title"),
      modalContent: () => pw.get(".k-dialog-content"),
      cancelButton: () => pw.get("button").contains("Cancel"),
      deleteDataButton: () => pw.get("button").contains("Delete Data"),
      sureWantToDeleteDataCheckbox: () => pw.get(".k-checkbox-label"),
      closeModalButton: () => pw.get('button[aria-label="Close"]'),
    };
  }

    getElement() {
        return this.elements();
    }

    clickCancelButton() {
        this.getElement().cancelButton().click();
    }

    clickDeleteDataButton() {
        this.getElement().deleteDataButton().click();
    }

    clickSureWantToDeleteDataCheckbox() {
        this.getElement().sureWantToDeleteDataCheckbox().click();
    }

    clickCloseModalButton() {
        this.getElement().closeModalButton().click();
    }
}

export default BusinessResetModal;