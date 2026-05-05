import { currentPage, listItem, waitForLoading, withText } from "../../support/runtime";

class BusinessDetails {
  userType: string;

  constructor(props: { userType: string }) {
    this.userType = props.userType;
  }

  private page() {
    return currentPage();
  }

  private elements() {
    const page = this.page();

    return {
      sectionTabsItems: (tabName: string) => page.locator("li").filter({ hasText: tabName }).first(),
      formsSectionFormList: () => page.locator(".k-switch").locator("xpath=.."),
      saveButton: () => withText(page.locator(".NLGButtonPrimary"), "Save"),
    };
  }

  async clickFormsTab() {
    await this.elements().sectionTabsItems("Forms").click({ force: true });
  }

  async enableForm(formName: string) {
    const formRow = this.elements().formsSectionFormList().filter({ hasText: formName }).first();
    const toggle = formRow.locator("input[type='checkbox']").first();
    const checked = await toggle.isChecked().catch(() => false);
    if (!checked) {
      await formRow.click({ force: true });
    }
    await this.elements().saveButton().click({ force: true });
    await waitForLoading();
  }
}

export default BusinessDetails;
