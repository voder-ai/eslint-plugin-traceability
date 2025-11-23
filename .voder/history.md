Here’s a history‑only summary of what’s been done so far on the project, with no forward‑looking plans included.

---

## Maintenance Utilities, CLI, and API

- Reviewed existing maintenance utilities and tests:
  - `detectStaleAnnotations`, `updateAnnotationReferences`, `batchUpdateAnnotations`, `verifyAnnotations`, `generateMaintenanceReport`.
- Identified gaps: no dedicated CLI, limited UX/reporting, missing user docs, and maintenance utilities not exported via the main plugin API.

### Maintenance CLI Design and ADR

- Added ADR `docs/decisions/adr-maintenance-cli-interface.md` defining:
  - A `traceability-maint` CLI binary via `package.json` `bin`.
  - Entry point `src/maintenance/cli.ts`.
  - Subcommands: `detect`, `verify`, `report`, `update`.
  - Common flags: `--root`, `--json`, `--format`, `--from`, `--to`, `--dry-run`.
  - Exit codes: `0` (success), `1` (stale annotations), `2` (usage/error).
  - Constraint that the CLI is a thin wrapper around existing maintenance functions with all I/O handled in the CLI.

### Maintenance CLI Implementation

- Implemented `src/maintenance/cli.ts`:
  - `runMaintenanceCli(rawArgv: string[]): number` with Node shebang and `require.main === module` guard.
  - Manual arg parsing for supported subcommands and flags.
  - Subcommand handlers:
    - `detect`: calls `detectStaleAnnotations`, prints results or “No stale annotations found”, supports JSON, returns `EXIT_OK` or `EXIT_STALE`.
    - `verify`: calls `verifyAnnotations`, prints concise success/failure, returns `EXIT_OK` or `EXIT_STALE`.
    - `report`: calls `generateMaintenanceReport`, outputs text or JSON, always `EXIT_OK`.
    - `update`: validates `--from` / `--to`, supports `--dry-run` (uses `generateMaintenanceReport` to show impact) or performs updates via `updateAnnotationReferences`; supports text/JSON output; returns `EXIT_OK` or `EXIT_USAGE`.
  - Implemented `printHelp()` and shared exit code constants.
  - Added `@story` / `@req` annotations mapping CLI behavior to maintenance requirements.
  - Fixed lint issues.

### CLI Tests

- Added `tests/maintenance/cli.test.ts`:
  - Uses temp directories and helpers that adjust `process.cwd`.
  - Uses Jest spies for `console.log` / `console.error`.
  - Covered:
    - `detect` with no stale annotations.
    - `detect --json` with stale annotations.
    - `verify` with valid annotations.
    - `report` on a directory with a known stale story path.
    - `update`:
      - Real path replacements.
      - `--dry-run` behavior.
      - Usage errors for missing `--from`/`--to`.

### Maintenance API Exposure & Docs

- Updated `src/index.ts` to export a `maintenance` object exposing:
  - `detectStaleAnnotations`, `updateAnnotationReferences`, `batchUpdateAnnotations`, `verifyAnnotations`, `generateMaintenanceReport`.
- Updated `package.json` `bin` to register `traceability-maint`.
- Updated `README.md` and `user-docs/api-reference.md` with:
  - Maintenance function signatures, behavior, and limitations.
  - CLI commands, flags, JSON vs text output, and exit codes.

---

## Linting, Build, Tests, and CI Usage

- Regularly ran project tooling:
  - `npm run build`, `npm test`, `npm run lint`, `npm run type-check`, `npm run format`, `npm run format:check`.
- Fixed ESLint violations (unused symbols, magic numbers, style issues).
- Verified Husky pre‑push hooks (`ci-verify:full`) align with CI quality gate.
- Confirmed GitHub Actions CI remained green (matrix tests and scheduled jobs).

---

## CI/CD and Release Workflow

### Handling npm EOTP in Releases

- Investigated `semantic-release` failures due to npm EOTP / OTP prompts.
- Updated `.github/workflows/ci-cd.yml` so that:
  - Logs are scanned for `EOTP` / “one-time password”.
  - EOTP is treated as a tolerated condition:
    - `new_release_published` set to `false` and `new_release_version` cleared.
    - Job exits successfully in that specific case.
  - Other `semantic-release` errors still fail the job.

### CI Pipeline Consolidation

- Reviewed CI scripts for traceability checks, audits, etc.
- Consolidated main CI job into a single `npm run ci-verify:full`.
- Ensured:
  - `ci-verify:full` matches Husky pre‑push behavior.
  - Releases occur only from `main` on Node 20.
  - “Smoke test published package” job runs only when a new release is actually published.

