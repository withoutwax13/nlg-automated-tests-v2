import { expect, type Page, type Response } from "@playwright/test";
import { clickByText, waitForLoading } from "../../support/native-helpers";

type FilingProps = {
  isResumingDraftApplication?: boolean;
};

const isMethod = (response: Response, method: string) => response.request().method().toUpperCase() === method;

class Filing {
  isResumingDraftApplication: boolean;

  constructor(private readonly page: Page, props: FilingProps = {}) {
    this.isResumingDraftApplication = props.isResumingDraftApplication ?? false;
  }

  private elements() {
    return {
      submitFormsTab: () => this.page.locator('a[href="/formsApp/ListMunicipalityForms"]'),
      governmentSelection: () => this.page.locator('input[placeholder^="Search government"]').first(),
      formList: () => this.page.locator('ul[data-cy="ListForms"]'),
      formLinkItem: (formName: string) => this.page.locator('ul[data-cy="ListForms"] li button').filter({ hasText: formName }).first(),
      modalTitleBar: () => this.page.locator(".k-dialog-titlebar"),
      createNewFilingButton: () => this.page.locator(".NLGButtonSecondary").filter({ hasText: "Create a New Filing" }).first(),
      resumeDraftFilingButton: () => this.page.locator(".NLGButtonPrimary").filter({ hasText: "Resume Draft Filing" }).first(),
      businessSelectionDropdown: () => this.page.locator('*[data-cy="business-dialog-choose-business-comboBox"] input').first(),
      nextButton: () => this.page.locator(".NLGButtonPrimary").filter({ hasText: "Next" }).first(),
      cancelButton: () => this.page.locator(".NLGButtonSecondary").filter({ hasText: "Cancel" }).first(),
      anyList: () => this.page.locator("li"),
    };
  }

  getElements() {
    return this.elements();
  }

  private waitForOptionalResponse(predicate: (response: Response) => boolean, timeout = 10000) {
    return this.page.waitForResponse(predicate, { timeout }).catch(() => null);
  }

  async goToSubmitFormsTab() {
    const loadPromise = this.waitForOptionalResponse(
      (response) => isMethod(response, "GET") && response.url().includes("/filings/draftFilings")
    );
    await this.getElements().submitFormsTab().click({ force: true });
    const response = await loadPromise;
    if (response) expect(response.status()).toBe(200);
    await waitForLoading(this.page, 2);
  }

  private async startFiling() {
    const modal = this.getElements().modalTitleBar().first();
    if (!(await modal.isVisible().catch(() => false))) return;
    const modalText = await modal.textContent();
    if (!modalText?.includes("Resume Draft Filing")) return;

    if (this.isResumingDraftApplication) {
      await this.getElements().resumeDraftFilingButton().click({ force: true });
    } else {
      await this.getElements().createNewFilingButton().click({ force: true });
    }
    await waitForLoading(this.page, 3);
  }

  async selectGovernment(government: string) {
    await this.getElements().governmentSelection().click({ force: true });
    await this.getElements().governmentSelection().fill(government);
    await clickByText(this.getElements().anyList(), government);
    await waitForLoading(this.page, 3);
  }

  async selectForm(formName: string) {
    await this.getElements().formLinkItem(formName).click({ force: true });
    await waitForLoading(this.page, 2);
  }

  async selectBusinessToFile(businessDba: string) {
    const createPromise = this.waitForOptionalResponse(
      (response) => isMethod(response, "POST") && response.url().includes("/filings/")
    );
    await this.getElements().businessSelectionDropdown().click({ force: true });
    await this.getElements().businessSelectionDropdown().fill(businessDba);
    await clickByText(this.getElements().anyList(), businessDba);
    await this.clickNextButton();
    await this.startFiling();
    const response = await createPromise;
    if (response) expect([200, 201]).toContain(response.status());
  }

  async clickNextButton() {
    await this.getElements().nextButton().click({ force: true });
    await waitForLoading(this.page, 2);
  }

  async clickCancelButton() {
    await this.getElements().cancelButton().click({ force: true });
  }
}

export default Filing;
