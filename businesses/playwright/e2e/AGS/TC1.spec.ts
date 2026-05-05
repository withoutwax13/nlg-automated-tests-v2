import { test, expect } from '../../support/pwtest';
import BusinessGrid from "../../objects/BusinessGrid";

const agsBusinessGrid = new BusinessGrid({
  userType: "ags",
  municipalitySelection: "City of Arrakis",
});

const randomDate = {
  date: Math.floor(Math.random() * 28) + 1,
};

test.describe("As an AGS user, I should be able to set delinquency start date from the grid", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "ags" });
    agsBusinessGrid.init();
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.getDataOfColumn(
      "Delinquency Start Date",
      "DBA",
      "Arrakis Spice Company 13685",
      "beforeDelinquencyStartDate"
    );
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.setDelinquencyStartDate("Arrakis Spice Company 13685", {
      month: 1,
      date: randomDate.date,
      year: 2023,
    });
    agsBusinessGrid.getElement().toastComponent().should("exist");
    agsBusinessGrid.clickClearAllFiltersButton();
    agsBusinessGrid.getDataOfColumn(
      "Delinquency Start Date",
      "DBA",
      "Arrakis Spice Company 13685",
      "afterDelinquencyStartDate"
    );
    cy.get("@beforeDelinquencyStartDate").then((beforeDelinquencyStartDate) => {
      cy.get("@afterDelinquencyStartDate").then((afterDelinquencyStartDate) => {
        expect(beforeDelinquencyStartDate).to.be.not.equal(
          afterDelinquencyStartDate
        );
      });
    });
  });
});
