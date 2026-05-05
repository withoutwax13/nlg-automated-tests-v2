import { test, expect } from '@playwright/test';
import Profile from "../../objects/Profile";

const randomSeed = Math.floor(Math.random() * 10000);

const profile = new Profile();
test.describe("As a user, I should be able to edit my account details", () => {
  test("Initiating test", () => {
    cy.login({ accountType: "taxpayer", accountIndex: 3 });
    profile.init();
    profile.typeFirstName(`QA #${randomSeed}`);
    profile
      .getElement()
      .firstNameInput()
      .should("have.value", `QA #${randomSeed}`);
    profile.getElement().saveChangesButton().should("exist");
    profile.clickSaveChanges();
    profile.typeLastName(`Specialist #${randomSeed}`);
    profile
      .getElement()
      .lastNameInput()
      .should("have.value", `Specialist #${randomSeed}`);
    profile.getElement().saveChangesButton().should("exist");
    profile.clickSaveChanges();

    profile.init(); // Refresh the page
    profile
      .getElement()
      .firstNameInput()
      .should("have.value", `QA #${randomSeed}`);
    profile
      .getElement()
      .lastNameInput()
      .should("have.value", `Specialist #${randomSeed}`);
  });
});
