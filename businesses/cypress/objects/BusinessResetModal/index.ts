class BusinessResetModal {
  private elements() {
    return {
      modal: () => cy.get(".k-dialog"),
      modalTitle: () => cy.get(".k-dialog-title"),
      modalContent: () => cy.get(".k-dialog-content"),
      cancelButton: () => cy.get("button").contains("Cancel"),
      deleteDataButton: () => cy.get("button").contains("Delete Data"),
      sureWantToDeleteDataCheckbox: () => cy.get(".k-checkbox-label"),
      closeModalButton: () => cy.get('button[aria-label="Close"]'),
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