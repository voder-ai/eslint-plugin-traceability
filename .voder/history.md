Here’s a history-only summary of what’s been done so far on the project, including the most recent work, with all forward-looking plans removed:

---

### Core rule internals and performance

- Refactored `valid-req-reference` internals into `valid-req-reference-helpers.ts`, separating parsing, validation, traversal, and I/O, and documented the helper-module pattern.
- Optimized `require-branch-annotation` for nested branches so autofix targets the correct inner branch.
- Added nested-branch tests and Jest performance tests for large files, updated `RuleTester` expectations, and re-ran full quality suites.

### Tests, CI, and maintenance tooling

- Debugged Jest/CI issues (e.g., missing `node_modules`) and verified `ci-verify:full` on stable paths.
- Cleaned up `src/maintenance/*.ts` (removed redundant `fs.statSync`) and expanded `verify` tests to cover exit codes, no-op behavior, and permissions.
- Simplified `update.ts` using `getAllFiles`, extended performance tests, updated `.voder/plan.md`, and confirmed CI success across changes.

### Dogfooding and traceability enforcement

- Completed a full dogfooding pass (Story 023) across stories, problems, rules, scripts, and checks.
- Enabled `traceability/require-story-annotation` for TypeScript in `eslint.config.js`, tuned overrides, and validated via `report:eslint-suppressions`.
- Added `tests/integration/dogfooding-validation.test.ts` to enforce story annotations repo-wide.
- Updated Story 023 and problem doc `001-plugin-not-enforcing-own-traceability-rules.open.md`.
- Extended `docs/eslint-plugin-development-guide.md` with a “Dogfooding and Self-Validation” section.
- Ensured lint/CI/Husky pre-push run ESLint with `require-story-annotation` on `src` and `tests`.

### Plugin metadata and setup verification

- Added structured `pluginMeta` (name, version, namespace) in `src/index.ts`.
- Extended `tests/plugin-setup.test.ts` to validate metadata against `package.json`.
- Updated traceability annotations for REQ-PLUGIN-STRUCTURE and REQ-NPM-PACKAGE and revalidated exports, config, and CLI error behavior.
- Refreshed Story 001 and related docs.

### Annotation / traceability helpers and detection heuristics

- Audited helper-module annotations and documented correct `@supports` / `@req` usage in the dev guide.
- Implemented backtick-aware normalization in `normalizeCommentLine` to avoid mis-detecting inline code as annotations, with tests.
- Improved `req` annotation detection in `reqAnnotationDetection.ts` with additional heuristics and error-path coverage.
- Added `createMockSourceCode` and Story 003.0–linked tests, achieving very high coverage.

### Catch and else-if branch-annotation behavior

- **CatchClause (Story 025.0):**
  - Extended `gatherBranchCommentText` / `getBranchAnnotationInfo` to see comments before `catch` clauses and inside catch bodies.
  - Added tests for comment priority and autofix placement; removed unused imports.
  - Introduced `tests/integration/catch-annotation-prettier.integration.test.ts` (Prettier 3.6.2, including empty `catch`).
  - Enhanced `branch-annotation-helpers.ts` with `extractCommentValue` and `gatherCatchClauseCommentText`, and documented behavior in Story 025.0, rule docs, and `user-docs/api-reference.md`.

- **Else-if (Story 026.0):**
  - Implemented else-if-aware helpers (`isElseIfBranch`, parent-aware `gatherBranchCommentText` / `getBranchAnnotationInfo`).
  - Simplified parent handling using `node.parent` instead of `context.getAncestors()`.
  - Added rule tests for full `IfStatement`/`else if` coverage and autofix consistency.
  - Added `tests/integration/else-if-annotation-prettier.integration.test.ts` gated by `TRACEABILITY_EXPERIMENTAL_ELSE_IF`.
  - Refined `gatherElseIfCommentText` with targeted scanners and priority ordering; added helper tests tied to Story 026.0.

### Annotation-format performance

