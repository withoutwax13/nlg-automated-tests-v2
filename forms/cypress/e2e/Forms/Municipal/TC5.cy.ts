import FormGrid from "../../../objects/FormGrid";

const municipalFormGrid = new FormGrid({ userType: "municipal" });

describe("As a municipal user, I should be able to export forms.", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "municipal", accountIndex: 1 });
    municipalFormGrid.init();
    municipalFormGrid.toggleActionButton(
      "filter",
      "Preview",
      "Form Title",
      "Business License (Annual) - E2E #1"
    );
  });
});
