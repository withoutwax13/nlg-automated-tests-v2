import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import ExportModal from "../../objects/ExportModal";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user, I should be able to export business list with Export view as CSV file", () => {
  test("Initiating test", async ({ page }) => {
    const exportModal = new ExportModal(page);
    await Login.login(page, { accountType: "municipal", accountIndex: 1 });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickExportButton();
    await exportModal.clickCsvOption();
    await exportModal.clickExportViewOption();
    await exportModal.clickExportWithoutUsersInfoOption();
    await exportModal.clickExportButton();
  });
});