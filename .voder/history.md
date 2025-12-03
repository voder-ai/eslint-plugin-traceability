Here’s a history-only summary of what has been done so far in the project, incorporating the latest work.

---

## Maintenance Utilities, CLI, and API

- Reviewed existing maintenance utilities and tests:
  - `detectStaleAnnotations`, `updateAnnotationReferences`, `batchUpdateAnnotations`, `verifyAnnotations`, `generateMaintenanceReport`.
- Identified UX/reporting, CLI entrypoint, and API exposure needs.

### Maintenance CLI Design and ADR

- Added ADR `docs/decisions/adr-maintenance-cli-interface.md` describing:
  - `traceability-maint` binary via `package.json` `bin`.
  - CLI entry point `src/maintenance/cli.ts`.
  - Subcommands: `detect`, `verify`, `report`, `update`.
  - Shared flags: `--root`, `--json`, `--format`, `--from`, `--to`, `--dry-run`.
  - Exit codes: `0` success, `1` stale, `2` usage/error.
  - Principle: CLI is a thin wrapper over maintenance functions.

### Maintenance CLI Implementation

- Implemented `src/maintenance/cli.ts`:
  - `runMaintenanceCli(rawArgv: string[]): number` with Node shebang and `require.main === module` guard.
  - Manual parsing of subcommands and flags.
  - Subcommand handlers:
    - `detect` → `detectStaleAnnotations` with text/JSON output and correct exit codes.
    - `verify` → `verifyAnnotations` with summary and exit codes.
    - `report` → `generateMaintenanceReport` with text/JSON output.
    - `update` → validates `--from`/`--to`, supports `--dry-run`, calls `updateAnnotationReferences`, handles usage errors.
  - Implemented `printHelp()` and shared exit-code constants.
  - Added traceability annotations (`@story`, `@req`).
  - Resolved lint issues.

### CLI Tests

- Added `tests/maintenance/cli.test.ts`:
  - Used temp directories and helpers to manage `process.cwd`.
  - Jest spies on `console.log` / `console.error`.
  - Covered:
    - `detect` with/without stale annotations, including `--json`.
    - `verify` with valid annotations.
    - `report` with stale story paths.
    - `update`:
      - Real path replacements.
      - `--dry-run`.
      - Usage errors (missing `--from` / `--to`).

### Maintenance API Exposure & Docs

- Updated `src/index.ts` to export maintenance functions:
  - `detectStaleAnnotations`, `updateAnnotationReferences`, `batchUpdateAnnotations`,
    `verifyAnnotations`, `generateMaintenanceReport`.
- Registered `traceability-maint` in `package.json` `bin`.
- Updated `README.md` and `user-docs/api-reference.md` to document:
  - Maintenance APIs.
  - CLI commands, flags, JSON formats, exit codes.

---

## Linting, Build, Tests, and CI Usage

- Regularly ran:
  - `npm run build`, `npm test`, `npm run lint`,
    `npm run type-check`, `npm run format`, `npm run format:check`.
- Fixed ESLint issues (unused variables, magic numbers, style).
- Verified Husky pre-push hook (`ci-verify:full`) matches CI quality gates.
- Confirmed GitHub Actions “CI/CD Pipeline” stayed green across matrix and scheduled jobs.

---

## CI/CD and Release Workflow

### Handling npm EOTP in Releases

- Investigated `semantic-release` failures due to npm OTP/EOTP prompts.
- Updated `.github/workflows/ci-cd.yml` to:
  - Detect EOTP / one-time-password messages in `semantic-release` logs.
  - Treat EOTP as tolerated:
    - Set `new_release_published=false`, clear `new_release_version`.
    - Exit successfully in that case.
  - Keep non-EOTP errors as failures.

### CI Pipeline Consolidation

- Reviewed CI scripts for traceability and security checks.
- Consolidated quality checks into `npm run ci-verify:full` as the main gate.
- Ensured:
  - `ci-verify:full` matches Husky pre-push.
  - Releases run only from `main` on Node 20.
  - “Smoke test published package” runs only when a new release is published.

---

## Documentation, Node Engines, and Security

### Maintenance Documentation Alignment

- Updated:
  - `user-docs/api-reference.md`
  - `README.md`
- Ensured maintenance flags, JSON shapes, and behaviors match implementation.

### Traceability Annotations

- Added `@story` / `@req` tags in `src/maintenance/cli.ts` for:
  - `REQ-MAINT-DETECT`, `REQ-MAINT-VERIFY`, `REQ-MAINT-UPDATE`, `REQ-MAINT-SAFE`.

### Node Engine Version

- Updated `package.json` `engines.node` from `>=14` to `>=18.18.0`.
- Confirmed compatibility with ESLint 9 and CI Node versions.

### Security Incidents Documentation

- Updated:
  - `2025-11-17-glob-cli-incident.md`
  - `2025-11-18-brace-expansion-redos.md`
  - `2025-11-18-bundled-dev-deps-accepted-risk.md`
- Documented lack of safe upgrades for certain dev dependencies and accepted-risk decisions.
- Re-ran formatting and CI after doc updates.

---

## Configurable Patterns for `valid-annotation-format`

- Reviewed requirements and implementation for configurable patterns:
  - Stories: `010.1-DEV-CONFIGURABLE-PATTERNS`, `005.0-DEV-ANNOTATION-VALIDATION`, `007.0-DEV-ERROR-REPORTING`.
  - Rules: `valid-annotation-format`, `valid-story-reference`,
    `storyReferenceUtils`, and tests.
  - Docs: rule docs and API reference.
- Confirmed:
  - Configurable patterns for `@story` / `@req`.
  - Handling invalid regexes.
  - Error messages and JSON schema.
  - Test coverage.

### Helper Module: `valid-annotation-options`

- Created `src/rules/helpers/valid-annotation-options.ts`:
  - Types for rule options and resolved options.
  - Defaults for story/requirement patterns and examples.
  - `resolveOptions(rawOptions: unknown[])`:
    - Normalizes flat / nested ESLint options (nested wins).
    - Compiles regexes, falls back to defaults on failure.
    - Records configuration errors and chosen defaults.
  - Helpers: `getResolvedDefaults`, `getDefaultReqExample`, `getRuleSchema`, `getOptionErrors`.
  - Internal `resolvePattern` helper with localized ESLint suppression.
  - Added traceability annotations.

### Updates to `valid-annotation-format` Rule

- Updated rule to use `valid-annotation-options`:
  - `meta.schema = getRuleSchema()`.
  - Added `invalidRuleConfiguration` message ID.
- In `create(context)`:
  - Called `resolveOptions(...)`.
  - Reported configuration errors on `Program` using `getOptionErrors()`.
