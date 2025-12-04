Here is a history-only summary of what has been done so far on the project.

---

## Core Plugin and Rules

- Created the main ESLint plugin entrypoint (`src/index.ts`) that:
  - Exports all rules.
  - Exposes flat-config presets (`recommended`, `strict`).
  - Exposes maintenance utilities via a named `maintenance` export and `plugin.maintenance` on the default export.
- Implemented core rules:
  - `require-story-annotation`
  - `require-req-annotation`
  - `require-branch-annotation`
  - `valid-annotation-format`
  - `valid-story-reference`
  - `valid-req-reference`
  - `prefer-implements-annotation`
- Built TypeScript-friendly `RuleTester` helpers and migrated existing rule tests to use them.
- Added tests for exports, flat-config presets, schemas, error handling, and doc/config alignment.

## Annotation Format & Multi-story Support

- Implemented shared annotation option utilities (`valid-annotation-options`) to:
  - Normalize options.
  - Compile regexes with schemas and defaults.
- Refactored `valid-annotation-format` to:
  - Use shared helpers.
  - Improve diagnostics.
  - Support multiline annotations and custom `@story` / `@req` regexes.
- Implemented multi-story `@implements` parsing/validation (`valid-implements-utils`) and integrated it with:
  - `valid-annotation-format`
  - `valid-req-reference`
- Centralized requirement annotation detection (`reqAnnotationDetection` helpers).
- Added fixtures/tests for multi-story and format validation scenarios.

## Migration to `@implements`

- Implemented `prefer-implements-annotation` as a suggestion rule with conservative autofix for simple `@story` + `@req` → `@implements` migrations.
- Added comprehensive tests for migration behavior and edge cases.
- Documented `@implements` and migration behavior:
  - Rule docs for `prefer-implements-annotation`.
  - User-facing migration guide.
- Updated fixtures and docs to treat `@implements` as the preferred pattern.

## Deep Validation & Path Handling

- Enhanced `valid-req-reference` to:
  - Extract `REQ-...` IDs from story files.
  - Validate `@req` and `@implements` IDs against story content.
  - Enforce path safety and scoped story references.
- Implemented `valid-story-reference` and utilities to:
  - Resolve and validate story paths.
  - Enforce project boundaries and secure path handling.
  - Support `storyDirectories`, `allowAbsolutePaths`, and `requireStoryExtension`.
- Added extensive tests for IDs, multi-story handling, and path security.

## Error Reporting & Autofix

- Standardized error messages across rules and added message-content tests.
- Implemented autofixes for:
  - Missing `@story` annotations.
  - Incorrect `.story.md` suffixes.
  - Simple `@story` + `@req` → `@implements` migrations.
- Added dedicated autofix test coverage.

## Maintenance CLI & Programmatic API

- Designed the `traceability-maint` CLI with `detect`, `verify`, `report`, `update` subcommands and documented via ADRs.
- Implemented CLI wiring and argument parsing (`src/maintenance/cli.ts`).
- Implemented maintenance modules:
  - `detectStaleAnnotations`
  - `updateAnnotationReferences`
  - `batchUpdateAnnotations`
  - `verifyAnnotations`
  - `generateMaintenanceReport`
- Exposed maintenance utilities via:
  - Named `maintenance` export.
  - `traceability.maintenance` on the default export.
- Wired the CLI binary in `package.json`.
- Added tests under `tests/maintenance/**` for:
  - Outputs and dry-run behavior.
  - Exit codes and error handling.
  - Defensive filesystem behavior.

### Maintenance CLI Refactors & JSDoc

- Centralized flag parsing in `src/maintenance/flags.ts`:
  - Types: `ParsedCliInput`, `NormalizedCliArgs`, `ParsedFlags`.
  - Helpers: `normalizeCliArgs`, `parseFlags`, `createDefaultFlags`, `applyFlag`.
  - Strong validation for `--format`.
- Rewrote `src/maintenance/cli.ts` to:
  - Normalize `argv`.
  - Show help on no subcommand or `-h/--help`.
  - Route subcommands with robust error handling and `EXIT_USAGE`.
- Refined `src/maintenance/commands.ts`:
  - Defined `EXIT_OK`, `EXIT_STALE`, `EXIT_USAGE`.
  - Implemented `handleDetect/Verify/Report/Update` around `NormalizedCliArgs` and `parseFlags`.
- Extended CLI tests for invalid formats, help behavior, missing flags/roots, and FS permission errors.
- Added branch-level traceability comments in maintenance files.
- Updated JSDoc for maintenance functions to match actual return types/behavior.

## Linting, Refactors & Code Quality

- Added an ADR and enabled ESLint security rules (e.g., `no-eval`, `no-implied-eval`).
- Enforced `max-lines-per-function = 55` in production code and refactored maintenance modules, helpers, and rules accordingly.
- Updated `eslint.config.js` to ignore underscore-prefixed names for `no-unused-vars`.
- Removed ad-hoc `eslint-disable` comments via structural refactors.
- Maintained zero lint warnings.

## Test Duplication & Shared Helpers

- Used `jscpd` to identify test duplication.
- Refactored `annotation-checker.test.ts` into a shared helper `runAnnotationCheckerTests(...)`.
- Updated `require-req-annotation.test.ts` and `require-story-annotation.test.ts` to use shared TS `RuleTester` options.
- Re-ran duplication checks and confirmed:
  - No clones between refactored files.
  - ~1.16% overall duplication.
- Ensured shared test utilities are type-safe without inline suppressions.

## CI, Quality Gates & Git Hooks

- Consolidated quality checks into `npm run ci-verify:full` (build, tests, lint, type-check, format, duplication, traceability).
- Main GitHub Actions workflow:
  - Runs on pushes/PRs to `main` and on schedule.
  - Uses Node 20 for release jobs and runs release smoke tests.
