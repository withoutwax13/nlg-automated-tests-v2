/**
 * Page Object Model (POM) class representing the Add New Note Modal within the Manual Step tab of Application Review page.
 */
class AddNewNoteModal {
  /**
   * Get the elements used in the add new note modal.
   * @returns {Object} The elements used in the add new note modal.
   */
  elements() {
    return {
      modalTitle: () => pw.get(".k-dialog-title"),
      noteTextArea: () => pw.get(".k-textarea").find("textarea"),
      saveButton: () =>
        pw.get(".k-dialog-actions").find("button").contains("Save"),
      cancelButton: () =>
        pw.get(".k-dialog-actions").find("button").contains("Cancel"),
    };
  }

  /**
   * Click the Cancel button.
   */
  clickCancelButton() {
    this.elements().cancelButton().click( {force: true} );
  }

  /**
   * Click the Save button.
   */
  clickSaveButton() {
    this.elements().saveButton().click( {force: true} );
  }

  /**
   * Types the note to the text area.
   * @param note - The note to enter.
   */
  enterNote(note: string) {
    this.elements().noteTextArea().type(note);
  }
}

export default AddNewNoteModal;