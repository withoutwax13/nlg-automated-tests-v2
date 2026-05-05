class BusinessUpload {
  userType: string;
  constructor(props: { userType: string }) {
    this.userType = props.userType;
  }

  private elements() {
    return {
      governmentDropdown: () => pw.get(".k-combobox").find("input"),
      anyList: () => pw.get("li"),
      fileUploadInput: () => pw.get("#files"),
      nextButton: () => pw.get("button").contains("Next"),
    };
  }

  getElement() {
    return this.elements();
  }
}

export default BusinessUpload;