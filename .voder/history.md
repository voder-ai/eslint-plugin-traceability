Here’s a history-only summary of what’s been done so far on the project, including the most recent work.

---

## Core ESLint Plugin, Rules, and Testing

- Implemented the main ESLint plugin entrypoint (`src/index.ts`) that:
  - Exposes all rules.
  - Provides ESLint 9 flat-config presets (`recommended`, `strict`).
  - Exposes a `maintenance` API both as a named export and via `plugin.maintenance`.
- Implemented core rules:
  - `require-story-annotation`
  - `require-req-annotation`
  - `require-branch-annotation`
  - `valid-annotation-format`
  - `valid-story-reference`
  - `valid-req-reference`
  - `prefer-implements-annotation`
- Added TypeScript-aware `RuleTester` helpers and migrated rule tests to use them.
- Added tests for:
  - Plugin exports and presets.
  - Rule schemas, options, and error messages.
  - Alignment between rule docs and rule configuration.

---

## Annotation Format, `@implements` / `@supports`, and Multi-story Support

- Built shared utilities to normalize annotation options and compile regexes, with schemas and defaults.
- Refactored `valid-annotation-format` to:
  - Use shared helpers.
  - Improve diagnostics.
  - Support multiline annotations.
  - Allow custom regexes for `@story` and `@req`.
- Implemented multi-story `@implements` parsing/validation via `valid-implements-utils`, used by:
  - `valid-annotation-format`
  - `valid-req-reference`
- Centralized requirement annotation detection in `reqAnnotationDetection` utilities.
- Added fixtures and tests for multi-story annotations and edge cases.
- Implemented `prefer-implements-annotation` as a suggestion rule with a conservative autofix (`@story` + `@req` → `@implements`).
- Updated docs and migration guidance to treat `@implements` as preferred but **opt-in** and disabled in presets.
- Updated presence rules so `@implements` alone satisfies `require-story-annotation` and `require-req-annotation`.
- Clarified ADRs for the planned `@implements` → `@supports` rename, keeping ADR 011 as authoritative and noting ADR 010’s status.

---

## Deep Validation, Path Handling, and Presence Rules

- Extended `valid-req-reference` to:
  - Extract `REQ-...` IDs from story files.
  - Validate IDs in `@req` / `@implements` against story contents.
  - Enforce path safety and scoping for story references.
- Implemented `valid-story-reference` and supporting helpers to:
  - Resolve and validate story paths.
  - Enforce project boundaries and secure path handling.
  - Support options such as `storyDirectories`, `allowAbsolutePaths`, `requireStoryExtension`.
- Added extensive tests for:
  - ID validation.
  - Multi-story handling.
  - Path and boundary security constraints.
- Standardized error messages across rules and added tests for expected message content.

---

## Autofix Behavior

- Implemented autofixes for:
  - Inserting missing `@story` annotations.
  - Correcting `.story.md` suffix mistakes.
  - Simple migrations from `@story` + `@req` to `@implements`.
- Added targeted tests to verify autofix behavior and safety.

---

## Maintenance CLI and Programmatic API

- Designed the `traceability-maint` CLI with subcommands:
  - `detect`
  - `verify`
  - `report`
  - `update`
  and captured the design in ADRs.
- Implemented CLI wiring and argument parsing (`src/maintenance/cli.ts`).
- Implemented maintenance modules:
  - `detectStaleAnnotations`
  - `updateAnnotationReferences`
  - `batchUpdateAnnotations`
  - `verifyAnnotations`
  - `generateMaintenanceReport`
- Exposed maintenance utilities via the `maintenance` export and wired the CLI binary in `package.json`.
- Added tests under `tests/maintenance/**` for:
  - CLI outputs, exit codes, and dry-run behavior.
  - Error handling and defensive file-system behavior.

### CLI Refactors and Flag Handling

- Centralized flag parsing in `src/maintenance/flags.ts`:
  - Types: `ParsedCliInput`, `NormalizedCliArgs`, `ParsedFlags`.
  - Helpers: `normalizeCliArgs`, `parseFlags`, `createDefaultFlags`, `applyFlag`.
- Added validation for options like `--format`.
- Updated `src/maintenance/cli.ts` to:
  - Normalize `argv`.
  - Support `-h/--help`.
  - Route subcommands.
  - Use `EXIT_USAGE` for invalid input.
- Refined `src/maintenance/commands.ts` with `EXIT_OK`, `EXIT_STALE`, `EXIT_USAGE`.
- Extended CLI tests for:
  - Invalid formats and help behavior.
  - Missing flags or roots.
  - Permission errors.
- Added branch-level traceability comments and JSDoc within maintenance code.

---

## Linting, Refactors, and Code Quality

- Added an ADR and enabled ESLint security rules (e.g., `no-eval`, `no-implied-eval`).
- Enforced `max-lines-per-function = 55` for production code and refactored large rules and maintenance modules accordingly.
- Updated `eslint.config.js` to ignore underscore-prefixed names for `no-unused-vars`.
- Removed `eslint-disable` comments by refactoring code.
- Achieved and maintained zero lint warnings.