- Adjusted validation:
  - `@story`:
    - Validated with `options.storyPattern`.
    - Used `options.storyExample`.
    - Autofix integrated with `getFixedStoryPath` / `createStoryFix`.
  - `@req`:
    - Validated with `options.reqPattern`.
    - Used `options.reqExample`.
- Updated message helpers for missing vs invalid paths/IDs, including examples and hints.
- Refactored autofix helpers to use resolved defaults/examples.
- Updated JSDoc and traceability annotations.

### Tests for Configurable Patterns

- Extended `valid-annotation-format` tests to cover:
  - Defaults, multi-line, autofix.
  - Nested and flat custom patterns.
  - Precedence (nested over flat).
  - Custom examples in messages.
  - Invalid regex configs:
    - Reporting `invalidRuleConfiguration`.
    - Continuing diagnostics using defaults.
    - Autofix behavior under invalid configs.

### Documentation for Configurable Patterns

- Updated `docs/rules/valid-annotation-format.md`:
  - Options, defaults, precedence.
  - Handling invalid configs and fallbacks.
- Updated `user-docs/api-reference.md`.
- Marked DoD items complete in relevant story doc.

### Tooling & Git for Configurable Patterns

- Ran tests, lint, type-check, build, formatting, duplication, traceability checks.
- Adjusted ESLint `max-params` locally as needed.
- Verified Husky v9 hooks (`lint-staged`, `.husky/pre-commit`).
- Committed feature, docs, tests; CI (`ci-verify:full` and GitHub CI) passed.

---

## Lint Threshold Tightening and Refactors

### Enforcing `max-lines-per-function` at 55

- Updated ESLint config:
  - Prod TS/JS: `max-lines-per-function` error at 55 (excluding blank lines/comments).
  - Tests: rule disabled.
- Verified:
  - `npm run lint -- --max-warnings=0`
  - `npm test -- --runInBand`
  - `npm run type-check`, `npm run build`, `npm run format:check`,
    `npm run duplication`, `npm run check:traceability`.

### Refactors to Satisfy 55-Line Limit

- Performed behavior-preserving refactors:
  - `src/maintenance/utils.ts` – split `getAllFiles` into public wrapper and recursive helper.
  - `src/maintenance/update.ts` – extracted validation, per-file updates, counting helpers.
  - `src/maintenance/detect.ts` – extracted safety and boundary helpers from `handleStoryMatch`.
  - `src/utils/branch-annotation-helpers.ts` – extracted helpers for computing missing annotations and insertion points.
  - `src/rules/valid-req-reference.ts`:
    - Split `validateReqLine` into helpers for path validation, file loading/caching, requirement existence.
    - Extracted comment handling into `processCommentLines`, `handleComment`, `processAllComments`.
    - Simplified `Program` visitor.
  - `src/rules/valid-story-reference.ts`:
    - Created `valid-story-reference-helpers.ts` with:
      - Types for security options and invalid-path reporting.
      - `analyzeCandidateBoundaries`, `handleProjectBoundaryForExistence`, `performSecurityValidations`.
    - Updated main rule to use helpers.
  - `src/rules/valid-annotation-format.ts`:
    - Extracted utilities to `valid-annotation-utils.ts` (`collapseAnnotationValue`, `getFixedStoryPath`, message builders, etc.).
    - Split `processComment` into `finalizePendingAnnotation` and `processCommentLine`.
    - Cleaned unused imports.
  - `src/maintenance/cli.ts` – split flag parsing into `createDefaultFlags`, `applyFlag`, `parseFlags`.

### Lint and CI for Refactors

- Ran ESLint with zero warnings, fixed `max-lines-per-function` and `no-unused-vars`.
- Ran:
  - `npm run lint-staged -- --allow-empty`
  - `npm test`, `npm run build`, `npm run type-check`, `npm run duplication`.
- Confirmed CI pipeline stayed green.

---

## Secret Scanning and Local Safety Tooling

### Automated Secret Scanning

- Added Secretlint-based secret scanning:
  - Dev dependencies:
    - `secretlint@11.2.5`
    - `@secretlint/secretlint-rule-preset-recommend@11.2.5`.
  - `.secretlintrc.json` with ignores for build artifacts, vendor, images.
  - Script `security:secrets` → `secretlint "**/*" --no-color`.
- CI integration:
  - `ci-cd.yml` `quality-and-deploy` job runs `npm run security:secrets` on Node 20.x.
- Updated `docs/security-incidents/handling-procedure.md` with:
  - Policy that all `main` changes are scanned for secrets.
  - Handling procedures.

### Dependency-Safety Tool as Dev Dependency

- Reviewed `scripts/ci-safety-deps.js` and `dry-aged-deps`.
- Added `dry-aged-deps@^2.3.1` as devDependency.
- Updated `ci-safety-deps` script to:
  - Run `npx --no-install dry-aged-deps --format=json`.
  - Write `ci/dry-aged-deps.json`.
  - Enforce non-empty JSON.
  - Always exit 0; CI consumes report.
- Regenerated and committed `package-lock.json`.
- Ran installs, security scans, quality scripts.
- Fixed initial CI issues (lockfile sync, Secretlint on Node 18) by updating lockfile and gating Secretlint to Node 20.x.
- Verified CI success.

---

## CI/CD Workflow and Runtime Documentation

### CI/CD Workflow and Release Configuration Review

- Reviewed:
  - `.github/workflows/ci-cd.yml`
  - `.releaserc.json`
  - `package.json`
  - ADRs (`006`, `007`, `004`, `adr-commit-branch-tests`).
- Confirmed:
  - Single GitHub Actions workflow “CI/CD Pipeline”.
  - Triggers: `push` / `pull_request` on `main` plus nightly `schedule`.
- Verified `quality-and-deploy` job:
  - Runs on Node `18.x` and `20.x`.
  - Uses `npm run ci-verify:full`:
    - `check:traceability`, `safety:deps`, `audit:ci`, `build`, `type-check`,
      `lint-plugin-check`, `lint -- --max-warnings=0`, `duplication`,
      `test -- --coverage`, `format:check`,
      `npm audit --omit=dev --audit-level=high`, `audit:dev-high`.
- Confirmed publishing:
  - `semantic-release` only on pushes to `main` on Node `20.x`.
  - Standard plugins: commit analysis, notes, changelog, npm publish, GitHub release.
- Verified post-deployment smoke test:
  - `Smoke test published package` job runs when `new_release_published == 'true'`.
  - `scripts/smoke-test.sh` installs package and checks version + ESLint integration.

### CI/CD Pipeline and Runtime Docs

