/// <reference types="cypress" />
/// <reference types="cypress-xpath" />
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

import Login from "../utils/Login";

Cypress.Commands.add(
  "login",
  (params: { email?: string; password?: string; manualAuth: boolean }) => {
    cy.fixture("auth").then((auth) => {
      if (!params.manualAuth) {
        Login.interceptAuditAuthLogin();
        Login.interceptDepartments();
        const email = params.email || auth.validCredentials.email;
        const password = params.password || auth.validCredentials.password;
        cy.visit("login");
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get("button[type='submit']").click();
        Login.waitForAuditAuthLogin()
          .its("response.statusCode")
          .should("eq", 201);
        Login.waitForDepartments();
      } else {
        const email = params.email || auth.invalidCredentials.email;
        const password = params.password || auth.invalidCredentials.password;
        cy.visit("login");
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get("button[type='submit']").click();
      }
    });
  }
);

Cypress.Commands.add("logout", () => {
  cy.get("nav").find("ul").find("li").eq(2).find("a").eq(1).click();
});
