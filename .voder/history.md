Here’s a concise history-only summary of what has been done on the project so far:

1. **Core rule refactors and performance**
   - Split `valid-req-reference` internals into `valid-req-reference-helpers.ts`, separating parsing, validation, traversal, and I/O.
   - Documented the helper-module pattern for rule internals.
   - Optimized `require-branch-annotation` for nested branches so autofix targets only the correct inner branches.
   - Added nested-branch tests and Jest performance tests for large files, updated `RuleTester` expectations, and re-ran the full quality suite.

2. **Tests, CI, and maintenance tooling**
   - Ran Jest with coverage and investigated CI issues traced to missing `node_modules`.
   - Verified `ci-verify:full` on stable CI paths.
   - Cleaned up `src/maintenance/*.ts` (including redundant `fs.statSync`), expanded `verify` tests (exit codes, no-op, permissions).
   - Simplified `update.ts` using `getAllFiles`, extended performance tests, updated `.voder/plan.md`, and confirmed CI success.

3. **Dogfooding and traceability enforcement**
   - Completed a full dogfooding pass (Story 023) across stories, problems, rules, scripts, and checks.
   - Enabled `traceability/require-story-annotation` for TypeScript in `eslint.config.js` with tuned overrides; validated via `report:eslint-suppressions`.
   - Added `tests/integration/dogfooding-validation.test.ts` to enforce story annotations repo-wide.
   - Updated Story 023 and problem doc `001-plugin-not-enforcing-own-traceability-rules.open.md`.
   - Expanded `docs/eslint-plugin-development-guide.md` with “Dogfooding and Self-Validation” and ensured lint/CI/Husky pre-push run ESLint with `require-story-annotation` on `src` and `tests`.

4. **Plugin metadata and setup verification**
   - Added structured `pluginMeta` (name, version, namespace) in `src/index.ts`.
   - Extended `tests/plugin-setup.test.ts` to validate metadata against `package.json`.
   - Updated traceability annotations for REQ-PLUGIN-STRUCTURE and REQ-NPM-PACKAGE and revalidated exports/config and CLI error behavior.
   - Refreshed Story 001 and related documentation.

5. **Annotation / traceability helpers and detection heuristics**
   - Audited helper-module annotations for correct `@supports` / `@req` usage and documented expectations in the dev guide.
   - Implemented backtick-aware normalization in `normalizeCommentLine` so inline code doesn’t confuse `@story` / `@req` / `@supports` detection; added tests and updated annotations.
   - Improved `req` annotation detection in `src/utils/reqAnnotationDetection.ts` with additional heuristics and error-path coverage; added `createMockSourceCode`, tests tied to Story 003.0, achieving very high coverage.

6. **Catch and else-if branch-annotation behavior**

   **CatchClause (Story 025.0):**
   - Extended `gatherBranchCommentText` and `getBranchAnnotationInfo` to detect comments before `catch` clauses and inside catch bodies.
   - Added tests for comment priority and autofix placement; removed unused imports.
   - Added `tests/integration/catch-annotation-prettier.integration.test.ts` for Prettier 3.6.2 compatibility, including empty `catch`.
   - Enhanced `branch-annotation-helpers.ts` with `extractCommentValue` and `gatherCatchClauseCommentText`, and documented behavior in Story 025.0, rule docs, and `user-docs/api-reference.md`.

   **Else-if (Story 026.0):**
   - Implemented else-if-aware helpers (`isElseIfBranch`, updated `gatherBranchCommentText` / `getBranchAnnotationInfo` to accept `parent`).
   - Simplified parent handling to rely on `node.parent` instead of `context.getAncestors()`.
   - Added rule tests for full `IfStatement`/`else if` coverage and consistent reporting/autofix.
   - Added `tests/integration/else-if-annotation-prettier.integration.test.ts` behind `TRACEABILITY_EXPERIMENTAL_ELSE_IF`.
   - Refined `gatherElseIfCommentText` with targeted scanners and priority ordering, with focused helper tests linked to Story 026.0.

