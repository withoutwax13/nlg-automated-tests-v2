import { attrOf, currentPage, getAlias, setAlias, waitForLoading, withText } from "../../support/runtime";

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
    const modal = currentPage().locator(".k-dialog");
    const gridSettings = currentPage().locator(".NLG-GridSettings");
    return {
      modal: () => modal,
      modalTitle: () => modal.locator(".k-dialog-title"),
      closeButton: () => modal.locator('[aria-label="Close"]'),
      buttonGroup: () => modal.locator(".k-dialog-actions"),
      cancelButton: () => withText(modal.locator("button"), "Cancel"),
      saveChangesButton: () => withText(modal.locator("button"), "Save Changes"),
      gridSettingMainContainer: () => gridSettings,
      restoreDefaulSettingsButton: () =>
        withText(gridSettings.locator("button"), "Restore Default Settings"),
      columnRowSetting: (columnName: string) =>
        withText(gridSettings.locator(".k-list-item"), columnName).locator("xpath=.."),
      columnRowVisibilityToggle: (columnName: string) =>
        withText(gridSettings.locator(".k-list-item"), columnName)
          .locator("xpath=..")
          .locator("[role='switch']")
          .nth(0),
      columnRowFreezeToggle: (columnName: string) =>
        withText(gridSettings.locator(".k-list-item"), columnName)
          .locator("xpath=..")
          .locator("[role='switch']")
          .nth(1),
      columnRowDragIcon: (columnName: string) =>
        withText(gridSettings.locator(".k-list-item"), columnName)
          .locator("xpath=..")
          .locator(".fa-grip-lines"),
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
    const checked = await attrOf(
      this.getElement().columnRowVisibilityToggle(columnName),
      "aria-checked"
    );
    if (checked === "false") {
      await this.getElement().columnRowVisibilityToggle(columnName).click();
      const visibilityStatus = getAlias<Record<string, boolean>>(
        this.visibilityStatusAlias
      );
      setAlias(this.visibilityStatusAlias, {
        ...visibilityStatus,
        [columnName]: true,
      });
    }
    await this.clickSaveChangesButton();
  }

  async hideColumn(columnName: string) {
    const checked = await attrOf(
      this.getElement().columnRowVisibilityToggle(columnName),
      "aria-checked"
    );
    if (checked === "true") {
      await this.getElement().columnRowVisibilityToggle(columnName).click();
      const visibilityStatus = getAlias<Record<string, boolean>>(
        this.visibilityStatusAlias
      );
      setAlias(this.visibilityStatusAlias, {
        ...visibilityStatus,
        [columnName]: false,
      });
    }
    await this.clickSaveChangesButton();
  }

  async freezeColumn(columnName: string) {
    const checked = await attrOf(
      this.getElement().columnRowFreezeToggle(columnName),
      "aria-checked"
    );
    if (checked === "false") {
      await this.getElement().columnRowFreezeToggle(columnName).click();
    }
    await this.clickSaveChangesButton();
  }

  async unfreezeColumn(columnName: string) {
    const checked = await attrOf(
      this.getElement().columnRowFreezeToggle(columnName),
      "aria-checked"
    );
    if (checked === "true") {
      await this.getElement().columnRowFreezeToggle(columnName).click();
    }
    await this.clickSaveChangesButton();
  }

  async restoreDefaultSettings() {
    await this.getElement().restoreDefaulSettingsButton().scrollIntoViewIfNeeded();
    await this.getElement().restoreDefaulSettingsButton().click();
    await this.clickSaveChangesButton();
    await waitForLoading();
  }

  async moveColumnToLocationOf(columnName: string, targetColumnName: string) {
    await this.getElement()
      .columnRowDragIcon(columnName)
      .dragTo(this.getElement().columnRowSetting(targetColumnName));
    await this.clickSaveChangesButton();
    await waitForLoading();
  }
}

export default GridSetting;
