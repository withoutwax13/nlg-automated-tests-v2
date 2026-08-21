import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import ExportModal from "../../objects/ExportModal";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user, I should be able to export business list with Export View as Excel file", () => {
  test("As a municipal user, I should be able to export business list with Export View as Excel file", { tag: ["@slot-05", "@municipal"] }, async ({ page, resourceSlot }) => {
    const exportModal = new ExportModal(page);
    await Login.login(page, resourceSlot, { accountType: "municipal" });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickExportButton();
    await exportModal.clickExcelOption();
    await exportModal.clickExportViewOption();
    await exportModal.clickExportWithoutUsersInfoOption();
    await exportModal.clickExportButton();
  });
});
