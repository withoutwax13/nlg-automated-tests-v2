import { type Page } from "@playwright/test";

class ApplicationDetail {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      pageTitle: () => this.page.locator("h1").first(),
      applicationStatusData: () => this.page.locator("h2").first().locator("xpath=following-sibling::*[1]"),
      registrationTypeAndReferenceIdData: () => this.page.locator("h3").first(),
      addressData: () => this.page.locator("h3").first().locator("xpath=following-sibling::*[1]"),
    };
  }

  getElements() {
    return this.elements();
  }
}

export default ApplicationDetail;
