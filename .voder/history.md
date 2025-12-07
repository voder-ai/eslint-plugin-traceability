Here’s a history-only summary of what’s been done so far on the project, including the most recent work, with all forward-looking content removed:

---

### Core rule internals and performance

- Refactored `valid-req-reference` internals into `valid-req-reference-helpers.ts`, separating parsing, validation, traversal, and I/O, and documented the helper-module pattern.
- Optimized `require-branch-annotation` for nested branches so autofix targets the correct inner branch.
- Added nested-branch tests and Jest performance tests for large files, updated `RuleTester` expectations, and re-ran full quality suites.

### Tests, CI, and maintenance tooling

- Debugged Jest/CI issues (e.g., missing `node_modules`) and verified `ci-verify:full` on stable paths.
- Cleaned up `src/maintenance/*.ts` (e.g., removed redundant `fs.statSync`) and expanded `verify` tests to cover exit codes, no-op behavior, and permissions.
- Simplified `update.ts` using `getAllFiles`, extended performance tests, updated `.voder/plan.md`, and confirmed CI success.

### Dogfooding and traceability enforcement

- Completed a full dogfooding pass (Story 023) across stories, problems, rules, scripts, and checks.
- Enabled `traceability/require-story-annotation` for TypeScript in `eslint.config.js`, tuned overrides, and validated behavior via `report:eslint-suppressions`.
- Added `tests/integration/dogfooding-validation.test.ts` to enforce story annotations across the repo.
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
- Improved `@req` annotation detection in `reqAnnotationDetection.ts` with additional heuristics and error-path coverage.
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
- Updated `package.json` `engines.node` to support Node 18.18, 20, 22, 24+ and aligned the CI matrix.
- Fixed semantic-release environment variable handling and updated `README.md` and `CONTRIBUTING.md` for supported environments.
- Resolved Secretlint issues (removed `--no-color` from `security:secrets`) and re-ran full CI and secret scans.

### Rule naming and migration

- Implemented migration from `prefer-implements-annotation` to `prefer-supports-annotation` (Story 010.3):
  - Kept implementation under old key with alias.
  - Marked old name as deprecated with `replacedBy`.
  - Updated tests, docs, API reference, migration guide, and README.
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
- Added three new `[REQ-ANNOTATION-REQ-DETECTION]` tests to cover:
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
- Analyzed branch-related rules and helpers:
  - `require-branch-annotation.ts`
  - `branch-annotation-helpers.ts`
  - `require-story-io.ts`
  - `reqAnnotationDetection.ts`
  - Related tests/docs.
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
- Focused on tests and docs to confirm:
  - No-op reruns when fixes already applied.
  - Single-application fixes for missing `@story`.
  - Single `.story.md` suffix correction in `valid-annotation-format`.
- Updated `tests/rules/auto-fix-behavior-008.test.ts` with `@req`/`@supports` annotations and additional coverage.
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
  - `[REQ-DOGFOODING-TEST]` ensures `traceability/require-story-annotation` is `"error"` in the TS block of `eslint.config.js`.
  - `[REQ-DOGFOODING-CI]` runs ESLint CLI against an unannotated TS snippet and asserts a non-zero exit and an error referencing `src/dogfood.ts`.
- Added integration tests:
  - `[REQ-DOGFOODING-VERIFY]` to ensure the TS config block exists with at least one `traceability/` rule.
  - `[REQ-DOGFOODING-PRESET]` to verify `configs.recommended` can be used with the plugin in a flat config via `FlatESLint` and produces messages.
- Updated JSDoc `@supports` references to Story 023.
- Ran targeted and full Jest with coverage, plus lint, type-check, and `format:check`; formatted the modified test file.
- Committed as `test: extend dogfooding validation integration coverage`, pushed to `main`, and confirmed CI success.

### Configurable patterns story completion

- Investigated Story 010.1 (configurable patterns) by reviewing rule implementations, helpers, and docs.
- Verified:
  - Configurable pattern options (nested and flat) with backward compatibility.
  - Schema validation and tests for invalid configurations.
  - Detection and reporting of invalid regex patterns via `invalidRuleConfiguration`.
  - Configurable example messages and integration with `valid-story-reference`.
