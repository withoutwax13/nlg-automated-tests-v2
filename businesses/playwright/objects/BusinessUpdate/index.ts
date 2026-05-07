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
