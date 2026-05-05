import { test, expect } from '../../support/pwtest';
import ApprovalGrid from "../../objects/ApprovalGrid";

const govApprovalGrid = new ApprovalGrid({ userType: "municipal" });

test.describe("As a government user, I want to be able to export the list of Approvals", () => {
  test("Initiate test", () => {
    cy.login({ accountType: "municipal" });
    govApprovalGrid.init();
    govApprovalGrid.clickExportButton();
  });
});
