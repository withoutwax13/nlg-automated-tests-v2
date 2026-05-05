import { expect, test } from "@playwright/test";
import {
  createSubmittedApplication,
} from "../helpers";
import { currentPage, getTestmail, initTestRuntime, requestJson } from "../../support/runtime";

type TestmailResponse = {
  emails: Array<{
    from: string;
    subject: string;
    html: string;
  }>;
};

test.describe.skip("After submitting an application without fee, taxpayer user must receive an email with subject, content, and HTML structure similar to the editable template in the workflow.'", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const expectedFormName = "Business License (Annual) - E2E #1";
    const expectedGovernmentName = "City of Arrakis";
    const testmailVars = getTestmail();
    const testmailTag = "taxpayeronly1";
    const endpoint = `${testmailVars.endpoint}?apikey=${testmailVars.apiKey}&namespace=${testmailVars.namespace}&tag=${testmailTag}`;

    const { referenceId } = await createSubmittedApplication({
      accountIndex: 10,
      formName: expectedFormName,
    });

    await currentPage().waitForTimeout(30000);
    const response = await requestJson<TestmailResponse>(`${endpoint}&livequery=true`);
    const email = response.emails[0];

    expect(email.from).toBe("Localgov <no-reply@azavargovapps.com>");
    expect(email.subject).toBe("An Application Has Been Submitted on Localgov [Without Fee]");
    expect(email.html).toContain("Status: Pending");
    expect(email.html).toContain(`Reference ID: ${String(referenceId).toUpperCase()}`);
    expect(email.html).toContain(`Form Name: ${expectedFormName}`);
    expect(email.html).toContain(`Government: ${expectedGovernmentName}`);
  });
});
