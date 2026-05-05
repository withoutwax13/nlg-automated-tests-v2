import { test } from '@playwright/test';
import viewMunicipalities from "../../helpers/view-municipalities";

const viewmunicipalities = async ({ page }: { page: import("@playwright/test").Page }) => {
  await viewMunicipalities(page);
};

test.describe("As a government user, I want to be able to view the list of Municipalities", () => {
  test("Initiating test", viewmunicipalities);
});

export default viewmunicipalities;
