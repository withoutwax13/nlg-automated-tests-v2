import { test, expect } from '../../support/pwtest';
import FormGrid from "../../objects/FormGrid";
import { deleteDownloadsFolder } from "../../utils/Files";

test.describe("As municipal user, exported file should match the filtered grid's row items", () => {
  test("Initiate test", () => {
    const formGrid = new FormGrid({ userType: "municipal" });
    pw.login({ accountType: "municipal" });
    formGrid.init();
    formGrid.filterColumn("Form Title", "Annual");
    formGrid.getTotalItems("rowLength");
    formGrid.clickExportButton();

    const today = new Date();
    const month = today.toLocaleString("default", { month: "short" });
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    const fileName = `Localgov-Forms-Export-${month}-${day}-${year}.xlsx`;
    const downloadedFilePath = `playwright/downloads/${fileName}`;

    pw.readXlsx(downloadedFilePath).then((excelData) => {
      // Perform assertions on excelData
      pw.get("@rowLength").then((rowLength) => {
        expect(excelData.length).to.equal(rowLength);
      });
    });

    deleteDownloadsFolder();
  });
});
