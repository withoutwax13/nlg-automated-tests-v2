import { test, expect } from '../../support/pwtest';
import FormGrid from "../../objects/FormGrid";
import { deleteDownloadsFolder } from "../../utils/Files";

test.describe("As municipal user, exported file's approval data should match the grid", () => {
  test("Initiate test", () => {
    const columnName = "Approval";
    const columnDataAlias = "approvalList";
    const formGrid = new FormGrid({ userType: "municipal" });
    cy.login({ accountType: "municipal" });
    formGrid.init();
    formGrid.getArrayDataOfColumn(columnName, columnDataAlias);
    formGrid.clickExportButton();

    const today = new Date();
    const month = today.toLocaleString("default", { month: "short" });
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    const fileName = `Localgov-Forms-Export-${month}-${day}-${year}.xlsx`;
    const downloadedFilePath = `cypress/downloads/${fileName}`;

    cy.readXlsx(downloadedFilePath).then((excelData) => {
      cy.get(`@${columnDataAlias}`).then((columnDataAlias) => {
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
