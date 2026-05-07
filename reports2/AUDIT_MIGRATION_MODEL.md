# reports2 Playwright Migration Model Audit

Date: 2026-05-07
Scope: `reports2/**` only
Goal: Assess whether `reports2` is a solid canonical model for Cypress -> Playwright migration.

## What was audited
- Project structure and file inventory
- Build/typecheck viability
- Playwright test discovery
- Cypress residue
- Support/utils API design and usage consistency
- Security/secret exposure risk
- Migration readiness risks

## Evidence (commands run)
- `git status --short --branch`
- `python` inventory script for file counts and subtree counts
- `npx playwright test -c playwright.config.ts --list`
- `npx tsc --noEmit` (failed at tsconfig option)
- `npx tsc --noEmit --ignoreDeprecations 5.0` (revealed type errors)
- content scans:
  - `cypress|cy\.`
  - `test.only|describe.only|test.skip|describe.skip`
  - `waitForTimeout\(`
  - `password|webhook|token|sig=`

## Inventory summary
- Total files in `reports2`: **49**
- Playwright subtree:
  - `e2e`: **22** specs
  - `objects`: **11** files
  - `support`: **1** file (`native-helpers.ts`)
  - `utils`: **3** files (`Grid`, `Login`, `Reporting/sendToTeams`)
  - `fixtures`: **1** file

## Findings

### CRITICAL-1: TypeScript gate is broken at config level
- `tsconfig.json` has `"ignoreDeprecations": "6.0"`, which fails with local TS toolchain.
- `npx tsc --noEmit` does not run successfully.
- Impact: migration consumers cannot use compile as hard verification gate from this model.

### CRITICAL-2: 22 compile errors in core spec login calls
- After bypassing config issue (`--ignoreDeprecations 5.0`), compile reports 22 errors:
  - `TS2554 Expected 1-2 arguments, but got 3`
- Pattern in specs: `Login.login(page, { accountType: "..." })`
- Actual `Login.login` currently maps to native helper with signature `(page, params?)`.
- Impact: baseline specs are not API-consistent with baseline helper API.

### HIGH-1: Hardcoded credentials in source of truth
- `playwright/support/native-helpers.ts` embeds many real emails/passwords inline.
- Impact: security risk + encourages bad migration pattern if copied as model.

### HIGH-2: Hardcoded Teams webhook URL with signature in repo
- `playwright/utils/Reporting/sendToTeams.ts` includes a full webhook URL with `sig=` token.
- Impact: secret leakage risk and environment coupling.

### HIGH-3: Cypress residue still present in model package
- `package.json` still includes Cypress dependencies and script (`cypress:record`).
- `parallelExec.ts` references `cypress/e2e` and `npx cypress run`.
- Impact: model is not migration-clean; downstream projects inherit mixed-tooling confusion.

### MEDIUM-1: Skipped tests in baseline
- 9 skip markers found (`test.skip` / `describe.skip`) across Reports specs.
- Impact: coverage blind spots if this is treated as gold standard.

### MEDIUM-2: Fixed sleeps in objects/helpers
- Multiple `waitForTimeout(...)` occurrences in helpers/objects.
- Impact: flaky/timing-sensitive behavior likely to propagate in migrations.

### MEDIUM-3: Logic smells in native helper
- `getCredentials` computes `normalizedType` but indexes `validCredentials[accountType]` (normalization unused).
- `accountIndex` expression appears inverted: `params.accountIndex ? 0 : params.accountIndex`.
- Impact: incorrect account selection behavior in edge cases.

## Current verdict for "model project"
`reports2` is **structurally useful** as a reference for folder/API shape, but **not yet a clean migration gold model** due to compile breakage, API call mismatch, and embedded secrets/Cypress residue.

## Recommended hard-gate criteria before using as canonical model
1. `npx tsc --noEmit` passes with no overrides.
2. `npx playwright test --list` + targeted smoke pass.
3. Remove Cypress runtime/deps/scripts from `reports2` (or isolate legacy artifacts outside model path).
4. Externalize credentials and webhooks to environment/config.
5. Eliminate or justify skipped tests.
6. Replace fixed sleeps with deterministic waits where practical.

## Priority fix order
1. Fix `Login.login` call contract mismatch across 22 specs (or provide compatibility wrapper).
2. Correct `tsconfig` deprecation option for installed TS version.
3. Move secrets to env/config.
4. Remove Cypress residue in package/scripts and legacy runner.
5. Clean skip/sleep debt.

---
This audit intentionally makes no code changes yet; it reports model-readiness defects to use as migration policy baseline.