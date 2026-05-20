# How to run tests

## Prerequisites (run once)

```bash
npm install
npx playwright install
```

## Run this project's tests

### 1) List discovered tests
```bash
npx playwright test -c playwright.config.ts --list
```

### 2) Run all tests in this project
```bash
npx playwright test -c playwright.config.ts
```

### 3) Run one spec file
```bash
npx playwright test -c playwright.config.ts playwright/e2e/<path-to-spec>.spec.ts
```

### 4) Run tests matching a title
```bash
npx playwright test -c playwright.config.ts -g "<part-of-test-title>"
```

### 5) Debug / headed mode
```bash
npx playwright test -c playwright.config.ts --headed
npx playwright test -c playwright.config.ts --debug
```

## Reports
After a run, open the HTML report with:

```bash
npx playwright show-report
```
