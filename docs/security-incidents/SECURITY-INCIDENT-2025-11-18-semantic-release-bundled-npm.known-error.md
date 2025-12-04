# Security Incident Report: semantic-release bundled npm/glob/brace-expansion

**Date:** 2025-11-18

**Dependency:** @semantic-release/npm@10.0.6 (bundled npm@9.5.0 with glob and brace-expansion)

**Vulnerability ID:** GHSA-5j98-mcp5-4vw2 (glob CLI), GHSA-v6h2-p8h4-qcjw (brace-expansion ReDoS)

**Severity:** High (glob via npm), Low (brace-expansion)

**Description:**

The `@semantic-release/npm@10.0.6` dev dependency bundles `npm@9.5.0`, which in turn includes vulnerable versions of `glob` and `brace-expansion`:

- `glob` (10.2.010.4.5) is affected by command injection when the glob CLI is invoked with the `-c/--cmd` flag (`GHSA-5j98-mcp5-4vw2`).
- `brace-expansion` (1.0.01.1.11 and 2.0.02.0.1) is affected by a Regular Expression Denial of Service (ReDoS) issue (`GHSA-v6h2-p8h4-qcjw`).

These vulnerable packages are *only* present inside the npm binary bundled within `@semantic-release/npm`. They are **not** part of the production dependency tree used by the published `eslint-plugin-traceability` package. The handling of this incident, and the distinction between dev-only risks and user-facing guarantees, is governed by the canonical security policy in the root-level `SECURITY.md`. This document provides incident-specific detail and links back to that policy rather than redefining user-facing guarantees.

**Remediation:**

- **Status:** Known error with compensating controls (dev-only tooling)
- **Fixed Version:** Pending

As of 2025-12-03:

- `npm run deps:maturity -- --format=json` reports no safe, dry-aged upgrade candidates for `@semantic-release/npm` within the current semantic-release v21.x toolchain used by this project.
- Upgrading to the latest `semantic-release@25.x` and `@semantic-release/npm@13.1.2` would require a coordinated major toolchain migration and may still embed a bundled `npm` implementation; the security characteristics of that new bundle have not yet been fully evaluated.

Given these constraints, the project treats this as a **known error** in dev-only tooling and applies compensating controls instead of attempting a premature upgrade.

**References:**

- GitHub Security Advisory (glob CLI): https://github.com/advisories/GHSA-5j98-mcp5-4vw2
- GitHub Security Advisory (brace-expansion): https://github.com/advisories/GHSA-v6h2-p8h4-qcjw
- Dev dependency audit snapshot: `docs/security-incidents/dev-deps-high.json`
- Prior incident notes:
  - `docs/security-incidents/2025-11-17-glob-cli-incident.md`
  - `docs/security-incidents/2025-11-18-brace-expansion-redos.md`
  - `docs/security-incidents/2025-11-18-bundled-dev-deps-accepted-risk.md`

**Timeline:**

- **2025-11-17**: High-severity `glob` and `npm` dev-dependency issues detected via `npm audit` and captured in `dev-deps-high.json`.
- **2025-11-18**: Initial incident markdown files created to document residual risk in bundled dev dependencies within `@semantic-release/npm`.
- **2025-11-23**: Confirmed that no mature, safe upgrade path was available via `dry-aged-deps`; residual risk kept under review.
- **2025-12-03**: Incident converted into a formal `SECURITY-INCIDENT-*.known-error.md` record with explicit compensating controls and linkage to CI/CD configuration.

**Impact Analysis:**

- The vulnerable `glob` and `brace-expansion` instances exist exclusively inside the npm CLI bundled with `@semantic-release/npm` and are only used during automated release publishing from CI.
- There is **no** impact on:
  - The published eslint plugin runtime (`eslint-plugin-traceability`).
  - End-user projects that consume this plugin.
  - Production dependency trees (`npm audit --production` reports 0 vulnerabilities).
- Exploitability in this projects context is low because:
  - CI workflows do not invoke the `glob` CLI with `-c/--cmd` and do not expose untrusted patterns to the bundled npm CLI.
  - The semantic-release job runs in a controlled CI environment with a tightly scoped `NPM_TOKEN` and no untrusted user input.
  - The primary risk is limited to the release automation environment, not to downstream users.

**Compensating Controls:**

