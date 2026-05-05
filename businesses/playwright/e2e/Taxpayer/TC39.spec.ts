import { test, expect, login, logout, deleteBusinessData, expectCurrentUrlToInclude } from '../../support/test';
import BusinessDetails from "../../objects/BusinessDetails";
import BusinessGrid from "../../objects/BusinessGrid";

const taxpayerBusinessList = new BusinessGrid({ userType: "taxpayer" });
const taxpayerBusinessDetails = new BusinessDetails({ userType: "taxpayer" });

test.describe("As a taxpayer, I should be able to see my business information in my business details page", () => {
  test("Initiating test", async () => {
    await login({ accountType: "taxpayer", accountIndex: 1 });
    await taxpayerBusinessList.init();
    await taxpayerBusinessList.viewBusinessDetails("Arrakis Spice Company 13685");
    await expectCurrentUrlToInclude("/BusinessesApp/BusinessDetails/");

    const businessFields = {
      "Business Name": "Arrakis Spice Company 13685",
      DBA: "Arrakis Spice Company 13685",
      "Location Address 1": "123 Desert Road",
      "Location Address 2": "Suite 100",
      "Location City": "Dune",
      "Location State": "AK",
      "Location Zip Code": "90210"
    };

    for (const [field, value] of Object.entries(businessFields)) {
      const data = await taxpayerBusinessDetails.getBusinessData(field);
      expect(data).toEqual(value);
    }
  });
});
