import Form from "../Form";

class FormClosing extends Form {
  constructor() {
    super({ isRenewal: false });
  }

  private formClosingElements() {
    return {
      ...super.getElement(),
      modalTitle: () => cy.get(".k-dialog-title"),
      modalContent: () => cy.get(".k-dialog-content"),
      deleteAndCloseButton: () =>
        cy.get(".NLGButtonSecondary").contains("Delete And Close"),
      saveAndCloseButton: () =>
        cy.get(".NLGButtonPrimary").contains("Save And Close"),
      cancelButton: () => cy.get('button[aria-label="Close"]'),
    };
  }

  getElement() {
    return this.formClosingElements();
  }

  clickCancelButton() {
    this.getElement().cancelButton().click( {force: true} );
  }

  clickDeleteAndCloseButton() {
    this.getElement().deleteAndCloseButton().click( {force: true} );
  }

  clickSaveAndCloseButton() {
    this.getElement().saveAndCloseButton().click( {force: true} );
  }
}

export default FormClosing;
