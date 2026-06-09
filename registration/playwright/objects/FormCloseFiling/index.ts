import { type Page } from "@playwright/test";
import Form from "../Form";

class FormCloseFiling extends Form {
  constructor(page: Page, props = { isRenewal: false }) {
    super(page, props);
  }
}

export default FormCloseFiling;