1. **Security Policy Alignment and Environment Isolation**
   - The root-level `SECURITY.md` defines the canonical security policy, including the project’s guarantees to end users and how dev-only tooling risks are treated separately from runtime dependencies. This incident is consistent with that policy: vulnerabilities confined to CI release automation do not alter guarantees about the security of the published `eslint-plugin-traceability` package or its production dependency tree.
   - `SECURITY.md` explicitly differentiates between:
     - Security guarantees for *published artifacts* (what users install and run).
     - Managed, documented risk in *development and release tooling* (such as semantic-release and its bundled npm).
   - In line with `SECURITY.md`, the vulnerable tooling is only executed in the `quality-and-deploy` job of `.github/workflows/ci-cd.yml` on pushes to the `main` branch.
   - Job-level permissions are scoped to the minimum required for releases (`contents`, `issues`, `pull-requests`, `id-token`). No additional permissions are granted.
   - The job runs on GitHub-hosted runners and does not have access to any internal infrastructure, preserving the user-facing guarantees documented in `SECURITY.md` by ensuring that any exploit would be constrained to an ephemeral CI environment and would not propagate to published packages.

2. **Dependency and Audit Controls**
   - `npm audit --omit=dev --audit-level=high` is enforced as part of `npm run ci-verify:full` to ensure production dependencies are free of high-severity issues.
   - `npm run audit:dev-high` (via `scripts/generate-dev-deps-audit.js`) continuously records high-severity dev-only vulnerabilities into `ci/npm-audit.json` for review.
   - `npm run safety:deps` (via `scripts/ci-safety-deps.js`) runs `dry-aged-deps` to validate that no safe, dry-aged upgrades are currently available; this output is published as a CI artifact.
   - `package.json` uses `overrides` to enforce safer versions of many transitive dependencies (e.g., `glob`, `tar`, `http-cache-semantics`, `ip`, `semver`, `socks`) wherever technically possible. These overrides do **not** affect the npm binary bundled within `@semantic-release/npm`, but they reduce the surrounding attack surface.

3. **Usage Constraints**
   - Project scripts and CI workflows never invoke `glob` with the `-c/--cmd` options, eliminating the known command-injection vector in normal operation.
   - The release job does not accept untrusted user input that could influence file patterns or environment variables passed to the bundled npm CLI.

4. **Monitoring and Review**
   - The nightly `dependency-health` job runs `npm run audit:dev-high` to keep dev-dependency vulnerabilities under continuous review.
   - `docs/decisions/adr-accept-dev-dep-risk-glob.md` documents this decision and requires weekly reassessment using the CI audit artifacts.
   - Any change in `dev-deps-high.json` that indicates the availability of a patched, dry-aged-safe version of `@semantic-release/npm` or its bundled npm will trigger reevaluation and, if feasible, an upgrade.

**Testing:**

- `npm run ci-verify:full` (used in CI and pre-push) validates:
  - Build and type-check succeed.
  - Linting, duplication, and traceability checks pass.
  - Jest test suite (with coverage) passes.
  - `npm audit --omit=dev --audit-level=high` passes (production dependencies clean).
  - `npm run audit:dev-high` and `npm run safety:deps` complete and publish audit artifacts.
- The semantic-release publishing step is followed, when a new version is published, by `scripts/smoke-test.sh`, which installs the freshly published package in an isolated temp project and validates that the plugin loads correctly. This ensures that any future upgrade of the release toolchain preserves expected behavior.

**Planned Follow-ups:**

- Periodically re-run `npm run deps:maturity -- --format=json --check` when updating dev dependencies to identify a safe, vulnerability-free version of `@semantic-release/npm` or an alternative release mechanism.
- When a safe, dry-aged-compatible upgrade path is available, migrate to a newer semantic-release/npm toolchain and retire this known error record by adding a **Resolved** section documenting the change.

Created autonomously by voder.ai

## Relationship to User-Facing Guarantees

This known error is limited to dev-only release tooling and does not change the security guarantees described in the README, user documentation, or the canonical security policy in `SECURITY.md`. The vulnerable `glob` and `brace-expansion` instances are only executed inside GitHub Actions during semantic-release; they are never run when users install or run `eslint-plugin-traceability` or `traceability-maint`.

The combination of `npm audit --omit=dev --audit-level=high` and `dry-aged-deps` checks is what allows the project to assert that published versions do not ship with known high-severity vulnerabilities in their **production** dependency tree. Because the affected code is confined to CI release automation and excluded from the published runtime dependencies, the security posture promised to end users in `SECURITY.md` remains intact.