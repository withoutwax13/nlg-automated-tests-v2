import { test } from "@playwright/test";
import {
  addDebitCreditCardDetails,
  closeApplicationConfirmation,
  countSavedCreditDebitCards,
  deleteMultipleAgsFilings,
  enterBasicInformation,
  enterPreparerInformation,
  enterTaxInformation,
  filterGridColumn,
  getGridRowCount,
  goToSubmitFormsTab,
  login,
  logout,
  openAgsFilingGrid,
  openProfile,
  proceedToPayment,
  savePaymentMethodAndFinishPayment,
  selectBusinessToFile,
  selectForm,
  selectGovernment,
} from "../support/native-helpers";

test.describe(
  "As a Taxpayer user, I should be able to save and delete credit/debit cards information",
  () => {
    for (let i = 0; i < 10; i++) {
      test(`Initiating test for account ${i}`, async ({ page }) => {
        await login(page, { accountType: "ags" });
        await openAgsFilingGrid(page, "City of Arrakis");

        await filterGridColumn(page, {
          columnName: "Location DBA",
          filterValue: "Test Trade Name 98068 1",
          filterType: "text",
          filterOperation: "Contains",
        });

        await filterGridColumn(page, {
          columnName: "Form Name",
          filterValue: "Food and Beverage",
          filterType: "multi-select",
        });

        const rowsLength = await getGridRowCount(page);
        if (rowsLength > 0) {
          await deleteMultipleAgsFilings(page, rowsLength);
        }

        await logout(page);

        await login(page, {
          accountType: "taxpayer",
          accountIndex: i,
          notFirstLogin: true,
        });

        await goToSubmitFormsTab(page);
        await selectGovernment(page, "City of Arrakis");
        await selectForm(page, "Food and Beverage");
        await selectBusinessToFile(page, "Test Trade Name 98068 1");

        await page.locator(".NLGButtonPrimary").filter({ hasText: "Next" }).first().click();
        await enterBasicInformation(page);
        await page.locator(".NLGButtonPrimary").filter({ hasText: "Next" }).first().click();
        await enterTaxInformation(page);
        await page.locator(".NLGButtonPrimary").filter({ hasText: "Next" }).first().click();
        await enterPreparerInformation(page);
        await page.locator(".NLGButtonPrimary").filter({ hasText: "Next" }).first().click();

        await proceedToPayment(page);
        await addDebitCreditCardDetails(page);
        await savePaymentMethodAndFinishPayment(page);
        await closeApplicationConfirmation(page);

        await openProfile(page);
        const savedCreditDebitCardItems = await countSavedCreditDebitCards(page);
        void savedCreditDebitCardItems;
      });
    }
  }
);
