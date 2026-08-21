import { expect, test } from "../../fixtures/test";
import {
  MONTHLY_FORM,
  createTaxpayerFiling,
  fundFilingAsAgs,
  openAuditLogForReference,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As an AGS user, I should be able to see Payment Submitted logs on the audit log for Funded filings", () => {
  test("As an AGS user, I should be able to see Payment Submitted logs on the audit log for Funded filings", { tag: ["@slot-06", "@ags", "@taxpayer", "@business-funded"] }, async ({ page, resourceSlot }) => {
    await deleteMatchingFilingsAsAgs(page, resourceSlot, {
      businessName: resourceSlot.businesses.funded,
      formName: MONTHLY_FORM,
    });
    const referenceId = await createTaxpayerFiling(page, resourceSlot, {
      businessName: resourceSlot.businesses.funded,
    });
    await fundFilingAsAgs(page, resourceSlot, referenceId);
    const auditLog = await openAuditLogForReference(page, resourceSlot, referenceId);
    await expect(await auditLog.findRowByAction("Filing Status Updated Manually")).toBeVisible();
  });
});
