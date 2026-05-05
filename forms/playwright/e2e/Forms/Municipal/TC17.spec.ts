import { expect, test } from "@playwright/test";
import Form from "../../../objects/Form";
import FormGrid from "../../../objects/FormGrid";
import {
  currentPage,
  initTestRuntime,
  login,
  waitForLoading,
  wasStubCalled,
  stubNewWindow,
} from "../../../support/runtime";

const municipalFormsGrid = new FormGrid({ userType: "municipal" });
const previewForm = new Form();

const expectStepToBeCurrent = async (stepperName: string) => {
  await expect(previewForm.getElement().getStepper(stepperName)).toHaveAttribute(
    "aria-current",
    "true"
  );
};

test.describe("As an muinicipal user, I want to be able to navigate the form pages without validation", () => {
  test("Initiate test", async ({ page }, testInfo) => {
    await initTestRuntime({ page, baseURL: testInfo.project.use.baseURL as string });
    await login({ accountType: "municipal", accountIndex: 2 });
    await municipalFormsGrid.init();
    await stubNewWindow("previewFormWindow");
    await municipalFormsGrid.toggleActionButton(
      "filter",
      "Preview",
      "Form Title",
      "Food and Beverage Tax Return (Monthly)"
    );

    expect(wasStubCalled("previewFormWindow")).toBe(true);
    await expect(currentPage()).toHaveURL(/\?preview=yes/);
    await expectStepToBeCurrent("Instructions");
    await expect(previewForm.getElement().nextButton()).toBeEnabled();

    await previewForm.clickNextbutton();
    await waitForLoading();
    await expect(previewForm.getElement().nextButton()).toBeDisabled();

    await previewForm.clickSkipRequiredFieldsCheckbox();
    await expect(previewForm.getElement().nextButton()).toBeEnabled();
    await expect(previewForm.getElement().overrideEnabledInfoText()).toBeVisible();
    await expect(previewForm.getElement().overrideEnabledInfoText()).toContainText(
      "The required fields override is enabled. During this preview, the form will not behave the same as it would for business users."
    );

    await expectStepToBeCurrent("Basic Info");
    await expect(previewForm.getElement().nextButton()).toBeEnabled();
    await previewForm.clickNextbutton();
    await waitForLoading();

    await expectStepToBeCurrent("Tax Info");
    await expect(previewForm.getElement().nextButton()).toBeEnabled();
    await previewForm.clickNextbutton();
    await waitForLoading();

    await expectStepToBeCurrent("Preparer Info");
    await expect(previewForm.getElement().nextButton()).toBeEnabled();
    await previewForm.clickNextbutton();
    await waitForLoading();

    await expectStepToBeCurrent("Preview");
  });
});
