import { expect, test } from "@playwright/test";
import {
  FUNDED_BUSINESS,
  MONTHLY_FORM,
  createTaxpayerFiling,
  openAuditLogForReference,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As an AGS user, I should be able to navigate to the Audit Log page", () => {
  test("Initiate test", async ({ page }) => {
    await deleteMatchingFilingsAsAgs(page, { accountIndex: 0, businessName: FUNDED_BUSINESS, formName: MONTHLY_FORM });
    const referenceId = await createTaxpayerFiling(page, {
      accountIndex: 2,
      businessName: FUNDED_BUSINESS,
    });
    const auditLog = await openAuditLogForReference(page, referenceId, 6);
    await expect(await auditLog.findRowByAction("Payment Submitted")).toBeVisible();
  });
});
