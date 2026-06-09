import { type Page } from "@playwright/test";

class Messages {
  constructor(private readonly page: Page) {}

  private elements() {
    return {
      messageItems: () => this.page.locator(".k-expander, .message-item, li"),
      newMessageButton: () => this.page.locator("button").filter({ hasText: /New Message|Add Message/ }).first(),
    };
  }

  getElements() {
    return this.elements();
  }

  async clickNewMessageButton() {
    await this.getElements().newMessageButton().click({ force: true });
  }
}

export default Messages;
