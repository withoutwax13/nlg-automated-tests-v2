import FormGrid from "../../../objects/FormGrid";

const agsFormGrid = new FormGrid({ userType: "ags" });

describe("As an AGS user, I should be able to open a form draft in form editor.", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "ags", accountIndex: 2 });
    agsFormGrid.init();
    agsFormGrid.filterColumn("Draft Change Type", "None");
    agsFormGrid.getDataOfColumnForNRow(0, "Form Title", "firstRowForm");
    agsFormGrid.getDataOfColumnForNRow(0, "Clients", "firstRowClient");
    agsFormGrid.clickClearAllFiltersButton();
    cy.get("@firstRowForm").then(($firstRowForm) => {
      cy.get("@firstRowClient").then(($firstRowClient) => {
        agsFormGrid.init();
        agsFormGrid.filterColumn(
          "Form Title",
          String($firstRowForm),
          "text",
          "Is equal to"
        );
        agsFormGrid.filterColumn(
          "Clients",
          String($firstRowClient),
          "text",
          "Is equal to"
        );
        agsFormGrid.toggleActionButton(
          "order",
          "Open draft in editor",
          undefined,
          undefined,
          0
        );
      });
    });
  });
});
