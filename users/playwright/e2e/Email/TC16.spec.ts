import { test, expect } from '@playwright/test';
import InviteUserModal from "../../objects/InviteUserModal";
import UserGrid from "../../objects/UserGrid";

function normalizeEmailHtml(html: string): string {
  // Remove random whitespace for easier comparison
  html = html.replace(/\s+/g, " ").trim();
  // Remove dynamic email addresses
  html = html.replace(/Email:\s[\w\.\-]+@[\w\.\-]+/g, "Email: <EMAIL>");
  // Remove dynamic temporary passwords (handles both simple text and HTML span structure)
  html = html.replace(
    /Temporary Password:\s*<span[^>]*>\s*[^\s<]+\s*<\/span>/g,
    'Temporary Password: <span style="border: 1px solid #666; padding: 2px 6px; border-radius: 4px;"> <TEMP_PASSWORD> </span>'
  );
  return html;
}

test.describe("As a superuser, when I invited any user type in user service, the email address must receive an email with the correct HTML structure.", () => {
  test("Initiating test for municipal user", () => {
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

      // Expected HTML with placeholders for dynamic content
      const expectedHtml = `<html> <body> <table align="center" cellpadding="0" cellspacing="0" width="600"> <tr> <td bgcolor="#ffffff"> <div> <h1 style='color: #2a2c39;font-size: 32pt;font-family: Verdana, Geneva, sans-serif;font-weight: 100;margin-bottom: 10px;margin-top: 20px; line-height: 38.4pt;'> Welcome! </h1> <br /> <p style='color: #545454;font-family: Verdana, Geneva, sans-serif;font-size: 14px;'> You have been invited to Localgov. A new account is awaiting your activation. Click the link below to login using the email and temporary password provided. </p> <br /> <p style='color: #545454;font-family: Verdana, Geneva, sans-serif;font-size: 14px;font-weight: 800; padding-left:20px;'> <a style='color: #009fd0;' href="https://dev.azavargovapps.com/"> https://dev.azavargovapps.com/ </a> </p> <br /> <p style='color: #222222;font-family: Verdana, Geneva, sans-serif;font-size: 14px; font-weight: 800; padding-left:20px;'> Email: <EMAIL> </p> <br /> <p style='color: #222222;font-family: Verdana, Geneva, sans-serif;font-size: 14px; font-weight: 800; padding-left:20px;'> Temporary Password: <span style="border: 1px solid #666; padding: 2px 6px; border-radius: 4px;"> <TEMP_PASSWORD> </span> </p> <br /> <p style='color: #545454;font-family: Verdana, Geneva, sans-serif;font-size: 14px;'> Please Note: When you login for the first time using the credentials above, you will be required to create a new password. Your temporary password will expire in <strong>10 days</strong> from the date of this email. If you are unable to log in and reset your password within those 10 days, please reach out to our support team to get a new temporary password. </p> <br /> <p style='color: #545454;font-family: Verdana, Geneva, sans-serif;font-size: 14px;'> Thank you for using Localgov! </p> <br /> <p style='color: #545454;font-family: Verdana, Geneva, sans-serif;font-size: 14px; padding-top:20px;'> Sincerely, </p> <br /> <p style='color: #545454;font-family: Verdana, Geneva, sans-serif;font-size: 14px;'>Localgov Service Team</p> <br /> <p style='color: #545454;font-family: Verdana, Geneva, sans-serif;font-size: 14px; padding-top:20px;'> If you encounter any issues or would like to ask any questions regarding Localgov, please send an email to <a style='color: #009fd0;' href='mailto:service@localgov.org'> service@localgov.org </a> and we will respond within one business day. </p> </div> </td> </tr> <tr> <td bgcolor="#ffffff" style="font-weight: 500; font-size: 11px"> </br> </br> <p>© Copyright 2025. All Rights Reserved.</p> </td> </tr> </table> </body> </html>`;

      // Normalize both HTML strings using your normalization function
      const normalizedActual = normalizeEmailHtml(email.html);
      const normalizedExpected = normalizeEmailHtml(expectedHtml);
      console.log("Normalized Actual HTML:", normalizedActual);
      console.log("Normalized Expected HTML:", normalizedExpected);

      //   Assert that the normalized HTML matches
      expect(normalizedActual).to.equal(normalizedExpected);
    });
  });
});
