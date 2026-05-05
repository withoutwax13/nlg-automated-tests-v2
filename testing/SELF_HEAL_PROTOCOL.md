# Self-Healing Cypress Protocol

**Scope:** Manual-result-driven healing of Cypress test scripts, including VPS-side one-by-one execution, iterative fixing, and continuous operator updates.

## Non-Negotiable Rules
- Always `fetch + pull` before coding (unless user explicitly says skip pull for that run).
- Never commit directly to `main/master`.
- Never merge PRs from the agent; human merge only.
- Agent only pushes branch and reports results.
- Operate under governance motto: **Only advance**.
- Heal **one spec at a time**, but auto-advance queue items without waiting for re-prompt.
- Enforce hard loop cap per spec (default `10` unless operator overrides).
- Use only files relevant to the current spec to minimize token usage.
- Verifier must gate advancement for every spec.

---

## 1) Inputs Required Per Run

User must provide:
1. **Service directory** (example: `reports2`, `forms`, `users`)
2. **Test ID** (example: `TC1`, `TC12`) — file name is the identifier
3. Optional: base branch (default `main`)
4. Optional: execution mode (`commit-only` or `push-branch`, default `push-branch`)

### Mandatory evidence source
All clues/hints for healing are taken from:
- `testing/hints/**`

Use hints as first-class context before patching.

---

## 2) Per-Spec Healing Loop (Required)

For the current spec only:

1. Identify likely root cause(s) from:
   - failing output
   - `testing/hints/**`
   - related service object/spec files
2. Apply minimal, low-risk patch(es)
3. Run the **individual spec file** for that exact spec
4. If still failing:
   - refine hypothesis
   - patch again
   - rerun the same individual spec
5. Repeat until one of these conditions:
   - spec passes
   - likely product bug / env issue / non-test issue identified
   - fail loop cap is reached (`skipped-cap`)

If likely actual bug is detected, stop healing for that spec and report immediately, then advance queue.

---

## 3) Git Flow (Mandatory Order)

1. `git fetch --all --prune`
2. Checkout base branch
3. `git pull --ff-only`
4. Create branch: `fix/<service>-<test-id>-self-heal-<timestamp>`
5. Patch + run individual spec (loop)
6. Commit
7. Push branch (if mode is `push-branch`)
8. Return summary + branch + PR link

---

## 4) Test Execution Rule

All Cypress runs must include:
- `--env environment=dev`

Example:
```bash
npx cypress run --spec cypress/e2e/.../TC1.cy.ts --env environment=dev
```

---

## 5) Failure Classification

Each failure is classified before edit:
1. Selector drift
2. Timing/flakiness
3. Fixture/data mismatch
4. Assertion outdated (intended behavior change)
5. Environment/config/access issue
6. Product bug (not a test bug)

Default auto-heal classes: **1–3**.
Class 4 requires stronger evidence. Classes 5–6 escalate.

---

## 6) Safe Fix Ladder (Least-Risk First)

1. **Selectors**
   - Prefer stable `data-testid` or semantic selectors
   - Avoid brittle deep CSS chains
2. **Timing / Sync**
   - Prefer deterministic waits (`intercept`, retryable assertions)
   - Avoid global timeout inflation as first move
3. **Fixtures / Data**
   - Minimal explicit data alignment
4. **Assertions**
   - Update only when intended behavior change is verified

---

## 7) Hard Bans

Do not do these without explicit approval:
- blanket `cy.wait(5000+)`
- global timeout inflation everywhere
- broad `{ force: true }` use to bypass state
- disabling/skipping tests to force green
- weakening meaningful assertions to trivial checks

### Exception: Intercept-related instability (explicitly approved)
If a failure is directly caused by unstable/missing intercept hits, a bounded hard wait is allowed as a temporary exception, with both requirements:
- comment out the specific intercept wait line with a `TEMP EXCEPTION` note
- add a bounded `cy.wait(<ms>)` in its place (smallest practical value)

---

## 8) Escalation Rules

Stop and escalate when:
- likely product bug
- route/access/env preconditions not met
- behavior expectation is ambiguous/conflicting
- fix would require app code (not test code)
- policy-violating patch is required

---

## 9) Output Format (Per Test ID)

Return:
- Service + test ID
- Root cause hypothesis
- Files changed (only related files)
- What changed and why
- Individual spec run result
- Pass/fail status
- Confidence (`high|medium|low`)
- If failed: escalation reason + next required human action
- Branch + PR link (if pushed)

