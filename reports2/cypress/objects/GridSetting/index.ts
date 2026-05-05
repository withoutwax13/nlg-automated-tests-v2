class GridSetting {
  columnOrderAlias: string;
  visibilityStatusAlias: string;

  constructor(props: {
    columnOrderAlias: string;
    visibilityStatusAlias: string;
  }) {
    this.columnOrderAlias = props.columnOrderAlias;
    this.visibilityStatusAlias = props.visibilityStatusAlias;
  }

  private elements() {
    return {
      modal: () => cy.get(".k-dialog"),
      modalTitle: () => this.getElement().modal().find(".k-dialog-title"),
      closeButton: () => this.getElement().modal().find('[aria-label="Close"]'),
      buttonGroup: () => this.getElement().modal().find(".k-dialog-actions"),
      cancelButton: () =>
        this.getElement().buttonGroup().find("button").contains("Cancel"),
      saveChangesButton: () =>
        this.getElement().buttonGroup().find("button").contains("Save Changes"),
      gridSettingMainContainer: () => cy.get(".NLG-GridSettings"),
      restoreDefaulSettingsButton: () =>
        this.getElement()
          .gridSettingMainContainer()
          .find("button")
          .contains("Restore Default Settings"),
      columnRowSetting: (columnName: string) =>
        this.getElement()
          .gridSettingMainContainer()
          .find(".k-list-item")
          .contains(columnName)
          .parent(),
      columnRowVisibilityToggle: (columnName: string) =>
        this.getElement()
          .columnRowSetting(columnName)
          .find("[role='switch']")
          .eq(0),
      columnRowFreezeToggle: (columnName: string) =>
        this.getElement()
          .columnRowSetting(columnName)
          .find("[role='switch']")
          .eq(1),
      columnRowDragIcon: (columnName: string) =>
        this.getElement().columnRowSetting(columnName).find(".fa-grip-lines"),
    };
  }

  getElement() {
    return this.elements();
  }

  clickSaveChangesButton() {
    this.getElement().saveChangesButton().click();
  }

  clickCancelButton() {
    this.getElement().cancelButton().click();
  }

  clickCloseButton() {
    this.getElement().closeButton().click();
  }

  showColumn(columnName: string) {
    this.getElement()
      .columnRowVisibilityToggle(columnName)
      .invoke("attr", "aria-checked")
      .then((checked) => {
        if (checked === "false") {
          this.getElement().columnRowVisibilityToggle(columnName).click();
          cy.get(`@${this.visibilityStatusAlias}`).then((visibilityStatus) => {
            cy.wrap({ ...visibilityStatus, [columnName]: true }).as(
              this.visibilityStatusAlias
            );
          });
        } else {
          cy.log(`Column ${columnName} is already visible`);
        }
      });
    this.clickSaveChangesButton();
  }

  hideColumn(columnName: string) {
    this.getElement()
      .columnRowVisibilityToggle(columnName)
      .invoke("attr", "aria-checked")
      .then((checked) => {
        if (checked === "true") {
          this.getElement().columnRowVisibilityToggle(columnName).click();
          cy.get(`@${this.visibilityStatusAlias}`).then((visibilityStatus) => {
            cy.wrap({ ...visibilityStatus, [columnName]: false }).as(
              this.visibilityStatusAlias
            );
          });
        } else {
          cy.log(`Column ${columnName} is already hidden`);
        }
      });
    this.clickSaveChangesButton();
  }

  freezeColumn(columnName: string) {
    this.getElement()
      .columnRowFreezeToggle(columnName)
      .invoke("attr", "aria-checked")
      .then((checked) => {
        if (checked === "false") {
          this.getElement().columnRowFreezeToggle(columnName).click();
        } else {
          cy.log(`Column ${columnName} is already frozen`);
        }
      });
    this.clickSaveChangesButton();
  }

  unfreezeColumn(columnName: string) {
    this.getElement()
      .columnRowFreezeToggle(columnName)
      .invoke("attr", "aria-checked")
      .then((checked) => {
        if (checked === "true") {
          this.getElement().columnRowFreezeToggle(columnName).click();
        } else {
          cy.log(`Column ${columnName} is already unfrozen`);
        }
      });
    this.clickSaveChangesButton();
  }

  restoreDefaultSettings() {
    this.getElement().restoreDefaulSettingsButton().scrollIntoView();
    this.getElement().restoreDefaulSettingsButton().click();
    this.clickSaveChangesButton();
  }

  moveColumnToLocationOf(columnName: string, targetColumnName: string) {
    const dataTransfer = new DataTransfer();
    this.getElement()
      .columnRowDragIcon(columnName)
      .trigger("mousedown", { which: 1 })
      .trigger("dragstart", { dataTransfer })
      .trigger("drag", { dataTransfer });
    this.getElement()
      .columnRowSetting(targetColumnName)
      .trigger("dragover", { dataTransfer })
      .trigger("drop", { dataTransfer });
    this.clickSaveChangesButton();
  }
}

export default GridSetting;
