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

test.describe("As municipal user, exported file's filing frequency data should match the grid", () => {
  test("Initiate test", async ({ page }) => {
    const columnName = "Filing Frequency";
    const formGrid = new FormGrid(page, { userType: "municipal" });
    await Login.login(page, page, { accountType: "municipal" });
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
      const found = excelData.some((row) => row[columnName] === columnValue);
      expect(found).toBe(true);
    }

    deleteDownloadsFolder();
  });
});