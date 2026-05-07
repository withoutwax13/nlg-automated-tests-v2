import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import ExportModal from "../../objects/ExportModal";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
const exportModal = new ExportModal();

test.describe("As a municipal user, I should be able to export business list with Export view as CSV file", () => {
  test("Initiating test", async () => {
    await Login.login(page, { accountType: "municipal", accountIndex: 1 });
    municipalBusinessGrid.init();
    municipalBusinessGrid.clickExportButton();
    exportModal.clickCsvOption();
    exportModal.clickExportViewOption();
    exportModal.clickExportWithoutUsersInfoOption();
    exportModal.clickExportButton();
  });
});