# Performance Test Suite Overview

This document explains the purpose of the performance tests, the time limits they enforce, and how to interpret and act on performance test failures when working on the maintenance tools or rules.

## Scope

This overview focuses on the performance tests under `tests/perf`:

- `tests/perf/maintenance-large-workspace.test.ts`
- `tests/perf/maintenance-cli-large-workspace.test.ts`
- `tests/perf/require-branch-annotation-large-file.test.ts`
- `tests/perf/valid-annotation-format-large-file.test.ts`

It is closely related to `docs/maintenance-performance-tests.md`, which dives deeper into maintenance-tool performance scenarios.

## Time Limits and Budgets

The large-workspace maintenance and CLI tests encode an explicit **5 second per-operation budget**:

- `tests/perf/maintenance-large-workspace.test.ts` defines `LARGE_WORKSPACE_PERF_BUDGET_MS = 5000`.
- `tests/perf/maintenance-cli-large-workspace.test.ts` defines `CLI_LARGE_WORKSPACE_PERF_BUDGET_MS = 5000`.

Each operation under test (a single call to `detectStaleAnnotations`, `verifyAnnotations`, `generateMaintenanceReport`, `updateAnnotationReferences`, `batchUpdateAnnotations`, or one CLI invocation) must complete within this budget on CI-class hardware. The tests measure wall-clock time around the operation and assert that the duration is **less than** the configured budget.

The rule-level performance tests (`require-branch-annotation-large-file` and `valid-annotation-format-large-file`) use similar 5 second guardrails for analyzing synthetic large files.

## When to Run Performance Tests

Run the performance tests in these situations:

- When changing code in:
  - `src/maintenance/*`
  - `src/utils/storyReferenceUtils.ts`
  - `src/rules/require-branch-annotation.ts`
  - `src/rules/valid-annotation-format.ts`
- When modifying file traversal, annotation parsing, or batch update behavior.
- When investigating or addressing reported slowdowns in maintenance tooling or rule execution.

They are heavier than unit tests and do **not** need to run on every edit. Use them before merging substantial changes or as part of periodic CI jobs.

## Interpreting Failures

If a performance test fails:

1. Check whether the failure is functional (unexpected result, error) or purely timing-related.
2. For timing-related failures:
   - Re-run the specific perf test locally to rule out transient slowdowns.
   - Compare with recent changes in traversal, parsing, or update logic.
   - Add temporary logging or timers around suspected hotspots to identify regressions.
3. Only consider adjusting the 5 second budgets after understanding the cause and confirming that CI hardware characteristics have changed.

For deeper guidance on maintenance-specific scenarios and expectations, see `docs/maintenance-performance-tests.md`.

## Recommended Runtime Verification Commands

Before merging substantial changes to the maintenance tools or rules, it is recommended to run:

- `npm run ci-verify:fast` for a quick but meaningful verification gate during development.
- `npm run ci-verify:full` to mirror the full CI pipeline locally (including coverage, audits, and performance-sensitive tests under `tests/perf`).
- `npm test -- --runInBand --ci --testPathPatterns tests/perf` to focus specifically on the performance suites when investigating or tuning performance.

The `ci-verify:full` script already runs Jest with coverage, which includes the performance tests. If `npm run ci-verify:full` passes, it implies that the current changes respect the configured performance guarantees.