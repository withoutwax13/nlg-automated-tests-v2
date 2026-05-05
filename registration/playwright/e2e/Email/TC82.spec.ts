import { expect, test } from "@playwright/test";
import {
  approveApplication,
  createSubmittedApplication,
  getTaxpayerRegistrationRecordId,
  markApprovalPaymentStatus,
  payApplicationAsTaxpayer,
} from "../helpers";
import { currentPage, getTestmail, initTestRuntime, requestJson } from "../../support/runtime";

type TestmailResponse = {
  emails: Array<{
    from: string;
    subject: string;
    html: string;
  }>;
};

test.describe.skip("After the reviewer approved an application, taxpayer user must receive an email with subject, content, and HTML structure similar to the editable template in the workflow.'", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const expectedFormName = "Business License (Annual) - E2E #1";
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
    await payApplicationAsTaxpayer({
      registrationRecordId: String(registrationRecordId),
      taxpayerIndex: 10,
    });
    await markApprovalPaymentStatus({
      reviewerIndex: 1,
      registrationRecordId: String(registrationRecordId),
      toStatus: "Fully Paid",
    });

    await currentPage().waitForTimeout(30000);
    const response = await requestJson<TestmailResponse>(`${endpoint}&livequery=true`);
    const email = response.emails[0];

    expect(email.from).toBe("Localgov <no-reply@azavargovapps.com>");
    expect(email.subject).toBe("An Application Has Been Approved on Localgov");
    expect(email.html).toContain("Application Status:</span> Approved");
    expect(email.html).toContain(`Reference ID:</span>\t${String(referenceId).toUpperCase()}`);
    expect(email.html).toContain(`Form Name:</span>\t${expectedFormName}`);
  });
});
