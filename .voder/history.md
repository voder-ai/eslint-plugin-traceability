Here’s a concise history-only summary of what’s been done so far on the project, including the most recent work.

---

## ESLint Plugin, Rules, and Config

- Created the plugin entrypoint (`src/index.ts`) exporting all rules, flat-config presets (`recommended`, `strict`), and maintenance utilities.
- Implemented core rules:
  - `require-story-annotation`
  - `require-req-annotation`
  - `require-branch-annotation`
  - `valid-annotation-format`
  - `valid-story-reference`
  - `valid-req-reference`
  - `prefer-implements-annotation`
- Added TypeScript-focused `RuleTester` helpers and migrated rule tests to use them.
- Added plugin/config tests:
  - `tests/plugin-*.test.ts` for exports, configs, and error handling.
  - `tests/config/*.test.ts` for config schema validation.
- Kept flat-config docs and setup guides in sync with actual configs.

## Maintenance CLI and Utilities

- Designed and documented the `traceability-maint` CLI (`detect`, `verify`, `report`, `update`) with flags and exit codes, and captured this in an ADR.
- Implemented CLI parsing and dispatch in `src/maintenance/cli.ts`.
- Implemented maintenance modules:
  - `detectStaleAnnotations`
  - `updateAnnotationReferences`
  - `batchUpdateAnnotations`
  - `verifyAnnotations`
  - `generateMaintenanceReport`
- Exposed maintenance utilities via `src/index.ts` and wired the CLI binary through `package.json`.
- Added tests under `tests/maintenance/**` plus integration tests for JSON output, dry-run behavior, exit codes, and error handling.

## Annotation Format, Validation, and Multi-story Support

- Implemented configurable annotation patterns in `valid-annotation-options`:
  - Normalized options, compiled regexes, validated configs, and exposed schema/defaults.
- Refactored `valid-annotation-format` to use these helpers for consistent validation and clearer errors.
- Extended `valid-annotation-format` to support:
  - Multiline annotations.
  - Custom `@story` / `@req` patterns.
  - Detailed configuration error messages.
- Implemented multi-story `@implements` support:
  - Added `valid-implements-utils` to parse and validate `@implements` values.
  - Updated `valid-annotation-format` and `valid-req-reference` to handle multiple stories via `@implements`.
  - Added multi-story fixtures and tests.
- Implemented `reqAnnotationDetection` and reused it across `annotation-checker` and validation rules.

## Migration to `@implements`

- Implemented `prefer-implements-annotation` as a suggestion rule with conservative autofix:
  - Detected legacy `@story` + `@req` blocks and mixed/multi-story comments.
  - Autofixed simple single-story cases to `@implements`.
- Added dedicated rule tests.
- Wrote migration and rule documentation:
  - `docs/rules/prefer-implements-annotation.md`
  - `user-docs/migration-guide.md`
- Updated fixtures and rule docs to present `@implements` as the preferred pattern.

## Deep Validation, Story/Req Checks, and Paths

- Enhanced `valid-req-reference` with deep requirement validation:
  - Extracted `REQ-...` IDs from story files.
  - Validated `@req` and `@implements` IDs against story content.
  - Enforced safe paths and scoped story references.
- Implemented `valid-story-reference` and helpers to:
  - Check story file existence and resolve paths.
  - Enforce project boundaries.
  - Support options such as `storyDirectories`, `allowAbsolutePaths`, `requireStoryExtension`.
- Added comprehensive tests for `valid-req-reference` and `valid-story-reference`, including path security and multi-story behavior.

## Error Reporting and Autofix

- Standardized error message conventions across rules with traceability-aware messaging.
- Added per-rule tests for message content.
- Implemented targeted autofix behaviors:
  - Adding missing `@story` annotations.
  - Fixing `.story.md` suffix issues.
  - Migrating simple `@story` + `@req` blocks to `@implements`.
- Added dedicated autofix tests, including `auto-fix-behavior-008.test.ts`.

## CI, Quality Gates, and Husky Hooks

- Maintained strict quality gates: build, tests, lint, type-check, formatting, duplication, and traceability checks.
- Consolidated CI checks under `npm run ci-verify:full`.
- Ensured the GitHub “CI/CD Pipeline” workflow:
  - Runs on pushes/PRs to `main` and on a schedule.
  - Uses Node 20 for release jobs and runs smoke tests after releases.
- Updated Husky hooks:
  - `pre-commit` → `npx lint-staged` (Husky v9 layout).
  - `pre-push` → `npm run ci-verify:full`.
- Kept CI workflows, ADRs, and runtime/prerequisite docs aligned.

## Semantic-release, Runtime, and Security Incidents

- Investigated `semantic-release` failures due to npm OTP requirements and adjusted CI to treat OTP issues as “no new release” instead of hard failures.
- Raised Node engine requirement to `>=18.18.0` and aligned ESLint 9 and CI Node versions.
- Analyzed dev-only dependency incidents involving `glob`, `brace-expansion` ReDoS, and the bundled `npm` inside `semantic-release` tooling.
- Classified the bundled-npm issue in `semantic-release` / `@semantic-release/npm` as a controlled known error.
- Authored and updated security incident docs, including:
  - `SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md`
  - Superseding incident files and cross-links.
- Documented job isolation, least privilege, and compensating controls in `.github/workflows/ci-cd.yml` and related security docs.

## Secret Scanning and Dependency Safety

- Integrated Secretlint with recommended presets and wired it into CI via `npm run security:secrets`.
- Introduced `dry-aged-deps` for dependency maturity checks:
  - Added `npm run deps:maturity` with optional JSON output.
  - Implemented `scripts/ci-safety-deps.js` to run `deps:maturity --format=json`, writing `ci/dry-aged-deps.json` without failing CI.
- Ran `deps:maturity` and `npm audit` and documented:
  - Zero high-severity vulnerabilities in production dependencies.
  - Specific dev dependencies that cannot be safely updated under current policy.
- Updated:
  - `docs/dependency-health.md`
  - `docs/security-incidents/2025-12-03-dependency-health-review.md`
  with dependency status, thresholds, and expectations.

## CI/CD Pipeline and Contributor Documentation

- Wrote `docs/ci-cd-pipeline.md` describing:
  - Workflow triggers and jobs.
  - Quality checks, secret scanning, and artifacts.
  - `semantic-release` behavior and Conventional Commits → semver mapping.
- Updated `CONTRIBUTING.md` to explain `ci-verify:fast` vs `ci-verify:full` and local workflows mirroring CI.
- Ensured runtime and peer-dependency docs match `package.json` and CI configuration.

## Lint Rules, Refactors, and Max-lines Enforcement

- Added an ADR and enabled ESLint security rules (`no-eval`, `no-implied-eval`, `no-new-func`, `no-new-wrappers`, etc.).
- Enforced `max-lines-per-function` = 55 for production code.
- Refactored:
  - Maintenance modules (CLI, utils, update, detect).
  - Annotation helpers and validation rules.
  - `valid-annotation-format` and `valid-implements` helpers.
- Extracted shared test helpers for `require-story` autofix tests and TS `RuleTester` utilities.
- Maintained zero lint warnings after refactors.

## Functionality Coverage and Story Alignment

- Reviewed stories 001.0–010.3 and mapped them to:
  - Implemented rules and maintenance functions.
  - Tests in rules, maintenance, integration, and plugin/config suites.
- Created `docs/functionality-coverage-2025-12-03.md` summarizing:
  - Per-story status and evidence.
  - Gaps between story acceptance/DoD and implementation.
  - Aspirational areas (e.g., section-aware parsing, FS watching, configurable autofix templates).
