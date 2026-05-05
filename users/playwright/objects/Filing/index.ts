import { currentPage, listItem, waitForLoading } from "../../support/runtime";

class Filing {
  isResumingDraftApplication: boolean;

  constructor(props: { isResumingDraftApplication: boolean }) {
    this.isResumingDraftApplication = props.isResumingDraftApplication;
  }

  private elements() {
    return {
      submitFormsTab: () => currentPage().locator('a[href="/formsApp/ListMunicipalityForms"]').first(),
      governmentSelection: () =>
        currentPage().locator('input[placeholder="Search government and press enter …"]').first(),
      formList: () => currentPage().locator('ul[data-cy="ListForms"]').first(),
      formLinkItem: (formName: string) =>
        currentPage().locator('ul[data-cy="ListForms"] li').filter({ hasText: formName }).first(),
      closeModalButton: () => currentPage().locator(".k-dialog-titlebar-actions").first(),
      createNewFilingButton: () =>
        currentPage().locator(".NLGButtonSecondary").filter({ hasText: "Create a New Filing" }).first(),
      resumeDraftFilingButton: () =>
        currentPage().locator(".NLGButtonPrimary").filter({ hasText: "Resume Draft Filing" }).first(),
      businessSelectionDropdown: () =>
        currentPage().locator('*[data-cy="business-dialog-choose-business-comboBox"]').first(),
      nextButton: () => currentPage().locator(".NLGButtonPrimary").filter({ hasText: "Next" }).first(),
      cancelButton: () => currentPage().locator(".NLGButtonSecondary").filter({ hasText: "Cancel" }).first(),
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
    const modalTitle = currentPage().locator(".k-dialog-titlebar").first();
    if (!(await modalTitle.isVisible().catch(() => false))) {
      return;
    }

    const text = (await modalTitle.textContent()) || "";
    if (!text.includes("Resume Draft Filing")) {
      return;
    }

    if (!this.isResumingDraftApplication) {
      await this.getElements().createNewFilingButton().click();
      return;
    }

    await this.getElements().resumeDraftFilingButton().click();
  }

  async selectGovernment(government: string) {
    await this.getElements().governmentSelection().click();
    await this.getElements().governmentSelection().fill(government);
    await listItem(government).click();
  }

  async selectForm(formName: string) {
    await this.getElements().formLinkItem(formName).click();
  }

  async selectBusinessToFile(businessDba: string) {
    await this.getElements().businessSelectionDropdown().click();
    await this.getElements().businessSelectionDropdown().fill(businessDba);
    await listItem(businessDba).click();
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
}

export default Filing;
