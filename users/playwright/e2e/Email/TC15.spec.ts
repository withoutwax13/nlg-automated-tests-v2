import { expect, test } from "@playwright/test";
import InviteUserModal from "../../objects/InviteUserModal";
import UserGrid from "../../objects/UserGrid";
import { bindRuntime, fetchJson, getTestmail, login, normalizeWhitespace, waitForLoading } from "../../support/runtime";
import Login from "../../utils/Login";

type TestmailResponse = {
  emails: Array<{
    from: string;
    html: string;
  }>;
};

test.describe("As a superuser, when I invited any user type in user service, the email address must receive an email with correct content", () => {
  test("Initiating test for municipal user", async ({ page, request }) => {
    const user = new UserGrid();
    const inviteUserModal = new InviteUserModal();
    bindRuntime(page, request);
    const testmailVars = getTestmail();
    const randomTag = Math.floor(Math.random() * 1000000);
    const ENDPOINT = `${testmailVars.endpoint}?apikey=${testmailVars.apiKey}&namespace=${testmailVars.namespace}&tag=${randomTag}`;

    await Login.login(page, { accountType: "ags" });
    await user.init();
    await user.clickInviteUserButton();
    await inviteUserModal.typeEmail(
      `${testmailVars.namespace}.${randomTag}@${testmailVars.domain}`
    );
    await inviteUserModal.checkMunicipalUserTypeRadioButton();
    await inviteUserModal.selectSubscriptionType("Municipal user");
    await inviteUserModal.selectMunicipality("City of Arrakis");
    await inviteUserModal.clickInviteButton();
    await waitForLoading();
    await page.waitForTimeout(5000);

    const response = await fetchJson<TestmailResponse>(`${ENDPOINT}&livequery=true`);
    const email = response.emails[0];
    const actualText = normalizeWhitespace(
      await page.evaluate((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        return doc.body.textContent || "";
      }, email.html)
    );

    expect(email.from).toBe("Localgov <no-reply@azavargovapps.com>");
    expect(actualText).toContain("Welcome! You have been invited to Localgov. A new account is awaiting your activation.");
    expect(actualText).toContain("https://dev.azavargovapps.com/");
    expect(actualText).toContain(
      `Email: ${testmailVars.namespace}.${randomTag}@${testmailVars.domain}`
    );
    expect(actualText).toContain("Temporary Password");
    expect(actualText).toContain(
      "Please Note: When you login for the first time using the credentials above, you will be required to create a new password."
    );
    expect(actualText).toContain(
      "Your temporary password will expire in 10 days from the date of this email."
    );
    expect(actualText).toContain("Thank you for using Localgov!");
    expect(actualText).toContain("Sincerely, Localgov Service Team");
    expect(actualText).toContain("service@localgov.org");
    expect(actualText).toContain("Copyright 2025. All Rights Reserved.");
  });
});