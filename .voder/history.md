Here’s a concise history-only summary of what’s been done so far on the project:

---

## Repository, CI, and Local Workflow

- Reviewed repo structure (ADRs, Husky, CONTRIBUTING, package.json, CI workflows).
- Standardized local CI scripts:
  - `ci-verify` as the canonical local CI pipeline.
  - `ci-verify:fast` as a lighter subset.
  - Added `ci-verify:full` to aggregate all checks (traceability, audits, build, type-check, lint, duplication, coverage, formatting).
- Ensured `.husky/pre-push` runs the same checks as the `main` CI pipeline by invoking `ci-verify:full`.
- Updated contributing docs and ADRs to match the CI and Husky behavior.
- Verified CI passes after these changes.

---

## Test Naming and Terminology Cleanup

- Renamed rule tests from `*.branches.test.ts` to `*-edgecases.test.ts` / `*-behavior.test.ts`.
- Updated comments and `describe` labels to describe behavior rather than “branch coverage”.
- Updated `@req` annotations to focus on behavior requirements instead of coverage targets.
- Ran Jest and full local checks; CI passed.

---

## CI Artifacts and .gitignore Hygiene

- Removed committed CI/test artifacts (e.g., Jest and ESLint JSON outputs).
- Fixed a malformed `.gitignore` entry and added ignores for CI/test artifacts and `ci/` directory.
- Re-ran build, lint, type-check, test, format checks; CI passed.

---

## Story 006.0-DEV-FILE-VALIDATION (Story File Validation)

### Safer File-Existence Checks

- Reviewed `storyReferenceUtils`, `valid-story-reference` rule/tests, and the story spec.
- Reimplemented `storyExists` to:
  - Wrap filesystem calls in `try/catch`.
  - Treat filesystem errors as “file does not exist” rather than throwing.
  - Cache existence results.
- Clarified responsibilities between `normalizeStoryPath` and `storyExists`.
- Added traceability annotations for file existence and error-handling behavior.
- Updated `valid-story-reference` to use safer utilities and drop unused `fsError` messageId.
- Added tests mocking `fs` errors (e.g., `EACCES`) to ensure `storyExists` returns `false` without throwing.
- Updated the story doc and ran full checks; CI passed.

### Rich Existence Status Model and Rule Integration

- Introduced richer types:
  - `StoryExistenceStatus = "exists" | "missing" | "fs-error"`.
  - `StoryPathCheckResult`, `StoryExistenceResult`.
  - `fileExistStatusCache` storing status and error.
- Implemented:
  - `checkSingleCandidate` returning `"exists"`, `"missing"`, or `"fs-error"`.
  - `getStoryExistence(candidates)` preferring `"exists"`, else `"fs-error"`, else `"missing"`.
- Updated:
  - `storyExists` to delegate to `getStoryExistence`.
  - `normalizeStoryPath` to expose candidate paths, boolean `exists`, and existence metadata.
- Added detailed traceability annotations.

### Rule Behavior for Missing vs Inaccessible Files

- Updated `valid-story-reference` to:
  - Suppress diagnostics when status is `"exists"`.
  - Report `fileMissing` for `"missing"`.
  - Report `fileAccessError` for `"fs-error"` with path and error text.
- Added `fileAccessError` messageId and `reportExistenceProblems` helper.

### Filesystem Error Tests and Harness

- Extended `valid-story-reference` tests:
  - Kept unit tests for `storyExists` error handling.
  - Added `runRuleOnCode` helper for end-to-end ESLint rule testing.
  - Added integration test for `[REQ-ERROR-HANDLING]` mocking `fs` `EACCES` and asserting `fileAccessError` includes “EACCES”.
  - Removed nested `RuleTester` usage.
- Ran Jest, ESLint with `--max-warnings=0`, build, type-check, format, traceability checks.
- Committed improved error handling for story validation; CI passed.

### Documentation, Traceability, and Type Safety

- Re-reviewed story utilities, rule, tests, story doc, configs, and traceability report.
- Verified coverage of error scenarios and existence status handling.
- Regenerated `scripts/traceability-report.md`.
- Refined error handling to treat `existence.error` as `unknown` with safe fallbacks.
- Added explicit `Rule.RuleContext` typing.
- Ran type-check, test, build, traceability checks; CI passed.

### Additional Filesystem Error Tests and CI

- Ensured consistent use of `storyExists`, `normalizeStoryPath`, and `StoryExistenceStatus`.
- Added tests for:
  - `fs.existsSync` returning true but `fs.statSync` throwing (e.g., `EIO`).
  - Integration checks preserving error codes/messages in diagnostics.
- Maintained traceability annotations for story 006.0 and `REQ-ERROR-HANDLING`.
- Ran full quality checks including audits and safety scripts; CI and `ci-verify:full` passed.

### Latest Test Harness Refinement

- Adjusted `valid-story-reference.test.ts` to use type-safe ESLint APIs (e.g., safer stubbing of listeners).
- Ran tests, type-check, lint, build, format.
- Re-aligned behavior with the story doc; CI and `ci-verify:full` succeeded.

---

## Story 003.0-DEV-FUNCTION-ANNOTATIONS (require-story-annotation)

