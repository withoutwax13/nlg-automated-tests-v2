import { test, expect } from '@playwright/test';
import BusinessGrid from "../../objects/BusinessGrid";

const municipalBusinessGrid = new BusinessGrid({
  userType: "municipal"
});

const randomDate = {
  date: Math.floor(Math.random() * 28) + 1,
};

test.describe("As a municipal user, I should be able to set delinquency start date from the grid", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "municipal" });
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickClearAllFiltersButton();
    municipalBusinessGrid.getDataOfColumn(
      "Delinquency Start Date",
      "DBA",
      "Arrakis Spice Company 13685",
      "beforeDelinquencyStartDate"
    );
    municipalBusinessGrid.clickClearAllFiltersButton();
    municipalBusinessGrid.setDelinquencyStartDate("Arrakis Spice Company 13685", {
      month: 1,
      date: randomDate.date,
      year: 2023,
    });
    municipalBusinessGrid.getElement().toastComponent().should("exist");
    municipalBusinessGrid.clickClearAllFiltersButton();
    municipalBusinessGrid.getDataOfColumn(
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
