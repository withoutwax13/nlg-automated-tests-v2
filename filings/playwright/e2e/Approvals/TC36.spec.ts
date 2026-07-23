import { test } from "@playwright/test";
import ApprovalGrid from "../../objects/ApprovalGrid";
import { loginFresh } from "../helpers/filing-workflows";

test.describe("As a government user, I want to be able to export the list of Approvals", () => {
  test("Initiate test", async ({ page }) => {
    await loginFresh(page, { accountType: "municipal" });
    const approvalGrid = new ApprovalGrid(page, { userType: "municipal" });
    await approvalGrid.init();
    await approvalGrid.clickExportButton();
  });
});