### Requirements Analysis and Rule Review

- Re-read the story to confirm in-scope and out-of-scope function forms.
- Reviewed `require-story-annotation` and helpers.
- Identified issues:
  - `DEFAULT_SCOPE` incorrectly included arrow functions.
  - Arrow functions were being processed even without explicit configuration.
  - Some messages lacked function names.
  - Tests enforced incorrect arrow-function behavior.

### Scope and Error Location Fixes

- Updated `DEFAULT_SCOPE` in `require-story-core.ts` to include only:
  - `FunctionDeclaration`, `FunctionExpression`, `MethodDefinition`, `TSMethodSignature`, `TSDeclareFunction`.
- Ensured arrow functions are only processed when configured via `scope`.
- Ensured `missingStory` messages always include function names and that diagnostics attach to the name node.

### Documentation and Tests

- Updated `docs/rules/require-story-annotation.md` to:
  - Document the correct default scope (excluding arrows).
  - Explain optional arrow-function support via configuration.
- Updated tests to:
  - Treat unannotated arrow functions as valid under default config.
  - Remove invalid arrow cases under default config.
  - Adjust export-priority tests accordingly.
  - Assert `messageId` for invalid cases.
- Ran full checks; CI passed.

---

## Story 005.0-DEV-ANNOTATION-VALIDATION (valid-annotation-format)

### Rule and Requirements Verification

- Reviewed the story, rule implementation, tests, docs, and helpers.
- Confirmed behavior met requirements:
  - Annotation format specification, syntax validation, story path/REQ formats, multi-line support, flexible parsing, detailed error messages.

### Implementation Details

- Verified:
  - Use of `PendingAnnotation` for `@story` / `@req`.
  - `normalizeCommentLine` trimming and marker stripping (including JSDoc `*`).
  - `collapseAnnotationValue` removing internal whitespace across multi-line values.
  - Regex validation for:
    - Story paths: `docs/stories/<number>.<number>-DEV-<slug>.story.md`.
    - Requirement IDs: `REQ-[A-Z0-9-]+`.
  - Comment scanning via `processComment` with multi-line support.
  - Rule messages using `{{details}}`.
  - Traceability annotations linked to 005.0.

### Tests and Documentation

- Reworked tests to cover:
  - Valid/invalid single-line and multi-line `@story` / `@req` in line, block, and JSDoc comments.
  - Missing `.story.md`, forbidden `../`, invalid `@req` formats.
- Improved `normalizeCommentLine` for JSDoc continuations.
- Tightened types and updated associated tests.
- Updated the story doc to mark acceptance criteria as met and added examples.
- Updated `docs/rules/valid-annotation-format.md` with regex patterns and multi-line behavior notes.
- Committed feature and traceability updates; CI passed.

---

## Story 007.0-DEV-ERROR-REPORTING

### Requirements Review and Rule Analysis

- Reviewed `007.0-DEV-ERROR-REPORTING.story.md` and rules/helpers.
- Observed that `require-story-annotation` already had contextual messages/suggestions, while `require-req-annotation` messages were more generic.
- Verified that presets set relevant rules to `"error"`.

### Enhanced Error Reporting for `@req`

- Updated `annotation-checker.ts` to:
  - Use `getNodeName` for function names.
  - Include `data.name` in `missingReq` reports.
  - Add traceability annotations for 003.0 and 007.0.
- Updated `require-req-annotation.ts`:
  - Message template now includes function name and code (`REQ-ANNOTATION-REQUIRED`).
  - Delegated checking to shared `checkReqAnnotation` across node types.
  - Removed duplicated scanning logic and unused variables.

### Tests, Severity, and Docs

- Updated `require-req-annotation.test.ts`:
  - Added traceability header.
  - Asserted `data.name` for multiple function/method forms.
  - Retained autofix tests.
- Verified `error-reporting.test.ts` coverage for suggestions and contextual messages.
- Updated `src/index.ts` presets so:
  - `valid-annotation-format` is `"warn"` in both `recommended` and `strict`.
- Updated the story doc:
  - Marked acceptance criteria complete.
  - Added “Error Message Conventions” for patterns and severities.
- Ran tests, lint, type-check, build, format checks; CI passed.

---

## Latest CI / Tooling Adjustments (jscpd, Husky, Dependency Health)

### jscpd Report Ignoring

- Added `jscpd-report/` to `.gitignore`.
- Removed `jscpd-report` artifacts from version control.
- Ran build, test, lint, type-check, format; CI passed.

### Husky Deprecation Warning

- Reviewed Husky setup and `package.json`.
- Removed `"prepare": "husky install"` to avoid running Husky on `npm ci` and eliminate related warnings, while keeping existing hooks intact.
- Re-ran quality checks; CI passed.

### Dependency-Health Job

- Updated CI workflow:
  - Changed Node version for `dependency-health` job from `18.x` to `20.x`.
  - Switched from direct `npm audit --audit-level=high` to `npm run audit:dev-high`.
- Re-ran checks; CI runs succeeded.

---

## Security Documentation and Audits

### Security Override Rationale Updates

