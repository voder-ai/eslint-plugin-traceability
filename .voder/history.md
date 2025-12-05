Here’s a concise history-only summary of what’s been done so far on the project, including the most recent work.

---

## Test Duplication Reduction

- Reviewed `jscpd` reports and found heavy duplication in `tests/utils/annotation-checker.test.ts`.
- Refactored that file to use the shared `withTsLanguageOptions` helper from `tests/utils/ts-language-options.ts`, replacing repeated inline `languageOptions` definitions.
- Re-ran tests and `jscpd` to confirm behavior and reduced duplication.
- Committed as `test: refactor annotation-checker RuleTester setup to shared helper`.

---

## Traceability Annotation Improvements

- In `src/maintenance/cli.ts`, added and repositioned `// @implements` annotations for CLI flags, main error handling, and all `switch` branches so the checker correctly recognizes them.
- In `src/maintenance/detect.ts`, added `@implements` comments for invalid root guards, IO error paths, `handleStoryMatch` branches, and `getInProjectCandidates`/`anyInProjectCandidateExists` edge cases; iterated on placement until accepted by tooling.
- In `src/rules/helpers/valid-annotation-utils.ts`, annotated branches in `getFixedStoryPath` (path normalization/autofix) and missing-case handling in `buildStoryErrorMessage` / `buildReqErrorMessage`.
- In `src/rules/helpers/valid-story-reference-helpers.ts`, added annotations for project-boundary handling, candidate loops, and security checks against absolute/traversal paths.
- In `src/utils/annotation-checker.ts`, moved the missing-`@req` autofix annotation from `missingReqFix` to `createMissingReqFix` so it is tracked correctly.
- Repeatedly ran `npm run check:traceability` and the main quality scripts.
- Committed as `chore: improve traceability annotations for maintenance and validation helpers`; CI on `main` passed.

---

## Documentation Separation and Cleanup

- Cataloged shipped user docs from `package.json` and scanned them for `docs/` and `docs/stories` references.
- In `SECURITY.md`, removed a link to `docs/security-overview.md` and rewrote text to describe internal maintainer docs generically.
- In `CONTRIBUTING.md`, removed explicit links to internal docs (`docs/conventional-commits-guide.md`, `docs/ci-cd-pipeline.md`, ADRs), replacing them with external references and generic wording about internal documentation.
- In `user-docs/api-reference.md`, clarified that `docs/stories/...` paths are example project-local files, not shipped docs; generalized behavior descriptions for `traceability/require-story-annotation` and `traceability/require-req-annotation` and removed references to specific internal `.story.md` files and IDs.
- In `user-docs/migration-guide.md`, treated `docs/stories/...` as example consumer paths and removed references to internal multi-story documentation, emphasizing user-controlled story/requirement files.
- Re-ran `npm run ci-verify:full`.
- Committed as `docs: remove user-facing references to internal docs`; CI run `19935224744` succeeded.

---

## CODE_QUALITY Slice Strategy

- Reviewed repository layout and key docs related to code quality and coverage.
- Authored `docs/code-quality-assessment-slices.md`, defining four slices:
  - `rules-and-helpers` (priority 1).
  - `maintenance-and-cli` (priority 2).
  - `plugin-and-config` (priority 3).
  - `tooling-and-ci` (priority 4).
- Captured principles: small/focused slices, excluding docs, and prioritizing `rules-and-helpers`.
- Created `.voder-code-quality-slices.json` with machine-readable slice definitions.
- Wrote `docs/code-quality-assessment-guide.md` describing how to select slices, use the JSON config, and interpret results, establishing `rules-and-helpers` as the minimum baseline.
- Updated `docs/ci-cd-pipeline.md` with a “CODE_QUALITY Slices” section explaining slice-based assessments.
- Ran full quality checks.
- Committed as `docs: document CODE_QUALITY slice strategy`; CI run `19935786345` passed.

---

## Clarifying CODE_QUALITY Interpretation and Dependencies

- Re-reviewed the slice and ratcheting documentation plus `.voder-code-quality-slices.json`.
- Expanded `docs/code-quality-assessment-guide.md` to:
  - Define criteria for a valid `rules-and-helpers` assessment.
  - Define “passing” (ratcheted ESLint thresholds respected, required traceability/tests on critical paths, no critical structural issues).
  - Introduce finding classifications (Blockers / near-term / informational).
  - Clarify that context-failure runs are treated as “not run”.
- Updated `docs/decisions/003-code-quality-ratcheting-plan.md` to tie enforcement explicitly to the `rules-and-helpers` slice and to treat violations there as Blockers.
- Updated `docs/functionality-coverage-2025-12-03.md` to state that functionality assessments depend on a passing `rules-and-helpers` CODE_QUALITY run.
- Revalidated `.voder-code-quality-slices.json` and `docs/code-quality-assessment-slices.md` without changing the config.
- Ran tests, lint, type-check, build, and format checks.
- Committed as `docs: clarify code-quality slice interpretation and dependencies`; pre-push and CI (`19936091302`) passed.

---

## Rename Multi-Story Annotation from `@implements` to `@supports`

- Reviewed Story 010.2 and ADRs 010/011 to confirm that `@supports` is canonical and that `@implements` should no longer be exposed.
- Standardized on `@supports` as the only valid multi-story annotation in user code.

Documentation updates:

- Updated ADR 011 to document that `@supports` is the only supported multi-story annotation and `@implements` is no longer recognized, while semantics remain unchanged.
- Noted in Story 010.2 that ADR 010’s `@implements` is superseded by ADR 011.
- Updated `README.md` and `user-docs/api-reference.md` and `user-docs/migration-guide.md` so examples and descriptions use `@supports`.
- Updated rule docs (`docs/rules/valid-annotation-format.md`, `docs/rules/valid-req-reference.md`, `docs/rules/prefer-implements-annotation.md`) to describe `@supports`, clarifying that `prefer-implements-annotation` now migrates to `@supports` despite its name.

Core implementation:

