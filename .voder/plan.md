## NOW

- [ ] Add focused Jest unit tests that cover the uncovered branch cases in src/rules/helpers/require-story-core.ts (include a JSDoc test header with @story and @req tags) so branch coverage for that module rises above the repository coverage threshold.

## NEXT

- [ ] Extract the exact uncovered branch locations from the latest coverage artifact (ci/coverage or jest coverage JSON) and produce a concise checklist of branches/line ranges to target across src/rules/helpers/*.
- [ ] Implement incremental Jest tests for require-story-helpers.ts uncovered branches (one small test file per logical group of branches). Each test file must include a JSDoc header with @story and @req references and only test one behavior/branch at a time.
- [ ] Implement incremental Jest tests for require-story-io.ts and require-story-visitors.ts uncovered branches (add tests until coverage for helper modules meets or exceeds the desired threshold). Ensure new tests are isolated and deterministic and include traceability headers.
- [ ] Once helper-module coverage is sufficient, restore the intended global branch coverage threshold in jest.config.js (raise it back to the policy value) so CI enforces the stricter target again.
- [ ] Create a single canonical npm script (e.g., "ci-verify") that enumerates the CI verification steps in a maintainable order (build/type-check/lint/tests/format/duplication). Update .husky/pre-push to call a fast local verification script that reuses the canonical script but runs a fast subset appropriate for developer UX, and document the parity decision in CONTRIBUTING.md.
- [ ] Fix CI workflow audit invocation: ensure scripts/ci-safety-deps.js invokes dry-aged-deps with the correct flag (e.g., --format=json) and that scripts/ci-audit.js reliably writes npm audit JSON. Then remove continue-on-error for production/high-severity audit steps or, if removal is not immediately feasible, add an ADR documenting the accepted exception, owner, and reassessment schedule.
- [ ] Triage dependency audit output: if dry-aged-deps lists safe updates, apply them one package at a time (small commits). If a high-severity production issue has no safe patch, author an ADR under docs/decisions/ describing the acceptance rationale, mitigations, owner and reassessment date.
- [ ] Remediate code-quality items flagged earlier: remove or justify inline ESLint disables (add linked issue if disable must remain), consolidate duplicated test blocks identified by jscpd, and fix any remaining simple lint/style findings. Add @story/@req JSDoc where remediation touches code paths.
- [ ] Regenerate the traceability report (scripts/traceability-report.md) and commit it so the repository shows zero outstanding missing-function/missing-branch entries for the changed files.

## LATER

- [ ] Add a scheduled workflow that runs safety:deps weekly and opens informative PRs (or at minimum uploads artifacts) when dry-aged-deps finds safe updates; keep update cadence and PR templates consistent with the project's dependency policy.
- [ ] Enforce ESLint max-lines and file-size limits as blocking checks in CI so future oversized files are prevented; do this after helper tests and parity fixes to avoid blocking current work.
- [ ] Add a small coverage-delta check to PR validation that warns when branch coverage decreases by a significant delta (e.g., > 1%) to provide early feedback while preserving stability.
- [ ] Audit and, where necessary, reduce console.debug noise during tests by making logger respect NODE_ENV=test; this will reduce CI log noise and make failed-log inspection easier.
- [ ] Document the pre-push vs CI parity decision in CONTRIBUTING.md with examples showing how to run the canonical verification locally and what to do when pre-push is intentionally slimmed (including the expected CI enforcement points).