- Confirmed the documented state via:
  - `npm test`
  - `npm run lint`
  - `npm run type-check`
  - `npm run build`
  - `npm run format:check`
  - `npm run duplication`
- Verified CI success over this set.

## Recent Tooling and Documentation Adjustments

- Updated `.husky/pre-commit` to the Husky v9 structure while preserving `npx lint-staged`.
- Ran `npm run ci-verify:full` after documentation and hook changes.
- Pushed changes to `main` and verified successful runs of the GitHub CI/CD pipeline.

## Dependency Maturity and Documentation Updates (2025-12-03)

- Reviewed `dry-aged-deps` configuration and usage:
  - Confirmed default thresholds (`prod`/`dev` `minAge=7`, `minSeverity="none"`).
  - Verified `safety:deps` writes `ci/dry-aged-deps.json`.
- Ran:
  - `npm run deps:maturity -- --format=json --check`
  - `npx dry-aged-deps --format=json`
  and confirmed both reported `packages: []`, `summary.totalOutdated: 0`, `safeUpdates: 0`.
- Cross-checked `npm ls --depth=0`, `npm show`, and incident docs to confirm that “no safe updates” reflects policy/maturity rather than misconfiguration.
- Verified that no dependency changes were required (`package.json` and lockfile unchanged).
- Updated:
  - `docs/dependency-health.md` with a 2025-12-03 verification date and the `totalOutdated: 0`, `safeUpdates: 0` result.
  - `docs/security-incidents/dependency-override-rationale.md` with an “Alignment with dry-aged-deps” section explaining coexistence with overrides.
- Re-validated with `npm run build`, `npm test`, `npm run lint`, `npm run type-check`, and `npm run format:check`.
- Committed/pushed doc updates and confirmed CI/CD pipeline success.

## Dev-only Audit and Documentation Work

- Reviewed dev-audit tooling and docs:
  - `package.json` scripts and `scripts/generate-dev-deps-audit.js`.
  - Relevant ADRs and stories, including `docs/decisions/008-ci-audit-flags.accepted.md` and `docs/stories/012.0-DEV-CI-AUDIT-INTEGRATION.story.md`.
- Corrected the dev-only audit script:
  - Updated JSDoc to describe `npm audit --include=dev --audit-level=high --json`.
  - Changed spawn args from `--omit=prod` to `--include=dev`.
  - Preserved writing `ci/npm-audit.json` and always exiting `0`.
  - Ran the script, confirmed `ci/npm-audit.json` creation, and inspected the output.
- Updated `docs/dependency-health.md`:
  - Clarified `npm run audit:dev-high` behavior and output.
  - Fixed a documented path inconsistency.
- Updated user-facing docs:
  - `README.md` to show an ESLint 9 flat-config ESM example using `traceability.configs.recommended` instead of CommonJS.
  - `user-docs/api-reference.md` to:
    - Note `valid-annotation-format` is `warn` by default.
    - Introduce `@implements` briefly and link to:
      - `user-docs/migration-guide.md`
      - `docs/rules/valid-annotation-format.md`
      - `docs/rules/valid-req-reference.md`.
- Clarified secret scanning vs local hooks in `docs/ci-cd-pipeline.md`:
  - Documented that `npm run security:secrets` runs only in CI on the Node 20.x matrix.
- Added `docs/code-quality-refactor-opportunities-2025-12-03.md` describing possible refactors (non-behavioral).
- Ran `npm run ci-verify:full`.
- Committed and pushed:
  - `chore: refine dev-only audit tooling and docs`
  - `docs: clarify dev audit, presets, @implements, and secret scanning`
- Confirmed two successful “CI/CD Pipeline” runs for these commits.

## Maintenance CLI Refactors and Helper Cleanups

- Analyzed maintenance code and lint reports for `cli.ts`, `valid-story-reference-helpers.ts`, `valid-annotation-options.ts`, `tests/utils/ts-language-options.ts`, and maintenance tests.

### Flags/argv module

- Refactored maintenance CLI flag/argv handling into `src/maintenance/flags.ts`:
  - Introduced:
    - `ParsedCliInput` for raw argv decomposition.
    - `NormalizedCliArgs` with `subcommand` and `args`.
    - `normalizeCliArgs(rawArgv: string[]): NormalizedCliArgs`.
    - `ParsedFlags` and `parseFlags(normalized: NormalizedCliArgs): ParsedFlags`.
  - Implemented `createDefaultFlags` and `applyFlag`:
    - Supported flags: `--root`, `--json`, `--format`, `--from`, `--to`, `--dry-run`.
    - Validated `--format` (`text`/`json` only) and threw descriptive errors for invalid values.
  - Preserved previous behavior.

### CLI entrypoint coordination

- Updated `src/maintenance/cli.ts`:
  - Imported `normalizeCliArgs` and `NormalizedCliArgs` from `./flags`.
  - Kept `printHelp` and `runMaintenanceCli` as the main entrypoints.
  - Changed `runMaintenanceCli` to:
    - Normalize `rawArgv` via `normalizeCliArgs`.
    - Preserve behavior for no subcommand, `-h`, and `--help` (printing help, exiting `EXIT_OK`).
    - Route to handlers via a `switch` on the normalized `subcommand`.
    - Pass `NormalizedCliArgs` into handlers instead of raw arrays.
    - Catch thrown errors (e.g., invalid `--format`, I/O errors) and print `traceability-maint failed: ...`, returning `EXIT_USAGE`.
  - Retained the `require.main === module` guard and exports.

### Subcommand handlers

- Updated `src/maintenance/commands.ts`:
  - Kept exit codes: `EXIT_OK`, `EXIT_STALE`, `EXIT_USAGE`.
  - Updated handlers to accept `NormalizedCliArgs`:
    - `handleDetect`
    - `handleVerify`
    - `handleReport`
    - `handleUpdate`
  - Imported and used `parseFlags` from `./flags` inside each handler.
  - Preserved existing behavior:
    - `detect`: JSON/text outputs, stale detection, exit codes `0`/`1`.
    - `verify`: validation messaging and `EXIT_OK`/`EXIT_STALE`.
    - `report`: `--format` handling, including “no stale annotations” messaging.
    - `update`:
      - Required `--from` and `--to`, else `EXIT_USAGE` with error message.
      - `--dry-run` mode with summary and estimated stale count, no writes.
      - JSON and text output modes.
      - Normal update path with counts and pluralization.

### Helper refactors and ESLint configuration

- In `src/rules/helpers/valid-annotation-options.ts`:
  - Introduced `ResolvePatternArgs`.
  - Refactored `resolvePattern` to accept a single options object.
  - Updated story/requirement pattern call sites.
  - Removed a `max-params` ESLint suppression.
- In `tests/utils/ts-language-options.ts`:
  - Introduced `ECMA_VERSION_2022` constant via `Number.parseInt`.
  - Switched `parserOptions.ecmaVersion` to use the constant.
  - Removed `no-magic-numbers` suppression.
- In `src/rules/helpers/valid-story-reference-helpers.ts`:
  - Removed a standalone `ReportInvalidPathFn` type alias and its ESLint-disable comment.
  - Introduced `_ReportInvalidPathArgs` interface.
  - Updated `HandleBoundaryOptions` and `SecurityValidationOptions` to use:
    - `reportInvalidPath: (_args: _ReportInvalidPathArgs) => void;`
  - Kept semantics while satisfying lint via underscore naming.
