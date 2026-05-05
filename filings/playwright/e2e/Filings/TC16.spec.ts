import { test, expect } from '@playwright/test';
import FilingGrid from "../../objects/FilingGrid";
import RequestedExtracts from "../../objects/RequestedExtracts";

const municipalFilingGrid = new FilingGrid({
  userType: "municipal",
});
const requestedExtractPage = new RequestedExtracts();

test.describe("As a municipal user, I should be able to export full filing data.", () => {
  test("Initiate test", () => {
    cy.login({ accountType: "municipal", accountIndex: 2 });
    municipalFilingGrid.init();
    municipalFilingGrid.clickViewRequestedExtractButton();
    requestedExtractPage.getTotalItems("preClickItemTotal");

    municipalFilingGrid.init();
    municipalFilingGrid.clickExportButton(true, "Excel");
    municipalFilingGrid.clickViewRequestedExtractButton();
    requestedExtractPage.getTotalItems("postClickItemTotal");
    cy.get("@preClickItemTotal").then((preClickItemTotal) => {
      cy.get("@postClickItemTotal").then((postClickItemTotal) => {
        expect(Number(postClickItemTotal)).to.be.greaterThan(
          Number(preClickItemTotal)
        );
      });
    });
  });
});
