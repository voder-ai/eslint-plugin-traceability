Here’s a history-only summary of what’s been done on the project so far, including the most recent work.

---

## Repository, CI, and Local Workflow

- Reviewed repository structure, ADRs, Husky hooks, `CONTRIBUTING.md`, `package.json`, and CI workflows.
- Standardized local CI scripts via an ADR:
  - `ci-verify` as the canonical local CI pipeline.
  - `ci-verify:fast` as a lighter subset.
- Documented that `.husky/pre-push` mirrors the `main` CI pipeline.
- Ran `build`, `test`, `lint`, `type-check`, `format:check` locally; confirmed CI run `19549516983` passed.
- Added `ci-verify:full` to aggregate all CI checks (traceability, audits, build, type-check, lint, duplication, coverage, formatting).
- Updated `.husky/pre-push` to call `ci-verify:full`, refreshed ADR and `CONTRIBUTING.md`, documented rollback steps; CI run `19550681639` passed.

---

## Test Naming and Terminology Cleanup

- Renamed rule tests from `*.branches.test.ts` to `*-edgecases.test.ts` / `*-behavior.test.ts`.
- Updated comments and `describe` blocks to emphasize behavior instead of “branch coverage”.
- Updated `@req` annotations to describe behavior requirements rather than coverage targets.
- Ran Jest and full local checks.
- Committed:
  - `test: rename branch-coverage rule tests to edgecase-focused names`
  - `test: retitle edge-case tests away from coverage terminology`
- Confirmed CI run `19550166603` passed.

---

## CI Artifacts and .gitignore Hygiene

- Removed committed CI/test artifacts:
  - `jest-coverage.json`, `jest-output.json`
  - `tmp_eslint_report.json`, `tmp_jest_output.json`
  - `ci/jest-output.json`, `ci/npm-audit.json`
- Fixed malformed `.gitignore` entry; added ignores for those artifacts and `ci/` directory.
- Committed `chore: clean up and ignore test/CI JSON artifacts`.
- Re-ran `build`, `lint`, `type-check`, `test`, `format:check`; CI run `19549866757` passed.

---

## Story 006.0-DEV-FILE-VALIDATION (story file validation)

### Safer File-Existence Checks

- Reviewed `storyReferenceUtils`, `valid-story-reference` rule/tests, and `006.0-DEV-FILE-VALIDATION.story.md`.
- Reimplemented `storyExists` to:
  - Wrap `fs.existsSync` / `fs.statSync` in `try/catch`.
  - Treat filesystem errors as “file does not exist” instead of throwing.
  - Cache results to avoid repeated filesystem calls.
- Clarified separation of responsibilities between `normalizeStoryPath` and `storyExists`.
- Added `@story` / `@req` annotations for file existence and error-handling behavior.
- Updated `valid-story-reference` rule to use safer utilities, treat inaccessible files as missing, and remove unused `fsError` messageId.
- Added Jest tests mocking `fs` errors (`EACCES`) to ensure `storyExists` returns `false` without throwing.
- Updated story doc; ran full checks; committed `fix: handle filesystem errors in story file validation`; CI passed.

### Rich Existence Status Model and Rule Integration

- Introduced:
  - `StoryExistenceStatus = "exists" | "missing" | "fs-error"`.
  - `StoryPathCheckResult`, `StoryExistenceResult`.
  - `fileExistStatusCache` storing status and error.
- Implemented:
  - `checkSingleCandidate` returning `"exists"`, `"missing"`, or `"fs-error"`.
  - `getStoryExistence(candidates)` preferring `"exists"`, then `"fs-error"`, else `"missing"`.
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
  - Retained the unit test for `EACCES` in `storyExists`.
  - Added `runRuleOnCode` helper for end-to-end ESLint rule testing.
  - Added `[REQ-ERROR-HANDLING]` integration test mocking `fs` `EACCES` and asserting `fileAccessError` includes “EACCES”.
  - Removed nested `RuleTester` usage.
- Ran Jest, ESLint (`--max-warnings=0`), `build`, `type-check`, `format:check`, `check:traceability`.
- Committed `fix: improve story file existence error handling and tests`; CI passed.

### Documentation, Traceability, and Type Safety

- Re-reviewed story utilities, rule, tests, story doc, configs, and `scripts/traceability-report.md`.
- Verified coverage of error scenarios and existence-status handling.
- Regenerated `scripts/traceability-report.md`.
- Refined `valid-story-reference` error handling to treat `existence.error` as `unknown` with safe fallbacks.
- Added explicit `Rule.RuleContext` typing.
- Ran `type-check`, `test`, `build`, `check:traceability`.
- Committed `fix: improve filesystem error handling for story validation`.

### Additional Filesystem Error Tests and CI

- Ensured consistent use of `storyExists`, `normalizeStoryPath`, and `StoryExistenceStatus`.
- Added tests for:
  - `fs.existsSync` returning true but `fs.statSync` throwing `EIO`.
  - Integration checks ensuring error codes/messages are preserved in diagnostics.
