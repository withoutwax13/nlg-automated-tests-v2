import { expect, test } from "@playwright/test";
import Profile from "../../objects/Profile";
import { bindRuntime, login } from "../../support/runtime";
import Login from "../../utils/Login";

const randomSeed = Math.floor(Math.random() * 10000);
const profile = new Profile();

test.describe("As a user, I should be able to edit my account details", () => {
  test("Initiating test", async ({ page, request }) => {
    bindRuntime(page, request);
    await Login.login({ accountType: "taxpayer", accountIndex: 3 });
    await profile.init();
    await profile.typeFirstName(`QA #${randomSeed}`);
    await expect(profile.getElement().firstNameInput()).toHaveValue(`QA #${randomSeed}`);
    await expect(profile.getElement().saveChangesButton()).toBeVisible();
    await profile.clickSaveChanges();
    await profile.typeLastName(`Specialist #${randomSeed}`);
    await expect(profile.getElement().lastNameInput()).toHaveValue(`Specialist #${randomSeed}`);
    await expect(profile.getElement().saveChangesButton()).toBeVisible();
    await profile.clickSaveChanges();
    await profile.init();
    await expect(profile.getElement().firstNameInput()).toHaveValue(`QA #${randomSeed}`);
    await expect(profile.getElement().lastNameInput()).toHaveValue(`Specialist #${randomSeed}`);
  });
});