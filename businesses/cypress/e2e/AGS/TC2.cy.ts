import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

const randomDate = {
  date: Math.floor(Math.random() * 28) + 1,
};

describe("As an AGS user, I should be able to set close date from the grid", () => {
  it("Initiating test", () => {
    cy.login({ accountType: "ags", accountIndex: 1 });
    agsBusinessGrid.init();
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.getDataOfColumn(
      "Close Date",
      "DBA",
      "Arrakis Spice Company 13857",
      "beforeCloseDate"
    );
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.setCloseDate("Arrakis Spice Company 13857", {
      month: 1,
      date: randomDate.date,
      year: 2029,
    });
    agsBusinessGrid.getElement().toastComponent().should("exist");
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.getDataOfColumn(
      "Close Date",
      "DBA",
      "Arrakis Spice Company 13857",
      "afterCloseDate"
    );
    cy.get("@beforeCloseDate").then((beforeCloseDate) => {
      cy.get("@afterCloseDate").then((afterCloseDate) => {
        expect(beforeCloseDate).to.be.not.equal(
          afterCloseDate
        );
      });
    });
  });
});