- Upgraded Husky to v9:
  - `pre-commit`: `npx lint-staged`.
  - `pre-push`: `npm run ci-verify:full`.
- Kept workflow, ADRs, and runtime docs aligned.

## Semantic-release, Runtime & Security Incidents

- Investigated OTP-related `semantic-release` issues so failed OTP skips release instead of failing the pipeline.
- Raised Node engine to `>=18.18.0`, aligned ESLint 9 and CI Node versions.
- Analyzed dev-only dependency issues around `glob`, `brace-expansion`, and bundled `npm` in the `semantic-release` toolchain.
- Classified bundled `npm` as a controlled known error with compensating controls (later resolved; see below).
- Authored/updated security incident docs, including the semantic-release bundled `npm` incident.
- Documented job isolation and least-privilege practices in CI.

## Secret Scanning & Dependency Safety

- Integrated Secretlint into CI via `npm run security:secrets`.
- Added `dry-aged-deps` maturity checks:
  - `npm run deps:maturity` with optional JSON output.
  - `scripts/ci-safety-deps.js` to generate `ci/dry-aged-deps.json` without failing CI.
- Ran `deps:maturity` and `npm audit`, documented:
  - No high-severity production dependency vulnerabilities.
  - Dev dependencies under explicit policy.
- Updated dependency-health and incident docs to reflect results.
- Clarified that `dry-aged-deps` is advisory and feeds into incident/risk documentation.

## CI/CD Pipeline & Contributor Docs

- Authored `docs/ci-cd-pipeline.md` describing:
  - Workflow triggers, jobs, quality checks, secret scanning, artifacts, and `semantic-release` behavior.
- Updated `CONTRIBUTING.md` to document:
  - `ci-verify:fast` vs `ci-verify:full`.
  - Local vs CI security checks.
  - Gating vs advisory checks.
- Ensured runtime and peer-dependency docs match `package.json` and CI config.

## Functionality Coverage & Story Alignment

- Reviewed stories 001.0–010.3 and mapped them to rules, maintenance functions, and tests.
- Created `docs/functionality-coverage-2025-12-03.md` summarizing coverage and evidence per story.
- Re-ran core commands (`npm test`, `npm run lint`, `npm run type-check`, `npm run build`, `npm run format:check`, `npm run duplication`) and confirmed CI success.

## Dependency Maturity & Documentation (2025-12-03)

- Reviewed `dry-aged-deps` configuration (7-day minimum age; severity `none` for prod/dev).
- Verified `npm run safety:deps` writes `ci/dry-aged-deps.json`.
- Ran maturity checks (including JSON output) and confirmed no policy-allowed updates.
- Updated dependency-health and security-incident rationale docs.
- Re-validated build, tests, lint, formatting; CI succeeded.

## Dev-only Audit & Documentation Work

- Reviewed dev-audit tooling ADRs and related stories.
- Updated dev-only audit script to:
  - Run `npm audit --include=dev --audit-level=high --json`.
  - Write `ci/npm-audit.json` and always exit 0.
- Ran the script and reviewed JSON output.
- Updated dependency-health docs to:
  - Clarify `npm run audit:dev-high` behavior and outputs.
  - Explain gating vs advisory checks.
- Updated user-facing docs:
  - `README.md` with ESLint 9 flat-config ESM example using `traceability.configs.recommended`.
  - `user-docs/api-reference.md` to:
    - Note `valid-annotation-format` default severity is `warn`.
    - Introduce `@implements` and link to migration/rule docs.
- Clarified in CI docs that Secretlint runs only in CI on Node 20.x.
- Added `docs/code-quality-refactor-opportunities-2025-12-03.md` for future refactors.
- Ran `npm run ci-verify:full`; CI/CD passed.

## Documentation & Packaging Updates (Earlier Round)

- Updated `README.md` to turn inline paths into Markdown links targeting shipped files or GitHub URLs.
- Fixed relative links in `user-docs/api-reference.md` and `user-docs/migration-guide.md`.
- Updated `CHANGELOG.md` with clickable links to user docs and API refs.
- Updated `package.json` `"files"` to ship `user-docs`, `docs`, and `CHANGELOG.md`.
- Rewrote `.npmignore` to:
  - Include docs and `CHANGELOG.md`.
  - Exclude dev/CI artifacts and tests.
  - Explicitly include `lib/`.
- Verified README and user-doc links in the npm package layout.
- Re-ran full verification (format, lint, tests, type-check, build, duplication, traceability, audit, safety); success.

## Security & Dependency Documentation Clarifications

- Refined user-facing and internal docs on security and dependency processes:
  - Reworked “Security and Dependency Health” in `README.md`.
  - Noted CI-enforced guarantees in `user-docs/api-reference.md`.
  - Updated `user-docs/migration-guide.md` with high-level security/dependency notes.
  - Clarified advisory nature and incident linkage in `docs/dependency-health.md`.
  - Updated `CONTRIBUTING.md` to show `ci-verify:full` as mirroring main CI security checks.
- Ran build, tests, lint, type-check, format; CI success.

## Documentation & Versioning Alignment

- Scanned for stale version references.
- Updated `user-docs/api-reference.md`, `eslint-9-setup-guide.md`, `examples.md`, `migration-guide.md` to:
  - Refer consistently to the 1.x series.
  - Point to GitHub Releases as the version source.
- Updated `README` to:
  - Convert non-published paths into inline code.
  - Add a “Versioning and Releases” bullet explaining `semantic-release` and linking to GitHub Releases.
- Ran targeted tests, lint, type-check, format; CI success.

## Accepting `@implements` in Require Rules

- Updated `require-story-annotation` helpers so:
  - `commentContainsStory`, `scanLinesForMarker`, and `fallbackTextBeforeHasStory` treat both `@story` and `@implements` as satisfying story presence.
- Updated `reqAnnotationDetection` so:
  - `commentContainsReq`, `linesBeforeHasReq`, `fallbackTextBeforeHasReq`, and `hasReqAnnotation` treat both `@req` and `@implements` as satisfying requirement presence.
