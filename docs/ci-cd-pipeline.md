# CI/CD Pipeline and Continuous Deployment

This document describes how continuous integration and continuous deployment are implemented for `eslint-plugin-traceability`, and how it relates to our architecture decisions.

We follow a **trunk-based development model** where `main` is the **single integration branch**. Day‑to‑day development work is expected to land directly on `main`, and the CI/CD pipeline is defined around **pushes to `main`** as the authoritative integration and release trigger.

- Related ADRs:
  - `docs/decisions/006-semantic-release-for-automated-publishing.accepted.md`
  - `docs/decisions/007-github-releases-over-changelog.accepted.md`
  - `docs/decisions/005-github-actions-validation-tooling.accepted.md`

## Overview

We use a **single unified GitHub Actions workflow** to run all quality checks and, on successful `main`-branch builds, to automatically publish new versions to npm and create GitHub Releases.

- Workflow file: `.github/workflows/ci-cd.yml`
- Workflow name: `CI/CD Pipeline`
- Triggers:
  - **Authoritative CI/CD trigger:** `push` to `main` (trunk-based integration and deployment)
  - **Auxiliary feedback trigger:** `pull_request` targeting `main` (for optional review flows and forks)
  - Nightly `schedule` for dependency health checks

There are no tag-based triggers and no manual `workflow_dispatch` jobs for releases. Publishing (when needed) always happens as part of the same workflow run that executes the quality gates, and **only for `push` events on `main`**.

Pull request runs exist to give **early feedback** (for contributors working in forks or when an explicit review flow is desired), but the **source of truth for integration and deployment is always `main`** and its push-based CI runs.

## Jobs

### 1. `quality-and-deploy`

Runs on:

- Every `push` to `main` (**primary, authoritative CI/CD path**)
- Every `pull_request` targeting `main` (**feedback-only, no publishing**)

Matrix:

- Node `18.x`
- Node `20.x`

Key steps (in order):

1. **Checkout & Node setup**
   - `actions/checkout@v4` with full history (needed for semantic-release)
   - `actions/setup-node@v4` with `cache: npm`

2. **Script validation**
   - `node scripts/validate-scripts-nonempty.js` ensures all npm scripts referenced by CI exist and are non-empty.

3. **Install dependencies**
   - `npm ci`

4. **Full quality gate**
   - `npm run ci-verify:full`
   - This script is the canonical definition of our quality gates and is also used by the Husky pre-push hook.
   - It runs, in order:
     - `npm run check:traceability`
     - `npm run safety:deps`
     - `npm run audit:ci`
     - `npm run build`
     - `npm run type-check`
     - `npm run lint-plugin-check`
     - `npm run lint -- --max-warnings=0`
     - `npm run duplication`
     - `npm run test -- --coverage`
     - `npm run format:check`
     - `npm audit --omit=dev --audit-level=high`
     - `npm run audit:dev-high`
   - For a consolidated description of all security-related tooling and gates (including how these audit steps fit into the overall model), see `docs/security-overview.md`.

5. **Secret scanning**
   - Only on Node `20.x` matrix entry: `npm run security:secrets` using secretlint.

6. **Artifact upload**
   - Always upload:
     - `ci/dry-aged-deps.json`
     - `ci/npm-audit.json`
     - `scripts/traceability-report.md`
     - `ci/` (Jest and audit artifacts)

7. **Automated release (semantic-release)**

   This step runs **only** on `push` events to `main` for the Node `20.x` job, which forms the authoritative CI/CD path for trunk-based development:

   ```yaml
   if: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' && matrix['node-version'] == '20.x' && success() }}
   ```

   - Runs `npx semantic-release` with:
     - GitHub authentication via `GITHUB_TOKEN`
     - npm authentication via `NPM_TOKEN`
   - Configuration is in `.releaserc.json` and uses:
     - `@semantic-release/commit-analyzer`
     - `@semantic-release/release-notes-generator`
     - `@semantic-release/changelog` (writes to `CHANGELOG.md` but we treat GitHub Releases as the user-facing source of truth per ADR 007)
     - `@semantic-release/npm` (publishes to npm)
     - `@semantic-release/github` (creates GitHub Releases)

   Behavior:
   - On each successful push to `main`, semantic-release:
     - Analyzes commits since the last tag using **Conventional Commits** (see `docs/conventional-commits-guide.md`).
     - Decides whether the release is `major`, `minor`, `patch`, or **no release**.
     - If no relevant commits are found, it logs that no new release is needed and exits successfully.
     - If a release is warranted:
       - Publishes a new version to npm.
       - Creates or updates `CHANGELOG.md`.
       - Creates a Git tag and GitHub Release with generated notes.

   - Safety behavior:
     - If `NPM_TOKEN` is **not set**, the step logs a message and exits 0 with `new_release_published=false`.
     - If semantic-release fails due to invalid npm token (`EINVALIDNPMTOKEN`) or OTP requirement (`EOTP`), the step logs a warning and exits 0, skipping publish but not failing CI.
     - Any other semantic-release error fails the job.

8. **Post-deployment smoke test**
   - Runs only when semantic-release reports that a new release was published:

   ```yaml
   if: steps.semantic-release.outputs.new_release_published == 'true'
   ```

   - Executes:

   ```bash
   chmod +x scripts/smoke-test.sh
   ./scripts/smoke-test.sh "${{ steps.semantic-release.outputs.new_release_version }}"
   ```

   - `scripts/smoke-test.sh`:
     - For a published version: waits for the version to appear on npm, then
       - Creates a temp project.
       - Installs `eslint-plugin-traceability@<version>`.
       - Verifies the plugin loads and the installed version matches.
       - Runs a minimal ESLint config using the plugin to confirm it can be loaded.

