import { test, expect } from '../../test';
import { login, logout, waitForLoading, checkAccessibility } from '../../utils/runtime';
import ApprovalGrid from "../../objects/ApprovalGrid";

const govApprovalGrid = new ApprovalGrid({ userType: "municipal" });

test.describe("As a government user, I want to be able to export the list of Approvals", () => {
  test("Initiate test", async ({ page }) => {
    await login({ accountType: "municipal" });
    govApprovalGrid.init();
    govApprovalGrid.clickExportButton();
  });
});
