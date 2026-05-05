import UpdateBusinessList from "./UpdateBusinessList";
import ViewLocationDetails from "./ViewLocationDetails";

/**
 * Page Object Model (POM) class representing the Update Business Details tab of Application Review page.
 */
class UpdateBusinessDetails {
  viewLocationDetailsModal: ViewLocationDetails;
  updateBusinessList: UpdateBusinessList;
  constructor() {
    /**
     * @remarks
     * The `viewLocationDetailsModal` and `updateBusinessList` classes are used to interact with the components that appear when viewing location details or updating business details.
     */
    this.viewLocationDetailsModal = new ViewLocationDetails();
    this.updateBusinessList = new UpdateBusinessList();
  }

  /**
   * Get the elements used in the Update Business Details tab.
   * @returns {Object} The elements used in the Update Business Details tab.
   */
  private elements() {
    return {
      updateBusinessDetailsButton: () =>
        pw.get(".NLGButtonSecondaryDanger").contains("Update Business Details"),
      locationsList: () => pw.get(".fa-magnifying-glass-plus").parent("div"),
      viewLocationIconButton: () => pw.get(".fa-magnifying-glass-plus"),
    };
  }

  /**
   * Get the elements used in the Update Business Details tab.
   * @returns {Object} The elements used in the Update Business Details tab.
   */
  getElements() {
    return this.elements();
  }

  /**
   * Click the Update Business Details button.
   */
  clickEditBusinessDetailsButton() {
    this.elements().updateBusinessDetailsButton().click( {force: true} );
  }

  /**
   * Click the view location details icon button for a location.
   * @param locationAddress - The address of the location to view details for.
   */
  viewLocationDetails(locationAddress) {
    this.elements()
      .locationsList()
      .contains(locationAddress)
      .parent()
      .find(".fa-magnifying-glass-plus")
      .click( {force: true} );
  }
}

export default UpdateBusinessDetails;
