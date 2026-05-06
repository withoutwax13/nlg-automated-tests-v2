import BusinessAdd from "../BusinessAdd";

class BusinessUpdate extends BusinessAdd {
  userType: string;
  constructor(props: { userType: string }) {
    super({ userType: props.userType });
    this.userType = props.userType;
  }

  async deleteCustomField(customName: string) {
    if (this.userType === "taxpayer") {
      throw new Error("Taxpayer cannot proceed with this user flow.");
    }

    const page = (await import("../../support/runtime")).currentPage();
    const block = page.locator(".custom-field-block").filter({ hasText: customName }).first();
    await block.locator("button, [role='button']").last().click({ force: true });
  }
}

export default BusinessUpdate;
