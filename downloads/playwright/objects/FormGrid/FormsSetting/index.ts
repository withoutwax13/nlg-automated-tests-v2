class FormsSetting {
  private elements() {
    return {
      saveButton: () => cy.get(".k-actions").find("button").contains("Save"),
      cancelButton: () =>
        cy.get(".k-actions").find("button").contains("Cancel"),
      municipalityDropdown: () =>
        cy.get('input[placeholder="Search government and press enter …"]'),
      anyList: () => cy.get("li"),
      forrms: () => cy.get(".k-list-item"),
    };
  }
  getElement() {
    return this.elements();
  }

  clickSaveButton() {
    this.getElement().saveButton().click();
  }

  clickCancelButton() {
    this.getElement().cancelButton().click();
  }

  selectMunicipality(municipality: string) {
    this.getElement().municipalityDropdown().type(municipality);
    this.getElement().anyList().contains(municipality).click();
  }

  saveFormOrders(aliasName: string) {
    cy.wrap([]).as(aliasName);
    this.getElement()
      .forrms()
      .each(($el) => {
        cy.get(`@${aliasName}`).then((formsOrder) => {
          cy.wrap([...formsOrder, $el.text()]).as(aliasName);
        });
      });
  }
}

export default FormsSetting;