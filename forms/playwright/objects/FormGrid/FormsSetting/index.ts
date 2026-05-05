class FormsSetting {
  private elements() {
    return {
      saveButton: () => cy.get(".k-actions").find("button").contains("Save"),
      cancelButton: () =>
        cy.get(".k-actions").find("button").contains("Cancel"),
      municipalityDropdown: () =>
        cy.get('input[placeholder="Search government and press enter …"]'),
      anyList: () => cy.get("li"),
      forms: () => cy.get(".k-list-item"),
      formRowDragIcon: (columnName: string) =>
        this.getElement()
          .forms()
          .contains(columnName)
          .parent()
          .find(".fa-grip-lines"),
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
    cy.waitForLoading();
  }

  saveFormOrders(aliasName: string) {
    cy.wrap([]).as(aliasName);
    this.getElement()
      .forms()
      .each(($el) => {
        cy.get(`@${aliasName}`).then((formsOrder) => {
          cy.wrap([...formsOrder, $el.text()]).as(aliasName);
        });
      });
  }

  moveFormToLocationOf(formName: string, targetFormName: string) {
    const dataTransfer = new DataTransfer();
    this.getElement()
      .formRowDragIcon(formName)
      .trigger("mousedown", { which: 1 })
      .trigger("dragstart", { dataTransfer })
      .trigger("drag", { dataTransfer });
    this.getElement()
      .formRowDragIcon(targetFormName)
      .trigger("dragover", { dataTransfer })
      .trigger("drop", { dataTransfer });
  }
}

export default FormsSetting;
