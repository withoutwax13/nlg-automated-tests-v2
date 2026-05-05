/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
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
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare global {
  namespace Cypress {
    interface Chainable {
      login(prams: {
        notFirstLogin?: boolean;
        accountType: string;
        accountIndex?: number;
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
      waitForLoading(sec?: number): Chainable<void>;
      logout(): Chainable<void>;
      deleteBusinessData(params: {
        dba: string;
        userType: string;
        notFirstLogin: boolean;
        accountIndex?: number;
      }): Chainable<void>;
    }
  }
}

import "cypress-file-upload";
import data from "../fixtures/data";
import LoginAuth from "../utils/Login";
import BusinessGrid from "../objects/BusinessGrid";

Cypress.Commands.overwrite("visit", (originalFn, url, options) => {
  const environment = Cypress.env("environment");
  if (!environment) {
    throw new Error("Environment is not defined in environment variables");
  } else {
    // Ensure the URL is absolute
    const finalUrl = String(url).startsWith("http")
      ? url
      : `${`https://${environment}.azavargovapps.com`}${url}`;
    Cypress.config("baseUrl", `https://${environment}.azavargovapps.com/`);
    return originalFn(finalUrl, options);
  }
});
Cypress.Commands.add(
  "deleteBusinessData",
  (props: {
    dba: string;
    userType: string;
    notFirstLogin: boolean;
    accountIndex?: number;
  }) => {
    /**
     * @param {string} dba - The name of the business to be deleted.
     * @param {string} userType - The type of user that will delete the business.
     * @returns {void}
     */

    const municipalBusinessGrid = new BusinessGrid({ userType: "municipal" });
    const taxpayerBusinessGrid = new BusinessGrid({ userType: "taxpayer" });
    const agsBusinessGrid = new BusinessGrid({
      userType: "ags",
      municipalitySelection: "Arrakis",
    });
    if (props.userType === "taxpayer") {
      cy.login({
        accountType: "taxpayer",
        notFirstLogin: props.notFirstLogin,
        accountIndex: props.accountIndex ?? 0,
      });
      taxpayerBusinessGrid.init();
      taxpayerBusinessGrid.filterColumn("DBA", props.dba);
      cy.get("body").then(($body) => {
        if ($body.find(".k-grid-norecords-template").length === 0) {
          taxpayerBusinessGrid.clickClearAllFiltersButton();
          taxpayerBusinessGrid.deleteBusiness(props.dba);
          taxpayerBusinessGrid.getElement().toastComponent().should("exist");
        }
      });
      cy.logout();
    } else if (props.userType === "ags") {
      cy.login({
        accountType: "ags",
        notFirstLogin: props.notFirstLogin,
        accountIndex: props.accountIndex ?? 0,
      });
      agsBusinessGrid.init();
      agsBusinessGrid.filterColumn("DBA", props.dba);
      cy.get("body").then(($body) => {
        if ($body.find(".k-grid-norecords-template").length === 0) {
          agsBusinessGrid.clickClearAllFiltersButton();
          agsBusinessGrid.deleteBusiness(props.dba);
          agsBusinessGrid.getElement().toastComponent().should("exist");
        }
      });
      cy.logout();
    } else {
      cy.login({
        accountType: "municipal",
        notFirstLogin: props.notFirstLogin,
        accountIndex: props.accountIndex ?? 0,
      });
      municipalBusinessGrid.init();
      municipalBusinessGrid.filterColumn("DBA", props.dba);
      cy.get("body").then(($body) => {
        if ($body.find(".k-grid-norecords-template").length === 0) {
          municipalBusinessGrid.clickClearAllFiltersButton();
          municipalBusinessGrid.deleteBusiness(props.dba);
          municipalBusinessGrid.getElement().toastComponent().should("exist");
        }
      });
      cy.logout();
    }
  }
);

Cypress.Commands.add("waitForLoading", (sec?: number) => {
  if (sec) {
    cy.wait(sec * 1000);
  } else {
    cy.wait(5000);
  }
});

Cypress.Commands.add("logout", () => {
  cy.get(".profileDropDownButton").last().click();
  cy.get("span").contains("Log out").click();
  cy.location("pathname").should("eq", "/login");
});

Cypress.Commands.add("login", (params) => {
  const notFirstLogin = params.notFirstLogin || false;
  const accountIndex = params.accountIndex || 0;
  const auth = {
    taxpayer: {
      validUsername: data.accounts.taxpayer[accountIndex].username,
      validPassword: data.accounts.taxpayer[accountIndex].password,
    },
    municipal: {
      validUsername: data.accounts.municipal[accountIndex].username,
      validPassword: data.accounts.municipal[accountIndex].password,
    },
    ags: {
      validUsername: data.accounts.ags[accountIndex].username,
      validPassword: data.accounts.ags[accountIndex].password,
    },
  };

  const loginFormMethod = (accountType) => {
    LoginAuth.interceptHubspotChat();
    LoginAuth.interceptAwsCognito();
    cy.visit("/login");
    // LoginAuth.waitForHubspotChat();
    cy.location("pathname").should("eq", "/login");
    !notFirstLogin && cy.get(".cookie-actions").find(".NLGButtonPrimary").click();
    cy.get('[data-cy="email-address"]').type(auth[accountType].validUsername);
    cy.get('[data-cy="email-address"]').should(
      "have.value",
      auth[accountType].validUsername
    );
    cy.get('[data-cy="password"]').type(auth[accountType].validPassword);
    cy.get('[data-cy="password"]').should(
      "have.value",
      auth[accountType].validPassword
    );
    cy.get('[data-cy="sign-in"]').contains("Sign In").click();
  };

  switch (params.accountType) {
    case "taxpayer":
      loginFormMethod(params.accountType);
      LoginAuth.waitForAwsCognito(true).then(() => {
        cy.location("pathname").should("eq", "/BusinessesApp/BusinessesList");
      });
      break;
    case "municipal":
      loginFormMethod(params.accountType);
      LoginAuth.waitForAwsCognito(true).then(() => {
        cy.location("pathname").should("eq", "/filingApp/filingList");
      });
      break;
    case "ags":
      loginFormMethod(params.accountType);
      LoginAuth.waitForAwsCognito(true).then(() => {
        cy.location("pathname").should("eq", "/");
      });
      break;
    default:
      break;
  }
});