---

## Test Duplication Reduction and Shared Helpers

- Used `jscpd` to measure test duplication and kept it very low (around 1% or less).
- Introduced shared test helpers:
  - `runAnnotationCheckerTests(...)` to centralize `RuleTester` setup and TS options.
  - Reworked `require-req-annotation` and related tests to use shared helpers.
- Refactored `require-branch-annotation.test.ts` using `makeMissingAnnotationErrors(...)` for repeated error arrays.
- Confirmed shared utilities are type-safe without suppressions.

### Shared Temp Directory Helpers

- Added `tests/utils/temp-dir-helpers.ts` with `createTempDir(prefix)` returning `{ dir, cleanup() }` and safe recursive deletion.
- Updated `batch.test.ts`, `report.test.ts`, and `cli.test.ts` to use `createTempDir(...)`, removing bespoke temp-dir helpers.

---

## CI, Quality Gates, Git Hooks, and Trunk-based Development

- Consolidated quality checks into `npm run ci-verify:full` covering:
  - Build, tests, lint, type-check, format check, duplication, traceability, and security.
- Created a GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that:
  - Runs on `push`/`pull_request` to `main` and on a scheduled basis.
  - Uses multiple Node versions (e.g., 18.x/20.x for verification, 22.x for release tooling as needed).
- Upgraded Husky to v9 and modernized hooks:
  - Removed deprecated `husky install` from `prepare`.
  - Added `"postinstall": "husky"` to `package.json`.
  - `.husky/pre-commit`: runs `npx lint-staged` (Prettier + ESLint `--fix` on staged files).
  - `.husky/pre-push`: runs `npm run ci-verify:full` and `npm run security:secrets`.
- Updated documentation to describe:
  - Trunk-based development with `main` as the single integration branch.
  - Direct commits to `main` by maintainers.
  - PRs primarily for forks or optional review.
- Superseded an older ADR about branch-based test selection and aligned CI behavior with the trunk-based model and pre-push parity.

---

## Semantic-release, Runtime Constraints, and Security Incidents

- Investigated OTP-related `semantic-release` issues and configured CI so that:
  - Failed OTP or missing `NPM_TOKEN` skips publishing without failing the overall pipeline.
- Raised the Node engine requirement to `>=18.18.0` to match ESLint 9 and CI.
- Evaluated dev-toolchain issues (e.g., `glob`, `brace-expansion`, bundled `npm` in `semantic-release`) and managed them via:
  - `package.json` `overrides`.
  - Security incident documentation and known errors.
- Authored and updated security incident documents, including:
  - `SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md` (later marked “Resolved”).
- Documented CI job isolation, least-privilege, and constraints around release tooling.

---

## Secret Scanning, Dependency Safety, and Dev-only Audit Flow

- Integrated Secretlint:
  - Added `.secretlintrc.json` with appropriate ignore patterns for generated and infra directories.
  - Added `npm run security:secrets`, wired into CI and `.husky/pre-push`.
- Added dependency-health tooling:
  - `dry-aged-deps` via `npm run deps:maturity`.
  - `scripts/ci-safety-deps.js` (`npm run safety:deps`) to run dry-aged-deps in CI, always exit 0, and write `ci/dry-aged-deps.json`.
  - `scripts/ci-audit.js` (`npm run audit:ci`) to run `npm audit --json`, always exit 0, and write `ci/npm-audit.json`.
  - `scripts/generate-dev-deps-audit.js` (`npm run audit:dev-high`) for dev dependency audits (`--include=dev --audit-level=high`), always exit 0.
- Documented gating vs advisory checks:
  - Gating: `npm audit --omit=dev --audit-level=high` (in `ci-verify:full`), `npm run security:secrets`, `npm run check:traceability`.
  - Advisory: `safety:deps`, `audit:ci`, `audit:dev-high`.
- Ran dev-only audit flows and maturity checks and recorded accepted dev-tooling risks in incident and dependency-health docs.

---

## CI/CD Pipeline, Contributor Documentation, and Flat-config Integration

- Authored `docs/ci-cd-pipeline.md` describing:
  - CI workflows and quality checks.
  - Triggers (`push`, `pull_request`, nightly schedule).
  - Secret scanning and dependency checks.
  - Release and smoke-test behavior.
- Updated `CONTRIBUTING.md` to:
  - Explain trunk-based development on `main`.
  - Distinguish `ci-verify:fast` vs `ci-verify:full`.
  - Clarify local vs CI security checks and which tools are gating vs advisory.
- Implemented and tested ESLint 9 flat-config presets:
  - `createTraceabilityFlatConfig` returning rule-only config.
  - `configs.recommended` and `configs.strict` as arrays of rule-only configs.
  - Plugin registration via `plugins` in user configs.
- Added `FlatESLint` integration tests against the compiled plugin (`lib/src/index.js`).
- Updated user docs (`eslint-9-setup-guide.md`, `docs/config-presets.md`, `README.md`) for flat-config usage.

---

## Functionality Coverage and Story Alignment

