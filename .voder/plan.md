## NOW
Edit the pre-commit hook file .husky/pre-commit to replace the current heavy commands with a single fast staged-file invocation: run `npx --no-install lint-staged` (so pre-commit only formats and lints staged files). Commit this one change with a Conventional Commit message: `chore: make pre-commit fast — use lint-staged`.

## NEXT
After the pre-commit change is in place, perform the following incremental remediation steps (do them one small item at a time; run the full local quality suite and commit/push after each small change):

1. Remove or fix file-level TypeScript suppressions
   - File to start with: tests/rules/require-story-annotation.test.ts
   - Replace `// @ts-nocheck` with either:
     - fix the underlying type errors so no suppression is needed, or
     - use targeted `// @ts-expect-error` above the single offending line with an inline explanation comment and an issue/ticket reference if the error requires a follow-up.
   - Local checks to run after change:
     - npm run build
     - npm run type-check
     - npm test
     - npm run lint -- --max-warnings=0
     - npm run format:check
   - Commit message example: `fix(test): remove file-level @ts-nocheck from tests/rules/require-story-annotation.test.ts`

2. Incrementally remediate remaining missing traceability annotations
   - Use scripts/traceability-report.md to pick the next highest-impact file (one file or a small cohesive group). Suggested priority order: src/rules/require-story-annotation.ts, src/utils/branch-annotation-helpers.ts, src/utils/storyReferenceUtils.ts, then other src/rules/*.
   - For each file:
     - Add JSDoc `@story` and `@req` tags to every exported/public function and to each significant branch (if/else, switch, try/catch, loops) flagged in the report.
     - Keep edits small: one file per commit (or one tightly-related group).
     - Run the full local quality suite (build, type-check, test, lint, format-check).
     - Commit with a Conventional Commit message, e.g. `chore: add @story/@req annotations to src/rules/require-story-annotation.ts`.
     - Push and monitor CI. If CI fails, fix only the failing step locally, re-run the local suite, commit and push again.
   - Repeat until scripts/traceability-report.md shows the missing items reduced to the target level (aim for zero).

3. Fix broken story filename reference(s) in docs
   - File: user-docs/api-reference.md (and any other doc files that reference wrong story paths).
   - Replace incorrect reference `docs/stories/006.0-DEV-STORY-EXISTS.story.md` with the correct `docs/stories/006.0-DEV-FILE-VALIDATION.story.md` (search & fix any other mismatches).
   - Run doc link check (local script or grep) and the full quality suite if doc generation/tests exist.
   - Commit: `docs: fix broken story cross-reference in user-docs/api-reference.md`

4. Add missing @param / @returns JSDoc for public helpers
   - Identify complex exported helpers in src/utils/* and selected src/rules/* flagged in the documentation assessment.
   - Add clear @param and @returns annotations (one file per commit if needed).
   - Run full local quality suite and commit: `docs: add @param/@returns JSDoc to src/utils/storyReferenceUtils.ts`

5. Make traceability output visible in CI for reviewers
   - Add a CI workflow step that uploads scripts/traceability-report.md as an artifact when the traceability check runs or on failure.
   - If traceability now runs early in CI, ensure the artifact upload step occurs immediately after that step (and on failure).
   - Commit: `chore: upload traceability report artifact from CI on traceability check`

General rules for all NEXT actions
- Keep each change small and focused (one file or tight group).
- Before commit: run the full local quality suite in this order: npm run build; npm run type-check; npm test; npm run lint -- --max-warnings=0; npm run format:check.
- Use Conventional Commits. Prefer `chore:` or `fix:` for these remediation tasks.
- Push and monitor CI. Only proceed to the next file after CI passes.
- Do not modify prompts/, prompt-assets/, or .voder/.

## LATER
Once the immediate CODE_QUALITY and DOCUMENTATION items are remediated and CI is green for the incremental commits, do the following longer-term work:

1. Enforce traceability programmatically
   - Implement/enable an ESLint rule (or extend the existing plugin) that enforces per-function and per-branch `@story`/`@req` annotations.
   - Add unit tests validating the rule and run it in CI so missing annotations fail the pipeline.

2. Add documentation & ergonomics improvements
   - Add or update CONTRIBUTING.md with a "Traceability remediation checklist" that describes the annotation format, local remediation steps, scripts to run, and Conventional Commit examples.
   - Provide a small helper template script or editor snippets for adding the required JSDoc tags (placeholders only).

3. CI & pre-commit parity and safety
   - Confirm pre-push remains the gate for full type-check/test runs and pre-commit remains fast. Add a CI parity-check job that compares commands in .husky/pre-push with CI traceability/build/test commands and fails if they diverge.
   - Replace any remaining file-wide `// @ts-nocheck` with documented `// @ts-expect-error` and reference an issue for each exception; remove exceptions when fixed.

4. Documentation QA automation
   - Add a CI check that verifies all `@story` JSDoc file paths referenced in source/docs exist (a lightweight link validator).
   - Optionally remove scripts/traceability-report.md from the repository and rely on CI artifact generation, or keep it generated and committed by an automated job if you prefer source-tracked visibility.

5. Monitoring and maintenance
   - Schedule periodic runs of the traceability script (or add to CI) so regressions are caught early.
   - Track any remaining small exceptions in a short-lived issue list and close them as annotations are added.

If you want, I will perform the NOW action immediately (edit .husky/pre-commit to use lint-staged and commit the change), then proceed to the NEXT step of removing the file-level @ts-nocheck in tests/rules/require-story-annotation.test.ts as the first incremental remediation (running the full local quality suite before committing).