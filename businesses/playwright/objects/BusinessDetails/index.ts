import { expect } from "@playwright/test";
import { buttonByText, currentPage, fillDateInput, fixturePath, listItem } from "../../support/native-helpers";
import SetBusinessStatusModal from "../SetBusinessStatusModal";

class BusinessDetails {
  userType: string;
  setBusinessStatusModal: SetBusinessStatusModal;

  constructor(props: { userType: string }) {
    this.userType = props.userType;
    this.setBusinessStatusModal = new SetBusinessStatusModal();
  }

  private page() {
    return currentPage();
  }

  private normalize(value: string) {
    return value.replace(/\s+/g, " ").trim();
  }

  private elements() {
    return {
      anyList: () => this.page().locator("li"),
      pageTitle: () => this.page().locator("h1").first(),
      toastComponent: () => this.page().locator(".Toastify").first(),
      backToBusinessesButton: () => this.page().locator(".NLG-Hyperlink").filter({ hasText: "Back" }).first(),
      saveButton: () => this.page().locator(".NLGButtonPrimary").filter({ hasText: "Save" }).first(),
      discardChangesButton: () => this.page().locator(".NLGButtonSecondary").filter({ hasText: "Discard Changes" }).first(),
      businessStatusIndicator: () => this.getElement().pageTitle().locator("xpath=following-sibling::*[1]").first(),
      aboutBusinessSection: () => this.page().locator("section").nth(0),
      editBusinessInfoButton: () => this.getElement().aboutBusinessSection().locator(".NLGButtonSecondary").filter({ hasText: "Edit Business Info" }).first(),
      businessInfoList: () => this.getElement().editBusinessInfoButton().locator("xpath=following-sibling::*[1]").first(),
      sectionTabs: () => this.getElement().aboutBusinessSection().locator("xpath=following-sibling::*[1]").first(),
      sectionTabsItems: (tabName: string) => this.getElement().sectionTabs().locator("ul li").filter({ hasText: tabName }).first(),
      formsSection: () => this.page().locator("section").nth(1).locator("h3").first().locator("xpath=../.."),
      formsSectionTitle: () => this.getElement().formsSection().locator("h3").first(),
      formsSectionHelpText: () => this.getElement().formsSection().locator("p").first(),
      formsSectionFormList: () => this.getElement().formsSection().locator(".k-switch").locator("xpath=.."),
      taxpayerFormsSectionFormList: () => this.getElement().formsSection().locator("div").nth(1),
      formSectionFormListItem: (formName: string) => this.getElement().formsSectionFormList().filter({ hasText: formName }).first(),
      businessStatusSection: () => this.page().locator("section").nth(1).locator("h3").filter({ hasText: "Business Status" }).first().locator("xpath=ancestor::section[1]"),
      startDateDelinquencyTrackingInput: () =>
        this.page().locator("label").filter({ hasText: "Start Date for Delinquency Tracking" }).first().locator("xpath=following-sibling::*[1]").locator("input").first(),
      businessCloseDateInput: () =>
        this.page().locator("label").filter({ hasText: "Business Close Date" }).first().locator("xpath=following-sibling::*[1]").locator("input").first(),
      operatingStatusDropdown: () =>
        this.page().locator("label").filter({ hasText: "Operating Status" }).first().locator("xpath=following-sibling::*[1]").locator("i").first(),
      notesSection: () => this.getElement().sectionTabs().locator("div[class*='businessDetailsSectionContent']").first(),
      addNoteButton: () => this.getElement().notesSection().locator("button").filter({ hasText: "Add a Note" }).first(),
      noteItems: () => this.getElement().notesSection().locator(".k-expander"),
      noteItem: (pos: number) => this.getElement().noteItems().nth(pos),
      deleteNoteButton: (pos: number) => this.getElement().noteItem(pos).locator(".fa-trash").first(),
      uploadDocumentSection: () => this.getElement().sectionTabs().locator("div[class*='businessDetailsSectionContent']").first(),
      uploadDocumentButton: () => this.getElement().uploadDocumentSection().locator("button").filter({ hasText: "Upload Document" }).first(),
    };
  }

  getElement() {
    return this.elements();
  }

  async clickBackToBusinessesButton() {
    await this.getElement().backToBusinessesButton().click();
  }

  async clickSaveButton() {
    const updateBusiness = this.page().waitForResponse(
      (response) => response.request().method() === "PUT" && response.url().includes("/businesses/") && response.url().includes("/update"),
    );
    await this.getElement().saveButton().click();
    expect((await updateBusiness).status()).toBe(200);
  }

  async clickDiscardChangesButton() {
    await this.getElement().discardChangesButton().click();
  }

  async clickEditBusinessInfoButton() {
    await this.getElement().editBusinessInfoButton().click();
  }

  async clickFormsTab() {
    await this.getElement().sectionTabsItems("Forms").click();
  }

  async clickBusinessStatusTab() {
    await this.getElement().sectionTabsItems("Business Status").click();
  }

