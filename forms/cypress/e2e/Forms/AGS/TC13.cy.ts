import FormGrid from "../../../objects/FormGrid";

const agsFormsGrid = new FormGrid({ userType: "ags" });

describe("As an AGS user, I should be able to export a workflow of a specific form", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 6 });
    agsFormsGrid.init();
    agsFormsGrid.toggleActionButton(
      "filter",
      "Export Workflow",
      "Form Title",
      "Business License (Annual) - E2E #1"
    );
  });
});
