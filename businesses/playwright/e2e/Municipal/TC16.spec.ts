import { test, expect } from '@playwright/test';
import BusinessGrid from "../../objects/BusinessGrid";
import ExportModal from "../../objects/ExportModal";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const exportModal = new ExportModal();

test.describe("As a municipal user, I should be able to export business list with Users info as CSV", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "municipal", accountIndex: 1 });
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickExportButton();
    exportModal.clickCsvOption();
    exportModal.clickExportWithUsersInfoOption();
    exportModal.clickExportFullOption();
    exportModal.clickExportButton();
  });
});
