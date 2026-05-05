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
      waitForLoading(customTimeInSecs?: number): Chainable<void>;
      getUniqueRegistrationData(
        randomSeed: number,
        isMultilocation: boolean,
        missingData?: string[],
        customValues?: object
      ): Chainable<object>;
      logout(): Chainable<void>;
    }
  }
}

import "cypress-file-upload";
import LoginAuth from "../utils/Login";

Cypress.Commands.add("waitForLoading", (customTimeInSecs?: number) => {
  cy.wait(customTimeInSecs * 1000 || 5000);
});

Cypress.Commands.add(
  "getUniqueRegistrationData",
  (
    randomSeed: number,
    isMultilocation: boolean,
    missingData?: string[],
    customValues?: object
  ) => {
    const evaluateCustomValue = (propertyName: string, defaultValue) => {
      if (customValues && customValues.hasOwnProperty(propertyName)) {
        return `${defaultValue} ${customValues[propertyName]}`;
      } else {
        return defaultValue;
      }
    };

    const customData = {
      basicInfo: {
        businessOwnerEmail: evaluateCustomValue(
          "businessOwnerEmail",
          `testdata${randomSeed}@test.com`
        ),
        businessOwnerFullName: evaluateCustomValue(
          "businessOwnerFullName",
          `test data owner ${randomSeed}`
        ),
        businessOwnerPhoneNumber: evaluateCustomValue(
          "businessOwnerPhoneNumber",
          `11111111111`
        ),
        legalBusinessName: evaluateCustomValue(
          "legalBusinessName",
          `test data business ${randomSeed}`
        ),
        federalIdentificationNumber: evaluateCustomValue(
          "federalIdentificationNumber",
          `11111111111`
        ),
        legalBusinessAddress1: evaluateCustomValue(
          "legalBusinessAddress1",
          `test data add1 ${randomSeed}`
        ),
        legalBusinessAddress2: evaluateCustomValue(
          "legalBusinessAddress2",
          `Suite add2 ${randomSeed}`
        ),
        legalBusinessCity: evaluateCustomValue(
          "legalBusinessCity",
          `test city data ${randomSeed}`
        ),
        legalBusinessState: evaluateCustomValue("legalBusinessState", "AL"),
        legalBusinessZipCode: evaluateCustomValue(
          "legalBusinessZipCode",
          `11111111111`
        ),
        isNotManagedByPropertyManagementFirm: evaluateCustomValue(
          "isNotManagedByPropertyManagementFirm",
          true
        ),
        operatorName: evaluateCustomValue(
          "operatorName",
          `test data operator ${randomSeed}`
        ),
        operatorTitle: evaluateCustomValue(
          "operatorTitle",
          `test data title ${randomSeed}`
        ),
        operatorPhoneNumber: evaluateCustomValue(
          "operatorPhoneNumber",
          `11111111111`
        ),
        operatorEmail: evaluateCustomValue(
          "operatorEmail",
          `test${randomSeed}@test.com`
        ),
        emergencyPhoneNumber: evaluateCustomValue(
          "emergencyPhoneNumber",
          `11111111111`
        ),
      },
      locationInfo: {
        locations: [
          {
            locationOpenDate: evaluateCustomValue("locationOpenDate", {
              day: 1,
              month: 1,
              year: 2024,
            }),
            locationDBA: evaluateCustomValue(
              "locationDBA",
              `Test Trade Name ${randomSeed} 1`
            ),
            locationAddress1: evaluateCustomValue(
              "locationAddress1",
              `${randomSeed} Test Address ${randomSeed} #1`
            ),
            locationAddress2: evaluateCustomValue(
              "locationAddress2",
              `Suite ${randomSeed} #1`
            ),
            locationCity: evaluateCustomValue("locationCity", `Test City`),
            locationState: evaluateCustomValue("locationState", "AL"),
            locationZip: evaluateCustomValue("locationZip", `12341`),
            locationMailingAddress1: evaluateCustomValue(
              "locationMailingAddress1",
              `${randomSeed} Test Mailing Address ${randomSeed} #1`
            ),
            locationMailingAddress2: evaluateCustomValue(
              "locationMailingAddress2",
              `Suite ${randomSeed} #1`
            ),
            locationMailingCity: evaluateCustomValue(
              "locationMailingCity",
              `Test City`
            ),
            locationMailingState: evaluateCustomValue(
              "locationMailingState",
              `AL`
            ),
            locationMailingZip: evaluateCustomValue(
              "locationMailingZip",
              `12341`
            ),
            managerOperatorFullName: evaluateCustomValue(
              "managerOperatorFullName",
              `Test Manager ${randomSeed} 1`
            ),
            managerOperatorPhoneNumber: evaluateCustomValue(
              "managerOperatorPhoneNumber",
              `11111111111`
            ),
            managerOperatorEmail: evaluateCustomValue(
              "managerOperatorEmail",
              `manager1dot${randomSeed}@test.com`
            ),
            managerOperatorTitle: evaluateCustomValue(
              "managerOperatorTitle",
              `Test Manager Title ${randomSeed} 1`
            ),
            emergencyPhoneNumber: evaluateCustomValue(
              "emergencyPhoneNumber",
              `11111111111`
            ),
          },
          {
            locationOpenDate: evaluateCustomValue("locationOpenDate", {
              day: 2,
              month: 2,
              year: 2024,
            }),
            locationDBA: evaluateCustomValue(
              "locationDBA",
              `Test Trade Name ${randomSeed} 2`
            ),
            locationAddress1: evaluateCustomValue(
              "locationAddress1",
              `${randomSeed} Test Address ${randomSeed} #2`
            ),
            locationAddress2: evaluateCustomValue(
              "locationAddress2",
              `Suite ${randomSeed} #2`
            ),
            locationCity: evaluateCustomValue("locationCity", `Test City`),
            locationState: evaluateCustomValue("locationState", `AL`),
            locationZip: evaluateCustomValue("locationZip", `12341`),
            locationMailingAddress1: evaluateCustomValue(
              "locationMailingAddress1",
              `${randomSeed} Test Mailing Address ${randomSeed} #2`
            ),
            locationMailingAddress2: evaluateCustomValue(
              "locationMailingAddress2",
              `Suite ${randomSeed} #2`
            ),
            locationMailingCity: evaluateCustomValue(
              "locationMailingCity",
              `Test City`
            ),
            locationMailingState: evaluateCustomValue(
              "locationMailingState",
              `AL`
            ),
            locationMailingZip: evaluateCustomValue(
              "locationMailingZip",
              `12341`
            ),
            managerOperatorFullName: evaluateCustomValue(
              "managerOperatorFullName",
              `Test Manager ${randomSeed} 2`
            ),
            managerOperatorPhoneNumber: evaluateCustomValue(
              "managerOperatorPhoneNumber",
              `11111111111`
            ),
            managerOperatorEmail: evaluateCustomValue(
              "managerOperatorEmail",
              `manager2dot${randomSeed}@test.com`
            ),
            managerOperatorTitle: evaluateCustomValue(
              "managerOperatorTitle",
              `Test Manager Title ${randomSeed} 2`
            ),
            emergencyPhoneNumber: evaluateCustomValue(
              "emergencyPhoneNumber",
              `11111111111`
            ),
          },
        ],
      },
      applicantInfo: {
        agencyName: evaluateCustomValue(
          "agencyName",
          `Test Agency ${randomSeed}`
        ),
        agencyType: evaluateCustomValue("agencyType", "Accounting Firm"),
        applicantPhoneNumber: evaluateCustomValue(
          "applicantPhoneNumber",
          `11111111111`
        ),
        applicantEmail: evaluateCustomValue(
          "applicantEmail",
          `test${randomSeed}@test.com`
        ),
        signature: evaluateCustomValue(
          "signature",
          `Test Signature ${randomSeed}`
        ),
      },
    };

    if (!isMultilocation) {
      customData.locationInfo.locations = [
        customData.locationInfo.locations[0],
      ];
    }

    if (missingData) {
      missingData.forEach((path) => {
        const keys = path.split(".").map((key) => {
          // Handle array syntax like `friends[0]`
          const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
          if (arrayMatch) {
            return { key: arrayMatch[1], index: parseInt(arrayMatch[2], 10) };
          } else {
            return { key };
          }
        });

        let current = customData;

        for (let i = 0; i < keys.length - 1; i++) {
          const { key, index } = keys[i];

          // Check if the key exists at the current level
          if (!current.hasOwnProperty(key)) {
            return; // Exit if the path does not exist
          }

          current = current[key];

          // If it's an array, move to the specified index
          if (index !== undefined) {
            if (!Array.isArray(current) || current[index] === undefined) {
              return; // Exit if the array index does not exist
            }
            current = current[index];
          }
        }

        // Delete the final property
        const { key: finalKey, index: finalIndex } = keys[keys.length - 1];
        if (finalIndex !== undefined) {
          // Handle deletion within an array
          if (Array.isArray(current) && current[finalIndex] !== undefined) {
            delete current[finalIndex][finalKey];
          }
        } else {
          delete current[finalKey];
        }
      });
    }

    return cy.wrap(customData);
  }
);