- Maintained traceability annotations for story 006.0 and `REQ-ERROR-HANDLING`.
- Ran full quality checks including audits and safety scripts.
- Committed `test: add fs error handling tests for valid-story-reference rule`; CI and `ci-verify:full` passed.

### Latest Test Harness Refinement

- Adjusted `valid-story-reference.test.ts` to use type-safe ESLint APIs (e.g., `listeners.Program({} as any)`).
- Ran tests, type-check, lint, build, and format checks.
- Committed `test: add error-handling coverage for valid-story-reference rule`.
- Re-aligned behavior with `006.0-DEV-FILE-VALIDATION.story.md`; CI and `ci-verify:full` succeeded.

---

## Story 003.0-DEV-FUNCTION-ANNOTATIONS (require-story-annotation)

### Requirements Analysis and Rule Review

- Re-read `003.0-DEV-FUNCTION-ANNOTATIONS.story.md` to confirm:
  - In scope: function declarations/expressions, methods, TS declare functions, TS method signatures.
  - Out of scope by default: arrow functions.
  - Diagnostics must be on function names and mention missing `@story` and `@req`.
- Reviewed `require-story-annotation` and helpers; identified:
  - `DEFAULT_SCOPE` incorrectly included arrow functions.
  - Visitors were handling `ArrowFunctionExpression` by default.
  - Some `missingStory` messages lacked function names.
  - Tests expecting incorrect arrow-function behavior.

### Scope and Error Location Fixes

- Updated `require-story-core.ts`:

  ```ts
  const DEFAULT_SCOPE = [
    "FunctionDeclaration",
    "FunctionExpression",
    "MethodDefinition",
    "TSMethodSignature",
    "TSDeclareFunction",
  ];
  ```

- Ensured arrow functions are processed only when configured via `scope`.
- Ensured `messages.missingStory` always includes function name and that reports attach to the name node.

### Documentation and Tests

- Updated `docs/rules/require-story-annotation.md`:
  - Corrected default scope (no arrow functions).
  - Documented optional arrow-function support via configuration.
- Updated tests:
  - Added valid case for unannotated arrow functions under default config.
  - Removed invalid arrow cases under default config.
  - Adjusted export-priority tests so exported arrow functions without `@story` are valid by default.
  - Ensured invalid cases assert `messageId`.
- Ran full checks; committed `fix: align require-story-annotation behavior with function annotation story`; CI passed.

---

## Story 005.0-DEV-ANNOTATION-VALIDATION (valid-annotation-format)

### Story Review and Implementation Verification

- Reviewed the story, rule, tests, docs, and helpers.
- Confirmed rule behavior matched requirements:
  - Format specification, syntax validation, story path and REQ formats, multi-line support, flexible parsing, and detailed error messages.

### Rule Implementation Details

- Verified:
  - Use of `PendingAnnotation` for `@story` / `@req`.
  - `normalizeCommentLine` trims and strips markers (including JSDoc `*`).
  - `collapseAnnotationValue` removes internal whitespace across multi-line values.
  - Regex validations for:
    - Story paths:

      ```ts
      /^docs\/stories\/[0-9]+\.[0-9]+-DEV-[\w-]+\.story\.md$/
      ```

    - Requirement IDs:

      ```ts
      /^REQ-[A-Z0-9-]+$/
      ```

  - `processComment` to handle comment scanning and multi-line annotations.
  - Rule messages using `{{details}}`.
  - Traceability annotations linked to story 005.0.

### Tests and Doc Updates

- Reworked tests:
  - Covered valid/invalid single-line and multi-line `@story` / `@req` in line, block, and JSDoc comments.
  - Checked missing `.story.md`, forbidden `../`, and invalid `@req` formats.
- Updated `normalizeCommentLine` to better handle JSDoc continuations.
- Tightened types (e.g., `rawLine: string`), adjusted related tests.
- Updated story doc to mark acceptance criteria as met and add examples.
- Updated `docs/rules/valid-annotation-format.md` with regex patterns and multi-line behaviors.
- Committed:
  - `feat: support multiline annotation values and detailed errors`
  - `chore: update traceability report for annotation validation changes`
  - `chore: fix type-check and formatting for annotation validation`
- Ran comprehensive checks; CI run `19557650401` passed.

---

## Story 007.0-DEV-ERROR-REPORTING

### Requirements Review and Rule Analysis

- Reviewed `007.0-DEV-ERROR-REPORTING.story.md` and inspected rules and helpers.
- Observed:
  - `require-story-annotation` already provided context-rich messages and suggestions.
  - `require-req-annotation` messages were more generic.
  - Presets set all rules, including `valid-annotation-format`, to `"error"`.

### Enhanced Error Reporting for `@req`

- Updated `annotation-checker.ts`:
  - Used `getNodeName` to obtain function names.
  - Updated `reportMissing` to include `data.name` for `missingReq`.
  - Added traceability annotations for stories 003.0 and 007.0.
- Updated `require-req-annotation.ts`:
  - Set message template:

    ```ts
    missingReq:
      "Missing @req annotation for function '{{name}}' (REQ-ANNOTATION-REQUIRED)",
    ```

  - Delegated checking to `checkReqAnnotation` for all relevant node types.
  - Removed duplicated inline scanning logic and unused variables.

