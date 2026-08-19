# Filings E2E: GitHub Actions Secrets setup

The filings workflow uses ten repository-level GitHub Actions secrets, one for
each independent test slot. Each matrix job receives exactly one secret, runs
exactly one Playwright worker, and selects the tests carrying its matching slot
tag. No credential pool file is stored in the repository or created by the
workflow.

Create these repository secrets:

```text
FILINGS_SLOT_00
FILINGS_SLOT_01
FILINGS_SLOT_02
FILINGS_SLOT_03
FILINGS_SLOT_04
FILINGS_SLOT_05
FILINGS_SLOT_06
FILINGS_SLOT_07
FILINGS_SLOT_08
FILINGS_SLOT_09
```

GitHub secret names may contain only letters, numbers, and underscores, so a
name such as `slot-00` is invalid. The slot ID inside the value keeps the
hyphenated form (`slot-00`).

Before provisioning, rotate every credential that was previously committed.
Removing a value from the current branch does not remove it from Git history,
existing clones, prior workflow logs, caches, or old test artifacts.

## Secret value schema

Every `FILINGS_SLOT_NN` value is a minified JSON object with exactly the same
keys. `VERSION` must be the number `1`, and `SLOT_ID` must match the secret's
matrix assignment. All other values must be non-empty strings.

Use this shape for `FILINGS_SLOT_00`; the values below are placeholders, not
real account or business data:

```json
{
  "VERSION": 1,
  "SLOT_ID": "slot-00",
  "TAXPAYER_USERNAME": "placeholder-taxpayer-00@example.invalid",
  "TAXPAYER_PASSWORD": "replace-with-rotated-password",
  "MUNICIPAL_USERNAME": "placeholder-municipal-00@example.invalid",
  "MUNICIPAL_PASSWORD": "replace-with-rotated-password",
  "AGS_USERNAME": "placeholder-ags-00@example.invalid",
  "AGS_PASSWORD": "replace-with-rotated-password",
  "DEFAULT_BUSINESS": "PLACEHOLDER DEFAULT BUSINESS 00",
  "FUNDED_BUSINESS": "PLACEHOLDER FUNDED BUSINESS 00",
  "DRAFT_BUSINESS": "PLACEHOLDER DRAFT BUSINESS 00",
  "ZERO_PAYMENT_BUSINESS": "PLACEHOLDER ZERO PAYMENT BUSINESS 00"
}
```

The ten data fields are:

- `TAXPAYER_USERNAME`
- `TAXPAYER_PASSWORD`
- `MUNICIPAL_USERNAME`
- `MUNICIPAL_PASSWORD`
- `AGS_USERNAME`
- `AGS_PASSWORD`
- `DEFAULT_BUSINESS`
- `FUNDED_BUSINESS`
- `DRAFT_BUSINESS`
- `ZERO_PAYMENT_BUSINESS`

Create the other values with matching IDs through `slot-09`. Do not add
comments, trailing commas, or extra keys to the JSON.

At every slot index, confirm that the taxpayer owns or can access all four
businesses and that the same-index municipal and AGS accounts can see their
filings. Default and funded businesses must have a usable saved payment method
where the filing flow requires one. The zero-payment business is separate
because its state can be mutated by the related tests.

Across all ten slots, require unique account usernames and globally unique
business names. Passwords should also be independent so rotating or locking one
test account does not disable another slot.

## Repository-secret trust boundary

Repository secrets are intentionally the only secret store for this workflow.
They do not provide a branch-level access boundary: GitHub documents that a user
with repository write access must be treated as having read access to every
repository secret, because workflow code can explicitly reference those values.
Only grant repository write and workflow-management access to people authorized
to use all ten slots.

The `main` ref check in the non-secret preflight is a friendly operational guard
for this workflow as currently written, not a security boundary. A writer could
change or replace workflow code on another branch. Protect `main`, this workflow,
and the complete executable `filings` tree with required review and CODEOWNERS,
and tightly restrict who may create or run Actions workflows.

## Create the repository secrets without a local file

For each slot:

1. Open **Settings > Secrets and variables > Actions** in the repository.
2. Under **Repository secrets**, select **New repository secret**.
3. Enter a name such as `FILINGS_SLOT_00`.
4. Build and validate the slot JSON in an approved ephemeral secret-entry
   session, minify it, and paste it directly into the GitHub value field.
5. Submit it, clear the clipboard, and close the ephemeral session without
   saving its contents.
6. Repeat through `FILINGS_SLOT_09`.

Do not create a `.env`, JSON pool, PowerShell script, shell-history entry, CI
artifact, or repository file containing the values. GitHub encrypts a secret
before storing it when it is submitted through the UI. After upload, GitHub's
UI, CLI, and REST API can show the secret name and metadata but cannot return
its plaintext value. A credentialed local filing run therefore cannot download
these secrets; it must run in GitHub Actions or receive a slot through another
explicitly approved process-variable injection.

Because stored values cannot be read back, global uniqueness must be checked
during initial provisioning and every rotation while all proposed slot values
are available in the same approved in-memory provisioning session. The runtime
validator can validate only the selected slot; it cannot compare one job's
secret with the other nine secrets.

## Structured-secret masking

GitHub recommends avoiding structured secret values because transformations or
individual fields extracted from a JSON secret are not guaranteed to be masked
automatically. This design deliberately uses JSON to keep one complete resource
set atomic, so the repository validator adds a compensating control:

1. It parses and validates the selected slot without printing it.
2. It registers all ten data fields with the GitHub runner's masking command.
3. The later Playwright step receives the same single secret and its expected
   slot ID.

