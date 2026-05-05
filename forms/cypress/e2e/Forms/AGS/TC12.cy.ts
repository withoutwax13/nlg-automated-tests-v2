import FormGrid from "../../../objects/FormGrid";

const agsFormsGrid = new FormGrid({ userType: "ags" });

describe("As an AGS user, I should be able to navigate to the workflow builder via edit workflow button", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 5 });
    agsFormsGrid.init();
    agsFormsGrid.toggleActionButton(
      "filter",
      "Edit Workflow",
      "Form Title",
      "Business License (Annual) - E2E #1"
    );
    cy.url().should("include", "registrationApp/editWorkflow");
  });
});
