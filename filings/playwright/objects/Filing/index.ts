import { Page } from "@playwright/test";
import { resolvePage } from "../../pageContext";
import { waitForLoading } from "../../utils/runtime";

class Filing {
  isResumingDraftApplication: boolean;

  constructor(props: { isResumingDraftApplication: boolean }) {
    this.isResumingDraftApplication = props.isResumingDraftApplication;
  }

  private elements(page: Page = resolvePage()) {
    return {
      submitFormsTab: () => page.locator('a[href="/formsApp/ListMunicipalityForms"]'),
      governmentSelection: () =>
        page.locator('input[placeholder="Search government and press enter …"]'),
      formList: () => page.locator('ul[data-cy="ListForms"]'),
      formLinkItem: (formName: string) =>
        page.locator('ul[data-cy="ListForms"] li').filter({ hasText: formName }).first(),
      anyList: () => page.locator("li"),
      createNewFilingButton: () =>
        page.getByRole("button", { name: "Create a New Filing" }),
      resumeDraftFilingButton: () =>
        page.getByRole("button", { name: "Resume Draft Filing" }),
      businessSelectionDropdown: () =>
        page.locator('*[data-cy="business-dialog-choose-business-comboBox"]'),
      nextButton: () => page.getByRole("button", { name: "Next" }),
      cancelButton: () => page.getByRole("button", { name: "Cancel" }),
    };
  }

  getElements(page: Page = resolvePage()) {
    return this.elements(page);
  }

  async goToSubmitFormsTab(page: Page = resolvePage()) {
    await this.getElements(page).submitFormsTab().click();
    await waitForLoading(page);
  }

  private async startFiling(page: Page = resolvePage()) {
    const modalTitle = page.locator(".k-dialog-titlebar");
    if ((await modalTitle.count()) > 0) {
      const text = await modalTitle.first().innerText();
      if (text.includes("Resume Draft Filing")) {
        if (!this.isResumingDraftApplication) {
          await this.getElements(page).createNewFilingButton().click();
        } else {
          await this.getElements(page).resumeDraftFilingButton().click();
        }
      }
    }
    await waitForLoading(page, 5);
  }

  async selectGovernment(page: Page = resolvePage(), government: string) {
    await this.getElements(page).governmentSelection().click();
    await this.getElements(page).governmentSelection().fill(government);
    await this.getElements(page).anyList().filter({ hasText: government }).first().click();
    await waitForLoading(page);
  }

  async selectForm(page: Page = resolvePage(), formName: string) {
    await this.getElements(page).formLinkItem(formName).click();
  }

  async selectBusinessToFile(page: Page = resolvePage(), businessDba: string) {
    await this.getElements(page).businessSelectionDropdown().click();
    await this.getElements(page).businessSelectionDropdown().fill(businessDba);
    await this.getElements(page).anyList().filter({ hasText: businessDba }).first().click();
    await this.clickNextButton(page);
    await this.startFiling(page);
  }

  async clickNextButton(page: Page = resolvePage()) {
    await this.getElements(page).nextButton().click();
    await waitForLoading(page);
  }

  async clickCancelButton(page: Page = resolvePage()) {
    await this.getElements(page).cancelButton().click();
  }
}

export default Filing;
