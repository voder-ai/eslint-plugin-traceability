# ADR: Pre-push vs CI parity for quality checks

Status: Accepted
Date: 2025-11-20

## Context

The project has a comprehensive CI/CD pipeline (`.github/workflows/ci-cd.yml`) that runs on every push to `main` and on pull requests:

- `npm run build`
- `npm run type-check`
- `npm run lint`
- `npm run format:check`
- `npm run duplication`
- `npm run check:traceability`
- `npm test -- --coverage`
- `npm run audit:ci`
- `npm run safety:deps`
- `npm audit --production --audit-level=high`
- `npm run audit:dev-high`
- plus post-build checks such as `npm run lint-plugin-check` and a smoke test of the published package.

Locally, we also need pre-push safeguards to keep `main` healthy without making every push prohibitively slow. The existing `ci-verify` and `ci-verify:fast` scripts are:

```jsonc
// package.json
"ci-verify": "npm run type-check && npm run lint && npm run format:check && npm run duplication && npm run check:traceability && npm test && npm run audit:ci && npm run safety:deps",
"ci-verify:fast": "npm run type-check && npm run check:traceability && npm run duplication && jest --ci --bail --passWithNoTests --testPathPatterns 'tests/(unit|fast)'"
```

Running the full `ci-verify` script on every `git push` would:

- Significantly slow down local feedback loops (full test suite + audits + format check).
- Duplicate work already done by CI, especially for long-running steps.

At the same time, we want a **documented** and **constrained** divergence between local pre-push checks and CI so that developers know exactly what guarantees a passing pre-push hook provides.

## Decision

- The `.husky/pre-push` hook will run **`npm run ci-verify:fast`**, not the full CI-equivalent `ci-verify` script.
- We formally accept that pre-push checks are a **fast, partial gate** focused on catching the most common and inexpensive failures:
  - Type errors
  - Traceability/annotation issues
  - Excessive duplication
  - Failures in the fastest unit/"fast" test suites
- The **authoritative, complete gate** for `main` remains the CI/CD workflow on GitHub Actions.

Concretely, `.husky/pre-push` runs:

```sh
npm run ci-verify:fast && echo "Pre-push quick checks completed"
```

and **does not** run:

- `npm run build`
- `npm run lint`
- `npm run format:check`
- `npm test -- --coverage` (full suite)
- `npm run audit:ci`
- `npm run safety:deps`
- `npm audit --production --audit-level=high`
- `npm run audit:dev-high`
- `npm run lint-plugin-check`

These additional checks run only in CI.

## Rationale

- **Fast feedback for developers**: Keeping pre-push under ~1–2 minutes is important for day-to-day productivity, especially when making frequent, small commits directly on `main`.
- **Diminishing returns locally**: Expensive checks like full coverage runs and audits provide marginal additional signal locally compared to what CI already enforces on every push.
- **Clear contract**: By documenting this decision and the exact commands involved, contributors understand:
  - What a passing pre-push hook guarantees.
  - Which failures might still surface only in CI.
- **Alignment with trunk-based development**: Developers still gain strong local guarantees (type safety, traceability, duplication constraints, and fast tests) while CI remains the source of truth for release readiness.

## Constraints and guardrails

To prevent the pre-push gate from drifting too far from CI, we adopt the following constraints:

1. **Minimum checks in `ci-verify:fast`**
   - Must always include at least:
     - `npm run type-check`
     - `npm run check:traceability`
     - `npm run duplication`
     - A Jest invocation that covers our "fast" suites.
   - Future edits to `ci-verify:fast` must preserve this minimum set or explicitly update this ADR.

2. **Relationship to `ci-verify` and CI**
   - `ci-verify` should remain the closest **script-level mirror** of the CI quality gates that is practical to run locally when desired.
   - CI may include additional steps (e.g., smoke tests, `lint-plugin-check`) beyond `ci-verify`; those remain CI-only.

3. **Failure patterns and escalation**
   - If CI frequently fails on checks **not** covered by `ci-verify:fast` (e.g., lint, full tests, audits), maintainers should:
     - Revisit this ADR.
     - Either extend `ci-verify:fast` or steer contributors toward running `npm run ci-verify` before risky pushes.

4. **Documentation linkage**
   - `.husky/pre-push` and contributor docs must reference this ADR so maintainers and contributors can discover and understand the policy.

## Rollback / migration plan

If we decide that pre-push should more closely mirror CI (for example, due to repeated CI-only failures):

1. **Option A – Promote `ci-verify` to pre-push**
   - Change `.husky/pre-push` to run `npm run ci-verify` instead of `ci-verify:fast`.
   - Update this ADR to reflect the new behavior (or supersede it with a new ADR).
   - Communicate the change in contributor docs, noting the increased pre-push duration.

2. **Option B – Expand `ci-verify:fast`**
   - Incrementally add additional checks to `ci-verify:fast` (e.g., `npm run lint` or a subset of integration tests) based on observed CI failures.
   - Keep an eye on runtime; if it becomes too slow, fall back to Option A or introduce a separate `ci-verify:full` script for on-demand local use.

3. **Option C – Disable pre-push hook for specific workflows**
   - In rare cases (e.g., automated tooling that uses `git push`), document how to temporarily bypass the pre-push hook (standard Husky guidance), while keeping it enabled for interactive developer usage.

Any significant change to pre-push behavior **must** be accompanied by an ADR update or a new ADR that supersedes this one.

Created autonomously by voder.ai
