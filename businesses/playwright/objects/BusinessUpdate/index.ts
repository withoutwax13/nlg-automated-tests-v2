import { Page } from "@playwright/test";
import BusinessAdd from "../BusinessAdd";

class BusinessUpdate extends BusinessAdd {
  userType: string;
  constructor(pageOrProps: Page | { userType: string }, maybeProps?: { userType: string }) {
    const hasPage = typeof (pageOrProps as Page).locator === "function";
    const props = (hasPage ? maybeProps : pageOrProps) as { userType: string };
    super({ userType: props.userType });
    this.userType = props.userType;
    if (hasPage) this.page = pageOrProps as Page;
  }

  async deleteCustomField(customName: string) {
    if (this.userType === "taxpayer") {
      throw new Error("Taxpayer cannot proceed with this user flow.");
    }
    await this
      .getElement()
      .customFieldBlocks()
      .filter({ hasText: customName })
      .first()
      .locator("button, .fa-trash, .fa-xmark")
      .first()
      .click();
  }
}

export default BusinessUpdate;