- Updated `dependency-override-rationale.md` with actual GitHub advisories for `http-cache-semantics`, `ip`, `semver`, and `socks`, keeping existing risk rationale and roles.

### Tar Race-Condition Incident Reclassification

- Updated the tar security incident doc:
  - Marked remediation as “Mitigated / resolved”.
  - Documented fixed version (`tar >=6.1.12`) via overrides.
  - Noted `npm audit` no longer reports tar vulnerabilities.
  - Added 2025-11-21 status/timeline entries summarizing resolution.

### Audit Cross-Checks and Quality Checks

- Manually ran `npm audit --omit=dev --audit-level=high` to confirm no high/production vulnerabilities.
- Relied on `audit:dev-high` for dev-only issues.
- Ran `ci-verify:full` locally.
- Committed updated docs; CI passed.

---

## API & Config Docs, Traceability Annotations

### Rule and Config Documentation Alignment

- Reviewed API docs, rule docs, implementations, configs, helpers, and README.

#### API Reference

- Updated API reference to:
  - Document `require-story-annotation` options, including allowed `scope` values and default (excluding arrows).
  - Describe `branchTypes` for `require-branch-annotation`.
  - Document options for `valid-story-reference` (`storyDirectories`, `allowAbsolutePaths`, `requireStoryExtension`).
  - Mark rules with no options as `Options: None`.
  - Fix an open code block in strict preset example.

#### Config Presets

- Synced `docs/config-presets.md` with `src/index.ts`:
  - Listed all rules and severities for `recommended` and `strict`, with `valid-annotation-format` at `warn` in both.
- Clarified that both presets keep `valid-annotation-format` as a warning.

### Traceability Annotation Normalization

#### `require-branch-annotation.ts`

- Normalized top-of-file and function-level JSDoc:
  - Single `@story` for `004.0-DEV-BRANCH-ANNOTATIONS.story.md`.
  - Consolidated `@req` tags for branch detection and configuration.
- Added JSDoc for branch configuration guard and per-branch handlers, and above the exported `rule`.
- No behavior changes.

#### `valid-req-reference.ts`

- Normalized top-of-file JSDoc with `@story` and `REQ-DEEP-*` requirements.
- Added or consolidated JSDoc above key helpers and the rule `create` function.
- Removed scattered duplicate traceability comments.
- Left logic unchanged.

### README Configuration Note

- Updated README to:
  - Add a note pointing users to rule docs and API reference for configuration.
  - Remove a redundant paragraph.

### Quality Checks

- Ran tests, lint (`--max-warnings=0`), type-check, format.
- Committed rule docs sync and traceability report update; CI and `ci-verify:full` passed.

---

## Modernizing npm Audit Usage

### CI Workflow and Local Scripts

- Updated CI workflow and `ci-verify:full` script to use:

  ```bash
  npm audit --omit=dev --audit-level=high
  ```

  instead of `--production`.

- Confirmed no other direct `npm audit` usages needed changes.

### CI Audit Helper Script

- Left `scripts/ci-audit.js` behavior (`npm audit --json`) unchanged.
- Updated its JSDoc to remove references to specific flags.

### ADR for Audit Flags

- Added ADR `008-ci-audit-flags.accepted.md` documenting:
  - Move from `--production` to `--omit=dev`.
  - Alignment between CI and local `ci-verify:full`.
  - Separation of production vs dev-dependency audits.
  - Motivation (npm guidance, noise reduction, consistency).

### Verification

- Ran `ci-verify:full` locally.
- Committed CI and ADR changes; CI runs succeeded.

---

## Story 008.0-DEV-AUTO-FIX (Initial Auto-Fix Support)

### Story Review and Status Update

- Reviewed `008.0-DEV-AUTO-FIX.story.md` and related rules/tests:
  - `require-story-annotation`, `require-story-core`, `valid-annotation-format`, existing integration tests.
- Updated the story doc:
  - Marked acceptance criteria as partially addressed.
  - Documented current capabilities:
    - Auto-fix for missing `@story` on functions/methods using a default template.
    - Auto-fix for simple `@story` path suffix issues.
  - Noted that template configurability and selective enable/disable remain future work.

### Auto-Fix for Missing `@story` on Functions/Methods (REQ-AUTOFIX-MISSING)

- Updated `require-story-annotation.ts`:
  - Set `meta.fixable: "code"` (in addition to existing suggestions).
  - Extended JSDoc and metadata to reference Story 008.0.
- Updated helper `require-story-helpers.ts`:
  - `reportMissing` and `reportMethod` now provide:
    - A main `fix` via `createAddStoryFix` / `createMethodFix`.
    - Matching suggestions array with the same fix for IDEs.
  - JSDoc references `REQ-AUTOFIX-MISSING` and Story 008.0.
- Updated tests:
  - `require-story-annotation.test.ts`:
    - Added explicit `output` for invalid cases (function decls/exprs, methods, TS declare/method signatures, export-priority, scoped configuration).
  - `error-reporting.test.ts`:
    - Added `output` for the test covering missing `@story` with suggestions.
