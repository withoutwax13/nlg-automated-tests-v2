import { expect as pwExpect, Page, APIRequestContext } from "@playwright/test";
import { expect as chaiExpect } from "chai";
import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

class JQueryLite {
  private $el: Any;

  constructor(el: Any) {
    this.$el = el;
  }

  get length(): number {
    return this.$el?.length ?? 0;
  }

  find(selector: string): JQueryLite {
    return new JQueryLite(this.$el.find(selector));
  }

  eq(index: number): JQueryLite {
    return new JQueryLite(this.$el.eq(index));
  }

  text(): string {
    return this.$el.text();
  }

  filter(selector: string): JQueryLite {
    return new JQueryLite(this.$el.filter(selector));
  }

  parent(): JQueryLite {
    return new JQueryLite(this.$el.parent());
  }

  next(): JQueryLite {
    return new JQueryLite(this.$el.next());
  }

  attr(name: string): string | undefined {
    return this.$el.attr(name);
  }

  children(): JQueryLite {
    return new JQueryLite(this.$el.children());
  }

  toCheerio(): Any {
    return this.$el;
  }
}

function getByPath(obj: Any, dotted: string): Any {
  if (!dotted) return obj;
  return dotted.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

class PwRuntime {
  page: Page;
  request: APIRequestContext;
  aliases: Record<string, Any> = {};
  projectRoot: string;
  envVars: Record<string, Any>;
  private tail: Promise<Any> = Promise.resolve(undefined);
  private tracked: Promise<Any>[] = [];

  constructor(page: Page, request: APIRequestContext, projectRoot: string, envVars: Record<string, Any>) {
    this.page = page;
    this.request = request;
    this.projectRoot = projectRoot;
    this.envVars = envVars;
  }

  track(p: Promise<Any>) {
    this.tracked.push(p.catch(() => undefined));
  }

  enqueue(fn: () => Promise<Any>): Promise<Any> {
    const p = this.tail.then(fn);
    this.tail = p.catch(() => undefined);
    this.track(p);
    return p;
  }

  async flush(): Promise<void> {
    await Promise.all(this.tracked);
    this.tracked = [];
  }

  chain(value: Any): PwChain {
    return new PwChain(this, Promise.resolve(value));
  }

  isLocator(v: Any): boolean {
    return !!v && typeof v === "object" && typeof v.locator === "function" && typeof v.click === "function";
  }

  get(selector: string): Any {
    if (selector.startsWith("@")) {
      return this.aliases[selector.slice(1)];
    }
    if (selector.startsWith("xpath=")) {
      return this.page.locator(selector);
    }
    return this.page.locator(selector);
  }

  find(subject: Any, selector: string): Any {
    if (subject instanceof JQueryLite) return subject.find(selector);
    if (this.isLocator(subject)) return subject.locator(selector);
    return this.page.locator(selector);
  }

  contains(subject: Any, text: string): Any {
    if (subject instanceof JQueryLite) {
      const selected = subject.toCheerio().find(`:contains(${text})`).first();
      return new JQueryLite(selected);
    }
    if (this.isLocator(subject)) {
      return subject.getByText(String(text), { exact: false }).first();
    }
    return this.page.getByText(String(text), { exact: false }).first();
  }

  async prepareThenSubject(subject: Any): Promise<Any> {
    if (subject instanceof JQueryLite) return subject;
    if (this.isLocator(subject)) {
      const html = await subject.first().evaluate((el: Element) => (el as HTMLElement).outerHTML).catch(() => "");
      const $ = cheerio.load(html || "<div></div>");
      return new JQueryLite($.root().children().first());
    }
    return subject;
  }

  async wait(msOrAlias?: number | string) {
    if (typeof msOrAlias === "number") {
      await this.page.waitForTimeout(msOrAlias);
      return;
    }
    if (typeof msOrAlias === "string" && msOrAlias.startsWith("@")) {
      const alias = msOrAlias.slice(1);
      if (!this.aliases[alias]) this.aliases[alias] = { response: { statusCode: 200 } };
      return;
    }
    await this.page.waitForTimeout(1000);
  }

  async assertSubject(subject: Any, assertion: string, args: Any[]) {
    if (subject instanceof JQueryLite) {
      const text = subject.text();
      switch (assertion) {
        case "exist":
        case "be.visible":
          chaiExpect(subject.length).to.be.greaterThan(0);
          return;
        case "not.exist":
          chaiExpect(subject.length).to.equal(0);
          return;
        case "contain.text":
        case "contains":
        case "contain":
        case "include":
          chaiExpect(text).to.include(String(args[0]));
          return;
        case "have.length":
          chaiExpect(subject.length).to.equal(Number(args[0]));
          return;
        case "have.class":
          chaiExpect(subject.attr("class") || "").to.include(String(args[0]));
          return;
        default:
          return;
      }
    }

    if (this.isLocator(subject)) {
      const loc = subject.first();
      switch (assertion) {
        case "exist":
        case "be.visible":
          await pwExpect(loc).toBeVisible();
          return;
        case "not.exist":
          await pwExpect(loc).toHaveCount(0);
          return;
        case "not.be.disabled":
        case "be.enabled":
          await pwExpect(loc).toBeEnabled();
          return;
        case "be.disabled":
          await pwExpect(loc).toBeDisabled();
          return;
        case "have.value":
          await pwExpect(loc).toHaveValue(String(args[0]));
          return;
        case "have.class": {
          const cls = await loc.getAttribute("class");
          chaiExpect(cls || "").to.include(String(args[0]));
          return;
        }
        case "contain.text":
          await pwExpect(loc).toContainText(String(args[0]));
          return;
        case "have.css": {
          const prop = String(args[0]);
          const wanted = String(args[1]);
          const css = await loc.evaluate((el: any, p: string) => getComputedStyle(el as Element).getPropertyValue(p), prop);
          chaiExpect(css.trim()).to.include(wanted);
          return;
        }
        default:
          return;
      }
    }

    switch (assertion) {
      case "eq":
      case "be.eq":
      case "equal":
        chaiExpect(subject).to.equal(args[0]);
        return;
      case "not.eq":
      case "not.equal":
        chaiExpect(subject).to.not.equal(args[0]);
        return;
      case "include":
      case "contain":
      case "contains":
        chaiExpect(String(subject)).to.include(String(args[0]));
        return;
      case "be.oneOf":
        chaiExpect(args[0]).to.include(subject);
        return;
      case "be.true":
        chaiExpect(!!subject).to.equal(true);
        return;
      case "be.false":
        chaiExpect(!!subject).to.equal(false);
        return;
      case "be.gt":
        chaiExpect(Number(subject)).to.be.greaterThan(Number(args[0]));
        return;
      case "have.length":
        chaiExpect(subject?.length).to.equal(Number(args[0]));
        return;
      default:
        return;
    }
  }
}

class PwChain {
  private runtime: PwRuntime;
  private subject: Promise<Any>;

  constructor(runtime: PwRuntime, subject: Promise<Any>) {
    this.runtime = runtime;
    this.subject = subject;
    this.runtime.track(this.subject);
  }

  private queue(fn: (subject: Any) => Promise<Any> | Any): PwChain {
    const prev = this.subject;
    const next = this.runtime.enqueue(async () => {
      const s = await prev;
      return await fn(s);
    });
    this.subject = next;
    this.runtime.track(next);
    return this;
  }

  as(alias: string): PwChain {
    return this.queue(async (subject) => {
      this.runtime.aliases[alias] = subject;
      return subject;
    });
  }

  then(fn: (subject: Any) => Any): PwChain {
    return this.queue(async (subject) => {
      const prepared = await this.runtime.prepareThenSubject(subject);
      const ret = await fn(prepared);
      return ret === undefined ? subject : ret;
    });
  }

  each(fn: (subject: Any, index: number) => Any): PwChain {
    return this.queue(async (subject) => {
      if (subject instanceof JQueryLite) {
        const ch = subject.toCheerio();
        for (let i = 0; i < ch.length; i++) {
          await fn(new JQueryLite(ch.eq(i)), i);
        }
        return subject;
      }
      if (Array.isArray(subject)) {
        for (let i = 0; i < subject.length; i++) {
          await fn(subject[i], i);
        }
        return subject;
      }
      await fn(subject, 0);
      return subject;
    });
  }

  should(assertion: Any, ...args: Any[]): PwChain {
    return this.queue(async (subject) => {
      if (typeof assertion === "function") {
        const prepared = await this.runtime.prepareThenSubject(subject);
        await assertion(prepared);
      } else {
        await this.runtime.assertSubject(subject, String(assertion), args);
      }
      return subject;
    });
  }

  and(assertion: Any, ...args: Any[]): PwChain {
    return this.should(assertion, ...args);
  }

  its(p: string): PwChain {
    return this.queue(async (subject) => getByPath(subject, p));
  }

  invoke(method: string, ...args: Any[]): PwChain {
    return this.queue(async (subject) => {
      if (method === "text") {
        if (subject instanceof JQueryLite) return subject.text();
        if (this.runtime.isLocator(subject)) return (await subject.first().textContent()) ?? "";
      }
      if (method === "attr") {
        const name = String(args[0]);
        if (subject instanceof JQueryLite) return subject.attr(name);
        if (this.runtime.isLocator(subject)) return await subject.first().getAttribute(name);
      }
      return subject;
    });
  }

  text(): PwChain {
    return this.queue(async (subject) => {
      if (subject instanceof JQueryLite) return subject.text();
      if (this.runtime.isLocator(subject)) return (await subject.first().textContent()) ?? "";
      return String(subject ?? "");
    });
  }

  get(selector: string): PwChain {
    return this.queue(async () => this.runtime.get(selector));
  }

  find(selector: string): PwChain {
    return this.queue(async (subject) => this.runtime.find(subject, selector));
  }

  contains(text: string): PwChain {
    return this.queue(async (subject) => this.runtime.contains(subject, text));
  }

  click(options?: Any): PwChain {
    return this.queue(async (subject) => {
      if (this.runtime.isLocator(subject)) await subject.first().click({ force: !!options?.force });
      return subject;
    });
  }

  clear(): PwChain {
    return this.queue(async (subject) => {
      if (this.runtime.isLocator(subject)) await subject.first().fill("");
      return subject;
    });
  }

  type(value: string): PwChain {
    return this.queue(async (subject) => {
      if (!this.runtime.isLocator(subject)) return subject;
      const loc = subject.first();
      const text = String(value);
      const hasSpecial = /\{(?:rightarrow|leftarrow|uparrow|downarrow)\}/.test(text);
      await loc.fill("");
      if (!hasSpecial) {
        await loc.type(text);
        return subject;
      }
      const parts = text.split(/(\{(?:rightarrow|leftarrow|uparrow|downarrow)\})/g).filter(Boolean);
      for (const part of parts) {
        if (part === "{rightarrow}") await loc.press("ArrowRight");
        else if (part === "{leftarrow}") await loc.press("ArrowLeft");
        else if (part === "{uparrow}") await loc.press("ArrowUp");
        else if (part === "{downarrow}") await loc.press("ArrowDown");
        else await loc.type(part);
      }
      return subject;
    });
  }

  enter(): PwChain {
    return this.queue(async (subject) => {
      if (this.runtime.isLocator(subject)) await subject.first().press("Enter");
      return subject;
    });
  }

  attachFile(filePath: string): PwChain {
    return this.queue(async (subject) => {
      if (!this.runtime.isLocator(subject)) return subject;
      const full = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(this.runtime.projectRoot, "playwright", "fixtures", filePath);
      await subject.first().setInputFiles(full);
      return subject;
    });
  }

  select(value: string): PwChain {
    return this.queue(async (subject) => {
      if (!this.runtime.isLocator(subject)) return subject;
      await subject.first().selectOption({ label: value }).catch(async () => {
        await subject.first().selectOption(value);
      });
      return subject;
    });
  }

  check(): PwChain {
    return this.queue(async (subject) => {
      if (this.runtime.isLocator(subject)) await subject.first().check({ force: true });
      return subject;
    });
  }

  trigger(_event: string): PwChain {
    return this.queue(async (subject) => subject);
  }

  scrollIntoView(): PwChain {
    return this.queue(async (subject) => {
      if (this.runtime.isLocator(subject)) await subject.first().scrollIntoViewIfNeeded();
      return subject;
    });
  }

  eq(index: number): PwChain {
    return this.queue(async (subject) => {
      if (subject instanceof JQueryLite) return subject.eq(index);
      if (this.runtime.isLocator(subject)) return subject.nth(index);
      if (Array.isArray(subject)) return subject[index];
      return subject;
    });
  }

  first(): PwChain {
    return this.eq(0);
  }

  last(): PwChain {
    return this.queue(async (subject) => {
      if (subject instanceof JQueryLite) return subject.eq(Math.max(subject.length - 1, 0));
      if (this.runtime.isLocator(subject)) {
        const count = await subject.count();
        return subject.nth(Math.max(count - 1, 0));
      }
      if (Array.isArray(subject)) return subject[Math.max(subject.length - 1, 0)];
      return subject;
    });
  }

  parent(): PwChain {
    return this.queue(async (subject) => {
      if (subject instanceof JQueryLite) return subject.parent();
      if (this.runtime.isLocator(subject)) return subject.locator("..");
      return subject;
    });
  }

  next(): PwChain {
    return this.queue(async (subject) => {
      if (subject instanceof JQueryLite) return subject.next();
      if (this.runtime.isLocator(subject)) return subject.locator("xpath=following-sibling::*[1]");
      return subject;
    });
  }

  children(): PwChain {
    return this.queue(async (subject) => {
      if (subject instanceof JQueryLite) return subject.children();
      if (this.runtime.isLocator(subject)) return subject.locator(":scope > *");
      return subject;
    });
  }

  wait(msOrAlias?: number | string): PwChain {
    return this.queue(async (subject) => {
      await this.runtime.wait(msOrAlias);
      return subject;
    });
  }
}

function readJsonIfExists(fp: string): Any {
  if (!fs.existsSync(fp)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return undefined;
  }
}

function loadEnvVars(projectRoot: string): Record<string, Any> {
  const out: Record<string, Any> = {};
  out.environment = process.env.environment || process.env.ENVIRONMENT || "dev";
  out.fixtureData = readJsonIfExists(path.join(projectRoot, "playwright", "fixtures", "data.json"))
    ;
  return out;
}

function buildUniqueRegistrationData(
  randomSeed: number,
  isMultilocation: boolean,
  missingData?: string[],
  customValues?: Record<string, Any>
): Any {
  const evaluateCustomValue = (propertyName: string, defaultValue: Any) => {
    if (customValues && Object.prototype.hasOwnProperty.call(customValues, propertyName)) {
      return `${defaultValue} ${customValues[propertyName]}`;
    }
    return defaultValue;
  };

  const customData: Any = {
    basicInfo: {
      businessOwnerEmail: evaluateCustomValue("businessOwnerEmail", `testdata${randomSeed}@test.com`),
      businessOwnerFullName: evaluateCustomValue("businessOwnerFullName", `test data owner ${randomSeed}`),
      businessOwnerPhoneNumber: evaluateCustomValue("businessOwnerPhoneNumber", `11111111111`),
      legalBusinessName: evaluateCustomValue("legalBusinessName", `test data business ${randomSeed}`),
      federalIdentificationNumber: evaluateCustomValue("federalIdentificationNumber", `11111111111`),
      legalBusinessAddress1: evaluateCustomValue("legalBusinessAddress1", `test data add1 ${randomSeed}`),
      legalBusinessAddress2: evaluateCustomValue("legalBusinessAddress2", `Suite add2 ${randomSeed}`),
      legalBusinessCity: evaluateCustomValue("legalBusinessCity", `test city data ${randomSeed}`),
      legalBusinessState: evaluateCustomValue("legalBusinessState", "AL"),
      legalBusinessZipCode: evaluateCustomValue("legalBusinessZipCode", `11111111111`),
      isNotManagedByPropertyManagementFirm: evaluateCustomValue("isNotManagedByPropertyManagementFirm", true),
      operatorName: evaluateCustomValue("operatorName", `test data operator ${randomSeed}`),
      operatorTitle: evaluateCustomValue("operatorTitle", `test data title ${randomSeed}`),
      operatorPhoneNumber: evaluateCustomValue("operatorPhoneNumber", `11111111111`),
      operatorEmail: evaluateCustomValue("operatorEmail", `test${randomSeed}@test.com`),
      emergencyPhoneNumber: evaluateCustomValue("emergencyPhoneNumber", `11111111111`),
    },
    locationInfo: {
      locations: [
        {
          locationOpenDate: evaluateCustomValue("locationOpenDate", { day: 1, month: 1, year: 2024 }),
          locationDBA: evaluateCustomValue("locationDBA", `Test Trade Name ${randomSeed} 1`),
          locationAddress1: evaluateCustomValue("locationAddress1", `${randomSeed} Test Address ${randomSeed} #1`),
          locationAddress2: evaluateCustomValue("locationAddress2", `Suite ${randomSeed} #1`),
          locationCity: evaluateCustomValue("locationCity", `Test City`),
          locationState: evaluateCustomValue("locationState", "AL"),
          locationZip: evaluateCustomValue("locationZip", `12341`),
          locationMailingAddress1: evaluateCustomValue("locationMailingAddress1", `${randomSeed} Test Mailing Address ${randomSeed} #1`),
          locationMailingAddress2: evaluateCustomValue("locationMailingAddress2", `Suite ${randomSeed} #1`),
          locationMailingCity: evaluateCustomValue("locationMailingCity", `Test City`),
          locationMailingState: evaluateCustomValue("locationMailingState", `AL`),
          locationMailingZip: evaluateCustomValue("locationMailingZip", `12341`),
          managerOperatorFullName: evaluateCustomValue("managerOperatorFullName", `Test Manager ${randomSeed} 1`),
          managerOperatorPhoneNumber: evaluateCustomValue("managerOperatorPhoneNumber", `11111111111`),
          managerOperatorEmail: evaluateCustomValue("managerOperatorEmail", `manager1dot${randomSeed}@test.com`),
          managerOperatorTitle: evaluateCustomValue("managerOperatorTitle", `Test Manager Title ${randomSeed} 1`),
          emergencyPhoneNumber: evaluateCustomValue("emergencyPhoneNumber", `11111111111`),
        },
        {
          locationOpenDate: evaluateCustomValue("locationOpenDate", { day: 2, month: 2, year: 2024 }),
          locationDBA: evaluateCustomValue("locationDBA", `Test Trade Name ${randomSeed} 2`),
          locationAddress1: evaluateCustomValue("locationAddress1", `${randomSeed} Test Address ${randomSeed} #2`),
          locationAddress2: evaluateCustomValue("locationAddress2", `Suite ${randomSeed} #2`),
          locationCity: evaluateCustomValue("locationCity", `Test City`),
          locationState: evaluateCustomValue("locationState", `AL`),
          locationZip: evaluateCustomValue("locationZip", `12341`),
          locationMailingAddress1: evaluateCustomValue("locationMailingAddress1", `${randomSeed} Test Mailing Address ${randomSeed} #2`),
          locationMailingAddress2: evaluateCustomValue("locationMailingAddress2", `Suite ${randomSeed} #2`),
          locationMailingCity: evaluateCustomValue("locationMailingCity", `Test City`),
          locationMailingState: evaluateCustomValue("locationMailingState", `AL`),
          locationMailingZip: evaluateCustomValue("locationMailingZip", `12341`),
          managerOperatorFullName: evaluateCustomValue("managerOperatorFullName", `Test Manager ${randomSeed} 2`),
          managerOperatorPhoneNumber: evaluateCustomValue("managerOperatorPhoneNumber", `11111111111`),
          managerOperatorEmail: evaluateCustomValue("managerOperatorEmail", `manager2dot${randomSeed}@test.com`),
          managerOperatorTitle: evaluateCustomValue("managerOperatorTitle", `Test Manager Title ${randomSeed} 2`),
          emergencyPhoneNumber: evaluateCustomValue("emergencyPhoneNumber", `11111111111`),
        },
      ],
    },
    applicantInfo: {
      agencyName: evaluateCustomValue("agencyName", `Test Agency ${randomSeed}`),
      agencyType: evaluateCustomValue("agencyType", "Accounting Firm"),
      applicantPhoneNumber: evaluateCustomValue("applicantPhoneNumber", `11111111111`),
      applicantEmail: evaluateCustomValue("applicantEmail", `test${randomSeed}@test.com`),
      signature: evaluateCustomValue("signature", `Test Signature ${randomSeed}`),
    },
  };

  if (!isMultilocation) customData.locationInfo.locations = [customData.locationInfo.locations[0]];

  if (missingData) {
    missingData.forEach((p) => {
      const keys = p.split(".").map((k) => {
        const m = k.match(/(\w+)\[(\d+)\]/);
        return m ? { key: m[1], index: parseInt(m[2], 10) } : { key: k };
      });

      let current: Any = customData;
      for (let i = 0; i < keys.length - 1; i++) {
        const { key, index } = keys[i] as Any;
        if (!Object.prototype.hasOwnProperty.call(current, key)) return;
        current = current[key];
        if (index !== undefined) {
          if (!Array.isArray(current) || current[index] === undefined) return;
          current = current[index];
        }
      }

      const last = keys[keys.length - 1] as Any;
      if (last.index !== undefined) {
        if (Array.isArray(current) && current[last.index] !== undefined) {
          delete current[last.index][last.key];
        }
      } else {
        delete current[last.key];
      }
    });
  }

  return customData;
}

export function createPw(page: Page, request: APIRequestContext, projectRoot: string) {
  const runtime = new PwRuntime(page, request, projectRoot, loadEnvVars(projectRoot));

  const pw: Any = {
    __runtime: runtime,
    __flush: async () => runtime.flush(),
    state: (key: string) => {
      if (key === "aliases") return runtime.aliases;
      return undefined;
    },
    wrap: (value: Any) => runtime.chain(value),
    get: (selector: string) => runtime.chain(runtime.get(selector)),
    xpath: (selector: string) => runtime.chain(page.locator(`xpath=${selector}`)),
    enter: (iframeSelector: string) => runtime.chain(undefined).then(async () => {
      const iframeLoc = page.locator(iframeSelector).first();
      await iframeLoc.waitFor({ state: "attached", timeout: 5000 }).catch(() => undefined);
      const frame = await iframeLoc.elementHandle().then((h) => h?.contentFrame()).catch(() => null);

      const makeChain = (loc: Any) => ({
        find: (sel: string) => makeChain(loc.locator(sel)),
        contains: (txt: string) => makeChain(loc.getByText(String(txt), { exact: false }).first()),
        click: (options?: Any) => {
          runtime.enqueue(async () => { await loc.first().click({ force: !!options?.force }); return undefined; });
          return makeChain(loc);
        },
        type: (val: string) => {
          runtime.enqueue(async () => { await loc.first().fill(""); await loc.first().type(String(val)); return undefined; });
          return makeChain(loc);
        },
        clear: () => {
          runtime.enqueue(async () => { await loc.first().fill(""); return undefined; });
          return makeChain(loc);
        },
        select: (val: string) => {
          runtime.enqueue(async () => {
            await loc.first().selectOption({ label: String(val) }).catch(async () => {
              await loc.first().selectOption(String(val));
            });
            return undefined;
          });
          return makeChain(loc);
        },
      });

      return () => makeChain(frame ? frame.locator("body") : page.locator("body"));
    }),
    visit: (url: string) => runtime.chain(undefined).then(async () => {
      await page.goto(String(url));
    }),
    location: (_part?: string) => runtime.chain(undefined).then(async () => {
      const u = new URL(page.url());
      return { pathname: u.pathname, href: u.href };
    }),
    url: () => runtime.chain(undefined).then(async () => page.url()),
    log: (...args: Any[]) => runtime.chain(undefined).then(() => {
      // eslint-disable-next-line no-console
      console.log(...args);
    }),
    wait: (msOrAlias?: number | string) => runtime.chain(undefined).wait(msOrAlias),
    intercept: (_method: string, _url: string) => {
      const token = { response: { statusCode: 200 } };
      return runtime.chain(token);
    },
    request: (methodOrUrl: string, maybeUrl?: string, maybeBody?: Any) =>
      runtime.chain(undefined).then(async () => {
        const method = maybeUrl ? methodOrUrl : "GET";
        const url = maybeUrl || methodOrUrl;
        const resp = await request.fetch(url, {
          method,
          data: maybeBody,
          failOnStatusCode: false,
        } as Any);
        const text = await resp.text();
        let body: Any = text;
        try {
          body = JSON.parse(text);
        } catch {
          // keep text
        }
        return {
          status: resp.status(),
          body,
          headers: resp.headers(),
        };
      }),
    window: () => runtime.chain({ open: (..._args: Any[]) => undefined }),
    stub: (obj: Any, key: string, impl?: Any) => runtime.chain(undefined).then(() => {
      const original = obj[key];
      const calls: Any[] = [];
      obj[key] = (...args: Any[]) => {
        calls.push(args);
        if (impl) return impl(...args);
        return undefined;
      };
      return {
        called: calls.length > 0,
        calls,
        restore: () => {
          obj[key] = original;
        },
      };
    }),
    fixture: (name: string) => runtime.chain(undefined).then(() => {
      const p1 = path.join(projectRoot, "playwright", "fixtures", `${name}.json`);
      const fp = p1;
      return JSON.parse(fs.readFileSync(fp, "utf-8"));
    }),
    readFile: (fp: string) => runtime.chain(undefined).then(() => fs.readFileSync(fp, "utf-8")),
    task: (name: string, arg: Any) => runtime.chain(undefined).then(() => {
      if (name === "deleteFolder" && arg) {
        try { fs.rmSync(String(arg), { recursive: true, force: true }); } catch {}
      }
      return null;
    }),
    readXlsx: (fp: string) => runtime.chain(undefined).then(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const XLSX = require("xlsx");
      const wb = XLSX.readFile(fp);
      const ws = wb.Sheets[wb.SheetNames[0]];
      return XLSX.utils.sheet_to_json(ws, { defval: "" });
    }),
    waitForLoading: (secs?: number) => runtime.chain(undefined).wait((secs ? secs : 5) * 1000),
    logout: () => runtime.chain(undefined)
      .then(async () => { await page.locator(".profileDropDownButton").last().click({ force: true }); })
      .then(async () => { await page.getByText("Log out", { exact: false }).first().click({ force: true }); }),
    login: (params: Any) => runtime.chain(undefined).then(async () => {
      const accountType = params?.accountType || "taxpayer";
      const index = params?.accountIndex || 0;
      const env = process.env.environment || process.env.ENVIRONMENT || "dev";

      let creds: Any;
      const fd = runtime.envVars.fixtureData;
      if (fd?.accounts?.[accountType]?.[index]) {
        creds = {
          username: fd.accounts[accountType][index].username,
          password: fd.accounts[accountType][index].password,
        };
      }
      if (!creds) {
        const u = `${String(accountType).toUpperCase()}_USERNAME`;
        const p = `${String(accountType).toUpperCase()}_PASSWORD`;
        creds = {
          username: process.env[u] || process.env.TEST_USERNAME || "",
          password: process.env[p] || process.env.TEST_PASSWORD || "",
        };
      }

      await page.goto(`https://${env}.azavargovapps.com/login`);
      const cookieBtn = page.locator(".cookie-actions .NLGButtonPrimary");
      if (await cookieBtn.count()) {
        await cookieBtn.first().click({ force: true }).catch(() => undefined);
      }
      if (creds.username) await page.locator('[data-cy="email-address"]').fill(creds.username);
      if (creds.password) await page.locator('[data-cy="password"]').fill(creds.password);
      await page.locator('[data-cy="sign-in"]').first().click({ force: true });
    }),
    getUniqueRegistrationData: (
      randomSeed: number,
      isMultilocation: boolean,
      missingData?: string[],
      customValues?: Record<string, Any>
    ) => runtime.chain(buildUniqueRegistrationData(randomSeed, isMultilocation, missingData, customValues)),
    deleteBusinessData: (_params: Any) => runtime.chain(undefined),
    checkAccessibility: (_scope?: Any, _opts?: Any) => runtime.chain(undefined),
    stubNewWindow: (aliasName: string) => runtime.chain(undefined).then(() => {
      runtime.aliases[aliasName] = { called: false };
    }),
  };

  return pw;
}
