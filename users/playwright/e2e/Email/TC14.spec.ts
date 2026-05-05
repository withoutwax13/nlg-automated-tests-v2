import { test, expect } from '../../support/pwtest';
import InviteUserModal from "../../objects/InviteUserModal";
import UserGrid from "../../objects/UserGrid";

test.describe("As a superuser, when I invited any user type in user service, the email address must receive an email with a subject 'Welcome to Localgov!'", () => {
  test("Initiating test for Municipal user", () => {
    const user = new UserGrid();
    const inviteUserModal = new InviteUserModal();
    const testmailVars = PW.env("testmail");
    const randomTag = Math.floor(Math.random() * 1000000);
    const ENDPOINT = `${testmailVars.endpoint}?apikey=${testmailVars.apiKey}&namespace=${testmailVars.namespace}&tag=${randomTag}`;

    pw.login({ accountType: "ags" });
    user.init();
    user.clickInviteUserButton();
    inviteUserModal.typeEmail(
      `${testmailVars.namespace}.${randomTag}@${testmailVars.domain}`
    );
    inviteUserModal.checkMunicipalUserTypeRadioButton();
    inviteUserModal.selectSubscriptionType("Municipal user");
    inviteUserModal.selectMunicipality("City of Arrakis");
    inviteUserModal.clickInviteButton();
    pw.wait(5000); // Wait for the email to be sent
    pw.request("GET", `${ENDPOINT}&livequery=true`).then((response) => {
      const email = response.body.emails[0];
      console.log(email);

      // Verify sender and subject
      pw.wrap(email.from).should(
        "equal",
        "Localgov <no-reply@azavargovapps.com>"
      );
      pw.wrap(email.subject).should("equal", "Welcome to Localgov!");
    });
  });
  test("Initiating test for Taxpayer user", () => {
    const user = new UserGrid();
    const inviteUserModal = new InviteUserModal();
    const testmailVars = PW.env("testmail");
    const randomTag = Math.floor(Math.random() * 1000000);
    const ENDPOINT = `${testmailVars.endpoint}?apikey=${testmailVars.apiKey}&namespace=${testmailVars.namespace}&tag=${randomTag}`;

    pw.login({ accountType: "ags" });
    user.init();
    user.clickInviteUserButton();
    inviteUserModal.typeEmail(
      `${testmailVars.namespace}.${randomTag}@${testmailVars.domain}`
    );
    inviteUserModal.checkTaxpayerUserTypeRadioButton();
    inviteUserModal.clickInviteButton();
    pw.wait(5000); // Wait for the email to be sent
    pw.request("GET", `${ENDPOINT}&livequery=true`).then((response) => {
      const email = response.body.emails[0];
      console.log(email);

      // Verify sender and subject
      pw.wrap(email.from).should(
        "equal",
        "Localgov <no-reply@azavargovapps.com>"
      );
      pw.wrap(email.subject).should("equal", "Welcome to Localgov!");
    });
  });
});
