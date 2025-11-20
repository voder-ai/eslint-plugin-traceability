## NOW

- [ ] Update src/index.ts to remove or correct the invalid @story JSDoc reference to docs/stories/001.2-RULE-NAMES-DECLARATION.story.md so it references an existing docs/stories file (or remove the @story tag if no appropriate story exists).

## NEXT

- [ ] Run the traceability scanner (scripts/traceability-check.js or npm run check:traceability) to detect any remaining invalid @story/@req references and capture the report.
- [ ] For each invalid @story/@req reported, apply a minimal targeted fix: correct the path, add a small missing story file (only if appropriate), or remove the erroneous tag. Add or update JSDoc @story/@req annotations on changed files to preserve traceability.
- [ ] Commit each fix as a small, focused Conventional Commit (one logical change per commit) and ensure JSDoc traceability tags are present in modified files.
- [ ] Run the project's fast verification (ci-verify:fast) locally to confirm the traceability step passes; then push to trigger CI and ensure the CI traceability step succeeds for the pushed commit (push/CI are handled automatically).
- [ ] Begin the first minimal refactor of src/rules/helpers/require-story-helpers.ts by extracting one cohesive helper (e.g., export-detection) into src/rules/helpers/export-detection.ts, add JSDoc @story/@req annotations and unit tests for the extracted helper, and update imports. Keep the change small so tests and checks remain green.

## LATER

- [ ] Continue splitting require-story-helpers.ts into additional focused modules in successive small commits with unit tests and traceability annotations.
- [ ] Introduce a CI-enforced traceability lint step that fails early with clear messages listing offending files and remediation guidance; document the rule and remediation steps in CONTRIBUTING and an ADR.
- [ ] Rename remaining '.branches.' test files to behavior-focused names incrementally (one file per commit) and extract shared test utilities to reduce jscpd-flagged duplication.
- [ ] Revisit pre-push ↔ CI parity: after traceability fixes are complete, align ci-verify:fast or pre-push to detect the same class of traceability/script-placeholder issues as CI, and document the chosen parity strategy in an ADR.
