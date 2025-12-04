# Security Policy

This document describes how security is handled for `eslint-plugin-traceability`, including how to report vulnerabilities, what guarantees apply to production dependencies, and how we manage known risks in our dev-only release tooling.

> This file is **user-facing** documentation. Internal implementation details and deeper discussion live in the project’s internal documentation and decision records.

For a consolidated implementation overview of security tooling and checks (maintainer and automated-assessor focused), see `docs/security-overview.md`.

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

For more detail on how these checks are wired into CI, maintainers can refer to the project’s internal dependency health and security documentation; this level of detail is not required for normal end users of the plugin.

Maintainer-focused CI/CD security summary: release workflows enforce several security checks end-to-end. For production dependencies, `npm audit --omit=dev --audit-level=high` is **release-blocking** and must report no high-severity issues before publishing proceeds. For broader dependency health, `npm run safety:deps` (dry-aged-deps) and `npm run audit:dev-high` (dev-only `npm audit` with stricter thresholds) are **advisory**: they generate machine-readable reports to guide upgrades and risk review but do not, by themselves, block a release. Secret scanning is performed with `npm run security:secrets` (secretlint); this is treated as **release-blocking** in CI/CD so that accidental credential or secret leaks are caught before artifacts are published.

## Dependency Maturity and `dry-aged-deps`

In addition to `npm audit`, we use [`dry-aged-deps`](https://github.com/voder-ai/dry-aged-deps) to guide dependency upgrades for both production and development dependencies.

Current high-level policy:

- **Minimum age:** new versions are generally required to be **at least 7 days old** before adoption.
- **No known vulnerabilities:** versions with _any_ known vulnerability (even low severity) are not considered "safe" upgrade candidates.

`dry-aged-deps` is advisory only:

- It does **not** modify `package.json` or install anything automatically.
- It produces machine-readable reports that are stored as CI artifacts and referenced in internal security/incident documentation.

When `dry-aged-deps` reports that there are **no safe upgrades available** under these thresholds, we may temporarily accept residual risk in dev-only tooling while keeping production dependencies clean and fully audited.

For maintainers, the full process is described in the project’s internal dependency health and security guidelines; end users typically do not need to consult those documents.

## Dev-Only Release Tooling Risk (semantic-release / npm / glob / brace-expansion)

This section documents a **historical** dev-only risk in an older semantic-release/npm toolchain that has since been fully resolved by upgrading the release toolchain to a vulnerability-free stack.

### What was affected?

During the incident period, the **older** dev dependency stack had the following characteristics:

- The dev dependency `@semantic-release/npm@10.0.6` bundled `npm@9.5.0`, which in turn included vulnerable versions of `glob` and `brace-expansion`.
- The relevant advisories were:
  - `glob` CLI command injection: [GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2)
  - `brace-expansion` ReDoS: [GHSA-v6h2-p8h4-qcjw](https://github.com/advisories/GHSA-v6h2-p8h4-qcjw)
- These vulnerable packages existed **only inside the npm binary bundled within `@semantic-release/npm`** and were used solely during automated publishing from CI.

The current release toolchain no longer relies on this vulnerable bundled npm stack, and these specific advisories are no longer present in our dev dependencies.

### What is _not_ affected?

Throughout the incident period, and continuing after the upgrade:

- The published `eslint-plugin-traceability` package has **no runtime dependencies** on any bundled npm or its `glob`/`brace-expansion` copies.
- End-user projects that install and run `eslint-plugin-traceability` or `traceability-maint` **do not execute** this bundled tooling.
- `npm audit --omit=dev --audit-level=high` has continued to report **0 high‑severity vulnerabilities** for the production dependency tree at release time.

These guarantees remain in effect with the updated, vulnerability-free toolchain.

### Historical Risk Acceptance

While the older `@semantic-release/npm@10.0.6` stack was in use and no safe, `dry-aged-deps`–approved upgrade path existed, this dev-only risk was **explicitly accepted** as a known error under the `dry-aged-deps` policy. It is **no longer** an active known error following the toolchain upgrade.

The full historical record and resolution details are documented in:

- A detailed historical incident report in this repository’s internal security incident documentation (maintainer-facing only)

### Compensating Controls

While the older toolchain was in place, we applied several compensating controls to tightly contain the dev-only risk. The same general isolation and audit practices continue to apply to the updated, vulnerability-free release toolchain:

1. **Environment Isolation**
   - The vulnerable tooling was used **only** in the GitHub Actions CI workflow (`.github/workflows/ci-cd.yml`).
   - It ran in a single, controlled job that executed on pushes to the `main` branch, not for pull requests.
   - The job ran on GitHub-hosted runners and did not have access to internal infrastructure.

2. **Least-Privilege Permissions for Release**
   - Workflow-level permissions defaulted to `contents: read`.
   - Elevated permissions (`contents: write`, `issues: write`, `pull-requests: write`, `id-token: write`) were scoped to the release job/step that ran semantic-release and were not used for general CI tasks.

3. **Strict Input Handling**
   - The CI configuration and project scripts **never invoked the `glob` CLI** with the dangerous `-c/--cmd` flags.
   - The semantic-release/npm toolchain did **not** receive untrusted user input for glob patterns or environment variables.
   - Release jobs operated only on the repository contents of this project plus standard CI-provided environment variables.

4. **Audit and Monitoring**
   - Dev-only vulnerabilities were tracked via `npm run audit:dev-high`, which wrote a machine-readable report to `ci/npm-audit.json` for each CI run.
   - `dry-aged-deps` reports (`ci/dry-aged-deps.json`) were stored as CI artifacts to document when no safe upgrade path existed under the configured thresholds.
   - A nightly `dependency-health` workflow re-ran dev-dependency audits to keep this type of risk under continuous review.

5. **Guarded semantic-release Invocation (CI-Only)**
   - semantic-release was invoked **only from CI**, and guarded to ensure it ran under the intended safe context (GitHub Actions, push to `main`, CI environment).
   - Local developers were not expected to run semantic-release directly; publishing was handled automatically by CI after all quality and security checks passed.

With the upgraded release toolchain, these controls continue to constrain dev-only tooling and help ensure that vulnerabilities in CI infrastructure do not impact the security properties of the published package.

---

## Attribution

Created autonomously by [voder.ai](https://voder.ai).