- Reviewed stories `001.0–010.3` and mapped them to:
  - Implemented rules.
  - Maintenance functions.
  - Associated tests.
- Created `docs/functionality-coverage-2025-12-03.md` summarizing coverage and evidence per story.
- Marked story `010.3-DEV-MIGRATE-TO-IMPLEMENTS` as fully implemented via the opt-in `prefer-implements-annotation` rule with autofix.
- Reran and documented core verification commands (`npm test`, `lint`, `type-check`, `build`, `format:check`, `duplication`) and confirmed CI success.

---

## Documentation and Packaging

### User-facing vs Internal Docs and Package Contents

- Updated `README.md` and user docs to:
  - Link only to shipped user docs, `CHANGELOG.md`, `SECURITY.md`, and relevant GitHub URLs.
  - Avoid direct references to internal `docs/` from user-facing materials.
- Updated user documentation (`user-docs/api-reference.md`, `user-docs/migration-guide.md`, `user-docs/eslint-9-setup-guide.md`, `user-docs/examples.md`) to:
  - Use correct relative links.
  - Avoid linking into internal `docs/`.
- Adjusted `package.json` `"files"` so the npm package ships only:
  - `lib/`
  - `README.md`
  - `LICENSE`
  - `SECURITY.md`
  - `user-docs/`
  - `CHANGELOG.md`
- Simplified `.npmignore` to rely on `"files"` and exclude dev/CI artifacts.
- Verified link correctness and package contents from the built npm artifact.

### Maintenance API Docs and Import Patterns

- Verified that maintenance APIs are only exposed via the main package entry.
- Updated `user-docs/api-reference.md` to:
  - Remove subpath import examples (e.g., `"eslint-plugin-traceability/maintenance"`).
  - Show imports exclusively from the main package.
  - Clarify that `prefer-implements-annotation` is opt-in and disabled in presets.
- Updated `README.md` and migration docs to describe `prefer-implements-annotation` as optional and disabled by default.

### Versioning and Release Documentation

- Updated references in:
  - `user-docs/api-reference.md`
  - `eslint-9-setup-guide.md`
  - `examples.md`
  - `migration-guide.md`
- Documented:
  - `semantic-release`-based versioning.
  - Treatment of the 1.x series.
  - GitHub Releases as the canonical change log.
- Added a “Versioning and Releases” section to `README.md`.

---

## Root-level Security Policy and Dependency Health Docs

- Added root `SECURITY.md` describing:
  - How to report vulnerabilities.
  - Supported versions (latest via `semantic-release`).
  - Guarantees around production dependencies at release time.
  - Use of `dry-aged-deps` and approach to dev-toolchain risk.
- Updated `docs/dependency-health.md` to:
  - Summarize dependency tooling (`npm audit`, `safety:deps`, `audit:dev-high`, `security:secrets`).
  - Clarify which checks are gating vs advisory.
  - Confirm that `safety:deps` is advisory only and never fails CI.
- Kept dependency-health and incident documentation aligned with actual scripts and configuration.

---

## Test Refactors and Helper Reuse

- Further reduced test duplication by:
  - Extracting FS mocking helpers into `tests/utils/fsTestHelpers.ts` (`mockFsForExistingFile`).
  - Extracting IO edge-case helpers into `tests/utils/ioTestHelpers.ts`, e.g., `runFallbackTextBeforeHasStoryDetectsStoryTest`.
  - Refactoring `require-story-*` tests to use these helpers.
  - Refactoring `require-story-visitors-edgecases.test.ts` to use `makeVisitors`/`buildVisitors` for visitor construction.
- Ensured maintenance tests (`batch.test.ts`, `report.test.ts`, `cli.test.ts`) use `createTempDir` consistently.

---

## Trunk-based Workflow, Hooks, and Security Gates

- Aligned project behavior and docs with trunk-based development:
  - `main` as the single integration branch.
  - Direct pushes to `main` by maintainers, guarded by Husky hooks.
  - PRs mainly for forks or optional review.
- Updated `docs/ci-cd-pipeline.md` to:
  - Emphasize the trunk-based flow.
  - Explain that `push` to `main` is authoritative for integration and publishing.
  - Describe `pull_request` runs as advisory/feedback-only without publishing.
- Updated `.husky/pre-push` to mirror CI’s critical gates:
  - `npm run ci-verify:full`
  - `npm run security:secrets`

---

## Consolidated Security Overview

- Added `docs/security-overview.md`, a maintainer-focused “Security Overview” that:
  - Summarizes high-level guarantees from `SECURITY.md` (runtime dependencies, dev-tool isolation, secret scanning).
  - Lists all security-related npm scripts with descriptions and whether each is gating or advisory:
    - `ci-verify:full`
    - `safety:deps`
    - `audit:ci`
    - `audit:dev-high`
    - `deps:maturity`
    - `security:secrets`
    - `check:traceability`
  - Describes supporting configuration:
    - `.secretlintrc.json` and ignore patterns.
    - `package.json` `overrides` and `docs/security-incidents/dependency-override-rationale.md`.
  - Explains CI/CD security gates:
    - Use of `ci-verify:full` and `security:secrets` in `.github/workflows/ci-cd.yml`.
    - How semantic-release and smoke tests run only after gates pass on `main`.
    - Nightly `dependency-health` job using `audit:dev-high`.
  - Describes local hooks mirroring CI:
    - Pre-commit (`lint-staged`).
    - Pre-push (`ci-verify:full` + `security:secrets`).
  - Includes a gating vs advisory matrix and references to other security-related docs and ADRs.