- For Story 005.0, added `tests/perf/valid-annotation-format-large-file.test.ts` to stress-test `traceability/valid-annotation-format` on large TS files with runtime thresholds, wired into perf and full suites.

### Plugin config and ESLint 9 alignment (Story 002)

- Re-reviewed Story 002 and ESLint flat config integration for traceability rules and tests.
- Ensured alignment with ESLint 9 patterns and schemas.
- Extended `tests/config/eslint-config-validation.test.ts` to cover runtime config errors for `traceability/valid-story-reference`.
- Marked Story 002 complete and re-ran quality checks.

### Runtime, tooling, and dependency alignment

- Validated Node/Jest/ts-jest compatibility in CI (Jest 30.2.0, ts-jest 29.4.5 on Node 22).
- Normalized dependency metadata via `npm list` and `package-lock.json`.
- Updated `package.json` `engines.node` to support Node 18.18, 20, 22, 24+ and aligned CI matrix.
- Fixed semantic-release environment variable handling and updated `README.md` and `CONTRIBUTING.md` for supported environments.
- Resolved Secretlint issues (removed `--no-color` from `security:secrets`) and re-ran full CI and secret scans.

### Rule naming and migration

- Implemented migration from `prefer-implements-annotation` to `prefer-supports-annotation` (Story 010.3):
  - Kept implementation under old key with alias.
  - Marked old name as deprecated with `replacedBy`.
  - Updated tests, docs, API reference, and migration guide, plus README.
  - Ran full quality suite.

### Ongoing quality verification

- Repeatedly ran `npm run build`, `npm test` (coverage, perf, integration), `npm run lint`, `npm run type-check`, `npm run format:check`, `ci-verify`, and security scans.
- Confirmed GitHub CI/CD runs stayed green across multiple pipeline runs.

### Formatter-focused branch tests and story alignment

- Validated Prettier integration using:
  - `tests/integration/catch-annotation-prettier.integration.test.ts`
  - `tests/integration/else-if-annotation-prettier.integration.test.ts`
- Ensured tests match `branch-annotation-helpers.ts` behavior and kept plain `else` and other branches on the “immediately before branch” comment model.
- Re-ran local quality commands and confirmed formatter-integration CI success.

### Else-if documentation updates

- Updated `docs/rules/require-branch-annotation.md` with else-if positions, precedence, autofix behavior, and test links.
- Updated `user-docs/api-reference.md` to describe formatter-aware `catch`/`else if` behavior and simpler handling for other branches.
- Extended `user-docs/migration-guide.md` with “3.2 Else-if branch annotations and formatter compatibility.”
- Updated Story 026.0 docs and Definition of Done; re-ran quality checks.

### Formatter-aware examples and cross-references

- Reviewed examples, stories, and helper code for consistency.
- Extended `user-docs/examples.md` with “Branch annotations with if/else/else-if and Prettier,” including pre/post-format examples.
- Updated `user-docs/api-reference.md` to reference these examples.
- Re-ran tests, lint, type-check, build, and format; CI run passed.

### Numeric-range guard coverage in req-annotation detection

- Reviewed `fallbackTextBeforeHasReq` guard logic in `reqAnnotationDetection.ts`.
- Added tests where `node.range` is an array but `range[0]` is non-numeric.
- Confirmed tests and CI on `main` passed.

### Extended coverage for advanced req-annotation heuristics

- Audited guards and early returns in:
  - `linesBeforeHasReq`
  - `parentChainHasReq`
  - `fallbackTextBeforeHasReq`
  - `hasReqInAdvancedHeuristics`
  - `hasReqInJsdocOrComments`
  - `hasReqAnnotation`
- Added three new `[REQ-ANNOTATION-REQ-DETECTION]` tests:
  - `linesBeforeHasReq` with preceding `@req`.
  - `parentChainHasReq` with non-callable `getCommentsBefore` and parent `@supports`.
  - JSDoc-only detection with undefined `context`.
- Achieved near-complete coverage (100% statements/functions/lines, ~98.3% branches); CI run succeeded.