- Confirmed a prior “Assignment to constant variable” assessment error was no longer reproducible.
- Determined all functional requirements and acceptance criteria were already met; remaining gap was in the story’s DoD checkboxes.
- Updated `docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md` to mark all remaining DoD items as complete.
- Committed as `docs: mark configurable patterns story as complete`, ran `npm run ci-verify -- --runInBand`, pushed to `main`, and confirmed CI success.

### Extending req-annotation detection coverage

- Used repo tooling to inspect `src/utils/reqAnnotationDetection.ts` and find existing tests in `tests/utils/req-annotation-detection.test.ts`.
- Ran focused Jest coverage for `reqAnnotationDetection.ts`.
- Reviewed implementations of:
  - `hasReqAnnotation(jsdoc, comments, context?, node?)`
  - `hasReqInAdvancedHeuristics(sourceCode, node)`
  - `linesBeforeHasReq`, `parentChainHasReq`, `fallbackTextBeforeHasReq`.
- Identified previously unexercised positive paths in `hasReqAnnotation` driven by `linesBeforeHasReq` and `parentChainHasReq`.
- Added two new tests to `tests/utils/req-annotation-detection.test.ts`:
  - One where `hasReqAnnotation` returns `true` via `linesBeforeHasReq` using `createMockSourceCode` with a `@req` line preceding the function and no `@req`/`@supports` in JSDoc/inline comments.
  - One where `hasReqAnnotation` returns `true` via `parentChainHasReq` by simulating `sourceCode.getCommentsBefore` returning a `@req` comment on an ancestor, again without direct JSDoc/inline `@req`/`@supports`.
- Tagged new tests with `[REQ-ANNOTATION-REQ-DETECTION]` for Story 003.0 traceability.
- Ran focused coverage commands and verified:
  - 100% statements/lines for `reqAnnotationDetection.ts` in full-suite runs.
  - Branch coverage ~98.3%, with only a minor defensive branch uncovered.
- Staged and committed as `test: extend req-annotation detection coverage`, ran `npm run ci-verify -- --runInBand`, pushed, and confirmed CI success.

### Documenting advanced req-detection heuristics

- Inspected and searched docs and tests for `linesBeforeHasReq`, `parentChainHasReq`, `reqAnnotationDetection`, and related tags.
- Updated `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md` to document the advanced req-detection heuristics and their tested status:
  - Added requirement **REQ-ANNOTATION-REQ-DETECTION** describing:
    - `linesBeforeHasReq` scanning preceding source lines for `@req`.
    - `parentChainHasReq` traversing parent AST nodes and leading comments.
    - `hasReqAnnotation` orchestration logic (direct JSDoc/@supports first, then heuristics).
    - Dedicated unit tests to guard against regressions.
  - Updated Definition of Done checklist to mark tests (including advanced heuristics) and preset integration as complete.
- Confirmed alignment between the new requirement and existing tests in `tests/utils/req-annotation-detection.test.ts`, ensuring file-level `@supports` annotations reference the updated story and requirement ID.
- Searched `docs/` to ensure no other documentation described these heuristics as untested or experimental.
- Staged and committed as `docs: document advanced req-detection heuristics for function annotations`.
- Ran `npm test -- --runInBand --bail`, `npm run lint`, `npm run type-check`, `npm run build`, and `npm run format:check`; pushed changes and verified CI/CD pipeline success.

### Most recent work: shared helpers for branch scanning and safe reporting

- Inspected:
  - `src/rules/helpers/branch-annotation-helpers.ts`
  - `src/utils/branch-annotation-helpers.ts`
  - `.gitignore`, `.voderignore`
  - `package.json`
  - Branch-annotation-related test files in `tests/utils/`.
- Ran `npm run duplication` to identify duplicated logic.

**Shared line-based comment scanning helper:**

- In `src/utils/branch-annotation-helpers.ts`:
  - Added `scanCommentLinesInRange`, a new helper that:
    - Scans contiguous, formatter-aware comment lines between 0-based start/end indices.
    - Uses `collectCommentLine` internally.
    - Is annotated with `@supports` links for the core branch, catch, and else-if stories.
  - Refactored the **catch** branch fallback in `gatherCatchClauseCommentText` to delegate to `scanCommentLinesInRange` instead of an inline `while` loop, preserving:
    - Start at the line after the block start.
    - Scan through the body until a non-comment or blank line.
  - Refactored `scanElseIfBetweenConditionAndBody` to:
    - Compute `startIndex` and `endIndexExclusive` from `loc.line`.
    - Call `scanCommentLinesInRange` for the appropriate range.
    - Maintain existing behavior for else-if comment detection.