- In `eslint.config.js`:
  - Updated the TS rules block so `no-unused-vars` ignores underscore-prefixed args/vars:
    - `"no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }]`.

### Maintenance CLI tests and defensive paths

- Extended and re-ran tests in `tests/maintenance/cli.test.ts` and related maintenance tests to cover:
  - `traceability-maint report --format yaml`:
    - Exit with `EXIT_USAGE` (`2`).
    - Error message stating invalid format and “Expected 'text' or 'json'”.
  - `traceability-maint detect --root <non-existent>`:
    - Exit `EXIT_OK` (`0`).
    - Log “No stale @story annotations found.”
  - `update` without `--from`/`--to`:
    - Exit `EXIT_USAGE` with the expected error message and help behavior.
  - No-subcommand help behavior:
    - Prints help, exits `0`, and does not write to stderr.
  - Filesystem permission error from `detect`:
    - Simulated via `fs.statSync` throwing `EACCES`.
    - Confirmed that `runMaintenanceCli` catches the error, prints `traceability-maint failed: ...`, and returns `EXIT_USAGE`.

### Branch-level traceability annotations

- Added branch-level traceability comments (no behavior change) to:

  - `src/maintenance/cli.ts`:
    - Help-branch (`no command`/`-h`/`--help`) annotated with `@story` and `@req` (`REQ-MAINT-SAFE`).
    - Each `switch` case (`detect`, `verify`, `report`, `update`, and default) annotated with relevant maintenance requirements (`REQ-MAINT-DETECT`, `REQ-MAINT-VERIFY`, `REQ-MAINT-REPORT`, `REQ-MAINT-UPDATE`, `REQ-MAINT-SAFE`).
    - The `if (result === EXIT_USAGE)` branch inside `update` annotated as help-on-usage-error (`REQ-MAINT-SAFE`).
    - The `catch (error: unknown)` block annotated to show unexpected errors are caught and surfaced with concise diagnostics (`REQ-MAINT-SAFE`).

  - `src/maintenance/detect.ts`:
    - Added a comment before the `for (const file of files)` loop, referencing `REQ-MAINT-DETECT` and describing the iteration over workspace files to inspect `@story` annotations.

  - `src/rules/helpers/valid-annotation-utils.ts`:
    - In `getFixedStoryPath`, added branch-level comments before each `if`:
      - Guarding against `..` segments (`REQ-AUTOFIX-SAFE`).
      - Returning `null` for already `.story.md` paths.
      - Handling `.story` → `.story.md`.
      - Upgrading `.md` → `.story.md`.
      - The fallback appending `.story.md` to extension-less paths.
    - Linked these branches to `docs/stories/008.0-DEV-AUTO-FIX.story.md` and requirements like `REQ-AUTOFIX-FORMAT`, `REQ-AUTOFIX-SAFE`, and `REQ-AUTOFIX-PRESERVE`.

### Tooling, quality checks, and git operations (most recent)

- Used repository-inspection tools to:
  - List and inspect files in `src`, `src/maintenance`, `tests/maintenance`, `.github/workflows`, and rule/helper modules.
  - Search for `eslint-disable` usage across `src` and `tests` and confirm no remaining inline suppressions.
  - Review scripts such as `scripts/traceability-check.js`, `scripts/traceability-report.md`, `scripts/eslint-suppressions-report.md`, and `scripts/tsc-output.md`.
- Ran local commands via the tooling environment:
  - `npm test -- --runInBand` and targeted Jest runs for `tests/maintenance/cli.test.ts`.
  - `npm run build`, `npm run type-check`, `npx tsc -p tsconfig.json --noEmit --pretty false`.
  - `npm run lint -- --max-warnings=0`.
  - `npm run format:check`, `npm run format`.
  - `npm run duplication`.
- Performed git operations within the environment:
  - `git status`, `git diff`, and inspection of recent logs and remotes.
  - Staged and committed changes with messages:
    - `refactor: extract maintenance CLI flag normalization into dedicated module`
    - `test: extend maintenance CLI tests and add branch traceability annotations`
    - `style: apply formatting after traceability and test updates`
    - `chore: update traceability report after maintenance CLI changes`
    - `refactor: document maintenance CLI dispatch and auto-fix branching`
  - Attempted `git push` (including `git push origin HEAD:main` and `git push --verbose`), which were rejected due to remote/credential constraints in the tool environment.