### Tests, Severity, and Docs

- Updated `require-req-annotation.test.ts`:
  - Added traceability header.
  - Asserted `data.name` for functions, TS declare functions, and methods.
  - Retained autofix tests.
- Verified `error-reporting.test.ts` coverage for suggestions and contextual messages.
- Updated `src/index.ts` presets:
  - Set `"traceability/valid-annotation-format": "warn"` in both `recommended` and `strict`.
- Updated `007.0-DEV-ERROR-REPORTING.story.md`:
  - Marked acceptance criteria as complete.
  - Added “Error Message Conventions” for patterns and severities.
- Ran tests, lint, type-check, build, `format:check`; fixed ESLint findings.
- Committed `fix: enhance @req error reporting and align severities with error reporting story`; CI run `19558647869` passed.

---

## Latest CI / Tooling Adjustments (jscpd, Husky, dependency health)

### jscpd Report Ignoring

- Added `jscpd-report/` to `.gitignore`.
- Removed `jscpd-report/jscpd-report.json` from version control.
- Ran build, tests, lint, type-check, `format:check`.
- Included in `chore: ignore jscpd report and update ci tooling`.

### Husky Deprecation Warning

- Reviewed Husky setup and `package.json`.
- Removed `"prepare": "husky install"` to avoid running Husky on `npm ci` and to silence deprecation warnings, while keeping existing hooks.
- Re-ran build, tests, lint, type-check, `format:check`.
- Changes recorded in:
  - `chore: ignore jscpd report and update ci tooling`
  - `ci: adjust dependency health audit and husky setup`.

### Dependency-Health Job

- Updated `.github/workflows/ci-cd.yml`:
  - Changed `dependency-health` job Node.js version from `18.x` to `20.x`.
  - Replaced `npm audit --audit-level=high` with `npm run audit:dev-high` to better handle dev-only vulnerabilities.
- Re-ran quality checks.
- Committed:
  - `chore: ignore jscpd report and update ci tooling`
  - `ci: adjust dependency health audit and husky setup`
- CI runs `19559031454` and `19559073411` passed.

---

## Security Documentation and Audits

### Security Override Rationale Updates

- Updated `docs/security-incidents/dependency-override-rationale.md` with real GitHub advisories for:
  - `http-cache-semantics`
  - `ip`
  - `semver`
  - `socks`
- Preserved existing risk rationale and roles.

### Tar Race-Condition Incident Reclassification

- Updated `docs/security-incidents/2025-11-18-tar-race-condition.md`:
  - Marked remediation as “Mitigated / resolved”.
  - Documented fixed version `tar >=6.1.12` via overrides.
  - Noted that `npm audit` no longer reports tar vulnerabilities.
  - Added 2025-11-21 status and timeline entries summarizing resolution.

### Audit Cross-Checks and Quality Checks

- Manually ran `npm audit --omit=dev --audit-level=high` and confirmed no high/production vulnerabilities.
- Relied on `audit:dev-high` for dev-only issues.
- Ran `npm run ci-verify:full` locally (traceability, safety, audits, build, type-check, lint, duplication, coverage, formatting).
- Committed `docs: update security override rationale and tar incident status`.
- CI/CD Pipeline run `19559370301` passed.

---

## API & Config Docs, Traceability Annotations

### Rule and Config Documentation Alignment

- Reviewed API and rule docs, implementations, configs, helpers, and `README.md`.

#### API Reference (`user-docs/api-reference.md`)

- Updated `traceability/require-story-annotation`:
  - Documented allowed `scope` values and default list (excluding arrows).
- Documented `branchTypes` options for `traceability/require-branch-annotation`.
- Updated `traceability/valid-story-reference` options:
  - `storyDirectories`, `allowAbsolutePaths`, `requireStoryExtension`.
- Marked rules with no options as `Options: None`.
- Fixed an open code block in the strict preset example.

#### Config Presets (`docs/config-presets.md`)

- Synchronized with `src/index.ts` for `recommended` and `strict`:

  ```ts
  "traceability/require-story-annotation": "error",
  "traceability/require-req-annotation": "error",
  "traceability/require-branch-annotation": "error",
  "traceability/valid-annotation-format": "warn",
  "traceability/valid-story-reference": "error",
  "traceability/valid-req-reference": "error",
  ```

- Clarified that both presets keep `valid-annotation-format` at `warn`.

### Traceability Annotation Normalization

#### `src/rules/require-branch-annotation.ts`

- Normalized file-level and function-level JSDoc annotations:
  - Single `@story` for `004.0-DEV-BRANCH-ANNOTATIONS.story.md`.
  - Consolidated `@req` tags for branch detection and configurable scope.
- Added JSDoc for the branch configuration guard and per-branch handlers.
- Added rule-level JSDoc above the exported `rule` definition.
- No behavior changes.

#### `src/rules/valid-req-reference.ts`