### Cross-references and Alignment Updates

- Updated `SECURITY.md` to:
  - Add a short maintainer note pointing to `docs/security-overview.md` as the consolidated implementation reference (without linking it for end users).
- Updated `docs/ci-cd-pipeline.md` to:
  - Reference `docs/security-overview.md` where production dependency audits and security gates are discussed.
- Updated `docs/dependency-health.md` to:
  - Clarify again in the summary that `npm run safety:deps` is purely advisory and cannot fail CI.
  - Note that it should be read together with `docs/security-overview.md`.
- Updated `docs/security-incidents/handling-procedure.md` to:
  - Reference `docs/security-overview.md` as the consolidated description of how security tooling and gates are wired into CI and local workflows.

---

## Recent Traceability and Test-Duplication Work

- Analyzed the jscpd duplication report for tests and focused on high-duplication files.
- Refactored `tests/rules/require-req-annotation.test.ts` to reduce duplication by:
  - Introducing a `missingReq(functionName: string)` helper that returns the standard `missingReq` error object.
  - Replacing repeated inline error objects like:

    ```ts
    errors: [
      {
        messageId: "missingReq",
        data: { name: "baz", functionName: "baz" },
      },
    ]
    ```

    with:

    ```ts
    errors: [missingReq("baz")]
    ```

  - Applying this change to:
    - TypeScript-specific invalid cases within `runAnnotationCheckerTests`.
    - All single-error invalid cases in the primary `ruleTester.run` block where `name === functionName`.
- Updated traceability annotations for unannotated or under-annotated branches based on `scripts/traceability-report.md`:

  - In `src/maintenance/detect.ts`:
    - Added `@implements` comments to:
      - The `catch` around `fs.readFileSync` in `processFileForStaleAnnotations`, tying it to `REQ-MAINT-DETECT` and `REQ-MAINT-SAFE`.
      - The `if (inProjectCandidates.length === 0)` guard in `handleStoryMatch`.
      - Both `catch` blocks in `getInProjectCandidates`, documenting that boundary errors are treated as out-of-project.
      - The arrow function inside `anyInProjectCandidateExists`, linking the existence check to `REQ-MAINT-DETECT`.

  - In `src/rules/helpers/valid-annotation-utils.ts`:
    - Annotated `collapseAnnotationValue` for multiline support (`REQ-MULTILINE-SUPPORT`).
    - Added fine-grained `@implements` comments to each branch in `getFixedStoryPath`:
      - Rejecting traversal (`REQ-AUTOFIX-SAFE`).
      - Handling existing `.story.md` (`REQ-AUTOFIX-FORMAT`).
      - Fixing `.story` and `.md` endings with preservation and format requirements (`REQ-AUTOFIX-FORMAT`, `REQ-AUTOFIX-PRESERVE`).
      - The final default case, tying together format, preservation, and safety.

  - In `src/rules/helpers/valid-story-reference-helpers.ts`:
    - In `analyzeCandidateBoundaries`, added annotations to both in-project and out-of-project classification branches (`REQ-PROJECT-BOUNDARY`).
    - In `handleProjectBoundaryForExistence`, annotated:
      - Handling of candidate lists (`REQ-PROJECT-BOUNDARY`, `REQ-CONFIGURABLE-PATHS`).
      - Branches that report out-of-project matches or boundary violations.
    - In `performSecurityValidations`, added annotations for:
      - Absolute path handling and rejection when disallowed.
      - Traversal detection, resolution, and rejection of paths that escape the project root (`REQ-SECURITY-VALIDATION`).

- Reran and confirmed success of:
  - `npm run lint -- --max-warnings=0`
  - `npm test`
  - `npm run build`
  - `npm run type-check`
  - `npm run format:check`
  - `npm run duplication`
  - `npm run check:traceability`

- Formatted updated files with Prettier and rechecked formatting.
- Committed these changes as:

  - `refactor: reduce duplication in tests and improve traceability annotations`

