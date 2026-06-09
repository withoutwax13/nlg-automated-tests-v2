import { expect, type Page } from "@playwright/test";
import { waitForLoading } from "../../support/native-helpers";

type BusinessDetailsProps = {
  userType: "ags" | "municipal" | "taxpayer";
};

class BusinessDetails {
  constructor(private readonly page: Page, private readonly props: BusinessDetailsProps) {}

  private elements() {
    return {
      sectionTabs: () => this.page.locator("section").first().locator("xpath=following-sibling::*[1]"),
      sectionTabsItems: (tabName: string) => this.page.locator("li, button, a").filter({ hasText: tabName }).first(),
      saveButton: () => this.page.locator(".NLGButtonPrimary, button").filter({ hasText: "Save" }).first(),
      formSectionFormListItem: (formName: string) => this.page.locator("section, div").filter({ hasText: formName }).filter({ has: this.page.locator("input") }).first(),
    };
  }

  getElement() {
    return this.elements();
  }

  async clickFormsTab() {
    await this.getElement().sectionTabsItems("Forms").click({ force: true });
    await waitForLoading(this.page, 2);
  }

  async clickBusinessStatusTab() {
    await this.getElement().sectionTabsItems("Business Status").click({ force: true });
    await waitForLoading(this.page, 2);
  }

  async enableForm(formName: string) {
    if (this.props.userType === "taxpayer") {
      throw new Error("Taxpayer cannot proceed with this user flow.");
    }
    const row = this.getElement().formSectionFormListItem(formName);
    const checkbox = row.locator("input").first();
    const checked = await checkbox.isChecked().catch(() => false);
    if (!checked) {
      const responsePromise = this.page
        .waitForResponse((response) => response.request().method() === "PUT" && response.url().includes("/businesses/municipalityBusiness/update"), { timeout: 15000 })
        .catch(() => null);
      await checkbox.click({ force: true });
      const response = await responsePromise;
      if (response) expect(response.status()).toBe(200);
      await waitForLoading(this.page, 5);
    }
  }
}

export default BusinessDetails;
