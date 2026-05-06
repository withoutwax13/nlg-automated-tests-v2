import { expect, test } from "@playwright/test";
import path from "path";
import FormGrid from "../../objects/FormGrid";
import {
  deleteDownloadsFolder,
  ensureDownloadsFolder,
  getDownloadsFolder,
} from "../../utils/Files";
import { login, readXlsx } from "../../support/native-helpers";
import Login from "../../utils/Login";

const excelDateToJSDate = (serial: number) => {
  const excelEpoch = new Date(1899, 11, 30);
  return new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
};

const formatDateToString = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const formatDate = (value: string | number, isExcelDate: boolean) => {
  if (isExcelDate && typeof value === "number") {
    return formatDateToString(excelDateToJSDate(value));
  }

  return String(value);
};

test.describe("As municipal user, exported file's published date data should match the grid", () => {
  test("Initiate test", async ({ page }) => {
    const columnName = "Published Date";
    const formGrid = new FormGrid(page, { userType: "municipal" });
    await Login.login(page, { accountType: "municipal" });
    await formGrid.init();
    const columnValues = await formGrid.getArrayDataOfColumn(columnName);

    ensureDownloadsFolder();
    const downloadPromise = page.waitForEvent("download");
    await formGrid.clickExportButton();
    const download = await downloadPromise;

    const today = new Date();
    const month = today.toLocaleString("default", { month: "short" });
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    const fileName = `Localgov-Forms-Export-${month}-${day}-${year}.xlsx`;
    const downloadedFilePath = path.join(getDownloadsFolder(), fileName);

    await download.saveAs(downloadedFilePath);

    const excelData = readXlsx(downloadedFilePath);
    for (const columnValue of columnValues) {
      const found = excelData.some((row) => {
        const excelDate = formatDate(row[columnName] ?? "", true);
        const gridDate = formatDate(columnValue, false);
        return excelDate === gridDate;
      });

      expect(found).toBe(true);
    }

    deleteDownloadsFolder();
  });
});