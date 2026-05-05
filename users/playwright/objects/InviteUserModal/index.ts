import { currentPage, listItem, waitForLoading } from "../../support/runtime";

class InviteUserModal {
  private modal() {
    return currentPage().locator(".k-dialog").first();
  }

  private elements() {
    return {
      modal: () => this.modal(),
      title: () => this.modal().locator(".k-dialog-title").first(),
      closeModalButton: () => this.modal().locator('button[aria-label="Close"]').first(),
      modalContent: () => this.modal().locator(".k-dialog-content").first(),
      cancelButton: () => this.modal().locator("button").filter({ hasText: "Cancel" }).first(),
      inviteButton: () => this.modal().locator("button").filter({ hasText: "Invite" }).first(),
      userTypeRadioButton: (userGroup: string) =>
        this.modal().locator(".k-radio-item").filter({ hasText: userGroup }).first(),
      emailInput: () => this.modal().locator("input#Email").first(),
      subscriptionTypeDropdown: () =>
        this.modal()
          .locator("label")
          .filter({ hasText: "Select subscription type" })
          .first()
          .locator("xpath=../following-sibling::*[1]")
          .locator(".k-dropdownlist")
          .first(),
      municipalityDropdown: () =>
        this.modal()
          .locator("label")
          .filter({ hasText: "Select Municipality" })
          .first()
          .locator("xpath=../following-sibling::*[1]")
          .locator(".k-dropdownlist")
          .first(),
    };
  }

  getElement() {
    return this.elements();
  }

  async selectSubscriptionType(subscriptionType: string) {
    await this.getElement().subscriptionTypeDropdown().click();
    await listItem(subscriptionType).click();
  }

  async selectMunicipality(municipality: string) {
    await this.getElement().municipalityDropdown().click();
    await listItem(municipality).click();
  }

  async clickCloseModalButton() {
    await this.getElement().closeModalButton().click();
  }

  async clickCancelButton() {
    await this.getElement().cancelButton().click();
  }

  async clickInviteButton() {
    await this.getElement().inviteButton().click();
  }

  async checkAGSUserTypeRadioButton() {
    await this.getElement().userTypeRadioButton("AGS User").click();
  }

  async checkMunicipalUserTypeRadioButton() {
    await this.getElement().userTypeRadioButton("Municipal User").click();
  }

  async checkTaxpayerUserTypeRadioButton() {
    await this.getElement().userTypeRadioButton("Taxpayer User").click();
  }

  async checkSuperUserTypeRadioButton() {
    await this.getElement().userTypeRadioButton("Super User").click();
  }

  async checkAuditAdminUserTypeRadioButton() {
    await this.getElement().userTypeRadioButton("Audit Admin User").click();
  }

  async checkCaseManagementUserTypeRadioButton() {
    await this.getElement().userTypeRadioButton("Case Management").click();
  }

  async typeEmail(email: string) {
    await this.getElement().emailInput().fill(email);
    await waitForLoading(3);
  }
}

export default InviteUserModal;
