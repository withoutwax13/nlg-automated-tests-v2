import FormRequirements from "./FormRequirements";
import ReviewBusinessList from "./ReviewBusinessList";

class UpdateBusinessList {
  reviewBusinessListModal: ReviewBusinessList;
  formRequirementsModal: FormRequirements;
  constructor() {
    this.reviewBusinessListModal = new ReviewBusinessList();
    this.formRequirementsModal = new FormRequirements();
  }
  private elements() {
    return {
      reviewBusinessButton: () => cy.get("button").contains("Review Business"),
      updateFormRequirementsButton: () =>
        cy.get("button").contains(/Update Form Requirements|Set Form Requirements/),
      locationList: () =>
        this.getElements().reviewBusinessButton().parent().parent().parent(), // returns more than one element
      locationsUpdatedCounter: () => cy.get("b").contains("Locations Updated"),
    };
  }

  getElements() {
    return this.elements();
  }

  clickReviewBusinessButton(locationAddress: string) {
    this.elements()
      .locationList()
      .contains(locationAddress)
      .parent()
      .parent()
      .find("button")
      .contains("Review Business")
      .click( {force: true} );
  }
  clickUpdateFormRequirements(locationAddress: string) {
    this.elements()
      .locationList()
      .contains(locationAddress)
      .parent()
      .parent()
      .find("button")
      .contains(/Update Form Requirements|Set Form Requirements/)
      .click( {force: true} );
  }
}

export default UpdateBusinessList;
