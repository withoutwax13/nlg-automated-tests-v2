import { expect, test } from "@playwright/test";
import InviteUserModal from "../../objects/InviteUserModal";
import UserGrid from "../../objects/UserGrid";
import { bindRuntime, fetchJson, getTestmail, login, waitForLoading } from "../../support/runtime";

type TestmailResponse = {
  emails: Array<{
    from: string;
    subject: string;
  }>;
};

test.describe("As a superuser, when I invited any user type in user service, the email address must receive an email with a subject 'Welcome to Localgov!'", () => {
  test("Initiating test for Municipal user", async ({ page, request }) => {
    const user = new UserGrid();
    const inviteUserModal = new InviteUserModal();
    bindRuntime(page, request);
    const testmailVars = getTestmail();
    const randomTag = Math.floor(Math.random() * 1000000);
    const ENDPOINT = `${testmailVars.endpoint}?apikey=${testmailVars.apiKey}&namespace=${testmailVars.namespace}&tag=${randomTag}`;

    await login({ accountType: "ags" });
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

    expect(email.from).toBe("Localgov <no-reply@azavargovapps.com>");
    expect(email.subject).toBe("Welcome to Localgov!");
  });

  test("Initiating test for Taxpayer user", async ({ page, request }) => {
    const user = new UserGrid();
    const inviteUserModal = new InviteUserModal();
    bindRuntime(page, request);
    const testmailVars = getTestmail();
    const randomTag = Math.floor(Math.random() * 1000000);
    const ENDPOINT = `${testmailVars.endpoint}?apikey=${testmailVars.apiKey}&namespace=${testmailVars.namespace}&tag=${randomTag}`;

    await login({ accountType: "ags" });
    await user.init();
    await user.clickInviteUserButton();
    await inviteUserModal.typeEmail(
      `${testmailVars.namespace}.${randomTag}@${testmailVars.domain}`
    );
    await inviteUserModal.checkTaxpayerUserTypeRadioButton();
    await inviteUserModal.clickInviteButton();
    await waitForLoading();
    await page.waitForTimeout(5000);

    const response = await fetchJson<TestmailResponse>(`${ENDPOINT}&livequery=true`);
    const email = response.emails[0];

    expect(email.from).toBe("Localgov <no-reply@azavargovapps.com>");
    expect(email.subject).toBe("Welcome to Localgov!");
  });
});
