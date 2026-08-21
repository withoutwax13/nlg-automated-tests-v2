import { expect, test } from "../../fixtures/test";
import ApprovalGrid from "../../objects/ApprovalGrid";
import { loginFresh } from "../helpers/filing-workflows";

test.describe("As a government user, I want to be able to start all the pending Approvals", () => {
  test.skip(
    process.env.E2E_RUN_GLOBAL_STATE !== "true",
    "This test mutates all pending approvals and must run explicitly in a one-worker, unsharded lane."
  );

  test("As a government user, I want to be able to start all the pending Approvals", async ({ page, resourceSlot }, testInfo) => {
    if (testInfo.config.workers !== 1 || (testInfo.config.shard?.total ?? 1) > 1) {
      throw new Error("TC40 requires --workers=1 and an unsharded Playwright run.");
    }

    await loginFresh(page, resourceSlot, { accountType: "municipal" });
    const approvalGrid = new ApprovalGrid(page, { userType: "municipal" });
    await approvalGrid.init();
    await approvalGrid.clickStartAllApprovals();
    await expect(page.locator("body")).toContainText(/Approval|Review|workflow/i);
  });
});
