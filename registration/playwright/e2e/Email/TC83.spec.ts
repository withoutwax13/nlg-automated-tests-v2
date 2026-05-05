import { expect, test } from "@playwright/test";
import {
  approveApplication,
  createSubmittedApplication,
  getTaxpayerRegistrationRecordId,
} from "../helpers";
import { currentPage, getTestmail, initTestRuntime, requestJson } from "../../support/runtime";

type TestmailResponse = {
  emails: Array<{
    from: string;
    subject: string;
    html: string;
  }>;
};

test.describe.skip("After submitting an application without making a payment, taxpayer user must receive an email with subject, content, and HTML structure similar to the editable template in the workflow.'", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const expectedFormName = "Business License (Annual) - E2E #1";
    const expectedGovernmentName = "City of Arrakis";
    const testmailVars = getTestmail();
    const endpoint = `${testmailVars.endpoint}?apikey=${testmailVars.apiKey}&namespace=${testmailVars.namespace}`;

    const { customData, referenceId } = await createSubmittedApplication({
      accountIndex: 10,
      formName: expectedFormName,
    });
    const registrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);

    await approveApplication({
      reviewerType: "ags",
      reviewerIndex: 1,
      registrationRecordId: String(registrationRecordId),
      locationAddress1: String(customData.locationInfo.locations[0].locationAddress1),
    });

    await currentPage().waitForTimeout(5000);
    const response = await requestJson<TestmailResponse>(`${endpoint}&livequery=true`);
    const email = response.emails[0];

    expect(email.from).toBe("Localgov <no-reply@azavargovapps.com>");
    expect(email.subject).toBe("[Action Required] Complete Payment to Finalize Your Application Approval on Localgov");
    expect(email.html).toContain("Status: Approved/Awaiting Payment");
    expect(email.html).toContain(`Reference ID: ${String(referenceId).toUpperCase()}`);
    expect(email.html).toContain(`Form Name: ${expectedFormName}`);
    expect(email.html).toContain(`Government: ${expectedGovernmentName}`);
    expect(email.html).toContain("Amount Due: $100");
  });
});
