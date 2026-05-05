import ApprovalGrid from "../../objects/ApprovalGrid";

const govApprovalGrid = new ApprovalGrid({ userType: "municipal" });

describe("As a government user, I want to be able to export the list of Approvals", () => {
  it("Initiate test", () => {
    cy.login({ accountType: "municipal" });
    govApprovalGrid.init();
    govApprovalGrid.clickExportButton();
  });
});
