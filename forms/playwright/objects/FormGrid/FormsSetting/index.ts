import { collectTexts, currentPage, setAlias, waitForLoading, withText } from "../../../support/runtime";

class FormsSetting {
  private elements() {
    const page = currentPage();
    return {
      saveButton: () => withText(page.locator(".k-actions button"), "Save"),
      cancelButton: () => withText(page.locator(".k-actions button"), "Cancel"),
      municipalityDropdown: () =>
        page.locator('input[placeholder="Search government and press enter …"]'),
      anyList: () => page.locator("li"),
      forms: () => page.locator(".k-list-item"),
      formRowDragIcon: (columnName: string) =>
        withText(page.locator(".k-list-item"), columnName)
          .locator("xpath=..")
          .locator(".fa-grip-lines"),
    };
  }

  getElement() {
    return this.elements();
  }

  async clickSaveButton() {
    await this.getElement().saveButton().click();
  }

  async clickCancelButton() {
    await this.getElement().cancelButton().click();
  }

  async selectMunicipality(municipality: string) {
    await this.getElement().municipalityDropdown().fill(municipality);
    await withText(this.getElement().anyList(), municipality).click();
    await waitForLoading();
  }

  async saveFormOrders(aliasName: string) {
    setAlias(aliasName, await collectTexts(this.getElement().forms()));
  }

  async moveFormToLocationOf(formName: string, targetFormName: string) {
    await this.getElement()
      .formRowDragIcon(formName)
      .dragTo(this.getElement().formRowDragIcon(targetFormName));
  }
}

export default FormsSetting;
