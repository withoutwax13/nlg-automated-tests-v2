class FormRequirements {
  constructor() {}
  private elements() {
    return {
      formList: () => cy.get(".k-dialog-content").find("div").eq(1).find("div"),
      locationAddressData: () => cy.get(".k-dialog-content").find("b"),
      startDateDelinquencyTracker: () => cy.get(".k-dateinput").eq(0),
      businessCloseDataTracker: () => cy.get(".k-dateinput").eq(1),
      cancelButton: () => cy.get(".NLGButtonSecondary").contains("Cancel"),
      saveButton: () => cy.get(".NLGButtonPrimary").contains("Save"),
      modalTitle: () => cy.get(".k-dialog-title"),
    };
  }
  getElements() {
    return this.elements();
  }
  enableForm(formName: string) {
    this.getElements()
      .formList()
      .find("label")
      .contains(formName)
      .prev()
      .click( {force: true} );
  }
  disableForm(formName: string) {
    this.getElements()
      .formList()
      .find("label")
      .contains(formName)
      .prev()
      .click( {force: true} );
  }
  selectDateDelinquencyTrackingStartDate(
    month: number,
    date: number,
    year: number
  ) {
    this.getElements().startDateDelinquencyTracker().click( {force: true} );
    this.getElements()
      .startDateDelinquencyTracker()
      .type(`${month}`);
      this.getElements()
      .startDateDelinquencyTracker()
      .type(`{rightArrow}${date}`);
      this.getElements()
      .startDateDelinquencyTracker()
      .type(`{rightArrow}{rightArrow}${year}`);
  }
  selectDateBusinessCloseDate(month: number, date: number, year: number) {
    this.getElements().businessCloseDataTracker().click( {force: true} );
    this.getElements()
      .businessCloseDataTracker()
      .type(`${month}`);
      this.getElements()
      .businessCloseDataTracker()
      .type(`{rightArrow}${date}`);
      this.getElements()
      .businessCloseDataTracker()
      .type(`{rightArrow}{rightArrow}${year}`);
  }
  clickCancelButton() {
    this.getElements().cancelButton().click( {force: true} );
  }
  clickSaveButton() {
    this.getElements().saveButton().click( {force: true} );
  }
}

export default FormRequirements;
