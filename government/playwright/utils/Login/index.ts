import fs from "fs";
import path from "path";
import { Page, expect } from "@playwright/test";

type LoginOptions = {
  accountType?: string;
  accountIndex?: number;
  redirectPath?: string;
};

type Credential = {
  username?: string;
  password?: string;
};

function readJsonIfExists(filePath: string): unknown {
  try {
    if (!fs.existsSync(filePath)) return undefined;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return undefined;
  }
}

function getEnvironmentName(): string {
  return process.env.environment || process.env.ENV || "staging";
}

function getBaseUrl(projectRoot: string): string {
  const env = getEnvironmentName();
  const configPath = path.resolve(projectRoot, "playwright", "fixtures", "config.json");
  const cfg = readJsonIfExists(configPath) as Record<string, { url?: string }> | undefined;
  return cfg?.[env]?.url || process.env.BASE_URL || "";
}

function parseCredentialsFromEnv(): Record<string, Credential[]> {
  const raw = process.env.validCredentials || process.env.VALID_CREDENTIALS;
  if (!raw) {
    const username = process.env.TEST_USERNAME || "";
    const password = process.env.TEST_PASSWORD || "";
    const list = Array.from({ length: 10 }, () => ({ username, password }));
    return {
      taxpayer: list,
      municipal: list,
      ags: list,
      caseManagementTestAccount: list,
      iail: list,
      iatx: list,
    };
  }
  try {
    return JSON.parse(raw) as Record<string, Credential[]>;
  } catch {
    return {};
  }
}

function resolveCredentials(projectRoot: string, accountType: string, accountIndex: number): Credential {
  const fixturePath = path.resolve(projectRoot, "playwright", "fixtures", "data.json");
  const fixture = readJsonIfExists(fixturePath) as { accounts?: Record<string, Credential[]> } | undefined;
  const fromFixture = fixture?.accounts?.[accountType]?.[accountIndex];
  if (fromFixture?.username || fromFixture?.password) return fromFixture;

  const fromEnv = parseCredentialsFromEnv();
  return fromEnv?.[accountType]?.[accountIndex] || fromEnv?.[accountType]?.[0] || { username: "", password: "" };
}

export async function loginViaUi(page: Page, projectRoot: string, options: LoginOptions = {}): Promise<void> {
  const accountType = options.accountType || "ags";
  const accountIndex = options.accountIndex ?? 0;
  const redirectPath = options.redirectPath || "/";
  const creds = resolveCredentials(projectRoot, accountType, accountIndex);

  const targetUrl = `${getBaseUrl(projectRoot)}${redirectPath}`;
  await page.goto(targetUrl);
  if (creds.username) await page.locator('[data-cy="email-address"]').fill(creds.username);
  if (creds.password) await page.locator('[data-cy="password"]').fill(creds.password);
  await page.locator('[data-cy="sign-in"]').first().click({ force: true });
}

export async function waitForApiResponse(
  page: Page,
  options: { method?: string; urlIncludes: string; timeout?: number }
) {
  const method = (options.method || "GET").toUpperCase();
  return page.waitForResponse(
    (res) => res.request().method().toUpperCase() === method && res.url().includes(options.urlIncludes),
    { timeout: options.timeout ?? 45000 }
  );
}

export async function assertPageUrlContains(page: Page, urlPart: string) {
  await expect(page).toHaveURL(new RegExp(urlPart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}
