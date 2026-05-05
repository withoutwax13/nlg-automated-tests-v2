import { Page, Response } from '@playwright/test';

type AccountType =
  | 'taxpayer'
  | 'municipal'
  | 'ags'
  | 'caseManagementTestAccount'
  | 'iail'
  | 'iatx';

type AccountCredentials = {
  username: string;
  password: string;
};

type ValidCredentials = Partial<Record<AccountType, AccountCredentials[]>>;

type WaitForApiResponseArgs = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  urlIncludes: string;
  timeout?: number;
};

const safeParseJson = <T>(value?: string): T | undefined => {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
};

const getValidCredentialsFromEnv = (): ValidCredentials | undefined => {
  return safeParseJson<ValidCredentials>(
    process.env.validCredentials ?? process.env.VALIDCREDENTIALS,
  );
};

const resolveCredentials = (
  accountType: AccountType,
  accountIndex: number,
): AccountCredentials => {
  const validCredentials = getValidCredentialsFromEnv();
  const fromValidCredentials = validCredentials?.[accountType]?.[accountIndex];

  if (fromValidCredentials) {
    return {
      username: fromValidCredentials.username,
      password: fromValidCredentials.password,
    };
  }

  const envPrefix = accountType.toUpperCase();

  return {
    username: process.env[`${envPrefix}_USERNAME`] ?? process.env.TEST_USERNAME ?? '',
    password: process.env[`${envPrefix}_PASSWORD`] ?? process.env.TEST_PASSWORD ?? '',
  };
};

export const loginViaUi = async (
  page: Page,
  accountType: AccountType = 'taxpayer',
  accountIndex: number = 0,
): Promise<void> => {
  const environment = process.env.environment ?? process.env.ENVIRONMENT ?? 'dev';
  const credentials = resolveCredentials(accountType, accountIndex);

  await page.goto(`https://${environment}.azavargovapps.com/login`);

  const acceptCookieButton = page.locator('.cookie-actions .NLGButtonPrimary').first();
  if (await acceptCookieButton.count()) {
    await acceptCookieButton.click({ force: true }).catch(() => undefined);
  }

  if (credentials.username) {
    const emailByLabel = page.getByLabel(/email/i).first();
    if (await emailByLabel.count()) {
      await emailByLabel.fill(credentials.username);
    } else {
      await page.locator('input[type="email"]').first().fill(credentials.username);
    }
  }

  if (credentials.password) {
    const passwordByLabel = page.getByLabel(/password/i).first();
    if (await passwordByLabel.count()) {
      await passwordByLabel.fill(credentials.password);
    } else {
      await page.locator('input[type="password"]').first().fill(credentials.password);
    }
  }

  const signInButton = page.getByRole('button', { name: /sign in/i }).first();
  if (await signInButton.count()) {
    await signInButton.click({ force: true });
  } else {
    await page.locator('button[type="submit"]').first().click({ force: true });
  }
};

export const waitForApiResponse = (
  page: Page,
  { method, urlIncludes, timeout = 20000 }: WaitForApiResponseArgs,
): Promise<Response> => {
  return page.waitForResponse(
    (response) =>
      response.request().method().toUpperCase() === method &&
      response.url().includes(urlIncludes),
    { timeout },
  );
};
