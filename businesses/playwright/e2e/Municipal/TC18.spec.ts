import { test, expect } from "../../fixtures/test";

import BusinessGrid from "../../objects/BusinessGrid";
import ExportModal from "../../objects/ExportModal";
import Login from "../../utils/Login";

const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });

test.describe("As a municipal user, I should be able to export business list with Export view as CSV file", () => {
  test("As a municipal user, I should be able to export business list with Export view as CSV file", { tag: ["@slot-06", "@municipal"] }, async ({ page, resourceSlot }) => {
    const exportModal = new ExportModal(page);
    await Login.login(page, resourceSlot, { accountType: "municipal" });
    await municipalBusinessGrid.init(page);
    await municipalBusinessGrid.clickExportButton();
    await exportModal.clickCsvOption();
    await exportModal.clickExportViewOption();
    await exportModal.clickExportWithoutUsersInfoOption();
    await exportModal.clickExportButton();
  });
});
