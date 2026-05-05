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
  "Forms": "/formsApp",
  "Businesses": "/BusinessesApp/BusinessesList",
  "Delinquencies": "/reports/delinquency",
  "Transactions": "/reports/transactionsReport",
  "Settlements": "/reports/settlementReport",
};

class Profile {
  private elements() {
    return {
      pageTitle: () => pw.get("h1"),
      sectionTitle: () => pw.get("h2"),
      firstNameInput: () => pw.get("input").eq(0),
      lastNameInput: () => pw.get("input").eq(1),
      emailInput: () => pw.get("input").eq(2),
      currentEmailAddressData: () =>
        pw.get("label").contains("Current Email Address").next().find("b"),
      mfaSwitch: () =>
        cy
          .get("label")
          .contains("Multi-factor authentication (MFA)")
          .parent()
          .next()
          .find("span[role='switch']"),
      resetPasswordButton: () => pw.get("button").contains("Reset Password"),
      oldPasswordInput: () => pw.get("#OldPassword"),
      newPasswordInput: () => pw.get("#NewPassword"),
      confirmPasswordInput: () =>
        cy
          .get("label")
          .contains("Confirm The New Password")
          .next()
          .find("input"),
      updatePasswordButton: () => pw.get("button").contains("Update"),
      cancelUpdatePasswordButton: () => pw.get("button").contains("Cancel"),
      savedBankAccountsAccordion: () =>
        pw.get(".k-expander-header").contains("Saved Bank Accounts"),
      savedCreditDebitCardsAccordion: () =>
        pw.get(".k-expander-header").contains("Saved Credit/Debit Cards"),
      savedBankAccountItems: () =>
        this.getElement()
          .savedBankAccountsAccordion()
          .parent()
          .next()
          .find(".k-expander-content > div"),
      savedCreditDebitCardItems: () =>
        this.getElement()
          .savedCreditDebitCardsAccordion()
          .parent()
          .next()
          .find(".k-expander-content > div"),
      savedBankAccountItem: (order: number) =>
        this.getElement()
          .savedBankAccountsAccordion()
          .parent()
          .next()
          .find(".k-expander-content")
          .find("div")
          .eq(order),
      savedCreditDebitCardItem: (order: number) =>
        this.getElement()
          .savedCreditDebitCardsAccordion()
          .parent()
          .next()
          .find(".k-expander-content")
          .find("div")
          .eq(order),
      deleteBankAccountItem: (order: number) =>
        this.getElement()
          .savedBankAccountItem(order)
          .find("a")
          .contains("Delete"),
      deleteCreditDebitCardItem: (order: number) =>
        this.getElement()
          .savedCreditDebitCardItem(order)
          .find("a")
          .contains("Delete"),
      defaultHomePageDropdown: () =>
        pw.get("label").contains("Default Home Page").next(),
      anyList: () => pw.get("li"),
      saveChangesButton: () => pw.get("button").contains("Save Changes"),
      saveDefaultHomePageButton: () => pw.get("button").contains("Save"),
      defaultHomePageDropdownItems: () => pw.get(".k-list-item"),
      toastComponent: () => pw.get(".Toastify"),
    };
  }

  getElement() {
    return this.elements();
  }

  init() {
    pw.visit("/profile");
    pw.waitForLoading();
  }

  deleteSavedPaymentMethod(type: "bank" | "card", order: number) {
    if (type === "bank") {
      this.getElement().deleteBankAccountItem(order).click();
    } else {
      this.getElement().deleteCreditDebitCardItem(order).click();
    }
    pw.waitForLoading();
  }

  clickResetPassword() {
    this.getElement().resetPasswordButton().click();
  }

  typeOldPassword(value: string) {
    this.getElement().oldPasswordInput().clear();
    this.getElement().oldPasswordInput().type(value);
  }

  typeNewPassword(value: string) {
    this.getElement().newPasswordInput().clear();
    this.getElement().newPasswordInput().type(value);
  }

  typeConfirmPassword(value: string) {
    this.getElement().confirmPasswordInput().clear();
    this.getElement().confirmPasswordInput().type(value);
  }

  clickUpdatePasswordButton() {
    this.getElement().updatePasswordButton().click();
  }

  clickCancelUpdatePasswordButton() {
    this.getElement().cancelUpdatePasswordButton().click();
  }

  typeFirstName(value: string) {
    this.getElement().firstNameInput().clear();
    this.getElement().firstNameInput().type(value);
  }

  typeLastName(value: string) {
    this.getElement().lastNameInput().clear();
    this.getElement().lastNameInput().type(value);
  }

  typeEmail(value: string) {
    this.getElement().emailInput().clear();
    this.getElement().emailInput().type(value);
  }

  toggleMFA() {
    this.getElement().mfaSwitch().click();
  }

  clickSavedBankAccountsAccordion() {
    this.getElement().savedBankAccountsAccordion().click();
  }

  clickSavedCreditDebitCardsAccordion() {
    this.getElement().savedCreditDebitCardsAccordion().click();
  }

  selectDefaultHomePage(value: string) {
    this.getElement().defaultHomePageDropdown().click();
    this.getElement().defaultHomePageDropdownItems().contains(value).click();
    pw.waitForLoading();
    pw.get("body").then(($body) => {
      if ($body.find("button").text().includes("Save")) {
        this.getElement().saveDefaultHomePageButton().click();
      }
    });
  }

  clickSaveChanges() {
    this.getElement().saveChangesButton().click();
    pw.waitForLoading();
  }
}

export default Profile;