7. **Annotation format performance**
   - For Story 005.0, added `tests/perf/valid-annotation-format-large-file.test.ts` to stress-test `traceability/valid-annotation-format` on large synthetic TS files with enforced runtime thresholds, integrated into perf and full suites.

8. **Plugin config and ESLint 9 alignment (Story 002)**
   - Re-reviewed Story 002 and ESLint flat config integration for traceability rules and tests.
   - Ensured alignment with ESLint 9 patterns and schemas.
   - Extended `tests/config/eslint-config-validation.test.ts` to cover runtime config errors for `traceability/valid-story-reference`.
   - Marked Story 002 Definition of Done as complete and re-ran quality checks.

9. **Runtime, tooling, and dependency alignment**
   - Validated Node/Jest/ts-jest compatibility in CI (e.g., Jest 30.2.0, ts-jest 29.4.5 on Node 22).
   - Normalized dependency metadata using `npm list` and `package-lock.json`.
   - Updated `package.json` `engines.node` to support Node 18.18, 20, 22, 24+; aligned CI matrix.
   - Fixed semantic-release environment variable handling; updated `README.md` and `CONTRIBUTING.md` for supported environments.
   - Resolved Secretlint issues by removing `--no-color` from `security:secrets`; re-ran `ci-verify:full` and secret scans on all Node targets.

10. **Rule naming and migration support**
    - Implemented migration from `prefer-implements-annotation` to `prefer-supports-annotation` (Story 010.3):
      - Kept implementation under the old key with a new alias.
      - Marked old name as deprecated via `replacedBy`.
      - Updated tests, docs, API reference, migration guide, and README.
      - Ran full quality suite.

11. **Ongoing quality verification**
    - After major changes, repeatedly ran:
      - `npm run build`
      - `npm test` (coverage, perf, integration)
      - `npm run lint`
      - `npm run type-check`
      - `npm run format:check`
      - `ci-verify` plus security scans
    - Confirmed GitHub CI/CD runs remained green (e.g., `19992305176`, `19996014527`, `19996411265`).

12. **Formatter-focused branch tests and story alignment**
    - Validated Prettier integration via:
      - `tests/integration/catch-annotation-prettier.integration.test.ts`
      - `tests/integration/else-if-annotation-prettier.integration.test.ts`
    - Ensured these tests match `branch-annotation-helpers.ts` behavior and related rule/helper tests.
    - Confirmed plain `else` and other branches still use the “immediately before branch” comment model.
    - Ran local quality commands and confirmed formatter-integration CI success (e.g., run `19997138824`).

13. **Else-if documentation updates**
    - Updated `docs/rules/require-branch-annotation.md` with else-if positions, precedence, autofix behavior, and test links.
    - Updated `user-docs/api-reference.md` to document formatter-aware `catch`/`else if` behavior and simpler model for other branches.
    - Extended `user-docs/migration-guide.md` with “3.2 Else-if branch annotations and formatter compatibility.”
    - Updated Story 026.0 docs and Definition of Done; re-ran quality checks.

14. **Formatter-aware examples and cross-references**
    - Reviewed examples, stories, and helper code for consistency.
    - Extended `user-docs/examples.md` with “Branch annotations with if/else/else-if and Prettier” (pre- and post-format examples and behavior notes).
    - Updated `user-docs/api-reference.md` to reference these examples.
    - Re-ran tests, lint, type-check, build, and format; CI run `19997373543` passed.

15. **Numeric-range guard coverage in req-annotation detection**
    - Reviewed `fallbackTextBeforeHasReq` guard logic in `reqAnnotationDetection.ts`.
    - Identified and added tests for a missing path where `node.range` is an array but `range[0]` is non-numeric.
    - Confirmed all tests and CI on `main` passed.

16. **Extended coverage for advanced req-annotation heuristics**
    - Audited guards and early returns in:
      - `linesBeforeHasReq`
      - `parentChainHasReq`
      - `fallbackTextBeforeHasReq`
      - `hasReqInAdvancedHeuristics`
      - `hasReqInJsdocOrComments`
      - `hasReqAnnotation`
    - Cataloged detection paths and added three new `[REQ-ANNOTATION-REQ-DETECTION]` tests:
      - `linesBeforeHasReq` with preceding `@req`.
      - `parentChainHasReq` with non-callable `getCommentsBefore` and parent `@supports`.
      - JSDoc-only detection with undefined `context`.
    - Achieved near-complete coverage (100% statements/functions/lines, ~98.3% branches); CI run `19997900404` succeeded.

