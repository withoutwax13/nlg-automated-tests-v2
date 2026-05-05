import Form from "../Form";

class FormPreview extends Form {
  constructor() {
    super();
  }

  private formPreviewElements() {
    return {
      ...super.getElement(),
      submitButton: () => cy.get(".NLGButtonPrimary").contains(/Go to Payment|Submit/),
      accordion: () => cy.get(".k-expander").eq(0).parent(),
      accordionSteps: () => this.getElement().accordion().find(".k-expander"),
      paymentDetails: () => cy.get("h2").contains("Payment Details").next(),
    };
  }

  getElement() {
    return this.formPreviewElements();
  }

  clickSubmitButton() {
    cy.intercept("PATCH", "https://**.azavargovapps.com/filings/**/submit").as("submitFiling");
    this.getElement().submitButton().should("be.enabled").click();
    cy.wait("@submitFiling").its("response.statusCode").should("eq", 201);
  }

  toggleStepAccordion(stepName: string, toExpand: boolean) {
    const stepIndex = [
      "Instructions",
      "Basic Info",
      "Tax Info",
      "Preparer Info",
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
            this.getElement().accordionSteps().eq(stepIndex).click();
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
            this.getElement().accordionSteps().eq(stepIndex).click();
          }
        });
    }
  }
}

export default FormPreview;
