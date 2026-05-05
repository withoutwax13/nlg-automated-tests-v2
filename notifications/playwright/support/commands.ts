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

import LoginAuth from "../utils/Login";

Cypress.Commands.add("login", (params) => {
    if (params.accountType === "taxpayer") {
      LoginAuth.interceptHubspotChat();
      LoginAuth.interceptAwsCognito();
      LoginAuth.interceptLeadFlowConfig();
      const validUsername = Cypress.env("validCredentials").taxpayer.username,
        validPassword = Cypress.env("validCredentials").taxpayer.password;
      cy.visit("https://dev.azavargovapps.com/login");
      // LoginAuth.waitForHubspotChat();
      LoginAuth.waitForLeadFlowConfig();
      cy.location("pathname").should("eq", "/login");
      cy.get(".cookie-actions").find(".NLGButtonPrimary").click();
      cy.get('[data-cy="email-address"]').type(validUsername);
      cy.get('[data-cy="email-address"]').should("have.value", validUsername);
      cy.get('[data-cy="password"]').type(validPassword);
      cy.get('[data-cy="password"]').should("have.value", validPassword);
      cy.get('[data-cy="sign-in"]').click();
      LoginAuth.waitForAwsCognito(true).then(() => {
        cy.location("pathname").should("eq", "/BusinessesApp/BusinessesList");
      });
    } else if (params.accountType === "municipal") {
      LoginAuth.interceptHubspotChat();
      LoginAuth.interceptAwsCognito();
      LoginAuth.interceptLeadFlowConfig();
      const validUsername = Cypress.env("validCredentials").municipal.username,
        validPassword = Cypress.env("validCredentials").municipal.password;
      cy.visit("https://dev.azavargovapps.com/login");
      // LoginAuth.waitForHubspotChat();
      LoginAuth.waitForLeadFlowConfig();
      cy.location("pathname").should("eq", "/login");
      cy.get(".cookie-actions").find(".NLGButtonPrimary").click();
      cy.get('[data-cy="email-address"]').type(validUsername);
      cy.get('[data-cy="email-address"]').should("have.value", validUsername);
      cy.get('[data-cy="password"]').type(validPassword);
      cy.get('[data-cy="password"]').should("have.value", validPassword);
      cy.get('[data-cy="sign-in"]').click();
      LoginAuth.waitForAwsCognito(true).then(() => {
        cy.location("pathname").should("eq", "/filingApp/filingList");
      });
    }
});