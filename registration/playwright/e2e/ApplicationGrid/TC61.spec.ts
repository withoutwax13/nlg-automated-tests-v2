import { expect, test } from "@playwright/test";
import ApplicationGrid from "../../objects/ApplicationGrid";
import FilingGrid from "../../objects/FilingGrid";
import { createSubmittedApplication } from "../helpers";
import { getStoredValue, initTestRuntime, login, logout } from "../../support/runtime";
import Login from "../../utils/Login";

test.describe("As a user, pending application should be deleted if the corresponding filing is deleted.", () => {
  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const agsApplicationGrid = new ApplicationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });
    const filingGrid = new FilingGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });

    await createSubmittedApplication({
      accountIndex: 4,
      formName: "Business License (Annual) - E2E #1",
    });
    const referenceId = getStoredValue<string>("referenceId");

    await logout();
    await Login.login({ accountType: "ags", notFirstLogin: true, accountIndex: 4 });
    await agsApplicationGrid.init();
    expect(
      await agsApplicationGrid.getDataOfColumn("Application Status", "Reference ID", referenceId, "applicationStatus")
    ).toBe("Pending");
    await filingGrid.init();
    await filingGrid.deleteFiling("Reference ID", referenceId);
    await agsApplicationGrid.init(false);
    await agsApplicationGrid.filterColumn("Reference ID", referenceId);
    await expect(agsApplicationGrid.getElement().noRecordFoundComponent()).toBeVisible();
  });
});