**Shared safe-reporting helper in `require-story-core`:**

- In `src/rules/helpers/require-story-core.ts`:
  - Added `withSafeReporting(label, fn)`:
    - Wraps reporting operations in a try/catch.
    - When `TRACEABILITY_DEBUG=1`, logs a diagnostic to stderr via `console.error`.
    - Annotated with `@supports` Story 007.0 (REQ-ERROR-RESILIENCE).
  - Refactored `coreReportMissing` to:
    - Use `withSafeReporting("coreReportMissing", () => { … })`.
    - Preserve existing behavior: skip when already annotated, resolve target/name node, build template config, and report with appropriate fixes/suggestions.
  - Refactored `coreReportMethod` similarly to:
    - Use `withSafeReporting("coreReportMethod", () => { … })`.
    - Preserve logic for resolving target, extracting name, determining template and autofix, and reporting suggestions.
  - Removed the inline `eslint-disable-next-line no-console` in favor of a plain `console.error` plus a clarifying comment (leaving enforcement to the existing ESLint configuration).

**Verification and CI:**

- Ran:
  - `npm test -- --runInBand --ci`
  - `npm run lint -- --max-warnings=0`
  - `npm run duplication`
  - `npm run type-check`
  - `npm run format:check`
  - `npm run build`
  - `npm run format -- src/rules/helpers/require-story-core.ts src/utils/branch-annotation-helpers.ts`
  - `npm run format:check` again after formatting.
- Staged all changes, committed as  
  `refactor: extract shared helpers for branch comment scanning and safe reporting`.
