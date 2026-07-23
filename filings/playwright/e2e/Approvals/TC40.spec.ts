import { expect, test } from "@playwright/test";
import ApprovalGrid from "../../objects/ApprovalGrid";
import { loginFresh } from "../helpers/filing-workflows";

test.describe("As a government user, I want to be able to start all the pending Approvals", () => {
  test("Initiate test", async ({ page }) => {
    await loginFresh(page, { accountType: "municipal" });
    const approvalGrid = new ApprovalGrid(page, { userType: "municipal" });
    await approvalGrid.init();
    await approvalGrid.clickStartAllApprovals();
    await expect(page.locator("body")).toContainText(/Approval|Review|workflow/i);
  });
});
