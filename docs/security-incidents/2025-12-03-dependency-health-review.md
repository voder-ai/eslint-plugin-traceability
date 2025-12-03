# Dependency Health Review - 2025-12-03

**Date:** 2025-12-03

This document records the dependency health status of the project as of 2025-12-03, based on `dry-aged-deps` and existing security incident records.

## Tools and Inputs

- `npm run deps:maturity -- --format=json --check`
- `npm audit --omit=dev --audit-level=high` (via `ci-verify:full`)
- Dev-dependency audit snapshot: `docs/security-incidents/dev-deps-high.json`
- Known error record: `docs/security-incidents/SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md`

## dry-aged-deps Summary

Running `npm run deps:maturity -- --format=json --check` produced the following high-level summary:

```json
{
  "packages": [],
  "summary": {
    "totalOutdated": 0,
    "safeUpdates": 0,
    "filteredByAge": 0,
    "filteredBySecurity": 0,
    "thresholds": {
      "prod": { "minAge": 7, "minSeverity": "none" },
      "dev": { "minAge": 7, "minSeverity": "none" }
    }
  }
}
```

Interpretation:

- `packages: []` indicates that `dry-aged-deps` did not identify any direct or transitive dependencies with dry-aged-safe upgrade candidates under the current thresholds.
- `totalOutdated: 0` and `safeUpdates: 0` confirm that, as of this run, there are no library updates that meet the project’s maturity and security criteria.

## Production Dependency Health

- `npm audit --omit=dev --audit-level=high` currently reports **0 high-severity (or higher) vulnerabilities** for production dependencies.
- This check is enforced as part of `npm run ci-verify:full` and runs on every push to `main` in the CI/CD pipeline.

## Development Dependency Health

- High-severity dev-only vulnerabilities are tracked in `docs/security-incidents/dev-deps-high.json` and surfaced via `npm run audit:dev-high` and `npm run safety:deps`.
- The remaining known high-severity items are limited to the bundled `npm` and its transitive `glob`/`brace-expansion` dependencies inside `@semantic-release/npm`, as documented in `SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md` and the ADR `adr-accept-dev-dep-risk-glob.md`.
- `dry-aged-deps` currently reports no safe, policy-compliant upgrade path for this toolchain; specifically, there are no candidates that both:
  - Satisfy the configured minimum age thresholds for prod and dev dependencies, and
  - Resolve the bundled `glob`/`brace-expansion` advisories without introducing new issues.

## Conclusion

- **No dependency updates were applied** as a result of this review, because `dry-aged-deps` reported `totalOutdated: 0` and `safeUpdates: 0`.
- Production dependencies remain free of high-severity vulnerabilities according to `npm audit --omit=dev --audit-level=high`.
- The previously documented dev-only vulnerability in the semantic-release/npm toolchain remains a **known error** with compensating controls and is still considered an accepted residual risk.

This document should be updated or superseded on subsequent dependency health reviews when `dry-aged-deps` identifies new safe upgrade candidates or when the known error for the semantic-release/npm toolchain is resolved.