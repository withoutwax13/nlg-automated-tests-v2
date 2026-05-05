# Native Playwright Migration Gates (All 11 Projects)

## Structural gates
1. File-count parity preserved against source project:
   - Specs: `cypress/e2e/**/*.cy.ts` == `playwright/e2e/**/*.spec.ts`
   - Objects: `cypress/objects/**/*.ts` == `playwright/objects/**/*.ts`
   - Utils: `cypress/utils/**/*.ts` == `playwright/utils/**/*.ts`
2. No Cypress compatibility runtime files in Playwright trees:
   - `playwright/support/pw.ts`
   - `playwright/support/pwtest.ts`
   - `playwright/support/globals.d.ts`
3. No Cypress config/types in v2 project tsconfig:
   - no `"cypress"` in `types`
   - includes `"@playwright/test"` and `"node"`

## Semantic gates
4. No Cypress API usage in Playwright code:
   - no `cy.`
   - no `pw.`
   - no `.should(` chain assertions
5. Specs use native Playwright test runtime:
   - imports from `@playwright/test`
   - async `test(...)` with Playwright fixtures (`page`, `request`, etc)
6. Explicit UI login behavior retained where present in source (no auth shortcuts unless source already used API token/session shortcuts).

## Execution gates
7. `npx playwright test -c <project>/playwright.config.ts --list` passes for each project.
8. At least one representative runtime test per project exits 0.
9. Repo-wide scan across `*/playwright/**/*.ts` reports 0 matches for:
   - `\bcy\s*\.`
   - `\bpw\s*\.`
   - `\.should\s*\(`
   - `support/pwtest`

Only after all gates pass is migration considered complete.