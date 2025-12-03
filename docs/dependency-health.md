# Dependency Health and dry-aged-deps Usage

This document explains how we assess and maintain dependency health in this project, with a focus on the `dry-aged-deps` maturity tool, how it interacts with our CI/CD pipeline, and how its outputs are incorporated into security incident and risk-acceptance records.

This is **internal/development-facing documentation** for maintainers and advanced contributors. The guarantees in the README and other user docs are **plain-language summaries** that are _backed by_ the processes described here, not the other way around.

## Canonical Commands

Contributors and automation **must** use the following npm scripts when working with dependency health.

### 1. Dependency maturity (dry-aged-deps)

We use [`dry-aged-deps`](https://github.com/voder-ai/dry-aged-deps) to identify dependency upgrade candidates that are both time-tested and free from known vulnerabilities, for **both production and development dependencies**.

- **Script**: `npm run deps:maturity`
- **CLI**: `dry-aged-deps`

Run with JSON output (recommended for reviews and CI tooling):

```bash
npm run deps:maturity -- --format=json
```

To additionally enforce exit codes based on health status, use the `--check` flag:

```bash
npm run deps:maturity -- --format=json --check
```

The JSON report is written to **stdout**. In CI, `npm run safety:deps` wraps this command and persists the latest report to `ci/dry-aged-deps.json` as a build artifact for later inspection and for use in incident documentation.

**Important behavior:**

- `dry-aged-deps` is **advisory only**:
  - It **does not** automatically modify `package.json`, `package-lock.json`, or install anything.
  - It **does not** auto-upgrade dependencies in CI or locally.
- All dependency changes are made explicitly (e.g., via `npm install`, `npm update`, or manual edits), and then reviewed through normal PR and release processes.
- `--check` can cause CI to fail if health thresholds are not met, but it still does **not** apply any changes; it only reports and signals status.

### 2. Production security audit

For production (runtime) dependencies, we use npm’s built-in audit with modern flags:

```bash
npm audit --omit=dev --audit-level=high
```

This command is part of `npm run ci-verify:full` and is executed automatically in CI and the Husky pre-push hook. It must pass (no high-severity issues in the **production** dependency tree) for a release to proceed.

The JSON output from broader audits (see below) is used as evidence in:

- Security incident reports.
- Known-error records.
- Architecture/decision records related to dependency risk.

### 3. Dev-dependency audit and safety checks

Dev-only vulnerabilities are tracked separately and **do not** block CI by themselves, but they must be documented and reviewed:

- `npm run audit:dev-high` – runs a dev-only audit using `npm audit --include=dev --audit-level=high --json`, normalizes the result to always exit with code `0` (never failing CI directly), and writes the JSON output to `ci/npm-audit.json` for targeted inspection of high-severity dev-only vulnerabilities.
- `npm run audit:ci` – runs `npm audit --json` and writes `ci/npm-audit.json` for CI artifacts.
- `npm run safety:deps` – runs `dry-aged-deps` with JSON output and writes `ci/dry-aged-deps.json`.

The dev audit focuses **exclusively** on dev dependencies via `npm audit --include=dev --audit-level=high --json`. It is designed **never to fail CI** (the script forces an exit code of `0`), and its JSON output is stored at `ci/npm-audit.json` for inspection alongside the full audit.

These scripts are wired into `ci-verify:full` and the GitHub Actions pipeline and, together with `dry-aged-deps` reports, form the evidence base for:

- Security incident investigations.
- Known-error documentation when dev-only vulnerabilities are accepted.
- Validating the claims we make in user-facing docs (e.g., the README).

## How dry-aged-deps Guides Upgrades

`dry-aged-deps` evaluates available versions against configurable **age** and **security** thresholds for both production and development dependencies.

### Current Configuration

In this project, the thresholds are currently equivalent for both groups:

```json
{
  "prod": { "minAge": 7, "minSeverity": "none" },
  "dev": { "minAge": 7, "minSeverity": "none" }
}
```

Explicitly:

1. **7-day minimum age**
   - A candidate version must have been published for **at least 7 days** (`minAge: 7`).
   - This applies to **both**:
     - Production dependencies (`prod`)
     - Development dependencies (`dev`)

2. **"none" minimum severity**
   - `minSeverity: "none"` means **any known vulnerability** (even low-severity) disqualifies a version as a "safe" update.
   - For a version to be considered a safe candidate upgrade by `dry-aged-deps`, it must:
     - Be at least 7 days old.
     - Have **zero** known vulnerabilities of any severity.

When `dry-aged-deps` finds no qualifying candidates under these constraints:

- `summary.totalOutdated` and `summary.safeUpdates` will both be `0`.
- `packages` will be an empty array.

This state is a **signal** that:

- Either we are already on the latest qualifying versions under the configured thresholds, or
- All newer versions are either too recent (younger than 7 days) or have at least one known vulnerability.

### Advisory Role in Upgrade Decisions

Because `dry-aged-deps` is advisory and non-mutating:

- It **highlights** which dependency updates are both:
  - Maturity-qualified (age ≥ 7 days).
  - Vulnerability-free (`minSeverity: "none"`).
- It **does not**:
  - Change dependency files.
  - Automatically apply any upgrades in CI.

Maintainership responsibilities:

- Use the JSON report (especially `ci/dry-aged-deps.json` from CI) during dependency review to:
  - Identify safe upgrade paths for both prod and dev dependencies.
  - Understand when no safe upgrade path currently exists under the configured criteria.
- Make explicit, manual changes to dependencies, then re-run:
  - `npm run deps:maturity -- --format=json --check`
  - `npm audit --omit=dev --audit-level=high`
  - Relevant audit scripts
    to validate the updated state before merging and releasing.

## How dry-aged-deps, npm audit, and Incident Records Interact

`dry-aged-deps` reports and npm audit outputs are used together to:

1. Determine **release readiness** for production dependencies.
2. Document and justify any **accepted risks**, especially for dev-only tooling.
3. Provide **evidence backing** for the security-related statements in the README and other user-facing docs.

### Evidence for Production-Side Guarantees

Our user-facing docs (e.g., the README) state that published versions of this project do not contain any _known_ high-severity vulnerabilities in their **production dependency tree** at release time.

Internally, this claim is backed by:

- Successful execution of:
  - `npm audit --omit=dev --audit-level=high`
- Verification that:
  - The audit reports **0 high-severity** production vulnerabilities.
- Corroborating context from:
  - `dry-aged-deps` reports (for availability of mature, vulnerability-free upgrades).

If these conditions are not met, a release is not allowed to proceed under normal circumstances, and a security incident or exception process is invoked.

### Handling Dev-Only Vulnerabilities and Semantic-Release/npm

Some high-severity vulnerabilities exist in **dev-only tooling**, specifically in the semantic-release/npm toolchain, which is used only in CI/release workflows, not at runtime in production environments.

Current handling:

- `npm audit --include=dev --audit-level=high --json` (via `npm run audit:dev-high` and `npm run audit:ci`) identifies these vulnerabilities and writes **dev-focused** and **full** audit results to `ci/npm-audit.json`.
- `dry-aged-deps` is run with the same strict thresholds for dev dependencies:
  - `minAge: 7`
  - `minSeverity: "none"`

Under these thresholds, `dry-aged-deps` currently reports:

- No safe upgrade path (no candidate versions that are both ≥ 7 days old and vulnerability-free) for certain semantic-release/npm–related packages.

As a result:

- We **intentionally continue** to use the existing semantic-release/npm toolchain.
- We record and manage this as an **accepted dev-only risk**, not a production risk.

This acceptance is formalized and supported by:

- A **known error** record:
  - `docs/security-incidents/SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md`
- An **architecture/decision record** (ADR):
  - `docs/decisions/adr-accept-dev-dep-risk-glob.md`
- CI artifacts:
  - `ci/npm-audit.json`
  - `ci/dry-aged-deps.json`

These documents and artifacts show:

- What the vulnerabilities are.
- Where they live (dev-only, CI-only tooling).
- Why they are accepted (no safe, mature, vulnerability-free alternatives under our thresholds).
- What compensating controls are in place.

### Compensating Controls for Accepted Dev-Only Risk

Because `dry-aged-deps` currently identifies **no safe upgrade path** (under the 7-day / `"none"` thresholds) that would resolve these bundled dev-only vulnerabilities, we:

- Keep the existing semantic-release/npm toolchain in place.
- Enforce the following compensating controls:
  - CI isolation and hardened environments for release automation.
  - Strict audits for **production** dependencies (must pass `npm audit --omit=dev --audit-level=high`).
  - Explicit documentation via:
    - Known-error and incident records.
    - ADRs describing the rationale and review process.
- Periodically re-run and re-review:
  - `npm run deps:maturity -- --format=json --check`
  - `npm run audit:dev-high`
  - `npm run audit:ci`
    to see whether a new, safe, mature upgrade path has appeared.

These processes ensure that:

- End users see a concise, plain-language statement of security posture in the README and related docs.
- That statement is grounded in:
  - Concrete `dry-aged-deps` configuration (7-day / `"none"` thresholds for prod and dev).
  - Regular, automated `npm audit` runs.
  - Documented incident handling and risk acceptance when no compliant upgrade path exists.

## Current Status (2025-12-03, verified)

As of the latest review:

- `npm run deps:maturity -- --format=json --check` reports:
  - `totalOutdated: 0`
  - `safeUpdates: 0`
  - `packages: []`
- `npm audit --omit=dev --audit-level=high` reports **0 high-severity** vulnerabilities for production dependencies.
- Remaining high-severity issues are limited to **dev-only tooling** (the semantic-release/npm toolchain) and are documented as a **known error**:
  - `docs/security-incidents/SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md`
  - `docs/decisions/adr-accept-dev-dep-risk-glob.md`

This combination of:

- Advisory `dry-aged-deps` checks (with 7-day / `"none"` thresholds for prod and dev),
- Mandatory production-only `npm audit` gating,
- Non-blocking but fully recorded dev-only audits, and
- Documented risk acceptance for the semantic-release/npm toolchain

is what underpins the security-related guarantees we present to users in the README and other user-facing documentation.