- Left autofix behavior unchanged (still inserts `@story` / `@req`).
- Updated tests (`require-story-annotation.test.ts`, `require-req-annotation.test.ts`) to add valid `@implements`-only cases.
- Ran targeted tests and `npm run ci-verify:full`; all passed.

### Docs for `@implements` Presence

- Updated rule docs for `require-story-annotation` and `require-req-annotation` to state that:
  - `@implements story-path REQ-ID...` satisfies presence checks.
  - Deep validation belongs to `valid-story-reference` and `valid-req-reference`.
  - Added “Correct” examples using only `@implements`.
- Updated `user-docs/api-reference.md` to note:
  - Multi-story `@implements` counts for both presence rules.
  - Autofix still inserts `@story`.
  - Deep validation is in other rules.
- Updated ADRs to confirm this behavior.
- Ran `npm run ci-verify:full`; CI success.

## Dependency & Documentation Work Before Flat-config Changes

- Reviewed `package.json` dependencies and ran:
  - `npm run deps:maturity -- --format=json`
  - `npx dry-aged-deps --format=xml`
- Upgraded `lint-staged` (16.2.6 → 16.2.7) as a safe devDependency update.
- Re-ran dependency health and audit checks:
  - Confirmed no remaining safe updates under policy.
  - Confirmed 0 high-level production vulnerabilities.
  - Captured dev-only issues in `ci/npm-audit.json`.
- Ran `npm run ci-verify:full`; all checks passed.
- Updated dependency-health docs with new status and upgrade details.
- Pushed changes; CI succeeded.

## Flat-config Preset Behavior & Integration

- Reviewed flat-config preset implementation (`src/index.ts`) against docs and stories.
- Identified that `plugins` blocks inside presets caused ESLint 9 flat-config redefinition errors.
- Updated presets so:
  - `createTraceabilityFlatConfig` returns only a `rules` mapping.
  - `configs.recommended` and `configs.strict` are arrays of rule-only config objects.
  - Consumers register the plugin via a separate `plugins` entry.
- Added `FlatESLint` integration tests to:
  - Validate preset behavior in ESLint 9 flat-config arrays.
  - Confirm reliance on a base config that registers the plugin.
- Verified using compiled plugin (`lib/src/index.js`).
- Updated `eslint-9-setup-guide`, `docs/config-presets.md`, `README.md`, and story docs to show correct usage.
- Ran lint, type-check, format, Jest, full CI; all passed.

## Root-level Security Policy

- Audited CI/workflows, incident docs, dependency-health docs, and tooling scripts.
- Added root-level `SECURITY.md` documenting:
  - Vulnerability reporting via GitHub Security Advisories.
  - Supported versions (latest via `semantic-release`).
  - Production dependency guarantees at release.
  - Use of `dry-aged-deps` (7-day age, “no known vulns” thresholds).
  - Dev-only semantic-release/npm toolchain risk and compensating controls (later resolved).
- Updated internal decision/incident docs to reference `SECURITY.md` as canonical.
- Linked `SECURITY.md` from `README.md`.
- Ran `npm run ci-verify:full`; CI success.

## CI/CD Emergency Fix for Semantic-release Node Version

- Diagnosed CI failures in the `Quality and Deploy (20.x)` job for `semantic-release`.
- Determined `semantic-release` 25.x requires Node `^22.14.0 || >= 24.10.0` while the job used 20.19.6.
- Updated `.github/workflows/ci-cd.yml` to:
  - Use Node 22.14.0 specifically for the `semantic-release` step, while keeping other jobs on 18.x/20.x.
- Ran local checks and pushed the workflow change.
- Pipeline (including `semantic-release`) completed successfully.

## Separating User-facing from Internal Docs

### Packaging

- Updated `package.json` `"files"` to stop publishing internal `docs/`, keeping:
  - `lib/`
  - `README.md`
  - `LICENSE`
  - `SECURITY.md`
  - `user-docs/`
  - `CHANGELOG.md`
- Left `.npmignore` unchanged, relying on the `"files"` allowlist.

### README

- Removed Markdown links into `docs/`; replaced with neutral references.
- Pointed configuration text to:
  - Rule docs in `user-docs/`.
  - Shipped `[API Reference](user-docs/api-reference.md)`.
- Replaced internal-dev-guide links with generic references to the repo’s contribution guide.
- Removed “Optional deeper background” links to internal docs.
- Trimmed **Documentation Links** to shipped user docs, `CHANGELOG.md`, `SECURITY.md`, and repo URLs.
- Verified any remaining `docs/...` strings appear only as code.

### SECURITY Policy

- Removed Markdown links into `docs/` from `SECURITY.md`; replaced with generic references to internal records/ADRs.

### User Docs

- `user-docs/api-reference.md`:
  - Removed links to `../docs/...` rule docs; replaced with prose references.
  - Kept links to other user-doc files (e.g., migration guide).
- `user-docs/migration-guide.md`:
  - Removed links to `../docs/rules/*.md` and `../docs/stories/*.md`.
  - Used text-only references; kept `docs/stories/...` only in code examples.

### Verification

- Searched `README.md`, `CHANGELOG.md`, `SECURITY.md`, `user-docs/*.md` to confirm:
  - No Markdown links into `docs/`.
  - All links point to shipped files or external URLs.
- Ran `npm run ci-verify`; all passed; pipeline including `semantic-release` succeeded.

## Maintenance API Docs & Cross-links

- Reviewed `package.json`, `README.md`, `SECURITY.md`, `user-docs/api-reference.md`, `user-docs/migration-guide.md`, `src/index.ts`, `src/maintenance/index.ts`, and CLI tests for API alignment.

### Maintenance Import Examples

- Confirmed maintenance functions are exposed only via:
  - Named `maintenance` export.
  - `traceability.maintenance` on the default export.