---

## Documentation, Node Engines, and Security

### Maintenance Documentation Alignment

- Updated maintenance sections in:
  - `user-docs/api-reference.md`
  - `README.md`
- Aligned docs with current implementation:
  - Flag names, JSON response shapes, and behavioral details.

### Traceability Annotations

- Added `@story` / `@req` tags to `src/maintenance/cli.ts` linking:
  - `REQ-MAINT-DETECT`, `REQ-MAINT-VERIFY`, `REQ-MAINT-UPDATE`, `REQ-MAINT-SAFE`.

### Node Engine Version

- Updated `package.json`:
  - `engines.node` changed from `>=14` to `>=18.18.0`.
- Verified compatibility with ESLint 9 and the Node versions used in CI.

### Security Incidents Docs

- Updated incident docs:
  - `2025-11-17-glob-cli-incident.md`
  - `2025-11-18-brace-expansion-redos.md`
  - `2025-11-18-bundled-dev-deps-accepted-risk.md`
- Recorded:
  - Lack of safe upgrade paths for certain `glob` / `brace-expansion` dev dependencies.
  - Accepted‑risk decisions limited to dev tooling.
- Re-ran formatting and full CI after documentation changes.

---

## Configurable Patterns for `valid-annotation-format`

(Work under `010.1-DEV-CONFIGURABLE-PATTERNS`.)

### Requirements & Code Review

- Reviewed requirements/stories:
  - `010.1-DEV-CONFIGURABLE-PATTERNS.story.md`
  - `005.0-DEV-ANNOTATION-VALIDATION.story.md`
  - `007.0-DEV-ERROR-REPORTING.story.md`
- Reviewed implementation and tests for:
  - `src/rules/valid-annotation-format.ts`
  - `tests/rules/valid-annotation-format.test.ts`
  - `src/rules/valid-story-reference.ts`
  - `src/utils/storyReferenceUtils.ts`
- Reviewed rule docs:
  - `docs/rules/valid-annotation-format.md`
  - `user-docs/api-reference.md`
- Confirmed coverage of:
  - Configurable patterns with backward compatibility.
  - Invalid regex handling.
  - Example strings in error messages.
  - JSON-schema options and interoperability.
  - Test coverage expectations.

### Helper Module: `valid-annotation-options`

- Created `src/rules/helpers/valid-annotation-options.ts`:

  - Defined types:
    - `AnnotationRuleOptions` (nested + flat forms).
    - `ResolvedAnnotationOptions` (compiled regex and examples).

  - Default values:
    - Story pattern: `^docs/stories/[0-9]+\.[0-9]+-DEV-[\w-]+\.story\.md$`
    - Story example: `docs/stories/005.0-DEV-EXAMPLE.story.md`
    - Requirement pattern: `^REQ-[A-Z0-9-]+$`
    - Requirement example: `REQ-EXAMPLE`.

  - Implemented `resolveOptions(rawOptions: unknown[])`:
    - Normalizes ESLint options.
    - Merges flat and nested options (nested overrides flat).
    - Compiles regex, capturing errors and falling back to defaults.
    - Chooses examples (custom vs defaults).
    - Maintains module‑level `resolvedDefaults` and `optionErrors`.

  - Added helpers:
    - `getResolvedDefaults()`
    - `getDefaultReqExample()`
    - `getRuleSchema()` (JSON Schema, `additionalProperties: false`)
    - `getOptionErrors()`

  - Centralized `resolvePattern` with a scoped `max-params` disable.
  - Annotated with `@story` / `@req` for:
    - `REQ-PATTERN-CONFIG`, `REQ-REGEX-VALIDATION`, `REQ-BACKWARD-COMP`, `REQ-EXAMPLE-MESSAGES`, `REQ-SCHEMA-VALIDATION`.

### Updates to `valid-annotation-format` Rule

- Updated `src/rules/valid-annotation-format.ts` to consume the helper:
  - Imported option helpers and types.
  - Set `meta.schema = getRuleSchema()`.
  - Added `invalidRuleConfiguration` message ID.

- In `create(context)`:
  - Calls `resolveOptions(context.options || [])`.
  - Reads `getOptionErrors()`.
  - On `Program`, reports each config error via `invalidRuleConfiguration`.

- Validation behavior:

  - `@story`:
    - Validated against `options.storyPattern`.
    - Messages use `options.storyExample`.
    - Auto-fix uses `getFixedStoryPath` / `createStoryFix`, only when the fixed path matches `options.storyPattern`.
    - Falls back to non-fixing diagnostics using `getResolvedDefaults()` if no safe fix is possible.

  - `@req`:
    - Validated against `options.reqPattern`.
    - Messages use `options.reqExample` or `getDefaultReqExample()`.

  - Message builders:
    - `buildStoryErrorMessage`: distinguishes missing vs invalid story paths; includes example.
    - `buildReqErrorMessage`: distinguishes missing vs invalid requirement IDs; includes example and allowed-chars hint.

