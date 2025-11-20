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

Locally, we previously used a fast subset of these checks (`ci-verify:fast`) as a pre-push safeguard to keep `main` healthy without making every push prohibitively slow. The existing `ci-verify` and `ci-verify:fast` scripts are:

```jsonc
// package.json
"ci-verify": "npm run type-check && npm run lint && npm run format:check && npm run duplication && npm run check:traceability && npm test && npm run audit:ci && npm run safety:deps",
"ci-verify:fast": "npm run type-check && npm run check:traceability && npm run duplication && jest --ci --bail --passWithNoTests --testPathPatterns 'tests/(unit|fast)'"
```

Running only the fast subset on every `git push` reduced local feedback times, but it also allowed a class of failures (lint, formatting, full test suite, audits) to be detected **only** in CI, leading to avoidable red pipelines and additional iteration overhead.

We now want **full parity** between local pre-push checks and the core CI quality checks, so that a successful push locally very strongly predicts CI success. A separate, optional fast-check path remains available for developers who want a quicker pre-flight before doing heavier work.

## Decision

- The `.husky/pre-push` hook will run **`npm run ci-verify:full`**, a script that mirrors the **full CI-equivalent quality gate** (build, type-check, lint, formatting, duplication, traceability, full tests, and audits).
- We formally accept that pre-push checks are now a **comprehensive gate** focused on matching the CI quality bar, even at the cost of longer local push times.
- The previous fast-only `ci-verify:fast` remains available as an **optional, manual command** but is no longer wired into the pre-push hook.
- The **authoritative, complete gate** for `main` remains the CI/CD workflow on GitHub Actions, which may include additional CI-only post-build/post-publish steps.

Concretely, `.husky/pre-push` runs:

```sh
npm run ci-verify:full && echo "Pre-push full CI-equivalent checks completed"
```

and **does not** omit any of the core CI quality checks represented in `ci-verify:full`. The only remaining divergence is that certain CI-only steps (for example, publish-time smoke tests and release automation such as `semantic-release`) continue to run **only in CI**.

## Rationale

- **Reduce CI-only failures**: The earlier approach (pre-push running only `ci-verify:fast`) led to recurring CI failures for checks not covered locally (lint, formatting, full tests, audits). Promoting a full CI-equivalent sequence to pre-push significantly lowers this risk.
- **Stronger local guarantees**: Developers can treat a successful push as a strong indicator that CI will also pass, improving confidence in trunk-based development and reducing context-switching caused by failed pipelines.
- **Explicit trade-off**: We accept longer pre-push times in exchange for fewer broken builds on `main` and fewer re-runs of CI for easily preventable issues.
- **Optional fast path preserved**: For workflows where rapid feedback is still important (e.g., early in a feature branch), `npm run ci-verify:fast` remains available as a manual pre-flight, but it is not the enforced gate.

## Constraints and guardrails

To keep pre-push and CI aligned while retaining some flexibility, we adopt the following constraints:

1. **Minimum checks in `ci-verify:full`**
   - `ci-verify:full` (currently `ci-verify`) must remain the **full CI-equivalent quality sequence** runnable locally. At a minimum, it must include:
     - `npm run build` (or equivalent build step, if present)
     - `npm run type-check`
     - `npm run lint`
     - `npm run format:check`
     - `npm run duplication`
     - `npm run check:traceability`
     - The main Jest test suite (including coverage configuration as enforced in CI)
     - Security and dependency checks (`npm run audit:ci`, `npm run safety:deps`, and other CI-enforced audits)
   - `.husky/pre-push` must invoke this full sequence (or its future renamed equivalent).
   - `ci-verify:fast` is now a **manual, optional** helper for developers and is not the pre-push script.

2. **Relationship to `ci-verify:full` and CI**
   - `ci-verify:full` is the **script-level mirror** of the CI quality gates, intended to be as close as practical to what CI runs before any deploy/release steps.
   - CI may include additional steps that are inherently CI-only (e.g., publish-time smoke tests, `lint-plugin-check` on the published artifact, release automation). These are not expected to run locally.
   - `ci-verify:fast` is a secondary, **manual fast check** that can be used by contributors for quick feedback but does not replace `ci-verify:full` as the enforced pre-push gate.

3. **Failure patterns and escalation**
   - If CI frequently fails **despite** `ci-verify:full` being enforced pre-push (e.g., due to extremely slow or flaky steps, environment-specific issues, or CI-only checks beyond `ci-verify:full`):
     - Maintain a log of which steps are responsible.
     - Consider optimizing or parallelizing the slowest steps in `ci-verify:full`.
     - As a last resort, consider **temporarily relaxing** the pre-push hook (for example, moving some especially slow but low-signal checks back to CI-only) while updating this ADR to describe the new contract.

4. **Documentation linkage**
   - `.husky/pre-push` and contributor docs must reference this ADR so maintainers and contributors can discover and understand the policy.
   - Any changes to the composition of `ci-verify:full` or to which script `.husky/pre-push` invokes must be reflected here.

## Rollback / migration plan

If we decide that pre-push parity with CI is too costly in practice (for example, due to repeatedly long pre-push times in common workflows), we can revert to the previous "fast subset" approach or a hybrid.

1. **Option A – Roll back to fast-only pre-push (`ci-verify:fast`)**
   - Change `.husky/pre-push` to run `npm run ci-verify:fast` instead of `ci-verify:full`.
   - Explicitly document that pre-push is once again a **fast, partial gate**, and that contributors are encouraged to run `npm run ci-verify:full` manually before risky pushes.
   - Update this ADR (or supersede it with a new one) to reflect the rollback and clearly describe which CI checks are no longer enforced pre-push.

2. **Option B – Hybrid / optimized pre-push**
   - If full parity is mostly helpful but certain steps are disproportionately slow or flaky, adjust `ci-verify:full` and the pre-push hook to:
     - Keep the highest-value checks (type-check, lint, format, core tests, audits that commonly fail) in pre-push.
     - Move only the least valuable or inherently CI-only steps back to CI.
   - Document any deviation from full parity in this ADR, including which checks are pre-push vs CI-only.

3. **Option C – Workflow-specific relaxation**
   - For specific workflows (e.g., automated tooling, bots, or bulk operations) where long pre-push times are impractical:
     - Document how to temporarily bypass the pre-push hook (standard Husky guidance) while keeping it enabled for interactive developer usage.
     - Consider project-level policies for when bypassing is acceptable.
   - If bypassing becomes common, reassess whether enforced full parity is still the right default.

Any significant change to pre-push behavior—including rolling back to `ci-verify:fast` as the main gate—**must** be accompanied by an ADR update or a new ADR that supersedes this one.

Created autonomously by voder.ai