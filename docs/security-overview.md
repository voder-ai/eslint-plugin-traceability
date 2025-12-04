# Security Overview

This document provides a single, maintainer-focused overview of how security is enforced for `eslint-plugin-traceability`. It is intended for internal reviewers and automated assessors that need to understand the projects security posture without reading every script, ADR, and incident report.

User-facing guarantees (what we promise to consumers of the published npm package) are defined in **`SECURITY.md`** at the repository root. This overview explains how those guarantees are implemented and verified in code, scripts, and CI.

## 1. High-level Guarantees

The project makes the following security statements in user-facing documentation (SECURITY.md and README):

- The **published npm package** has **no runtime dependencies** today. If runtime dependencies are added in the future, releases must not ship with **known high-severity vulnerabilities** in the production dependency tree.
- Release automation (semantic-release, npm, GitHub Actions) and other dev-only tooling may have separate, documented risk, but this tooling does **not** run in user projects and is isolated to CI.
- Accidental secrets committed to the repository are treated as blocking issues and are caught by secret scanning before releases succeed.

This overview documents the concrete checks and controls that enforce those guarantees.

## 2. Security-related Commands and Scripts

### 2.1 npm scripts (package.json)

Key security-related npm scripts:

- **`npm run ci-verify:full`**
  - Central CI/local quality gate used in:
    - GitHub Actions: `quality-and-deploy` job in `.github/workflows/ci-cd.yml`.
    - Local development: `.husky/pre-push` hook.
  - Runs (in order):
    1. `npm run check:traceability` (not a security tool, but enforces internal traceability policy).
    2. `npm run safety:deps` (dependency maturity and health; *advisory*  see below).
    3. `npm run audit:ci` (full `npm audit --json`; *advisory*).
    4. `npm run build` (TypeScript compile).
    5. `npm run type-check` (no-emit type check).
    6. `npm run lint-plugin-check`.
    7. `npm run lint -- --max-warnings=0`.
    8. `npm run duplication` (jscpd).
    9. `npm run test -- --coverage`.
    10. `npm run format:check`.
    11. **`npm audit --omit=dev --audit-level=high`** (**gating** production security audit).
    12. `npm run audit:dev-high` (dev-only audit; *advisory*).

- **`npm run safety:deps`**
  - Implementation: `node scripts/ci-safety-deps.js`.
  - Behavior:
    - Runs `npm run deps:maturity -- --format=json` (dry-aged-deps) and writes `ci/dry-aged-deps.json`.
    - Always exits `0` (**never fails CI by itself**); on errors, writes a structured JSON error payload instead of crashing.
  - Role: **Advisory** dependency maturity and vulnerability signal for both prod and dev dependencies. Used as evidence in dependency-health and incident docs, not as a hard gate.

- **`npm run audit:ci`**
  - Implementation: `node scripts/ci-audit.js`.
  - Behavior:
    - Runs `npm audit --json`.
    - Writes output to `ci/npm-audit.json`.
    - Always exits `0` (**advisory only**), regardless of vulnerabilities.
  - Role: Machine-readable snapshot of the full dependency tree for incident/root-cause analysis.

- **`npm run audit:dev-high`**
  - Implementation: `node scripts/generate-dev-deps-audit.js`.
  - Behavior:
    - Runs `npm audit --include=dev --audit-level=high --json`.
    - Writes output to `ci/npm-audit.json` (dev-focused view).
    - Always exits `0` (**advisory only**).
  - Role: Tracks high-severity **dev-only** vulnerabilities for documented accepted-risk decisions.

- **`npm run deps:maturity`**
  - Underlying CLI for `dry-aged-deps`.
  - Not called directly in CI; CI uses `npm run safety:deps`, which wraps this command and persists JSON output.

- **`npm run security:secrets`**
  - Implementation: `secretlint "**/*" --no-color` with configuration from `.secretlintrc.json`.
  - Behavior:
    - Scans the repository (excluding standard directories like `node_modules`, `lib`, `coverage`, `ci`, `.voder`, `.git`, and common binary assets) for secrets using the recommended secretlint rule preset.
    - Exits **non-zero** on findings; this is a **gating** command.
  - Usage:
    - In CI: `quality-and-deploy` job runs `npm run security:secrets` on Node 20.x.
    - Locally: `.husky/pre-push` hook runs `npm run security:secrets` after `npm run ci-verify:full`.

### 2.2 Supporting configuration

- **`.secretlintrc.json`**
  - Uses `@secretlint/secretlint-rule-preset-recommend`.
  - Ignores generated artifacts and infrastructure directories: `node_modules/**`, `lib/**`, `coverage/**`, `ci/**`, `.voder/**`, `.git/**`, plus common image extensions.
  - Ensures secret scanning focuses on relevant source, config, and documentation files.

- **`package.json overrides`**
  - Enforces safer versions for several transitive dependencies (e.g., `glob`, `http-cache-semantics`, `ip`, `semver`, `socks`, `tar`).
  - Documented and justified in `docs/security-incidents/dependency-override-rationale.md`.
  - These overrides primarily affect **dev-time tooling** (release automation and supporting libraries), not the published plugins runtime behavior.

## 3. CI/CD Security Gates

The single GitHub Actions workflow **`.github/workflows/ci-cd.yml`** implements trunk-based CI/CD with the following security-related behaviors.

### 3.1 `quality-and-deploy` job (push + pull_request)

For every `push` to `main` and every `pull_request` targeting `main`:

1. **Install and validate tooling**
   - `node scripts/validate-scripts-nonempty.js` ensures `scripts/` does not contain empty or placeholder files.
   - `npm ci` installs dependencies from `package-lock.json`.

