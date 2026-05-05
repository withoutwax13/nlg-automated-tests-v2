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
      pageTitle: () => cy.get("h1"),
      sectionTitle: () => cy.get("h2"),
      firstNameInput: () => cy.get("input").eq(0),
      lastNameInput: () => cy.get("input").eq(1),
      emailInput: () => cy.get("input").eq(2),
      currentEmailAddressData: () =>
        cy.get("label").contains("Current Email Address").next().find("b"),
      mfaSwitch: () =>
        cy
          .get("label")
          .contains("Multi-factor authentication (MFA)")
          .parent()
          .next()
          .find("span[role='switch']"),
      resetPasswordButton: () => cy.get("button").contains("Reset Password"),
      oldPasswordInput: () => cy.get("#OldPassword"),
      newPasswordInput: () => cy.get("#NewPassword"),
      confirmPasswordInput: () =>
        cy
          .get("label")
          .contains("Confirm The New Password")
          .next()
          .find("input"),
      updatePasswordButton: () => cy.get("button").contains("Update"),
      cancelUpdatePasswordButton: () => cy.get("button").contains("Cancel"),
      savedBankAccountsAccordion: () =>
        cy.get(".k-expander-header").contains("Saved Bank Accounts"),
      savedCreditDebitCardsAccordion: () =>
        cy.get(".k-expander-header").contains("Saved Credit/Debit Cards"),
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
        cy.get("label").contains("Default Home Page").next(),
      anyList: () => cy.get("li"),
      saveChangesButton: () => cy.get("button").contains("Save Changes"),
      saveDefaultHomePageButton: () => cy.get("button").contains("Save"),
      defaultHomePageDropdownItems: () => cy.get(".k-list-item"),
      toastComponent: () => cy.get(".Toastify"),
    };
  }

  getElement() {
    return this.elements();
  }

  init() {
    cy.visit("/profile");
    cy.waitForLoading();
  }

  deleteSavedPaymentMethod(type: "bank" | "card", order: number) {
    if (type === "bank") {
      this.getElement().deleteBankAccountItem(order).click();
    } else {
      this.getElement().deleteCreditDebitCardItem(order).click();
    }
    cy.waitForLoading();
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
    cy.waitForLoading();
    cy.get("body").then(($body) => {
      if ($body.find("button").text().includes("Save")) {
        this.getElement().saveDefaultHomePageButton().click();
      }
    });
  }

  clickSaveChanges() {
    this.getElement().saveChangesButton().click();
    cy.waitForLoading();
  }
}

export default Profile;