17. **Refactor to deduplicate branch comment scanning helpers**
    - Used `npm run duplication` to find duplicated scanning logic in `branch-annotation-helpers.ts`.
    - Introduced `collectCommentLine` and refactored:
      - `gatherCatchClauseCommentText` fallback scan.
      - `scanElseIfBetweenConditionAndBody`.
      - `scanElseIfInsideBlockComments`.
    - Preserved behavior while reducing duplication.
    - Ran lint, tests, type-check, build, format, and duplication checks; CI/CD run `19998105848` passed with improved duplication metrics.

18. **Accepting `@supports` annotations on branches as an alternative format**
    - Revisited Story 004.0 and REQ-SUPPORTS-ALTERNATIVE to allow `@supports <story-file> <REQ-ID>` on branches instead of separate `@story` + `@req`.
    - Analyzed `require-branch-annotation.ts`, `branch-annotation-helpers.ts`, `require-story-io.ts`, `reqAnnotationDetection.ts`, and associated tests/docs.
    - Found general `@supports` handling already in place, but branch logic lacked it.
    - Updated `getBranchAnnotationInfo` to:
      - Detect `hasSupports` via `/@supports\b/`.
      - Treat any `@supports` branch comment as satisfying both story and req presence checks.
      - Add JSDoc `@supports` annotation linked to REQ-SUPPORTS-ALTERNATIVE.
    - Simplified `reportMissingAnnotations` to use `node.parent` while preserving else-if behavior.
    - Verified else-if insertion and Prettier-aware scanning remained correct.
    - Extended rule tests to cover branches annotated only with `@supports` (if, try/catch, else-if).
    - Updated `tests/utils/branch-annotation-else-if-insert-position.test.ts` to use `node.parent`.
    - Updated `user-docs/api-reference.md` explaining that a single `@supports` satisfies both presence checks, while format validation remains with other rules.
    - Re-ran tests, lint, type-check, format, build; CI/CD passed for the `feat: accept @supports annotations on branches as alternative format` change.

19. **Auto-fix idempotency and single-application behavior (Story 008.0)**
    - Reviewed Story 008.0 and code in:
      - `require-story-annotation.ts`
      - `valid-annotation-format.ts`
      - `require-story-core/visitors/helpers`
      - `valid-annotation-format` internal helpers/validators.
    - Clarified requirements:
      - REQ-AUTOFIX-IDEMPOTENT: repeated `eslint --fix` runs produce no further changes after the first.
      - REQ-AUTOFIX-SINGLE-APPLICATION: each violation yields at most one fix.
    - Confirmed implementations structurally met these behaviors; the gap was explicit tests and story documentation.
    - Updated `tests/rules/auto-fix-behavior-008.test.ts`:
      - Added `@req` and `@supports` annotations for the new requirements.
      - Added `require-story-annotation` tests:
        - Valid “no-op on rerun” cases.
        - Invalid cases where missing `@story` is fixed exactly once (function and class method), with proper `errors` and `suggestions`.
      - Added `valid-annotation-format` tests:
        - Valid no-op cases.
        - Invalid cases showing single `.story.md` suffix correction without double-appending.
    - Updated `docs/stories/008.0-DEV-AUTO-FIX.story.md`:
      - Documented REQ-AUTOFIX-IDEMPOTENT and REQ-AUTOFIX-SINGLE-APPLICATION.
      - Marked Acceptance Criteria for idempotent/no-duplicate fixes as completed.
      - Marked Definition of Done as fully complete.
    - Ran focused Jest on `auto-fix-behavior-008.test.ts`, `npm run ci-verify:fast`, then committed and pushed (`test: cover idempotent and single-application auto-fix behavior`); CI pipeline completed successfully.

