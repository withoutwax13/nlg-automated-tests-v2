import { test, expect } from '../../support/pwtest';
import FormGrid from "../../objects/FormGrid";
import { deleteDownloadsFolder } from "../../utils/Files";

test.describe("As municipal user, exported file's filing frequency data should match the grid", () => {
  test("Initiate test", () => {
    const columnName = "Filing Frequency";
    const columnDataAlias = "filingFrequencyList";
    const formGrid = new FormGrid({ userType: "municipal" });
    pw.login({ accountType: "municipal" });
    formGrid.init();
    formGrid.getArrayDataOfColumn(columnName, columnDataAlias);
    formGrid.clickExportButton();

    const today = new Date();
    const month = today.toLocaleString("default", { month: "short" });
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    const fileName = `Localgov-Forms-Export-${month}-${day}-${year}.xlsx`;
    const downloadedFilePath = `playwright/downloads/${fileName}`;

    pw.readXlsx(downloadedFilePath).then((excelData) => {
      pw.get(`@${columnDataAlias}`).then((columnDataAlias) => {
        columnDataAlias.forEach((aliasStringItem) => {
          const found = excelData.some(
            (row) => row[columnName] === aliasStringItem
          );
          expect(found).to.be.true;
        });
      });
    });

    deleteDownloadsFolder();
  });
});
