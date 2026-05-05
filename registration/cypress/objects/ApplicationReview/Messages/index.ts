/**
 * Page Object Model (POM) class representing the Messages tab of Application Review page.
 */
class Messages {
  /**
   * Get the elements used in the Messages tab.
   * @returns {Object} The elements used in the Messages tab.
   */
  private elements() {
    return {
      applicantNameData: () =>
        cy.get("h3").contains("Applicant Messages").next(),
      messageList: () =>
        this.getElements().applicantNameData().next().next().next(),
      messageInput: () => cy.get("#messageTextArea"),
      sendButton: () => cy.get("button").contains("Send"),
      uploadFileInput: () => cy.get('input[type="files"]'),
    };
  }

  /**
   * Get the elements used in the Messages tab.
   * @returns {Object} The elements used in the Messages tab.
   */
  getElements() {
    return this.elements();
  }

  /**
   * Type a message in the message input field.
   * @param message - The message to enter in the message input field.
   */
  enterMessage(message: string) {
    this.getElements().messageInput().type(message);
  }

  /**
   * Uploads a file to the message input field.
   * @param fileName - The name of the file to upload. This should be a file in the cypress/fixtures directory.
   */
  uploadFile(fileName: string) {
    const fileToUpload = fileName || "data.json";
    this.elements().uploadFileInput().attachFile(fileToUpload);
    cy.waitForLoading();
  }

  /**
   * Click the Send button.
   */
  clickSendButton() {
    this.getElements().sendButton().click( {force: true} );
  }
}

export default Messages;