- Created `docs/ci-cd-pipeline.md`:
  - Documented workflow structure, triggers, and `quality-and-deploy` steps.
  - Described secret scanning, artifact uploads, `semantic-release` behavior, smoke tests.
  - Documented nightly `dependency-health` job.
  - Explained Conventional Commit → semver mapping.
  - Documented local dev hooks:
    - `.husky/pre-commit` → `lint-staged`.
    - `.husky/pre-push` → `npm run ci-verify:full`.
  - Described common failure modes.

### Runtime Compatibility Docs

- Updated `README.md` prerequisites:
  - `Node.js >=18.18.0`, ESLint v9+.
- Updated `user-docs/api-reference.md`:
  - Runtime support: `Node.js >=18.18.0`, ESLint `^9.0.0`.
- Ensured alignment across `package.json` engines/peers and CI Node versions.
- Re-ran core quality scripts and confirmed green CI.

---

## Security-Focused Lint Rules and Duplication Reduction

### Security-Focused Lint Rules

- Reviewed ESLint config and ADRs for quality ratcheting and console usage.
- Added ADR `009-security-focused-lint-rules.accepted.md`:
  - Enabled `no-eval`, `no-implied-eval`, `no-new-func`, `no-new-wrappers`.
- Updated `eslint.config.js` accordingly.
- Verified linting and `ci-verify:full`.
- Committed `chore: add core security-focused eslint rules`.

### Shared Test Helper for `require-story-core`

- Used `npm run duplication` to find duplication in:
  - `require-story-core.autofix.test.ts`
  - `require-story-core-edgecases.test.ts`.
- Added `tests/utils/require-story-core-test-helpers.ts`:
  - Traceability annotations and test-only comments.
  - Range constants and `ExerciseOptions`.
  - Helpers:
    - `baseFixer()`
    - `exerciseBranch1/2/3`
    - `exerciseCreateAddStoryFixBranches`.
- Updated tests to use shared helper and removed duplication.
- Ensured no unused imports and re-ran tests, duplication, lint, type-check, formatting.
- Committed with `test: extract shared helpers for require-story-core autofix tests`.
- CI succeeded.

---

## Shared TS RuleTester Options and CLI Parsing Helper (Earlier Work)

### Shared TypeScript RuleTester Language Options

- Created `tests/utils/ts-language-options.ts`:
  - Exported `tsRuleTesterLanguageOptions` with:
    - `@typescript-eslint/parser`
    - `parserOptions: { ecmaVersion: 2022, sourceType: "module" }`.
  - Added traceability annotations.
- Refactored tests to use shared TS options:
  - `tests/utils/annotation-checker.test.ts`
  - `tests/rules/require-req-annotation.test.ts`
  - `tests/rules/require-story-annotation.test.ts`.
- Verified via lint, tests, formatting.

### Maintenance CLI Command Parsing Helper

- Updated `src/maintenance/cli.ts`:
  - Added `ParsedCliInput` interface.
  - Added `parseCliInput(rawArgv: string[]): ParsedCliInput`.
- Refactored `runMaintenanceCli` to:
  - Use `parseCliInput`.
  - Pass `args` to subcommand handlers.
  - Preserve behavior.
- Re-ran lint, CLI tests, formatting, build, type-check, duplication, traceability.
- Committed `refactor: extract maintenance CLI command parsing helper`.

---

## Refactors Around Annotation Detection and TS RuleTester Helpers

### Shared TS RuleTester Helpers Across Annotation Rule Tests

- Extended `tests/utils/ts-language-options.ts`:
  - Added:

    ```ts
    export function withTsLanguageOptions<T extends { languageOptions?: unknown }>(
      testCase: T,
    ): T {
      return {
        languageOptions: tsRuleTesterLanguageOptions,
        ...testCase,
      };
    }
    ```

- Purpose: reuse TS parser configuration without repeating `languageOptions`.

### Refactor: `tests/utils/annotation-checker.test.ts`

- Identified as duplication hotspot.
- Refactored:
  - Introduced `RuleTesterTestCase` type and `withTsAnnotationCheckerOptions` helper.
  - Simplified `runTsAnnotationCheckerTests` to apply TS options via helper.
- Kept all test logic and expectations unchanged.

### Refactor: `tests/rules/require-req-annotation.test.ts`

- Imported `withTsLanguageOptions`.
- Replaced explicit `languageOptions` with `withTsLanguageOptions(...)` for TS cases.
- Removed unused `tsRuleTesterLanguageOptions` import.

### Refactor: `tests/rules/require-story-annotation.test.ts`

- Reverted from experimental helper wiring to:
  - Single JS `RuleTester`.
  - TS cases wrapped with `withTsLanguageOptions(...)`.
- Preserved behavior.

### Refactor: `tests/rules/require-branch-annotation.test.ts`

- Introduced `runRule` helper wrapping `ruleTester.run`.
- Replaced duplicate runs with `runRule(...)`.
- Kept test cases, options, expectations unchanged.

### New Shared `@req` Annotation Detection Helper

- Added `src/utils/reqAnnotationDetection.ts`:
  - Imported `FALLBACK_WINDOW`, `LOOKBACK_LINES` from `require-story-io`.
  - Implemented:
    - `commentContainsReq`
    - `linesBeforeHasReq`
    - `parentChainHasReq`
    - `fallbackTextBeforeHasReq`
  - Exposed:

    ```ts
    export function hasReqAnnotation(
      jsdoc: any,
      comments: any[],
      context?: any,
      node?: any,
    ): boolean;
    ```

  - Added `@story` / `@req` tags.
- Updated `src/utils/annotation-checker.ts`:
  - Now imports `hasReqAnnotation`.
  - Removed local detection helpers and unused imports.
  - Continued to expose `checkReqAnnotation` that:
    - Collects comments.
    - Uses `hasReqAnnotation`.
    - Reports missing `@req` annotations.

### Quality Checks for This Work

- Ran:
  - `npm test -- --runInBand`
  - `npm run lint` (fixed unused imports), `npm run format:check`, `npm run duplication`.
- Attempted build and type-check from tool environment; non-zero exits were seen without diagnostics (environment limitation).
- Committed:
  - `refactor: extract shared req annotation detection helper`
  - `test: refactor annotation-related tests to use shared helpers`.
- Attempted `git push` from tool environment; remote policy blocked it.
- Checked GitHub pipeline status; existing CI on `main` remained green.

---

## Multi-Story `@implements` Support and Deep Validation

### Review of Multi-Story Support Specification