- Pushed changes and triggered the GitHub “CI/CD Pipeline” workflow, then waited for it to complete successfully.

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"."}
Used tool: find_files with input: {"pattern":"require-story-core.*","directory":"src"}
Used tool: get_git_status with input: {}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"coreReport","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"context.report","isRegex":false}
Used tool: find_files with input: {"pattern":"*require-story*.test.*","directory":"tests"}
Used tool: find_files with input: {"pattern":"*require-story*","directory":"tests"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core-edgecases.test.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-helpers-edgecases.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core-edgecases.test.ts"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"missingStory","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts","pattern":"coreReport","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-story-core.test.ts","pattern":"coreReport","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests","pattern":"withSafeReporting","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"withSafeReporting","isRegex":false}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-core.ts","instruction":"After the withSafeReporting function, insert a new helper that centralizes construction of the missing-story report descriptor, and then refactor coreReportMissing and coreReportMethod to use it and, for coreReportMethod, to delegate template/auto-fix computation to deps.buildTemplateConfig. Specifically:\n\n1) Immediately after the withSafeReporting function, add:\n\n/**\n * Build the shared ESLint report descriptor for a missing @story annotation.\n * This keeps the core helpers focused on computing names, targets, and\n * templates while centralizing the diagnostic wiring.\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ERROR-SPECIFIC\n * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-RESILIENCE\n */\nfunction createMissingStoryReportDescriptor(\n  nameNode: any,\n  name: string,\n  resolvedTarget: any,\n  effectiveTemplate: string,\n  allowFix: boolean,\n  createFix: (_target: any, _annotationTemplate: string) => any,\n) {\n  const baseFix = createFix(resolvedTarget, effectiveTemplate);\n\n  return {\n    node: nameNode,\n    messageId: \"missingStory\" as const,\n    data: { name, functionName: name },\n    fix: allowFix ? baseFix : undefined,\n    suggest: [\n      {\n        desc: `Add JSDoc @story annotation for function '${name}', e.g., ${effectiveTemplate}`,\n        fix: baseFix,\n      },\n    ],\n  };\n}\n\n2) In coreReportMissing, replace the inline context.report({ ... }) call with a call to the new helper:\n\n- Keep all existing logic up to `const name = functionName;`.\n- Replace the context.report block with:\n\n    context.report(\n      createMissingStoryReportDescriptor(\n        nameNode,\n        name,\n        resolvedTarget,\n        effectiveTemplate,\n        allowFix,\n        deps.createAddStoryFix,\n      ),\n    );\n\n3) In coreReportMethod, change the template/auto-fix computation to use deps.buildTemplateConfig and route the final reporting through the shared helper:\n\n- After computing resolvedTarget, name, and nameNode, replace the effectiveTemplate/allowFix lines and the context.report block with:\n\n    const { effectiveTemplate, allowFix } = deps.buildTemplateConfig(options);\n\n    context.report(\n      createMissingStoryReportDescriptor(\n        nameNode,\n        name,\n        resolvedTarget,\n        effectiveTemplate,\n        allowFix,\n        deps.createMethodFix,\n      ),\n    );"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-core.ts","instruction":"Refactor createMissingStoryReportDescriptor to accept a single configuration object instead of six positional parameters, so that it complies with max-params (4). Specifically:\n\n1) Change the function signature to:\n\nfunction createMissingStoryReportDescriptor(config: {\n  nameNode: any;\n  name: string;\n  resolvedTarget: any;\n  effectiveTemplate: string;\n  allowFix: boolean;\n  createFix: (_target: any, _annotationTemplate: string) => any;\n}) {\n\n2) Inside the function, destructure the config at the top:\n\n  const { nameNode, name, resolvedTarget, effectiveTemplate, allowFix, createFix } = config;\n\n3) Keep the rest of the body the same, using the destructured variables.\n\n4) Update the two call sites in coreReportMissing and coreReportMethod to pass a single object argument instead of positional parameters, e.g.:\n\n    createMissingStoryReportDescriptor({\n      nameNode,\n      name,\n      resolvedTarget,\n      effectiveTemplate,\n      allowFix,\n      createFix: deps.createAddStoryFix,\n    })\n\nand similarly for the method variant with createFix: deps.createMethodFix."}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","src/rules/helpers/require-story-core.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: centralize missing-story report descriptor logic"}
Used tool: read_file with input: {"filePath":"tests/rules/error-reporting.test.ts"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"TRACEABILITY_DEBUG","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"createMissingStoryReportDescriptor(","isRegex":false}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: rely on shared missing-story report descriptor behavior"}
Used tool: search_file_content with input: {"filePath":"tests/rules/error-reporting.test.ts","pattern":"TRACEABILITY_DEBUG","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests","pattern":"TRACEABILITY_DEBUG","isRegex":false}
Used tool: get_git_status with input: {}
Used tool: read_file with input: {"filePath":"tests/rules/error-reporting.test.ts"}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: centralize missing-story report descriptor logic"}
Used tool: find_files with input: {"pattern":"*.test.*","directory":"tests"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"withSafeReporting","isRegex":false}
Used tool: get_git_status with input: {}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts","pattern":"coreReport","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts","pattern":"withSafeReporting","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/rules","pattern":"hasStoryAnnotation failed","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests","pattern":"TRACEABILITY_DEBUG","isRegex":false}
Used tool: modify_file with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts","instruction":"Update this test file to cover the new shared report descriptor helper and error-resilience behavior:\n\n1) In the file-level JSDoc, add an additional @supports line so the header becomes:\n\n/**\n * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-AUTOFIX - Cover additional branch cases in require-story-core (addStoryFixer/reportMissing)\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-AUTOFIX\n * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-RESILIENCE\n */\n\n2) Extend the import from require-story-core so that it imports coreReportMissing in addition to createAddStoryFix:\n\n- Change:\nimport { createAddStoryFix } from \"../../src/rules/helpers/require-story-core\";\n\n- To:\nimport {\n  createAddStoryFix,\n  coreReportMissing,\n} from \"../../src/rules/helpers/require-story-core\";\n\n3) At the end of the existing describe block, add a new test that verifies error-resilient behavior when the dependency chain throws inside the reporting helper:\n\n  test(\"coreReportMissing swallows dependency errors and does not break lint run\", () => {\n    const deps: any = {\n      hasStoryAnnotation: () => {\n        throw new Error(\"boom\");\n      },\n      getReportedFunctionName: () => \"fnX\",\n      resolveAnnotationTargetNode: () => ({ type: \"FunctionDeclaration\" }),\n      getNameNodeForReport: (node: any) => node,\n      buildTemplateConfig: () => ({\n        effectiveTemplate:\n          \"/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\",\n        allowFix: true,\n      }),\n      extractName: () => \"fnX\",\n      getAnnotationTemplate: () =>\n        \"/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\",\n      shouldApplyAutoFix: () => true,\n      createAddStoryFix: () => () => ({}),\n      createMethodFix: () => () => ({}),\n    };\n\n    const context: any = {\n      report: jest.fn(),\n    };\n\n    const node: any = { type: \"FunctionDeclaration\" };\n\n    expect(() =>\n      coreReportMissing(deps, context as any, {} as any, { node }),\n    ).not.toThrow();\n\n    expect(context.report).not.toHaveBeenCalled();\n  });\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","tests/rules/require-story-core.autofix.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: cover error-resilient core report helper behavior"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","ci-verify"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":20005795067,"timeout":600000}
---