- In `src/rules/helpers/valid-annotation-format-internal.ts`, updated parsing JSDoc and logic to recognize `@supports`.
- In `src/rules/helpers/valid-implements-utils.ts`, updated comments, requirement IDs, and messages to describe `@supports` parsing.
- In `src/rules/valid-annotation-format.ts` and `src/rules/valid-req-reference.ts`, adjusted detection and validation so they operate on `@supports` lines.
- In `src/utils/reqAnnotationDetection.ts`, treated `@req` or `@supports` as satisfying requirement presence.
- In `src/rules/helpers/require-story-io.ts`, treated `@story` or `@supports` as satisfying story presence and included `@supports` in story scans.
- In `src/rules/prefer-implements-annotation.ts`, changed the migration target to `@supports` and updated metadata and messages, while retaining the rule name.

Tests:

- Updated all relevant rule tests (`valid-annotation-format`, `valid-req-reference`, `require-story-annotation`, `require-req-annotation`, `prefer-implements-annotation`) to use `@supports` and REQ-SUPPORTS-* IDs.
- Updated traceability annotations and test headers to align with new IDs.

Husky / smoke tests:

- Switched `package.json` from `"postinstall": "husky"` to `"prepare": "husky"` to prevent Husky from running for consumers and smoke tests.
- Re-ran build, tests (including smoke), lint, type-check, format checks.
- Committed:
  - `fix: rename multi-story annotation from @implements to @supports`
  - `fix: avoid running husky in consumers and repair smoke test`
- CI pipeline passed.

---

## New Rule: `traceability/require-test-traceability` (Validation, Story 020.0)

- Reviewed Story `020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md` to derive behavior and options.
- Implemented `src/rules/require-test-traceability.ts`:

  - Added traceability header.
  - Defined `meta` (`type: "problem"`, options schema, messages).
  - Implemented:
    - `determineIsTestFile` for filename-based test detection.
    - `ensureFileSupportsAnnotation` to require a file-level `@supports`.
    - Helpers (`isTestCallName`, `getCalleeName`, `getFirstArgumentLiteral`).
  - `create(context)`:
    - Resolved options (`testFilePatterns`, `requireDescribeStory`, `requireTestReqPrefix`, `describePattern`).
    - Validated test files and enforced:
      - File-level `@supports`.
      - A story reference in `describe` names.
      - `[REQ-XXX]` prefixes in `it`/`test` names.

- Added `tests/rules/require-test-traceability.test.ts` with valid/invalid cases for file-level annotation, describe story reference, and REQ prefixes.
- Integrated into plugin:

  - Added to `RULE_NAMES` and `TRACEABILITY_RULE_SEVERITIES` in `src/index.ts`.
  - Updated `tests/plugin-default-export-and-configs.test.ts` to expect the new rule in exported configs.

- Documented in `user-docs/api-reference.md`, describing purpose, options, default severity, and example usage.
- Ran full quality checks.
- Committed as `feat: add require-test-traceability rule for test files`; CI passed.

---

## Safe Auto-Fix for `require-test-traceability` (Story 021.0)

- Reviewed Story `021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md`, existing rule implementation, tests, and prior auto-fix patterns.

Enhancements:

- Extended rule options in `src/rules/require-test-traceability.ts`:

  - `autoFixTestTemplate?: boolean;`
  - `autoFixTestPrefixFormat?: boolean;`
  - `testSupportsTemplate?: string;`

- Updated `meta` to include `fixable: "code"` and extended the schema with the above options.

Helper extraction:

- Created `src/rules/helpers/require-test-traceability-helpers.ts` containing:

  - Types (`TestTraceabilityAutoFixOptions`, `CallExpressionOptions`).
  - `determineIsTestFile` (moved here).
  - `ensureFileSupportsAnnotation`, which:
    - Inserts a placeholder file-level `@supports` comment when missing and `autoFixTestTemplate` is not `false`.
    - Supports custom templates via `testSupportsTemplate`.
  - `handleCallExpression`, delegating to:
    - `handleDescribeCall` for story-reference enforcement.
    - `handleItOrTestCall` for enforcing and normalizing `[REQ-...]` prefixes.
  - Internal helpers for template construction, insertion, test call detection, and safe string-literal normalization.

Rule wiring:

- Updated `src/rules/require-test-traceability.ts` to:

  - Import and use the helper functions.
  - Keep `meta`/schema definitions.
  - In `create(context)`, pass options (including auto-fix flags) to `ensureFileSupportsAnnotation` and `handleCallExpression`.

- Extended rule JSDoc with Story 020.0 and 021.0 traceability annotations.

Tests:

- Reworked `tests/rules/require-test-traceability.test.ts`:

  - Kept and adjusted validation tests.
  - Added tests for auto-fix behavior:
    - Insertion of default placeholder `@supports` when missing.
    - No fix for missing REQ IDs (no ID invention).
    - Normalization of malformed prefixes that already contain an ID (spacing, casing, delimiters).
  - Removed or adjusted tests that didn’t match actual implementation semantics.
  - Updated test header annotations for both stories.

Docs:

- Updated `user-docs/api-reference.md` for `traceability/require-test-traceability` to:

  - Describe auto-fix behavior for file-level `@supports` placeholders and REQ-prefix normalization.
  - Document new options `autoFixTestTemplate`, `autoFixTestPrefixFormat`, and `testSupportsTemplate`.

- Ran test, lint, type-check, build, and format checks.
- Committed as `feat: add safe auto-fix support for test traceability rule`; CI passed.

---

## Ignoring Generated Assessment and CI Report Artifacts

- Identified tool-generated and CI-generated artifacts that had been tracked in Git:

  - `scripts/eslint-suppressions-report.md`
  - `scripts/traceability-report.md`
  - `scripts/tsc-output.md`
  - `.voder-code-quality-slices.json`
  - `.voder-eslint-report.json`
  - `.voder-secretlint.json`
  - `.voder-test-output.json`
  - `.voder-jscpd-report/jscpd-report.json`
  - `.voder-jscpd-report/jscpd-report-latest.json/jscpd-report.json`

- Updated `.gitignore` to exclude:

  - The above `.voder*` report files and `.voder-jscpd-report/`.
  - The generated `scripts/*-report.md` files.

