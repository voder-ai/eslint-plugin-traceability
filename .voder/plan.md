## NOW

- [ ] Create a repository script at scripts/report-eslint-suppressions.js that scans the repository (excluding node_modules and .voder/) for ESLint/TypeScript suppression comments (/* eslint-disable */, // eslint-disable-next-line, /* eslint-disable-line */, // @ts-nocheck), writes a parseable report to scripts/eslint-suppressions-report.md listing file, line number, the suppression text, and a suggested remediation, and exits with code 2 if any suppressions are found.

## NEXT

- [ ] Run scripts/report-eslint-suppressions.js to generate scripts/eslint-suppressions-report.md and use it as the authoritative list of suppression locations to remediate.
- [ ] Remediate suppressions incrementally: for each suppression in the report, make a small focused change (one suppression per commit) to either refactor the code to avoid the suppression or narrow it to the minimal statement with a one-line justification comment referencing an issue/ADR; re-run the report after each change until no suppressions remain.
- [ ] Split the oversized helper module(s) (e.g., src/rules/helpers/require-story-helpers.ts) into smaller modules under src/rules/helpers/ (core, io, visitors) with function-level @story/@req JSDoc and branch-level annotations where business logic remains.
- [ ] Run a full npm audit (locally or via CI) and capture advisories; for each actionable advisory remediate by upgrading/overriding/patching where safe, or document accepted residual risk in docs/security-incidents/ (include @story/@req annotations).
- [ ] Create an ADR at docs/decisions/adr-pre-push-parity.md documenting the pre-push vs CI parity decision, listing exact ci-verify:fast and ci-verify commands, rationale for the divergence, and a clear migration/rollback plan.

## LATER

- [ ] Add a CI step that runs scripts/report-eslint-suppressions.js early and fails the build if unsupported/broad suppressions exist (enforce policy).
- [ ] Implement an ESLint custom rule or config to flag file-level broad disables and enforce the minimal-justification pattern for any allowed suppression.
- [ ] Incrementally refactor duplicated tests into tests/utils/shared-fixtures.ts, one test file per commit, until jscpd duplication is below the threshold.
- [ ] Add focused tests for modules with low branch coverage to raise branch coverage to >=90%, one small test per commit.
- [ ] After suppressions are cleared, progressively enable stricter ESLint rules in CI (fail-on-warnings or additional rules) with a staged rollout documented in an ADR.