**This was the result:**
---
Here’s what I implemented for the ##NOW and ##NEXT items and how the plan stands now.

---

## What I changed

### 1) Analyze core error‑reporting helpers (##NOW)

File inspected: `src/rules/helpers/require-story-core.ts`.

Findings:

- There was duplicated logic between `coreReportMissing` and `coreReportMethod`:
  - Both built essentially the same ESLint report descriptor:
    - `node`
    - `messageId: "missingStory"`
    - `data: { name, functionName: name }`
    - `fix` based on an autofix toggle and a computed template
    - `suggest` array with the same description pattern and fix.
- `coreReportMissing` already used a dependency-provided `buildTemplateConfig`, while `coreReportMethod` manually combined `getAnnotationTemplate` + `shouldApplyAutoFix`, even though the helpers already had `buildTemplateConfig`.
- Error resilience was centralized in `withSafeReporting`, but there was no direct test that simulated a dependency failure within the core helpers.

Decision for minimal refactor:

- Introduce a single shared helper that:
  - Builds the missing‑story report descriptor (message/data/fix/suggest) from inputs.
  - Is parameterized by a “create fix” function so it can be reused for both function and method cases.
- Make `coreReportMethod` use the same `buildTemplateConfig` path as `coreReportMissing`, clarifying template/autofix behavior and reducing divergence.
- Add a focused test to exercise the error‑resilience behavior when a dependency throws inside `coreReportMissing`.

This refactor keeps external behavior intact (same message IDs, data shapes, suggestion text, and autofix behavior), but removes localized duplication and clarifies the structure.

---

### 2) Refactor: shared report descriptor helper (##NEXT – helper introduction)

**File:** `src/rules/helpers/require-story-core.ts`

#### New helper

I added a shared helper immediately after `withSafeReporting`:

```ts
/**
 * Build the shared ESLint report descriptor for a missing @story annotation.
 * This keeps the core helpers focused on computing names, targets, and
 * templates while centralizing the diagnostic wiring.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ERROR-SPECIFIC
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-RESILIENCE
 */
function createMissingStoryReportDescriptor(config: {
  nameNode: any;
  name: string;
  resolvedTarget: any;
  effectiveTemplate: string;
  allowFix: boolean;
  createFix: (_target: any, _annotationTemplate: string) => any;
}) {
  const {
    nameNode,
    name,
    resolvedTarget,
    effectiveTemplate,
    allowFix,
    createFix,
  } = config;

  const baseFix = createFix(resolvedTarget, effectiveTemplate);

  return {
    node: nameNode,
    messageId: "missingStory" as const,
    data: { name, functionName: name },
    fix: allowFix ? baseFix : undefined,
    suggest: [
      {
        desc: `Add JSDoc @story annotation for function '${name}', e.g., ${effectiveTemplate}`,
        fix: baseFix,
      },
    ],
  };
}
```

This encapsulates:

- The canonical `missingStory` descriptor wiring.
- Shared suggestion text (still matches the rule tests exactly).
- Fix creation logic, while remaining agnostic to whether it’s a function or method case via `createFix`.

#### Updated `coreReportMissing`

Before: it performed its own `context.report({ ... })` descriptor construction inline.

Now:

```ts
export function coreReportMissing(
  deps: ReportDeps,
  context: Rule.RuleContext,
  sourceCode: any,
  config: { node: any; target?: any; options?: CoreReportOptions },
): void {
  const { node, target: passedTarget, options = {} } = config;

  withSafeReporting("coreReportMissing", () => {
    if (deps.hasStoryAnnotation(sourceCode, node)) {
      return;
    }

    const functionName = deps.getReportedFunctionName(node);
    const resolvedTarget = deps.resolveAnnotationTargetNode(
      sourceCode,
      node,
      passedTarget,
    );
    const nameNode = deps.getNameNodeForReport(node);
    const { effectiveTemplate, allowFix } = deps.buildTemplateConfig(options);
    const name = functionName;

    context.report(
      createMissingStoryReportDescriptor({
        nameNode,
        name,
        resolvedTarget,
        effectiveTemplate,
        allowFix,
        createFix: deps.createAddStoryFix,
      }),
    );
  });
}
```