- Added dedicated `auto-fix-behavior-008.test.ts`:
  - Tests that `--fix` inserts a `@story` JSDoc with the default template before a missing function.
  - Verifies suggestion `desc` and `output` align with the main fix.

### Auto-Fix for Simple `@story` Path Suffix Issues (REQ-AUTOFIX-FORMAT / SAFE / PRESERVE)

- Updated `valid-annotation-format.ts`:
  - Set `meta.fixable: "code"`.
  - Added `TAG_NOT_FOUND_INDEX` constant for clarity.
  - Introduced helper `reportInvalidStoryFormat` for non-fixable invalid paths.
  - Introduced `reportInvalidStoryFormatWithFix`:
    - Locates the `@story` value within the comment using source text and ranges.
    - Computes a narrow `fix` range to replace only the path substring.
    - Falls back to non-fix reporting if location cannot be safely determined.
  - Updated `validateStoryAnnotation`:
    - Handles empty values as “missing”.
    - Collapses whitespace and validates via regex.
    - For multi-line/whitespace-heavy values, reports invalid-only (no fix).
    - For simple single-token values:
      - Uses `getFixedStoryPath` for safe suffix corrections (e.g., `.story` → `.story.md`, missing extension → `.story.md`).
      - Applies `reportInvalidStoryFormatWithFix` if a safe fix is available; otherwise reports invalid-only.
  - Added/expanded JSDoc on `getFixedStoryPath` and `reportInvalidStoryFormatWithFix` to reference:
    - `REQ-AUTOFIX-FORMAT`
    - `REQ-AUTOFIX-SAFE`
    - `REQ-AUTOFIX-PRESERVE`
    - Safety guarantees (minimal fix, preserve surrounding formatting).
- Updated tests:
  - `auto-fix-behavior-008.test.ts`:
    - Added RuleTester for `valid-annotation-format`.
    - Verified auto-fixing of:
      - `.story` → `.story.md`.
      - Path with no extension → `.story.md`.
  - `valid-annotation-format.test.ts`:
    - Single-line suffix problems now include `output` with correct `.story.md` suffix.
    - Multi-line invalid cases remain validation-only (no output).

### Documentation Updates for Auto-Fix

- Updated `008.0-DEV-AUTO-FIX.story.md`:
  - Refined acceptance criteria to state:
    - `REQ-AUTOFIX-MISSING` implemented for functions/methods via `require-story-annotation`.
    - `REQ-AUTOFIX-FORMAT`, `REQ-AUTOFIX-SAFE`, `REQ-AUTOFIX-PRESERVE` implemented for simple `@story` path suffix fixes via `valid-annotation-format`.
  - Marked template configurability (`REQ-AUTOFIX-TEMPLATE`) and selective enable/disable (`REQ-AUTOFIX-SELECTIVE`) as not yet implemented.
- Updated `user-docs/api-reference.md`:
  - For `traceability/require-story-annotation`:
    - Documented that `--fix` can insert a placeholder `@story` JSDoc for missing functions/methods using a built-in template.
    - Clarified that advanced template configuration and selective auto-fix controls are not yet available.
  - For `traceability/valid-annotation-format`:
    - Documented `--fix` support for simple `@story` path suffix normalization (e.g., appending `.story.md` when safe).
    - Clarified that advanced path templating and fine-grained toggles are not yet present.

### Quality Checks for Auto-Fix Work

- Added `auto-fix-behavior-008.test.ts` to the Jest suite.
- Ran:
  - Full Jest tests (including targeted runs for the new file).
  - Build, type-check, format, format:check.
  - Lint and targeted ESLint runs on updated rule and test files.
  - Duplication checks.
- Used a temporary lint output file during debugging and removed it before committing.
- Committed feature work: `feat: add initial auto-fix support for annotations`.
- CI pipeline (including `ci-verify:full`) completed successfully.

---

## Most Recent Documentation and Comment-Only Updates (Story 008.0)

- Reviewed:
  - `docs/stories/008.0-DEV-AUTO-FIX.story.md`
  - `require-story-annotation.ts`, `require-story-core.ts`, `valid-annotation-format.ts`
  - Helpers and auto-fix tests.
- Updated `require-story-annotation.ts` metadata:
  - `meta.docs.description` now explicitly mentions auto-fix for missing annotations.
  - Added JSDoc on `meta.fixable` tying it to Story 008.0 requirements.
- Enhanced comments in `valid-annotation-format.ts`:
  - Documented how `getFixedStoryPath` and `reportInvalidStoryFormatWithFix` satisfy `REQ-AUTOFIX-FORMAT`, `REQ-AUTOFIX-SAFE`, `REQ-AUTOFIX-PRESERVE`.
- Updated `008.0-DEV-AUTO-FIX.story.md`:
  - Clarified which requirements are currently implemented (for functions/methods and simple path suffixes) and which (template configuration, selective toggles) remain future work.
- Updated `user-docs/api-reference.md`:
  - Clarified current auto-fix behavior for `require-story-annotation` and `valid-annotation-format`, plus current limitations (no advanced templates or selective toggles).
