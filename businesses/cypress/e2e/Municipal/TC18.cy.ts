import BusinessGrid from "../../objects/BusinessGrid";
import ExportModal from "../../objects/ExportModal";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const exportModal = new ExportModal();

describe("As a municipal user, I should be able to export business list with Export view as CSV file", () => {
  it("Initiating test", () => {
    cy.login({ accountType: "municipal", accountIndex: 1 });
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickExportButton();
    exportModal.clickCsvOption();
    exportModal.clickExportViewOption();
    exportModal.clickExportWithoutUsersInfoOption();
    exportModal.clickExportButton();
  });
});
