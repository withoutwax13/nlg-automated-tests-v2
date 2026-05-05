import { currentPage, labelValue, listItem, waitForLoading } from "../../support/runtime";

export const TAXPAYER_DEFAULT_HOME_PAGE = {
  "Submit Forms": "/formsApp/ListMunicipalityForms",
  Filings: "/filingApp/filingList",
  Applications: "/registrationApp/applicationsList",
  Delinquencies: "/reports/taxpayerDelinquencyReport",
  Notifications: "/NotificationsApp/NotificationsList",
  "My Businesses": "/BusinessesApp/BusinessesList",
};

export const MUNICIPAL_DEFAULT_HOME_PAGE = {
  "Filing List": "/filingApp/filingList",
  Forms: "/formsApp",
  Businesses: "/BusinessesApp/BusinessesList",
  Delinquencies: "/reports/delinquency",
  Transactions: "/reports/transactionsReport",
  Settlements: "/reports/settlementReport",
};

class Profile {
  private elements() {
    return {
      pageTitle: () => currentPage().locator("h1").first(),
      sectionTitle: () => currentPage().locator("h2"),
      firstNameInput: () => currentPage().locator("input").nth(0),
      lastNameInput: () => currentPage().locator("input").nth(1),
      emailInput: () => currentPage().locator("input").nth(2),
      currentEmailAddressData: () =>
        currentPage().locator("label").filter({ hasText: "Current Email Address" }).first().locator("xpath=following-sibling::*[1]").locator("b").first(),
      mfaSwitch: () =>
        currentPage()
          .locator("label")
          .filter({ hasText: "Multi-factor authentication (MFA)" })
          .first()
          .locator("xpath=../following-sibling::*[1]")
          .locator('span[role="switch"]')
          .first(),
      resetPasswordButton: () => currentPage().locator("button").filter({ hasText: "Reset Password" }).first(),
      oldPasswordInput: () => currentPage().locator("#OldPassword").first(),
      newPasswordInput: () => currentPage().locator("#NewPassword").first(),
      confirmPasswordInput: () =>
        currentPage()
          .locator("label")
          .filter({ hasText: "Confirm The New Password" })
          .first()
          .locator("xpath=following-sibling::*[1]")
          .locator("input")
          .first(),
      updatePasswordButton: () => currentPage().locator("button").filter({ hasText: "Update" }).first(),
      cancelUpdatePasswordButton: () => currentPage().locator("button").filter({ hasText: "Cancel" }).first(),
      savedBankAccountsAccordion: () =>
        currentPage().locator(".k-expander-header").filter({ hasText: "Saved Bank Accounts" }).first(),
      savedCreditDebitCardsAccordion: () =>
        currentPage().locator(".k-expander-header").filter({ hasText: "Saved Credit/Debit Cards" }).first(),
      savedBankAccountItems: () =>
        currentPage().locator(".k-expander-content > div").filter({ has: currentPage().locator("a").filter({ hasText: "Delete" }) }),
      savedCreditDebitCardItems: () =>
        currentPage().locator(".k-expander-content > div").filter({ has: currentPage().locator("a").filter({ hasText: "Delete" }) }),
      savedBankAccountItem: (order: number) => currentPage().locator(".k-expander-content > div").nth(order),
      savedCreditDebitCardItem: (order: number) => currentPage().locator(".k-expander-content > div").nth(order),
      deleteBankAccountItem: (order: number) =>
        currentPage().locator(".k-expander-content > div").nth(order).locator("a").filter({ hasText: "Delete" }).first(),
      deleteCreditDebitCardItem: (order: number) =>
        currentPage().locator(".k-expander-content > div").nth(order).locator("a").filter({ hasText: "Delete" }).first(),
      defaultHomePageDropdown: () => labelValue("Default Home Page"),
      saveChangesButton: () => currentPage().locator("button").filter({ hasText: "Save Changes" }).first(),
      saveDefaultHomePageButton: () => currentPage().locator("button").filter({ hasText: /^Save$/ }).first(),
      defaultHomePageDropdownItems: () => currentPage().locator(".k-list-item"),
      toastComponent: () => currentPage().locator(".Toastify").first(),
    };
  }

  getElement() {
    return this.elements();
  }

  async init() {
    await currentPage().goto("/profile");
    await waitForLoading();
  }

  async deleteSavedPaymentMethod(type: "bank" | "card", order: number) {
    if (type === "bank") {
      await this.getElement().deleteBankAccountItem(order).click();
    } else {
      await this.getElement().deleteCreditDebitCardItem(order).click();
    }
    await waitForLoading();
  }

  async clickResetPassword() {
    await this.getElement().resetPasswordButton().click();
  }

  async typeOldPassword(value: string) {
    await this.getElement().oldPasswordInput().fill(value);
  }

  async typeNewPassword(value: string) {
    await this.getElement().newPasswordInput().fill(value);
  }

  async typeConfirmPassword(value: string) {
    await this.getElement().confirmPasswordInput().fill(value);
  }

  async clickUpdatePasswordButton() {
    await this.getElement().updatePasswordButton().click();
  }

  async clickCancelUpdatePasswordButton() {
    await this.getElement().cancelUpdatePasswordButton().click();
  }

  async typeFirstName(value: string) {
    await this.getElement().firstNameInput().fill(value);
  }

  async typeLastName(value: string) {
    await this.getElement().lastNameInput().fill(value);
  }

  async typeEmail(value: string) {
    await this.getElement().emailInput().fill(value);
  }

  async toggleMFA() {
    await this.getElement().mfaSwitch().click();
  }

  async clickSavedBankAccountsAccordion() {
    await this.getElement().savedBankAccountsAccordion().click();
  }

  async clickSavedCreditDebitCardsAccordion() {
    await this.getElement().savedCreditDebitCardsAccordion().click();
  }

  async selectDefaultHomePage(value: string) {
    await this.getElement().defaultHomePageDropdown().click();
    await listItem(value).click();
    await waitForLoading();

    const saveButton = this.getElement().saveDefaultHomePageButton();
    if (await saveButton.isVisible().catch(() => false)) {
      await saveButton.click();
    }
  }

  async clickSaveChanges() {
    await this.getElement().saveChangesButton().click();
    await waitForLoading();
  }
}

export default Profile;