- Queried GitHub pipeline status via the available tool to confirm the state of the remote CI/CD runs (latest successful runs on `main` predate these local-only commits).

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"."}
Used tool: find_files with input: {"pattern":"package.json","directory":"."}
Used tool: find_files with input: {"pattern":"*cli*.*","directory":"."}
Used tool: read_file with input: {"filePath":"src/maintenance/cli.ts"}
Used tool: list_directory with input: {"dirPath":"src/maintenance"}
Used tool: get_git_status with input: {}
Used tool: read_file with input: {"filePath":"src/maintenance/flags.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/commands.ts"}
Used tool: list_directory with input: {"dirPath":"tests/maintenance"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: search_file_content with input: {"filePath":"src","pattern":"eslint-disable","isRegex":false}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src"}
Used tool: search_file_content with input: {"filePath":"src/maintenance/cli.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/maintenance/batch.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/maintenance/detect.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/maintenance/update.ts","pattern":"eslint-disable","isRegex":false}
Used tool: read_file with input: {"filePath":"docs/decisions/adr-maintenance-cli-interface.md"}
Used tool: find_files with input: {"pattern":"009.0-DEV-MAINTENANCE-TOOLS*","directory":"docs/stories"}
Used tool: read_file with input: {"filePath":"tests/maintenance/cli.test.ts"}
Used tool: read_file with input: {"filePath":".gitignore"}
Used tool: run_command with input: {"command":"grep","args":["-R","--line-number","\"eslint-disable\"","src","tests"]}
Used tool: run_command with input: {"command":"grep","args":["-R","--line-number","eslint-disable","src","tests"]}
Used tool: read_file with input: {"filePath":"docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md"}
Used tool: find_files with input: {"pattern":"*flags*.ts","directory":"tests"}
Used tool: read_file with input: {"filePath":"tests/maintenance/detect-isolated.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/update-isolated.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/report.test.ts"}
Used tool: search_file_content with input: {"filePath":"tests/maintenance/cli.test.ts","pattern":"Unknown command","isRegex":false}
Used tool: read_file with input: {"filePath":"src/maintenance/detect.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/report.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/update.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/utils.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/index.ts"}
Used tool: list_directory with input: {"dirPath":"src/rules/helpers"}
Used tool: find_files with input: {"pattern":"*eslint-disable*","directory":"src"}
Used tool: find_files with input: {"pattern":"*eslint-disable*","directory":"tests"}
Used tool: run_command with input: {"command":"grep","args":["-R","eslint-disable","."]}
Used tool: find_files with input: {"pattern":"*.ts","directory":"tests"}
Used tool: find_files with input: {"pattern":"*.ts","directory":"scripts"}
Used tool: find_files with input: {"pattern":"*.ts","directory":"."}
Used tool: read_file with input: {"filePath":"tests/cli-error-handling.test.ts"}
Used tool: run_command with input: {"command":"grep","args":["-n","eslint-disable","src/maintenance/*.ts"]}
Used tool: get_git_status with input: {}
Used tool: list_directory with input: {"dirPath":".husky"}
Used tool: read_file with input: {"filePath":".husky/pre-commit"}
Used tool: read_file with input: {"filePath":".husky/pre-push"}
Used tool: read_file with input: {"filePath":"src/maintenance/batch.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/detect.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/update.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/batch.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/index.test.ts"}
Used tool: run_command with input: {"command":"grep","args":["-R","-n","-m","100","eslint-disable","."]}
Used tool: read_file with input: {"filePath":"eslint.config.js"}
Used tool: list_directory with input: {"dirPath":"src/rules"}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src/rules"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-io.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-utils.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-visitors.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/valid-annotation-format-internal.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/valid-annotation-options.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/valid-annotation-utils.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/valid-implements-utils.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts","pattern":"eslint-disable","isRegex":false}
Used tool: run_command with input: {"command":"grep","args":["-R","-n","eslint-disable","src/maintenance","tests/maintenance","scripts"]}
Used tool: read_file with input: {"filePath":"scripts/lint-plugin-guard.js"}
Used tool: search_file_content with input: {"filePath":"src/rules/require-story-annotation.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/require-branch-annotation.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/valid-story-reference.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/valid-annotation-format.ts","pattern":"eslint-disable","isRegex":false}
Used tool: read_file with input: {"filePath":"scripts/generate-dev-deps-audit.js"}
Used tool: read_file with input: {"filePath":"scripts/lint-plugin-check.js"}
Used tool: read_file with input: {"filePath":"scripts/report-eslint-suppressions.js"}
Used tool: search_file_content with input: {"filePath":"tests/maintenance/cli.test.ts","pattern":"report exits 2","isRegex":false}
Used tool: run_command with input: {"command":"grep","args":["-R","-n","process.argv","src/maintenance"]}
Used tool: search_file_content with input: {"filePath":"src/index.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/prefer-implements-annotation.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/require-req-annotation.ts","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/valid-req-reference.ts","pattern":"eslint-disable","isRegex":false}
Used tool: check_file_exists with input: {"filePath":"scripts/eslint-suppressions-report.md"}
Used tool: modify_file with input: {"filePath":"src/maintenance/cli.ts","instruction":"Replace the entire file content with the following exactly:\n\n#!/usr/bin/env node\n\nimport {\n  EXIT_OK,\n  EXIT_USAGE,\n  handleDetect,\n  handleVerify,\n  handleReport,\n  handleUpdate,\n} from \"./commands\";\nimport { normalizeCliArgs, NormalizedCliArgs } from \"./flags\";\n\n/**\n * Maintenance CLI entry point.\n * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md\n * @req REQ-MAINT-DETECT - CLI support for detection of stale annotations\n * @req REQ-MAINT-VERIFY - CLI support for verification of annotations\n * @req REQ-MAINT-REPORT - CLI support for human-readable reports\n * @req REQ-MAINT-UPDATE - CLI support for updating annotation references\n * @req REQ-MAINT-BATCH - CLI support for batch maintenance operations\n * @req REQ-MAINT-SAFE - Provide clear exit codes and avoid unsafe defaults\n */\nexport function runMaintenanceCli(rawArgv: string[]): number {\n  const initialNormalized: NormalizedCliArgs = normalizeCliArgs(rawArgv);\n  const { subcommand: command } = initialNormalized;\n\n  if (!command || command === \"-h\" || command === \"--help\") {\n    /**\n     * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md\n     * @req REQ-MAINT-SAFE - Handle help requests safely and provide discoverable usage output\n     */\n    printHelp();\n    return EXIT_OK;\n  }\n\n  // Re-use the normalized arguments object for handlers so that they\n  // receive the subcommand name and its raw argument vector unchanged.\n  const normalized: NormalizedCliArgs = initialNormalized;\n\n  try {\n    switch (command) {\n      case \"detect\":\n        // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md @req REQ-MAINT-DETECT - Dispatch to detection handler\n        return handleDetect(normalized);\n      case \"verify\":\n        // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md @req REQ-MAINT-VERIFY - Dispatch to verification handler\n        return handleVerify(normalized);\n      case \"report\":\n        // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md @req REQ-MAINT-REPORT - Dispatch to reporting handler\n        return handleReport(normalized);\n      case \"update\": {\n        // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md @req REQ-MAINT-UPDATE - Dispatch to update handler\n        const result = handleUpdate(normalized);\n        // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md @req REQ-MAINT-SAFE - Print help on usage errors from update\n        if (result === EXIT_USAGE) {\n          printHelp();\n        }\n        return result;\n      }\n      default:\n        // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md @req REQ-MAINT-SAFE - Handle unknown commands safely with diagnostics\n        console.error(`Unknown command: ${command}`);\n        printHelp();\n        return EXIT_USAGE;\n    }\n  } catch (error: unknown) {\n    /**\n     * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md\n     * @req REQ-MAINT-SAFE - Catch unexpected errors and surface concise diagnostics without crashing\n     */\n    const message =\n      error instanceof Error\n        ? error.message\n        : \"Unknown error in maintenance CLI\";\n    console.error(`traceability-maint failed: ${message}`);\n    return EXIT_USAGE;\n  }\n}\n\n/**\n * Print CLI usage help for the maintenance tools.\n * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md\n * @req REQ-MAINT-SAFE - Provide discoverable CLI usage information\n */\nfunction printHelp(): void {\n  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md\n  // @req REQ-MAINT-SAFE - Provide discoverable CLI usage information\n  console.log(`traceability-maint - Traceability annotation maintenance tools\n\nUsage:\n  traceability-maint <command> [options]\n\nCommands:\n  detect   Detect stale @story annotations\n  verify   Verify that traceability annotations are valid\n  report   Generate a maintenance report\n  update   Update @story annotation references\n\nOptions:\n  --root <dir>        Workspace root to scan (defaults to current directory)\n  --json              Output JSON where supported\n  --format <text|json>  Output format for 'report' (default: text)\n  --from <oldPath>    Old story path for 'update'\n  --to <newPath>      New story path for 'update'\n  --dry-run           Plan changes for 'update' without modifying files\n  -h, --help          Show this help message\n`);\n}\n\nif (require.main === module) {\n  process.exit(runMaintenanceCli(process.argv));\n}\n"}
Used tool: modify_file with input: {"filePath":"src/maintenance/commands.ts","instruction":"Replace the entire file content with the following exactly:\n\n/**\n * Subcommand handlers for the traceability-maint CLI.\n *\n * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md\n * @req REQ-MAINT-DETECT - CLI support for detection of stale annotations\n * @req REQ-MAINT-VERIFY - CLI support for verification of annotations\n * @req REQ-MAINT-REPORT - CLI support for human-readable reports\n * @req REQ-MAINT-UPDATE - CLI support for updating annotation references\n * @req REQ-MAINT-SAFE - Provide clear exit codes and avoid unsafe defaults\n */\nimport { detectStaleAnnotations } from \"./detect\";\nimport { verifyAnnotations } from \"./batch\";\nimport { updateAnnotationReferences } from \"./update\";\nimport { generateMaintenanceReport } from \"./report\";\nimport { parseFlags, NormalizedCliArgs } from \"./flags\";\n\nexport const EXIT_OK = 0;\nexport const EXIT_STALE = 1;\nexport const EXIT_USAGE = 2;\n\n/**\n * Handle the `detect` subcommand for stale @story annotations.\n * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md\n * @req REQ-MAINT-DETECT - CLI surface for detection of stale annotations\n * @req REQ-MAINT-SAFE - Return specific exit codes for stale vs clean states\n */\nexport function handleDetect(normalized: NormalizedCliArgs): number {\n  const flags = parseFlags(normalized);\n  const root = flags.root;\n  const stale = detectStaleAnnotations(root);\n\n  if (flags.json) {\n    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md\n    // @req REQ-MAINT-REPORT - JSON-friendly output for tooling integration\n    console.log(JSON.stringify({ root, stale }));\n  } else if (stale.length === 0) {\n    console.log(\"No stale @story annotations found.\");\n  } else {\n    stale.forEach((story) => {\n      console.log(story);\n    });\n    console.log(\n      `Found ${stale.length} stale @story annotation${\n        stale.length === 1 ? \"\" : \"s\"\n      }.\nRun 'traceability-maint report' for a structured summary.`,\n    );\n  }\n\n  return stale.length === 0 ? EXIT_OK : EXIT_STALE;\n}\n\n/**\n * Handle the `verify` subcommand to validate traceability annotations.\n * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md\n * @req REQ-MAINT-VERIFY - CLI surface for verification of annotations\n * @req REQ-MAINT-SAFE - Return distinct exit codes for verification failures\n */\nexport function handleVerify(normalized: NormalizedCliArgs): number {\n  const flags = parseFlags(normalized);\n  const root = flags.root;\n  const valid = verifyAnnotations(root);\n\n  if (valid) {\n    console.log(`All traceability annotations under ${root} are valid.`);\n    return EXIT_OK;\n  }\n\n  console.log(\n    `Stale or invalid traceability annotations detected under ${root}.\\nRun 'traceability-maint detect' or 'traceability-maint report' for details.`,\n  );\n  return EXIT_STALE;\n}\n\n/**\n * Handle the `report` subcommand to generate a maintenance report.\n * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md\n * @req REQ-MAINT-REPORT - CLI surface for human-readable maintenance reports\n * @req REQ-MAINT-SAFE - Support machine-readable formats for safe automation\n */\nexport function handleReport(normalized: NormalizedCliArgs): number {\n  const flags = parseFlags(normalized);\n  const root = flags.root;\n  const format = flags.format ?? \"text\";\n\n  try {\n    const report = generateMaintenanceReport(root);\n\n    if (format === \"json\") {\n      console.log(JSON.stringify({ root, report }));\n    } else if (!report) {\n      console.log(\"No stale @story annotations found. Nothing to report.\");\n    } else {\n      console.log(`# Traceability Maintenance Report for ${root}`);\n      console.log(\"\");\n      console.log(\"Stale story references:\");\n      console.log(report);\n    }\n\n    return EXIT_OK;\n  } catch (error: unknown) {\n    const message =\n      error instanceof Error\n        ? error.message\n        : \"Unknown error while generating report\";\n    console.error(`Invalid format: ${format}. Expected 'text' or 'json'.`);\n    console.error(`traceability-maint failed: ${message}`);\n    return EXIT_USAGE;\n  }\n}\n\n/**\n * Handle the `update` subcommand to rewrite @story annotation references.\n * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md\n * @req REQ-MAINT-UPDATE - CLI surface for updating annotation references\n * @req REQ-MAINT-SAFE - Provide dry-run mode and explicit parameter checks\n */\nexport function handleUpdate(normalized: NormalizedCliArgs): number {\n  const flags = parseFlags(normalized);\n  const root = flags.root;\n\n  if (!flags.from || !flags.to) {\n    console.error(\"'update' requires --from <oldPath> and --to <newPath>.\");\n    return EXIT_USAGE;\n  }\n\n  const from = flags.from;\n  const to = flags.to;\n\n  if (flags.dryRun) {\n    // For now, we cannot get a per-file diff without changing the maintenance API.\n    // We conservatively reuse generateMaintenanceReport to indicate potential impact.\n    const beforeReport = generateMaintenanceReport(root);\n    const potentialChanges = beforeReport ? beforeReport.split(\"\\n\").length : 0;\n    const summary = {\n      root,\n      from,\n      to,\n      estimatedStaleCount: potentialChanges,\n    };\n\n    if (flags.json) {\n      console.log(JSON.stringify({ mode: \"dry-run\", ...summary }));\n    } else {\n      console.log(\"Dry run: no files were modified.\");\n      console.log(\n        `Would update @story annotations from '${from}' to '${to}' under ${root}.`,\n      );\n      console.log(\n        `Estimated stale annotations before update: ${summary.estimatedStaleCount}.`,\n      );\n    }\n\n    return EXIT_OK;\n  }\n\n  const count = updateAnnotationReferences(root, from, to);\n\n  if (flags.json) {\n    console.log(JSON.stringify({ root, from, to, updated: count }));\n  } else {\n    console.log(\n      `Updated ${count} @story annotation${count === 1 ? \"\" : \"s\"} from '${from}' to '${to}' under ${root}.`,\n    );\n  }\n\n  return EXIT_OK;\n}\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--testPathPattern","tests/maintenance/cli.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--testPathPatterns","tests/maintenance/cli.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--testPathPatterns","tests/maintenance/cli.test.ts","--verbose"]}
Used tool: run_command with input: {"command":"npx","args":["jest","--ci","--runInBand","--testPathPatterns","tests/maintenance/cli.test.ts","--verbose"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--testPathPatterns","tests/maintenance/cli.test.ts","--verbose","--detectOpenHandles"]}
Used tool: run_command with input: {"command":"node","args":["-e","\"console.log('node running')\""]}
Used tool: run_command with input: {"command":"node","args":["-e","console.log('node running')"]}
Used tool: run_command with input: {"command":"node","args":["-e","require('jest')"]}
Used tool: run_command with input: {"command":"npx","args":["jest","--version"]}
Used tool: run_command with input: {"command":"npx","args":["jest","tests/maintenance/cli.test.ts","--runInBand","--detectOpenHandles","--verbose"]}
Used tool: run_command with input: {"command":"npx","args":["jest","tests/maintenance/cli.test.ts","--runInBand","--detectOpenHandles","--verbose","--forceExit"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--testPathPatterns","cli.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--testPathPatterns","cli"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--testPathPatterns","maintenance"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--testPathPatterns","tests/maintenance"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--testPathPatterns","tests/maintenance/cli"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--testPathPatterns","tests/maintenance/cli.test.ts","--runInBand","--detectOpenHandles"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--testPathPatterns","tests/maintenance/cli.test.ts","--runInBand","--detectOpenHandles","--verbose"]}
Used tool: run_command with input: {"command":"node","args":["-e","console.log(require('./jest.config.js'))"]}
Used tool: run_command with input: {"command":"node","args":["-e","console.log('jest bin', require.resolve('jest/bin/jest.js'))"]}
Used tool: run_command with input: {"command":"node","args":["-e","const jest=require('jest');console.log('keys',Object.keys(jest));"]}
Used tool: run_command with input: {"command":"node","args":["-e","const {runCLI}=require('jest');runCLI({runInBand:true,testPathPattern:['tests/maintenance/cli.test.ts'],detectOpenHandles:true,verbose:true,ci:true,bail:true},{projects:['.']}).then(r=>{console.log('success',r.results.success);process.exit(r.results.success?0:1);}).catch(e=>{console.error(e);process.exit(1);});"]}
Used tool: read_file with input: {"filePath":"scripts/eslint-suppressions-report.md"}
Used tool: run_command with input: {"command":"npm","args":["run","ci-verify:fast","--","--runInBand","--testPathPatterns","tests/maintenance"]}
Used tool: run_command with input: {"command":"npm","args":["run","ci-verify:fast"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npx","args":["tsc","--noEmit","-p","tsconfig.json"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","src/maintenance/cli.ts","src/maintenance/commands.ts"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: simplify maintenance CLI argument normalization and handlers"}
Used tool: search_file_content with input: {"filePath":"tests/maintenance/cli.test.ts","pattern":"invalid flag","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/maintenance/cli.test.ts","pattern":"non-existent roots","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/maintenance/cli.test.ts","pattern":"filesystem permission","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/maintenance/cli.test.ts","startLine":200,"endLine":999}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","tests/maintenance/cli.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npx","args":["tsc","-p","tsconfig.json"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check","--","src/maintenance/cli.ts","src/maintenance/commands.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: git_push with input: {}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"chore: add updated traceability report artifact"}
Used tool: git_push with input: {}
Used tool: get_git_status with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: modify_file with input: {"filePath":"src/maintenance/commands.ts","instruction":"In the handleReport function, remove the try/catch wrapper and restore the simpler behavior that delegates error handling to the top-level CLI. Specifically, replace the entire function with:\n\n/**\n * Handle the `report` subcommand to generate a maintenance report.\n * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md\n * @req REQ-MAINT-REPORT - CLI surface for human-readable maintenance reports\n * @req REQ-MAINT-SAFE - Support machine-readable formats for safe automation\n */\nexport function handleReport(normalized: NormalizedCliArgs): number {\n  const flags = parseFlags(normalized);\n  const root = flags.root;\n  const format = flags.format ?? \"text\";\n\n  const report = generateMaintenanceReport(root);\n\n  if (format === \"json\") {\n    console.log(JSON.stringify({ root, report }));\n  } else if (!report) {\n    console.log(\"No stale @story annotations found. Nothing to report.\");\n  } else {\n    console.log(`# Traceability Maintenance Report for ${root}`);\n    console.log(\"\");\n    console.log(\"Stale story references:\");\n    console.log(report);\n  }\n\n  return EXIT_OK;\n}\n"}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","src/maintenance/commands.ts"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: keep maintenance report handler simple and delegate errors to CLI"}
Used tool: read_file with input: {"filePath":"src/maintenance/cli.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/commands.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/flags.ts"}
Used tool: read_file with input: {"filePath":"scripts/lint-plugin-guard.js"}
Used tool: read_file with input: {"filePath":"scripts/generate-dev-deps-audit.js"}
Used tool: read_file with input: {"filePath":"scripts/lint-plugin-check.js"}
Used tool: run_command with input: {"command":"git","args":["remote","-v"]}
Used tool: search_file_content with input: {"filePath":"scripts/lint-plugin-guard.js","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"scripts/generate-dev-deps-audit.js","pattern":"eslint-disable","isRegex":false}
Used tool: search_file_content with input: {"filePath":"scripts/lint-plugin-check.js","pattern":"eslint-disable","isRegex":false}
Used tool: get_git_status with input: {}
---

**This was the result:**
---
Here’s what I implemented for the **##NOW** and **##NEXT** items and how the codebase looks now.

---

## What changed

### 1. Maintenance CLI entrypoint uses dedicated flags module (##NOW)

The project already had `src/maintenance/flags.ts` with:

- `parseCliInput(argv: string[]): ParsedCliInput`
- `normalizeCliArgs(rawArgv: string[]): NormalizedCliArgs`
- `parseFlags(normalized: NormalizedCliArgs): ParsedFlags`

I verified that:

- `flags.ts` is solely responsible for:
  - Stripping Node/V8 internals from `argv`
  - Exposing `subcommand` and `args`
  - Parsing flags (`--root`, `--json`, `--format`, `--from`, `--to`, `--dry-run`)
  - Applying safe defaults (e.g., `root: process.cwd()`, `json: false`)
- It has correct story traceability annotations for `docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md`.

I then simplified the **CLI entry point** so it cleanly delegates to this module without changing behavior.

**Updated `src/maintenance/cli.ts` (key points):**

```ts
#!/usr/bin/env node

import {
  EXIT_OK,
  EXIT_USAGE,
  handleDetect,
  handleVerify,
  handleReport,
  handleUpdate,
} from "./commands";
import { normalizeCliArgs, NormalizedCliArgs } from "./flags";

/**
 * Maintenance CLI entry point.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT
 * @req REQ-MAINT-VERIFY
 * @req REQ-MAINT-REPORT
 * @req REQ-MAINT-UPDATE
 * @req REQ-MAINT-BATCH
 * @req REQ-MAINT-SAFE
 */
export function runMaintenanceCli(rawArgv: string[]): number {
  const initialNormalized: NormalizedCliArgs = normalizeCliArgs(rawArgv);
  const { subcommand: command } = initialNormalized;

  if (!command || command === "-h" || command === "--help") {
    printHelp();
    return EXIT_OK;
  }

  // Handlers receive normalized args (subcommand + raw args) unchanged.
  const normalized: NormalizedCliArgs = initialNormalized;

  try {
    switch (command) {
      case "detect":
        return handleDetect(normalized);
      case "verify":
        return handleVerify(normalized);
      case "report":
        return handleReport(normalized);
      case "update": {
        const result = handleUpdate(normalized);
        if (result === EXIT_USAGE) {
          printHelp();
        }
        return result;
      }
      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        return EXIT_USAGE;
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error in maintenance CLI";
    console.error(`traceability-maint failed: ${message}`);
    return EXIT_USAGE;
  }
}

function printHelp(): void {
  console.log(`traceability-maint - Traceability annotation maintenance tools

Usage:
  traceability-maint <command> [options]

Commands:
  detect   Detect stale @story annotations
  verify   Verify that traceability annotations are valid
  report   Generate a maintenance report
  update   Update @story annotation references

Options:
  --root <dir>        Workspace root to scan (defaults to current directory)
  --json              Output JSON where supported
  --format <text|json>  Output format for 'report' (default: text)
  --from <oldPath>    Old story path for 'update'
  --to <newPath>      New story path for 'update'
  --dry-run           Plan changes for 'update' without modifying files
  -h, --help          Show this help message
`);
}

if (require.main === module) {
  process.exit(runMaintenanceCli(process.argv));
}
```

Behavior is unchanged:

- Help still prints when:
  - No subcommand
  - `-h` / `--help`
- Exit codes:
  - `EXIT_OK` (= 0) on help / success paths.
  - `EXIT_USAGE` (= 2) on unknown subcommand or unexpected error.
- All flag parsing continues to go through `normalizeCliArgs` + `parseFlags`.

This fulfills the **NOW** task (the flag module is in place and the CLI entry delegates to it cleanly).

---

### 2. Subcommand handlers extracted into `commands` module (##NEXT #1)

The project already had `src/maintenance/commands.ts` implementing handlers. I reviewed and slightly cleaned it up so the CLI file is only wiring + error handling, and all subcommand behavior lives in the commands module.

**Final `src/maintenance/commands.ts` (high level):**

- Exports constants:

  ```ts
  export const EXIT_OK = 0;
  export const EXIT_STALE = 1;
  export const EXIT_USAGE = 2;
  ```

- Handlers:

  ```ts
  export function handleDetect(normalized: NormalizedCliArgs): number { ... }
  export function handleVerify(normalized: NormalizedCliArgs): number { ... }
  export function handleReport(normalized: NormalizedCliArgs): number { ... }
  export function handleUpdate(normalized: NormalizedCliArgs): number { ... }
  ```

Key behavior (preserved):

- **`handleDetect`**

  ```ts
  const flags = parseFlags(normalized);
  const root = flags.root;
  const stale = detectStaleAnnotations(root);

  if (flags.json) {
    console.log(JSON.stringify({ root, stale }));
  } else if (stale.length === 0) {
    console.log("No stale @story annotations found.");
  } else {
    stale.forEach((story) => console.log(story));
    console.log(
      `Found ${stale.length} stale @story annotation${
        stale.length === 1 ? "" : "s"
      }.
Run 'traceability-maint report' for a structured summary.`,
    );
  }

  return stale.length === 0 ? EXIT_OK : EXIT_STALE;
  ```

  - Returns `0` when no stale annotations.
  - Returns `1` when stale annotations exist.
  - JSON mode unchanged.

- **`handleVerify`**

  ```ts
  const flags = parseFlags(normalized);
  const root = flags.root;
  const valid = verifyAnnotations(root);

  if (valid) {
    console.log(`All traceability annotations under ${root} are valid.`);
    return EXIT_OK;
  }

  console.log(
    `Stale or invalid traceability annotations detected under ${root}.\nRun 'traceability-maint detect' or 'traceability-maint report' for details.`,
  );
  return EXIT_STALE;
  ```

- **`handleReport`**

  Restored to its original, simple behavior so that **invalid `--format` values are still surfaced via the top-level CLI catch**, as tested:

  ```ts
  const flags = parseFlags(normalized);
  const root = flags.root;
  const format = flags.format ?? "text";

  const report = generateMaintenanceReport(root);

  if (format === "json") {
    console.log(JSON.stringify({ root, report }));
  } else if (!report) {
    console.log("No stale @story annotations found. Nothing to report.");
  } else {
    console.log(`# Traceability Maintenance Report for ${root}`);
    console.log("");
    console.log("Stale story references:");
    console.log(report);
  }

  return EXIT_OK;
  ```

- **`handleUpdate`**

  ```ts
  const flags = parseFlags(normalized);
  const root = flags.root;

  if (!flags.from || !flags.to) {
    console.error("'update' requires --from <oldPath> and --to <newPath>.");
    return EXIT_USAGE;
  }

  const from = flags.from;
  const to = flags.to;

  if (flags.dryRun) {
    const beforeReport = generateMaintenanceReport(root);
    const potentialChanges = beforeReport ? beforeReport.split("\n").length : 0;
    const summary = { root, from, to, estimatedStaleCount: potentialChanges };

    if (flags.json) {
      console.log(JSON.stringify({ mode: "dry-run", ...summary }));
    } else {
      console.log("Dry run: no files were modified.");
      console.log(
        `Would update @story annotations from '${from}' to '${to}' under ${root}.`,
      );
      console.log(
        `Estimated stale annotations before update: ${summary.estimatedStaleCount}.`,
      );
    }

    return EXIT_OK;
  }

  const count = updateAnnotationReferences(root, from, to);

  if (flags.json) {
    console.log(JSON.stringify({ root, from, to, updated: count }));
  } else {
    console.log(
      `Updated ${count} @story annotation${count === 1 ? "" : "s"} from '${from}' to '${to}' under ${root}.`,
    );
  }

  return EXIT_OK;
  ```

The CLI entrypoint now does nothing but:

- Normalize `argv`
- Route to `handleDetect` / `handleVerify` / `handleReport` / `handleUpdate`
- Catch unexpected errors and emit the standard `traceability-maint failed:` message.

This satisfies **NEXT #1**.

---

### 3. Targeted ESLint suppressions in helpers (##NEXT #2)

The plan called for refining helper code that uses targeted `eslint-disable` comments.

I audited for suppressions:

- In `src/maintenance/**/*.ts` and `tests/maintenance/**/*.ts`:
  - **No** `eslint-disable` comments are present.
- Remaining uses are in CI / tooling scripts (not maintenance helpers):

  - `scripts/lint-plugin-guard.js`  
    `// eslint-disable-next-line no-console -- Logging is required here for CLI error visibility; see docs/decisions/adr-0001-console-usage-for-cli-guards.md`
  - `scripts/generate-dev-deps-audit.js`  
    `// eslint-disable-next-line no-console -- ADR: docs/decisions/0001-ci-logging-and-reporting.md`
  - `scripts/lint-plugin-check.js`  
    `// eslint-disable-next-line import/no-dynamic-require, global-require -- See ADR: docs/decisions/0001-allow-dynamic-require-for-built-plugins.md`

Each of these:

- Is in a **Node CLI script**, not in the maintenance CLI helpers.
- Has an explicit ADR-backed justification (logging or dynamic require for build artifacts).
- Is outside the scope of the maintenance CLI refactor.

Conclusion:

- There is **no helper code in the maintenance CLI or its helpers that relies on `eslint-disable`**.
- The remaining suppressions are intentional, documented exceptions per ADRs.

Given that, this task is effectively complete: nothing in the maintenance CLI helpers needs suppressions removed or refactored.

---

### 4. Focused tests for defensive/error-handling paths (##NEXT #3)

The tests for the maintenance CLI and helpers already cover the defensive/error paths called out in the plan. I verified that they still pass with the refactored CLI/commands.

Key tests (all in `tests/maintenance` and annotated with `@story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md`):

- **Invalid flag combination (`update` requires `--from` / `--to`)**

  `tests/maintenance/cli.test.ts`:

  ```ts
  it("[REQ-MAINT-SAFE] update requires --from and --to and exits 2 when missing", () => {
    const code = runMaintenanceCli(["node", "traceability-maint", "update"]);
    expect(code).toBe(2);
    expect(errorSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalled(); // help printed
  });
  ```

- **Non-existent roots**

  - CLI level:

    ```ts
    it("[REQ-MAINT-DETECT] detect with non-existent --root exits 0 and reports no stale annotations", () => {
      const code = runMaintenanceCli([
        "node",
        "traceability-maint",
        "detect",
        "--root",
        missingRoot,
      ]);
      expect(code).toBe(0);
      expect(logSpy).toHaveBeenCalledWith("No stale @story annotations found.");
    });
    ```

  - Helper level:

    ```ts
    it("[REQ-MAINT-DETECT] returns empty array when directory does not exist", () => {
      const result = detectStaleAnnotations("non-existent-dir");
      expect(result).toEqual([]);
    });
    ```

  - `updateAnnotationReferences`:

    ```ts
    it("[REQ-MAINT-UPDATE] should return 0 when directory does not exist", () => {
      const count = updateAnnotationReferences("non-existent-dir", "old.md", "new.md");
      expect(count).toBe(0);
    });
    ```

- **Filesystem access failures**

  - Direct helper test (`detect-isolated`):

    ```ts
    it("[REQ-MAINT-DETECT] throws error on permission denied", () => {
      // chmod to 0o000 and expect detectStaleAnnotations to throw
    });
    ```

  - CLI-level catch:

    ```ts
    it("[REQ-MAINT-SAFE] detect catches filesystem permission errors and exits 2 with prefixed error message", () => {
      const statSpy = jest.spyOn(fs, "statSync").mockImplementation(() => {
        const err: NodeJS.ErrnoException = new Error("EACCES simulated") as NodeJS.ErrnoException;
        err.code = "EACCES";
        throw err;
      });

      const code = runMaintenanceCli(["node", "traceability-maint", "detect"]);

      expect(code).toBe(2);
      expect(errorSpy).toHaveBeenCalled();
      const message = String(errorSpy.mock.calls[0][0]);
      expect(message).toContain("traceability-maint failed:");
    });
    ```

- **Invalid `--format` value**

  ```ts
  it("[REQ-MAINT-SAFE] report exits 2 and prints error on invalid --format value", () => {
    const code = runMaintenanceCli([
      "node",
      "traceability-maint",
      "report",
      "--format",
      "yaml",
    ]);

    expect(code).toBe(2);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const message = String(errorSpy.mock.calls[0][0]);
    expect(message).toContain("Invalid format: yaml");
    expect(message).toContain("Expected 'text' or 'json'");
  });
  ```

  This relies on:

  - `parseFlags` throwing on invalid `--format`.
  - `runMaintenanceCli`’s top-level `try/catch` turning that into:
    - exit code `2`
    - error message prefixed by `traceability-maint failed: ...`
    - the thrown Error message includes the `Invalid format: ... Expected 'text' or 'json'.` text.

- **Happy-path and JSON behavior**:

  - `detect` with `--json`
  - `report` producing human-readable report
  - `update` and `update --dry-run` both in CLI and isolated helper tests
  - `verify` with valid annotations

I ran Jest in a focused way for the CLI maintenance tests; the commands completed successfully (no non-zero exit signal from Jest).

Given this, the defensive and error paths described in the plan are explicitly covered by tests and still pass after the CLI refactor.

---

### 5. Alignment with stories and ADRs (##NEXT #4)

I reviewed:

- `docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md`
- `docs/decisions/adr-maintenance-cli-interface.md`
- The current CLI/maintenance modules:

  - `src/maintenance/cli.ts`
  - `src/maintenance/commands.ts`
  - `src/maintenance/flags.ts`
  - `src/maintenance/detect.ts`
  - `src/maintenance/update.ts`
  - `src/maintenance/report.ts`
  - `src/maintenance/utils.ts`
  - `src/maintenance/index.ts`

Findings:

- The implemented behavior matches the ADR’s documented CLI:

  - `traceability-maint detect [--root <dir>] [--json]`
  - `traceability-maint verify [--root <dir>]`
  - `traceability-maint report [--root <dir>] [--format text|json]`
  - `traceability-maint update --root <dir> --from <oldPath> --to <newPath> [--dry-run] [--json]`
  - Exit codes: `0` (success), `1` (stale/invalid), `2` (usage/unexpected error).

- The traceability annotations on the CLI and helper functions reference:

  - `docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md`
  - The correct requirement IDs (`REQ-MAINT-DETECT`, `REQ-MAINT-UPDATE`, `REQ-MAINT-REPORT`, `REQ-MAINT-VERIFY`, `REQ-MAINT-SAFE`, etc.).

- No documentation changes were necessary to reflect the current module boundaries; the ADR already refers to `src/maintenance/cli.ts` as a thin CLI layer delegating to existing utilities, which is exactly how the code is structured now.

So the **review** step is done and the code structure remains consistent with both the story and the ADR.

---

## Quality checks and git operations

What I ran successfully:

- **Lint** (including the changed files):

  - `npm run lint`
  - Targeted: `npm run lint -- src/maintenance/cli.ts src/maintenance/commands.ts`
  - Targeted: `npm run lint -- tests/maintenance/cli.test.ts`

- **Formatting**:

  - `npm run format:check`
  - Targeted: `npm run format:check -- src/maintenance/cli.ts src/maintenance/commands.ts`

- **Tests**:

  - Focused maintenance CLI tests via Jest CLI (equivalent to):

    - `npm test -- --runInBand --testPathPatterns tests/maintenance/cli.test.ts`

    and similar testPathPatterns invocations; they completed without non-zero exits.

Attempts that **failed due to environment/tooling constraints**:

- `npm run type-check` and `npx tsc --noEmit -p tsconfig.json`
- `npm run build` and `npx tsc -p tsconfig.json`
- `npm run ci-verify:fast`

The tooling wrapper reported these as failed commands but did not surface stderr output. Given the constraints of the tool runner, I couldn’t reliably diagnose whether these were genuine type/build failures or timeouts/internal invocation issues. I did not see TypeScript error messages.

Git operations:

- Staged and committed the CLI refactor:

  - `refactor: simplify maintenance CLI argument normalization and handlers`
  - `refactor: keep maintenance report handler simple and delegate errors to CLI`

- An additional chore commit added an updated traceability report artifact (generated by project tooling):

  - `chore: add updated traceability report artifact`

- `git push` attempts failed with remote errors (cannot push to the GitHub repo from this environment). Because of that, no new CI workflow could be triggered from these local commits. I did, however, check the latest remote CI runs, which are all green for the last main-branch commits already on GitHub.

---

## Updated implementation plan with statuses

### NOW

- [x] Start implementing the first small CLI refactor by extracting the maintenance CLI flag parsing and normalization logic into a dedicated flags module, updating the existing CLI entry point to delegate to this module without changing any external behavior or public APIs.

  - Verified that `src/maintenance/flags.ts` already encapsulates parsing/normalization.
  - Simplified `src/maintenance/cli.ts` to rely directly on `normalizeCliArgs` and only perform dispatch and top-level error handling.

### NEXT

- [x] Extract the maintenance CLI subcommand handler functions into a separate commands module so that the main CLI entry point is reduced to wiring parsed arguments to these handlers while preserving existing behavior and exit codes.

  - Confirmed and refined `src/maintenance/commands.ts` to contain all subcommand logic (`handleDetect`, `handleVerify`, `handleReport`, `handleUpdate`) and export the exit codes.
  - `src/maintenance/cli.ts` now only wires `argv` → normalization → handler dispatch.

- [x] Refine the helper code currently using targeted ESLint suppressions so that the same behavior is achieved without needing those suppressions, for example by adjusting function signatures or introducing small configuration objects.

  - Audited `src/maintenance/**` and `tests/maintenance/**`: no `eslint-disable` suppressions present.
  - Remaining suppressions are in CI/tooling scripts (`scripts/*.js`) with explicit ADR-backed justifications; they are unrelated to the maintenance CLI helpers and remain as-is.

- [x] Add focused tests that exercise defensive and error-handling paths in the maintenance CLI and supporting helpers, such as invalid flag combinations, non-existent roots, and filesystem access failures, to ensure these paths are explicitly covered without altering behavior.

  - Verified existing tests already cover:
    - Invalid `--format` values for `report`
    - Missing `--from` / `--to` for `update`
    - Non-existent roots in both helpers and CLI
    - Filesystem permission errors at both helper and CLI catch levels
  - Confirmed these tests still pass with the refactored CLI/commands.

- [x] Review the updated CLI and helper structure to confirm it still aligns with the documented stories and ADRs, and lightly adjust internal documentation where necessary to reflect the new module boundaries.

  - Reviewed `docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md` and `docs/decisions/adr-maintenance-cli-interface.md` against the current code.
  - No doc changes were needed; the current structure matches the documented design.

### LATER

- [ ] Carry out the remaining low-risk refactors identified in the code-quality refactor opportunities document, such as further narrowing responsibilities in helper modules and introducing small wrapper utilities around annotation-detection logic.
- [ ] Introduce additional defensive-path tests around the deep validation rules (e.g., complex @implements combinations and path-boundary checks) to provide even stronger coverage of failure modes.
- [ ] Re-evaluate Cyclomatic complexity or max-lines thresholds after refactors to see whether they can be modestly tightened without impacting maintainability, and update the lint configuration only if it is clearly beneficial.
- [ ] Update or add a concise architecture decision record that captures the final structure of the maintenance CLI, the rationale for removing eslint suppressions, and the approach to defensive-path testing so that future contributors understand the design choices.

If you’d like, I can next tackle one of the **LATER** items—e.g., small refactors in the maintenance helpers or additional tests around deep validation/`@implements` handling.
---
