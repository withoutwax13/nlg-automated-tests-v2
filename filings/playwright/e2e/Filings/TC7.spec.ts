import { expect, test } from "@playwright/test";
import {
  FUNDED_BUSINESS,
  createTaxpayerFiling,
  fundFilingAsAgs,
  openAuditLogForReference,
} from "../helpers/filing-workflows";

test.describe("As an AGS user, I should be able to see Payment Submitted logs on the audit log for Funded filings", () => {
  test("Initiate test", async ({ page }) => {
    const referenceId = await createTaxpayerFiling(page, {
      accountIndex: 1,
      businessName: FUNDED_BUSINESS,
    });
    await fundFilingAsAgs(page, referenceId, 5);
    const auditLog = await openAuditLogForReference(page, referenceId, 5);
    await expect(await auditLog.findRowByAction("Payment Submitted")).toBeVisible();
  });
});