- Removed those files from the Git index while keeping them on disk (`git rm --cached ...`).
- Committed as `chore: ignore generated assessment and ci report artifacts`.
- Ran build, tests (`--runInBand --ci`), lint, type-check, and format checks; pushed; CI pipeline succeeded.

---

## CI Tooling Engine Alignment and Workflow Updates

- Investigated semantic-release and plugin engines via `npm view ... engines` and confirmed they require `^22.14.0 || >=24.10.0`.
- Noted that previous CI used Node `18.x` and `20.x` for most steps, only switching to `22.14.0` around semantic-release, causing `EBADENGINE` warnings.
- Checked `semver-diff` deprecation and confirmed no newer version exists yet.

Workflow changes (`.github/workflows/ci-cd.yml`):

- Updated the `quality-and-deploy` job’s matrix to a single Node version:

  ```yaml
  strategy:
    matrix:
      node-version: ['22.14.0']
  ```

- Simplified steps that previously depended on multiple Node versions (e.g., secret scanning condition).
- Removed the separate “Setup Node.js for semantic-release” step, since the job now runs entirely on Node `22.14.0`.
- Adjusted the `if` condition for semantic-release to check `matrix['node-version'] == '22.14.0'`.
- Updated comments referencing the matrix job to mention Node `22.14.0` instead of `20.x`.
- In the `dependency-health` job, changed the `setup-node` version from `20.x` to `22.14.0`.

- Committed as `ci: align workflow node version with semantic-release engines`.
- Ran build, tests, lint, type-check, and format checks; pushed; CI succeeded under the new configuration.

---

## CI/CD Documentation Sync and Ephemeral Artifacts Documentation

- Updated `docs/ci-cd-pipeline.md` to:

  - Reflect the `quality-and-deploy` job matrix now running on Node `22.14.0` only.
  - Clarify in “Supported Runtime and Tooling” that:
    - CI and semantic-release tooling run on Node `22.14.0`.
    - The plugin’s `engines.node` remains `>=18.18.0`, so consumers can run on Node versions ≥18.18.0.
  - Explain that semantic-release and its plugins require Node `^22.14.0 || >=24.10.0`, and that CI uses Node `22.14.0` to satisfy these dev-tooling engine constraints and avoid `EBADENGINE` warnings.

- Added a section describing ephemeral CI and assessment artifacts that must not be committed, explicitly listing:

  - `scripts/eslint-suppressions-report.md`
  - `scripts/traceability-report.md`
  - `scripts/tsc-output.md`
  - `.voder-code-quality-slices.json`
  - `.voder-eslint-report.json`
  - `.voder-secretlint.json`
  - `.voder-test-output.json`
  - `.voder-jscpd-report/`

- Clarified that these files are generated by automation, are .gitignored, and should be regenerated as needed rather than stored in the repo.

- Committed as:

  - `docs: document ignored ephemeral ci and assessment artifacts`
  - `docs: sync ci-cd documentation with updated workflow node version`

- Re-ran build, tests, lint, type-check, and format checks after each set of changes; pushed; CI pipeline completed successfully for all.

**Most recently we've executed the following action:**

