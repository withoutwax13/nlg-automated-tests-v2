import { test, expect } from '../../support/pwtest';
import FormGrid from "../../objects/FormGrid";
import { deleteDownloadsFolder } from "../../utils/Files";

test.describe("As municipal user, exported file's published date data should match the grid", () => {
  test("Initiate test", () => {
    const columnName = "Published Date";
    const columnDataAlias = "publishedDateList";
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
          const excelDateToJSDate = (serial: number) => {
            const excelEpoch = new Date(1899, 11, 30);
            const jsDate = new Date(
              excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000
            );
            return jsDate;
          };
          const formatDateToString = (date: Date) => {
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const year = date.getFullYear();
            return `${month}/${day}/${year}`;
          };
          const formatDate = (dateString, isMonthFirst) => {
            if (isMonthFirst === true) {
              const jsDate = excelDateToJSDate(dateString);
              const formattedDate = formatDateToString(jsDate);
              return formattedDate;
            }
            return dateString;
          };

          const found = excelData.some((row) => {
            const excelDate = formatDate(row[columnName], true);
            const aliasDate = formatDate(aliasStringItem, false);
            return excelDate === aliasDate;
          });

          expect(found).to.be.true;
        });
      });
    });

    deleteDownloadsFolder();
  });
});
