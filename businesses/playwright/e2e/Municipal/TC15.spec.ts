import { test, expect } from '../../support/pwtest';
import BusinessGrid from "../../objects/BusinessGrid";
import ExportModal from "../../objects/ExportModal";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const exportModal = new ExportModal();

test.describe("As a municipal user, I should be able to export business list with Users info as excel", () => {
  test("Initiating test", () => {
    pw.login({accountType: "municipal"});
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickExportButton();
    exportModal.clickExcelOption();
    exportModal.clickExportWithUsersInfoOption();
    exportModal.clickExportFullOption();
    exportModal.clickExportButton();
  });
});
