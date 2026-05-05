import Form from "../Form";

class FormClosing extends Form {
  constructor() {
    super({ isRenewal: false });
  }

  private formClosingElements() {
    return {
      ...super.getElement(),
      modalTitle: () => pw.get(".k-dialog-title"),
      modalContent: () => pw.get(".k-dialog-content"),
      deleteAndCloseButton: () =>
        pw.get(".NLGButtonSecondary").contains("Delete And Close"),
      saveAndCloseButton: () =>
        pw.get(".NLGButtonPrimary").contains("Save And Close"),
      cancelButton: () => pw.get('button[aria-label="Close"]'),
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
