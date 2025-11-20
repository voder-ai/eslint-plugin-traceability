## NOW

- [ ] Add proper @story and @req JSDoc annotations to the missing arrow-function/branch locations inside src/rules/helpers/require-story-io.ts so the traceability checker no longer flags that file.

## NEXT

- [ ] Add @story/@req JSDoc annotations to the remaining flagged locations from the assessment: src/rules/valid-story-reference.ts, src/rules/valid-req-reference.ts, src/rules/require-story-annotation.ts, src/rules/require-branch-annotation.ts, and src/rules/helpers/require-story-helpers.ts, ensuring each annotation references the correct prompt/story and requirement ID.
- [ ] Run the repository traceability check (check:traceability) locally to confirm zero missing annotations remain for the modified files and capture the updated traceability report (scripts/traceability-report.md) so CI will validate it on push.
- [ ] Extract exact uncovered branch locations from the latest jest coverage JSON (coverage/ or jest-coverage.json) and produce a concise checklist of branch ranges to target across src/rules/helpers/*.
- [ ] Create small, focused Jest tests (one test file per logical branch group) to cover uncovered branches in require-story-helpers.ts, require-story-io.ts and require-story-visitors.ts. Each test file must include a JSDoc header with @story and @req tags and exercise one behavior/branch at a time.
- [ ] Re-run coverage to confirm helper-module branch coverage meets the repository threshold; when helper coverage is sufficient, restore the intended global branch coverage threshold in jest.config.js back to the policy value.
- [ ] Add a canonical npm script (ci-verify) that runs the CI verification steps in a maintainable order (build, type-check, lint, tests, format, duplication). Keep it minimal and composable so Husky can re-use parts for a fast local subset.
- [ ] Update .husky/pre-push to call a new fast-local verification script that reuses the canonical ci-verify steps but runs a fast subset appropriate for developers (type-check, lint, traceability, and a fast unit-only test subset). Document the parity decision and the fast-subset rationale in CONTRIBUTING.md.
- [ ] Fix scripts/ci-safety-deps.js to invoke dry-aged-deps with the correct flag (e.g., --format=json), and make the script fail fast or log a distinct non-empty artifact if the command fails so CI does not silently produce empty fallback artifacts.
- [ ] Tighten GitHub Actions permissions in .github/workflows/ci-cd.yml: reduce top-level write scopes and move required write permissions to the specific release job/step that runs semantic-release. Keep least-privilege while preserving automatic publish behavior.
- [ ] Regenerate the traceability report and committed CI artifacts (ci/dry-aged-deps.json, scripts/traceability-report.md). Verify all checks pass in CI and ensure no traceability or coverage regressions remain.

## LATER

- [ ] If dry-aged-deps finds safe updates, apply them one-at-a-time (small commits) and run full quality checks after each; if a production high-severity issue lacks a safe patch, author an ADR (docs/decisions/) documenting acceptance rationale, mitigations, owner and reassessment date.
- [ ] Add a scheduled workflow (weekly) that runs the dependency safety check (dry-aged-deps) and opens informative PRs (or at minimum uploads artifacts) when safe updates are available, consistent with project dependency policy.
- [ ] Add a coverage-delta PR check (warning) that notifies when branch coverage drops more than a small threshold (e.g., >1%) to provide early feedback without blocking merges during incremental work.
- [ ] Reduce noisy console.debug output in rules/tests by making the logger respect NODE_ENV=test or gating verbose logs behind an environment variable to reduce CI log noise and improve failure signal-to-noise.
- [ ] Enforce ESLint max-file/max-lines limits as blocking checks in CI after helper tests and parity fixes are complete to prevent oversized files regressing in future work.
- [ ] Document the pre-push vs CI parity decision clearly in CONTRIBUTING.md with examples for developers (how to run the canonical verification locally, what to expect from fast pre-push subset, and when to run full ci-verify).