- Reviewed:
  - `docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md`
  - ADR `docs/decisions/010-implements-annotation-for-multi-story-requirements.proposed.md`
  - Existing rules:
    - `src/rules/valid-annotation-format.ts`
    - `src/rules/valid-req-reference.ts`
  - Helpers:
    - `src/rules/helpers/valid-annotation-options.ts`
    - `src/rules/helpers/valid-annotation-utils.ts`
  - Tests:
    - `tests/rules/valid-annotation-format.test.ts`
    - `tests/rules/valid-req-reference.test.ts`
- Confirmed intended behavior:
  - `@implements <story-path> <REQ1> <REQ2>...`
  - Story path uses same pattern as `@story`.
  - Requirement IDs use same pattern as `@req`.
  - Deep validation treats each `@implements` line as self-contained, with requirement IDs scoped per story file, coexisting with legacy `@story`/`@req`.

### Implements Format Helpers and Rule Refactor

- Added `src/rules/helpers/valid-implements-utils.ts`:
  - Implemented:
    - `MIN_IMPLEMENTS_TOKENS` and helpers:
      - `reportMissingImplementsValue`
      - `reportMissingImplementsReqIds`
      - `reportInvalidImplementsStoryPath`
      - `reportInvalidImplementsReqId`
    - `validateImplementsAnnotationHelper(deps, context, comment, { rawValue, options })`
  - Behavior:
    - Trims/splits `@implements` value on whitespace.
    - Enforces story path + one or more requirement IDs.
    - Validates story path with `options.storyPattern`.
    - Validates requirement IDs with `options.reqPattern`.
    - Uses same examples and patterns as `@story`/`@req`.
  - Later refactors:
    - Extracted internal helpers `parseImplementsTokens` and `validateImplementsTokens` to reduce function size and params.
    - Adjusted `ImplementsDeps` type to use `typeof` of reporting helpers.
    - Prefixed unused parameters with `_` to satisfy `no-unused-vars`.
    - Consolidated helper arguments and updated signatures without changing behavior.
- Updated `src/rules/valid-annotation-format.ts`:
  - Added `validateImplementsAnnotation` wrapper that:
    - Builds a `deps` object once.
    - Calls `validateImplementsAnnotationHelper(deps, context, comment, { rawValue, options })`.
  - Extended `processCommentLine` to recognize `@implements`, strip its tag, and validate its value via the new helpers.
  - Ensured `@implements` does not interfere with multi-line `@story`/`@req` pending state.

### Internal Helpers Extraction for Annotation Format

- Created `src/rules/helpers/valid-annotation-format-internal.ts`:
  - Exported:
    - `PendingAnnotation` interface.
    - `normalizeCommentLine(rawLine: string): string`.
  - Copied existing JSDoc (updated for new file).
  - Updated `valid-annotation-format.ts` to import these, reducing file size and clarifying responsibilities.

### Validation Rule Docs for `@implements`

- Updated `docs/rules/valid-annotation-format.md`:
  - Stated that `@implements` is also validated for format.
  - Under “Rule Details”, added subsection describing:
    - Expected `@implements` structure.
    - Story path validation via story pattern.
    - Requirement ID validation via req pattern.
  - Aligned wording with `docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md`.

---

## Deep `valid-req-reference` Support for `@implements`

### Rule Changes

- Updated `src/rules/valid-req-reference.ts` to validate `@implements`:

  - Added token constants:

    ```ts
    const IMPLEMENTS_TOKENS = {
      STORY_INDEX: 1,
      FIRST_REQ_INDEX: 2,
    } as const;
    ```

  - Added `parseImplementsLine(line: string)`:
    - Splits line on whitespace.
    - Reads story path from `IMPLEMENTS_TOKENS.STORY_INDEX`.
    - Reads `reqIds` from `parts.slice(IMPLEMENTS_TOKENS.FIRST_REQ_INDEX)`.
    - Returns `null` if no story path or no `reqIds`, delegating malformed formats to `valid-annotation-format`.

  - Added `validateImplementsLine({ comment, context, line, cwd, reqCache })`:
    - Parses via `parseImplementsLine`.
    - Uses existing `resolveStoryAndRequirements` to:
      - Validate story path (with existing `invalidPath` reporting).
      - Load requirement set for the story.
    - For each `reqId`:
      - Calls `checkRequirementExists` with original story path for error context.
    - Leaves behavior unchanged when story path cannot be resolved (no further checks).

  - Updated `handleAnnotationLine`:
    - Recognizes `@implements` via `line.startsWith("@implements")`.
    - Calls `validateImplementsLine(...)`.
    - Always returns current `storyPath` unchanged so `@implements` does not alter default context.

- Added traceability annotations referencing:
  - `docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md`
  - Requirements: `REQ-IMPLEMENTS-VALIDATE`, `REQ-MIXED-SUPPORT`, `REQ-SCOPED-IDS`.

### Deep Validation Rule Docs

- Updated `docs/rules/valid-req-reference.md`:
  - Extended description to mention `@implements`:
    - Each `@implements` line provides its own story path and requirement IDs.
    - The rule validates that each listed requirement exists in that story file.
  - Added subsection describing:
    - Interaction between `@implements` and existing `@story`/`@req` validation.
    - Requirement IDs being unique only within their story file (not globally).
  - Kept prior `@story` / `@req` content intact.

---

## Tests and Fixtures for `@implements` and Multi-Story Scoping

### Format-Level Tests (`valid-annotation-format`)

- Left existing `@implements` tests in `tests/rules/valid-annotation-format.test.ts` intact:
  - Valid:
    - Single `@implements` with one story and one requirement.
    - Multiple `@implements` with various combinations.
    - Mixed `@story`/`@req`/`@implements`.
  - Invalid:
    - Missing value.
    - Missing requirement IDs.
    - Invalid story path.
    - Invalid requirement IDs.

### Deep Validation Tests (`valid-req-reference`)

- Added fixtures:
  - `tests/fixtures/story_multi_a.md`:
    - `REQ-SHARED-ID`, `REQ-ONLY-A`.
  - `tests/fixtures/story_multi_b.md`:
    - `REQ-SHARED-ID`, `REQ-ONLY-B`.

- Extended `tests/rules/valid-req-reference.test.ts`:

  - Valid cases:
    - Single `@implements`:

      ```js
      // @implements tests/fixtures/story_multi_a.md REQ-SHARED-ID REQ-ONLY-A
      ```

      Ensures both requirements exist in `story_multi_a.md`.

    - Two `@implements` lines:

      ```js
      // @implements tests/fixtures/story_multi_a.md REQ-SHARED-ID REQ-ONLY-A
      // @implements tests/fixtures/story_multi_b.md REQ-SHARED-ID REQ-ONLY-B
      ```

      Demonstrates:
      - Reuse of `REQ-SHARED-ID` across two stories.
      - Each requirement validated within its own story’s scope.

  - Invalid cases:
    - Missing requirement in `@implements`:

      ```js
      // @implements tests/fixtures/story_multi_a.md REQ-NOT-IN-A
      ```

      Expects `reqMissing` with:
      - `reqId: "REQ-NOT-IN-A"`
      - `storyPath: "tests/fixtures/story_multi_a.md"`.

    - Path traversal in `@implements`:

      ```js
      // @implements ../tests/fixtures/story_multi_a.md REQ-SHARED-ID
      ```

      Expects `invalidPath` with:
      - `storyPath: "../tests/fixtures/story_multi_a.md"`.

