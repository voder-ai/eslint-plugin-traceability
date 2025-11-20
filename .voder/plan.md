## NOW

- [ ] Add a one-line justification comment referencing an ADR/issue and narrow the eslint disable to the specific rule for the suppression in scripts/generate-dev-deps-audit.js (one focused change to either replace a broad disable with a rule-specific disable plus justification or refactor to remove the need for the suppression).

## NEXT

- [ ] Apply the same focused remediation pattern to scripts/lint-plugin-check.js: either refactor to remove the suppression or narrow it to the exact rule and add a one-line justification comment referencing an ADR/issue (one suppression per commit).
- [ ] Apply the same focused remediation pattern to scripts/lint-plugin-guard.js: either refactor to remove the suppression or narrow it to the exact rule and add a one-line justification comment referencing an ADR/issue (one suppression per commit).
- [ ] Run scripts/report-eslint-suppressions.js and confirm the report shows no un-justified/broad suppressions; iterate on any remaining entries until the report is clean.
- [ ] Identify any helper file still exceeding configured file-size or function-size thresholds (start with src/rules/helpers/require-story-helpers.ts if it remains oversized). For the first flagged file: extract a single well-scoped function into a new helper module, add function-level @story/@req JSDoc and branch-level annotations as needed, and commit that single extraction. Repeat until flagged files meet thresholds.
- [ ] Run npm run check:traceability and address the first batch of missing branch-level annotations by adding inline @story/@req comments above the specific branches (one branch per commit) until traceability check reports zero missing branches.
- [ ] Decide the pre-push parity approach and implement it in one small change: either (A) expand .husky/pre-push to run ci-verify:fast (or an agreed subset of CI checks) so hooks mirror CI parity, or (B) create docs/decisions/adr-pre-push-parity.md documenting the accepted divergence, listing exact ci-verify:fast and ci-verify commands, rationale, and a migration/rollback plan. Commit the chosen single-step change.

## LATER

- [ ] Add a CI step that runs scripts/report-eslint-suppressions.js early and fails the build if it exits with code 2 (enforce no un-justified suppressions).
- [ ] Implement an ESLint custom rule or configuration to flag broad file-level disables and require the minimal-justification comment pattern; roll into CI after the codebase is clean.
- [ ] Continue incremental refactors to break down other large helpers (functions <60 lines, files <300 lines), adding tests for extracted modules where appropriate (one small test per commit).
- [ ] Refactor duplicated tests into tests/utils/shared-fixtures.ts and reduce jscpd clones, one test file per commit, until duplication meets policy thresholds.
- [ ] Add focused unit tests to raise branch coverage for low-coverage files to >=90% (one small test per commit) and re-run coverage until targets are met.
