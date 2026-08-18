import { expect, test } from "@playwright/test";
import {
  FUNDED_BUSINESS,
  MONTHLY_FORM,
  createTaxpayerFiling,
  openAuditLogForReference,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As an AGS user, I should be able to navigate to the Audit Log page", () => {
  test.skip("Initiate test", async ({ page }) => {
    // skipped, covered already by TC7
    await deleteMatchingFilingsAsAgs(page, { accountIndex: 6, businessName: FUNDED_BUSINESS, formName: MONTHLY_FORM });
    const referenceId = await createTaxpayerFiling(page, {
      accountIndex: 0,
      businessName: FUNDED_BUSINESS,
    });
    const auditLog = await openAuditLogForReference(page, referenceId, 6);
    await expect(await auditLog.findRowByAction("Filing Status Updated Manually")).toBeVisible();
  });
});
