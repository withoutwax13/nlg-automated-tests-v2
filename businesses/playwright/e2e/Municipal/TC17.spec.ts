import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessGrid from "../../objects/BusinessGrid";
import ExportModal from "../../objects/ExportModal";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const exportModal = new ExportModal();

test.describe("As a municipal user, I should be able to export business list with Export View as Excel file", () => {
  test("Initiating test", async () => {
    await Login.login({accountType: "municipal"});
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickExportButton();
    exportModal.clickExcelOption();
    exportModal.clickExportViewOption();
    exportModal.clickExportWithoutUsersInfoOption();
    exportModal.clickExportButton();
  });
});