- Updated `user-docs/api-reference.md` to remove `eslint-plugin-traceability/maintenance` subpath imports and show correct examples with the main package import for both named and default exports.

### Cross-links

- In `user-docs/api-reference.md`, converted references to the migration guide into proper Markdown links.
- Ensured:
  - No remaining imports from `"eslint-plugin-traceability/maintenance"` in user docs.
  - No raw `user-docs/migration-guide.md` text references outside links.
  - No links into `docs/`.

- Ran `npm run format:check`, `npm run lint`, `npm test -- --runInBand --ci`, `npm run type-check`; all passed; CI (including `ci-verify:full` and `semantic-release`) succeeded.

## Prefer-implements Defaults & Security Incident Resolution (Latest Work)

### Prefer-implements Configuration & Tests

- Confirmed `src/index.ts` defines preset severities via `TRACEABILITY_RULE_SEVERITIES` with six core rules, excluding `traceability/prefer-implements-annotation`.
- Verified that `configs.recommended` and `configs.strict` (built from `createTraceabilityFlatConfig`) therefore do not enable `prefer-implements-annotation` by default.

- Updated `tests/rules/prefer-implements-annotation.test.ts` to:
  - Assert the rule is disabled by default in both presets:

    ```ts
    const recommended = (configs as any).recommended;
    const firstConfig = recommended[0];
    const rules = firstConfig.rules || {};
    expect(rules["traceability/prefer-implements-annotation"]).toBeUndefined();

    const strict = (configs as any).strict;
    const strictFirstConfig = strict[0];
    const strictRules = strictFirstConfig.rules || {};
    expect(strictRules["traceability/prefer-implements-annotation"]).toBeUndefined();
    ```

  - Show how to opt in by configuring `"traceability/prefer-implements-annotation": "warn" | "error"` in a flat config.

### User-facing Docs for Opt-in Behavior

- Confirmed `README.md` lists `prefer-implements-annotation` as an opt-in rule, disabled by default in presets.
- Confirmed `user-docs/migration-guide.md` includes an “Optional `prefer-implements-annotation` migration rule” section explaining:
  - It is disabled by default and not in presets.
  - How to enable it with the fully qualified rule key.
- Confirmed `user-docs/api-reference.md`:
  - Describes `prefer-implements-annotation` as an opt-in migration helper.
  - Clarifies it is not part of `recommended`/`strict` and must be configured manually.

### Story Coverage for 010.3

- Updated `docs/functionality-coverage-2025-12-03.md` for story `010.3-DEV-MIGRATE-TO-IMPLEMENTS`:
  - Status now states the story is fully implemented as an opt-in rule with auto-fix, disabled by default in presets, matching configuration requirements.
  - Gaps section now states there are no known functional gaps; future enhancements would be new stories.
- Story file `docs/stories/010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md` already had all DoD items marked complete.

### `ci-safety-deps` Script Refinement

- Refined `scripts/ci-safety-deps.js` so that when `npm run deps:maturity -- --format=json` fails or yields no stdout:
  - Writes a structured JSON error object to `ci/dry-aged-deps.json`:

    ```json
    {
      "status": "error",
      "message": "dry-aged-deps failed",
      "exitCode": <number or null>,
      "stdout": "...",
      "stderr": "..."
    }
    ```

  - Logs a clear console warning.
  - Ensures the output file is non-empty, using a fallback payload if needed.
  - Always exits with code 0 so CI treats this as advisory, but the artifact no longer looks like a successful “0 outdated packages” run when it actually failed.

### Semantic-release Bundled npm Incident Marked Resolved

- Updated `docs/security-incidents/SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md` to:
  - Mark the status as “Resolved (historical incident; dev-only tooling was upgraded)”.
  - Set fixed version to `semantic-release@25.x` with `@semantic-release/npm@13.1.2` and newer.
  - Clarify that earlier “As of 2025-12-03” text describes the pre-upgrade state and now serves as historical context.
  - Note that compensating controls and monitoring described were in place while this was an active known error.
  - Keep a Resolution section stating:
    - Current prod and dev audits both report 0 high-severity vulnerabilities.
    - `dry-aged-deps` shows no outstanding safe updates.
    - The bundled `npm` / `glob` / `brace-expansion` vulnerabilities are no longer present, and this is now a historical record only.

- Updated `docs/dependency-health.md` (Current Status 2025-12-04) to:
  - Keep `dry-aged-deps` and production audit results.
  - Replace text about “remaining high-severity issues limited to dev-only tooling” with:
    - Statement that the previous dev-only release-tooling vulnerabilities have been resolved via upgrade.
    - Note that the prior state is retained solely as a historical incident record.
    - Confirmation that both production and dev audits now report 0 high-severity vulnerabilities and there are no active known-error records for the release tooling.

- Updated `SECURITY.md` section “Dev-Only Release Tooling Risk (semantic-release / npm / glob / brace-expansion)” to:
  - Reframe it as a historical dev-only risk that has been resolved by upgrading the toolchain.
  - Put “What is affected?” into past tense describing the older `@semantic-release/npm@10.0.6` stack.
  - Clarify that guarantees in “What is not affected?” applied during the incident and still apply.
  - Replace “Why is this risk currently accepted?” with a “Historical Risk Acceptance” subsection explaining the prior acceptance and directing readers to the incident record.
  - Adjust “Compensating Controls” to past tense where appropriate, while noting that the same isolation/audit practices still apply to the updated, vulnerability-free toolchain.
  - Remove language implying the vulnerability is still an active risk.

### Quality Checks & CI

- After the above changes, ran:
  - `npm run build`
  - `npm test` (including targeted test files)
  - `npm run lint`
  - `npm run type-check`
  - `npm run format:check`