20. **Formatter integration tests and Jest configuration verification (most recent work)**
    - Inspected Jest configuration (`jest.config.js`), confirming:
      - `ts-jest` preset with `testMatch: ["<rootDir>/tests/**/*.test.ts"]`.
      - Coverage thresholds and correct ignore patterns.
      - Compatibility with Jest 30 (no reproducible `jest-util` issues).
    - Analyzed and ran Prettier-related integration tests:
      - `tests/integration/catch-annotation-prettier.integration.test.ts`
      - `tests/integration/else-if-annotation-prettier.integration.test.ts`
    - Used updated Jest CLI flag `--testPathPatterns` to run specific files.
    - Verified:
      - Catch+Prettier tests all pass and use robust, non-brittle assertions (relative line order and exit codes).
      - Else-if+Prettier tests are environment-gated via `TRACEABILITY_EXPERIMENTAL_ELSE_IF` and are skipped by default without failures.
      - Prettier CLI is correctly resolved via `prettier/package.json` for `prettier@3.6.2`; no “Cannot find module '../package.json'” errors.
    - Re-reviewed helper and unit tests that underpin this behavior:
      - `branch-annotation-helpers.ts` catch and else-if logic.
      - `branch-annotation-catch-position`, `branch-annotation-else-if-position`, and `branch-annotation-else-if-insert-position` tests.
    - Confirmed no additional Prettier-driven scenarios are missing or failing; existing integration tests already cover the previously problematic paths, so no additional test files were added.
    - Ran the full Jest suite with `npm test -- --runInBand` and `npm run ci-verify:fast`; then committed and pushed a change documenting this verification (`test: verify prettier integration paths and jest configuration`).
    - Observed the GitHub Actions workflow (run `20001728043`) completing successfully, confirming all checks (build, type-check, lint, tests with coverage, security, and formatter integration) passed.

**Most recently we've executed the following action:**

---
Used tool: find_files with input: {"pattern":"*branch-annotation*","directory":"src"}
Used tool: find_files with input: {"pattern":"*require-story-core*","directory":"src"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts"}
Used tool: run_command with input: {"command":"nl","args":["-ba","src/utils/branch-annotation-helpers.ts"]}
Used tool: search_file_content with input: {"filePath":"src/utils/branch-annotation-helpers.ts","pattern":"For else-if blocks","isRegex":false}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: read_file with input: {"filePath":"tests/utils/branch-annotation-else-if-position.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/branch-annotation-else-if-insert-position.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/branch-annotation-catch-insert-position.test.ts"}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","instruction":"Introduce a small shared helper for comment-line extraction and use it in the formatter-aware helpers.\n\n1. Just above the existing `collectCommentLine` function, insert a new helper that encapsulates the logic for determining whether a given source line is a comment line, returning the trimmed comment text or null:\n\n```ts\n/**\n * Extract trimmed comment text for a given source line index or return null\n * when the line is blank or not a comment. This helper centralizes the\n * formatter-aware rules used by branch helpers when scanning for contiguous\n * comment lines around branches.\n * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION\n * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION REQ-FALLBACK-LOGIC\n * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF REQ-FALLBACK-LOGIC-ELSE-IF\n */\nfunction getCommentTextAtLine(\n  lines: string[],\n  index: number,\n): string | null {\n  const line = lines[index];\n  if (!line || !line.trim()) {\n    return null;\n  }\n  if (!/^\\s*(\\/\\/|\\/\\*)/.test(line)) {\n    return null;\n  }\n\n  return line.trim();\n}\n```\n\n2. Rewrite the existing `collectCommentLine` helper to delegate to `getCommentTextAtLine` rather than duplicating the comment-detection logic:\n\n```ts\nfunction collectCommentLine(\n  lines: string[],\n  index: number,\n  comments: string[],\n): boolean {\n  const commentText = getCommentTextAtLine(lines, index);\n  if (!commentText) {\n    return false;\n  }\n\n  comments.push(commentText);\n  return true;\n}\n```\n\n3. Update `scanElseIfPrecedingComments` to reuse the new `getCommentTextAtLine` helper instead of inlining the same blank/non-comment checks. Replace the inner `while` loop body with logic that calls the helper and unshifts the returned comment text when present:\n\n```ts\n  while (i >= 0 && scanned < PRE_COMMENT_OFFSET) {\n    const commentText = getCommentTextAtLine(lines, i);\n    if (!commentText) {\n      break;\n    }\n\n    comments.unshift(commentText);\n    i--;\n    scanned++;\n  }\n```\n\nDo not change any other behavior in this file."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci","--bail"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: extract shared helper for branch comment line detection"}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":20002061752,"timeout":600000}
---

