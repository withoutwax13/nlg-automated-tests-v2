import { buttonByText, currentPage, listItem } from "../../helpers/legacy-helpers";

class BusinessUpload {
  userType: string;

  constructor(props: { userType: string }) {
    this.userType = props.userType;
  }

  private page() {
    return currentPage();
  }

  private elements() {
    return {
      governmentDropdown: () => this.page().locator(".k-combobox input").first(),
      anyList: () => this.page().locator("li"),
      fileUploadInput: () => this.page().locator("#files"),
      nextButton: () => buttonByText("Next"),
    };
  }

  getElement() {
    return this.elements();
  }

  async selectGovernment(government: string) {
    await this.getElement().governmentDropdown().fill(government);
    await listItem(government).click();
  }

  async uploadFile(filePath: string) {
    await this.getElement().fileUploadInput().setInputFiles(filePath);
  }

  async clickNextButton() {
    await this.getElement().nextButton().click();
  }
}

export default BusinessUpload;