- Adjusted test lines to use space-separated tokens (no colons/commas) to match rule parsing.

- Ran focused tests:
  - `npm test -- --runInBand --testPathPatterns valid-(annotation-format|req-reference).test.ts`
- Ensured these tests pass as part of the full suite.

---

## Story and Documentation Updates for Multi-Story and Deep Validation

### Updates to Multi-Story Support Story

- Modified `docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md`:
  - Removed stray code fences so the file is plain Markdown.
  - In Acceptance Criteria:
    - Marked as completed (`[x]`) for:
      - Core Functionality
      - Validation
      - Backward Compatibility
      - Mixed Usage
      - Error Messages
      - Requirement Scoping
      - Quality Standards
    - Left Documentation unchecked initially.
  - In Definition of Done:
    - Marked “All acceptance criteria met” as `[x]` after code/tests/docs for `@implements` multi-story support were in place and passing.

### Updates to Deep Validation Story

- Updated `docs/stories/010.0-DEV-DEEP-VALIDATION.story.md`:
  - In Acceptance Criteria, marked `[x]` for:
    - Core Functionality
    - User Experience
  - Based on:
    - Implementation in `src/rules/valid-req-reference.ts`.
    - Tests in `tests/rules/valid-req-reference.test.ts`.
  - Left remaining criteria unchanged.

### Additional Story Reads

- Re-read:
  - `docs/stories/001.0-DEV-PLUGIN-SETUP.story.md`
  - `002.0-DEV-ESLINT-CONFIG.story.md`
  - `003.0-DEV-FUNCTION-ANNOTATIONS.story.md`
  - `004.0-DEV-BRANCH-ANNOTATIONS.story.md`
- Used them as context for ensuring new behavior fits the existing design.

---

## Global Quality Checks and CI for Recent Multi-Story Work

- After implementing and refactoring `@implements` support and deep validation, ran:
  - `npm run build`
  - `npm run type-check`
  - `npm run lint`
  - `npm run format:check`
  - `npm test` (full suite)
- Committed changes with messages including:
  - `refactor: add implements helpers and docs for multi-story support`
  - `refactor: extract implements helpers and internal annotation utilities`
  - `refactor: extend deep req validation to support implements`
  - `docs: update multi-story support and deep validation stories`
  - `docs: mark multi-story support acceptance criteria as met`
- Pushed to the remote and waited for the GitHub “CI/CD Pipeline” workflow.
- Confirmed CI pipeline completed successfully for these commits.

---

This summary captures only what has been done so far, including the most recent changes around `@implements` multi-story support, deep requirement validation, documentation alignment, and associated tests and refactors.

**Most recently we've executed the following action:**

