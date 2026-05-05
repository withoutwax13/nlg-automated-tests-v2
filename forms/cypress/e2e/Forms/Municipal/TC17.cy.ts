import FormGrid from "../../../objects/FormGrid";
import Form from "../../../objects/Form";

const municipalFormsGrid = new FormGrid({ userType: "municipal" });
const previewForm = new Form();

const stepperNameShouldBeCurrent = (stepperName) => {
  previewForm
    .getElement()
    .getStepper(stepperName)
    .invoke("attr", "aria-current")
    .should("eq", "true");
};

describe("As an muinicipal user, I want to be able to navigate the form pages without validation", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "municipal", accountIndex: 2 });
    municipalFormsGrid.init();
    cy.stubNewWindow("previewFormWindow");
    municipalFormsGrid.toggleActionButton(
      "filter",
      "Preview",
      "Form Title",
      "Food and Beverage Tax Return (Monthly)"
    );
    cy.get("@previewFormWindow").should("be.called");
    cy.url().should("include", "?preview=yes");
    stepperNameShouldBeCurrent("Instructions");
    previewForm.getElement().nextButton().should("be.enabled");
    previewForm.clickNextbutton();
    cy.waitForLoading();
    previewForm.getElement().nextButton().should("be.disabled");
    previewForm.clickSkipRequiredFieldsCheckbox();
    previewForm.getElement().nextButton().should("be.enabled");
    previewForm.getElement().overrideEnabledInfoText().should("be.visible");
    previewForm
      .getElement()
      .overrideEnabledInfoText()
      .should(
        "contain.text",
        "The required fields override is enabled. During this preview, the form will not behave the same as it would for business users."
      );
    stepperNameShouldBeCurrent("Basic Info");
    previewForm.getElement().nextButton().should("be.enabled");
    previewForm.clickNextbutton();
    cy.waitForLoading();
    stepperNameShouldBeCurrent("Tax Info");
    previewForm.getElement().nextButton().should("be.enabled");
    previewForm.clickNextbutton();
    cy.waitForLoading();
    stepperNameShouldBeCurrent("Preparer Info");
    previewForm.getElement().nextButton().should("be.enabled");
    previewForm.clickNextbutton();
    cy.waitForLoading();
    stepperNameShouldBeCurrent("Preview");
  });
});
