import type { Page } from "@playwright/test";
import { clickByText } from "../../support/native-helpers";

class BusinessUpload {
  userType: string;
  private page!: Page;
  constructor(props: { userType: string }) { this.userType = props.userType; }
  async init(page: Page) { this.page = page; }
  private elements() {
    return {
      governmentDropdown: () => this.page.locator(".k-combobox input").first(),
      anyList: () => this.page.locator("li"),
      fileUploadInput: () => this.page.locator("#files"),
      nextButton: () => this.page.getByRole("button", { name: "Next" }),
    };
  }
  getElement() { return this.elements(); }
  async selectGovernment(government: string) { await this.getElement().governmentDropdown().fill(government); await clickByText(this.getElement().anyList(), government); }
  async uploadFile(filePath: string) { await this.getElement().fileUploadInput().setInputFiles(filePath); }
  async clickNextButton() { await this.getElement().nextButton().click(); }
}

export default BusinessUpload;