**This was the result:**
---
Here’s what I implemented for the **##NOW** and **##NEXT** sections and the updated plan.

---

## Work completed

### ##NOW

- [x] **Review the branch annotation helper module to precisely identify the remaining duplicated logic in the formatter-aware branch handling code and decide on a small shared helper shape that can consolidate those behaviors without changing observable behavior.**

Actions:

- Inspected `src/utils/branch-annotation-helpers.ts`, focusing on the formatter-aware logic that scans source lines for comments around:
  - Catch clauses (`gatherCatchClauseCommentText`)
  - Else-if blocks (`scanElseIfPrecedingComments`, `scanElseIfBetweenConditionAndBody`, `scanElseIfInsideBlockComments`)
- Confirmed that multiple helpers were duplicating the same pattern:
  - Look up `lines[index]`
  - Treat blank lines or non-comment lines as termination points
  - Otherwise, trim the comment and add it to an accumulator
- Decided on a small shared helper that encapsulates “is this line a comment?” and “return its trimmed text or null” to keep behavior identical while centralizing that logic.

This review directly satisfied the NOW task and informed the helper design.

---

### ##NEXT

- [x] **Introduce a new, well-named helper function in the branch annotation helper module that encapsulates the duplicated formatter-aware logic, including clear story and requirement annotations explaining its purpose.**

Implemented in `src/utils/branch-annotation-helpers.ts`:

```ts
/**
 * Extract trimmed comment text for a given source line index or return null
 * when the line is blank or not a comment. This helper centralizes the
 * formatter-aware rules used by branch helpers when scanning for contiguous
 * comment lines around branches.
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION
 * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION REQ-FALLBACK-LOGIC
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF REQ-FALLBACK-LOGIC-ELSE-IF
 */
function getCommentTextAtLine(
  lines: string[],
  index: number,
): string | null {
  const line = lines[index];
  if (!line || !line.trim()) {
    return null;
  }
  if (!/^\s*(\/\/|\/\*)/.test(line)) {
    return null;
  }

  return line.trim();
}
```

- This helper centralizes the formatter-aware “is this line a comment?” logic used when scanning around branches.
- It carries `@supports` annotations that tie it to the branch, catch, and else-if stories and requirements, as requested.

---

- [x] **Refactor the existing duplicated code sites to use the new helper function, ensuring inputs and outputs remain equivalent so that catch and else-if branch handling behavior does not change.**

Refactors:

1. **`collectCommentLine` now delegates to `getCommentTextAtLine`**:

```ts
function collectCommentLine(
  lines: string[],
  index: number,
  comments: string[],
): boolean {
  const commentText = getCommentTextAtLine(lines, index);
  if (!commentText) {
    return false;
  }

  comments.push(commentText);
  return true;
}
```

- Previously, `collectCommentLine` inlined the line/blank/non-comment checks; now it relies on the shared helper, but behavior is unchanged (same conditions, same trimming, same accumulator semantics).

2. **`scanElseIfPrecedingComments` now uses `getCommentTextAtLine` instead of inlined logic:**

```ts
while (i >= 0 && scanned < PRE_COMMENT_OFFSET) {
  const commentText = getCommentTextAtLine(lines, i);
  if (!commentText) {
    break;
  }

  comments.unshift(commentText);
  i--;
  scanned++;
}
```

- Previously, this loop duplicated the same checks; now it uses the shared helper but preserves:
  - Scanning up at most `PRE_COMMENT_OFFSET` lines
  - Stopping on blanks or non-comment lines
  - Maintaining order via `unshift`

