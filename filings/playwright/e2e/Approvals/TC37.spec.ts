import { expect, test } from "@playwright/test";
import ApprovalGrid from "../../objects/ApprovalGrid";
import {
  DEFAULT_BUSINESS,
  approveReference,
  createTaxpayerFiling,
} from "../helpers/filing-workflows";

test.describe("As a government user, I want to be able to see message of an approved filing in approval list", () => {
  test("Initiate test", async ({ page }) => {
    const referenceId = await createTaxpayerFiling(page, {
      accountIndex: 7,
      businessName: DEFAULT_BUSINESS,
    });
    await approveReference(page, referenceId);

    const approvalGrid = new ApprovalGrid(page, { userType: "municipal" });
    await approvalGrid.init();
    const message = await approvalGrid.getDataOfColumn("Message", "Reference ID", referenceId);
    expect(message).toContain("Approved");
  });
});
