import { currentPage, waitForLoading, withText } from "../../support/runtime";

class Filing {
  isResumingDraftApplication: boolean;

  constructor(props: { isResumingDraftApplication: boolean }) {
    this.isResumingDraftApplication = props.isResumingDraftApplication;
  }

  private elements() {
    const page = currentPage();
    return {
      submitFormsTab: () => page.locator('a[href="/formsApp/ListMunicipalityForms"]'),
      governmentSelection: () =>
        page.locator('input[placeholder="Search government and press enter …"]'),
      formList: () => page.locator('ul[data-cy="ListForms"]'),
      formLinkItem: (formName: string) =>
        page.locator('ul[data-cy="ListForms"] li').filter({ hasText: formName }).first(),
      modalTitle: () => page.locator("k-dialog-title"),
      closeModalButton: () => page.locator(".k-dialog-titlebar-actions"),
      modalContent: () => page.locator(".k-dialog-content"),
      renewCancelButton: () => withText(page.locator("NLGSecondaryButton"), "Cancel"),
      anyList: () => page.locator("li"),
      createNewFilingButton: () =>
        withText(page.locator(".NLGButtonSecondary"), "Create a New Filing"),
      resumeDraftFilingButton: () =>
        withText(page.locator(".NLGButtonPrimary"), "Resume Draft Filing"),
      businessSelectionDropdown: () =>
        page.locator('*[data-cy="business-dialog-choose-business-comboBox"]'),
      nextButton: () => withText(page.locator(".NLGButtonPrimary"), "Next"),
      cancelButton: () => withText(page.locator(".NLGButtonSecondary"), "Cancel"),
      addBusinessButton: () =>
        withText(page.locator(".NLGButtonSecondaryFlat"), "Add a Business"),
    };
  }

  getElements() {
    return this.elements();
  }

  async goToSubmitFormsTab() {
    await this.getElements().submitFormsTab().click();
    await waitForLoading();
  }

  private async startFiling() {
    const modal = currentPage().locator(".k-dialog-titlebar");
    if ((await modal.count()) === 0) {
      return;
    }

    const modalText = await modal.first().textContent();
    if (!modalText?.includes("Resume Draft Filing")) {
      return;
    }

    if (!this.isResumingDraftApplication) {
      await this.getElements().createNewFilingButton().click();
    } else {
      await this.getElements().resumeDraftFilingButton().click();
    }
  }

  async selectGovernment(government: string) {
    await this.getElements().governmentSelection().click();
    await this.getElements().governmentSelection().fill(government);
    await this.getElements().anyList().filter({ hasText: government }).first().click();
  }

  async selectForm(formName: string) {
    await this.getElements().formLinkItem(formName).click();
  }

  async selectBusinessToFile(businessDba: string) {
    await this.getElements().businessSelectionDropdown().click();
    await this.getElements().businessSelectionDropdown().fill(businessDba);
    await this.getElements().anyList().filter({ hasText: businessDba }).first().click();
    await this.clickNextButton();
    await this.startFiling();
  }

  async clickNextButton() {
    await this.getElements().nextButton().click();
    await waitForLoading();
  }

  async clickCancelButton() {
    await this.getElements().cancelButton().click();
  }

  async clickAddBusinessButton() {
    await this.getElements().addBusinessButton().click();
  }
}

export default Filing;