- Committed changes and pushed.
- Waited for GitHub Actions “CI/CD Pipeline” workflow runs to complete successfully, including `ci-verify:full` and `semantic-release`.

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"tests"}
Used tool: list_directory with input: {"dirPath":"tests/rules"}
Used tool: read_file with input: {"filePath":"tests/utils/annotation-checker.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core-edgecases.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-req-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-branch-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/valid-annotation-format.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-helpers.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/require-story-core-test-helpers.ts"}
Used tool: read_file with input: {"filePath":".voder-jscpd-report/jscpd-report.json"}
Used tool: list_directory with input: {"dirPath":"tests/utils"}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-req-annotation.test.ts","pattern":"languageOptions","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/rules/require-req-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/ts-language-options.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/batch.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/report.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core-edgecases.test.ts"}
Used tool: modify_file with input: {"filePath":"tests/rules/require-branch-annotation.test.ts","instruction":"Insert a new helper function after the RuleTester initialization to centralize construction of missing-annotation error arrays, and then update invalid test cases to use this helper instead of repeated inline errors arrays.\n\n1. After the existing `const ruleTester = new RuleTester({` block and its closing `});`, insert:\n\nconst makeMissingAnnotationErrors = (\n  ...missing: Array<\"@story\" | \"@req\">\n) =>\n  missing.map((item) => ({\n    messageId: \"missingAnnotation\" as const,\n    data: { missing: item },\n  }));\n\n2. In the first invalid test case named \"[REQ-BRANCH-DETECTION] missing annotations on if-statement\", replace the `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n\n3. In the invalid test named \"[REQ-BRANCH-DETECTION] missing @req on for loop when only story present\", replace the existing `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@req\"),\n\n4. In the invalid test named \"[REQ-BRANCH-DETECTION] missing @story on while loop when only req present\", replace its `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\"),\n\n5. In the invalid test named \"[REQ-BRANCH-DETECTION] missing annotations on switch-case\", replace the `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n\n6. In the invalid test named \"[REQ-BRANCH-DETECTION] missing annotations on do-while loop\", replace its `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n\n7. In the invalid test named \"[REQ-BRANCH-DETECTION] missing annotations on for-of loop\", replace its `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n\n8. In the invalid test named \"[REQ-BRANCH-DETECTION] missing annotations on for-in loop\", replace its `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n\n9. In the invalid test named \"[REQ-BRANCH-DETECTION] missing annotations on try-catch blocks\", replace its `errors` array with a concatenation of two calls so that it still produces four errors (two for the try and two for the catch):\n        errors: [\n          ...makeMissingAnnotationErrors(\"@story\", \"@req\"),\n          ...makeMissingAnnotationErrors(\"@story\", \"@req\"),\n        ],\n\n10. In the invalid test named \"[REQ-BRANCH-DETECTION] missing annotations on switch-case with blank line\", replace its `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n\n11. In the invalid test named \"[REQ-CONFIGURABLE-SCOPE] missing annotations on configured branch type ForStatement\", replace its `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n\n12. In the final invalid test immediately following that (the one whose name ends with \"should error schema\"), keep its `errors` array as-is (do not change it)."}
Used tool: modify_file with input: {"filePath":"tests/utils/annotation-checker.test.ts","instruction":"Refactor this file to remove internal duplication in the invalid tests where languageOptions using @typescript-eslint/parser are repeated in multiple entries.\n\n1. Above the existing `const ruleTester = new RuleTester();`, insert a small helper function that wraps a test case with the shared TypeScript language options, but make sure it does not duplicate the existing tsRuleTesterLanguageOptions logic:\n\n- Remove the current `withTsAnnotationCheckerOptions` declaration entirely.\n- Instead, import `withTsLanguageOptions` from \"./ts-language-options\" alongside `tsRuleTesterLanguageOptions`.\n- Replace uses of `withTsAnnotationCheckerOptions` in the `runAnnotationCheckerTests` implementation with `withTsLanguageOptions`.\n\n2. After the change, the imports at the top of the file should be:\n\nimport { RuleTester } from \"eslint\";\nimport { checkReqAnnotation } from \"../../src/utils/annotation-checker\";\nimport {\n  tsRuleTesterLanguageOptions,\n  withTsLanguageOptions,\n} from \"./ts-language-options\";\n\n3. Remove the entire `withTsAnnotationCheckerOptions` function definition, and update the `runAnnotationCheckerTests` implementation so that it maps `valid` and `invalid` through `withTsLanguageOptions` instead of the deleted helper.\n\n4. Keep the rest of the file (including the test rule and describe block) unchanged apart from formatting adjustments that Prettier may apply."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: modify_file with input: {"filePath":"tests/utils/annotation-checker.test.ts","instruction":"Remove the now-unused tsRuleTesterLanguageOptions import from ts-language-options.\n\n1. In the import from \"./ts-language-options\", remove tsRuleTesterLanguageOptions so that only withTsLanguageOptions is imported.\n\n2. Do not change any other code in this file."}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","tests/rules/require-branch-annotation.test.ts","tests/utils/annotation-checker.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: reduce duplication in traceability rule tests"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
Used tool: create_file with input: {"filePath":"tests/utils/temp-dir-helpers.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/batch.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/report.test.ts"}
Used tool: generate_file with input: {"filePath":"tests/utils/temp-dir-helpers.ts","overwrite":true,"content":"/**\n * Shared temp directory helpers for maintenance tests.\n * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md\n * @req REQ-MAINT-TEMP-HELPERS - Provide reusable OS tempdir setup/cleanup utilities for tests\n */\nimport * as fs from \"fs\";\nimport * as os from \"os\";\nimport * as path from \"path\";\n\nexport interface TempDirHandle {\n  /** The absolute path to the created temporary directory. */\n  readonly dir: string;\n  /** Remove the directory recursively; safe to call multiple times. */\n  cleanup(): void;\n}\n\n/**\n * Create a temporary directory under the OS temp root with a common prefix.\n *\n * This helper centralizes the mkdtemp + rmSync pattern that appears in\n * multiple maintenance tests so those tests can focus on behavior instead\n * of filesystem plumbing.\n */\nexport function createTempDir(prefix: string): TempDirHandle {\n  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));\n\n  return {\n    dir,\n    cleanup() {\n      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE\n      fs.rmSync(dir, { recursive: true, force: true });\n    },\n  };\n}\n"}
Used tool: modify_file with input: {"filePath":"tests/maintenance/batch.test.ts","instruction":"Update this test file to use the shared createTempDir helper instead of inlining mkdtempSync/rmSync.\n\n1. Replace the imports from fs, path, and os at the top with only the imports that are still needed:\n- Keep the existing import of `path`.\n- Remove the direct imports of `fs` and `os`.\n- Add an import of `createTempDir` from \"../utils/temp-dir-helpers\".\n\nThe first import block should become:\n\nimport * as path from \"path\";\nimport { createTempDir } from \"../utils/temp-dir-helpers\";\n\n2. In the first describe block (\"batchUpdateAnnotations\"), replace the beforeAll/afterAll that call fs.mkdtempSync and fs.rmSync with usage of createTempDir:\n- Change the `let tmpDir: string;` declaration to:\n  let temp: ReturnType<typeof createTempDir>;\n\n- In beforeAll, replace the body with:\n  temp = createTempDir(\"batch-test-\");\n\n- In afterAll, replace the body with:\n  temp.cleanup();\n\n- In the test body, change `batchUpdateAnnotations(tmpDir, [])` to `batchUpdateAnnotations(temp.dir, [])`.\n\n3. In the second describe block (\"verifyAnnotations\"), perform a similar refactor:\n- Change `let tmpDir: string;` to `let temp: ReturnType<typeof createTempDir>;`.\n- In beforeAll, replace the existing mkdtempSync call with:\n  temp = createTempDir(\"verify-test-\");\n\n- Update the subsequent fs.writeFileSync calls to write into temp.dir instead of tmpDir:\n  path.join(temp.dir, ...)\n\n- In afterAll, replace the rmSync call with `temp.cleanup();`.\n\n- In the test, change `verifyAnnotations(tmpDir)` to `verifyAnnotations(temp.dir)`.\n\n4. Do not change the JSDoc header or assertion logic; only the filesystem setup/teardown code and imports should be updated."}
Used tool: modify_file with input: {"filePath":"tests/maintenance/report.test.ts","instruction":"Update this test file to use the shared createTempDir helper instead of inlining mkdtempSync/rmSync.\n\n1. Replace the imports from fs, path, and os at the top with only the imports that are still needed:\n- Keep the existing import of `path`.\n- Remove the direct imports of `fs` and `os`.\n- Add an import of `createTempDir` from \"../utils/temp-dir-helpers\".\n\nThe first import block should become:\n\nimport * as path from \"path\";\nimport { createTempDir } from \"../utils/temp-dir-helpers\";\nimport { generateMaintenanceReport } from \"../../src/maintenance/report\";\n\n2. In the describe block, change `let tmpDir: string;` to:\n  let temp: ReturnType<typeof createTempDir>;\n\n3. In beforeAll, replace the mkdtempSync call with:\n  temp = createTempDir(\"report-test-\");\n\n4. In afterAll, replace the rmSync call with `temp.cleanup();`.\n\n5. In the two tests, change uses of tmpDir to temp.dir:\n- `generateMaintenanceReport(tmpDir)` → `generateMaintenanceReport(temp.dir)`.\n- `const filePath = path.join(tmpDir, \"stub.md\");` → `const filePath = path.join(temp.dir, \"stub.md\");`.\n\n6. Keep the JSDoc header and assertion logic unchanged; only the filesystem setup/teardown code and imports should be updated."}
Used tool: read_file with input: {"filePath":"tests/maintenance/batch.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/report.test.ts"}
Used tool: search_file_content with input: {"filePath":"tests/maintenance/batch.test.ts","pattern":"fs.","isRegex":false}
Used tool: modify_file with input: {"filePath":"tests/maintenance/batch.test.ts","instruction":"Add a named import for fs since writeFileSync is still used.\n\n1. Replace the first import line so that it becomes:\nimport * as fs from \"fs\";\nimport * as path from \"path\";\nimport { createTempDir } from \"../utils/temp-dir-helpers\";\n\n2. Keep the rest of the imports and file content unchanged."}
Used tool: search_file_content with input: {"filePath":"tests/maintenance/report.test.ts","pattern":"fs.","isRegex":false}
Used tool: modify_file with input: {"filePath":"tests/maintenance/report.test.ts","instruction":"Add a named import for fs since writeFileSync is still used.\n\n1. Replace the first import block so that it becomes:\nimport * as fs from \"fs\";\nimport * as path from \"path\";\nimport { createTempDir } from \"../utils/temp-dir-helpers\";\nimport { generateMaintenanceReport } from \"../../src/maintenance/report\";\n\n2. Keep the rest of the file unchanged."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","tests/maintenance/batch.test.ts","tests/maintenance/report.test.ts","tests/utils/temp-dir-helpers.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: introduce shared helpers to reduce test duplication"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
---

**This was the result:**
---
Here’s what was implemented for the ##NOW and ##NEXT sections, and how.

---

## What I changed

### 1) Refactor the most duplicated rule test suite (NOW)

**Targeted suites:**  

- `tests/utils/annotation-checker.test.ts` (97.53% duplicated in prior report)
- `tests/rules/require-branch-annotation.test.ts` (32.08% duplicated, many repeated error arrays)

#### 1.1 `tests/utils/annotation-checker.test.ts`

Previously this file:

- Had its own `withTsAnnotationCheckerOptions` helper that duplicated the TypeScript RuleTester `languageOptions` structure already defined in `tests/utils/ts-language-options.ts`.
- Repeated the TS parser + parserOptions block in multiple places, causing internal clones.

Changes:

- **Imports updated**:

  ```ts
  import { RuleTester } from "eslint";
  import { checkReqAnnotation } from "../../src/utils/annotation-checker";
  import { withTsLanguageOptions } from "./ts-language-options";
  ```

- **Removed** the bespoke helper:

  ```ts
  // deleted:
  // const withTsAnnotationCheckerOptions = <T extends Record<string, any>>(
  //   test: T,
  // ): T & { languageOptions: typeof tsRuleTesterLanguageOptions } => ({ ... });
  ```

- **Updated `runAnnotationCheckerTests`** to re-use the shared test helper:

  ```ts
  export function runAnnotationCheckerTests(
    ruleName: string,
    config: AnnotationCheckerTestConfig,
  ) {
    const { rule, valid, invalid } = config;

    ruleTester.run(ruleName, rule, {
      valid: valid.map(withTsLanguageOptions) as any,
      invalid: invalid.map(withTsLanguageOptions) as any,
    });
  }
  ```

- Left the in-file test rule and describe block behavior unchanged.

Effect:

- All TS RuleTester configuration now flows through the single `withTsLanguageOptions` helper.
- Internal duplication of the TS parser config and `languageOptions` object in this test file is eliminated.
- `tests/rules/require-req-annotation.test.ts` (which calls `runAnnotationCheckerTests`) automatically benefits; it no longer indirectly duplicates that TS config either.

#### 1.2 `tests/rules/require-branch-annotation.test.ts`

Previously:

- Many invalid cases repeated the same `errors` arrays:

  ```ts
  errors: [
    { messageId: "missingAnnotation", data: { missing: "@story" } },
    { messageId: "missingAnnotation", data: { missing: "@req" } },
  ],
  ```

- Similar two-element or single-element arrays were copied across multiple tests for if/for/while/switch/try/catch, etc.

Changes:

- Added a tiny shared helper right after `ruleTester`:

  ```ts
  const makeMissingAnnotationErrors = (
    ...missing: Array<"@story" | "@req">
  ) =>
    missing.map((item) => ({
      messageId: "missingAnnotation" as const,
      data: { missing: item },
    }));
  ```

- Replaced explicit error arrays in invalid cases with calls to the helper, preserving semantics:

  - If-statement:

    ```ts
    errors: makeMissingAnnotationErrors("@story", "@req"),
    ```

  - For loop missing only `@req`:

    ```ts
    errors: makeMissingAnnotationErrors("@req"),
    ```

  - While loop missing only `@story`:

    ```ts
    errors: makeMissingAnnotationErrors("@story"),
    ```

  - Generic missing-annotation cases (do-while, for-of, for-in, switch-case, switch-case with blank line, configurable ForStatement):

    ```ts
    errors: makeMissingAnnotationErrors("@story", "@req"),
    ```

  - Try/catch (still 4 errors total—two for try, two for catch):

    ```ts
    errors = [
      ...makeMissingAnnotationErrors("@story", "@req"),
      ...makeMissingAnnotationErrors("@story", "@req"),
    ];
    ```

- Left the schema-validation test (the final invalid case) unchanged, as it has a different assertion shape.

Effect:

- All repeated `missingAnnotation` error arrays are now centralized through one helper.
- This substantially reduces structural duplication while keeping behavior and expectations identical.

---

### 2) Apply helper patterns to related rule tests (NEXT, part 1)

This is effectively covered by the two rule-related refactors above:

- **TypeScript config re-use**:

  - The updated `runAnnotationCheckerTests` + `withTsLanguageOptions` now forms a consistent helper pattern for **any** rule that needs TS-specific `TSDeclareFunction` / `TSMethodSignature` coverage.
  - `tests/rules/require-req-annotation.test.ts` already uses `runAnnotationCheckerTests("require-req-annotation", { ... })` and now automatically shares the same TS config via the common helper rather than duplicating or partially duplicating config.

- **Branch rule error arrays**:

  - `tests/rules/require-branch-annotation.test.ts` now uses `makeMissingAnnotationErrors` everywhere instead of bespoke arrays for each AST shape, aligning with the “shared helper for repeated case scaffolding” pattern.

No behavior changes; just reduced duplication with reusable helpers.

---

### 3) Introduce shared utilities for CLI/maintenance tests (NEXT, part 2)

#### 3.1 New helper: `tests/utils/temp-dir-helpers.ts`

New file:

```ts
/**
 * Shared temp directory helpers for maintenance tests.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-TEMP-HELPERS - Provide reusable OS tempdir setup/cleanup utilities for tests
 */
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export interface TempDirHandle {
  /** The absolute path to the created temporary directory. */
  readonly dir: string;
  /** Remove the directory recursively; safe to call multiple times. */
  cleanup(): void;
}

/**
 * Create a temporary directory under the OS temp root with a common prefix.
 *
 * This helper centralizes the mkdtemp + rmSync pattern that appears in
 * multiple maintenance tests so those tests can focus on behavior instead
 * of filesystem plumbing.
 */
export function createTempDir(prefix: string): TempDirHandle {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));

  return {
    dir,
    cleanup() {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}
```

- Encapsulates the `mkdtempSync + rmSync` pattern.
- Adds traceability (`@implements` to REQ-MAINT-SAFE).

#### 3.2 `tests/maintenance/batch.test.ts`

Before:

- Manually did `fs.mkdtempSync(path.join(os.tmpdir(), "batch-test-"))` and `fs.rmSync(tmpDir, { recursive: true, force: true })` in each describe block.

After refactor:

```ts
/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * ...
 */
import * as fs from "fs";
import * as path from "path";
import { createTempDir } from "../utils/temp-dir-helpers";
import {
  batchUpdateAnnotations,
  verifyAnnotations,
} from "../../src/maintenance/batch";

describe("batchUpdateAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let temp: ReturnType<typeof createTempDir>;

  beforeAll(() => {
    temp = createTempDir("batch-test-");
  });

  afterAll(() => {
    temp.cleanup();
  });

  it("[REQ-MAINT-BATCH] should return 0 when no mappings applied", () => {
    const count = batchUpdateAnnotations(temp.dir, []);
    expect(count).toBe(0);
  });
});

describe("verifyAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let temp: ReturnType<typeof createTempDir>;

  beforeAll(() => {
    temp = createTempDir("verify-test-");
    const tsContent = `
/**
 * Tests for: my-story.story.md
 * @story my-story.story.md
 */
`;
    fs.writeFileSync(path.join(temp.dir, "test.ts"), tsContent);
    fs.writeFileSync(
      path.join(temp.dir, "my-story.story.md"),
      "# Dummy Story",
    );
  });

  afterAll(() => {
    temp.cleanup();
  });

  it("[REQ-MAINT-VERIFY] should return true when annotations are valid", () => {
    const valid = verifyAnnotations(temp.dir);
    expect(valid).toBe(true);
  });
});
```

Behavior is unchanged; only the tempdir lifecycle is centralized.

#### 3.3 `tests/maintenance/report.test.ts`

Before:

- Also had bespoke `fs.mkdtempSync` / `fs.rmSync` logic.

After refactor:

```ts
/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * ...
 */
import * as fs from "fs";
import * as path from "path";
import { createTempDir } from "../utils/temp-dir-helpers";
import { generateMaintenanceReport } from "../../src/maintenance/report";

describe("generateMaintenanceReport (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let temp: ReturnType<typeof createTempDir>;

  beforeAll(() => {
    temp = createTempDir("report-test-");
  });

  afterAll(() => {
    temp.cleanup();
  });

  it("[REQ-MAINT-REPORT] should return empty string when no operations", () => {
    const report = generateMaintenanceReport(temp.dir);
    expect(report).toBe("");
  });

  it("[REQ-MAINT-REPORT] should report stale story annotation", () => {
    const filePath = path.join(temp.dir, "stub.md");
    const content = `/**
 * @story non-existent.story.md
 */`;
    fs.writeFileSync(filePath, content);
    const report = generateMaintenanceReport(temp.dir);
    expect(report).toContain("non-existent.story.md");
  });
});
```

Again, behavior identical, but repeated setup/teardown code is DRY’d out via `createTempDir`.

---

### 4) Review & opportunistic refactors (NEXT, part 3)

- Used the existing jscpd report and re-ran `npm run duplication` to inspect clone clusters.
- Confirmed the largest problematic duplication areas in tests:

  - `tests/utils/annotation-checker.test.ts` (handled via TS helper consolidation).
  - `tests/rules/require-branch-annotation.test.ts` (handled via `makeMissingAnnotationErrors`).
  - Maintenance tests (`batch.test.ts`, `report.test.ts`) with duplicated tempdir boilerplate (handled via `createTempDir`).

- Other clones reported by jscpd (e.g., some small repeated blocks in `require-story-helpers.test.ts`, `valid-story-reference.test.ts`, and `maintenance/cli.test.ts`) remain but are:

  - Short snippets (5–15 lines).
  - Below any critical duplication threshold.
  - Often intentional, where duplicated structure makes behavior coverage clearer.

These were intentionally left for later pass to avoid over-abstracting tests and harming readability.

---

## Quality checks run

For each logical chunk of work, the following were run and all passed:

- `npm test -- --runInBand --ci`
- `npm run lint -- --max-warnings=0`
- `npm run duplication`
- `npm run type-check`
- `npm run format:check`
- `npm run build`

The pre-push hook then ran `npm run ci-verify:full`, which also passed.

Two commits were created and pushed:

1. `test: reduce duplication in traceability rule tests`
   - Refactors `tests/utils/annotation-checker.test.ts` and `tests/rules/require-branch-annotation.test.ts`.

2. `test: introduce shared helpers to reduce test duplication`
   - Adds `tests/utils/temp-dir-helpers.ts` and updates `tests/maintenance/batch.test.ts` and `tests/maintenance/report.test.ts` to use it.

After each push, the **“CI/CD Pipeline”** GitHub Actions workflow was monitored; both runs completed successfully.

---

## Updated plan with status

### NOW

- [x] Identify the most heavily duplicated rule test suite and refactor it to use shared test helpers or data builders so that repeated RuleTester setup and case definitions are centralized while keeping existing behavior and coverage intact.

  - Addressed via:
    - Consolidation of TS RuleTester config in `tests/utils/annotation-checker.test.ts` using `withTsLanguageOptions`.
    - Error-array helper `makeMissingAnnotationErrors` in `tests/rules/require-branch-annotation.test.ts`.

### NEXT

- [x] Apply the same shared helper pattern to other closely related rule test files that currently duplicate large blocks of RuleTester configuration and test cases, further reducing structural duplication without changing test behavior.

  - `runAnnotationCheckerTests` + `withTsLanguageOptions` now provide a shared TS scaffolding path for rules like `require-req-annotation`.
  - `makeMissingAnnotationErrors` centralizes repeated error shape construction for branch-annotation rule tests.

- [x] Introduce small, focused utility modules for repeated CLI and maintenance tests (for example, common temp-project setup or command invocation patterns) and update the corresponding tests to use these utilities instead of inlining similar code.

  - New `tests/utils/temp-dir-helpers.ts` (`createTempDir`).
  - `tests/maintenance/batch.test.ts` and `tests/maintenance/report.test.ts` now use this helper.

- [x] Review the remaining test suite for any obvious copy‑and‑paste clusters and opportunistically refactor them into reusable helpers or fixtures, stopping short of over‑abstraction so the tests stay readable and easy to extend.

  - jscpd output reviewed; largest pain points addressed (annotation-checker helper, branch rule, maintenance tempdirs).
  - Remaining smaller clones intentionally left for a future cleanup pass to avoid hurting readability.
---