### Refactor to deduplicate branch comment scanning helpers

- Used `npm run duplication` to locate duplicated scanning logic in `branch-annotation-helpers.ts`.
- Introduced `collectCommentLine` and refactored:
  - `gatherCatchClauseCommentText` fallback scan.
  - `scanElseIfBetweenConditionAndBody`.
  - `scanElseIfInsideBlockComments`.
- Preserved behavior while reducing duplication; lint/tests/type-check/build/format/duplication all passed.

### Accepting `@supports` on branches as an alternative format

- Revisited Story 004.0 / REQ-SUPPORTS-ALTERNATIVE.
- Analyzed branch-related rules and helpers (`require-branch-annotation.ts`, `branch-annotation-helpers.ts`, `require-story-io.ts`, `reqAnnotationDetection.ts` and tests/docs).
- Updated `getBranchAnnotationInfo` to:
  - Detect `hasSupports` via `/@supports\b/`.
  - Treat branch `@supports` comments as satisfying both story and req presence checks.
  - Add JSDoc `@supports` annotation linked to the requirement.
- Simplified `reportMissingAnnotations` to use `node.parent` while preserving else-if behavior.
- Extended rule tests to cover branches annotated only with `@supports` across `if`, `try/catch`, and `else-if`.
- Updated `tests/utils/branch-annotation-else-if-insert-position.test.ts` for `node.parent`.
- Updated `user-docs/api-reference.md` to clarify `@supports` behavior.
- Re-ran tests, lint, type-check, format, and build; CI/CD passed.

### Auto-fix idempotency and single-application behavior (Story 008.0)

- Reviewed Story 008.0 and relevant rules/helpers:
  - `require-story-annotation.ts`
  - `valid-annotation-format.ts`
  - `require-story-core` helpers
  - `valid-annotation-format` helpers/validators
- Documented requirements REQ-AUTOFIX-IDEMPOTENT and REQ-AUTOFIX-SINGLE-APPLICATION.
- Confirmed behavior and focused on tests/docs.
- Updated `tests/rules/auto-fix-behavior-008.test.ts` to:
  - Add `@req` and `@supports` annotations for traceability.
  - Cover no-op reruns and single-application fixes for missing `@story`.
  - Show single `.story.md` suffix correction for `valid-annotation-format`.
- Updated Story 008.0 docs and DoD; ran focused Jest and `ci-verify:fast`; CI passed.

### Formatter integration tests and Jest config verification

- Reviewed `jest.config.js` for `ts-jest` preset, test matching, coverage thresholds, ignore patterns, and Jest 30 compatibility.
- Analyzed and ran Prettier integration tests for `catch` and `else-if`.
- Verified:
  - Catch+Prettier tests are robust and passing.
  - Else-if+Prettier tests are environment-gated and safely skipped by default.
  - Prettier CLI resolution (`prettier@3.6.2`) is correct.
- Confirmed helper/unit test paths already covered.
- Ran full Jest suite and `ci-verify:fast`; CI run succeeded.

### Shared helper for branch comment line detection

- Inspected `branch-annotation-helpers.ts` and `require-story-core` helpers and their tests.
- Identified duplicated formatter-aware comment-line detection code.
- Introduced `getCommentTextAtLine` in `branch-annotation-helpers.ts` to centralize comment-text extraction for a given line index.
- Refactored:
  - `collectCommentLine` to use `getCommentTextAtLine`.
  - `scanElseIfPrecedingComments` to call `getCommentTextAtLine`.
- Kept catch-block fallback scans routed through `collectCommentLine`.
- Re-ran full checks; CI/CD run passed with improved duplication metrics.

### Extended dogfooding validation integration coverage

- Reviewed `tests/integration/dogfooding-validation.test.ts`, Story 023, `eslint.config.js`, Jest config, and related config tests.
- Confirmed existing tests:
  - `[REQ-DOGFOODING-TEST]` checks `traceability/require-story-annotation` is `"error"` in the TS block of `eslint.config.js`.
  - `[REQ-DOGFOODING-CI]` runs ESLint CLI against an unannotated TS snippet and asserts a non-zero exit and an error referencing `src/dogfood.ts`.
