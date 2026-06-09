import { type Page } from "@playwright/test";
import BusinessAdd from "../BusinessAdd";

class BusinessUpdate extends BusinessAdd {
  constructor(page: Page, props: { userType: "ags" | "municipal" | "taxpayer" }) {
    super(page, props);
  }
}

export default BusinessUpdate;