Never print `FILINGS_RESOURCE_SLOT_JSON`, parsed slot objects, credential
fields, business names, or the complete process-variable set. Masking is a
last-line safeguard, not permission to log secret data.

## Workflow order and parallel behavior

The workflow has three ordered stages:

1. A non-secret preflight explicitly fails a manually dispatched ref other than
   `main`, then runs `npm ci`, type-checking, resource parser tests, and the
   slot/account-role allocation validator once. No slot secret is available to
   this job.
2. After preflight succeeds, the ten matrix jobs run in parallel. Each job
   receives only its selected repository secret, validates and masks that value,
   installs the browser, and runs its tagged tests with one worker.
3. After every matrix job succeeds, the isolated TC40 lane runs by itself with
   repository secret `FILINGS_SLOT_00`.

[`nlg-filings-e2e.yml`](../.github/workflows/nlg-filings-e2e.yml) defines a
static ten-entry matrix that pairs each secret with one explicit test tag:

```text
slot-00 / FILINGS_SLOT_00 / @slot-00
slot-01 / FILINGS_SLOT_01 / @slot-01
...
slot-09 / FILINGS_SLOT_09 / @slot-09
```

Every matrix job runs with `--workers=1`. That job gets only its named secret,
so tests within one slot group consistently reuse the same taxpayer, municipal,
AGS, and business set. Slot tags live on each individual runnable `test`, not on
its `describe` suite, so a test cannot move slots as a side effect of file-order
or suite changes.

The balanced allocation is:

```text
@slot-00: TC2, TC4, TC26
@slot-01: TC37, TC30, TC19
@slot-02: TC15, TC12, TC24
@slot-03: TC23, TC16, TC28
@slot-04: TC38, TC31, TC20
@slot-05: TC35, TC21, TC32, TC29
@slot-06: TC7, TC22, TC33
@slot-07: TC14, TC17, TC13
@slot-08: TC27, TC36, TC10
@slot-09: TC5, TC18, TC34
```

Role tags (`@ags`, `@municipal`, and `@taxpayer`) document which accounts each
test uses. Across the ten slots, AGS usage is either one or two tests per slot;
municipal and taxpayer usage are also either one or two. One slot contains four
tests and every other slot contains three.

Because every test receives only its selected `resourceSlot`, account and
business values always come from the same slot within that test.

Before any slot secret is injected, the preflight type-checks the suite, tests
the resource parser, and runs `npm run slots:validate` once. Its custom
Playwright list reporter rejects a runnable test unless it has exactly one
supported slot tag and at least one supported role tag. The reporter also
rejects tags on disabled tests, unsupported or duplicate tags, slot sizes
outside three to four tests, a role missing from any slot, and any account-role
distribution whose maximum and minimum slot counts differ by more than one. The
selected slot is then validated and masked before any browser is installed. Ten
jobs can run in parallel, while `fail-fast: false` lets other slot groups finish
if one slot fails.

The workflow has only manual and daily scheduled triggers. The non-secret
preflight gives an early, friendly failure when a manual dispatch names anything
other than `main`, but this code-level check is not a security boundary.
Repository secrets trust every user who can introduce or execute workflow code
in this repository; a modified or new workflow could reference all ten secrets.
Only users authorized to access all slot data may have that level of repository
access. Do not add `pull_request`, `pull_request_target`, `repository_dispatch`,
or a user-supplied secret name. Credentialed browser tests must run only against
reviewed code. Protect `.github/workflows/**` and the complete executable
`filings` tree with `CODEOWNERS` and required review. The workflow has only
`contents: read`, checkout does not persist credentials, third-party actions are
pinned to full commit hashes, and no browser artifact is uploaded.

The workflow concurrency group is `filings-e2e-dev` with cancellation disabled.
This serializes complete workflow runs so two runs cannot operate on the same
ten accounts and businesses simultaneously.

`TC40` changes global approval state and therefore has no slot or role tag. The
workflow runs it in the `global-approval-state-test` job only after all ten
parallel jobs succeed. That job reuses `FILINGS_SLOT_00` sequentially, sets
`E2E_RUN_GLOBAL_STATE=true`, and runs one unsharded worker. The workflow-level
concurrency group also prevents it from overlapping another filings workflow
run. When `E2E_RUN_GLOBAL_STATE=true`, the Playwright configuration selects only
TC40, so the serial job cannot accidentally run the normal filing suite.

## Rotation and operational checks

For every provisioning or rotation session:

- Validate all ten schemas and exact `SLOT_ID` values before upload.
- Reject duplicate usernames and duplicate business names across all slots.
- Confirm every same-index account can access the same-index businesses.
- Update an entire slot atomically as one repository secret.
- Trigger the workflow manually and confirm the non-secret preflight and all ten
  selected-slot validation steps before relying on the scheduled run.
- Clear clipboard and process memory where practical, and retain no plaintext
  provisioning artifact.
- Restrict repository-secret administration, repository write access, and
  workflow-management access to the smallest practical group.

GitHub currently allows up to 100 repository secrets and limits each value to
48 KB, so ten compact slot objects fit within the platform limits. Repository
secrets are read when a workflow run is queued. Do not queue a run while
rotating the ten separate secrets: a run queued partway through the rotation
could receive a mixture of old and new slots.

Official references:

- [GitHub Actions secret naming, limits, and structured-data warning](https://docs.github.com/en/actions/reference/security/secrets)
- [Using secrets in GitHub Actions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)
- [GitHub Actions Secrets REST API](https://docs.github.com/en/rest/actions/secrets)
- [Secure use of GitHub Actions](https://docs.github.com/en/actions/reference/security/secure-use)
