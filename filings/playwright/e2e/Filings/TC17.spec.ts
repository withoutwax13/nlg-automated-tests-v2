import { test } from "../../fixtures/test";
import FilingGrid from "../../objects/FilingGrid";
import { MONTHLY_FORM, loginFresh } from "../helpers/filing-workflows";

test.describe("As a municipal user, I should be able to export specific view of a filing data.", () => {
  test("As a municipal user, I should be able to export specific view of a filing data.", { tag: ["@slot-07", "@municipal"] }, async ({ page, resourceSlot }) => {
    await loginFresh(page, resourceSlot, { accountType: "municipal" });
    const filingGrid = new FilingGrid(page, { userType: "municipal" });
    await filingGrid.init();
    await filingGrid.filterColumn("Form Name", MONTHLY_FORM, "multi-select");
    await filingGrid.clickExportButton(false, "Excel");
  });
});
