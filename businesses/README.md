# Businesses E2E test guide

Run commands from the `businesses` directory.

## Setup once

Use Node.js 24.

```text
npm ci
npx playwright install chromium
```

For local runs, copy `.env.businesses.local.example` to
`.env.businesses.local` only if the local file does not already exist. Replace
its placeholders with values provided by the team and keep all ten slot entries.
Never commit or share this credential file.

## Run locally

The slot must match the test's `@slot-NN` tag in its spec.

One test:

```text
npm run test:playwright:local -- --slot=slot-00 --grep=TC27
```

One test by file:

```text
npm run test:playwright:local -- --slot=slot-00 playwright/e2e/Taxpayer/TC27.spec.ts
```

One complete slot:

```text
npm run test:playwright:local -- --slot=slot-00
```

All slots in parallel (four at a time by default):

```text
npm run test:playwright:local:parallel
```

Selected slots or higher concurrency:

```text
npm run test:playwright:local:parallel -- --max-parallel=2 --slots=slot-00,slot-03
npm run test:playwright:local:parallel -- --max-parallel=10
```

Add `--headed` to a single-slot command to watch the browser. TC32 cannot run
locally because it resets an entire test municipality.

## Results

Each local run clears the previous `test-results/local` folder. Failed tests
normally include screenshots in the HTML report. The terminal prints the
command for opening the report when it is ready.

Do not commit or share reports or screenshots; they can contain test data.

## Run in GitHub Actions

1. Open **Actions > NLG Business E2E Tests**.
2. Select **Run workflow** on `main`.
3. Leave `grep` empty for all tests, or enter a test code such as `TC27`.

CI uses the existing repository Actions secrets. Contact the test maintainer if
a slot-secret validation step fails.

## Troubleshooting

- **No tests found:** use the `@slot-NN` tag from the selected test's spec.
- **Browser missing:** run `npx playwright install chromium`.
- **Results lock exists:** wait for the active local run. If none exists,
  remove `.local-businesses-results.lock` and retry.
- **Machine is slow:** lower `--max-parallel` to `2` or `1`.

Before any local run, confirm its slots are not already in use by GitHub
Actions or another QA tester.