Behavioral equivalence:

- `hasStoryAnnotation`, `getReportedFunctionName`, `resolveAnnotationTargetNode`, `getNameNodeForReport`, and `buildTemplateConfig` are still used exactly as before.
- `messageId` and `data` remain `{ name, functionName: name }`.
- `fix` is still conditional on `allowFix`; the underlying fixer is now created once and reused for both the main fix and the suggestion, which is harmless.
- Suggestion `desc` string still interpolates `effectiveTemplate` exactly as before (tests verify this).

#### Updated `coreReportMethod`

Before: it computed `effectiveTemplate` and `allowFix` manually, then inlined the descriptor.

Now:

```ts
export function coreReportMethod(
  deps: ReportDeps,
  context: Rule.RuleContext,
  sourceCode: any,
  config: { node: any; target?: any; options?: CoreReportOptions },
): void {
  const { node, target: passedTarget, options = {} } = config;

  withSafeReporting("coreReportMethod", () => {
    if (deps.hasStoryAnnotation(sourceCode, node)) {
      return;
    }

    const resolvedTarget =
      passedTarget ?? deps.resolveAnnotationTargetNode(sourceCode, node, null);
    const name = deps.extractName(node);
    const nameNode =
      (node.key && node.key.type === "Identifier" && node.key) || node;

    const { effectiveTemplate, allowFix } = deps.buildTemplateConfig(options);

    context.report(
      createMissingStoryReportDescriptor({
        nameNode,
        name,
        resolvedTarget,
        effectiveTemplate,
        allowFix,
        createFix: deps.createMethodFix,
      }),
    );
  });
}
```

Behavioral notes:

- The public behavior of `require-story-annotation` is unchanged:
  - Same reported name.
  - Same `missingStory` message template and substitution.
  - Same suggestion text and fix shape.
- Template + autofix handling is now aligned with `coreReportMissing` by using `deps.buildTemplateConfig` instead of hand-wiring `getAnnotationTemplate` + `shouldApplyAutoFix`.
  - In the actual dependency implementation (`require-story-helpers.ts`), `buildTemplateConfig` already uses `getAnnotationTemplate(options?.annotationTemplateOverride)` and `shouldApplyAutoFix(options?.autoFixToggle)`, so this is a structural simplification, not a behavior change.

#### Quality checks for this refactor

- `npm test -- --runInBand` ✅
- `npm run lint -- --max-warnings=0` ✅
- `npm run type-check` ✅
- `npm run format` (targeting updated files) + `npm run format:check` ✅
- `npm run ci-verify` ✅
- `npm run build` ✅

Commit:  
- `refactor: centralize missing-story report descriptor logic`

---

### 3) Tests for helpers & error‑resilience (##NEXT – tests)

**File:** `tests/rules/require-story-core.autofix.test.ts`

#### Header traceability

Extended the file header to explicitly cover the error‑reporting story:

```ts
/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Cover additional branch cases in require-story-core (addStoryFixer/reportMissing)
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-AUTOFIX
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-RESILIENCE
 */
```

This ties the new test coverage directly to the error‑reporting story and requirement.

#### Importing the core helper

Updated imports to exercise `coreReportMissing` directly:

```ts
import {
  createAddStoryFix,
  coreReportMissing,
} from "../../src/rules/helpers/require-story-core";
```

#### New error‑resilience test

Added a test to confirm that dependency failures inside `coreReportMissing` are swallowed by `withSafeReporting` and do not break lint runs:

