import { expect, test } from "@playwright/test";
import ApprovalGrid from "../../objects/ApprovalGrid";
import {
  DEFAULT_BUSINESS,
  MONTHLY_FORM,
  createTaxpayerFiling,
  rejectReference,
  deleteMatchingFilingsAsAgs
} from "../helpers/filing-workflows";

test.describe("As a government user, I want to be able to see message of an rejected filing in approval list", () => {
  test("Initiate test", async ({ page }) => {
    await deleteMatchingFilingsAsAgs(page, { accountIndex: 0, businessName: DEFAULT_BUSINESS, formName: MONTHLY_FORM });
    const referenceId = await createTaxpayerFiling(page, {
      accountIndex: 8,
      businessName: DEFAULT_BUSINESS,
    });
    await rejectReference(page, referenceId);

    const approvalGrid = new ApprovalGrid(page, { userType: "municipal" });
    await approvalGrid.init();
    const messageIcon = await approvalGrid.getElementOfColumn("Message", "Reference ID", referenceId);
    await messageIcon.click();
    const messageModalContent = page.locator(".k-dialog-content").filter({ hasText: "Rejected" });
    expect(messageModalContent).toBeVisible();
  });
});
