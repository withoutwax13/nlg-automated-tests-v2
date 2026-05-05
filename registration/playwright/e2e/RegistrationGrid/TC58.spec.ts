import { expect, test } from "@playwright/test";
import RegistrationGrid from "../../objects/RegistrationGrid";
import {
  approveApplication,
  createSubmittedApplication,
  getTaxpayerRegistrationRecordId,
  markApprovalPaymentStatus,
  payApplicationAsTaxpayer,
} from "../helpers";
import { getStoredValue, initTestRuntime, logout, setStoredValue } from "../../support/runtime";

test.describe("When the business is linked and the application is approved, the current registration will be deleted, and a new one will be created with the linked business info.", () => {
  test.beforeEach(async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const agsRegistrationGrid = new RegistrationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });

    const { customData, referenceId } = await createSubmittedApplication({
      accountIndex: 4,
      formName: "Business License (Annual) - E2E #1",
    });
    setStoredValue("initialRegistrationData", customData);
    const revokedRegistrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);
    setStoredValue("revokedRegistrationRecordId", revokedRegistrationRecordId);

    await approveApplication({
      reviewerType: "ags",
      reviewerIndex: 4,
      registrationRecordId: String(revokedRegistrationRecordId),
      locationAddress1: String(customData.locationInfo.locations[0].locationAddress1),
    });
    await payApplicationAsTaxpayer({
      registrationRecordId: String(revokedRegistrationRecordId),
      taxpayerIndex: 4,
    });
    await markApprovalPaymentStatus({
      reviewerIndex: 4,
      registrationRecordId: String(revokedRegistrationRecordId),
      toStatus: "Fully Paid",
    });

    await agsRegistrationGrid.init();
    await agsRegistrationGrid.manuallyChangeRegistrationStatus(
      "Revoked",
      "Registration Record ID",
      String(revokedRegistrationRecordId)
    );
    await logout();
  });

  test("Initiating test", async ({ page, request }, testInfo) => {
    await initTestRuntime({ page, request, baseURL: testInfo.project.use.baseURL as string });
    const agsRegistrationGrid = new RegistrationGrid({
      userType: "ags",
      municipalitySelection: "City of Arrakis",
    });

    const initialRegistrationData = getStoredValue<any>("initialRegistrationData");
    const revokedRegistrationRecordId = getStoredValue<string>("revokedRegistrationRecordId");
    const { customData, referenceId } = await createSubmittedApplication({
      accountIndex: 4,
      formName: "Business License (Annual) - E2E #1",
    });
    const registrationRecordId = await getTaxpayerRegistrationRecordId(referenceId);

    await approveApplication({
      reviewerType: "ags",
      reviewerIndex: 4,
      registrationRecordId: String(registrationRecordId),
      locationAddress1: String(customData.locationInfo.locations[0].locationAddress1),
      linkExistingBusinessValue: String(
        initialRegistrationData.locationInfo.locations[0].locationDBA.match(/\d+/)[0]
      ),
    });
    await payApplicationAsTaxpayer({
      registrationRecordId: String(registrationRecordId),
      taxpayerIndex: 4,
    });
    await markApprovalPaymentStatus({
      reviewerIndex: 4,
      registrationRecordId: String(registrationRecordId),
      toStatus: "Fully Paid",
    });

    await agsRegistrationGrid.init();
    await agsRegistrationGrid.filterColumn("Registration Record ID", String(revokedRegistrationRecordId));
    await expect(agsRegistrationGrid.getElement().noRecordFoundComponent()).toHaveCount(0);
    await agsRegistrationGrid.clickClearAllFiltersButton();
    await agsRegistrationGrid.filterColumn("Registration Record ID", String(registrationRecordId));
    await expect(agsRegistrationGrid.getElement().noRecordFoundComponent()).toHaveCount(0);
  });
});
