import type { Page } from "@playwright/test";

class GridSetting {
  constructor(
    private readonly page: Page,
    props: {
      columnOrderAlias: string;
      visibilityStatusAlias: string;
    }
  ) {
    this.columnOrderAlias = props.columnOrderAlias;
    this.visibilityStatusAlias = props.visibilityStatusAlias;
  }

  columnOrderAlias: string;
  visibilityStatusAlias: string;

  private elements() {
    const modal = this.page.locator(".k-dialog");
    const main = this.page.locator(".NLG-GridSettings");

    return {
      modal: () => modal,
      modalTitle: () => modal.locator(".k-dialog-title"),
      closeButton: () => modal.locator('[aria-label="Close"]'),
      buttonGroup: () => modal.locator(".k-dialog-actions"),
      cancelButton: () => modal.getByRole("button", { name: "Cancel" }),
      saveChangesButton: () => modal.getByRole("button", { name: "Save Changes" }),
      gridSettingMainContainer: () => main,
      restoreDefaulSettingsButton: () =>
        main.getByRole("button", { name: "Restore Default Settings" }),
      columnRowSetting: (columnName: string) =>
        main.locator(".k-list-item").filter({ hasText: columnName }).first(),
      columnRowVisibilityToggle: (columnName: string) =>
        this.getElement().columnRowSetting(columnName).locator("[role='switch']").nth(0),
      columnRowFreezeToggle: (columnName: string) =>
        this.getElement().columnRowSetting(columnName).locator("[role='switch']").nth(1),
      columnRowDragIcon: (columnName: string) =>
        this.getElement().columnRowSetting(columnName).locator(".fa-grip-lines"),
    };
  }

  getElement() {
    return this.elements();
  }

  clickSaveChangesButton(): Promise<void> {
    return this.getElement().saveChangesButton().click();
  }

  clickCancelButton(): Promise<void> {
    return this.getElement().cancelButton().click();
  }

  clickCloseButton(): Promise<void> {
    return this.getElement().closeButton().click();
  }

  async showColumn(columnName: string) {
    const toggle = this.getElement().columnRowVisibilityToggle(columnName);
    if ((await toggle.getAttribute("aria-checked")) === "false") {
      await toggle.click();
    }
    await this.clickSaveChangesButton();
  }

  async hideColumn(columnName: string) {
    const toggle = this.getElement().columnRowVisibilityToggle(columnName);
    if ((await toggle.getAttribute("aria-checked")) === "true") {
      await toggle.click();
    }
    await this.clickSaveChangesButton();
  }

  async freezeColumn(columnName: string) {
    const toggle = this.getElement().columnRowFreezeToggle(columnName);
    if ((await toggle.getAttribute("aria-checked")) === "false") {
      await toggle.click();
    }
    await this.clickSaveChangesButton();
  }

  async unfreezeColumn(columnName: string) {
    const toggle = this.getElement().columnRowFreezeToggle(columnName);
    if ((await toggle.getAttribute("aria-checked")) === "true") {
      await toggle.click();
    }
    await this.clickSaveChangesButton();
  }

  async restoreDefaultSettings() {
    await this.getElement().restoreDefaulSettingsButton().scrollIntoViewIfNeeded();
    await this.getElement().restoreDefaulSettingsButton().click();
    await this.clickSaveChangesButton();
  }

  async moveColumnToLocationOf(columnName: string, targetColumnName: string) {
    await this.getElement().columnRowDragIcon(columnName).dragTo(
      this.getElement().columnRowSetting(targetColumnName)
    );
    await this.clickSaveChangesButton();
  }
}

export default GridSetting;