- Refactored auto-fix helpers (`createStoryFix`, `reportInvalidStoryFormatWithFix`) to use resolved defaults and examples.
- Reduced complexity by centralizing option parsing/defaults in the helper.
- Updated JSDoc and traceability to reference `010.1-DEV-CONFIGURABLE-PATTERNS`.

### Tests for Configurable Patterns

- Extended `tests/rules/valid-annotation-format.test.ts`:
  - Added traceability to:
    - `010.1-DEV-CONFIGURABLE-PATTERNS.story.md`
    - `REQ-CONFIGURABLE-PATTERNS-STORY`
    - `REQ-CONFIGURABLE-PATTERNS-REQ`
    - `REQ-CONFIGURABLE-PATTERNS-EXAMPLES`
    - `REQ-CONFIGURABLE-PATTERNS-FALLBACK`.
  - Preserved existing tests for defaults, multi-line comments, and auto-fix.

- Added tests covering:
  - Nested custom patterns (story and requirement).
  - Combined `story` + `req` configs.
  - Flat shorthand options and equivalence with nested options.
  - Precedence of nested options over flat options (both validation and messages).
  - Custom `example` values in messages.
  - Invalid regex configs:
    - Both nested and flat invalid patterns.
    - Emission of `invalidRuleConfiguration` diagnostics with detail.
    - Continued annotation diagnostics using defaults.
    - Auto-fix behavior when config is invalid (using defaults).

- Added tests focusing on nested vs flat precedence with traceability to `REQ-PATTERN-CONFIG` and `REQ-EXAMPLE-MESSAGES`.

### Documentation for Configurable Patterns

- Updated `docs/rules/valid-annotation-format.md`:
  - Described nested and flat configuration.
  - Documented defaults and precedence (nested overrides flat).
  - Documented behavior on invalid configs (diagnostics + fallback to defaults).
  - Synchronized examples and messages with implementation/tests.

- Updated `user-docs/api-reference.md`:
  - Described options, defaults, precedence, and behavior in line with the helper module.

- Updated `docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md`:
  - Marked Definition of Done items complete (tests, validation, messages, docs).

### Tooling & Git for Configurable Patterns

- Ran:
  - Targeted tests: `npm test -- --runTestsByPath tests/rules/valid-annotation-format.test.ts`
  - Full tests: `npm test`
  - `npm run lint`, `npm run type-check`, `npm run build`, `npm run format`, `npm run format:check`.
- Managed ESLint `max-params` with a localized disable in `resolvePattern`.
- Verified `npx lint-staged --no-tty` and standardized `.husky/pre-commit` for Husky v9.
- Committed and pushed feature, docs, and test changes with descriptive messages.
- Confirmed `ci-verify:full` and GitHub `CI/CD Pipeline` stayed green.

---

## Lint Threshold Tightening and Refactors

### Identifying and Enforcing `max-lines-per-function` at 55

- Inspected repo structure (`eslint.config.js`, helpers, stories, rule docs, traceability scripts) and searched for configurable pattern identifiers.
- Used ESLint with custom `max-lines-per-function` thresholds to identify long functions.

- Updated `eslint.config.js` for production TS/JS:
  - Changed `"max-lines-per-function"` from 60 to:
    - `["error", { max: 55, skipBlankLines: true, skipComments: true }]` for:
      - TS: `**/*.ts`, `**/*.tsx`
      - JS: `**/*.js`, `**/*.jsx`
  - Left test overrides with `max-lines-per-function: "off"` unchanged.

- Confirmed the change by running:
  - `npm run lint -- --max-warnings=0`
  - `npm test -- --runInBand`
  - `npm run type-check`
  - `npm run build`
  - `npm run format:check`
  - `npm run duplication`
  - `npm run check:traceability`
- Verified duplication metrics and traceability checks remained within thresholds.

### Refactors to Satisfy the 55-Line Limit

Performed targeted refactors of long functions, preserving behavior and traceability.

#### `src/maintenance/utils.ts` – `getAllFiles`

- Split into:
  - `getAllFiles(dir: string): string[]`
    - Validates directory and initializes list.
  - New internal helper (e.g., `traverseDirectory`) that:
    - Recurses through subdirectories.
    - Populates `fileList`.
- Kept existing `@story` / `@req` annotations, redistributing them appropriately.

#### `src/maintenance/update.ts` – `updateAnnotationReferences`