```ts
test("coreReportMissing swallows dependency errors and does not break lint run", () => {
  const deps: any = {
    hasStoryAnnotation: () => {
      throw new Error("boom");
    },
    getReportedFunctionName: () => "fnX",
    resolveAnnotationTargetNode: () => ({ type: "FunctionDeclaration" }),
    getNameNodeForReport: (node: any) => node,
    buildTemplateConfig: () => ({
      effectiveTemplate:
        "/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
      allowFix: true,
    }),
    extractName: () => "fnX",
    getAnnotationTemplate: () =>
      "/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
    shouldApplyAutoFix: () => true,
    createAddStoryFix: () => () => ({}),
    createMethodFix: () => () => ({}),
  };

  const context: any = {
    report: jest.fn(),
  };

  const node: any = { type: "FunctionDeclaration" };

  expect(() =>
    coreReportMissing(deps, context as any, {} as any, { node }),
  ).not.toThrow();

  expect(context.report).not.toHaveBeenCalled();
});
```

This verifies:

- When a dependency (`hasStoryAnnotation`) throws, `coreReportMissing` does not propagate the exception (thanks to `withSafeReporting`).
- No report is emitted in that failure case, matching the error‑resilience goal.

Existing tests, such as:

- `tests/rules/error-reporting.test.ts` (verifying message content, suggestion text, and data wiring).
- `tests/rules/require-story-core.test.ts` / `tests/rules/require-story-helpers*.test.ts` (covering method vs function paths and autofix behavior)

continue to pass and implicitly validate that the new helper does not change the externally observable ESLint behavior.

#### Quality checks after test changes

- `npm test -- --runInBand` ✅
- `npm run lint -- --max-warnings=0` ✅
- `npm run type-check` ✅
- `npm run format` (for the updated test) + `npm run format:check` ✅
- `npm run ci-verify` ✅
- `npm run build` ✅

Commit:  
- `test: cover error-resilient core report helper behavior`

---

### 4) Re‑evaluation of duplication & complexity (##NEXT – reassessment)

- Ran `npm run duplication` (jscpd) as part of `npm run ci-verify`.
- The original duplication target — the duplicated `context.report` descriptor blocks in `coreReportMissing` and `coreReportMethod` — has been removed and replaced by the shared helper.
- jscpd still reports a small clone in `src/rules/helpers/require-story-core.ts` (between the two `withSafeReporting` blocks), but:
  - It is short (8 lines) and structurally distinct from the earlier, larger duplication.
  - It reflects the expected common scaffolding around `withSafeReporting` rather than repeated business logic.
- Complexity limits (`max-params`, `complexity`, `max-lines-per-function`) and lint rules all pass with no new suppressions introduced.

Conclusion: the originally identified duplicated region in the core story‑reporting helpers has been eliminated without increasing complexity elsewhere.

---

### 5) CI/CD verification

After local checks and commits, I pushed to `main` and verified CI:

- GitHub Actions workflow `CI/CD Pipeline` run `20005795067` completed with **success**.
- That workflow runs the full gate (build, lint, type‑check, tests with coverage, duplication, traceability checks, audits, secret scanning, semantic‑release, smoke tests), so the changes are fully validated end‑to‑end.

---

## Updated plan with status

### NOW

- [x] Analyze the remaining error-reporting helper code in the core story-reporting module to pinpoint any residual duplication or overly complex patterns and decide the next minimal refactor that preserves existing behavior while simplifying the implementation.

### NEXT

- [x] Introduce a small, focused helper or two in the core story-reporting module to encapsulate the shared construction of missing-story report data so that the remaining duplicated logic in the existing reporting functions is removed without changing what ESLint users observe.
- [x] Review the existing tests that exercise the core story-reporting behavior and add any missing cases needed to ensure the new helpers and error-resilience paths are fully covered, including scenarios where dependencies throw but linting continues safely.
- [x] Re-evaluate the updated core story-reporting helpers for duplication and complexity to confirm that the originally identified duplicated region has been eliminated and no new complex or overlapping logic has been introduced.

### LATER

- [ ] Design a small sequence of extractions to break the oversized branch-annotation helper module into a few cohesive utilities grouped by concern, such as generic comment scanning, catch-specific helpers, and else-if–specific helpers, while maintaining current behavior and traceability annotations.
- [ ] After the branch-annotation helpers are decomposed, revisit the linting thresholds for maximum lines per file and per function in the rules and helpers slice to modestly tighten them in line with the code-quality ratcheting plan.
- [ ] Identify any remaining untested defensive branches or rare error paths in core helper modules and add targeted characterization tests that lock in their current behavior before any further refactoring.

If you’d like, I can next tackle the first LATER item (decomposing `src/utils/branch-annotation-helpers.ts`) in similarly small, safe steps.
---
