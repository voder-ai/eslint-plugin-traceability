# ADR-008: Standardize npm audit flags in CI and local verification

## Status

Accepted

## Context

Newer versions of `npm` emit a configuration warning when the `--production` flag is used with `npm audit`:

> npm WARN config production Use `--omit=dev` instead.

Our CI/CD pipeline and local `ci-verify:full` script were invoking:

- `npm audit --production --audit-level=high` in the GitHub Actions workflow
- `npm audit --production --audit-level=high` inside the `ci-verify:full` npm script

This produced noisy warnings during both local verification and CI runs, even though the intent was simply to exclude development dependencies from the production-focused audit.

## Decision

We will standardize on the modern, npm-recommended flag set for production-focused audits:

- Use `npm audit --omit=dev --audit-level=high` instead of `npm audit --production --audit-level=high`.

Concretely:

1. **GitHub Actions CI/CD workflow**
   - In `.github/workflows/ci-cd.yml`, the "Run production security audit" step now runs:
     - `npm audit --omit=dev --audit-level=high`

2. **Local CI verification script**
   - In `package.json`, the `ci-verify:full` script now runs:
     - `npm audit --omit=dev --audit-level=high`

3. **CI audit helper script**
   - `scripts/ci-audit.js` continues to run `npm audit --json` to capture a complete machine-readable audit report for CI artifacts. The JSDoc description was updated to avoid hard-coding specific flag combinations in documentation, keeping behavior and documentation loosely coupled.

## Rationale

- **Align with npm guidance**: Using `--omit=dev` is the officially recommended modern way to exclude development dependencies from production operations. This avoids the recurring `npm WARN config production` warning.
- **Consistency between local and CI behavior**: Both the GitHub Actions workflow and the local `ci-verify:full` script now use the same `npm audit` flags for production-focused audits, ensuring developers see the same behavior locally that CI enforces.
- **Separation of concerns**:
  - Production-focused audits use `--omit=dev --audit-level=high` to focus on runtime dependencies and fail the pipeline if high-severity issues are detected.
  - Dev-dependency audits are handled separately via `npm run audit:dev-high` (which is already wired into both `ci-verify:full` and the CI workflow) and through our `dry-aged-deps`-backed safety checks.
- **Noise reduction**: Removing the `--production` flag eliminates unnecessary warnings from CI logs, making real problems easier to spot.

## Consequences

- **Positive**:
  - CI logs are cleaner, with no spurious `npm WARN config production` messages.
  - The project follows current npm best practices for production audits.
  - Local and CI verification remain in sync, preventing "works locally but fails in CI" discrepancies for security audits.

- **Neutral/Expected**:
  - The effective set of audited packages for the production-focused audit remains equivalent to what we intended with `--production`: runtime (non-dev) dependencies only.
  - Our separate dev-dependency audit and `dry-aged-deps` processes remain unchanged.

- **Future work**:
  - If npm introduces further changes to `npm audit` flags or behavior, we will revisit this ADR and update the workflow and scripts accordingly.
