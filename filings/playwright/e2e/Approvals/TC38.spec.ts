import { expect, test } from "../../fixtures/test";
import ApprovalGrid from "../../objects/ApprovalGrid";
import {
  MONTHLY_FORM,
  createTaxpayerFiling,
  rejectReference,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As a government user, I want to be able to see message of an rejected filing in approval list", () => {
  test("As a government user, I want to be able to see message of an rejected filing in approval list", { tag: ["@slot-04", "@ags", "@municipal", "@taxpayer", "@business-default"] }, async ({ page, resourceSlot }) => {
    await deleteMatchingFilingsAsAgs(page, resourceSlot, {
      businessName: resourceSlot.businesses.default,
      formName: MONTHLY_FORM,
    });
    const referenceId = await createTaxpayerFiling(page, resourceSlot, {
      businessName: resourceSlot.businesses.default,
    });
    await rejectReference(page, resourceSlot, referenceId);

    const approvalGrid = new ApprovalGrid(page, { userType: "municipal" });
    await approvalGrid.init();
    const messageIcon = await approvalGrid.getElementOfColumn("Message", "Reference ID", referenceId);
    await messageIcon.click();
    const messageModalContent = page.locator(".k-dialog-content").filter({ hasText: "Rejected" });
    await expect(messageModalContent).toBeVisible();
  });
});