2. **Run full CI verification** (both Node 18.x and 20.x)
   - Executes `npm run ci-verify:full` (see section 2.1).
   - If any step in `ci-verify:full` fails (including `npm audit --omit=dev --audit-level=high`), the workflow fails **before** any release or smoke-test steps.
   - This production audit is the primary **release-blocking** security check on dependencies.

3. **Secret scanning** (Node 20.x only)
   - Runs `npm run security:secrets`.
   - Any detected secrets cause the job to fail.
   - This is **release-blocking** for pushes to `main`.

4. **Artifact upload**
   - Publishes `ci/dry-aged-deps.json`, `ci/npm-audit.json`, and `scripts/traceability-report.md` as CI artifacts.
   - These artifacts are used in security incident reports and dependency-health reviews.

5. **Automated release (push to `main`, Node 20.x only)**
   - After all quality gates (including `ci-verify:full` and `security:secrets`) succeed, the workflow may run `npx semantic-release`.
   - semantic-release decides whether to publish a new version based on Conventional Commits.
   - If `NPM_TOKEN` is missing or invalid, or if npm requires an OTP, the step logs the issue, sets `new_release_published=false`, and exits `0` without publishing, so CI still passes.

6. **Post-release smoke test**
   - If a new release is published, `scripts/smoke-test.sh` installs the just-published version into a fresh temporary project and runs a minimal ESLint configuration using the plugin.
   - This confirms that the published artifact is installable and behaves as expected.

### 3.2 `dependency-health` job (nightly schedule)

For the nightly `schedule` trigger only:

- Checks out code and installs dependencies with `npm ci`.
- Runs `npm run audit:dev-high` to regenerate `ci/npm-audit.json` focused on high-severity **dev-only** vulnerabilities.
- Does **not** run semantic-release or publish anything.
- Provides a continuous view of dev-dependency risk without blocking releases.

## 4. Local Hooks and Developer Workflow

- **Pre-commit (`.husky/pre-commit`)**
  - Runs `npx lint-staged` to apply Prettier and ESLint `--fix` to staged files under `src/` and `tests/`.
  - Primarily a code-quality hook; not directly security-specific.

- **Pre-push (`.husky/pre-push`)**
  - Runs, in order:
    1. `npm run ci-verify:full`.
    2. `npm run security:secrets`.
  - Mirrors the CI quality and security gates so that most issues are caught **before** code is pushed to `main`.

Developers are encouraged to use `npm run ci-verify:full` as the canonical local check before pushing, especially when changing security-sensitive code, build tooling, or dependencies.

## 5. Gating vs Advisory Checks (Summary)

The table below summarizes which commands are **gating** (can fail CI/pre-push) and which are **advisory** (never fail CI/pre-push, but produce artifacts and logs for review).

| Area                          | Command / Script                                       | Where used                         | Behavior               |
|------------------------------|--------------------------------------------------------|------------------------------------|------------------------|
| Production dependency audit  | `npm audit --omit=dev --audit-level=high`             | `ci-verify:full`, CI + pre-push    | **Gating** (must pass) |
| Dev-only audit (high sev)    | `npm run audit:dev-high` (`scripts/generate-dev-deps-audit.js`) | `ci-verify:full`, CI, nightly job  | Advisory (always 0)    |
| Full audit snapshot          | `npm run audit:ci` (`scripts/ci-audit.js`)            | `ci-verify:full`, CI               | Advisory (always 0)    |
| Dependency maturity / health | `npm run safety:deps` (`scripts/ci-safety-deps.js`)   | `ci-verify:full`, CI               | Advisory (always 0)    |
| Secret scanning              | `npm run security:secrets` (secretlint)               | CI (Node 20.x), pre-push           | **Gating** (must pass) |
| Traceability policy          | `npm run check:traceability` (`scripts/traceability-check.js`) | `ci-verify:full`, CI + pre-push    | Gating (must pass)     |

> Note: While `check:traceability` is primarily about requirements traceability rather than security, failures in this command do block CI and pre-push because traceability is part of the projects overall quality bar.

## 6. Relationship to Other Security Documentation

- **`SECURITY.md` (root)**
  - Canonical user-facing security policy.
  - Describes how to report vulnerabilities, which versions are supported, and what guarantees apply to production dependencies versus dev-only tooling.
  - Maintainers and assessors can treat this **Security Overview** as the concrete implementation guide that underpins those guarantees.

- **`docs/dependency-health.md`**
  - Explains how `dry-aged-deps`, `npm audit`, and CI scripts are used to assess and maintain dependency health.
  - Uses the commands and classifications defined in this overview.

- **`docs/ci-cd-pipeline.md`**
  - Describes the full CI/CD pipeline, including where `ci-verify:full`, `security:secrets`, and dependency-health checks fit into the trunk-based workflow.

- **`docs/security-incidents/*` and `docs/decisions/adr-*.md`**
  - Record specific incidents, accepted risks (especially for dev-only tooling), and architectural decisions related to security.
  - These documents rely on the same commands and behaviors summarized here (for example, they reference `ci/npm-audit.json`, `ci/dry-aged-deps.json`, and `npm audit --omit=dev --audit-level=high`).

When updating security tooling or policies, update this **Security Overview** first, then:

1. Ensure `SECURITY.md` remains accurate for user-facing guarantees.
2. Update `docs/dependency-health.md` and `docs/ci-cd-pipeline.md` to match any new commands or gates.
3. Add or update incident and ADR documents as needed to describe new risks or decisions.
