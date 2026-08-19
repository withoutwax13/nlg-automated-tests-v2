import { expect, test } from "../../fixtures/test";
import ApprovalGrid from "../../objects/ApprovalGrid";
import {
  MONTHLY_FORM,
  approveReference,
  createTaxpayerFiling,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As a government user, I want to be able to see message of an approved filing in approval list", () => {
  test("Initiate test", { tag: ["@slot-01", "@ags", "@municipal", "@taxpayer"] }, async ({ page, resourceSlot }) => {
    await deleteMatchingFilingsAsAgs(page, resourceSlot, {
      businessName: resourceSlot.businesses.default,
      formName: MONTHLY_FORM,
    });
    const referenceId = await createTaxpayerFiling(page, resourceSlot, {
      businessName: resourceSlot.businesses.default,
    });
    await approveReference(page, resourceSlot, referenceId);

    const approvalGrid = new ApprovalGrid(page, { userType: "municipal" });
    await approvalGrid.init();
    const messageIcon = await approvalGrid.getElementOfColumn("Message", "Reference ID", referenceId);
    await messageIcon.click();
    const messageModalContent = page.locator(".k-dialog-content").filter({ hasText: "Approved" });
    await expect(messageModalContent).toBeVisible();
  });
});
