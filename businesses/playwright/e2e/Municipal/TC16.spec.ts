import { test, expect } from "@playwright/test";

import BusinessGrid from "../../objects/BusinessGrid";
import ExportModal from "../../objects/ExportModal";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user, I should be able to export business list with Users info as CSV", () => {
  test("Initiating test", async ({ page }) => {
    const exportModal = new ExportModal(page);
    await Login.login(page, { accountType: "municipal", accountIndex: 1 });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickExportButton();
    await exportModal.clickCsvOption();
    await exportModal.clickExportWithUsersInfoOption();
    await exportModal.clickExportFullOption();
    await exportModal.clickExportButton();
  });
});