- Added two new integration tests in `tests/integration/dogfooding-validation.test.ts`:
  - `[REQ-DOGFOODING-VERIFY]` ensures the TS config block exists and has at least one `traceability/` rule.
  - `[REQ-DOGFOODING-PRESET]` verifies `configs.recommended` can be used with the plugin in a flat config via `FlatESLint` without throwing, and that lint results contain messages.
- Updated JSDoc `@supports` at the top of the file and per-test, referencing Story 023.
- Ran targeted and full Jest with coverage, plus lint, type-check, and `format:check`, and formatted the modified test file.
- Staged and committed as `test: extend dogfooding validation integration coverage`, pushed to `main`, and confirmed the GitHub Actions **CI/CD Pipeline** workflow completed successfully.

### Configurable patterns story completion

- Investigated Story 010.1 (configurable patterns) and the current implementation by reviewing:
  - `docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md`
  - `valid-annotation-options.ts`, `valid-annotation-utils.ts`
  - `valid-annotation-format-validators.ts`, `valid-annotation-format.ts`
  - `valid-story-reference.ts` and its helpers/tests
  - Related docs: `docs/rules/valid-annotation-format.md`, `user-docs/api-reference.md`, `user-docs/migration-guide.md`
- Verified that:
  - Configurable pattern options (nested and flat) and examples are implemented with backward compatibility.
  - Schema validation exists and is tested with invalid configurations.
  - Invalid regex patterns are detected and reported via `invalidRuleConfiguration`.
  - Example messages are configurable and tested.
  - Integration with `valid-story-reference` behavior is consistent and covered by tests.
