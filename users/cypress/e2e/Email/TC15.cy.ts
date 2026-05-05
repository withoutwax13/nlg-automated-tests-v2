import InviteUserModal from "../../objects/InviteUserModal";
import UserGrid from "../../objects/UserGrid";

describe("As a superuser, when I invited any user type in user service, the email address must receive an email with correct content", () => {
  it("Initiating test for municipal user", () => {
    const user = new UserGrid();
    const inviteUserModal = new InviteUserModal();
    const testmailVars = Cypress.env("testmail");
    const randomTag = Math.floor(Math.random() * 1000000);
    const ENDPOINT = `${testmailVars.endpoint}?apikey=${testmailVars.apiKey}&namespace=${testmailVars.namespace}&tag=${randomTag}`;

    cy.login({ accountType: "ags" });
    user.init();
    user.clickInviteUserButton();
    inviteUserModal.typeEmail(
      `${testmailVars.namespace}.${randomTag}@${testmailVars.domain}`
    );
    inviteUserModal.checkMunicipalUserTypeRadioButton();
    inviteUserModal.selectSubscriptionType("Municipal user");
    inviteUserModal.selectMunicipality("City of Arrakis");
    inviteUserModal.clickInviteButton();
    cy.wait(5000); // Wait for the email to be sent
    cy.request("GET", `${ENDPOINT}&livequery=true`).then((response) => {
      const email = response.body.emails[0];
      console.log(email);

      // Verify text content of the email
      cy.wrap(email.from).should(
        "equal",
        "Localgov <no-reply@azavargovapps.com>"
      );

      const parser = new DOMParser();
      const doc = parser.parseFromString(email.html, "text/html");
      const actualText = doc.body.textContent?.trim();
      cy.wrap(actualText).should(
        "include",
        "Welcome!\n          \n          \n          \n            You have been invited to Localgov. A new account is awaiting your activation. Click the link below to login\n            using the email and temporary password provided.\n          \n          \n          \n            \n              https://dev.azavargovapps.com/"
      );
      cy.wrap(actualText).should(
        "include",
        `Email: ${testmailVars.namespace}.${randomTag}@${testmailVars.domain}`
      );
      cy.wrap(actualText).should("include", "Temporary Password");
      cy.wrap(actualText).should(
        "include",
        "Please Note: When you login for the first time using the credentials above, you will be required to create a\n            new password. Your temporary password will expire in 10 days from the date of this email.\n            If you are unable to log in and reset your password within those 10 days, please reach out to our support team to get a new temporary password.\n          \n          \n          \n            Thank you for using Localgov!\n          \n          \n          \n            Sincerely,\n          \n          \n          Localgov Service Team\n          \n          \n            If you encounter any issues or would like to ask any questions regarding Localgov, please send an email to\n            \n              service@localgov.org\n            \n            and we will respond within one business day.\n          \n        \n      \n                \n                \n                    \n                    \n                    \n                    © Copyright 2025. All Rights Reserved."
      );
    });
  });
});
