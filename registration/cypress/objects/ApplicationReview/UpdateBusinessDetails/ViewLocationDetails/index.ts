class ViewLocationDetails {
  constructor() {}
  private elements() {
    return {
      modalTitle: () => cy.get(".k-dialog-title"),
      formSubmissionRequirementsList: () => cy.get(".disabledFormRemittances"),
      businessDetailsData: () => cy.get("section"),
      cancelButton: () =>
        cy.get(".k-window-titlebar-actions").find('button[aria-label="Close"]'),
    };
  }

  getElements() {
    return this.elements();
  }

  getBusinessData(labelName: string) {
    return this.elements()
      .businessDetailsData()
      .find(".container")
      .find("b")
      .contains(labelName)
      .parent()
      .next();
  }

  getFormRequirements() {
    return this.elements().formSubmissionRequirementsList();
  }

  clickCancelButton() {
    this.elements().cancelButton().click( {force: true} );
  }
}

export default ViewLocationDetails;