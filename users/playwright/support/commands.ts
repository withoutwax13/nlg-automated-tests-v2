// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare global {
  namespace Cypress {
    interface Chainable {
      login(prams: {
        notFirstLogin?: boolean;
        accountType: string;
        accountIndex?: number;
        customRedirectionAfterLoginAssertion?: any;
      }): Chainable<void>;
      drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>;
      dismiss(
        subject: string,
        options?: Partial<TypeOptions>
      ): Chainable<Element>;
      visit(
        originalFn: CommandOriginalFn<any>,
        url: string,
        options: Partial<VisitOptions>
      ): Chainable<Element>;
      waitForLoading(timeInSecs?: number): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}

import "cypress-iframe";
import "@cypress-audit/lighthouse/commands";
import LoginAuth from "../utils/Login";

Cypress.Commands.add("waitForLoading", (timeInSecs?: number) => {
  cy.wait(timeInSecs * 1000 || 5000);
});

Cypress.Commands.add("logout", () => {
  cy.get(".profileDropDownButton").last().click();
  cy.get("span").contains("Log out").click();
  cy.location("pathname").should("eq", "/login");
});

Cypress.Commands.add("login", (params) => {
  const notFirstLogin = params.notFirstLogin || false;
  const accountIndex = params.accountIndex || 0;
  const customRedirectionAfterLoginAssertion =
    params.customRedirectionAfterLoginAssertion || undefined;
  if (params.accountType === "taxpayer") {
    LoginAuth.interceptHubspotChat();
    LoginAuth.interceptAwsCognito();

    const validUsername =
        Cypress.env("validCredentials").taxpayer[accountIndex].username,
      validPassword =
        Cypress.env("validCredentials").taxpayer[accountIndex].password;
    cy.visit("login", {
      onBeforeLoad(win) {
        cy.stub(win, "open").as("windowOpen");
      },
    });
    // LoginAuth.waitForHubspotChat();

    cy.location("pathname").should("eq", "/login");
    !notFirstLogin && cy.get(".cookie-actions").find(".NLGButtonPrimary").click();
    cy.get('[data-cy="email-address"]').type(validUsername);
    cy.get('[data-cy="email-address"]').should("have.value", validUsername);
    cy.get('[data-cy="password"]').type(validPassword);
    cy.get('[data-cy="password"]').should("have.value", validPassword);
    cy.get('[data-cy="sign-in"]').click();
    LoginAuth.waitForAwsCognito(true).then(() => {
      customRedirectionAfterLoginAssertion
        ? customRedirectionAfterLoginAssertion()
        : cy.location("pathname").should("eq", "/BusinessesApp/BusinessesList");
    });
  } else if (params.accountType === "municipal") {
    LoginAuth.interceptHubspotChat();
    LoginAuth.interceptAwsCognito();

    const validUsername =
        Cypress.env("validCredentials").municipal[accountIndex].username,
      validPassword =
        Cypress.env("validCredentials").municipal[accountIndex].password;
    cy.visit("login", {
      onBeforeLoad(win) {
        cy.stub(win, "open").as("windowOpen");
      },
    });
    // LoginAuth.waitForHubspotChat();

    cy.location("pathname").should("eq", "/login");
    !notFirstLogin && cy.get(".cookie-actions").find(".NLGButtonPrimary").click();
    cy.get('[data-cy="email-address"]').type(validUsername);
    cy.get('[data-cy="email-address"]').should("have.value", validUsername);
    cy.get('[data-cy="password"]').type(validPassword);
    cy.get('[data-cy="password"]').should("have.value", validPassword);
    cy.get('[data-cy="sign-in"]').click();
    LoginAuth.waitForAwsCognito(true).then(() => {
      customRedirectionAfterLoginAssertion
        ? customRedirectionAfterLoginAssertion()
        : cy.location("pathname").should("eq", "/filingApp/filingList");
    });
  } else if (params.accountType === "ags") {
    LoginAuth.interceptHubspotChat();
    LoginAuth.interceptAwsCognito();

    const validUsername =
        Cypress.env("validCredentials").ags[accountIndex].username,
      validPassword =
        Cypress.env("validCredentials").ags[accountIndex].password;
    cy.visit("login", {
      onBeforeLoad(win) {
        cy.stub(win, "open").as("windowOpen");
      },
    });
    // LoginAuth.waitForHubspotChat();

    cy.location("pathname").should("eq", "/login");
    !notFirstLogin && cy.get(".cookie-actions").find(".NLGButtonPrimary").click();
    cy.get('[data-cy="email-address"]').type(validUsername);
    cy.get('[data-cy="email-address"]').should("have.value", validUsername);
    cy.get('[data-cy="password"]').type(validPassword);
    cy.get('[data-cy="password"]').should("have.value", validPassword);
    cy.get('[data-cy="sign-in"]').click();
    LoginAuth.waitForAwsCognito(true).then(() => {
      customRedirectionAfterLoginAssertion
        ? customRedirectionAfterLoginAssertion()
        : cy.location("pathname").should("eq", "/");
    });
  } else if (params.accountType === "municipalCaseManagement") {
    LoginAuth.interceptHubspotChat();
    LoginAuth.interceptAwsCognito();

    const validUsername =
        Cypress.env("validCredentials").caseManagementTestAccount[accountIndex]
          .username,
      validPassword =
        Cypress.env("validCredentials").caseManagementTestAccount[accountIndex]
          .password;
    cy.visit("login", {
      onBeforeLoad(win) {
        cy.stub(win, "open").as("windowOpen");
      },
    });
    // LoginAuth.waitForHubspotChat();

    cy.location("pathname").should("eq", "/login");
    !notFirstLogin && cy.get(".cookie-actions").find(".NLGButtonPrimary").click();
    cy.get('[data-cy="email-address"]').type(validUsername);
    cy.get('[data-cy="email-address"]').should("have.value", validUsername);
    cy.get('[data-cy="password"]').type(validPassword);
    cy.get('[data-cy="password"]').should("have.value", validPassword);
    cy.get('[data-cy="sign-in"]').click();
    LoginAuth.waitForAwsCognito(true).then(() => {
      customRedirectionAfterLoginAssertion
        ? customRedirectionAfterLoginAssertion()
        : cy.location("pathname").should("eq", "/filingApp/filingList");
    });
  } else if (params.accountType === "iail") {
    LoginAuth.interceptHubspotChat();
    LoginAuth.interceptAwsCognito();

    const validUsername =
        Cypress.env("validCredentials").iail[accountIndex].username,
      validPassword =
        Cypress.env("validCredentials").iail[accountIndex].password;
    cy.visit("login", {
      onBeforeLoad(win) {
        cy.stub(win, "open").as("windowOpen");
      },
    });
    // LoginAuth.waitForHubspotChat();

    cy.location("pathname").should("eq", "/login");
    !notFirstLogin && cy.get(".cookie-actions").find(".NLGButtonPrimary").click();
    cy.get('[data-cy="email-address"]').type(validUsername);
    cy.get('[data-cy="email-address"]').should("have.value", validUsername);
    cy.get('[data-cy="password"]').type(validPassword);
    cy.get('[data-cy="password"]').should("have.value", validPassword);
    cy.get('[data-cy="sign-in"]').click();
    LoginAuth.waitForAwsCognito(true).then(() => {
      customRedirectionAfterLoginAssertion
        ? customRedirectionAfterLoginAssertion()
        : cy.location("pathname").should("eq", "/filingApp/filingList");
    });
  } else if (params.accountType === "iatx") {
    LoginAuth.interceptHubspotChat();
    LoginAuth.interceptAwsCognito();

    const validUsername =
        Cypress.env("validCredentials").iatx[accountIndex].username,
      validPassword =
        Cypress.env("validCredentials").iatx[accountIndex].password;
    cy.visit("login", {
      onBeforeLoad(win) {
        cy.stub(win, "open").as("windowOpen");
      },
    });
    // LoginAuth.waitForHubspotChat();

    cy.location("pathname").should("eq", "/login");
    !notFirstLogin && cy.get(".cookie-actions").find(".NLGButtonPrimary").click();
    cy.get('[data-cy="email-address"]').type(validUsername);
    cy.get('[data-cy="email-address"]').should("have.value", validUsername);
    cy.get('[data-cy="password"]').type(validPassword);
    cy.get('[data-cy="password"]').should("have.value", validPassword);
    cy.get('[data-cy="sign-in"]').click();
    LoginAuth.waitForAwsCognito(true).then(() => {
      customRedirectionAfterLoginAssertion
        ? customRedirectionAfterLoginAssertion()
        : cy.location("pathname").should("eq", "/filingApp/filingList");
    });
  }
});