- Confirmed an earlier “Assignment to constant variable” assessment error is no longer reproducible by searching for the message and running focused Jest on `valid-annotation-format` and `valid-story-reference` tests.
- Determined that the story’s functional requirements and acceptance criteria are fully met by existing code/tests and that the remaining gap was only in the story document’s Definition of Done checkboxes.
- Updated `docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md` to mark all remaining DoD items as completed (checked the items for acceptance criteria, schema validation tests, integration tests, and GitHub issue #1).
- Staged and committed the doc change as `docs: mark configurable patterns story as complete`.
- Ran `npm run ci-verify -- --runInBand` locally (build, tests, lint, type-check, formatting, duplication, security, etc.), all of which passed.
- Pushed to `main` and confirmed the **CI/CD Pipeline** GitHub Actions workflow completed successfully.

### Most recent work: extending req-annotation detection coverage

- Used repository tooling to:
  - Inspect `src/utils/reqAnnotationDetection.ts` and its line ranges.
  - Locate existing tests using `find_files` and `list_directory` under `tests` (notably `tests/utils/req-annotation-detection.test.ts`).
- Ran focused Jest commands to gather coverage for `reqAnnotationDetection.ts`.
- Reviewed implementation details of:
  - `hasReqAnnotation(jsdoc, comments, context?, node?)`
  - `hasReqInAdvancedHeuristics(sourceCode, node)`
  - `linesBeforeHasReq`, `parentChainHasReq`, and `fallbackTextBeforeHasReq`.
- Identified that previously:
  - The positive paths in `hasReqAnnotation` driven by `linesBeforeHasReq` and `parentChainHasReq` were not directly exercised.
- Modified `tests/utils/req-annotation-detection.test.ts` by adding two new tests near the end of the main `describe` block to cover:
  - A scenario where `hasReqAnnotation` returns `true` via `linesBeforeHasReq`:
    - Used `createMockSourceCode` with a `@req` line immediately preceding the function line.
    - Ensured `jsdoc` and inline comments did not contain `@req` / `@supports`.
    - Confirmed `hasReqAnnotation` returns `true` based on the advanced heuristic.
  - A scenario where `hasReqAnnotation` returns `true` via `parentChainHasReq`:
    - Simulated a `sourceCode.getCommentsBefore` that returns a comment containing `@req` for a specific ancestor node in the parent chain.
    - Ensured JSDoc/comments were free of `@req` / `@supports`.
    - Confirmed `hasReqAnnotation` returns `true` solely from the parent-chain heuristic.
- Ensured traceability by using the existing `[REQ-ANNOTATION-REQ-DETECTION]` tag in the new test names, aligning them with Story 003.0.
- Ran focused coverage for this file:
  - `npm test tests/utils/req-annotation-detection.test.ts -- --runInBand --coverage --collectCoverageFrom=src/utils/reqAnnotationDetection.ts`
  - Then `npx jest --coverage --runInBand --collectCoverageFrom=src/utils/reqAnnotationDetection.ts tests/utils/req-annotation-detection.test.ts --coverageReporters=json-summary`.
- Inspected `coverage/coverage-summary.json` to confirm:
  - Statements and lines reached 100% for `reqAnnotationDetection.ts` in the full-suite run.
  - Branch coverage improved to ~98.3%, with only a minor defensive branch remaining uncovered.
- Verified that the new tests specifically hit the previously uncovered advanced-heuristic “true” branches in `hasReqAnnotation`.
- Used `git diff` to review changes, then:
  - Staged them with `git add .`.
  - Committed as `test: extend req-annotation detection coverage`.
- Ran the full local CI gate:
  - `npm run ci-verify -- --runInBand` (build, tests, lint, type-check, format check, duplication, security).
- Pushed changes with `git push`.
- Waited for the GitHub Actions **CI/CD Pipeline** workflow to complete and confirmed it finished successfully, indicating the repository remains in a passing state with the new coverage tests in place.

**Most recently we've executed the following action:**

---
Used tool: read_file with input: {"filePath":"docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md"}
Used tool: search_file_content with input: {"filePath":"docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md","pattern":"linesBeforeHasReq","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md","pattern":"parentChainHasReq","isRegex":false}
Used tool: find_files with input: {"pattern":"*.test.ts","directory":"tests"}
Used tool: search_file_content with input: {"filePath":"docs","pattern":"req-detection","isRegex":false}
Used tool: find_files with input: {"pattern":"*.md","directory":"docs"}
Used tool: search_file_content with input: {"filePath":"docs","pattern":"linesBeforeHasReq","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs","pattern":"parentChainHasReq","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src","pattern":"linesBeforeHasReq","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src","pattern":"parentChainHasReq","isRegex":false}
Used tool: find_files with input: {"pattern":"*req-annotation*.test.ts","directory":"tests"}
Used tool: search_file_content with input: {"filePath":"tests/utils/req-annotation-detection.test.ts","pattern":"linesBeforeHasReq","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/utils/req-annotation-detection.test.ts","pattern":"parentChainHasReq","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/utils/req-annotation-detection.test.ts","pattern":"@supports","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/utils/req-annotation-detection.test.ts","pattern":"003.0-DEV-FUNCTION-ANNOTATIONS","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs","pattern":"REQ-ANNOTATION-REQ-DETECTION","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs","pattern":"reqAnnotationDetection","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs","pattern":"linesBeforeHasReq","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs","pattern":"parentChainHasReq","isRegex":false}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: search_file_content with input: {"filePath":"docs/custom-rules-development-guide.md","pattern":"reqAnnotationDetection","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs/custom-rules-development-guide.md","pattern":"advanced req-detection","isRegex":false}
Used tool: modify_file with input: {"filePath":"docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md","instruction":"In the \"Requirements (Current Implementation or To Be Implemented)\" section, after the existing bullet for **REQ-JSDOC-PARSING**, insert a new requirement describing the advanced req-detection heuristics and their tested status. The new bullet should read exactly:\n\n- **REQ-ANNOTATION-REQ-DETECTION**: Implement and test advanced detection heuristics in the req-annotation utilities so that @req (or equivalent @supports) markers are discovered even when not present in the immediate JSDoc block, including:\n  - `linesBeforeHasReq` to scan preceding source lines for @req markers in comments\n  - `parentChainHasReq` to traverse parent AST nodes (and their leading comments) when direct JSDoc parsing does not find a req\n  - `hasReqAnnotation` orchestration logic that first checks direct JSDoc/@supports annotations, then falls back to these heuristics\n  These heuristics MUST be covered by dedicated unit tests to guard against regressions."}
Used tool: modify_file with input: {"filePath":"docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md","instruction":"In the \"Definition of Done\" checklist, change the items for tests and presets to indicate they are now complete. Specifically:\n- Replace \"- [ ] Tests written and passing (comprehensive RuleTester coverage)\" with \"- [x] Tests written and passing (comprehensive RuleTester coverage, including advanced req-detection heuristics such as linesBeforeHasReq and parentChainHasReq)\".\n- Replace \"- [ ] Rule integrated into plugin configuration presets\" with \"- [x] Rule integrated into plugin configuration presets\"."}
Used tool: search_file_content with input: {"filePath":"docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md","pattern":"REQ-ANNOTATION-REQ-DETECTION","isRegex":false}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"docs: document advanced req-detection heuristics for function annotations"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--bail"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
Used tool: run_command with input: {"command":"grep","args":["-R","-n","linesBeforeHasReq","docs"]}
Used tool: run_command with input: {"command":"grep","args":["-R","-n","parentChainHasReq","docs"]}
Used tool: run_command with input: {"command":"grep","args":["-R","-n","reqAnnotationDetection","docs"]}
---

**This was the result:**
---
Here’s the updated status and what I did.

## Executed Tasks

### ✅ NOW

- [x] Update the function-annotations story document so that it explicitly states that the advanced req-detection heuristics are now covered by dedicated tests and marks the corresponding acceptance-criteria or Definition of Done items as complete.

**What I changed**

File: `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md`

1. **Added a new requirement describing the advanced heuristics and their test coverage** under “Requirements (Current Implementation or To Be Implemented)”:

```md
- **REQ-ANNOTATION-REQ-DETECTION**: Implement and test advanced detection heuristics in the req-annotation utilities so that @req (or equivalent @supports) markers are discovered even when not present in the immediate JSDoc block, including:
  - `linesBeforeHasReq` to scan preceding source lines for @req markers in comments
  - `parentChainHasReq` to traverse parent AST nodes (and their leading comments) when direct JSDoc parsing does not find a req
  - `hasReqAnnotation` orchestration logic that first checks direct JSDoc/@supports annotations, then falls back to these heuristics
  These heuristics MUST be covered by dedicated unit tests to guard against regressions.
```

2. **Updated the Definition of Done to mark tests and preset integration as complete**, explicitly referencing the heuristics:

Before:

```md
- [ ] Tests written and passing (comprehensive RuleTester coverage)
- [ ] Rule integrated into plugin configuration presets
```

After:

```md
- [x] Tests written and passing (comprehensive RuleTester coverage, including advanced req-detection heuristics such as linesBeforeHasReq and parentChainHasReq)
- [x] Rule integrated into plugin configuration presets
```

These updates align the story with the existing tests in `tests/utils/req-annotation-detection.test.ts`, which already exercise `linesBeforeHasReq`, `parentChainHasReq`, and `hasReqAnnotation`, and with the plugin’s current configuration presets.

I committed this as:

```text
docs: document advanced req-detection heuristics for function annotations
```

(type `docs`, since changes are documentation-only).


### ✅ NEXT

- [x] Review the requirement IDs and descriptions in the function-annotations story to ensure they match the behaviors exercised by the new req-annotation detection tests and adjust wording where necessary for clarity.
- [x] Check any related development documentation that references the advanced req-detection heuristics to confirm it no longer suggests these paths are untested or experimental, updating the language to reflect their tested status.

**What I verified and adjusted**

1. **Requirement IDs and descriptions vs tests**

   - Confirmed that the new `REQ-ANNOTATION-REQ-DETECTION` requirement corresponds to the behaviors covered in `tests/utils/req-annotation-detection.test.ts`:
     - Tests explicitly exercising:
       - `linesBeforeHasReq` (multiple tests by name).
       - `parentChainHasReq` (multiple tests by name).
       - `hasReqAnnotation` behavior when these heuristics are used.
     - File-level `@supports` header already ties this test file to `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION`.

   - The existing requirements in the story (`REQ-FUNCTION-DETECTION`, `REQ-JSDOC-PARSING`, `REQ-ANNOTATION-REQUIRED`, `REQ-CONFIGURABLE-SCOPE`, `REQ-EXPORT-PRIORITY`, `REQ-ERROR-LOCATION`, `REQ-TYPESCRIPT-SUPPORT`) already match:
     - Rule implementations and schemas in `src/rules/require-story-annotation.ts` and `src/rules/require-req-annotation.ts`.
     - The function-detection and JSDoc parsing utilities in `src/utils/reqAnnotationDetection.ts`.
     - Their corresponding tests in:
       - `tests/rules/require-story-annotation.test.ts`
       - `tests/rules/require-req-annotation.test.ts`
       - `tests/utils/req-annotation-detection.test.ts`

   - No additional ID renames were necessary; instead I added the new requirement and clarified the Definition of Done to explicitly mention the advanced heuristics and their test coverage.

2. **Related dev documentation**

   - Searched `docs/` for references to the heuristics and utilities:

     - `grep -R -n linesBeforeHasReq docs`
     - `grep -R -n parentChainHasReq docs`
     - `grep -R -n reqAnnotationDetection docs`

   - Results:
     - `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md` now includes the explicit bullet for `linesBeforeHasReq`/`parentChainHasReq` and the DoD note about their coverage.
     - `docs/code-quality-core-review-scope.md` and `docs/code-quality-refactor-opportunities-2025-12-03.md` only mention `src/utils/reqAnnotationDetection.ts` in a neutral way (as part of the codebase’s scope and prior refactor opportunities), not as untested or experimental.
     - `docs/custom-rules-development-guide.md` does not reference `reqAnnotationDetection` or describe the advanced heuristics as experimental.

   - Conclusion: there were no other documents still suggesting that these heuristics were untested or experimental, so the story update was sufficient to align the documentation with the current implementation and tests.

## Quality Checks Performed

After making the documentation changes and committing:

- `npm test -- --runInBand --bail` ✅
- `npm run lint` ✅
- `npm run type-check` ✅
- `npm run build` ✅
- `npm run format:check` ✅

Pre-push hooks also ran `npm run ci-verify:full` and `npm run security:secrets` successfully as part of `git push`.

CI/CD status:

- The “CI/CD Pipeline” workflow run triggered by this push (ID `20004971795`) completed with conclusion **success**.

## Updated Plan

Here is the original plan with NOW and NEXT items updated:

## NOW

- [x] Update the function-annotations story document so that it explicitly states that the advanced req-detection heuristics are now covered by dedicated tests and marks the corresponding acceptance-criteria or Definition of Done items as complete.

## NEXT

- [x] Review the requirement IDs and descriptions in the function-annotations story to ensure they match the behaviors exercised by the new req-annotation detection tests and adjust wording where necessary for clarity.
- [x] Check any related development documentation that references the advanced req-detection heuristics to confirm it no longer suggests these paths are untested or experimental, updating the language to reflect their tested status.

## LATER

- [ ] Scan coverage reports for other minor uncovered branches in core helper modules and plan similarly small, focused test additions to close those gaps incrementally.
- [ ] Standardize the use of @supports traceability annotations in any remaining legacy test files that still rely only on @story/@req so they match the preferred format.
- [ ] Revisit the else-if single-line annotation support story and design the implementation and tests needed to fully satisfy that requirement once the current coverage and documentation updates are complete.
---