- Refactored so that:
  - `updateAnnotationReferences`:
    - Validates `codebasePath`.
    - Builds regex for `oldPath`.
    - Iterates files and delegates per-file work.
  - New helper (e.g., `processFileForAnnotationUpdates`):
    - Skips non-regular files.
    - Reads, replaces, and writes when content changes.
    - Updates a shared `replacementCountRef`.
- Preserved traceability comments around directory checks and replacements.

#### `src/maintenance/detect.ts` – `handleStoryMatch`

- `handleStoryMatch` now:
  - Performs unsafe-path guard with `isUnsafeStoryPath`.
  - Computes in-project and codebase candidates.
  - Delegates to:
    - New helper for enforcing boundaries and collecting in-project candidates.
    - New helper to check existence of those candidates.
- Behavior (stale detection, boundary enforcement) remains unchanged.

#### `src/utils/branch-annotation-helpers.ts` – `reportMissingAnnotations`

- Introduced a helper (e.g., `getBranchAnnotationInfo`) to:
  - Collect comment text.
  - Determine `missingStory` and `missingReq`.
  - Compute indentation and insertion position.
- `reportMissingAnnotations` now:
  - Calls the helper to get state.
  - Builds/actions and delegates to `reportMissingStory` / `reportMissingReq`.
- Traceability comments updated/retained.

#### `src/rules/valid-req-reference.ts` – `validateReqLine`

- Split responsibilities:
  - New helper to validate and resolve story path:
    - Handles traversal/absolute checks and reports invalid paths.
    - Returns resolved path or `null`.
  - New helper to load and cache requirements:
    - Reads story files and extracts `REQ-...` IDs into a `Set`.
  - New helper to check requirement existence:
    - Reports missing requirement when needed.
- `validateReqLine` is now a coordinator using these helpers.

#### `src/rules/valid-story-reference.ts` – security and boundary logic

- Created `src/rules/helpers/valid-story-reference-helpers.ts` containing:
  - `ReportInvalidPathFn` type alias.
  - `HandleBoundaryOptions` and `SecurityValidationOptions` interfaces.
  - `analyzeCandidateBoundaries(...)`
  - `handleProjectBoundaryForExistence(...)`
  - `performSecurityValidations(...)`
- Moved path traversal, absolute-path checks, and project-boundary enforcement from `valid-story-reference.ts` into this helper module.
- Updated `valid-story-reference.ts`:
  - `processStoryPath` calls `performSecurityValidations`.
  - Existence-handling code calls `handleProjectBoundaryForExistence`.
- Adjusted imports and removed unused ones (e.g., direct `path` usage) from `valid-story-reference.ts`.
- Ensured the file now satisfies both per-function and per-file length limits.

#### `src/rules/valid-annotation-format.ts` – `processComment` and utilities

- Extracted shared utilities into `src/rules/helpers/valid-annotation-utils.ts`:
  - `TAG_NOT_FOUND_INDEX`
  - `STORY_EXAMPLE_PATH`
  - `collapseAnnotationValue`
  - `getFixedStoryPath`
  - `buildStoryErrorMessage`
  - `buildReqErrorMessage`
- Updated `valid-annotation-format.ts` to import and use these helpers.
- Refactored `processComment`:
  - Extracted finalization logic into `finalizePendingAnnotation`.
  - Extracted per-line processing into `processCommentLine` that takes a single options object parameter.
  - `processComment` now coordinates initialization of state, delegates per-line processing, and finalizes pending annotations.
- Removed unused imports (`getDefaultReqExample`, `STORY_EXAMPLE_PATH`) from `valid-annotation-format.ts` once they were moved to the helper module.
- Ensured no `max-lines-per-function`, `max-params`, or `no-unused-vars` violations remain.

### Linting and Git State for the Refactors

- Used multiple ESLint runs (CLI and programmatic) to confirm:
  - No `max-lines-per-function` violations in `src/**/*.ts`.
  - `valid-annotation-format.ts` and `valid-story-reference.ts` are under the 300-line `max-lines` limit.
- Addressed `no-unused-vars` warnings in `valid-story-reference-helpers.ts` by:
  - Introducing shared types (`ReportInvalidPathFn`, `HandleBoundaryOptions`, `SecurityValidationOptions`).
  - Adjusting type definitions to avoid named parameter identifiers in type aliases that ESLint treated as unused.
- Ran `npm run lint-staged -- --allow-empty` to validate hooks.
- Staged and committed changes multiple times, including commits such as:
  - `refactor: split long functions to satisfy 55-line limit`
  - `refactor: split long functions and tighten max-lines-per-function`
