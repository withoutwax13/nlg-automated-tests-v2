import Form from "../Form";

class FormPreview extends Form {
  constructor() {
    super({ isRenewal: false });
  }

  private formPreviewElements() {
    return {
      ...super.getElement(),
      submitButton: () => cy.get(".NLGButtonPrimary").contains(/Go to Payment|Submit/),
      accordion: () => cy.get(".k-expander").eq(0).parent(),
      accordionSteps: () => this.getElement().accordion().find(".k-expander"),
      paymentDetails: () => cy.get("h2").contains("Payment Details").next(),
      duplicateRegistrationWarning: () => cy.get("*").contains("Duplicate Registration Detected")
    };
  }

  getElement() {
    return this.formPreviewElements();
  }

  clickSubmitButton() {
    this.getElement().submitButton().should("be.enabled").click( {force: true} );
  }

  toggleStepAccordion(stepName: string, toExpand: boolean) {
    const stepIndex = [
      "Instructions",
      "Basic Info",
      "Location Info",
      "Applicant Info",
    ].indexOf(stepName);
    if (toExpand) {
      this.getElement()
        .accordionSteps()
        .eq(stepIndex)
        .find("div")
        .eq(0)
        .invoke("attr", "aria-expanded")
        .then((expanded) => {
          if (expanded === "false") {
            this.getElement().accordionSteps().eq(stepIndex).click( {force: true} );
          }
        });
    } else {
      this.getElement()
        .accordionSteps()
        .eq(stepIndex)
        .find("div")
        .eq(0)
        .invoke("attr", "aria-expanded")
        .then((expanded) => {
          if (expanded === "true") {
            this.getElement().accordionSteps().eq(stepIndex).click( {force: true} );
          }
        });
    }
  }
}

export default FormPreview;