- Pushed to `main`, which triggered the GitHub Actions **CI/CD Pipeline** workflow. The workflow run completed successfully, including all configured quality and security gates.

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"."}
Used tool: get_git_status with input: {}
Used tool: list_directory with input: {"dirPath":"tests"}
Used tool: list_directory with input: {"dirPath":"tests/rules"}
Used tool: list_directory with input: {"dirPath":"tests/utils"}
Used tool: list_directory with input: {"dirPath":".voder-jscpd-report"}
Used tool: read_file with input: {"filePath":".voder-jscpd-report/jscpd-report.json"}
Used tool: read_file with input: {"filePath":"tests/utils/annotation-checker.test.ts"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: read_file with input: {"filePath":"tests/rules/require-req-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/require-story-core-test-helpers.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core-edgecases.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-branch-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/error-reporting.test.ts"}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-req-annotation.test.ts","pattern":"languageOptions","isRegex":false}
Used tool: find_files with input: {"pattern":".jscpd*","directory":"."}
Used tool: read_file with input: {"filePath":"tests/utils/ts-language-options.ts"}
Used tool: read_file with input: {"filePath":"eslint.config.js"}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: run_command with input: {"command":"npx","args":["jscpd","src","tests","--reporters","json","--output",".voder-jscpd-report/jscpd-report-latest.json"]}
Used tool: read_file with input: {"filePath":".voder-eslint-report.json"}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: read_file with input: {"filePath":"src/maintenance/detect.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts"}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts"}
Used tool: modify_file with input: {"filePath":"tests/utils/annotation-checker.test.ts","instruction":"Refactor to remove internal duplication of RuleTester languageOptions blocks by centralizing TS language options in withTsLanguageOptions helper (already imported) and eliminating redundant inline languageOptions from test case definitions. Ensure behavior remains the same and test names and assertions are untouched."}
Used tool: search_file_content with input: {"filePath":".voder-jscpd-report/jscpd-report.json","pattern":"tests/utils/annotation-checker.test.ts","isRegex":false}
Used tool: read_file with input: {"filePath":".voder-jscpd-report/jscpd-report-latest.json/jscpd-report.json"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/utils/annotation-checker.test.ts","tests/rules/require-req-annotation.test.ts"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: refactor annotation-checker RuleTester setup to shared helper"}
Used tool: modify_file with input: {"filePath":"src/maintenance/cli.ts","instruction":"For each control-flow branch (if, switch/case, try/catch) listed as missing annotations in scripts/traceability-report.md, add inline traceability comments using @implements pointing to the appropriate maintenance stories and requirements. Use concise comments that explain why the branch exists in terms of requirements, without changing runtime behavior."}
Used tool: modify_file with input: {"filePath":"src/maintenance/detect.ts","instruction":"Add missing @implements or @story/@req annotations for the arrow function at line 176 and for any control-flow branches (try/catch, if) reported as missing in scripts/traceability-report.md. Ensure each branch has a brief, precise traceability comment tying it back to docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md and the relevant REQ IDs, without altering logic."}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-annotation-utils.ts","instruction":"Add missing @story/@req or @implements annotations for the if-statements called out in scripts/traceability-report.md, describing what each condition is enforcing with respect to docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md and 010.1/010.2 stories as appropriate. Keep comments minimal and focused on why the branch exists."}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: modify_file with input: {"filePath":"src/maintenance/detect.ts","instruction":"Add inline @implements and/or @story/@req annotations on the remaining branches reported as missing in scripts/traceability-report.md (catch blocks, if statements in getInProjectCandidates and anyInProjectCandidateExists), tying them back to docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md and REQ-MAINT-DETECT / REQ-MAINT-SAFE. Keep comments concise and avoid changing runtime logic."}
Used tool: modify_file with input: {"filePath":"src/rules/valid-annotation-format.ts","instruction":"For each if-statement listed as missing traceability in scripts/traceability-report.md, add concise comments using @story/@req or @implements that explain which validation or autofix requirement from docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md, 008.0-DEV-AUTO-FIX.story.md, 010.1-DEV-CONFIGURABLE-PATTERNS.story.md, or 010.2-DEV-MULTI-STORY-SUPPORT.story.md the branch enforces. Do not alter behavior."}
Used tool: modify_file with input: {"filePath":"src/utils/annotation-checker.ts","instruction":"Annotate the missingReqFix function expression returned by createMissingReqFix with @story/@req or @implements comments directly above its definition, referencing docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md and REQ-ANNOTATION-AUTOFIX / REQ-ANNOTATION-REPORTING. Ensure no runtime behavior change."}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: read_file with input: {"filePath":"src/maintenance/cli.ts"}
Used tool: modify_file with input: {"filePath":"src/maintenance/cli.ts","instruction":"Convert existing mixed JSDoc/inline traceability comments on control-flow branches into consistent single-line // @implements comments immediately inside the if/switch/try/catch blocks as needed so that the traceability checker associates them with the reported branch nodes. Keep the textual content but follow the preferred @implements <story> <REQ-ID> format per branch."}
Used tool: modify_file with input: {"filePath":"src/maintenance/detect.ts","instruction":"Adjust traceability comments for branch-level annotations so that for each if/catch/try/arrow callback reported as missing in scripts/traceability-report.md, there is a nearby // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT (and REQ-MAINT-SAFE when applicable) comment aligned with the branch node rather than embedded inside other comments. Avoid changing runtime behavior."}
Used tool: modify_file with input: {"filePath":"src/utils/annotation-checker.ts","instruction":"Ensure the missingReqFix function expression returned from createMissingReqFix has a dedicated line-level // @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-AUTOFIX REQ-ANNOTATION-REPORTING comment immediately before its definition so that the traceability checker sees it as annotating that function node."}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-annotation-utils.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts"}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-annotation-utils.ts","instruction":"Add inline // @implements comments immediately inside each if block that the traceability report still flags in this file (lines around 64, 71, 78, 85, 114) so that each branch is clearly tied to REQ-REQ-FORMAT or REQ-ERROR-SPECIFICITY from docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md and 010.1-REQ-STORY-PATH-STRICTNESS.story.md. Do not change logic."}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: modify_file with input: {"filePath":"src/maintenance/cli.ts","instruction":"Add a single-line // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE traceability comment immediately inside the if (!command || ...) block and immediately above the try statement to ensure the checker associates them with the reported IfStatement and TryStatement nodes, without changing logic."}
Used tool: modify_file with input: {"filePath":"src/maintenance/detect.ts","instruction":"Inside the try/catch blocks in processFileForStaleAnnotations and getInProjectCandidates, and inside the if conditions called out in the traceability report (existence checks in detectStaleAnnotations and handleStoryMatch, and final existence/mark-stale checks), insert concise // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT (plus REQ-MAINT-SAFE where appropriate) comments as the first statement in each branch body to directly annotate the branch nodes."}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-annotation-utils.ts","instruction":"Directly above each still-reported if statement in this file (the first five in getFixedStoryPath and the kind checks in buildStoryErrorMessage/buildReqErrorMessage), insert inline // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT REQ-ERROR-SPECIFICITY comments describing that the branch enforces presence or correctness of story/req identifiers, without changing behavior."}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts","pattern":"for (const candidate","isRegex":false}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts","instruction":"Inside the for-of loop over candidates and each if block that the traceability report flags in this file (for-of at line 58 and the related ifs around 60, 93, 98, 105, 112, 139, 141, 151, 154), insert concise // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-SECURITY-VALIDATION comments as the first statements so the branches are explicitly traced to file-validation requirements without changing logic."}
Used tool: modify_file with input: {"filePath":"src/utils/annotation-checker.ts","instruction":"Replace the existing // @implements line before the missingReqFix function with a JSDoc-style block on the function itself: a brief description plus @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-AUTOFIX REQ-ANNOTATION-REPORTING, so the traceability checker associates it as a function-level annotation instead of a branch-level comment."}
Used tool: modify_file with input: {"filePath":"src/maintenance/detect.ts","instruction":"For the arrow function passed into Array.prototype.some in anyInProjectCandidateExists (reported as an unannotated arrow function), convert the existing inline branch comments to a JSDoc comment on the arrow callback parameter itself using @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT REQ-MAINT-SAFE, without changing behavior."}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: modify_file with input: {"filePath":"src/maintenance/cli.ts","instruction":"Move the // @implements traceability comment for the if (!command || ...) condition to be the first statement inside the if block body (directly under the opening brace) and similarly place a // @implements comment as the first statement inside the try block body, rather than before the try keyword, so the checker associates them with the correct branch nodes. Keep the existing comment text content."}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"chore: improve traceability annotations for maintenance and validation helpers"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["test"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
---

**This was the result:**
---
Here’s what I implemented for the **##NOW** and **##NEXT** sections, and where things currently stand.

---

## What I did for ##NOW

### [x] Analyze the most highly duplicated test file and refactor it

**Goal:** Reduce duplication in the most duplicated test file by using shared helpers / builders without changing behavior.

**How I approached it:**

1. **Identified the worst offender via jscpd**

   - Looked at `.voder-jscpd-report/jscpd-report.json`.
   - The most duplicated test file was:
     - `tests/utils/annotation-checker.test.ts`  
       - `duplicatedLines: 79`, `percentage: 97.53%` (previous report).

2. **Refactored `tests/utils/annotation-checker.test.ts`**

   File: `tests/utils/annotation-checker.test.ts`

   - Kept the existing shared helper pattern, but ensured the file is structured as a **single, reusable test harness** for TS-specific annotation behavior:
     - `runAnnotationCheckerTests(ruleName, config)`:
       - Accepts a `rule`, plus `valid` and `invalid` case arrays.
       - Internally uses:
         ```ts
         ruleTester.run(ruleName, rule, {
           valid: valid.map(withTsLanguageOptions),
           invalid: invalid.map(withTsLanguageOptions),
         });
         ```
       - `withTsLanguageOptions` comes from `tests/utils/ts-language-options.ts`, which centralizes the `RuleTester` TS parser configuration.
     - `rule`: a minimal helper rule that delegates to `checkReqAnnotation` for `TSDeclareFunction` and `TSMethodSignature`.

   - All **test case names and expectations** were preserved:
     - Valid:
       - `"[REQ-TYPESCRIPT-SUPPORT] valid TSDeclareFunction with @req"`
       - `"[REQ-TYPESCRIPT-SUPPORT] valid TSMethodSignature with @req"`
     - Invalid:
       - `"[REQ-TYPESCRIPT-SUPPORT] missing @req on TSDeclareFunction"`
       - `"[REQ-TYPESCRIPT-SUPPORT] missing @req on TSMethodSignature"`

   - This keeps test coverage and semantics identical while centralizing the TS `languageOptions` setup and RuleTester configuration.

3. **Verified behavior**

   - Targeted tests:
     ```bash
     npm test -- --runTestsByPath \
       tests/utils/annotation-checker.test.ts \
       tests/rules/require-req-annotation.test.ts
     ```
   - Both suites passed.

4. **Verified duplication improvement**

   - Ran a fresh jscpd including `tests/utils/**`:
     ```bash
     npx jscpd src tests --reporters json \
       --output .voder-jscpd-report/jscpd-report-latest.json
     ```
   - In the new report, `tests/utils/annotation-checker.test.ts` shows:
     - `duplicatedLines: 0`, `percentage: 0`.

5. **Commit**

   - Commit: `test: refactor annotation-checker RuleTester setup to shared helper`

---

## What I did for ##NEXT

### [ ] Apply the same refactoring approach to remaining high-duplication test files

I **did not yet refactor the other highly duplicated tests** (for example:

- `tests/maintenance/cli.test.ts`
- `tests/rules/require-story-helpers.test.ts`
- `tests/rules/valid-story-reference.test.ts`
- `tests/rules/require-story-core*.test.ts`

The duplication for those still appears in the jscpd output (the CI duplication step passes but still reports clones). This item remains **open**.

---

### [ ] Review traceability report and complete annotations

**Goal:** Close remaining traceability gaps so functions and control-flow branches are fully annotated.

I **made substantial progress** but did **not** drive the report to zero missing functions/branches. Current summary (from `scripts/traceability-report.md` at the end of work):

- `Functions missing @story/@req`: **7**
- `Branches missing @story/@req`: **34**

What I did:

#### 1. Maintenance CLI (`src/maintenance/cli.ts`)

- Added branch-level `@implements` comments that explicitly tie CLI branches to maintenance requirements:

  - For the help/usage path:
    ```ts
    if (!command || command === "-h" || command === "--help") {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE - Branch to show usage when no command or help flag is provided; handle help requests safely and provide discoverable usage output
      printHelp();
      return EXIT_OK;
    }
    ```

  - For the main `try` (error safety around subcommand dispatch):
    ```ts
    try {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE - Catch unexpected errors and surface concise diagnostics without crashing
      switch (command) { ... }
    } catch (error: unknown) {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE - Catch-all error branch ...
      ...
    }
    ```

  - For each case in the `switch`:
    - `detect`, `verify`, `report`, `update` each annotated with `REQ-MAINT-DETECT/VERIFY/REPORT/UPDATE`.
    - The `update` case also annotates printing help on `EXIT_USAGE` with `REQ-MAINT-SAFE`.
  - For the `default:` branch (unknown commands) and `printHelp()` itself, added `REQ-MAINT-SAFE` annotations.

These comments are placed **inside** the relevant blocks so the checker is more likely to associate them with the specific branch nodes.

#### 2. Maintenance detection logic (`src/maintenance/detect.ts`)

- Annotated key branches and helper logic to connect with maintenance/validation requirements.

  Examples:

  - Early return when workspace root is invalid:
    ```ts
    if (
      !fs.existsSync(workspaceRoot) ||
      !fs.statSync(workspaceRoot).isDirectory()
    ) {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE
      return [];
    }
    ```

  - In `processFileForStaleAnnotations`:
    ```ts
    try {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
      content = fs.readFileSync(file, "utf8");
    } catch {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE
      return;
    }
    ```

  - In `handleStoryMatch`, `getInProjectCandidates`, and `anyInProjectCandidateExists`, added `@implements` comments around:
    - Skipping unsafe paths (`isUnsafeStoryPath`)
    - Project-boundary enforcement and failure fallbacks
    - Existence checks and stale-marking behavior
    - Per-candidate existence checks in `some`:
      ```ts
      return inProjectCandidates.some(
        /**
         * @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT REQ-MAINT-SAFE
         */
        (p) => {
          const exists = fs.existsSync(p);
          if (!exists) {
            // @implements ... REQ-MAINT-SAFE ...
          }
          return exists;
        },
      );
      ```

#### 3. Annotation format helpers (`src/rules/helpers/valid-annotation-utils.ts`)

- Focused on the branches the report highlighted (if statements in `getFixedStoryPath` and the `kind === "missing"` checks):

  - For suffix decisions in `getFixedStoryPath`, added `@implements` tying each case to:
    - `REQ-REQ-FORMAT`
    - `REQ-ERROR-SPECIFICITY`
    - plus the autofix stories where applicable.

    Example:
    ```ts
    if (original.includes("..")) {
      // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT REQ-ERROR-SPECIFICITY - Enforces correctness of the story identifier by rejecting paths that use unsafe traversal segments.
      ...
    }
    ```

  - Similarly for `.story.md`, `.story`, `.md`, and the default no-extension case.

  - For `buildStoryErrorMessage` and `buildReqErrorMessage`, added rationale comments to the `kind === "missing"` branches indicating they enforce presence vs. correctness of identifiers.

#### 4. Valid-story-reference helpers (`src/rules/helpers/valid-story-reference-helpers.ts`)

- Added `@implements` on:

  - `for (const candidate of candidates)` loop and its `if/else`:
    ```ts
    for (const candidate of candidates) {
      // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-SECURITY-VALIDATION
      const boundary = enforceProjectBoundary(candidate, cwd);
      if (boundary.isWithinProject) {
        // @implements ... REQ-PROJECT-BOUNDARY
        hasInProjectCandidate = true;
      } else {
        // @implements ... REQ-PROJECT-BOUNDARY
        hasOutOfProjectCandidate = true;
      }
    }
    ```

  - The candidates-length check, out-of-project-only case, and matched-path boundary checks in `handleProjectBoundaryForExistence`.

  - Absolute-path and traversal checks in `performSecurityValidations`, tying them to `REQ-PROJECT-BOUNDARY` and `REQ-SECURITY-VALIDATION`.

#### 5. Annotation checker (`src/utils/annotation-checker.ts`)

- Function-level annotation for the **autofix factory**:

  ```ts
  /**
   * Creates a fix function that inserts a missing @req JSDoc before the node.
   * ...
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-AUTOFIX - Provide autofix for missing @req annotation
   * @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-AUTOFIX REQ-ANNOTATION-REPORTING
   */
  function createMissingReqFix(node: any) {
    const target = getFixTargetNode(node);
    ...
  }
  ```

- The traceability checker still reports the inner `missingReqFix` **function expression** as missing `@story/@req`. Addressing that fully will require either:
  - Enhancing the checker to treat the outer function’s annotations as covering inner named functions; or
  - Adding additional per-function annotations in a way that doesn’t clutter the file.

  I have not yet done that deeper change, so this item remains **partially complete**.

Given the remaining **7 functions** and **34 branches** reported missing annotations, this plan item is **not fully complete** yet.

---

### [ ] Revisit lint-rule suppression for over-parameterized function

- The suppression recorded in `.voder-eslint-report.json` is for:
  - `src/rules/helpers/valid-annotation-options.ts`, function `resolvePattern` (5 parameters, `max-params` is 4).
- I **examined** this via the ESLint report but did **not yet**:
  - Refactor `resolvePattern` to reduce parameters, or
  - Change/update the suppression comment/rationale.

This remains **to be done**.

---

### [x] Re-run duplication and traceability checks after improvements

This item is done (for the currently implemented improvements):

- **Duplication**:
  - `npm run duplication`
    - Still finds some clones (mostly around `tests/maintenance/cli.test.ts` and some rule tests) but within the configured threshold.
  - `npx jscpd src tests --reporters json ...`
    - Confirmed that `tests/utils/annotation-checker.test.ts` is now at `duplicatedLines: 0`.

- **Traceability**:
  - Ran repeatedly:
    ```bash
    npm run check:traceability
    ```
  - Confirmed it completes successfully and updates `scripts/traceability-report.md` with the latest counts.
  - Counts have shifted somewhat as annotations were added/refined, though there is still remaining work to reach “effectively complete” coverage.

- These checks, plus full CI (`ci-verify:full`), all passed on push.

---

## Updated Plan

Here is the updated plan with checkboxes reflecting what’s actually complete so far:

### NOW

- [x] Analyze the most highly duplicated test file and refactor it to use shared helpers or data builders so that repeated RuleTester setups and case definitions are centralized, reducing duplication without changing test behavior.

### NEXT

- [ ] Apply the same refactoring approach to the remaining test files that have very high duplication, extracting common configuration, fixtures, and assertion patterns into reusable test utilities while ensuring existing behaviors remain covered.
- [ ] Review the project’s traceability report and add or refine story and requirement annotations on any remaining unannotated functions and control-flow branches so that implementation traceability is effectively complete for existing features.
- [ ] Revisit the existing lint-rule suppression for the function that exceeds the parameter limit and either refactor the code to remove the need for the suppression or update its rationale to clearly document why it remains the preferred design.
- [x] Once duplication and traceability improvements are in place, re-run the project’s duplication and traceability checks to confirm that overall code-quality indicators have improved enough to allow a full functionality assessment.

### LATER

- [ ] Consider tightening selected linting thresholds (such as maximum complexity or function length) in small increments, guided by current violation hotspots, to further reinforce maintainable design without causing widespread breakage.
- [ ] Enhance internal developer documentation to describe the shared testing helpers, traceability expectations, and how to extend them when adding new rules or maintenance features so future work naturally preserves high code quality.
- [ ] Evaluate whether the traceability check should be made stricter (for example, failing when coverage drops below an agreed threshold) once the current gaps are closed and the team is comfortable with the process.

If you’d like, the next focused step can be either:
- systematically closing the remaining traceability-report items file-by-file, or
- tackling duplication in `tests/maintenance/cli.test.ts` and the overlapping require-story helper/core tests.
---
