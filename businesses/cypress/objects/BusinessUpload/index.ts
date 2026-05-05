class BusinessUpload {
  userType: string;
  constructor(props: { userType: string }) {
    this.userType = props.userType;
  }

  private elements() {
    return {
      governmentDropdown: () => cy.get(".k-combobox").find("input"),
      anyList: () => cy.get("li"),
      fileUploadInput: () => cy.get("#files"),
      nextButton: () => cy.get("button").contains("Next"),
    };
  }

  getElement() {
    return this.elements();
  }
}

export default BusinessUpload;