### 2. `dependency-health`

Runs only on the nightly `schedule` event.

- Checks out code and installs dependencies.
- Runs `npm run audit:dev-high` to generate a JSON report of high-severity dev-only vulnerabilities.
- Does **not** publish or run semantic-release.

This job is intentionally isolated from the main `quality-and-deploy` path and has no effect on releases. For an overview of how this scheduled dependency health check fits into the broader security posture, maintainers should refer to `docs/security-overview.md` as the single consolidated reference.

## Continuous Deployment Behavior

- Every push to `main` triggers the `quality-and-deploy` job on Node 18.x and 20.x and is treated as the **single source of truth** for integration and deployment in our trunk-based model.
- `pull_request` runs targeting `main` use the same `quality-and-deploy` job but function purely as **early feedback** for:
  - Contributors working from forks.
  - Maintainers who explicitly choose to use a PR-based review flow.
  - These PR runs never invoke semantic-release and never publish.
- The full quality gate (`ci-verify:full`) must pass on both Node versions for a `push` to `main`.
- If, and only if, the Node 20.x job on `main` succeeds and `NPM_TOKEN` is available, semantic-release is invoked.
- semantic-release decides whether a new version is required based on commit messages:
  - `feat` → minor version bump
  - `fix` → patch bump
  - `feat!` or `BREAKING CHANGE:` footer → major bump
  - Other types (`docs`, `chore`, `refactor`, `test`, `ci`, etc.) do **not** trigger a release.
- When a release is published, the smoke test runs immediately in the same workflow execution.

There is no separate “publish only” workflow and no manual tagging step required to release. The pipeline from commit → quality gates → publish → smoke test is fully automated, and it is always driven by `push` events to the `main` trunk.

## Local Workflow and Hooks

To keep local development aligned with CI and our trunk-based model:

- Day-to-day development is expected to:
  - Commit directly to `main`.
  - Push directly to `main`, relying on the `push`-based CI runs as the authoritative integration checks.
- Pull requests are used:
  - When explicitly desired for code review.
  - When contributing from a fork (where direct push to `main` is not possible).
  - In these cases, PR CI is for feedback only; final integration still happens on `main`.

Local hooks:

- **Pre-commit** (`.husky/pre-commit`):
  - Runs `npx lint-staged`, which executes Prettier and ESLint with `--fix` on staged files in `src/` and `tests/` so that formatting and basic linting are enforced before every commit.

- **Pre-push** (`.husky/pre-push`):
  - Runs `npm run ci-verify:full`.
  - This mirrors the CI quality gate so that most issues are caught before code reaches GitHub.
  - Secret scanning (`npm run security:secrets`) currently runs only in CI on the Node 20.x matrix entry and is not part of the pre-push hook, but it uses the same configuration so results stay consistent between local and CI.

Husky is wired up via the `postinstall` npm script (`"postinstall": "husky"`) instead of the deprecated `husky install` `prepare` script.

Local verification commands:

- `npm run ci-verify:full`
  - Runs the same broad, end-to-end quality gate used in CI (build, type-check, linting, duplication checks, full Jest test suite with coverage, audits, and formatting checks).
  - This is the closest approximation to the CI pipeline and is what the pre-push hook enforces before pushing to the `main` trunk.

- `npm run ci-verify:fast`
  - Runs a **narrower, targeted subset** of checks focused on the rule and maintenance test suites.
  - Uses Jest with:

    ```bash
    jest --testPathPatterns 'tests/(rules|maintenance)'
    ```

    to execute only tests whose paths match `tests/rules` or `tests/maintenance`.

  - Intended as an **optional, faster pre-flight** command that contributors run manually to iterate quickly on rule changes and core maintenance behavior.
  - Does **not** replace `ci-verify:full` and is **not** used by hooks or CI; it exists purely for faster local feedback.

Developers should rely on:

- `npm run ci-verify:full` for a full CI-equivalent check (and what will run on push via Husky before integrating to `main`).
- `npm run ci-verify` or `npm run ci-verify:fast` for quicker, targeted local feedback loops when working on rules or maintenance logic.

## How Semantic Versioning Is Determined

semantic-release uses Conventional Commits (see `docs/conventional-commits-guide.md`) to infer version changes:

- `feat:` → **minor** version bump.
- `fix:` → **patch** version bump.
- `feat!` or `fix!` (or any type with `!`) or a `BREAKING CHANGE:` footer → **major** version bump.
- Other types (`docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`) → no release.

Because releases are determined solely from commit history on `main`, it is important that all commits merged or pushed to `main` follow the documented Conventional Commits standard.

## Supported Runtime and Tooling

The pipeline runs against the following Node.js versions:

- Node `18.x`
- Node `20.x`

The package itself declares:

- `engines.node: ">=18.18.0"`
- `peerDependencies.eslint: "^9.0.0"`

User-facing docs are aligned with these constraints:

- README “Prerequisites” section.
- `user-docs/api-reference.md` "Supported runtime" line.

## When Things Go Wrong

- If **quality checks fail** (build, tests, lint, type-check, duplication, format, or audits), the workflow fails before any release attempt.
- If semantic-release encounters a non-token, non-OTP error, the job fails and no release is published.
- If `NPM_TOKEN` is missing or invalid, or if npm requires an OTP, the workflow succeeds but skips publishing; this is treated as a configuration issue rather than a code failure.
- If the post-deployment smoke test fails, the job fails even though a package may have been published; this indicates an urgent regression in the published artifact.

In all of these cases, the failing run is visible in the `CI/CD Pipeline` workflow on GitHub. Since `main` is the single integration branch in our trunk-based model, maintainers should fix the underlying issue before pushing further changes to `main`.