# Dependency Health and dry-aged-deps Usage

This document explains how we assess and maintain dependency health in this project, with a focus on the `dry-aged-deps` maturity tool and how it interacts with our CI/CD pipeline and security incident process.

## Canonical Commands

Contributors and automation **must** use the following npm scripts when working with dependency health.

### 1. Dependency maturity (dry-aged-deps)

We use [`dry-aged-deps`](https://github.com/voder-ai/dry-aged-deps) to identify upgrade candidates that are both time-tested and free from known vulnerabilities.

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

The JSON report is written to **stdout**. In CI, `npm run safety:deps` wraps this command and persists the latest report to `ci/dry-aged-deps.json` as a build artifact.

### 2. Production security audit

For production (runtime) dependencies, we use npms built-in audit with modern flags:

```bash
npm audit --omit=dev --audit-level=high
```

This command is part of `npm run ci-verify:full` and is executed automatically in CI and the Husky pre-push hook. It must pass (no high-severity issues) for a release to proceed.

### 3. Dev-dependency audit and safety checks

Dev-only vulnerabilities are tracked separately and **do not** block CI by themselves, but they must be documented and reviewed:

- `npm run audit:dev-high`  runs a dev-only audit using `npm audit --include=dev --audit-level=high --json`, normalizes the result to always exit with code `0` (never failing CI directly), and writes the JSON output to `ci/npm-audit.json` for targeted inspection of high-severity dev-only vulnerabilities.
- `npm run audit:ci`  runs `npm audit --json` and writes `ci/npm-audit.json` for CI artifacts.
- `npm run safety:deps`  runs `dry-aged-deps` and writes `ci/dry-aged-deps.json`.

The dev audit focuses **exclusively** on dev dependencies via `npm audit --include=dev --audit-level=high --json`. It is designed never to fail CI (the script forces an exit code of `0`), and its JSON output is stored at `ci/npm-audit.json` for inspection alongside the full audit.

These scripts are wired into `ci-verify:full` and the GitHub Actions pipeline.

## How dry-aged-deps Guides Upgrades

`dry-aged-deps` evaluates available versions against configurable **age** and **security** thresholds for both production and development dependencies. In this project, the thresholds are currently equivalent for both groups:

```json
{
  "prod": { "minAge": 7, "minSeverity": "none" },
  "dev": { "minAge": 7, "minSeverity": "none" }
}
```

Interpretation:

- A candidate version must have been published for **at least 7 days**.
- Any known vulnerability (even low-severity) disqualifies a version as a "safe" update.

When `dry-aged-deps` finds no qualifying candidates, `summary.totalOutdated` and `summary.safeUpdates` will both be `0`, and `packages` will be an empty array.

## Current Status (2025-12-03, verified)

- `dry-aged-deps` executed successfully via `npm run deps:maturity -- --format=json --check`; no safe updates are available (`totalOutdated: 0`, `safeUpdates: 0`).

As of the latest review:

- `npm run deps:maturity -- --format=json --check` reports:
  - `totalOutdated: 0`
  - `safeUpdates: 0`
  - `packages: []`
- `npm audit --omit=dev --audit-level=high` reports **0 high-severity** vulnerabilities for production dependencies.
- Remaining high-severity issues are limited to **dev-only tooling** (the semantic-release/npm toolchain) and are documented as a **known error**:
  - `docs/security-incidents/SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md`
  - `docs/decisions/adr-accept-dev-dep-risk-glob.md`

These combined checks are what allow us to state in the README, in plain language, that published versions of this project do not contain any *known* high-severity vulnerabilities in their **production dependency tree** at release time.

Because `dry-aged-deps` currently identifies **no safe upgrade path** that would resolve these bundled dev-only vulnerabilities while satisfying our maturity thresholds, we:

- Keep the existing semantic-release/npm toolchain in place.
- Rely on compensating controls (CI isolation, strict production audits, and overrides) as documented in the known error record and security incident procedures.

This document is primarily aimed at maintainers and advanced users who want to understand **how** those README guarantees are enforced behind the scenes, including the specific tools, thresholds, and review processes that back up the user-facing claims.