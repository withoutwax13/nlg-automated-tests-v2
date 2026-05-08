import { currentPage } from "../../helpers/legacy-helpers";

class GridSetting {
  columnOrderAlias: string;
  visibilityStatusAlias: string;

  constructor(props: { columnOrderAlias: string; visibilityStatusAlias: string }) {
    this.columnOrderAlias = props.columnOrderAlias;
    this.visibilityStatusAlias = props.visibilityStatusAlias;
  }

  private page() {
    return currentPage();
  }

  private elements() {
    return {
      modal: () => this.page().locator(".k-dialog").first(),
      modalTitle: () => this.getElement().modal().locator(".k-dialog-title").first(),
      closeButton: () => this.getElement().modal().locator('[aria-label="Close"]').first(),
      buttonGroup: () => this.getElement().modal().locator(".k-dialog-actions").first(),
      cancelButton: () => this.getElement().buttonGroup().locator("button").filter({ hasText: "Cancel" }).first(),
      saveChangesButton: () => this.getElement().buttonGroup().locator("button").filter({ hasText: "Save Changes" }).first(),
      gridSettingMainContainer: () => this.page().locator(".NLG-GridSettings").first(),
      restoreDefaulSettingsButton: () =>
        this.getElement().gridSettingMainContainer().locator("button").filter({ hasText: "Restore Default Settings" }).first(),
      columnRowSetting: (columnName: string) =>
        this.getElement().gridSettingMainContainer().locator(".k-list-item").filter({ hasText: columnName }).first(),
      columnRowVisibilityToggle: (columnName: string) => this.getElement().columnRowSetting(columnName).locator("[role='switch']").nth(0),
      columnRowFreezeToggle: (columnName: string) => this.getElement().columnRowSetting(columnName).locator("[role='switch']").nth(1),
      columnRowDragIcon: (columnName: string) => this.getElement().columnRowSetting(columnName).locator(".fa-grip-lines").first(),
    };
  }

  getElement() {
    return this.elements();
  }

  async clickSaveChangesButton() {
    await this.getElement().saveChangesButton().click();
  }

  async clickCancelButton() {
    await this.getElement().cancelButton().click();
  }

  async clickCloseButton() {
    await this.getElement().closeButton().click();
  }

  async showColumn(columnName: string) {
    if ((await this.getElement().columnRowVisibilityToggle(columnName).getAttribute("aria-checked")) === "false") {
      await this.getElement().columnRowVisibilityToggle(columnName).click();
    }
    await this.clickSaveChangesButton();
  }

  async hideColumn(columnName: string) {
    if ((await this.getElement().columnRowVisibilityToggle(columnName).getAttribute("aria-checked")) === "true") {
      await this.getElement().columnRowVisibilityToggle(columnName).click();
    }
    await this.clickSaveChangesButton();
  }

  async freezeColumn(columnName: string) {
    if ((await this.getElement().columnRowFreezeToggle(columnName).getAttribute("aria-checked")) === "false") {
      await this.getElement().columnRowFreezeToggle(columnName).click();
    }
    await this.clickSaveChangesButton();
  }

  async unfreezeColumn(columnName: string) {
    if ((await this.getElement().columnRowFreezeToggle(columnName).getAttribute("aria-checked")) === "true") {
      await this.getElement().columnRowFreezeToggle(columnName).click();
    }
    await this.clickSaveChangesButton();
  }

  async restoreDefaultSettings() {
    await this.getElement().restoreDefaulSettingsButton().scrollIntoViewIfNeeded();
    await this.getElement().restoreDefaulSettingsButton().click();
    await this.clickSaveChangesButton();
  }

  async moveColumnToLocationOf(columnName: string, targetColumnName: string) {
    await this.getElement().columnRowDragIcon(columnName).dragTo(this.getElement().columnRowSetting(targetColumnName));
    await this.clickSaveChangesButton();
  }
}

export default GridSetting;