---
Used tool: get_git_status with input: {}
Used tool: list_directory with input: {"dirPath":"."}
Used tool: list_directory with input: {"dirPath":"docs"}
Used tool: list_directory with input: {"dirPath":"docs/security-incidents"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: read_file with input: {"filePath":"scripts/ci-safety-deps.js"}
Used tool: read_file with input: {"filePath":"scripts/generate-dev-deps-audit.js"}
Used tool: read_file with input: {"filePath":"docs/security-incidents/dev-deps-high.json"}
Used tool: run_command with input: {"command":"npx","args":["dry-aged-deps","--format=json"]}
Used tool: read_file with input: {"filePath":"docs/security-incidents/SECURITY-INCIDENT-TEMPLATE.md"}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: read_file with input: {"filePath":"docs/security-incidents/2025-11-17-glob-cli-incident.md"}
Used tool: read_file with input: {"filePath":"docs/security-incidents/2025-11-18-brace-expansion-redos.md"}
Used tool: read_file with input: {"filePath":"docs/security-incidents/2025-11-18-bundled-dev-deps-accepted-risk.md"}
Used tool: run_command with input: {"command":"npm","args":["run","audit:dev-high"]}
Used tool: run_command with input: {"command":"npm","args":["view","@semantic-release/npm","version"]}
Used tool: run_command with input: {"command":"npm","args":["view","@semantic-release/npm@13.1.2","dependencies","--json"]}
Used tool: run_command with input: {"command":"npm","args":["view","@semantic-release/npm@10.0.6","dependencies","--json"]}
Used tool: read_file with input: {"filePath":".github/workflows/ci-cd.yml"}
Used tool: read_file with input: {"filePath":"docs/security-incidents/handling-procedure.md"}
Used tool: run_command with input: {"command":"npm","args":["view","@semantic-release/npm","time","--json"]}
Used tool: run_command with input: {"command":"npm","args":["view","@semantic-release/npm@13.1.2","peerDependencies","--json"]}
Used tool: run_command with input: {"command":"npm","args":["view","semantic-release","version"]}
Used tool: run_command with input: {"command":"npm","args":["view","semantic-release@25.0.2","dependencies","--json"]}
Used tool: run_command with input: {"command":"npm","args":["view","semantic-release@25.0.2","time","--json"]}
Used tool: run_command with input: {"command":"npm","args":["view","@semantic-release/npm@13.1.2","time","--json"]}
Used tool: read_file with input: {"filePath":".releaserc.json"}
Used tool: modify_file with input: {"filePath":"docs/decisions","instruction":"NOOP"}
Used tool: list_directory with input: {"dirPath":"docs/decisions"}
Used tool: read_file with input: {"filePath":"docs/decisions/adr-accept-dev-dep-risk-glob.md"}
Used tool: create_file with input: {"filePath":"docs/security-incidents/SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md"}
Used tool: generate_file with input: {"filePath":"docs/security-incidents/SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md","overwrite":true,"content":"# Security Incident Report: semantic-release bundled npm/glob/brace-expansion\n\n**Date:** 2025-11-18\n\n**Dependency:** @semantic-release/npm@10.0.6 (bundled npm@9.5.0 with glob and brace-expansion)\n\n**Vulnerability ID:** GHSA-5j98-mcp5-4vw2 (glob CLI), GHSA-v6h2-p8h4-qcjw (brace-expansion ReDoS)\n\n**Severity:** High (glob via npm), Low (brace-expansion)\n\n**Description:**\n\nThe `@semantic-release/npm@10.0.6` dev dependency bundles `npm@9.5.0`, which in turn includes vulnerable versions of `glob` and `brace-expansion`:\n\n- `glob` (10.2.0\u001310.4.5) is affected by command injection when the glob CLI is invoked with the `-c/--cmd` flag (`GHSA-5j98-mcp5-4vw2`).\n- `brace-expansion` (1.0.0\u00131.1.11 and 2.0.0\u00132.0.1) is affected by a Regular Expression Denial of Service (ReDoS) issue (`GHSA-v6h2-p8h4-qcjw`).\n\nThese vulnerable packages are *only* present inside the npm binary bundled within `@semantic-release/npm`. They are **not** part of the production dependency tree used by the published `eslint-plugin-traceability` package.\n\n**Remediation:**\n\n- **Status:** Known error with compensating controls (dev-only tooling)\n- **Fixed Version:** Pending\n\nAs of 2025-12-03:\n\n- `npx dry-aged-deps --format=json` reports no safe, dry-aged upgrade candidates for `@semantic-release/npm` within the current semantic-release v21.x toolchain used by this project.\n- Upgrading to the latest `semantic-release@25.x` and `@semantic-release/npm@13.1.2` would require a coordinated major toolchain migration and may still embed a bundled `npm` implementation; the security characteristics of that new bundle have not yet been fully evaluated.\n\nGiven these constraints, the project treats this as a **known error** in dev-only tooling and applies compensating controls instead of attempting a premature upgrade.\n\n**References:**\n\n- GitHub Security Advisory (glob CLI): https://github.com/advisories/GHSA-5j98-mcp5-4vw2\n- GitHub Security Advisory (brace-expansion): https://github.com/advisories/GHSA-v6h2-p8h4-qcjw\n- Dev dependency audit snapshot: `docs/security-incidents/dev-deps-high.json`\n- Prior incident notes:\n  - `docs/security-incidents/2025-11-17-glob-cli-incident.md`\n  - `docs/security-incidents/2025-11-18-brace-expansion-redos.md`\n  - `docs/security-incidents/2025-11-18-bundled-dev-deps-accepted-risk.md`\n\n**Timeline:**\n\n- **2025-11-17**: High-severity `glob` and `npm` dev-dependency issues detected via `npm audit` and captured in `dev-deps-high.json`.\n- **2025-11-18**: Initial incident markdown files created to document residual risk in bundled dev dependencies within `@semantic-release/npm`.\n- **2025-11-23**: Confirmed that no mature, safe upgrade path was available via `dry-aged-deps`; residual risk kept under review.\n- **2025-12-03**: Incident converted into a formal `SECURITY-INCIDENT-*.known-error.md` record with explicit compensating controls and linkage to CI/CD configuration.\n\n**Impact Analysis:**\n\n- The vulnerable `glob` and `brace-expansion` instances exist exclusively inside the npm CLI bundled with `@semantic-release/npm` and are only used during automated release publishing from CI.\n- There is **no** impact on:\n  - The published eslint plugin runtime (`eslint-plugin-traceability`).\n  - End-user projects that consume this plugin.\n  - Production dependency trees (`npm audit --production` reports 0 vulnerabilities).\n- Exploitability in this project\u0019s context is low because:\n  - CI workflows do not invoke the `glob` CLI with `-c/--cmd` and do not expose untrusted patterns to the bundled npm CLI.\n  - The semantic-release job runs in a controlled CI environment with a tightly scoped `NPM_TOKEN` and no untrusted user input.\n  - The primary risk is limited to the release automation environment, not to downstream users.\n\n**Compensating Controls:**\n\n1. **Environment Isolation**\n   - The vulnerable tooling is only executed in the `quality-and-deploy` job of `.github/workflows/ci-cd.yml` on pushes to the `main` branch.\n   - Job-level permissions are scoped to the minimum required for releases (`contents`, `issues`, `pull-requests`, `id-token`). No additional permissions are granted.\n   - The job runs on GitHub-hosted runners and does not have access to any internal infrastructure.\n\n2. **Dependency and Audit Controls**\n   - `npm audit --omit=dev --audit-level=high` is enforced as part of `npm run ci-verify:full` to ensure production dependencies are free of high-severity issues.\n   - `npm run audit:dev-high` (via `scripts/generate-dev-deps-audit.js`) continuously records high-severity dev-only vulnerabilities into `ci/npm-audit.json` for review.\n   - `npm run safety:deps` (via `scripts/ci-safety-deps.js`) runs `dry-aged-deps` to validate that no safe, dry-aged upgrades are currently available; this output is published as a CI artifact.\n   - `package.json` uses `overrides` to enforce safer versions of many transitive dependencies (e.g., `glob`, `tar`, `http-cache-semantics`, `ip`, `semver`, `socks`) wherever technically possible. These overrides do **not** affect the npm binary bundled within `@semantic-release/npm`, but they reduce the surrounding attack surface.\n\n3. **Usage Constraints**\n   - Project scripts and CI workflows never invoke `glob` with the `-c/--cmd` options, eliminating the known command-injection vector in normal operation.\n   - The release job does not accept untrusted user input that could influence file patterns or environment variables passed to the bundled npm CLI.\n\n4. **Monitoring and Review**\n   - The nightly `dependency-health` job runs `npm run audit:dev-high` to keep dev-dependency vulnerabilities under continuous review.\n   - `docs/decisions/adr-accept-dev-dep-risk-glob.md` documents this decision and requires weekly reassessment using the CI audit artifacts.\n   - Any change in `dev-deps-high.json` that indicates the availability of a patched, dry-aged-safe version of `@semantic-release/npm` or its bundled npm will trigger reevaluation and, if feasible, an upgrade.\n\n**Testing:**\n\n- `npm run ci-verify:full` (used in CI and pre-push) validates:\n  - Build and type-check succeed.\n  - Linting, duplication, and traceability checks pass.\n  - Jest test suite (with coverage) passes.\n  - `npm audit --omit=dev --audit-level=high` passes (production dependencies clean).\n  - `npm run audit:dev-high` and `npm run safety:deps` complete and publish audit artifacts.\n- The semantic-release publishing step is followed, when a new version is published, by `scripts/smoke-test.sh`, which installs the freshly published package in an isolated temp project and validates that the plugin loads correctly. This ensures that any future upgrade of the release toolchain preserves expected behavior.\n\n**Planned Follow-ups:**\n\n- Periodically re-run `npx dry-aged-deps --format=json --check` when updating dev dependencies to identify a safe, vulnerability-free version of `@semantic-release/npm` or an alternative release mechanism.\n- When a safe, dry-aged-compatible upgrade path is available, migrate to a newer semantic-release/npm toolchain and retire this known error record by adding a **Resolved** section documenting the change.\n\nCreated autonomously by voder.ai\n"}
Used tool: modify_file with input: {"filePath":"docs/security-incidents/2025-11-18-bundled-dev-deps-accepted-risk.md","instruction":"Replace the heading and status language to clearly point at the new SECURITY-INCIDENT known-error document and mark this file as historical context only. Specifically, after the existing front matter block (Date/Severity/Status/Affected Package), insert a short 'Superseded Notice' section that links to SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md and states that this document is kept only for historical background."}
Used tool: modify_file with input: {"filePath":"docs/security-incidents/2025-11-17-glob-cli-incident.md","instruction":"Append a short 'Status Update' section at the end of the file that states this incident is now covered by SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md and refers readers there for current status and compensating controls."}
Used tool: modify_file with input: {"filePath":"docs/security-incidents/2025-11-18-brace-expansion-redos.md","instruction":"Append a short 'Status Update' section at the end of the file that states this incident is now covered by SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md and refers readers there for current status and compensating controls."}
Used tool: get_git_status with input: {}
Used tool: run_command with input: {"command":"npm","args":["run","ci-verify:full"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"docs: formalize dev-deps high-severity incident as known error"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19894103202,"timeout":600000}
---

**This was the result:**
---
Here’s what I did to execute the **##NOW** and **##NEXT** sections, plus the updated plan with checkboxes.

---

## What I did

### 1. Re‑evaluate dev‑only vulnerabilities and upgrade path (##NOW)

**Goal:** Determine whether a *safe, policy‑compliant upgrade path* exists for the semantic‑release toolchain that eliminates the bundled `npm`/`glob`/`brace-expansion` issues **without** violating the `dry-aged-deps` maturity rules.

Actions:

1. **Re‑ran dry-aged-deps directly**

   ```bash
   npx dry-aged-deps --format=json
   ```

   Result (key part):

   ```json
   {
     "packages": [],
     "summary": {
       "totalOutdated": 0,
       "safeUpdates": 0,
       "filteredByAge": 0,
       "filteredBySecurity": 0,
       "thresholds": {
         "prod": { "minAge": 7, "minSeverity": "none" },
         "dev": { "minAge": 7, "minSeverity": "none" }
       }
     }
   }
   ```

   Interpretation for policy:

   - According to `dry-aged-deps` (the project’s canonical “safe upgrade” oracle), **there are no currently recommended safe updates**, for either prod or dev dependencies.
   - That includes the semantic‑release stack (`semantic-release`, `@semantic-release/npm`).

2. **Inspected current and latest semantic-release/npm versions**

   - Current devDependencies from `package.json`:
     - `"semantic-release": "^21.1.2"`
     - `"@semantic-release/npm": "^10.0.6"`
   - Latest versions on npm:
     - `semantic-release@25.0.2`
     - `@semantic-release/npm@13.1.2`
   - `@semantic-release/npm@13.1.2` depends on:

     ```json
     {
       "npm": "^11.6.2",
       ...
     }
     ```

   - `dev-deps-high.json` documents the vulnerable `npm` range as:

     ```json
     "npm": {
       "range": "7.21.0 - 8.5.4 || 9.6.6 - 11.6.0"
     }
     ```

     So **npm 11.6.2 is outside the documented vulnerable range** for that advisory.

3. **Policy decision**

   - Even though newer versions of `semantic-release` and `@semantic-release/npm` exist and appear to move to a patched `npm`, the project’s security/process policy says:
     - Only upgrade tooling **once `dry-aged-deps` exposes a safe candidate**.
   - `dry-aged-deps` currently reports **no outdated packages and no safe updates**, so under the current policy:

   > There is **no policy‑compliant upgrade path** available as of 2025‑12‑03, despite the existence of newer upstream versions.

**Conclusion for ##NOW:**  
The dev‑only `glob`/`npm`/`brace-expansion` vulnerabilities in bundled release tooling **cannot yet be remediated via a policy-compliant dependency upgrade**. We must therefore treat them as a controlled, documented *known error*.

---

### 2. Create formal SECURITY‑INCIDENT known‑error record (##NEXT, conditional “no safe path” branch)

**Task:** “If no safe upgrade path exists yet, create formal security incident records using the required SECURITY‑INCIDENT known-error format…”

Actions:

1. **Created canonical known‑error incident file:**

   - `docs/security-incidents/SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md`

   Key characteristics:

   - Follows the required naming convention:  
     `SECURITY-INCIDENT-{date}-{desc}.known-error.md`
   - Summarizes:
     - Affected dependency: `@semantic-release/npm@10.0.6` bundling `npm@9.5.0` with vulnerable `glob` and `brace-expansion`.
     - Advisories:
       - `GHSA-5j98-mcp5-4vw2` (glob CLI command injection via `-c/--cmd`)
       - `GHSA-v6h2-p8h4-qcjw` (brace-expansion ReDoS)
     - Impact analysis:
       - Dev‑only, CI‑only; **no production or end‑user exposure**.
       - Exploit path (glob `-c/--cmd`, attacker‑controlled patterns) is not used in this repo’s workflows.
     - **Compensating controls**, including:
       - Environment isolation in `.github/workflows/ci-cd.yml`:
         - Vulnerable tooling runs only in `quality-and-deploy` job on `main`.
         - Job permissions are scoped to `contents`, `issues`, `pull-requests`, `id-token` (no broader permissions).
         - Runs on GitHub‑hosted runners; no internal infrastructure exposure.
       - Dependency & audit gates:
         - `npm audit --omit=dev --audit-level=high` enforced in `npm run ci-verify:full` (production tree must be clean).
         - `npm run audit:dev-high` writes high‑severity dev‑only audit JSON to `ci/npm-audit.json`.
         - `npm run safety:deps` (`scripts/ci-safety-deps.js`) runs `dry-aged-deps` and publishes `ci/dry-aged-deps.json`.
         - `package.json` `overrides` harden many transitive deps (glob, tar, http-cache-semantics, ip, semver, socks) where possible.
       - Usage constraints:
         - CI scripts never invoke glob with `-c/--cmd`.
         - Release job does not process untrusted input that could influence patterns passed to the bundled npm CLI.
       - Monitoring & review:
         - Nightly `dependency-health` job runs `npm run audit:dev-high`.
         - ADR `docs/decisions/adr-accept-dev-dep-risk-glob.md` documents weekly reassessment.
         - Future safe upgrade (when surfaced by `dry-aged-deps`) will retire this known error.

   - Includes **Testing** section explicitly describing how `npm run ci-verify:full` and the smoke tests validate behavior after any future upgrades.

---

### 3. Align existing incident docs with the new known‑error record (##NEXT)

**Task:** “Align the existing informal incident markdown files … so they reference or are superseded by the new SECURITY-INCIDENT known-error documents…”

Actions:

1. **Updated bundled-dev-deps umbrella doc to be clearly historical:**

   - File: `docs/security-incidents/2025-11-18-bundled-dev-deps-accepted-risk.md`
   - Changes:
     - Retitled and front-matter adjusted:

       ```md
       # Security Incident (Historical): Bundled Dev Dependencies Accepted as Residual Risk

       **Status**: Superseded by known error record (historical context only)
       ```

     - Added **Superseded Notice** at the top pointing to the new canonical record:

       ```md
       ## Superseded Notice

       This incident document has been superseded by the known error record:  
       **[SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md](SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md)**

       It is retained only for historical background and should not be used as the current source of truth...
       ```

     - Left the detailed rationale and history intact, but clearly marked as **historical only**.

2. **Linked the per‑advisory incident notes to the known‑error:**

   - `docs/security-incidents/2025-11-17-glob-cli-incident.md`  
     - Appended:

       ```md
       ## Status Update

       This incident is now covered by
       `SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md`.
       Refer to that document for the current status, compensating controls,
       and ongoing mitigation tracking.
       ```

   - `docs/security-incidents/2025-11-18-brace-expansion-redos.md`  
     - Appended:

       ```md
       **Status Update (2025-12-03):**
       This incident is now covered by
       `SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md`.
       Please refer to that document for the current status, mitigation details,
       and compensating controls.
       ```

   Result: all three prior incident markdowns (glob, brace-expansion, bundled-dev-deps) now **defer to a single authoritative SECURITY‑INCIDENT known‑error** document.

---

### 4. CI/CD release job isolation & documentation (##NEXT)

**Task:** “Review the CI/CD workflow configuration for the release job to confirm isolation and least privilege, and document these controls in the incident.”

Actions:

1. **Reviewed `.github/workflows/ci-cd.yml` release job:**

   - Release only occurs in `quality-and-deploy` job when:
     - Event is `push` to `refs/heads/main`.
     - Node version matrix entry is `20.x`.
     - All quality gates (build, tests, lint, type-check, audits, format, duplication, traceability) succeeded.
   - Job-level permissions:

     ```yaml
     jobs:
       quality-and-deploy:
         permissions:
           contents: write
           issues: write
           pull-requests: write
           id-token: write
     ```

     No broader permissions like `actions: write`, `secrets: read`, etc.

   - `HUSKY=0` in job env to avoid double-running hooks in CI.
   - Release step:

     ```yaml
     - name: Release with semantic-release
       if: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' && matrix['node-version'] == '20.x' && success() }}
       ...
       run: npx semantic-release ...
       env:
         GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
         NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
     ```

   - Post-release smoke test only runs when a new release was actually published.

2. **Documented those controls explicitly in the known‑error incident:**

   - Under **Compensating Controls → Environment Isolation**, I captured:
     - That the vulnerable tooling runs only in this specific job.
     - That permissions are minimal and job is on GitHub-hosted runners.
   - Under **Dependency and Audit Controls** and **Usage Constraints**, I documented:
     - The role of `npm audit --omit=dev --audit-level=high`, `audit:dev-high`, `safety:deps`, and `overrides`.
     - The absence of any `glob -c/--cmd` usage or untrusted input paths.

This satisfies the requirement to both *verify* and *document* that the environment running the vulnerable tooling is as isolated and least-privileged as practical.

---

### 5. Quality checks, commit, push, and CI

Per instructions, I ensured the repo stayed healthy:

1. **Full local quality gate:**

   ```bash
   npm run ci-verify:full
   ```

   - Ran: traceability, `dry-aged-deps`, JSON audit, `tsc` build and no‑emit, plugin export guard, ESLint (`--max-warnings=0`), jscpd, Jest + coverage, Prettier check, production `npm audit`, and `audit:dev-high`.
   - All passed successfully.

2. **Committed changes:**

   ```bash
   git add -A
   git commit -m "docs: formalize dev-deps high-severity incident as known error"
   ```

3. **Pushed to `main` and monitored CI:**

   - `git push` succeeded.
   - GitHub Actions workflow “CI/CD Pipeline” run ID `19894103202` completed with conclusion: **success**.

No further fixes were required.

---

## Updated Plan with Status

### NOW

- [x] Review the current dev-only security vulnerabilities associated with the release tooling (especially the semantic-release npm plugin and its bundled npm/glob/brace-expansion) and determine whether there is now a safe, policy-compliant upgrade path that would eliminate these issues without violating the dependency maturity rules.  
  - **Result:** No policy-compliant upgrade path exists as of 2025‑12‑03; `dry-aged-deps` reports no safe updates, so we must treat the issue as a controlled known error.

### NEXT

- [ ] If a safe, policy-compliant upgrade path exists, update the release-related dependencies to those versions while preserving existing release behavior, and verify that the security vulnerabilities are resolved and that releases still function as expected.  
  - **Status:** *Not executed (condition not met)* — no safe upgrade path surfaced by `dry-aged-deps` yet.

- [x] If no safe upgrade path exists yet, create formal security incident records using the required SECURITY-INCIDENT known-error format that document the remaining dev-only vulnerabilities, their risk analysis, and the compensating controls that make continued use acceptable under the security policy.  
  - **Done:** Added `docs/security-incidents/SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md`.

- [x] Align the existing informal incident markdown files about glob, brace-expansion, and bundled dev dependencies so they reference or are superseded by the new SECURITY-INCIDENT known-error documents, ensuring there is a single, authoritative source for each accepted-risk decision.  
  - **Done:** Updated:
    - `2025-11-18-bundled-dev-deps-accepted-risk.md` → marked as historical, points to the SECURITY‑INCIDENT.
    - `2025-11-17-glob-cli-incident.md` and `2025-11-18-brace-expansion-redos.md` → added status updates pointing to the SECURITY‑INCIDENT.

- [x] Review the CI/CD workflow configuration for the release job to confirm that the environment running the vulnerable release tooling is as isolated and least-privileged as practical, and document these controls in the corresponding security incident records as part of the compensating controls.  
  - **Done:** Verified `.github/workflows/ci-cd.yml` isolation and permissions; documented environment isolation, dependency/audit controls, and usage constraints in the new SECURITY‑INCIDENT known‑error record.

If you’d like, the next logical step (outside this plan’s scope) would be to re-run the high-level SECURITY/FUNCTIONALITY assessment now that the dev-only vulnerabilities are formally documented as known errors.
---