3. The **catch-block fallbacks and between/inside scans** (`gatherCatchClauseCommentText`, `scanElseIfBetweenConditionAndBody`, `scanElseIfInsideBlockComments`) still use `collectCommentLine`, which now benefits from the centralized helper. No behavior change was introduced there.

Net effect: duplicated formatter-aware comment-line detection logic is now in one place, while all call sites (catch and else-if flows) see the same behavior as before.

---

- [x] **Revisit the existing branch-annotation helper tests for catch and else-if positions and insert positions to confirm they still exercise the refactored logic and add a targeted test if the new helper introduces any previously untested edge case.**

What I did:

1. **Reviewed existing tests** (no changes required):
   - `tests/utils/branch-annotation-catch-insert-position.test.ts`
   - `tests/utils/branch-annotation-else-if-position.test.ts`
   - `tests/utils/branch-annotation-else-if-insert-position.test.ts`
   - `tests/utils/branch-annotation-catch-position.test.ts`
   - `tests/utils/branch-annotation-helpers.test.ts`

   These already cover:

   - Catch annotation placement and insert positions under formatter-like layouts.
   - Else-if annotation detection for:
     - Annotations before the `else if` keyword.
     - Annotations between condition and body.
     - Preference rules when both positions exist.
   - Insert positions for else-if and catch branches under Prettier-style formatting.

   Because the new helper only centralizes logic that was previously duplicated and all call sites still go through the same code paths, no new edge cases were introduced that aren’t already covered.

2. **Re-ran the test suite** to confirm behavior is unchanged:

   ```bash
   npm test -- --runInBand --ci --bail
   ```

   - Result: 48 passed, 1 skipped suites; 367 passed, 2 skipped tests. All existing branch-annotation and insert-position tests passed, confirming no behavior regressions.

3. Verified linting and type-checking also pass after the refactor:

   ```bash
   npm run lint -- --max-warnings=0
   npm run type-check
   npm run duplication
   ```

   - All succeeded; `jscpd` still reports the same overall duplication rate (2.37–2.38%), and the prior branch-helper-specific duplication is now handled via the helper. The remaining flagged clone is in `src/rules/helpers/require-story-core.ts` as previously noted, which is a separate future-refactor opportunity.

4. **Commit and push:**

   - Commit: `refactor: extract shared helper for branch comment line detection`
   - Pre-push hooks ran the full CI-equivalent suite (`ci-verify:full`, `security:secrets`), all passing.
   - Pushed to `main`, then waited for the “CI/CD Pipeline” GitHub Actions run (ID `20002061752`) to complete; it finished with `success`.

No new tests were required because the helper is a pure refactor of existing behavior; the existing test suite already exercises all relevant paths.

---

## Updated plan with status

### NOW

- [x] Review the branch annotation helper module to precisely identify the remaining duplicated logic in the formatter-aware branch handling code and decide on a small shared helper shape that can consolidate those behaviors without changing observable behavior.

### NEXT

- [x] Introduce a new, well-named helper function in the branch annotation helper module that encapsulates the duplicated formatter-aware logic, including clear story and requirement annotations explaining its purpose.
- [x] Refactor the existing duplicated code sites to use the new helper function, ensuring inputs and outputs remain equivalent so that catch and else-if branch handling behavior does not change.
- [x] Revisit the existing branch-annotation helper tests for catch and else-if positions and insert positions to confirm they still exercise the refactored logic and add a targeted test if the new helper introduces any previously untested edge case.

### LATER

- [ ] Re-run a duplication-focused review of the codebase to confirm that the branch annotation helper refactor has eliminated the identified duplicate block and to see if any similar micro-duplication remains worth addressing in future iterations.
- [ ] Update any relevant internal documentation or decision records, if needed, to briefly note the consolidation of formatter-aware branch helper logic and its rationale for maintainability.
- [ ] Look for other highly cohesive helper modules in the rules and utilities where small, behavior-preserving refactors could further reduce duplication and improve clarity without impacting existing story-aligned behavior.
---