Cypress.Commands.add("logout", () => {
  cy.get(".profileDropDownButton").last().click( {force: true} );
  cy.get("span").contains("Log out").click( {force: true} );
  cy.location("pathname").should("eq", "/login");
});

Cypress.Commands.add("login", (params) => {
  const notFirstLogin = params.notFirstLogin || false;
  const accountIndex = params.accountIndex || 0;
  const auth = {
    taxpayer: {
      validUsername: Cypress.env("validCredentials").taxpayer[accountIndex].username,
      validPassword: Cypress.env("validCredentials").taxpayer[accountIndex].password,
    },
    municipal: {
      validUsername: Cypress.env("validCredentials").municipal[accountIndex].username,
      validPassword: Cypress.env("validCredentials").municipal[accountIndex].password,
    },
    ags: {
      validUsername: Cypress.env("validCredentials").ags[accountIndex].username,
      validPassword: Cypress.env("validCredentials").ags[accountIndex].password,
    },
  };

  const loginFormMethod = (accountType) => {
    LoginAuth.interceptHubspotChat();
    LoginAuth.interceptAwsCognito();
    cy.visit("https://dev.azavargovapps.com/login");
    // LoginAuth.waitForHubspotChat();
    cy.location("pathname").should("eq", "/login");
    !notFirstLogin && cy.get(".cookie-actions").find(".NLGButtonPrimary").click( {force: true} );
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
    cy.get('[data-cy="sign-in"]').contains("Sign In").click( {force: true} );
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
