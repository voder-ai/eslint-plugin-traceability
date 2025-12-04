# Security Policy

This document describes how security is handled for `eslint-plugin-traceability`, including how to report vulnerabilities, what guarantees apply to production dependencies, and how we manage known risks in our dev-only release tooling.

> This file is **user-facing** documentation. Internal implementation details and deeper discussion live in the project’s internal documentation and decision records.

## Reporting a Vulnerability

If you believe you have found a security vulnerability in this project:

1. **Do not open a public GitHub issue.**
2. Instead, open a private security advisory via the GitHub Security tab for this repository:
   - Navigate to: `Security` → `Advisories` → `Report a vulnerability`.
3. Provide as much detail as you can (steps to reproduce, impact, affected environments). A maintainer will review and coordinate a fix and disclosure timeline with you.

If you cannot use GitHub Security Advisories, you may alternatively open a **minimal** issue that does not disclose details and ask for a private contact channel.

## Supported Versions

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and publishing.

- The **latest published version** on npm and GitHub Releases is considered supported.
- Older versions are not actively maintained; security fixes are applied to the current release line and then published automatically.
- To benefit from security fixes, users should stay reasonably up-to-date with the latest versions of `eslint-plugin-traceability`.

Authoritative release information is available on GitHub Releases:

- <https://github.com/voder-ai/eslint-plugin-traceability/releases>

## Production Dependency Guarantees

The `eslint-plugin-traceability` package has **no runtime dependencies**; it ships only its compiled plugin and CLI code plus documentation. Nevertheless, we treat any future production dependencies with care and enforce the following guarantees at release time:

- Before a release is published, CI runs:
  - `npm audit --omit=dev --audit-level=high`
- A release is allowed to proceed only when:
  - There are **no known high-severity vulnerabilities** reported in the **production (runtime) dependency tree**.

In other words:

- The published npm package is intended to ship **without known high‑severity vulnerabilities in its production dependencies** at the moment it is released.
- Dev-only tooling and CI infrastructure are kept separate from what you install via `npm install eslint-plugin-traceability`.

For more detail on how these checks are wired into CI, see the internal dependency health and security documentation for this project.

## Dependency Maturity and `dry-aged-deps`

In addition to `npm audit`, we use [`dry-aged-deps`](https://github.com/voder-ai/dry-aged-deps) to guide dependency upgrades for both production and development dependencies.

Current high-level policy:

- **Minimum age:** new versions are generally required to be **at least 7 days old** before adoption.
- **No known vulnerabilities:** versions with *any* known vulnerability (even low severity) are not considered "safe" upgrade candidates.

`dry-aged-deps` is advisory only:

- It does **not** modify `package.json` or install anything automatically.
- It produces machine-readable reports that are stored as CI artifacts and referenced in internal security/incident documentation.

When `dry-aged-deps` reports that there are **no safe upgrades available** under these thresholds, we may temporarily accept residual risk in dev-only tooling while keeping production dependencies clean and fully audited.

For maintainers, the full process is described in the project’s internal dependency health and security guidelines.

## Dev-Only Release Tooling Risk (semantic-release / npm / glob / brace-expansion)

There is a known, documented risk in the **dev-only release toolchain** used by this project. It does **not** affect the runtime behavior of the published ESLint plugin or CLI, but it is relevant to how releases are built in CI.

### What is affected?

- The dev dependency `@semantic-release/npm@10.0.6` bundles `npm@9.5.0`, which in turn includes vulnerable versions of `glob` and `brace-expansion`.
- The relevant advisories are:
  - `glob` CLI command injection: [GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2)
  - `brace-expansion` ReDoS: [GHSA-v6h2-p8h4-qcjw](https://github.com/advisories/GHSA-v6h2-p8h4-qcjw)
- These vulnerable packages exist **only inside the npm binary bundled within `@semantic-release/npm`** and are used solely during automated publishing from CI.

### What is *not* affected?

- The published `eslint-plugin-traceability` package has **no runtime dependencies** on this bundled npm or its `glob`/`brace-expansion` copies.
- End-user projects that install and run `eslint-plugin-traceability` or `traceability-maint` **do not execute** this bundled tooling.
- `npm audit --omit=dev --audit-level=high` continues to report **0 high‑severity vulnerabilities** for the production dependency tree at release time.

### Why is this risk currently accepted?

Under our `dry-aged-deps` policy (7‑day minimum age, no known vulnerabilities):

- There is currently **no recommended, dry‑aged‑safe upgrade path** for the semantic-release/npm toolchain that would fully eliminate these bundled vulnerabilities.
- We therefore treat this as a **known error in dev-only tooling** rather than a production risk.

This acceptance is documented in detail in the project’s internal security incident records and architectural decision records.

### Compensating Controls

To keep this dev-only risk tightly contained, we apply several compensating controls:

1. **Environment Isolation**
   - The vulnerable tooling is used **only** in the GitHub Actions CI workflow (`.github/workflows/ci-cd.yml`).
   - It runs in a single, controlled job that executes on pushes to the `main` branch, not for pull requests.
   - The job runs on GitHub-hosted runners and does not have access to internal infrastructure.

2. **Least-Privilege Permissions for Release**
   - Workflow-level permissions default to `contents: read`.
   - Elevated permissions (`contents: write`, `issues: write`, `pull-requests: write`, `id-token: write`) are scoped to the release job/step that runs semantic-release and are not used for general CI tasks.

3. **Strict Input Handling**
   - The CI configuration and project scripts **never invoke the `glob` CLI** with the dangerous `-c/--cmd` flags.
   - The semantic-release/npm toolchain does **not** receive untrusted user input for glob patterns or environment variables.
   - Release jobs operate only on the repository contents of this project plus standard CI-provided environment variables.

4. **Audit and Monitoring**
   - Dev-only vulnerabilities are tracked via `npm run audit:dev-high`, which writes a machine-readable report to `ci/npm-audit.json` for each CI run.
   - `dry-aged-deps` reports (`ci/dry-aged-deps.json`) are stored as CI artifacts to document when no safe upgrade path exists under the configured thresholds.
   - A nightly `dependency-health` workflow re-runs dev-dependency audits to keep this risk under continuous review.

5. **Guarded semantic-release Invocation (CI-Only)**
   - semantic-release is invoked **only from CI**, and guarded to ensure it runs under the intended safe context (GitHub Actions, push to `main`, CI environment).
   - Local developers are not expected to run semantic-release directly; publishing is handled automatically by CI after all quality and security checks pass.

### Upgrade Plan

We intend to migrate away from the affected semantic-release/npm toolchain as soon as a safe, dry‑aged‑deps–approved upgrade path is available:

1. Continue monitoring `dry-aged-deps` output for `@semantic-release/npm`, `semantic-release`, and related packages.
2. When a newer, vulnerability-free version remains stable for at least 7 days and passes our audit checks, update the dev dependencies accordingly.
3. After migration, convert the existing known-error record into a resolved incident that documents the fix and new baseline.

Until then, the risk remains **limited to CI release automation** and does not change the guarantees we provide for production dependencies or end-user environments.

---

## Attribution

Created autonomously by [voder.ai](https://voder.ai).