- Normalized top-of-file JSDoc with `@story` and `REQ-DEEP-*` requirements.
- Added or consolidated JSDoc blocks above key helpers:
  - `extractStoryPath`
  - `validateReqLine`
  - `handleAnnotationLine`
  - `handleComment`
  - `programListener` and `create`
- Removed scattered, duplicated traceability comments.
- Left logic unchanged.

### README Configuration Note

- Updated `README.md`:
  - Added a concise note pointing to rule docs and API Reference for configuration details.
  - Removed a redundant paragraph.

### Quality Checks and Commits

- Ran tests, lint with `--max-warnings=0`, type-check, and `format:check`.
- Committed:
  - `docs: sync rule options and presets with implementation`
  - `chore: update traceability report artifact`
- Pushed; pre-push `ci-verify:full` and GitHub `CI/CD Pipeline` passed.

---

## Modernizing npm Audit Usage

### CI Workflow and Local Scripts

- Updated `.github/workflows/ci-cd.yml` “Run production security audit” step:

  ```yaml
  npm audit --omit=dev --audit-level=high
  ```

  replacing `npm audit --production --audit-level=high`.

- Updated `package.json` `ci-verify:full` script to match:

  ```bash
  npm audit --omit=dev --audit-level=high
  ```

- Confirmed there were no other direct `npm audit` invocations needing changes.

### CI Audit Helper Script

- Left `scripts/ci-audit.js` behavior unchanged (`npm audit --json`), but updated its JSDoc description so it no longer refers to a specific flag combination.

### ADR for Audit Flags

- Added `docs/decisions/008-ci-audit-flags.accepted.md` documenting:
  - The move from `--production` to `--omit=dev` for production-focused audits.
  - Alignment between CI and local `ci-verify:full`.
  - Separation of production audits (`--omit=dev`) from dev-dependency checks (`audit:dev-high`, safety tooling).
  - Motivation (following npm guidance, reducing noise, ensuring consistency).

### Verification and CI

- Ran `npm run ci-verify:full` locally; all steps passed.
- Committed:
  - `ci: use modern npm audit flags for CI and local checks`
  - `docs: record ADR for standardized npm audit flags`
- GitHub `CI/CD Pipeline` runs `19560177215` and `19560208005` succeeded.

---

## Story 008.0-DEV-AUTO-FIX (initial auto-fix support)

### Story Review and Status Update

- Read `docs/stories/008.0-DEV-AUTO-FIX.story.md` and related rules/tests:
  - `require-story-annotation`
  - `require-story-core` and helpers
  - `valid-annotation-format`
  - Existing annotation/CLI integration tests.
- Updated `008.0-DEV-AUTO-FIX.story.md`:
  - Marked acceptance criteria as *partially* addressed (initial implementation in place).
  - Added implementation notes describing current capabilities:
    - Auto-fix for missing `@story` on functions (using a default template).
    - Auto-fix for simple `@story` path suffix issues.
  - Left configurability and selective enable/disable as future work.

### Auto-Fix for Missing `@story` on Functions (REQ-AUTOFIX-MISSING)

**Rule metadata and JSDoc**

- Updated `src/rules/require-story-annotation.ts`:
  - Added `meta.fixable: "code"` while keeping `hasSuggestions: true`.
  - Extended JSDoc to reference `docs/stories/008.0-DEV-AUTO-FIX.story.md` in addition to existing stories.
  - Left helper behavior and options unchanged, aside from enabling fixes.

**Helper-level fix support**

- Updated `src/rules/helpers/require-story-helpers.ts`:

  - `reportMissing`:
    - Continued to compute target nodes and suggestion details.
    - Added a top-level `fix` property to `context.report`, using `createAddStoryFix(resolvedTarget)`.
    - Kept existing `suggest` array with the same description and fix for IDE suggestions.

  - `reportMethod`:
    - Mirrored the same pattern with `createMethodFix(resolvedTarget)` as both the main fix and suggestion.

- Extended JSDoc for these helpers to reference:
  - `docs/stories/008.0-DEV-AUTO-FIX.story.md`
  - `REQ-AUTOFIX-MISSING`

**Tests for require-story-annotation fixes**

- Updated `tests/rules/require-story-annotation.test.ts`:
  - For each invalid case, added `output` matching the first suggestion’s `output`:
    - Missing `@story` on:
      - Function declaration
      - Function expression
      - Class method
      - TS declare function
      - TS method signature
      - Exported function (exportPriority)
      - Function under scoped configuration
  - Ensured `errors` entries still validate:
    - `messageId: "missingStory"`
    - Suggestion descriptions and outputs.

- Updated `tests/rules/error-reporting.test.ts`:
  - For `[REQ-ERROR-SPECIFIC] missing @story annotation should report specific details and suggestion`, added `output` aligned with the suggestion’s fix.

**Dedicated auto-fix behavior tests**

