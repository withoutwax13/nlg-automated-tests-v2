import { Page, Locator } from "@playwright/test";

class DatePicker {
  constructor(private page: Page) {}

  private elements() {
    return {
      title: () => this.page.locator(".k-datepicker-popup .k-calendar-title"),
      link: () => this.page.locator(".k-datepicker-popup .k-link"),
    };
  }

  getElement() {
    return this.elements();
  }

  async selectDate(month: number, day: number, year: number) {
    const elements = this.getElement();

    await elements.title().click();
    await elements.title().click();

    await elements
      .link()
      .filter({ hasText: String(year) })
      .click();

    await elements.link().nth(month - 1).click();
    await elements.link().nth(day - 1).click();
  }
}

export default DatePicker;