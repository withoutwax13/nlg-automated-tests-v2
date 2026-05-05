import BusinessGrid from "../../objects/BusinessGrid";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

describe("As a municipal user, I should be able to Show only the businesses that are not required to remit taxes for any form in the business list", () => {
  it("Initiating test", () => {
    cy.login({ accountType: "municipal", accountIndex: 7 });
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickClearAllFiltersButton();
    municipalBusinessGrid.filterColumn("Required Forms", "None", "multi-select");
    municipalBusinessGrid.getElement().noRecordFoundComponent().should("not.exist");
  });
});