- Added `tests/rules/auto-fix-behavior-008.test.ts`:
  - Included top-level traceability:

    ```ts
    /**
     * Tests for: docs/stories/008.0-DEV-AUTO-FIX.story.md
     * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
     * @req REQ-AUTOFIX-MISSING
     * @req REQ-AUTOFIX-FORMAT
     */
    ```

  - Created a `RuleTester` instance for `require-story-annotation`.
  - Valid case: annotated function remains unchanged.
  - Invalid case:
    - Code: `function autoFixMe() {}`
    - Output: function prefixed with `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`.
    - Errors: `messageId: "missingStory"` plus a `suggestions` array with:
      - `desc` exactly matching the rule’s suggestion description.
      - `output` equal to the fixed code.

- Confirmed this test exercises both `--fix` behavior (top-level output) and suggestions.

---

### Auto-Fix for Simple `@story` Path Suffix Issues (REQ-AUTOFIX-FORMAT)

**Rule metadata and JSDoc**

- Updated `src/rules/valid-annotation-format.ts`:
  - Added `meta.fixable: "code"`.
  - Extended JSDoc and helper annotations to reference:
    - `docs/stories/008.0-DEV-AUTO-FIX.story.md`
    - `REQ-AUTOFIX-FORMAT`
  - Kept existing validation semantics for invalid cases without safe fixes.

**Refactor and helpers for path auto-fix**

- Introduced a constant:

  ```ts
  const TAG_NOT_FOUND_INDEX = -1;
  ```

  used instead of literal `-1` for search failures.

- Added helper `reportInvalidStoryFormat`:
  - Reports `invalidStoryFormat` with `details` from `buildStoryErrorMessage("invalid", collapsed)`.

- Added `reportInvalidStoryFormatWithFix`:
  - Locates the `@story` value inside a comment:
    - Reads comment text via `context.getSourceCode()`.
    - Finds `@story` index.
    - Slices the substring after `@story`.
    - Matches the actual value portion (excluding leading/trailing whitespace or markers).
    - Computes a `fixRange` inside `comment.range`.
  - Calls `context.report` with:
    - `messageId: "invalidStoryFormat"`.
    - `details` as above.
    - A `fix` that replaces only the discovered value with the `fixed` path.
  - Falls back to `reportInvalidStoryFormat` if it cannot safely identify the path substring (e.g., tag not found or no value text).

- Left `buildStoryErrorMessage` and related utilities intact, adding traceability to cover autofix requirements.

**Simplified `validateStoryAnnotation` with auto-fix**

- Rewrote `validateStoryAnnotation` to orchestrate logic:

  - Trims the raw value; if empty:
    - Reports `"missing"` via `buildStoryErrorMessage("missing", null)`.
  - Collapses multi-line/internal whitespace via `collapseAnnotationValue`.
  - Checks `pathPattern` (`docs/stories/... .story.md`); if valid, returns (no error).
  - If the original trimmed value contains whitespace (`/\s/.test(trimmed)`):
    - Reports invalid-only (no fix) via `reportInvalidStoryFormat` to avoid complex/multi-line patching.
  - Otherwise:
    - Calls `getFixedStoryPath(collapsed)` to derive a corrected value for known patterns:
      - `.story` → `.story.md`
      - No extension → `.story.md`
    - If `fixed` exists and matches `pathPattern`:
      - Calls `reportInvalidStoryFormatWithFix` so ESLint can auto-fix the path.
    - Otherwise:
      - Calls `reportInvalidStoryFormat` without a fix.

- This limits auto-fix to simple, single-segment `@story` values and avoids unsafe transformations for multi-line or more complex annotations.

**Tests for valid-annotation-format auto-fix**

- Extended `tests/rules/auto-fix-behavior-008.test.ts` with a second `RuleTester` for `valid-annotation-format`:
  - Valid example: correctly suffixed story path remains unchanged.
  - Invalid examples:
    - Missing `.md` after `.story`.
    - Missing `.story.md` entirely.
  - Each invalid test:
    - Specifies input code with incorrect suffix.
    - Expects `output` with `.story.md` appended.
    - Uses `errors` entries with `messageId: "invalidStoryFormat"`.

- Updated `tests/rules/valid-annotation-format.test.ts`:
  - For single-line suffix problems:
    - Added `output` fields expecting `.story.md` appended.
  - Left multi-line invalid cases without `output` to remain validation-only.

---

## Documentation Updates for Auto-Fix

- Updated `docs/stories/008.0-DEV-AUTO-FIX.story.md`:
  - Marked relevant acceptance criteria (Core Functionality, Quality Standards, Integration, User Experience, Error Handling, Documentation) as partially addressed by this iteration.
  - Documented:
    - Auto-fix support for missing `@story` on functions using a default template.
    - Auto-fix support for simple `@story` path suffix issues.
    - Remaining areas (template configurability, selective enable/disable) as not yet implemented.

- Updated `user-docs/api-reference.md`:
  - `traceability/require-story-annotation`:
    - Added a short note that when run with `--fix`, the rule can insert a placeholder `@story` JSDoc comment above missing functions using a default template.
  - `traceability/valid-annotation-format`:
    - Added a note that when run with `--fix`, the rule can automatically correct simple `@story` path suffix issues (e.g., appending `.story.md` where the intended suffix is unambiguous).
  - Kept examples and options sections unchanged aside from these brief notes.

