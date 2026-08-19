import { expect, test } from "../../fixtures/test";
import {
  MONTHLY_FORM,
  createTaxpayerFiling,
  openAuditLogForReference,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As an AGS user, I should be able to navigate to the Audit Log page", () => {
  test.skip("Initiate test", async ({ page, resourceSlot }) => {
    // skipped, covered already by TC7
    await deleteMatchingFilingsAsAgs(page, resourceSlot, {
      businessName: resourceSlot.businesses.funded,
      formName: MONTHLY_FORM,
    });
    const referenceId = await createTaxpayerFiling(page, resourceSlot, {
      businessName: resourceSlot.businesses.funded,
    });
    const auditLog = await openAuditLogForReference(page, resourceSlot, referenceId);
    await expect(await auditLog.findRowByAction("Filing Status Updated Manually")).toBeVisible();
  });
});
