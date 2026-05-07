import { test } from "@playwright/test";
import Login from "../utils/Login";
import {
  addBusinessToTaxpayerAccount,
  clearAllGridFilters,
  clickAddBusinessButton,
  filterGridColumn,
  gridHasNoRecords,
  openTaxpayerBusinessGrid,
  waitForLoading,
} from "../support/native-helpers";

test.describe("Add Business", () => {
  const accounts = [
    "Test Trade Name 98068 1",
    "Test Trade Name 14793 1",
    "Test Trade Name 47910 1",
    "Test Trade Name 48440 1",
    "Arrakis Spice Company 13685",
    "Test Trade Name 50363 1",
    "Arrakis Spice Company 13685",
    "Arrakis Spice Company 13685",
    "Arrakis Spice Company 13685",
    "Arrakis Spice Company 13685",
    "Arrakis Spice Company 13685",
    "Arrakis Spice Company 13685",
    "Test Trade Name 52576 1",
    "Test Trade Name 53191 1",
    "Arrakis Spice Company 13685",
    "Test Trade Name 24916 1",
    "Test Trade Name 25677 1",
    "Arrakis Spice Company 13685",
    "Test Trade Name 26887 1",
    "Arrakis Spice Company 18516",
  ];

  for (let i = 4; i < 10; i++) {
    test(`should add business to taxpayer account index ${i}`, async ({ page }) => {
      await Login.login(page, page, { accountType: "taxpayer", accountIndex: i });
      await openTaxpayerBusinessGrid(page);

      for (const account of accounts) {
        await filterGridColumn(page, {
          columnName: "DBA",
          filterValue: account,
          filterType: "text",
          filterOperation: "Contains",
        });

        if (await gridHasNoRecords(page)) {
          await clickAddBusinessButton(page);
          await addBusinessToTaxpayerAccount(page, account);
          await waitForLoading(page, 5);
        } else {
          await clearAllGridFilters(page);
        }
      }
    });
  }
});