- Confirmed via `git pull --rebase` that local `main` is up to date and checked remote CI pipeline status (remains green on `main`).

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"."}
Used tool: find_files with input: {"pattern":"package.json","directory":"."}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: list_directory with input: {"dirPath":"src"}
Used tool: list_directory with input: {"dirPath":"src/rules"}
Used tool: read_file with input: {"filePath":"eslint.config.js"}
Used tool: list_directory with input: {"dirPath":"src/utils"}
Used tool: list_directory with input: {"dirPath":"src/maintenance"}
Used tool: read_file with input: {"filePath":"src/index.ts"}
Used tool: search_file_content with input: {"filePath":"eslint.config.js","pattern":"max-lines-per-function","isRegex":false}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: list_directory with input: {"dirPath":"docs/decisions"}
Used tool: read_file with input: {"filePath":"docs/decisions/003-code-quality-ratcheting-plan.md"}
Used tool: list_directory with input: {"dirPath":"src/maintenance"}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src"}
Used tool: run_command with input: {"command":"npx","args":["eslint","src","--ext",".ts",".js","--format","json","--max-warnings","0"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--format","json","--output-file",".voder-eslint-report.json"]}
Used tool: run_command with input: {"command":"npx","args":["eslint","src","--ext",".ts","--format","json","--max-warnings","0"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings","0","--format","stylish"]}
Used tool: run_command with input: {"command":"node","args":["scripts/lint-plugin-check.js"]}
Used tool: run_command with input: {"command":"npx","args":["eslint","src/rules","--ext",".ts",".js","--print-config","src/rules/require-story-annotation.ts"]}
Used tool: run_command with input: {"command":"npx","args":["eslint","src/rules/require-story-annotation.ts","--print-config"]}
Used tool: run_command with input: {"command":"node","args":["-e","\"console.log('skip')\""]}
Used tool: search_file_content with input: {"filePath":"src","pattern":"max-lines-per-function","isRegex":false}
Used tool: find_files with input: {"pattern":"*.*","directory":"."}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src"}
Used tool: read_file with input: {"filePath":"src/maintenance/detect.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/report.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/update.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/cli.ts"}
Used tool: read_file with input: {"filePath":".voder-eslint-report.json"}
Used tool: read_file with input: {"filePath":"docs/decisions/code-quality-ratcheting-plan.md"}
Used tool: read_file with input: {"filePath":"docs/decisions/adr-pre-push-parity.md"}
Used tool: read_file with input: {"filePath":"src/maintenance/batch.ts"}
Used tool: run_command with input: {"command":"wc","args":["-l","src/**/*.ts"]}
Used tool: run_command with input: {"command":"find","args":["src","-name","\"*.ts\"","-print0"]}
Used tool: run_command with input: {"command":"ls","args":["-R","src"]}
Used tool: run_command with input: {"command":"bash","args":["-lc","for f in $(ls src/**/*.ts); do echo \"---- $f\"; nl -ba \"$f\" | sed -n '1,200p'; done"]}
Used tool: read_file with input: {"filePath":"src/maintenance/cli.ts","startLine":193,"endLine":400}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts","startLine":184,"endLine":340}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts","startLine":340,"endLine":520}
Used tool: read_file with input: {"filePath":"src/rules/valid-req-reference.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-annotation-options.ts"}
Used tool: run_command with input: {"command":"nl","args":["-ba","src/rules/valid-req-reference.ts"]}
Used tool: run_command with input: {"command":"nl","args":["-ba","src/maintenance/cli.ts"]}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-io.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-visitors.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-utils.ts"}
Used tool: run_command with input: {"command":"nl","args":["-ba","src/rules/helpers/valid-annotation-options.ts"]}
Used tool: get_git_status with input: {}
Used tool: search_file_content with input: {"filePath":".voder/history.md","pattern":"max-lines-per-function","isRegex":false}
Used tool: read_file with input: {"filePath":"src/rules/valid-story-reference.ts"}
Used tool: read_file with input: {"filePath":"src/utils/storyReferenceUtils.ts"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--listTests"]}
Used tool: run_command with input: {"command":"nl","args":["-ba","tests/maintenance/cli.test.ts"]}
Used tool: run_command with input: {"command":"nl","args":["-ba","tests/rules/valid-annotation-format.test.ts"]}
Used tool: modify_file with input: {"filePath":"src/maintenance/cli.ts","instruction":"Refactor the parseFlags function into smaller helpers: one to initialize default flags, and another to handle a single argument, to reduce the body size of parseFlags while preserving behavior and comments. Keep traceability comments associated with relevant logic."}
Used tool: run_command with input: {"command":"nl","args":["-ba","src/maintenance/cli.ts"]}
Used tool: modify_file with input: {"filePath":"src/rules/valid-req-reference.ts","instruction":"Refactor longer functions into smaller helpers where it reduces function body length while keeping behavior identical and preserving traceability annotations. Focus on validateReqLine, handleComment, and programListener if they are long."}
Used tool: run_command with input: {"command":"nl","args":["-ba","src/rules/valid-annotation-format.ts"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: split long maintenance and validation helpers"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts"}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts","instruction":"Remove the unused 'arg' parameter in the ReportInvalidPathFn type definition to satisfy no-unused-vars while preserving the shape of the function argument object."}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: split long maintenance and validation helpers"}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts","instruction":"Update the ReportInvalidPathFn type so the parameter is named but referenced only as a destructured object in call sites where needed; to avoid no-unused-vars, use an anonymous parameter `_` in the type definition instead of a named one."}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: split long maintenance and validation helpers"}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts","instruction":"Change the ReportInvalidPathFn type to use an anonymous parameter (e.g., `(_: { ... }) => void` is still named) would still trip no-unused-vars. Instead, define it as a type alias for a function that destructures its parameter inline: `(args: { storyPath: string; commentNode: any; context: any }) => void` is the same. To satisfy no-unused-vars, remove the parameter name entirely from the type and just describe the function shape via an interface instead (e.g., `interface ReportInvalidPathArgs { ... }` and `type ReportInvalidPathFn = (args: ReportInvalidPathArgs) => void;`) ensuring all identifiers are used."}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: split long maintenance and validation helpers"}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts","instruction":"Introduce an ESLint disable comment for no-unused-vars specifically on the ReportInvalidPathFn type alias, referencing the justification. Keep the ReportInvalidPathArgs interface and ReportInvalidPathFn alias, but ensure the alias reads:\n\n// eslint-disable-next-line no-unused-vars -- Parameter name used only in type position for documentation and IDE hints\nexport type ReportInvalidPathFn = (args: ReportInvalidPathArgs) => void;"}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: split long maintenance and validation helpers"}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings","0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/maintenance/cli.test.ts","tests/rules/valid-annotation-format.test.ts","tests/rules/valid-req-reference.test.ts"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
---

**This was the result:**
---
Here’s what I implemented for the ##NOW and ##NEXT sections and how they map to the plan.

---

## What I did

### NOW: Identify long production functions and refactor targets

- Scanned `src/**/*.ts` to find larger, central production functions using `nl -ba` and manual inspection, focusing on:
  - `src/maintenance/cli.ts`
    - `runMaintenanceCli`
    - `parseFlags`
    - Subcommand handlers (`handleDetect`, `handleVerify`, `handleReport`, `handleUpdate`)
  - `src/rules/valid-req-reference.ts`
    - `validateReqLine`
    - `handleComment`
    - `programListener`’s inner `Program` visitor
  - Confirmed overall enforcement via ESLint `max-lines-per-function` (see below).

These functions were approaching the existing limit and are central to maintenance and deep validation, so they were chosen as the first refactor targets to keep the codebase safely below a 55‑line ceiling and prepare for future ratcheting.

---

### NEXT-1: Lint configuration for 55-line functions

- Verified `eslint.config.js` already enforces a **55-line** maximum for production code:

  ```js
  // TypeScript files
  "max-lines-per-function": [
    "error",
    { max: 55, skipBlankLines: true, skipComments: true },
  ],
  // JavaScript files
  "max-lines-per-function": [
    "error",
    { max: 55, skipBlankLines: true, skipComments: true },
  ],
  ```

- Confirmed the **test override block** keeps `max-lines-per-function` disabled for tests:

  ```js
  {
    // Test files
    files: [
      "**/*.test.{js,ts,tsx}",
      "**/__tests__/**/*.{js,ts,tsx}",
    ],
    rules: {
      complexity: "off",
      "max-lines-per-function": "off",
      "max-lines": "off",
      "no-magic-numbers": "off",
      "max-params": "off",
    },
  },
  ```

No change was necessary here; the project is already at the 55‑line limit for production code and has the requested test relaxations.

---

### NEXT-2: Refactor selected long functions into smaller helpers

#### 1. `src/maintenance/cli.ts` (maintenance CLI flag parsing)

**Before**: `parseFlags` contained initialization plus all argument handling logic in one function.

**After**: Split into two helpers plus a slimmer `parseFlags`, preserving traceability comments:

- New helper: `createDefaultFlags`

  ```ts
  /**
   * Initialize default flags for the maintenance CLI.
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
   */
  function createDefaultFlags(): ParsedFlags {
    return {
      root: process.cwd(),
      json: false,
    };
  }
  ```

- New helper: `applyFlag`

  ```ts
  /**
   * Handle a single CLI argument and update the flags accordingly.
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
   */
  function applyFlag(flags: ParsedFlags, args: string[], index: number): number {
    const arg = args[index];

    if (arg === "--root" && typeof args[index + 1] === "string") {
      flags.root = path.resolve(args[index + 1]);
      return index + 1;
    }

    if (arg === "--json") {
      flags.json = true;
      return index;
    }

    if (arg === "--format" && typeof args[index + 1] === "string") {
      const value = args[index + 1];
      if (value === "text" || value === "json") {
        flags.format = value;
      } else {
        throw new Error(
          `Invalid format: ${value}. Expected 'text' or 'json'.`,
        );
      }
      return index + 1;
    }

    if (arg === "--from" && typeof args[index + 1] === "string") {
      flags.from = args[index + 1];
      return index + 1;
    }

    if (arg === "--to" && typeof args[index + 1] === "string") {
      flags.to = args[index + 1];
      return index + 1;
    }

    if (arg === "--dry-run") {
      flags.dryRun = true;
      return index;
    }

    return index;
  }
  ```

- Updated `parseFlags` to delegate:

  ```ts
  /**
   * Basic flag parser for maintenance CLI subcommands.
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
   */
  function parseFlags(args: string[]): ParsedFlags {
    const flags: ParsedFlags = createDefaultFlags();

    for (let i = 0; i < args.length; i += 1) {
      i = applyFlag(flags, args, i);
    }

    return flags;
  }
  ```

Result: `parseFlags` is shorter and more focused; flag semantics and error behavior are unchanged and still fully covered by `tests/maintenance/cli.test.ts`.

---

#### 2. `src/rules/valid-req-reference.ts` (deep @req validation rule)

Refactored to reduce function sizes and clarify responsibilities while preserving behavior and traceability.

Key extractions:

- Extracted requirement ID parsing:

  ```ts
  /**
   * Extract requirement ID from a @req line.
   * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
   * @req REQ-DEEP-PARSE - Parse annotation lines to extract requirement IDs
   */
  function extractReqIdFromLine(line: string): string | undefined {
    const parts = line.split(/\s+/);
    return parts[1];
  }
  ```

- Extracted story-path resolution and requirement loading:

  ```ts
  /**
   * Resolve story path and load requirements set for validation.
   * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
   * @req REQ-DEEP-PATH - Validate and resolve referenced story file paths
   * @req REQ-DEEP-CACHE - Cache requirement IDs discovered in story files
   */
  function resolveStoryAndRequirements(opts: {
    comment: any;
    context: any;
    storyPath: string;
    cwd: string;
    reqCache: Map<string, Set<string>>;
  }): { resolvedStoryPath: string | null; reqSet: Set<string> | null } {
    const { comment, context, storyPath, cwd, reqCache } = opts;

    const resolvedStoryPath = validateAndResolveStoryPath({
      comment,
      context,
      storyPath,
      cwd,
    });

    if (!resolvedStoryPath) {
      return { resolvedStoryPath: null, reqSet: null };
    }

    const reqSet = loadAndCacheRequirements({
      resolvedStoryPath,
      reqCache,
    });

    return { resolvedStoryPath, reqSet };
  }
  ```

- Simplified `validateReqLine` using the helpers:

  ```ts
  function validateReqLine(opts: {
    comment: any;
    context: any;
    line: string;
    storyPath: string | null;
    cwd: string;
    reqCache: Map<string, Set<string>>;
  }): void {
    const { comment, context, line, storyPath, cwd, reqCache } = opts;
    const reqId = extractReqIdFromLine(line);
    if (!reqId || !storyPath) {
      return;
    }

    const { reqSet } = resolveStoryAndRequirements({
      comment,
      context,
      storyPath,
      cwd,
      reqCache,
    });

    if (!reqSet) {
      return;
    }

    checkRequirementExists({
      comment,
      context,
      reqId,
      storyPath,
      reqSet,
    });
  }
  ```

- Split comment processing and program-level iteration:

  ```ts
  function processCommentLines(opts: {
    comment: any;
    context: any;
    cwd: string;
    reqCache: Map<string, Set<string>>;
    initialStoryPath: string | null;
  }): string | null {
    const { comment, context, cwd, reqCache, initialStoryPath } = opts;
    let storyPath = initialStoryPath;
    const rawLines = comment.value.split(/\r?\n/);
    for (const rawLine of rawLines) {
      const line = rawLine.trim().replace(/^\*+\s*/, "");
      storyPath = handleAnnotationLine({
        line,
        comment,
        context,
        cwd,
        reqCache,
        storyPath,
      });
    }
    return storyPath;
  }

  function handleComment(opts: {
    comment: any;
    context: any;
    cwd: string;
    reqCache: Map<string, Set<string>>;
    rawStoryPath: string | null;
  }): string | null {
    const { comment, context, cwd, reqCache, rawStoryPath } = opts;
    return processCommentLines({
      comment,
      context,
      cwd,
      reqCache,
      initialStoryPath: rawStoryPath,
    });
  }

  function processAllComments(opts: {
    sourceCode: any;
    context: any;
    cwd: string;
    reqCache: Map<string, Set<string>>;
    initialStoryPath: string | null;
  }): void {
    const { sourceCode, context, cwd, reqCache } = opts;
    let rawStoryPath = opts.initialStoryPath;
    const comments = sourceCode.getAllComments() || [];
    comments.forEach((comment: any) => {
      rawStoryPath = handleComment({
        comment,
        context,
        cwd,
        reqCache,
        rawStoryPath,
      });
    });
  }

  function programListener(context: any) {
    const sourceCode = context.getSourceCode();
    const cwd = process.cwd();
    const reqCache = new Map<string, Set<string>>();
    let rawStoryPath: string | null = null;

    return function Program() {
      processAllComments({
        sourceCode,
        context,
        cwd,
        reqCache,
        initialStoryPath: rawStoryPath,
      });
    };
  }
  ```

Result: the main functional pieces (`validateReqLine`, `handleComment`, the `Program` visitor) are shorter and clearer. All behavior is still covered by `tests/rules/valid-req-reference.test.ts`.

---

#### 3. `src/rules/helpers/valid-story-reference-helpers.ts` (small cleanup for lint)

While not a length refactor, this file was involved in lint failures and was cleaned up in a small, traceable way:

- Introduced a documented argument type and a dedicated function type alias:

  ```ts
  export interface ReportInvalidPathArgs {
    storyPath: string;
    commentNode: any;
    context: any;
  }

  // eslint-disable-next-line no-unused-vars -- Parameter name used only in type position for documentation and IDE hints
  export type ReportInvalidPathFn = (args: ReportInvalidPathArgs) => void;
  ```

This resolved the `no-unused-vars` lint error on the type parameter while keeping the existing runtime behavior and traceability annotations unchanged.

---

### NEXT-3: Ensure no remaining functions violate the 55-line limit

- ESLint is configured to error on `max-lines-per-function` > 55 for production code.
- I ran:

  ```bash
  npm run lint -- --max-warnings 0
  ```

- Lint completed successfully with **no `max-lines-per-function` violations**, which confirms:
  - All production TS/JS functions are at or under the 55‑line limit (excluding comments/blank lines, as configured).
  - Tests are exempt via their separate config block, as required.

Combined with the targeted refactors above, the codebase now complies cleanly with the 55‑line function constraint.

---

### Quality checks and CI/CD

Before and after refactoring, I ran and/or relied on:

- Local checks:
  - `npm run lint -- --max-warnings 0`
  - `npm run type-check`
  - Focused Jest subset over the affected areas:
    ```bash
    npm test -- --runTestsByPath \
      tests/maintenance/cli.test.ts \
      tests/rules/valid-annotation-format.test.ts \
      tests/rules/valid-req-reference.test.ts
    ```
- Husky pre-push hook (triggered by `git push`) ran `npm run ci-verify:full`, which includes:
  - build, type-check, lint (with built plugin guard), duplication, traceability check,
  - full Jest suite with coverage, format:check, and audits (including dev-high).
- GitHub Actions:
  - Monitored the `CI/CD Pipeline` workflow for the latest push; run `19607497618` completed with **conclusion: success**.

All quality gates passed.

---

## Updated plan with statuses

### NOW

- [x] Identify the production TypeScript and JavaScript functions that currently have the largest bodies and are likely to exceed a 55-line limit, and decide which ones should be refactored into smaller helpers first to support tightening the max-lines-per-function rule.

### NEXT

- [x] Update the linting configuration so that the maximum allowed function length for production code is reduced from 60 lines to 55 lines, keeping test-specific relaxations unchanged.  
      *(Verified the limit is already 55 in `eslint.config.js`; no change required.)*
- [x] Refactor the selected long functions into smaller, clearly named helper functions that each have a single responsibility while preserving existing behavior and maintaining the current traceability annotations.
- [x] Revisit any remaining functions that hit the new limit and iteratively split or simplify them until they comply with the 55-line constraint without introducing duplication or unnecessary complexity.  
      *(Confirmed via `npm run lint -- --max-warnings 0` that there are no `max-lines-per-function` violations in production code.)*
---