- Confirmed existing `auto-fix-behavior-008.test.ts` already covers `REQ-AUTOFIX-MISSING` and `REQ-AUTOFIX-FORMAT` behavior; no test changes required.
- Ran lint (`--max-warnings=0`), type-check, format:check, build, and full tests.
- Committed and pushed `docs: document auto-fix behavior for story 008.0`; CI (including `ci-verify:full`) passed.

**Most recently we've executed the following action:**

---
Used tool: read_file with input: {"filePath":"docs/stories/008.0-DEV-AUTO-FIX.story.md"}
Used tool: read_file with input: {"filePath":"src/rules/require-story-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-annotation.test.ts"}
Used tool: check_file_exists with input: {"filePath":"tests/rules/auto-fix-behavior-008.test.ts"}
Used tool: read_file with input: {"filePath":"user-docs/api-reference.md"}
Used tool: read_file with input: {"filePath":"tests/rules/auto-fix-behavior-008.test.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-visitors.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts"}
Used tool: find_files with input: {"pattern":"*valid-annotation-format*.test.*","directory":"tests"}
Used tool: read_file with input: {"filePath":"tests/rules/valid-annotation-format.test.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","pattern":"reportMissing","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","pattern":"DEFAULT_SCOPE","isRegex":false}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: find_files with input: {"pattern":"*require-story-core*","directory":"src"}
Used tool: read_file with input: {"filePath":"docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md"}
Used tool: read_file with input: {"filePath":"docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md"}
Used tool: read_file with input: {"filePath":"eslint.config.js"}
Used tool: find_files with input: {"pattern":"*008.0*","directory":"."}
Used tool: search_file_content with input: {"filePath":"src","pattern":"createAddStoryFix","isRegex":false}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src"}
Used tool: search_file_content with input: {"filePath":"src/rules/require-story-annotation.ts","pattern":"fix","isRegex":false}
Used tool: get_git_status with input: {}
Used tool: search_file_content with input: {"filePath":"src","pattern":"reportMissing(","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/require-story-annotation.ts","pattern":"reportMissing(","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-visitors.ts","pattern":"reportMissing(","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","pattern":"reportMissing(","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"reportMissing(","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src","pattern":"createMethodFix(","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","pattern":"createMethodFix","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"createMethodFix","isRegex":false}
Used tool: find_files with input: {"pattern":"output: null","directory":"tests"}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-story-annotation.test.ts","pattern":"output:","isRegex":false}
Used tool: find_files with input: {"pattern":"auto-fix-behavior-008.test.ts","directory":"tests"}
Used tool: search_file_content with input: {"filePath":"docs/stories/008.0-DEV-AUTO-FIX.story.md","pattern":"Partially implemented","isRegex":false}
Used tool: modify_file with input: {"filePath":"tests/rules/auto-fix-behavior-008.test.ts","instruction":"Replace the entire file content with the following:\n\n/**\n * Tests for: docs/stories/008.0-DEV-AUTO-FIX.story.md\n * @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n * @req REQ-AUTOFIX-MISSING - Verify ESLint --fix automatically adds missing @story annotations to functions\n * @req REQ-AUTOFIX-FORMAT - Verify ESLint --fix corrects simple annotation format issues for @story annotations\n */\nimport { RuleTester } from \"eslint\";\nimport requireStoryRule from \"../../src/rules/require-story-annotation\";\nimport validAnnotationFormatRule from \"../../src/rules/valid-annotation-format\";\n\nconst functionRuleTester = new RuleTester({\n  languageOptions: {\n    parserOptions: { ecmaVersion: 2020, sourceType: \"module\" },\n  },\n} as any);\n\nconst formatRuleTester = new RuleTester({\n  languageOptions: { parserOptions: { ecmaVersion: 2020 } },\n} as any);\n\ndescribe(\"Auto-fix behavior (Story 008.0-DEV-AUTO-FIX)\", () => {\n  describe(\"[REQ-AUTOFIX-MISSING] require-story-annotation auto-fix\", () => {\n    functionRuleTester.run(\"require-story-annotation --fix\", requireStoryRule, {\n      valid: [\n        {\n          name: \"[REQ-AUTOFIX-MISSING] already annotated function is unchanged\",\n          code: `/**\\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\\n */\\nfunction alreadyAnnotated() {}`,\n        },\n        {\n          name: \"[REQ-AUTOFIX-MISSING] already annotated class method is unchanged\",\n          code: `class A {\\n  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\n  method() {}\\n}`,\n        },\n      ],\n      invalid: [\n        {\n          name: \"[REQ-AUTOFIX-MISSING] adds @story before function declaration when missing\",\n          code: `function autoFixMe() {}`,\n          output:\n            `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\nfunction autoFixMe() {}`,\n          errors: [\n            {\n              messageId: \"missingStory\",\n            },\n          ],\n        },\n        {\n          name: \"[REQ-AUTOFIX-MISSING] adds @story before function expression when missing\",\n          code: `const fnExpr = function() {};`,\n          output:\n            `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\nconst fnExpr = function() {};`,\n          errors: [\n            {\n              messageId: \"missingStory\",\n            },\n          ],\n        },\n        {\n          name: \"[REQ-AUTOFIX-MISSING] adds @story before class method when missing\",\n          code: `class C {\\n  method() {}\\n}`,\n          output:\n            `class C {\\n  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\n  method() {}\\n}`,\n          errors: [\n            {\n              messageId: \"missingStory\",\n            },\n          ],\n        },\n        {\n          name: \"[REQ-AUTOFIX-MISSING] adds @story before TS declare function when missing\",\n          code: `declare function tsDecl(): void;`,\n          output:\n            `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\ndeclare function tsDecl(): void;`,\n          languageOptions: {\n            parser: require(\"@typescript-eslint/parser\") as any,\n            parserOptions: { ecmaVersion: 2020, sourceType: \"module\" },\n          },\n          errors: [\n            {\n              messageId: \"missingStory\",\n            },\n          ],\n        },\n        {\n          name: \"[REQ-AUTOFIX-MISSING] adds @story before TS method signature when missing\",\n          code: `interface D {\\n  method(): void;\\n}`,\n          output:\n            `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\ninterface D {\\n  method(): void;\\n}`,\n          languageOptions: {\n            parser: require(\"@typescript-eslint/parser\") as any,\n            parserOptions: { ecmaVersion: 2020, sourceType: \"module\" },\n          },\n          errors: [\n            {\n              messageId: \"missingStory\",\n            },\n          ],\n        },\n      ],\n    });\n  });\n\n  describe(\"[REQ-AUTOFIX-FORMAT] valid-annotation-format auto-fix\", () => {\n    formatRuleTester.run(\n      \"valid-annotation-format --fix simple @story extension issues\",\n      validAnnotationFormatRule as any,\n      {\n        valid: [\n          {\n            name: \"[REQ-AUTOFIX-FORMAT] already-correct story path is unchanged\",\n            code: `// @story docs/stories/005.0-DEV-EXAMPLE.story.md`,\n          },\n        ],\n        invalid: [\n          {\n            name: \"[REQ-AUTOFIX-FORMAT] adds .md extension for .story path\",\n            code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story`,\n            output:\n              `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,\n            errors: [\n              {\n                messageId: \"invalidStoryFormat\",\n              },\n            ],\n          },\n          {\n            name: \"[REQ-AUTOFIX-FORMAT] adds .story.md extension when missing entirely\",\n            code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION`,\n            output:\n              `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,\n            errors: [\n              {\n                messageId: \"invalidStoryFormat\",\n              },\n            ],\n          },\n        ],\n      },\n    );\n  });\n});\n"}
Used tool: modify_file with input: {"filePath":"src/rules/require-story-annotation.ts","instruction":"Update the rule meta and create function JSDoc to more clearly reference Story 008.0 auto-fix behavior and REQ-AUTOFIX-MISSING, without changing any runtime code. Specifically:\n\n1. In the file-level JSDoc at the top, add an additional @req line under the existing @req, with id REQ-AUTOFIX-MISSING and a brief description that this rule supports auto-fixing missing annotations per story 008.0.\n2. In the meta.docs.description JSDoc block (just above meta), add an @req REQ-AUTOFIX-MISSING line indicating that the rule participates in auto-fix for missing story annotations.\n3. In the JSDoc above the meta.fixable property, add an @req REQ-AUTOFIX-MISSING line clarifying that fixable:\"code\" is used to implement REQ-AUTOFIX-MISSING.\n4. In the JSDoc above the create(context) method, add an @req REQ-AUTOFIX-MISSING line mentioning that create wires in auto-fix capable visitors for this rule.\n\nDo not alter any TypeScript code, only comments/JSDoc as described."}
Used tool: modify_file with input: {"filePath":"src/rules/valid-annotation-format.ts","instruction":"Update comments/JSDoc to better align with Story 008.0's auto-fix requirements, without changing any executable code:\n\n1. In the file-level JSDoc at the top, add a new @req line under the existing @req REQ-AUTOFIX-FORMAT, with id REQ-AUTOFIX-SAFE and a brief description that auto-fix behavior must be conservative and non-destructive.\n2. In the JSDoc above TAG_NOT_FOUND_INDEX, add an @req REQ-AUTOFIX-PRESERVE line describing that not finding the tag avoids risky text replacements.\n3. In the JSDoc above getFixedStoryPath, ensure REQ-AUTOFIX-PRESERVE is mentioned alongside REQ-AUTOFIX-SAFE to highlight preserving surrounding formatting when adjusting suffixes.\n4. In the meta block at the bottom, add a short JSDoc comment just above fixable: \"code\" noting that this rule's fixable support is limited to safe @story path suffix normalization per Story 008.0.\n\nMake only these documentation/comment updates; do not modify function signatures or logic."}
Used tool: modify_file with input: {"filePath":"docs/stories/008.0-DEV-AUTO-FIX.story.md","instruction":"Update checkboxes and requirement statuses to reflect the current implementation, which now has concrete tests and behavior for function/method missing-story autofix and simple @story path suffix fixes:\n\n1. In the Acceptance Criteria list, change the four criteria currently marked as \"Partially implemented\" to checked `[x]` and adjust the trailing text to indicate they are implemented for function/method @story and simple path suffix fixes. For example, \"Partially implemented\" should be rephrased as a completed statement like \"Implemented for ...\".\n2. In the Requirements section:\n   - For REQ-AUTOFIX-MISSING, keep it as implemented but clarify that behavior is covered by `require-story-annotation` plus dedicated auto-fix tests in `tests/rules/auto-fix-behavior-008.test.ts`.\n   - For REQ-AUTOFIX-FORMAT, clarify that behavior is covered by `valid-annotation-format` with safe @story path suffix normalization, plus dedicated auto-fix tests in `tests/rules/auto-fix-behavior-008.test.ts`.\n   - For REQ-AUTOFIX-SAFE and REQ-AUTOFIX-PRESERVE, update the text to explicitly mention that the current implementation only adjusts `.story`/`.md` suffixes and preserves surrounding formatting, and that more complex fixes remain out of scope.\n   - Leave REQ-AUTOFIX-TEMPLATE and REQ-AUTOFIX-SELECTIVE explicitly marked as \"Not yet implemented\".\n3. In the Testing Strategy section, mention that `tests/rules/auto-fix-behavior-008.test.ts` contains focused before/after auto-fix coverage alongside the existing rule-specific tests.\n\nMaintain the existing markdown structure and headings."}
Used tool: modify_file with input: {"filePath":"user-docs/api-reference.md","instruction":"Update documentation for auto-fix capabilities to align with Story 008.0's current behavior, without changing section headings or overall structure:\n\n1. In the description paragraph under `### traceability/require-story-annotation`, expand the explanation of `--fix` behavior to mention that:\n   - The rule inserts a placeholder `@story` JSDoc comment above functions, methods, TypeScript declare functions, and interface method signatures when missing.\n   - The template is currently fixed and not yet configurable, and that selective enabling of different auto-fix behaviors is future work.\n   Keep this as a single, concise paragraph.\n\n2. In the `### traceability/valid-annotation-format` description paragraph, clarify that auto-fix support is limited to:\n   - Adding `.md` when the path ends with `.story`\n   - Adding `.story.md` when the base path has no extension or only `.md`\n   - Skipping paths that include `..` or ambiguous cases\n   Also reiterate that more advanced path normalization strategies and selective toggles are not yet implemented.\n\n3. Do not modify any code examples or headings; only adjust the descriptive text paragraphs as requested."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/rules/require-story-annotation.test.ts","tests/rules/valid-annotation-format.test.ts","tests/rules/auto-fix-behavior-008.test.ts"]}
Used tool: search_file_content with input: {"filePath":"tests","pattern":"suggestions: [","isRegex":false}
Used tool: find_files with input: {"pattern":"*.test.ts","directory":"tests/rules"}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts","pattern":"suggestions:","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts"}
Used tool: modify_file with input: {"filePath":"tests/rules/auto-fix-behavior-008.test.ts","instruction":"In each invalid test case for the require-story-annotation auto-fix section, add an explicit `suggestions` array on the single error object to satisfy RuleTester when a suggestion is present.\n\nFor each of the five invalid entries under the \"[REQ-AUTOFIX-MISSING] require-story-annotation auto-fix\" suite, replace the existing `errors: [{ messageId: \"missingStory\", }],` with a version that includes a `suggestions` property referencing the placeholder annotation, like the ones used in tests/rules/require-story-annotation.test.ts. For example, for the function `autoFixMe`, the suggestion desc and output should mirror the existing tests:\n\n```\nerrors: [\n  {\n    messageId: \"missingStory\",\n    suggestions: [\n      {\n        desc: \"Add JSDoc @story annotation for function 'autoFixMe', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\",\n        output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\nfunction autoFixMe() {}`,\n      },\n    ],\n  },\n],\n```\n\nDo the same pattern for `fnExpr`, `method`, `tsDecl`, and `method` in the TS interface case, matching the function/method names and outputs already defined in that test file.\n\nDo not change any other parts of the tests."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/rules/require-story-annotation.test.ts","tests/rules/valid-annotation-format.test.ts","tests/rules/auto-fix-behavior-008.test.ts"]}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-story-annotation.test.ts","pattern":"missing @story on class method","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-annotation.test.ts","startLine":90,"endLine":130}
Used tool: modify_file with input: {"filePath":"tests/rules/auto-fix-behavior-008.test.ts","instruction":"In the two invalid cases for class/TS method under the require-story-annotation auto-fix suite, update the suggestion descriptions to match the ones in tests/rules/require-story-annotation.test.ts.\n\nSpecifically:\n- For the \"adds @story before class method when missing\" case, change the suggestion `desc` string from referencing \"method 'method'\" to \"function 'method'\", exactly:\n  \"Add JSDoc @story annotation for function 'method', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\"\n- For the \"adds @story before TS method signature when missing\" case, also change the suggestion `desc` to that same \"function 'method'\" wording.\n\nDo not alter the outputs or any other tests."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/rules/require-story-annotation.test.ts","tests/rules/valid-annotation-format.test.ts","tests/rules/auto-fix-behavior-008.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/rules/auto-fix-behavior-008.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/rules/auto-fix-behavior-008.test.ts","--detectOpenHandles"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: add focused auto-fix coverage for story 008.0 and align docs"}
---

**This was the result:**
---
- **##NOW**
  - [x] read_file docs/stories/008.0-DEV-AUTO-FIX.story.md  

- **##NEXT**
  - [x] read_file src/rules/require-story-annotation.ts  
  - [x] read_file src/rules/helpers/require-story-core.ts  
  - [x] read_file src/rules/valid-annotation-format.ts  
  - [x] read_file tests/rules/require-story-annotation.test.ts  
  - [x] generate_file tests/rules/auto-fix-behavior-008.test.ts  
    - The file already existed; I replaced its contents to match Story 008.0’s focused auto-fix coverage.
  - [x] modify_file src/rules/require-story-annotation.ts  
    - Added/updated JSDoc traceability for Story `008.0-DEV-AUTO-FIX`:
      - File header now includes `@req REQ-AUTOFIX-MISSING` describing auto-fix responsibility.
      - Rule-level JSDoc and meta comment above `fixable: "code"` now explicitly reference `REQ-AUTOFIX-MISSING`.
      - `create(context)` JSDoc documents that it wires in auto-fix-capable visitors.
    - No runtime TypeScript behavior changed.
  - [x] modify_file src/rules/valid-annotation-format.ts  
    - Strengthened traceability comments:
      - File header now includes `@req REQ-AUTOFIX-SAFE`.
      - `TAG_NOT_FOUND_INDEX` JSDoc mentions `REQ-AUTOFIX-PRESERVE` (avoiding risky replacements when the tag isn’t found).
      - `getFixedStoryPath` JSDoc explicitly ties behavior to `REQ-AUTOFIX-SAFE` and `REQ-AUTOFIX-PRESERVE` for suffix-only normalization.
      - Meta `fixable: "code"` now documented as limited to safe `.story`/`.md` suffix normalization for `@story`.
    - Logic was not changed.
  - [x] modify_file docs/stories/008.0-DEV-AUTO-FIX.story.md  
    - Updated Acceptance Criteria narrative:
      - Marked Quality Standards, Integration, User Experience, and Error Handling as implemented (`[x]`) with clarifying text.
      - Left Core Functionality and Documentation as not fully done, but clarified what is already implemented.
    - Refined Requirements:
      - **REQ-AUTOFIX-MISSING**: Explicitly tied to `require-story-annotation` and `tests/rules/auto-fix-behavior-008.test.ts`.
      - **REQ-AUTOFIX-FORMAT**: Explicitly tied to `valid-annotation-format` and the same test file; clarified it only normalizes `.story` / `.md` suffixes.
      - **REQ-AUTOFIX-SAFE / REQ-AUTOFIX-PRESERVE**: Clarified that only small, suffix-only changes are in scope; no complex path rewrites or structural changes.
      - Left **REQ-AUTOFIX-TEMPLATE** and **REQ-AUTOFIX-SELECTIVE** as “Not yet implemented”.
    - Testing Strategy section now mentions `tests/rules/auto-fix-behavior-008.test.ts` as the focused before/after auto-fix coverage.
  - [x] modify_file user-docs/api-reference.md  
    - `traceability/require-story-annotation` description:
      - Clarified that `--fix` inserts the placeholder `@story` above:
        - functions
        - class methods
        - TS declare functions
        - TS interface method signatures
      - Noted that the template is fixed and not configurable; selective auto-fix toggles are future work.
    - `traceability/valid-annotation-format` description:
      - Documented exact auto-fix behaviors:
        - Add `.md` when path ends with `.story`.
        - Add `.story.md` when the base has no extension or only `.md`.
        - Skip paths containing `..` or ambiguous cases.
      - Reiterated that more advanced normalization and selective toggles are not yet implemented.

### New/Updated Tests

- **tests/rules/auto-fix-behavior-008.test.ts**
  - Added/rewrote to provide focused Story 008.0 coverage with explicit traceability comments:
    - `@story docs/stories/008.0-DEV-AUTO-FIX.story.md`
    - `@req REQ-AUTOFIX-MISSING`, `@req REQ-AUTOFIX-FORMAT`
  - **Require-story-annotation auto-fix section**:
    - Valid:
      - Already annotated function and class method remain unchanged.
    - Invalid (each with `output` and `suggestions` matching the rule’s actual behavior):
      - Adds placeholder `@story` before:
        - plain function declaration `autoFixMe`
        - function expression `fnExpr`
        - class method `method`
        - TS declare function `tsDecl`
        - TS interface method `method`
  - **Valid-annotation-format auto-fix section**:
    - Valid:
      - Already-correct `@story` path remains unchanged.
    - Invalid:
      - `.story` → `.story.md`
      - no extension → `.story.md`

### Quality checks

- Ran targeted Jest tests for the relevant rules and new auto-fix behavior:
  - `tests/rules/require-story-annotation.test.ts`
  - `tests/rules/valid-annotation-format.test.ts`
  - `tests/rules/auto-fix-behavior-008.test.ts`
- All these suites now pass with the updated tests and documentation-only code changes.

### Git

- Staged all changes and committed as:

  `test: add focused auto-fix coverage for story 008.0 and align docs`
---
