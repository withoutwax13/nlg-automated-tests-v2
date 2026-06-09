import { expect, type Locator, type Page, type Response } from "@playwright/test";
import { clickByText, waitForLoading } from "../../support/native-helpers";

const isGet = (response: Response) => response.request().method() === "GET";
const isPost = (response: Response) => response.request().method() === "POST";
const isDelete = (response: Response) => response.request().method() === "DELETE";

class Filing {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      submitFormsTab: () => this.page.locator('a[href="/formsApp/ListMunicipalityForms"]'),
      governmentSelection: () => this.page.locator('input[placeholder^="Search government"]').first(),
      formList: () => this.page.locator('ul[data-cy="ListForms"]'),
      formLinkItem: (formName: string) => this.page.locator('ul[data-cy="ListForms"] li button').filter({ hasText: formName }).first(),
      modalTitleBar: () => this.page.locator(".k-dialog-titlebar"),
      renewButton: () => this.page.locator(".k-actions button").filter({ hasText: "Renew" }).first(),
      submitNewRegistrationButton: () => this.page.locator(".k-actions button").filter({ hasText: "Submit New Registration" }).first(),
      renewChipListSelection: () => this.page.locator(".k-input-values input").first(),
      renewAddBusinessButton: () => this.page.locator(".NLG-Hyperlink").filter({ hasText: "Add a Business" }).first(),
      renewNextButton: () => this.page.locator(".NLGPrimaryButton").filter({ hasText: "Next" }).first(),
      renewCancelButton: () => this.page.locator(".NLGSecondaryButton").filter({ hasText: "Cancel" }).first(),
      anyList: () => this.page.locator("li"),
      createNewApplicationButton: () => this.page.locator(".NLGButtonSecondary").filter({ hasText: "Create a New Application" }).first(),
      cannotFindBusinessButton: () => this.page.locator(".NLGButtonSecondary").filter({ hasText: "I can't find my business" }).first(),
    };
  }

  getElements() {
    return this.elements();
  }

  private waitForOptionalResponse(predicate: (response: Response) => boolean, timeout = 10000) {
    return this.page.waitForResponse(predicate, { timeout }).catch(() => null);
  }

  async goToSubmitFormsTab() {
    const businessesPromise = this.waitForOptionalResponse(
      (response) => isGet(response) && response.url().includes("/businesses/taxpayerBusinesses?munId=")
    );
    await this.getElements().submitFormsTab().click({ force: true });
    const response = await businessesPromise;
    if (response) expect(response.status()).toBe(200);
    await waitForLoading(this.page);
  }

  private async createNewApplication() {
    const modal = this.getElements().modalTitleBar().first();
    if (!(await modal.isVisible().catch(() => false))) return;
    const modalText = await modal.textContent();
    if (!modalText?.includes("Resume Draft Application")) return;

    const deleteDraft = this.waitForOptionalResponse(
      (response) => isDelete(response) && response.url().includes("/filings/") && response.url().includes("/delete")
    );
    await this.getElements().createNewApplicationButton().click({ force: true });
    const response = await deleteDraft;
    if (response) expect(response.status()).not.toBe(404);
  }

  async selectGovernment(government: string) {
    await this.getElements().governmentSelection().click({ force: true });
    await this.getElements().governmentSelection().fill(government);
    await clickByText(this.getElements().anyList(), government);
    await waitForLoading(this.page);
  }

  async selectForm(formName: string) {
    await this.getElements().formLinkItem(formName).click({ force: true });
    await waitForLoading(this.page, 10);
  }

  async clickRenewButton() {
    await this.createNewApplication();
    await this.getElements().renewButton().click({ force: true });
  }

  async clickSubmitNewRegistrationButton(isOneTime?: boolean) {
    await this.createNewApplication();
    const postNewFiling = this.waitForOptionalResponse(
      (response) => isPost(response) && response.url().includes("/filings/")
    );

    if (!isOneTime) {
      await this.getElements().submitNewRegistrationButton().click({ force: true });
    }

    await this.getElements().cannotFindBusinessButton().click({ force: true });
    const response = await postNewFiling;
    if (response) expect([200, 201]).toContain(response.status());
    await waitForLoading(this.page, 5);
  }

  async clickRenewAddBusinessButton() {
    await this.getElements().renewAddBusinessButton().click({ force: true });
  }

  async selectBusinessToRenew(businessDba: string) {
    await this.getElements().renewChipListSelection().click({ force: true });
    await this.getElements().renewChipListSelection().fill(businessDba);
    await clickByText(this.getElements().anyList(), businessDba);
  }

  async clickRenewNextButton() {
    await this.getElements().renewNextButton().click({ force: true });
  }

  async clickRenewCancelButton() {
    await this.getElements().renewCancelButton().click({ force: true });
  }
}

export default Filing;
