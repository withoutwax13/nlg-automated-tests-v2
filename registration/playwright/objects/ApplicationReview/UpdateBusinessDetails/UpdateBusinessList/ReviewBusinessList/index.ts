class ReviewBusinessList {
  constructor() {}
  private elements() {
    return {
      linkExistingBusinessToggle: () =>
        pw.get(".review-section-title").contains("Link Existing Business"),
      linkExistingComponent: () =>
        pw.get("span").contains("You have linked similar business location:"),
      undoLinkingButton: () =>
        this.getElements().linkExistingComponent().find("a").click( {force: true} ),
      updateLinkBusinessButton: () =>
        cy
          .get(".NLGButtonPrimary")
          .contains(/Link Business|Update Linked Business/),
      cancelLinkingButton: () =>
        pw.get(".NLGButtonSecondary").contains("Cancel"),
      linkBusinessLocationDropdown: () =>
        pw.get(
          'input[placeholder="Search by DBA, Legal Business Name, Location Address 1, or Location Address 2"]'
        ),
      similarBusinessLocationList: () =>
        cy
          .get("label")
          .contains("Similar Business Locations")
          .next()
          .find("label"),
      selectedLinkedBusiness: () =>
        pw.get("div").contains("You have selected").find("label"),
      businessDetailsFieds: () => pw.get(".k-dialog-content").find("div").eq(1),
      addCustomFieldButton: () =>
        pw.get(".NLGButtonSecondary").contains("Add Custom Field"),
      deleteCustomFieldButton: (customFieldLabel) =>
        cy
          .get("label")
          .contains("Custom Field:")
          .find(`input[value="${customFieldLabel}"]`)
          .parent()
          .parent()
          .parent()
          .find(".fa-trash"),
      cancelReviewButton: () =>
        pw.get(".NLGButtonSecondary").contains("Cancel"),
      updateAddBusinessButton: () =>
        cy
          .get(".NLGButtonPrimary")
          .contains(/Add Business|Update Business Details/)
          .scrollIntoView(),
      anyList: () => pw.get("li"),
      proceedWithoutLinkingButton: () =>
        pw.get(".NLGButtonSecondary").contains("Proceed without linking"),
    };
  }

  getElements() {
    return this.elements();
  }

  enterData(selector: string, method: string, data: any) {
    pw.get(selector)[method](data);
  }
  deleteCustomField(customField: string) {
    this.getElements().deleteCustomFieldButton(customField).click( {force: true} );
  }
  addCustomField(customField: string, value: string) {
    this.getElements().addCustomFieldButton().click( {force: true} );
    this.getElements()
      .addCustomFieldButton()
      .prev()
      .find("div")
      .last()
      .find("input")
      .eq(0)
      .type(customField);
    this.getElements()
      .addCustomFieldButton()
      .prev()
      .find("div")
      .last()
      .find("input")
      .eq(1)
      .type(value);
  }
  updateCustomField(customField: string, newValue: string) {
    this.getElements()
      .businessDetailsFieds()
      .find("input")
      .invoke("attr", "value")
      .then((text) => {
        if (text === customField) {
          this.getElements()
            .businessDetailsFieds()
            .find("input")
            .clear()
            .type(newValue);
        }
      });
  }
  clickCancelReviewButton() {
    this.getElements().cancelReviewButton().click( {force: true} );
  }

  disregardSimilarBusinessRecords() {
    pw.get("span")
      .contains(
        "matching the information provided in this application have been identified."
      )
      .then(($span) => {
        if ($span.length) {
          this.getElements().proceedWithoutLinkingButton().click( {force: true} );
        }
      });
    pw.waitForLoading();
  }
  clicUpdateAddBusinessDetailsButton() {
    this.getElements().updateAddBusinessButton().click( {force: true} );
  }
  toggleLinkExistingBusiness() {
    this.getElements().linkExistingBusinessToggle().click( {force: true} );
  }
  clickUndoLinkingButton() {
    this.getElements().undoLinkingButton().click( {force: true} );
  }
  selectBusinessLocationToLink(businessDBA: string) {
    this.getElements().linkBusinessLocationDropdown().type(businessDBA);
    pw.get("body").then(($body) => {
      if ($body.find('*:contains("NO DATA FOUND")').length) {
        this.getElements()
          .similarBusinessLocationList()
          .contains(businessDBA)
          .click( {force: true} );
      } else {
        this.getElements().anyList().contains(businessDBA).click( {force: true} );
      }
    });
  }
  clickCancelLinkingButton() {
    this.getElements().cancelLinkingButton().click( {force: true} );
  }
  clickLinkUpdateLinkedBusinessButton() {
    this.getElements().updateLinkBusinessButton().click( {force: true} );
  }
}

export default ReviewBusinessList;
