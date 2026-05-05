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
      readCsv(filePath: string): Chainable<any>;
      readXlsx(filePath: string): Chainable<any>;
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
      deleteFile(filePath: string): Chainable<void>;
    }
  }
}

import LoginAuth from "../utils/Login";
import Papa from "papaparse";
import * as XLSX from "xlsx";

Cypress.Commands.add("readCsv", (filePath) => {
  return cy.readFile(filePath).then((csvString) => {
    return new Cypress.Promise((resolve) => {
      Papa.parse(csvString, {
        header: true,
        complete: (results) => {
          resolve(results.data);
        },
      });
    });
  });
});

Cypress.Commands.add("readXlsx", (filePath) => {
  return cy.readFile(filePath, "binary").then((fileContent) => {
    return new Cypress.Promise((resolve) => {
      const workbook = XLSX.read(fileContent, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      resolve(jsonData);
    });
  });
});

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
      validUsername:
        Cypress.env("validCredentials").taxpayer[accountIndex].username,
      validPassword:
        Cypress.env("validCredentials").taxpayer[accountIndex].password,
    },
    municipal: {
      validUsername:
        Cypress.env("validCredentials").municipal[accountIndex].username,
      validPassword:
        Cypress.env("validCredentials").municipal[accountIndex].password,
    },
    ags: {
      validUsername: Cypress.env("validCredentials").ags[accountIndex].username,
      validPassword: Cypress.env("validCredentials").ags[accountIndex].password,
    },
  };

  const loginFormMethod = (accountType) => {
    LoginAuth.interceptHubspotChat();
    LoginAuth.interceptAwsCognito();
    LoginAuth.interceptLeadFlowConfig();
    cy.visit("https://dev.azavargovapps.com/login");
    // LoginAuth.waitForHubspotChat();
    LoginAuth.waitForLeadFlowConfig();
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
