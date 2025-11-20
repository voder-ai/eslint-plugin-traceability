## NOW

- [ ] Create scripts/validate-scripts-nonempty.js that scans scripts/ for zero-byte or obviously-placeholder files and exits non-zero when any are found.

## NEXT

- [ ] Add a CI workflow step (immediately after checkout/setup-node) in .github/workflows/ci-cd.yml to run node scripts/validate-scripts-nonempty.js so CI fails fast on empty/placeholder scripts.
- [ ] Run the new validation script locally; if it reports problematic files, replace or implement minimal functional content for those scripts (or remove unused placeholder files) to satisfy the validator.
- [ ] After remediation, let the automated pipeline run (the system will handle commit/push); if the CI run reports failures related to the validator, collect the failing step logs and fix the offending scripts and re-run the cycle.
- [ ] When the validator is stable in CI, proceed with incremental maintenance: split src/rules/helpers/require-story-helpers.ts into smaller modules in small commits and add focused unit tests for the extracted helpers.

## LATER

- [ ] Add a CI/pre-push check to report missing @story/@req annotations (or produce a report) to avoid unexpected traceability failures.
- [ ] Incrementally rename remaining '.branches.' test files to behavior-focused names (one file per commit) and add shared test utilities to reduce jscpd duplication.
- [ ] Introduce a lightweight linter or CI metric that warns on empty/very-short scripts and on file-length thresholds; document the policy in an ADR.
- [ ] Address jscpd clones and refactor large files after CI stability is confirmed, running tests after each small change.
