# Filings E2E test guide

Run commands from the `filings` directory. Filings reuses the same ten test
slots, GitHub repository secrets, and local credential file as Businesses.

## Setup once

Use Node.js 24.

```text
npm ci
npx playwright install chromium
```

For local runs, configure `../businesses/.env.businesses.local` from
`../businesses/.env.businesses.local.example`. Keep all ten
`BUSINESSES_SLOT_00` through `BUSINESSES_SLOT_09` entries and never commit or
share that file.

## Run locally

The slot must match the test's `@slot-NN` tag in its spec.

One test by file (recommended):

```text
npm run test:playwright:local -- --slot=slot-00 playwright/e2e/Filings/TC2.spec.ts
```

One test by an exact file-name grep:

```text
npm run test:playwright:local -- --slot=slot-00 --grep='TC2\.spec\.ts'
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

Add `--headed` to a single-slot command to watch the browser. TC40 cannot run
locally because it changes all pending approvals.

## Results

Each local run clears the previous Filings `test-results/local` folder. Failed
tests normally include screenshots in the HTML report. The terminal prints the
command for opening the report when it is ready.

Do not commit or share reports or screenshots; they can contain test data.

## Run in GitHub Actions

1. Open **Actions > NLG Filings E2E Tests**.
2. Select **Run workflow** on `main`.
3. Leave `grep` empty for all tests, or use an exact expression such as
   `TC2\.spec\.ts` for one test. A plain `TC2` also matches TC20–TC29.

GitHub runs ten slot jobs in parallel. A full run then runs TC40 in its isolated
lane; a filtered run runs TC40 only when the grep matches it. The workflow
reuses `BUSINESSES_SLOT_00` through `BUSINESSES_SLOT_09` and shares the
Businesses concurrency lock, so the two suites do not overlap in Actions.

## Troubleshooting

- **No tests found:** use the `@slot-NN` tag from the selected test's spec.
- **Browser missing:** run `npx playwright install chromium`.
- **Results lock exists:** wait for the active local Businesses or Filings run.
- **Machine is slow:** lower `--max-parallel` to `2` or `1`.

Before any local run, confirm its slots are not already in use by GitHub
Actions or another QA tester.