---
Used tool: read_file with input: {"filePath":"docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-annotation-format-internal.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/valid-annotation-format.test.ts"}
Used tool: read_file with input: {"filePath":"docs/rules/valid-annotation-format.md"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-annotation-format-internal.ts","startLine":1,"endLine":400}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-annotation-format-internal.ts","instruction":"After the existing normalizeCommentLine function, add a new exported helper function called isNonTraceabilityJSDocTagLine that detects whether a normalized comment line starts with a non-traceability JSDoc tag (e.g. @param, @returns). The function should:\n- Accept a single string parameter `normalized`.\n- Trim leading whitespace.\n- Return false if the result is empty or does not start with `@`.\n- Return false if the tag is one of @story, @req, or @supports (case-sensitive, using a regex like /^@(story|req|supports)\\b/).\n- Otherwise, return true.\n\nPrecede the function with a JSDoc comment that explains its purpose and includes a @supports annotation referencing docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md with requirement IDs REQ-JSDOC-BOUNDARY-DETECTION and REQ-JSDOC-TAG-COEXISTENCE."}
Used tool: modify_file with input: {"filePath":"src/rules/valid-annotation-format.ts","instruction":"Update the imports from \"./helpers/valid-annotation-format-internal\" to also import isNonTraceabilityJSDocTagLine. Then, inside the processCommentLine function, after handling @supports and after the block that starts a new pending annotation when isStory or isReq is true, insert logic to treat other JSDoc tags as boundaries:\n\n- If isNonTraceabilityJSDocTagLine(normalized) returns true, call finalizePendingAnnotation(context, comment, options, pending) to validate and clear any existing pending annotation.\n- Then return null to indicate there is no active pending annotation after this JSDoc tag line.\n\nAdd an inline comment above this new block explaining that this implements JSDoc tag coexistence behavior and terminates @story/@req values when a new JSDoc tag line (like @param or @returns) is encountered, and include a @supports annotation referencing docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md with requirement IDs REQ-ANNOTATION-TERMINATION and REQ-CONTINUATION-LOGIC."}
Used tool: modify_file with input: {"filePath":"tests/rules/valid-annotation-format.test.ts","instruction":"Within the existing describe block for \"Valid Annotation Format Rule (Story 005.0-DEV-ANNOTATION-VALIDATION)\", extend the valid/invalid cases to cover JSDoc coexistence scenarios for Story 022.0-DEV-JSDOC-COEXISTENCE:\n\n1. In the file-level JSDoc header at the top, add another \"Tests for\" section for docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md with a @story tag pointing to that story and @req tags for REQ-JSDOC-TAG-COEXISTENCE, REQ-ANNOTATION-TERMINATION, REQ-JSDOC-BOUNDARY-DETECTION, REQ-CONTINUATION-LOGIC, REQ-NO-FALSE-POSITIVES, and REQ-PRESERVE-MULTILINE.\n\n2. Add new valid test cases that demonstrate traceability annotations coexisting with other JSDoc tags without errors:\n   - One where @story and @req appear before @param/@returns tags (\"traceability before other tags\").\n   - One where @story/@req appear after @param/@returns tags (\"traceability after other tags\").\n   - One where @story and @req are interleaved with @param/@returns (\"mixed positions\").\n   - One where a multi-line @story value is followed by @param, ensuring the multi-line value is preserved and not polluted by @param (\"multi-line annotation before other tags\").\n   Use realistic code snippets similar to those shown in the story file, and give each test a name that includes the corresponding requirement ID in square brackets, such as \"[REQ-JSDOC-TAG-COEXISTENCE] traceability before other JSDoc tags\".\n\n3. Add at least one invalid test that reproduces the original bug scenario to confirm it is now fixed. For example, a comment like:\n   \"\"\"\n   /**\n    * @req REQ-OPTIMIZATION\n    * @param {object} data\n    */\n   \"\"\"\n   Previously produced an invalid requirement ID like \"REQ-OPTIMIZATION@param{object}data\". Now, it should be considered valid and not produce any error. Represent this as a valid test case (no errors expected) with a name that references REQ-NO-FALSE-POSITIVES and explains that JSDoc tags do not pollute the requirement ID.\n\nEnsure the new tests rely on the existing ruleTester.run invocation and follow the existing structure of the valid array (no new describe blocks are needed)."}
Used tool: modify_file with input: {"filePath":"docs/rules/valid-annotation-format.md","instruction":"In the \"Key behaviors\" section, under the bullet list for \"Flexible parsing\" and \"Multiline annotation support\", update the documentation to describe JSDoc coexistence semantics from Story 022.0-DEV-JSDOC-COEXISTENCE:\n\n- After the existing \"Multiline annotation support\" bullet list, add a new top-level bullet titled \"JSDoc coexistence\".\n- Under this new bullet, explain that:\n  - Traceability annotations (`@story`, `@req`, `@supports`) can appear before, after, or interleaved with other JSDoc tags such as `@param`, `@returns`, and `@throws`.\n  - The parser treats any JSDoc tag line that starts with `@` (other than `@story`, `@req`, or `@supports`) as a boundary that terminates the current multi-line traceability value.\n  - Continuation lines are only considered part of the same annotation if they do not start with another JSDoc tag.\n  - This prevents JSDoc tags from being concatenated into requirement IDs or story paths, eliminating false positives like `REQ-OPTIMIZATION@param{object}data`.\n\n- Include a short code example that demonstrates `@story` and `@req` appearing before `@param` and `@returns` in a JSDoc block, noting that this is now fully supported.\n\nKeep the existing structure and headings, and do not remove any existing content."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--verbose"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts"}
Used tool: modify_file with input: {"filePath":"src/rules/valid-annotation-format.ts","instruction":"Refactor the module to reduce the total line count under 300 without changing behavior by extracting the helper functions related purely to validation and finalization into a separate internal helper module.\n\nSpecifically:\n- Remove the implementations of validateStoryAnnotation, validateReqAnnotation, validateImplementsAnnotation, finalizePendingAnnotation, and reportInvalidStoryFormat/reportInvalidStoryFormatWithFix/createStoryFix from this file.\n- Instead, import these as named exports from a new helper module \"./helpers/valid-annotation-format-validators\".\n- Keep processCommentLine, processComment, and the default export in this file, but have them call the imported helpers.\n\nDo not attempt to create the new helper module in this edit; only adjust the imports and remove the inlined helper implementations here, assuming the helpers will be defined elsewhere. Preserve all existing traceability comments that remain in this file, but you may remove or adjust comments that reference deleted helpers as needed."}
Used tool: generate_file with input: {"filePath":"src/rules/helpers/valid-annotation-format-validators.ts","overwrite":false,"content":"/**\n * Validators and helper functions for the valid-annotation-format rule.\n *\n * This module contains the core validation logic that was originally\n * embedded in src/rules/valid-annotation-format.ts. It is extracted\n * here to keep the main rule module smaller and easier to read while\n * preserving existing behavior.\n *\n * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\n * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md\n * @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n * @story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md\n * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md\n * @req REQ-FORMAT-SPECIFICATION\n * @req REQ-SYNTAX-VALIDATION\n * @req REQ-PATH-FORMAT\n * @req REQ-REQ-FORMAT\n * @req REQ-MULTILINE-SUPPORT\n * @req REQ-AUTOFIX-FORMAT\n * @req REQ-ERROR-SPECIFICITY\n * @req REQ-REGEX-VALIDATION\n * @req REQ-BACKWARD-COMP\n * @req REQ-SUPPORTS-PARSE\n * @req REQ-FORMAT-VALIDATION\n * @req REQ-MIXED-SUPPORT\n */\n\nimport type { ResolvedAnnotationOptions } from \"./valid-annotation-options\";\nimport {\n  collapseAnnotationValue,\n  TAG_NOT_FOUND_INDEX,\n  getFixedStoryPath,\n  buildStoryErrorMessage,\n  buildReqErrorMessage,\n} from \"./valid-annotation-utils\";\nimport {\n  MIN_IMPLEMENTS_TOKENS,\n  reportMissingImplementsReqIds,\n  reportMissingImplementsValue,\n  reportInvalidImplementsReqId,\n  reportInvalidImplementsStoryPath,\n  validateImplementsAnnotationHelper,\n} from \"./valid-implements-utils\";\nimport type { PendingAnnotation } from \"./valid-annotation-format-internal\";\nimport { getResolvedDefaults } from \"./valid-annotation-options\";\n\n/**\n * Report an invalid @story annotation without applying a fix.\n *\n * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\n * @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md\n * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues\n */\nexport function reportInvalidStoryFormat(\n  context: any,\n  comment: any,\n  collapsed: string,\n  options: ResolvedAnnotationOptions,\n): void {\n  context.report({\n    node: comment as any,\n    messageId: \"invalidStoryFormat\",\n    data: { details: buildStoryErrorMessage(\"invalid\", collapsed, options) },\n  });\n}\n\n/**\n * Compute the text replacement for an invalid @story annotation within a comment.\n *\n * This helper:\n *   - finds the @story tag in the raw comment text,\n *   - computes the character range of its value,\n *   - and returns an ESLint fix that replaces only that range.\n *\n * Returns null when the tag or value cannot be safely located.\n *\n * @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n * @req REQ-AUTOFIX-SAFE\n * @req REQ-AUTOFIX-PRESERVE\n */\nexport function createStoryFix(\n  context: any,\n  comment: any,\n  fixed: string,\n): null | (() => any) {\n  const sourceCode = context.getSourceCode();\n  const commentText = sourceCode.getText(comment);\n  const search = \"@story\";\n  const tagIndex = commentText.indexOf(search);\n  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n  // @req REQ-AUTOFIX-SAFE - Skip auto-fix when @story tag cannot be reliably located\n  if (tagIndex === TAG_NOT_FOUND_INDEX) {\n    return null;\n  }\n\n  const afterTagIndex = tagIndex + search.length;\n  const rest = commentText.slice(afterTagIndex);\n  const valueMatch = rest.match(/[^\\S\\r\\n]*([^\\r\\n*]+)/);\n  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n  // @req REQ-AUTOFIX-SAFE - Abort auto-fix when story value range cannot be safely determined\n  if (!valueMatch || valueMatch.index === undefined) {\n    return null;\n  }\n\n  const valueStartInComment =\n    afterTagIndex +\n    valueMatch.index +\n    (valueMatch[0].length - valueMatch[1].length);\n  const valueEndInComment = valueStartInComment + valueMatch[1].length;\n\n  const start = comment.range[0];\n  const fixRange: [number, number] = [\n    start + valueStartInComment,\n    start + valueEndInComment,\n  ];\n\n  return () => (fixer: any) => fixer.replaceTextRange(fixRange, fixed);\n}\n\n/**\n * Report an invalid @story annotation and attempt a minimal, safe auto-fix\n * for common path suffix issues by locating and replacing the path text\n * within the original comment.\n *\n * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\n * @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md\n * @req REQ-PATH-FORMAT - Validate @story paths follow expected patterns\n * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues\n * @req REQ-AUTOFIX-SAFE - Auto-fix must be conservative and avoid changing semantics\n * @req REQ-AUTOFIX-PRESERVE - Auto-fix must preserve surrounding formatting and comments\n */\nexport function reportInvalidStoryFormatWithFix(\n  context: any,\n  comment: any,\n  collapsed: string,\n  fixed: string,\n): void {\n  const fixFactory = createStoryFix(context, comment, fixed);\n  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n  // @req REQ-AUTOFIX-SAFE - Fall back to reporting without fix when safe fix cannot be created\n  if (!fixFactory) {\n    reportInvalidStoryFormat(\n      context,\n      comment,\n      collapsed,\n      getResolvedDefaults(),\n    );\n    return;\n  }\n\n  context.report({\n    node: comment as any,\n    messageId: \"invalidStoryFormat\",\n    data: {\n      details: buildStoryErrorMessage(\n        \"invalid\",\n        collapsed,\n        getResolvedDefaults(),\n      ),\n    },\n    fix: fixFactory(),\n  });\n}\n\n/**\n * Validate a @story annotation value and report detailed errors when needed.\n * Where safe and unambiguous, apply an automatic fix for missing suffixes.\n *\n * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\n * @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md\n * @req REQ-PATH-FORMAT - Validate @story paths follow expected patterns\n * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations\n * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues\n * @req REQ-REGEX-VALIDATION - Validate configurable story regex patterns and fall back safely\n * @req REQ-BACKWARD-COMP - Preserve behavior when invalid regex config is supplied\n * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments\n */\nexport function validateStoryAnnotation(\n  context: any,\n  comment: any,\n  rawValue: string,\n  options: ResolvedAnnotationOptions,\n): void {\n  const trimmed = rawValue.trim();\n  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\n  // @req REQ-PATH-FORMAT - Treat missing @story value as a specific validation error\n  if (!trimmed) {\n    context.report({\n      node: comment as any,\n      messageId: \"invalidStoryFormat\",\n      data: { details: buildStoryErrorMessage(\"missing\", null, options) },\n    });\n    return;\n  }\n\n  const collapsed = collapseAnnotationValue(trimmed);\n  const pathPattern = options.storyPattern;\n\n  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\n  // @req REQ-PATH-FORMAT - Accept @story value when it matches configured storyPattern\n  if (pathPattern.test(collapsed)) {\n    return;\n  }\n\n  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\n  // @req REQ-PATH-FORMAT - Reject @story values containing internal whitespace as invalid\n  if (/\\s/.test(trimmed)) {\n    reportInvalidStoryFormat(context, comment, collapsed, options);\n    return;\n  }\n\n  const fixed = getFixedStoryPath(collapsed);\n\n  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n  // @req REQ-AUTOFIX-FORMAT - Apply suffix-only auto-fix when it yields a pattern-compliant path\n  if (fixed && pathPattern.test(fixed)) {\n    reportInvalidStoryFormatWithFix(context, comment, collapsed, fixed);\n    return;\n  }\n\n  reportInvalidStoryFormat(context, comment, collapsed, options);\n}\n\n/**\n * Validate a @req annotation value and report detailed errors when needed.\n *\n * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\n * @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md\n * @req REQ-REQ-FORMAT - Validate @req identifiers follow expected patterns\n * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations\n * @req REQ-REGEX-VALIDATION - Validate configurable requirement regex patterns and fall back safely\n * @req REQ-BACKWARD-COMP - Preserve behavior when invalid regex config is supplied\n * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments\n */\nexport function validateReqAnnotation(\n  context: any,\n  comment: any,\n  rawValue: string,\n  options: ResolvedAnnotationOptions,\n): void {\n  const trimmed = rawValue.trim();\n  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\n  // @req REQ-REQ-FORMAT - Treat missing @req value as a specific validation error\n  if (!trimmed) {\n    context.report({\n      node: comment as any,\n      messageId: \"invalidReqFormat\",\n      data: { details: buildReqErrorMessage(\"missing\", null, options) },\n    });\n    return;\n  }\n\n  const collapsed = collapseAnnotationValue(trimmed);\n  const reqPattern = options.reqPattern;\n\n  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\n  // @req REQ-REQ-FORMAT - Flag @req identifiers that do not match the configured pattern\n  if (!reqPattern.test(collapsed)) {\n    context.report({\n      node: comment as any,\n      messageId: \"invalidReqFormat\",\n      data: { details: buildReqErrorMessage(\"invalid\", collapsed, options) },\n    });\n  }\n}\n\n/**\n * Validate an @supports annotation value and report detailed errors when needed.\n *\n * Expected format:\n *   @supports <storyPath> <REQ-ID> [<REQ-ID> ...]\n *\n * Validation rules:\n *   - Value must include at least a story path and one requirement ID.\n *   - Story path must match the same storyPattern used for @story (no auto-fix).\n *   - Each subsequent token must match reqPattern and is validated individually.\n *\n * Story path issues are reported with \"invalidImplementsFormat\" and\n * requirement ID issues reuse the existing \"invalidReqFormat\" message.\n *\n * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md\n * @req REQ-SUPPORTS-PARSE - Parse @supports annotations without affecting @story/@req\n * @req REQ-FORMAT-VALIDATION - Validate @implements story path and requirement IDs\n * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments\n */\nexport function validateImplementsAnnotation(\n  context: any,\n  comment: any,\n  rawValue: string,\n  options: ResolvedAnnotationOptions,\n): void {\n  const deps = {\n    MIN_IMPLEMENTS_TOKENS,\n    reportMissingImplementsReqIds,\n    reportMissingImplementsValue,\n    reportInvalidImplementsReqId,\n    reportInvalidImplementsStoryPath,\n  };\n\n  validateImplementsAnnotationHelper(deps, context, comment, {\n    rawValue,\n    options,\n  });\n}\n\n/**\n * Finalize and validate the currently pending annotation, if any.\n *\n * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\n * @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md\n * @req REQ-SYNTAX-VALIDATION - Validate annotation syntax matches specification\n * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues\n * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments\n */\nexport function finalizePendingAnnotation(\n  context: any,\n  comment: any,\n  options: ResolvedAnnotationOptions,\n  pending: PendingAnnotation | null,\n): PendingAnnotation | null {\n  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\n  // @req REQ-MULTILINE-SUPPORT - Do nothing when there is no pending multi-line annotation to finalize\n  if (!pending) {\n    return null;\n  }\n\n  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\n  // @req REQ-SYNTAX-VALIDATION - Dispatch to @story or @req validator based on pending annotation type\n  // @req REQ-AUTOFIX-FORMAT - Route to story validator which may apply safe auto-fixes\n  // @req REQ-MIXED-SUPPORT - Ensure @story and @req annotations are handled independently\n  if (pending.type === \"story\") {\n    validateStoryAnnotation(context, comment, pending.value, options);\n  } else {\n    validateReqAnnotation(context, comment, pending.value, options);\n  }\n\n  return null;\n}\n"}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts"}
Used tool: run_command with input: {"command":"npx","args":["wc","-l","src/rules/valid-annotation-format.ts"]}
Used tool: run_command with input: {"command":"wc","args":["-l","src/rules/valid-annotation-format.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: modify_file with input: {"filePath":"src/rules/valid-annotation-format.ts","instruction":"Remove imports that are no longer used after extracting validator helpers:\n- Delete the entire import block that imports collapseAnnotationValue, TAG_NOT_FOUND_INDEX, getFixedStoryPath, buildStoryErrorMessage, and buildReqErrorMessage from \"./helpers/valid-annotation-utils\".\n- Delete the entire import block that imports MIN_IMPLEMENTS_TOKENS, reportMissingImplementsReqIds, reportMissingImplementsValue, reportInvalidImplementsReqId, reportInvalidImplementsStoryPath, and validateImplementsAnnotationHelper from \"./helpers/valid-implements-utils\".\n- In the import from \"./helpers/valid-annotation-format-validators\", remove the named imports reportInvalidStoryFormat, reportInvalidStoryFormatWithFix, validateStoryAnnotation, validateReqAnnotation, and createStoryFix, leaving only validateImplementsAnnotation and finalizePendingAnnotation.\n\nDo not change any other code in this file."}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: modify_file with input: {"filePath":"src/rules/valid-annotation-format.ts","instruction":"In the import from \"./helpers/valid-annotation-options\" at the top of the file, remove getResolvedDefaults from the imported names since it is no longer used. Keep resolveOptions, ResolvedAnnotationOptions, getRuleSchema, and getOptionErrors."}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--verbose"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"fix: support JSDoc tag coexistence for annotation parsing"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19950791613,"timeout":600000}
---

**This was the result:**
---
Here’s what I implemented for the JSDoc coexistence story, and how it maps to the plan.

---

## Updated Plan Status

## NOW

- [x] Review the JSDoc coexistence story and the current annotation parsing implementation side by side to derive precise rules for how traceability tags must coexist with other JSDoc tags like @param and @returns without corrupting annotation values.

## NEXT

- [x] Update the annotation parsing logic so that when a pending @story, @req, or @supports annotation is followed by a new JSDoc tag line (such as @param or @returns), the parser finalizes the annotation instead of appending the JSDoc tag text into its value, while preserving existing multi-line value behavior for non-tag lines.
- [x] Add targeted tests that cover JSDoc coexistence scenarios described in the story, including traceability annotations appearing before and after @param/@returns tags, and verify that IDs remain unpolluted and no false positives are introduced.
- [x] Adjust rule documentation and, if necessary, the story file itself to record the new coexistence behavior, including at least one concrete example showing a traceability annotation living alongside standard JSDoc tags.
- [x] Perform a small focused review of the updated parser helper code to ensure it still meets the project’s complexity and readability expectations, making minor refactors if needed without altering the new behavior.

All changes are committed (`fix: support JSDoc tag coexistence for annotation parsing`), pushed to `main`, and the CI/CD pipeline run completed successfully.

---

## 1. JSDoc coexistence rules (NOW)

I reviewed:

- Story: `docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md`
- Implementation:
  - `src/rules/helpers/valid-annotation-format-internal.ts`
  - `src/rules/valid-annotation-format.ts`
- Tests: `tests/rules/valid-annotation-format.test.ts`
- Rule docs: `docs/rules/valid-annotation-format.md`

The story’s acceptance criteria imply these concrete rules:

- Lines that start (after `*` and whitespace) with `@story`, `@req`, or `@supports` are **traceability tags** and start or validate annotations.
- Any other JSDoc tag line that starts with `@` (e.g. `@param`, `@returns`, `@throws`, custom tags) is a **boundary**:
  - It must terminate any pending multi-line traceability annotation.
  - It must **not** be concatenated into the annotation value.
- Multi-line continuation is only allowed on lines that do **not** start with `@tag`.
- Existing multi-line behavior (splitting an ID/path across lines) must remain intact.
- Existing valid annotations (with no extra JSDoc tags) must remain valid.

The old behavior concatenated `@param` lines into the annotation value, producing `REQ-OPTIMIZATION@param{object}data` and similar, which violates the above rules.

---

## 2. Parser changes: detect JSDoc tag boundaries and terminate annotations (NEXT #1)

### 2.1 New helper: JSDoc tag detection

**File:** `src/rules/helpers/valid-annotation-format-internal.ts`

I added a helper to detect non-traceability JSDoc tags:

```ts
/**
 * Detect whether a normalized comment line starts with a non-traceability JSDoc tag.
 *
 * This is used to distinguish regular JSDoc tags (e.g. @param, @returns) from
 * traceability-related annotations such as @story, @req, and @supports.
 *
 * @supports docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md
 * @req REQ-JSDOC-BOUNDARY-DETECTION
 * @req REQ-JSDOC-TAG-COEXISTENCE
 */
export function isNonTraceabilityJSDocTagLine(normalized: string): boolean {
  const trimmed = normalized.trimStart();
  if (!trimmed || !trimmed.startsWith("@")) {
    return false;
  }

  if (/^@(story|req|supports)\b/.test(trimmed)) {
    return false;
  }

  return true;
}
```

How this works with existing `normalizeCommentLine`:

- For a JSDoc line like `* @param {object} data`:
  - `normalizeCommentLine` removes `* ` and returns `"@param {object} data"`.
  - `isNonTraceabilityJSDocTagLine("@param {object} data")` → `true`.

- For traceability lines like `* @req REQ-FOO` or `* @story docs/...`:
  - `normalizeCommentLine` returns `"@req REQ-FOO"` or `"@story docs/..."`.
  - `isNonTraceabilityJSDocTagLine` returns `false`, because the tag is one of `@story`, `@req`, or `@supports`.

This exactly implements the story’s boundary pattern `^\s*\*?\s*@\w+` for non-traceability tags.

### 2.2 Using JSDoc tag detection to terminate pending annotations

**File:** `src/rules/valid-annotation-format.ts`

We updated `processCommentLine` to treat non-traceability JSDoc tags as boundaries:

```ts
import {
  PendingAnnotation,
  normalizeCommentLine,
  isNonTraceabilityJSDocTagLine,
} from "./helpers/valid-annotation-format-internal";
import {
  validateImplementsAnnotation,
  finalizePendingAnnotation,
} from "./helpers/valid-annotation-format-validators";
```

Inside `processCommentLine`:

```ts
// Implement JSDoc tag coexistence behavior: terminate @story/@req values when a new non-traceability JSDoc tag line (e.g., @param, @returns) is encountered.
// @supports docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md REQ-ANNOTATION-TERMINATION REQ-CONTINUATION-LOGIC
if (isNonTraceabilityJSDocTagLine(normalized)) {
  finalizePendingAnnotation(context, comment, options, pending);
  return null;
}
```

Effect:

- If we have:

  ```js
  /**
   * @req REQ-OPTIMIZATION
   * @param {object} data
   */
  ```

  - First line: starts pending `@req` with value `REQ-OPTIMIZATION`.
  - Second line: normalized to `"@param {object} data"`.
  - `isNonTraceabilityJSDocTagLine` returns true → we **finalize** `REQ-OPTIMIZATION` and **do not** treat `@param` as continuation. No error is reported, because `REQ-OPTIMIZATION` matches the default `req.pattern`.

- Multi-line values (without an intervening `@tag` line) still accumulate via the existing `if (pending) { ... }` continuation branch.

### 2.3 Refactor to keep rule file small and maintainable

ESLint’s `max-lines` rule started failing after we added the new behavior, so I performed a small structural refactor (no behavior change) using an internal helper module.

**New file:** `src/rules/helpers/valid-annotation-format-validators.ts`

This module houses all the validation and finalization helpers that were previously in `valid-annotation-format.ts`:

- `reportInvalidStoryFormat`
- `createStoryFix`
- `reportInvalidStoryFormatWithFix`
- `validateStoryAnnotation`
- `validateReqAnnotation`
- `validateImplementsAnnotation`
- `finalizePendingAnnotation`

These functions are copy-moved from the original file with traceability comments intact and imports wired appropriately.

**Back in `src/rules/valid-annotation-format.ts`:**

The file now focuses on:

- Importing options, helpers, and validators.
- `processCommentLine` (including new JSDoc coexistence logic).
- `processComment`.
- Default export `meta` and `create`.

All unused imports were removed. ESLint now passes both `max-lines` and `no-unused-vars`, and the split keeps the rule file readable while preserving behavior.

---

## 3. Tests for JSDoc coexistence scenarios (NEXT #2)

**File:** `tests/rules/valid-annotation-format.test.ts`

### 3.1 Test header updated for Story 022.0

At the top of the test file, I added explicit traceability for the new story:

```ts
 * Tests for: docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md
 * @story docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md
 * @req REQ-JSDOC-TAG-COEXISTENCE - Rule allows traceability annotations to coexist with other JSDoc tags
 * @req REQ-ANNOTATION-TERMINATION - Rule correctly terminates traceability annotation values at JSDoc tag boundaries
 * @req REQ-JSDOC-BOUNDARY-DETECTION - Rule detects @param/@returns and similar tags as boundaries
 * @req REQ-CONTINUATION-LOGIC - Rule correctly decides when to continue or stop multi-line traceability values
 * @req REQ-NO-FALSE-POSITIVES - Rule does not report false positives when JSDoc tags follow traceability tags
 * @req REQ-PRESERVE-MULTILINE - Rule preserves multi-line story/req values without including following JSDoc tags
```

### 3.2 New valid cases

Added to the `valid:` array:

1. **Traceability before other tags**

   ```ts
   {
     name: "[REQ-JSDOC-TAG-COEXISTENCE] traceability before other JSDoc tags",
     code: `/**
 * @story docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md
 * @req REQ-JSDOC-TAG-COEXISTENCE
 * @param {string} id - Identifier for the lookup.
 * @returns {Promise<void>} - Completes when finished.
 */
function fetchById(id) {
  return Promise.resolve();
}`,
   }
   ```

2. **Traceability after other tags**

   ```ts
   {
     name: "[REQ-JSDOC-TAG-COEXISTENCE] traceability after other JSDoc tags",
     code: `/**
 * Fetch a user by id.
 *
 * @param {string} id - Identifier for the lookup.
 * @returns {Promise<void>} - Completes when finished.
 * @story docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md
 * @req REQ-ANNOTATION-TERMINATION
 */
function fetchUser(id) {
  return Promise.resolve();
}`,
   }
   ```

3. **Mixed positions (interleaved)**

   ```ts
   {
     name: "[REQ-JSDOC-TAG-COEXISTENCE] mixed positions of traceability and other JSDoc tags",
     code: `/**
 * Update a record with new data.
 *
 * @story docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md
 * @param {string} id - Identifier.
 * @req REQ-JSDOC-BOUNDARY-DETECTION
 * @param {object} payload - Updated fields.
 * @returns {boolean} - True if updated.
 * @req REQ-CONTINUATION-LOGIC
 */
function updateRecord(id, payload) {
  return true;
}`,
   }
   ```

4. **Multi-line annotation before JSDoc tags**

   ```ts
   {
     name: "[REQ-PRESERVE-MULTILINE] multi-line @story annotation before other JSDoc tags",
     code: `/**
 * @story docs/stories/022.0-DEV-
 * JSDOC-COEXISTENCE.story.md
 * @param {string} id - Identifier for the lookup.
 * @returns {Promise<void>} - Completes when finished.
 */
function loadForStory(id) {
  return Promise.resolve();
}`,
   }
   ```

   This verifies multi-line `@story` values still work when followed by JSDoc tags; the tags are not folded into the path.

5. **Original bug scenario must now be valid (no false positives)**

   ```ts
   {
     name: "[REQ-NO-FALSE-POSITIVES] JSDoc tags do not pollute requirement ID when following @req",
     code: `/**
 * @req REQ-OPTIMIZATION
 * @param {object} data - Input payload.
 * @returns {void}
 */
function optimize(data) {}`,
   }
   ```

Previously, this would have produced an invalid requirement ID `"REQ-OPTIMIZATION@param{object}data"`. Now, because `@param` and `@returns` terminate the pending `@req`, no error is reported, and the test is in the `valid` section.

All existing valid/invalid tests continue to pass, confirming backward compatibility.

---

## 4. Documentation update (NEXT #3)

**File:** `docs/rules/valid-annotation-format.md`

I added a new “JSDoc coexistence” bullet under “Key behaviors”:

```md
- **JSDoc coexistence**
  - Traceability annotations (`@story`, `@req`, `@supports`) can appear before, after, or interleaved with other JSDoc tags such as `@param`, `@returns`, and `@throws`.
  - The parser treats any JSDoc tag line that starts with `@` (other than `@story`, `@req`, or `@supports`) as a boundary that terminates the current multi-line traceability value.
  - Continuation lines are only considered part of the same annotation if they do not start with another JSDoc tag.
  - This prevents JSDoc tags from being concatenated into requirement IDs or story paths, eliminating false positives like `REQ-OPTIMIZATION@param{object}data`.
  - Example (fully supported):
    ```js
    /**
     * Calculate totals with discounting.
     * @story docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md
     * @req REQ-CALC-TOTALS
     * @param {number[]} items
     * @param {number} discount
     * @returns {number}
     */
    function calculateTotals(items, discount) { /* ... */ }
    ```
```

This directly documents the semantics introduced for Story 022.0 and makes the behavior clear to users.

---

## 5. Focused review, quality checks, and CI (NEXT #4)

### 5.1 Small focused review

- `src/rules/valid-annotation-format.ts` now contains:
  - Imports.
  - `processCommentLine` and `processComment`.
  - The rule `meta` and `create` function.
- Helper modules:
  - `valid-annotation-format-internal.ts`: normalization and the new JSDoc tag detection helper.
  - `valid-annotation-format-validators.ts`: all the validation logic for `@story`, `@req`, and `@supports`, plus pending-finalization logic.
- ESLint’s `max-lines` rule for this file now passes (no more 301-line error), and there are no `eslint-disable` or `@ts-ignore` annotations.
- The structure is clearer: `valid-annotation-format.ts` coordinates traversal; helpers encapsulate parsing/validation details.

### 5.2 Local quality checks

After changes, I ran:

- `npm run lint -- --max-warnings=0` – passes.
- `npm run build` – TypeScript compilation succeeds.
- `npm test -- --runInBand --verbose` – 36 suites, 282 tests all pass.
- `npm run format` then `npm run format:check` – Prettier clean.
- Pre-push hook also ran `npm run ci-verify:full` and `npm run security:secrets` (build, type-check, lint, duplication, tests with coverage, audits, secret scan) and all passed.

### 5.3 CI/CD pipeline

- I pushed directly to `main`.
- GitHub Actions `CI/CD Pipeline` run `19950791613` (triggered by this push) completed with **success**.
- That run re-executed the full `ci-verify:full` pipeline and semantic-release logic, matching local checks.

---

If you’d like, I can next update the story file `docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md` to tick its Definition of Done checkboxes based on this implementation, but functionally the story is now satisfied: behavior, tests, and documentation all match the specified acceptance criteria.
---
