import { test } from '@playwright/test';
import viewSubscription from "../../helpers/view-subscription";

const viewSubsription = async ({ page }: { page: import("@playwright/test").Page }) => {
  await viewSubscription(page);
};

test.describe("As a government user, I want to be able to view the list of Subscriptions", () => {
  test("Initiating test", viewSubsription);
});

export default viewSubsription;
