import { currentPage, listItem, waitForLoading, withText } from "../../support/runtime";

class Filing {
  private elements() {
    const page = currentPage();

    return {
      submitFormsTab: () => page.locator('a[href="/formsApp/ListMunicipalityForms"]'),
      governmentSelection: () =>
        page.locator('input[placeholder="Search government and press enter …"]'),
      formList: () => page.locator('ul[data-cy="ListForms"]'),
      formLinkItem: (formName: string) =>
        page.locator('ul[data-cy="ListForms"] li').filter({ hasText: formName }).first(),
      renewButton: () => withText(page.locator(".k-actions button"), "Renew"),
      submitNewRegistrationButton: () =>
        withText(page.locator(".k-actions button"), "Submit New Registration"),
      renewChipListSelection: () => page.locator(".k-input-values input"),
      renewAddBusinessButton: () => page.locator(".NLG-Hyperlink").filter({ hasText: "Add a Business" }).first(),
      renewNextButton: () => page.locator(".NLGPrimaryButton").filter({ hasText: "Next" }).first(),
      renewCancelButton: () => page.locator(".NLGSecondaryButton").filter({ hasText: "Cancel" }).first(),
      createNewApplicationButton: () =>
        page.locator(".NLGButtonSecondary").filter({ hasText: "Create a New Application" }).first(),
      cannotFindBusinessButton: () =>
        page.locator(".NLGButtonSecondary").filter({ hasText: "I can't find my business" }).first(),
    };
  }

  getElements() {
    return this.elements();
  }

  async goToSubmitFormsTab() {
    await this.getElements().submitFormsTab().click({ force: true });
    await waitForLoading();
  }

  private async createNewApplication() {
    const modal = currentPage().locator(".k-dialog-titlebar");
    if ((await modal.count()) > 0 && ((await modal.first().textContent()) || "").includes("Resume Draft Application")) {
      await this.getElements().createNewApplicationButton().click({ force: true });
    }
  }

  async selectGovernment(government: string) {
    await this.getElements().governmentSelection().click({ force: true });
    await this.getElements().governmentSelection().fill(government);
    await listItem(government).click({ force: true });
    await waitForLoading();
  }

  async selectForm(formName: string) {
    await this.getElements().formLinkItem(formName).click({ force: true });
    await waitForLoading(10);
  }

  async clickRenewButton() {
    await this.createNewApplication();
    await this.getElements().renewButton().click({ force: true });
  }

  async clickSubmitNewRegistrationButton(isOneTime?: boolean) {
    await this.createNewApplication();
    if (!isOneTime) {
      await this.getElements().submitNewRegistrationButton().click({ force: true });
    }
    await this.getElements().cannotFindBusinessButton().click({ force: true });
    await waitForLoading(30);
  }

  async clickRenewAddBusinessButton() {
    await this.getElements().renewAddBusinessButton().click({ force: true });
  }

  async selectBusinessToRenew(businessDba: string) {
    await this.getElements().renewChipListSelection().click({ force: true });
    await this.getElements().renewChipListSelection().fill(businessDba);
    await listItem(businessDba).click({ force: true });
  }

  async clickRenewNextButton() {
    await this.getElements().renewNextButton().click({ force: true });
  }

  async clickRenewCancelButton() {
    await this.getElements().renewCancelButton().click({ force: true });
  }
}

export default Filing;
