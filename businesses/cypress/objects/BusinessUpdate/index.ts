import BusinessAdd from "../BusinessAdd";

class BusinessUpdate extends BusinessAdd {
  userType: string;
  constructor(props: { userType: string }) {
    super({ userType: props.userType });
    this.userType = props.userType;
  }

  deleteCustomField(customName: string) {
    if (this.userType === "taxpayer") {
      throw new Error("Taxpayer cannot proceed with this user flow.");
    }
    this.getElement()
      .customFieldBlocks()
      .contains(customName)
      .parent()
      .next()
      .click();
  }
}

export default BusinessUpdate;