---

## 10) Operator Prompt Template

```text
Self-heal one Cypress test ID using protocol constraints.

Service directory: <reports2/forms/users/...>
Test ID: <TCxx>
Base branch: <main/develop> (optional)
Mode: <commit-only|push-branch> (optional)

Use clues strictly from testing/hints/** plus related files for this test ID.
Apply minimal patches, run only the individual spec for this test ID with --env environment=dev, repeat until fixed, skipped-cap, or escalated as likely product bug.
Auto-advance to the next queued spec after pass/pending-accepted/skipped-cap.
```

---

## 11) VPS Script Runner Capability (Mandatory)

For each assigned service, agent runs scripts on the VPS machine directly, in sequence (one-by-one), and does not batch-hide failures.

### Queue execution guardrails (mandatory)
- Use `testing/auto_queue_runner.sh` for multi-spec requests.
- Default hard cap: `10` fail loops per spec (unless user overrides).
- On cap hit: stop retries, report `skipped-cap`, and auto-advance.
- Never wait for user prompt to move to next spec after pass/pending-accepted/skipped-cap.

Execution sequence:
1. Run script/spec #1
2. If fail: capture failure instance details and report immediately
3. Attempt minimal fix
4. Re-run same script/spec
5. Repeat until pass or escalate
6. Move to next script/spec only after final status is recorded for current item

Per-failure report must include:
- script/spec name
- fail instance number (`attempt-1`, `attempt-2`, ...)
- short root-cause hypothesis
- exact command run
- key error excerpt
- fix applied (or reason none)
- re-run result

If passing after fix, send a closeout update for that script/spec before continuing.

---

## 12) Continuous Update + Parallel Reporter Mode

Moving forward, every healing task uses continuous update mode by default.

### Update cadence (required)
- **Start update:** what is being run first
- **Failure update(s):** every fail instance, with attempt count
- **Fix update(s):** what changed before each retry
- **Recovery update:** when a previously failing script/spec turns green
- **Task closeout:** summary of pass/fail per item

### Precision output contract (required)
Every operator-facing update must use this exact compact structure:
- `Spec: <path>`
- `Status: <running|failed|passed|pending-accepted|skipped-cap>`
- `Issue: <exact first failure line or none>`
- `Done: <exact change/command executed>`
- `Next: <next deterministic action>`

### Parallel reporter role
Maintain a dedicated reporter stream in parallel to technical healing work:
- Healing worker: executes diagnosis/fixes/runs
- Reporter role: posts operator-facing progress updates in real time

In practice, this means no silent long runs: operator must always be able to see current item, latest attempt, and current status.

### Verifier role (required, parallel)
Verifier must run in parallel and gate advancement for every spec:
1. Check patch quality/risk
2. Check protocol adherence (format, cadence, no pending-test edits, intercept exception usage)
3. Check queue progression (no stalling on completed spec)
4. Enforce loop cap decision: if attempts > cap, mark `skipped-cap` and force next spec

### Runtime helper (enforcement)
Use `testing/run_cypress_with_heartbeat.sh` to enforce heartbeat updates while a spec is running.

Example:
```bash
./testing/run_cypress_with_heartbeat.sh reports2 cypress/e2e/Reports/Delinquency/TC4.cy.ts dev
```

Artifacts:
- Status file: `testing/.runtime/<service>__<spec>.status`
- Log file: `testing/.runtime/<service>__<spec>.log`

The helper emits 60-second heartbeats and final pass/fail status, which reporter mode must relay to operator messages.

---

## 13) Governance Execution Model (v3)

### Command model
- Operator (JP): sets mandates and hard constraints.
- Manager (Jarvis): executes queue and enforces guardrails.
- Verifier: independently checks quality + strict protocol adherence before advancement.

### Mandatory controls (must be executable, not remembered)
- Queue execution: `testing/auto_queue_runner.sh`
- Heartbeat/finalization: `testing/run_cypress_with_heartbeat.sh`
- Hard loop cap: enforced per spec (default `10`)
- Advancement rule: pass / pending-accepted / skipped-cap -> immediate next spec

### Failure to comply handling
If any protocol breach is detected (stale status, no auto-advance, missing verifier gate, bad format), stop and patch tooling/protocol before resuming.