  async clickNotesTab() {
    await this.getElement().sectionTabsItems("Notes").click();
  }

  async clickDocumentsTab() {
    await this.getElement().sectionTabsItems("Documents").click();
  }

  async getFormRequirements() {
    if (this.userType !== "taxpayer") {
      const forms = this.getElement().formsSectionFormList();
      const count = await forms.count();
      const requirements: string[] = [];

      for (let index = 0; index < count; index += 1) {
        requirements.push(this.normalize(await forms.nth(index).locator("span").first().innerText()));
      }

      return requirements;
    }

    const forms = this.getElement().taxpayerFormsSectionFormList().locator("li");
    const count = await forms.count();
    const requirements: string[] = [];

    for (let index = 0; index < count; index += 1) {
      requirements.push(this.normalize(await forms.nth(index).innerText()));
    }

    return requirements;
  }

  async getEnabledFormRequirements() {
    const forms = this.getElement().formsSectionFormList();
    const count = await forms.count();
    const requirements: string[] = [];

    for (let index = 0; index < count; index += 1) {
      const form = forms.nth(index);
      if ((await form.locator("input").first().getAttribute("checked")) !== null) {
        requirements.push(this.normalize(await form.locator("span").first().innerText()));
      }
    }

    return requirements;
  }

  async setStartDateDelinquencyTracking(date: { month: number; date: number; year: number }) {
    await fillDateInput(this.getElement().startDateDelinquencyTrackingInput(), date);
  }

  async triggerSetBusinessStatusModal() {
    await this.getElement().businessCloseDateInput().click();
    await this.getElement().businessCloseDateInput().fill("1");
  }

  async setBusinessCloseDate(
    date: { month: number; date: number; year: number },
    changeLastAcceptFilingDate = true,
  ) {
    await this.triggerSetBusinessStatusModal();
    await this.setBusinessStatusModal.setBusinessCloseDate(date);
    if (changeLastAcceptFilingDate) {
      await this.setBusinessStatusModal.setLastAcceptFilingDate({
        month: date.month,
        date: date.date > 28 ? 28 : date.date + 1,
        year: date.year,
      });
    }
    await this.setBusinessStatusModal.setBusinessStatus("Closed");
    await this.setBusinessStatusModal.clickSaveButton();
  }

  async setOperatingStatus(status: string) {
    if (!["Active", "Active/Seasonal", "Inactive", "Closed", "Sold"].includes(status)) {
      throw new Error("Invalid operating status");
    }
    await this.getElement().operatingStatusDropdown().click();
    await listItem(status).click();
  }

  async clickAddNoteButton() {
    await this.getElement().addNoteButton().scrollIntoViewIfNeeded();
    await this.getElement().addNoteButton().click();
  }

  async clickCancelNoteButton() {
    const cancelButton = buttonByText("Cancel");
    await cancelButton.scrollIntoViewIfNeeded();
    await cancelButton.click();
  }

  async addNote(note: string) {
    const addNote = this.page().waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        response.url().includes("/businesses/MunicipalBusiness/Note?businessHandle="),
    );
    await this.clickAddNoteButton();
    await this.page().locator("textarea").fill(note);
    await this.getElement().saveButton().click();
    expect((await addNote).status()).toBe(200);
  }

  async clickNoteItem(pos: number) {
    await this.getElement().noteItem(pos).click();
  }

  async deleteNoteItem(pos: number) {
    const deleteNote = this.page().waitForResponse(
      (response) =>
        response.request().method() === "PUT" &&
        response.url().includes("/businesses/municipalityBusiness/update"),
    );
    await this.getElement().deleteNoteButton(pos).click();
    expect((await deleteNote).status()).toBe(200);
  }

  async uploadDocument(fileName: string) {
    const uploadDocumentPatch = this.page().waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        response.url().includes("/businesses/MunicipalBusiness/Document/upload?businessHandle="),
    );
    const uploadDocumentPut = this.page().waitForResponse(
      (response) => response.request().method() === "PUT" && response.url().includes("businessuploadeddocumentsbu"),
    );
    await this.getElement().uploadDocumentButton().click();
    await this.page().locator('input[placeholder="Enter file name"]').fill(fileName);
    await this.page().locator("#files").setInputFiles(fixturePath("example.json"));
    await this.page().locator(".NLGButtonPrimary").filter({ hasText: "Upload" }).first().click();
    expect((await uploadDocumentPatch).status()).toBe(200);
    expect((await uploadDocumentPut).status()).toBe(200);
  }

  async getBusinessData(businessField: string) {
    const aboutSection = this.getElement().aboutBusinessSection().getByText("About this business", { exact: false }).first();
    const container = this.userType === "taxpayer"
      ? aboutSection.locator("xpath=following-sibling::*[1]")
      : aboutSection.locator("xpath=following-sibling::*[2]");
    const value = container.locator("span").filter({ hasText: businessField }).first().locator("xpath=following-sibling::*[1]").first();
    return this.normalize(await value.innerText());
  }
}

export default BusinessDetails;
