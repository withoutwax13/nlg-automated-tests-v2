import { expect } from "@playwright/test";
import { resolvePage } from "../pageContext";

class LegacyValue {
  constructor(private value: any) {}

  then(callback: (value: any) => any) {
    return Promise.resolve(callback(this.value));
  }

  as(name: string) {
    legacy.aliases[name] = this.value;
    return this;
  }

  click() {
    return Promise.resolve(this.value?.click?.());
  }

  async assert(assertion: string, expected?: any) {
    if (assertion === "exist") {
      expect(this.value).toBeTruthy();
      return;
    }
    if (assertion === "include") {
      expect(String(this.value)).toContain(String(expected));
      return;
    }
    if (assertion === "contain.text") {
      const text = await this.value?.innerText?.();
      expect(text ?? "").toContain(String(expected));
      return;
    }
    if (assertion === "be.visible") {
      if (this.value?.isVisible) {
        expect(await this.value.isVisible()).toBeTruthy();
      } else {
        expect(this.value).toBeTruthy();
      }
      return;
    }
  }
}

export const legacy = {
  aliases: {} as Record<string, any>,
  get(name: string) {
    return new LegacyValue(this.aliases[name.replace(/^@/, "")]);
  },
  wrap(value: any) {
    return new LegacyValue(value);
  },
  url() {
    return new LegacyValue(resolvePage().url());
  },
};