---

## Quality Checks for the Auto-Fix Work

- Added `tests/rules/auto-fix-behavior-008.test.ts` and integrated it into the Jest suite.
- Ran:

  - `npm test -- --runInBand` (full Jest suite, including new auto-fix tests).
  - `npm run build`.
  - `npm run type-check`.
  - `npm run format` and `npm run format:check`.
  - `npm run lint` and targeted ESLint invocations on:
    - `src/rules/require-story-annotation.ts`
    - `src/rules/valid-annotation-format.ts`
    - `src/rules/helpers/require-story-helpers.ts`
    - `tests/rules/auto-fix-behavior-008.test.ts`
  - `npm run duplication`.

- Used a temporary JSON lint output (`lint-output.json`) while debugging ESLint configuration; removed the file before committing.
- Staged and committed changes with message:
  - `feat: add initial auto-fix support for annotations`
- Pushed to the remote repository.
- Checked GitHub Actions “CI/CD Pipeline” for the branch; confirmed the workflow completed successfully.

**Most recently we've executed the following action:**

---
Used tool: read_file with input: {"filePath":"docs/stories/008.0-DEV-AUTO-FIX.story.md"}
Used tool: read_file with input: {"filePath":"src/rules/require-story-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-annotation.test.ts"}
Used tool: list_directory with input: {"dirPath":"."}
Used tool: find_files with input: {"pattern":"package.json","directory":"."}
Used tool: list_directory with input: {"dirPath":"tests/rules"}
Used tool: read_file with input: {"filePath":"tests/rules/auto-fix-behavior-008.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/valid-annotation-format.test.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-visitors.ts"}
Used tool: read_file with input: {"filePath":"user-docs/api-reference.md"}
Used tool: read_file with input: {"filePath":"docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md"}
Used tool: search_file_content with input: {"filePath":"docs/stories/008.0-DEV-AUTO-FIX.story.md","pattern":"configuration","isRegex":false}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: search_file_content with input: {"filePath":"src/rules","pattern":"REQ-AUTOFIX","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs/stories/008.0-DEV-AUTO-FIX.story.md","pattern":"REQ-AUTOFIX","isRegex":false}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src"}
Used tool: search_file_content with input: {"filePath":"tests/rules/auto-fix-behavior-008.test.ts","pattern":"REQ-AUTOFIX","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-helpers.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core-edgecases.test.ts"}
Used tool: list_directory with input: {"dirPath":"src/rules/helpers"}
Used tool: search_file_content with input: {"filePath":"src","pattern":"reportMissing(","isRegex":false}
Used tool: find_files with input: {"pattern":"*.test.ts","directory":"tests/rules"}
Used tool: get_git_status with input: {}
Used tool: search_file_content with input: {"filePath":"src/rules/valid-annotation-format.ts","pattern":"REQ-AUTOFIX-SAFE","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-helpers-edgecases.test.ts"}
Used tool: search_file_content with input: {"filePath":"src","pattern":"autofix","isRegex":true}
Used tool: search_file_content with input: {"filePath":"src/rules/require-story-annotation.ts","pattern":"fix","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/valid-annotation-format.ts","pattern":"fix(","isRegex":false}
Used tool: read_file with input: {"filePath":"docs/stories/custom-rules-development-guide.md"}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: run_command with input: {"command":"npm","args":["test"]}
Used tool: find_files with input: {"pattern":"*.md","directory":"docs"}
Used tool: read_file with input: {"filePath":"docs/custom-rules-development-guide.md"}
Used tool: search_file_content with input: {"filePath":"src","pattern":"REQ-AUTOFIX-MISSING","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","pattern":"REQ-AUTOFIX","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"REQ-AUTOFIX","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/valid-annotation-format.ts","pattern":"REQ-AUTOFIX","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md","pattern":"REQ-AUTOFIX","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md","pattern":"REQ-AUTOFIX","isRegex":false}
Used tool: read_file with input: {"filePath":"src/rules/require-story-annotation.ts"}
Used tool: read_file with input: {"filePath":".gitignore"}
Used tool: list_directory with input: {"dirPath":".voder"}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-io.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-utils.ts"}
Used tool: search_file_content with input: {"filePath":"src/rules/require-story-annotation.ts","pattern":"REQ-AUTOFIX","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/valid-annotation-format.ts","pattern":"REQ-AUTOFIX-FORMAT","isRegex":false}
Used tool: search_file_content with input: {"filePath":"user-docs/api-reference.md","pattern":"auto-fix","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","pattern":"reportMissing(","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","pattern":"createAddStoryFix","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-visitors-edgecases.test.ts"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","pattern":"REQ-AUTOFIX-MISSING","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/rules","pattern":"REQ-AUTOFIX-MISSING","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/valid-annotation-format.ts","pattern":"REQ-AUTOFIX-FORMAT","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/rules/auto-fix-behavior-008.test.ts","pattern":"REQ-AUTOFIX-MISSING","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/rules/auto-fix-behavior-008.test.ts","pattern":"REQ-AUTOFIX-FORMAT","isRegex":false}
Used tool: read_file with input: {"filePath":"scripts/traceability-check.js"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/rules/auto-fix-behavior-008.test.ts"]}
Used tool: read_file with input: {"filePath":"tests/rules/error-reporting.test.ts"}
Used tool: read_file with input: {"filePath":"docs/stories/008.0-DEV-AUTO-FIX.story.md"}
Used tool: search_file_content with input: {"filePath":".","pattern":"REQ-AUTOFIX","isRegex":false}
Used tool: modify_file with input: {"filePath":"src/rules/require-story-annotation.ts","instruction":"Replace the meta.docs.description string to explicitly mention auto-fix behavior, and add a short JSDoc comment on meta.fixable tying it to 008.0 story requirements. Do not change any runtime behavior."}
Used tool: modify_file with input: {"filePath":"src/rules/valid-annotation-format.ts","instruction":"Update or add JSDoc comments around the getFixedStoryPath and reportInvalidStoryFormatWithFix helpers to explicitly reference REQ-AUTOFIX-SAFE and REQ-AUTOFIX-PRESERVE from docs/stories/008.0-DEV-AUTO-FIX.story.md, clarifying the safety and formatting preservation guarantees. Do not change any executable code."}
Used tool: modify_file with input: {"filePath":"docs/stories/008.0-DEV-AUTO-FIX.story.md","instruction":"Update the \"Current Auto-Fix Capabilities (This Iteration)\" and any relevant requirement descriptions to reflect that REQ-AUTOFIX-MISSING is implemented for function and method annotations via require-story-annotation, and REQ-AUTOFIX-FORMAT/REQ-AUTOFIX-SAFE/REQ-AUTOFIX-PRESERVE are implemented for simple @story path suffix issues via valid-annotation-format. Clarify that template configurability and selective enable/disable behavior remain future work."}
Used tool: modify_file with input: {"filePath":"user-docs/api-reference.md","instruction":"In the rule descriptions for traceability/require-story-annotation and traceability/valid-annotation-format, update the prose to explicitly mention the current auto-fix behaviors aligned with Story 008.0: (1) require-story-annotation can insert a placeholder @story JSDoc annotation above missing functions/methods using a built-in template, and (2) valid-annotation-format can correct simple @story path suffix issues by appending or normalizing the .story.md suffix when safe. Clarify that advanced template configuration and selective auto-fix toggles are not yet available."}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","src/rules/require-story-annotation.ts","src/rules/valid-annotation-format.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"docs: document auto-fix behavior for story 008.0"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test"]}
Used tool: git_push with input: {}
---

**This was the result:**
---
## What I did

All tasks in the **##NOW** and **##NEXT** sections are complete. Changes were limited to documentation and comments; **no rule behavior or tests were changed**.

### Files inspected (traceability/context)

- Read story/spec:
  - `docs/stories/008.0-DEV-AUTO-FIX.story.md`
- Read implementation files:
  - `src/rules/require-story-annotation.ts`
  - `src/rules/helpers/require-story-core.ts`
  - `src/rules/valid-annotation-format.ts`
  - `src/rules/helpers/require-story-helpers.ts`
  - `src/rules/helpers/require-story-visitors.ts`
- Read tests:
  - `tests/rules/require-story-annotation.test.ts`
  - `tests/rules/auto-fix-behavior-008.test.ts`
  - Several helper/core tests to confirm existing auto-fix coverage

### Changes made

#### 1) `src/rules/require-story-annotation.ts`

Goal: Make the rule’s metadata clearly describe the auto‑fix capabilities for Story 008.0, without changing behavior.

Changes:

- Updated `meta.docs.description` to mention auto-fix:

```ts
docs: {
  description:
    "Require @story annotations on functions and auto-fix missing annotations where possible",
  recommended: "error",
},
```

- Added a JSDoc block documenting that `meta.fixable` is tied to Story 008.0:

```ts
/**
 * Auto-fix support for inserting @story annotations.
 *
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
fixable: "code",
```

Runtime logic in `create()` and the visitors remains unchanged.

#### 2) `src/rules/valid-annotation-format.ts`

Goal: Clarify how this rule fulfills `REQ-AUTOFIX-FORMAT`, `REQ-AUTOFIX-SAFE`, and `REQ-AUTOFIX-PRESERVE` for Story 008.0, without altering behavior.

Changes (comments only):

- Enhanced the doc comment on `getFixedStoryPath` to explicitly reference safety:

```ts
/**
 * Attempt a minimal, safe auto-fix for common @story path suffix issues.
 *
 * ...
 *
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-AUTOFIX-SAFE - Auto-fix must be conservative and never broaden the referenced path
 */
function getFixedStoryPath(original: string): string | null {
  ...
}
```

- Expanded the doc comment for `reportInvalidStoryFormatWithFix` to tie it directly to `REQ-AUTOFIX-SAFE` and `REQ-AUTOFIX-PRESERVE`:

```ts
/**
 * Report an invalid @story annotation and attempt a minimal, safe auto-fix
 * ...
 * This helper:
 *   - only adjusts the story path suffix when a safe, well-understood
 *     transformation is available, satisfying REQ-AUTOFIX-SAFE.
 *   - preserves all surrounding comment formatting, spacing, and text
 *     outside the path substring, satisfying REQ-AUTOFIX-PRESERVE.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-PATH-FORMAT - ...
 * @req REQ-AUTOFIX-FORMAT - ...
 * @req REQ-AUTOFIX-SAFE - ...
 * @req REQ-AUTOFIX-PRESERVE - ...
 */
```

All executable TypeScript remains the same.

#### 3) `docs/stories/008.0-DEV-AUTO-FIX.story.md`

Goal: Align the story text with the **current implemented behavior**.

Updates:

- Acceptance criteria now explicitly state that we have:

  - Initial support for:
    - Missing `@story` on **functions and methods** via `require-story-annotation`
    - **Simple `@story` path suffix fixes** via `valid-annotation-format`

- Requirements section now distinguishes implemented vs future:

  - **REQ-AUTOFIX-MISSING**:

    > Automatically add missing @story annotations to functions and methods using a simple built-in template via the `require-story-annotation` rule  
    > Implemented for function and method annotations in this story; template content and formatting are currently fixed and not yet configurable.

  - **REQ-AUTOFIX-FORMAT**:

    > Implemented for simple `@story` path suffix issues where the correct suffix (e.g., `.story.md`) can be inferred safely.

  - **REQ-AUTOFIX-SAFE** and **REQ-AUTOFIX-PRESERVE**:

    - Explicitly note current guarantees:
      - Safe insertion of placeholder `@story` comments above functions/methods
      - Minimal, suffix-only changes to path strings without touching surrounding formatting

  - **REQ-AUTOFIX-TEMPLATE** and **REQ-AUTOFIX-SELECTIVE**:

    - Clearly marked as **not yet implemented** and described as future work
    - Notes that current behavior uses a fixed template and that selective toggles beyond normal ESLint rule enable/disable are not supported yet

- “Current Auto-Fix Capabilities (This Iteration)” now explicitly references:
  - `require-story-annotation` for adding missing `@story` to functions/methods
  - `valid-annotation-format` for suffix normalization on `@story` paths

#### 4) `user-docs/api-reference.md`

Goal: Reflect actual auto-fix behavior for end users, mapped to Story 008.0.

Changes:

- **`traceability/require-story-annotation`** description updated:

  - States that when run with `--fix`, it:

    > can insert a placeholder `@story` JSDoc comment above missing functions/methods using a built-in template aligned with Story 008.0.

  - Clarifies limitations:

    > The auto-fix behavior is currently limited to this default template; advanced template customization and selective auto-fix toggles … are not yet available.

- **`traceability/valid-annotation-format`** description updated:

  - States that when run with `--fix`, it:

    > can automatically correct simple `@story` path suffix issues by appending or normalizing the `.story.md` suffix when it is safe and unambiguous to do so, in line with Story 008.0.

  - Clarifies **no advanced** path template customization or fine-grained toggles yet.

#### 5) `tests/rules/auto-fix-behavior-008.test.ts`

The plan mentioned generating this test file; it already existed and:

- Verifies **REQ-AUTOFIX-MISSING** behavior for `require-story-annotation`:
  - Adds `@story` before a missing function declaration via auto-fix
- Verifies **REQ-AUTOFIX-FORMAT** behavior for `valid-annotation-format`:
  - Adds `.md` to `.story`
  - Adds `.story.md` when extension is missing

No changes were needed; I validated that these tests align with the story and implementation.

### Quality checks & CI

Ran locally:

- `npm run lint -- --max-warnings=0`
- `npm run type-check`
- `npm run format:check` (then `npm run format` to fix formatting, then re-ran `format:check`)
- `npm run build`
- `npm test`
- Full CI-equivalent pipeline ran on push (reported in `git_push` output):
  - `npm run ci-verify:full` (including `check:traceability`, `safety:deps`, `audit:ci`, build, type-check, lint-plugin-check, lint, duplication, tests with coverage, format:check, audits)
  - All steps passed.

Committed and pushed:

- Commit: `docs: document auto-fix behavior for story 008.0`

---

## Updated plan with completion status

### NOW

- [x] read_file docs/stories/008.0-DEV-AUTO-FIX.story.md

### NEXT

- [x] read_file src/rules/require-story-annotation.ts
- [x] read_file src/rules/helpers/require-story-core.ts
- [x] read_file src/rules/valid-annotation-format.ts
- [x] read_file tests/rules/require-story-annotation.test.ts
- [x] generate_file tests/rules/auto-fix-behavior-008.test.ts  
      *(Satisfied by confirming the file already exists and correctly tests REQ-AUTOFIX-MISSING and REQ-AUTOFIX-FORMAT.)*
- [x] modify_file src/rules/require-story-annotation.ts
- [x] modify_file src/rules/valid-annotation-format.ts
- [x] modify_file docs/stories/008.0-DEV-AUTO-FIX.story.md
- [x] modify_file user-docs/api-reference.md
---
