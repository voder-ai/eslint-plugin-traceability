Here’s a history-only summary of what’s been done so far on the project, incorporating the latest dependency‑health work.

---

## Core Plugin, Rules, and Config

- Implemented the ESLint plugin entrypoint (`src/index.ts`) that exports all rules, flat-config presets (`recommended`, `strict`), and the maintenance API.
- Implemented core rules:
  - `require-story-annotation`
  - `require-req-annotation`
  - `require-branch-annotation`
  - `valid-annotation-format`
  - `valid-story-reference`
  - `valid-req-reference`
  - `prefer-implements-annotation`
- Added TypeScript-oriented `RuleTester` helpers, refactored all rule tests to use them, and standardized testing across rules.
- Wrote plugin and config tests:
  - `tests/plugin-*.test.ts` to verify export shape, configs, and error handling.
  - `tests/config/*.test.ts` for config schema validation.
- Kept flat-config documentation (`docs/config-presets.md`, setup guides) aligned with the actual configs.

## Maintenance CLI and API

- Designed and documented the `traceability-maint` CLI with `detect`, `verify`, `report`, and `update` subcommands, including flags, exit codes, and behavior (captured in an ADR).
- Implemented CLI parsing and dispatch in `src/maintenance/cli.ts` with manual argument parsing and help output.
- Implemented maintenance modules:
  - `detectStaleAnnotations`
  - `updateAnnotationReferences`
  - `batchUpdateAnnotations`
  - `verifyAnnotations`
  - `generateMaintenanceReport`
- Exposed maintenance utilities via `src/index.ts` and wired the CLI binary through `package.json`.
- Added focused tests under `tests/maintenance/**` plus integration tests (`tests/integration/cli-integration.test.ts`, `tests/cli-error-handling.test.ts`) covering behavior, JSON output, dry-run, exit codes, and error handling.

## Annotation Format, Validation, and Multi-story Support

- Implemented configurable annotation patterns:
  - Added `valid-annotation-options` to normalize options, compile regexes, validate configs, and expose schema/defaults.
  - Refactored `valid-annotation-format` to rely on these helpers for consistent validation and clearer errors.
- Extended `valid-annotation-format` to support:
  - Multiline annotations.
  - Custom `@story` / `@req` patterns.
  - Detailed configuration error messages.
- Implemented `@implements` multi-story support:
  - Added `valid-implements-utils` to parse and validate `@implements` values.
  - Updated `valid-annotation-format` and `valid-req-reference` to handle multiple stories via `@implements`.
  - Created multi-story fixtures (`story_multi_a.md`, `story_multi_b.md`) and corresponding tests.
- Implemented `reqAnnotationDetection` and reused it in `annotation-checker` and validation rules to deduplicate logic.

## Migration to `@implements`

- Implemented `prefer-implements-annotation` as a suggestion rule with conservative autofix:
  - Detects legacy `@story` + `@req` blocks and mixed/multi-story comments.
  - Autofixes simple single-story cases to use `@implements`.
- Added rule tests (`tests/rules/prefer-implements-annotation.test.ts`).
- Authored documentation (`docs/rules/prefer-implements-annotation.md`, `user-docs/migration-guide.md`) explaining behavior, migration strategy, and autofix limits.
- Updated story fixtures and rule docs to reflect `@implements` as the preferred pattern.

## Deep Validation and File/Story Checks

- Enhanced `valid-req-reference` with deep requirement validation:
  - Extracts `REQ-...` IDs from story files.
  - Validates `@req` and `@implements` IDs against story content.
  - Enforces safe paths and scope for story references.
- Implemented `valid-story-reference` and supporting helpers to:
  - Check story file existence.
  - Resolve paths and enforce project boundaries.
  - Support configurable `storyDirectories`, `allowAbsolutePaths`, and `requireStoryExtension`.
- Added comprehensive tests (`tests/rules/valid-req-reference.test.ts`, `tests/rules/valid-story-reference.test.ts`) covering valid/invalid cases, path security, and multi-story behavior.

## Error Reporting and Autofix

- Standardized error message conventions across all rules (`require-*`, `valid-*`, `prefer-implements-annotation`), with traceability-aware messaging.
- Added per-rule tests for message content to keep diagnostics stable.
- Implemented targeted autofix behavior:
  - Adding missing `@story` annotations.
  - Fixing simple `.story.md` suffix issues.
  - Migrating simple `@story` + `@req` blocks to `@implements`.
- Covered autofix paths in dedicated tests (`tests/rules/auto-fix-behavior-008.test.ts` and rule-specific suites).

## CI, Quality Gates, and Husky Hooks

- Maintained quality gates for: build, tests, lint, type-check, formatting, duplication, and traceability checks.
- Consolidated CI checks under `npm run ci-verify:full`.
- Ensured the GitHub “CI/CD Pipeline” workflow:
  - Runs on pushes/PRs to `main` and on a schedule.
  - Uses Node 20 for release jobs and runs smoke tests after releases.
- Updated Husky hooks to match CI:
  - `pre-commit` uses `npx lint-staged` (migrated to Husky v9+ layout).
  - `pre-push` runs `npm run ci-verify:full`.
- Kept CI workflows, ADRs, and runtime/prerequisite docs synchronized.

## Semantic-release, Runtime, and Security Incidents

- Investigated `semantic-release` failures caused by npm OTP requirements and adjusted CI so OTP problems result in “no new release” instead of hard failures.
- Raised the Node engine requirement to `>=18.18.0` and aligned ESLint 9 and CI Node versions accordingly.
- Analyzed and documented dev-only dependency incidents involving:
  - `glob` CLI.
  - `brace-expansion` ReDoS.
  - Bundled `npm` within `semantic-release` and related tooling.
- Classified the `semantic-release` / `@semantic-release/npm` bundled-npm vulnerability as a controlled known error.
- Authored and updated security incident documentation, including:
  - `SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md`
  - Superseded incident files and cross-links between them.
- Documented job isolation, least privilege, and compensating controls in `.github/workflows/ci-cd.yml` and supporting security docs.

## Secret Scanning and Dependency Safety

- Integrated Secretlint with recommended presets and wired it into CI via a `security:secrets` script.
- Introduced `dry-aged-deps` to standardize dependency maturity checks:
  - Added `npm run deps:maturity` (supports JSON output).
  - Implemented `scripts/ci-safety-deps.js` to run `deps:maturity` and emit JSON reports without failing CI.
- Ran `deps:maturity` and `npm audit` and recorded that:
  - Production dependencies have zero high-severity vulnerabilities.
  - Some dev dependencies cannot be safely updated under current policy.
- Authored and updated:
  - `docs/dependency-health.md`
  - `docs/security-incidents/2025-12-03-dependency-health-review.md`
  to capture current status, thresholds, and contributor expectations.

## CI/CD Pipeline and Contributor Documentation

- Wrote `docs/ci-cd-pipeline.md` describing:
  - Workflow triggers, jobs, quality checks, secret scanning, and artifacts.
  - `semantic-release` behavior and Conventional Commits → semver mapping.
- Updated `CONTRIBUTING.md` to:
  - Explain `ci-verify:fast` vs `ci-verify:full`.
  - Describe local workflows that mirror CI.
- Ensured runtime and peer-dependency documentation matches `package.json` and CI configuration.

## Lint Rules, Refactors, and Max-lines Enforcement

- Added an ADR and enabled ESLint security rules such as `no-eval`, `no-implied-eval`, `no-new-func`, and `no-new-wrappers`.
- Enforced `max-lines-per-function` = 55 for production code and refactored:
  - Maintenance modules (`utils`, `update`, `detect`, CLI, etc.).
  - Annotation helpers and validation rules.
  - Internal helpers for `valid-annotation-format` and `valid-implements`.
- Extracted shared test helpers for `require-story-core` autofix tests and TS `RuleTester` utilities to reduce duplication.
- Kept lint output at zero warnings after refactors.

## Functionality Coverage and Story Alignment

- Conducted a comprehensive review of stories 001.0–010.3 to map them to:
  - Implemented rules and maintenance functions.
  - Tests in `tests/rules/**`, `tests/maintenance/**`, `tests/integration/**`, and plugin/config tests.
- Produced `docs/functionality-coverage-2025-12-03.md` summarizing:
  - Per-story status (implemented vs partial), with evidence from code and tests.
  - Gaps between story acceptance/DoD and actual implementation.
  - Areas that remain aspirational (e.g., section-aware deep parsing, FS watching, configurable autofix templates).
- Used commands like `npm test`, `npm run lint`, `npm run type-check`, `npm run build`, `npm run format:check`, and `npm run duplication` to confirm the documented state and ensured CI passed for these changes.

## Recent Tooling and Documentation Adjustments

- Updated `.husky/pre-commit` to Husky v9+ structure while preserving `npx lint-staged`.
- Ran `npm run ci-verify:full` after documentation and hook changes.
- Pushed changes to `main` and confirmed the GitHub CI/CD pipeline completed successfully.

## Dependency Maturity and Documentation (Most Recent Work)

- Reviewed how `dry-aged-deps` is configured and invoked:
  - Confirmed `deps:maturity` runs `dry-aged-deps`, and `safety:deps` (via `scripts/ci-safety-deps.js`) runs it with `--format=json`, writing output to `ci/dry-aged-deps.json`.
  - Verified there is no custom `.dry-aged-deps.json`, so the documented thresholds match the CLI defaults:
    - `prod`: `minAge: 7`, `minSeverity: "none"`
    - `dev`: `minAge: 7`, `minSeverity: "none"`.
- Ran `npm run deps:maturity -- --format=json --check` and `npx dry-aged-deps --format=json`:
  - Both reported `packages: []` and `summary.totalOutdated: 0`, `safeUpdates: 0`, with thresholds matching the docs.
- Cross-checked direct dependencies using `npm ls --depth=0` and spot-checked versions (e.g., `@semantic-release/npm`) against `npm show` output and existing incident docs:
  - Confirmed that “no safe updates” reflects maturity and security criteria, not misconfiguration.
- Verified that no dependency changes were required:
  - No updates were made to `package.json` or the lockfile.
- Updated documentation:
  - `docs/dependency-health.md`:
    - Changed the heading to `## Current Status (2025-12-03, verified)`.
    - Added a bullet noting that `npm run deps:maturity -- --format=json --check` was run successfully and reported `totalOutdated: 0`, `safeUpdates: 0`.
  - `docs/security-incidents/dependency-override-rationale.md`:
    - Appended a new section “Alignment with dry-aged-deps” explaining how overrides coexist with the maturity rules and noting that the 2025-12-03 run reported no safe updates for overridden packages.
- Re-validated the toolchain locally:
  - Ran `npm run build`, `npm test`, `npm run lint`, `npm run type-check`, and `npm run format:check` successfully.
- Committed and pushed the changes:
  - Commit message: `docs: update dependency health docs with verified dry-aged-deps status`.
  - Waited for and confirmed successful completion of the GitHub `CI/CD Pipeline` workflow for that commit.

**Most recently we've executed the following action:**

---
Used tool: get_git_status with input: {}
Used tool: find_files with input: {"pattern":"package.json","directory":"."}
Used tool: find_files with input: {"pattern":"scripts/generate-dev-deps-audit.js","directory":"."}
Used tool: list_directory with input: {"dirPath":"scripts"}
Used tool: read_file with input: {"filePath":"scripts/generate-dev-deps-audit.js"}
Used tool: run_command with input: {"command":"npm","args":["audit","--help"]}
Used tool: read_file with input: {"filePath":"docs/stories/012.0-DEV-CI-AUDIT-INTEGRATION.story.md"}
Used tool: search_file_content with input: {"filePath":"docs/decisions","pattern":"audit","isRegex":true}
Used tool: list_directory with input: {"dirPath":"docs/decisions"}
Used tool: read_file with input: {"filePath":"docs/decisions/008-ci-audit-flags.accepted.md"}
Used tool: read_file with input: {"filePath":"scripts/ci-audit.js"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: read_file with input: {"filePath":"docs/security-incidents/SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md"}
Used tool: run_command with input: {"command":"npm","args":["audit","--include=dev","--omit=optional","--omit=peer","--audit-level=high","--json"]}
Used tool: run_command with input: {"command":"grep","args":["-R","-n","\"omit=prod\"","."]}
Used tool: modify_file with input: {"filePath":"scripts/generate-dev-deps-audit.js","instruction":"Update the npm audit invocation and JSDoc to use valid flags focused on dev dependencies instead of the invalid --omit=prod.\n\n1. In the JSDoc block, replace the requirement description that currently references `npm audit --omit=prod --audit-level=high --json` with one that references `npm audit --include=dev --audit-level=high --json` and clarifies that the focus is on development dependencies.\n2. In the spawnSync call, change the arguments array from `[\"audit\", \"--omit=prod\", \"--audit-level=high\", \"--json\"]` to `[\"audit\", \"--include=dev\", \"--audit-level=high\", \"--json\"]`.\n3. Keep the rest of the script (output directory handling, file writing, exit code behavior) unchanged."}
Used tool: run_command with input: {"command":"node","args":["scripts/generate-dev-deps-audit.js"]}
Used tool: read_file with input: {"filePath":"ci/npm-audit.json","startLine":1,"endLine":40}
Used tool: check_file_exists with input: {"filePath":"ci/npm-audit.json"}
Used tool: run_command with input: {"command":"node","args":["-e","\"const fs=require('fs');console.log(JSON.parse(fs.readFileSync('ci/npm-audit.json','utf8')).metadata?.vulnerabilities||'no-meta');\""]}
Used tool: run_command with input: {"command":"node","args":["-e","\"const fs=require('fs');const t=fs.readFileSync('ci/npm-audit.json','utf8');console.log(t.slice(0,400));\""]}
Used tool: list_directory with input: {"dirPath":"docs"}
Used tool: list_directory with input: {"dirPath":"user-docs"}
Used tool: read_file with input: {"filePath":"docs/ci-cd-pipeline.md"}
Used tool: read_file with input: {"filePath":"docs/dependency-health.md"}
Used tool: read_file with input: {"filePath":"docs/security-incidents/dev-deps-high.json"}
Used tool: read_file with input: {"filePath":"README.md"}
Used tool: read_file with input: {"filePath":"user-docs/examples.md"}
Used tool: read_file with input: {"filePath":"user-docs/api-reference.md"}
Used tool: read_file with input: {"filePath":".github/workflows/ci-cd.yml","startLine":120,"endLine":220}
Used tool: read_file with input: {"filePath":".husky/pre-push","startLine":1,"endLine":80}
Used tool: modify_file with input: {"filePath":"docs/dependency-health.md","instruction":"In the section \"3. Dev-dependency audit and safety checks\", expand the bullet for `npm run audit:dev-high` to explain how it works, what flags it uses, and where it writes its output. Also add a short paragraph after the bullet list clarifying that the dev audit focuses exclusively on dev dependencies via `npm audit --include=dev --audit-level=high --json`, that it never fails CI (exit code 0), and that its JSON output is stored at `ci/npm-audit.json` for inspection alongside the full audit. Do not change other sections."}
Used tool: modify_file with input: {"filePath":"README.md","instruction":"Update the \"Example eslint.config.js (ESLint v9 flat config)\" snippet to match the modern ESM flat-config pattern used elsewhere in the docs. Replace the CommonJS module.exports example with an ESM example that imports @eslint/js and eslint-plugin-traceability, then exports an array including js.configs.recommended and traceability.configs.recommended. Also add a short sentence immediately before the code block explaining that this is the recommended starting point using the plugin's recommended preset. Do not change other sections."}
Used tool: modify_file with input: {"filePath":"user-docs/api-reference.md","instruction":"In the \"Configuration Presets\" section, directly after the sentence that notes `valid-annotation-format` is at `warn`, add a short explanatory sentence clarifying that this is intentional to reduce noise and that users can raise it to `error` if they want strict enforcement. Additionally, in the introduction of the rules section or immediately after it, add a brief paragraph that introduces the `@implements` annotation at a high level, with a one-line example, and link readers to `user-docs/migration-guide.md` section 3.1 and `docs/rules/valid-annotation-format.md` / `docs/rules/valid-req-reference.md` for detailed behavior. Do not alter the rest of the file."}
Used tool: modify_file with input: {"filePath":"docs/ci-cd-pipeline.md","instruction":"In the \"Local Workflow and Hooks\" section, after the paragraph that describes the pre-push hook running `npm run ci-verify:full` and mirroring the CI quality gate, add a short clarifying sentence that secret scanning (`npm run security:secrets`) currently runs only in CI (Node 20.x matrix) and is not part of the pre-push hook, but uses the same configuration so results are consistent. Do not change other content."}
Used tool: get_git_status with input: {}
Used tool: run_command with input: {"command":"npm","args":["run","ci-verify:full"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"chore: refine dev-only audit tooling and docs"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19903470985,"timeout":600000}
Used tool: search_file_content with input: {"filePath":".","pattern":"npm-audit-dev-high","isRegex":false}
Used tool: read_file with input: {"filePath":"scripts/generate-dev-deps-audit.js"}
Used tool: read_file with input: {"filePath":"docs/dependency-health.md"}
Used tool: read_file with input: {"filePath":"docs/code-quality-ratcheting-plan.md"}
Used tool: modify_file with input: {"filePath":"docs/dependency-health.md","instruction":"In the \"Dev-dependency audit and safety checks\" section, fix the path inconsistency for the dev-only audit. Replace the phrase `writes the JSON output to ci/npm-audit-dev-high.json` with `writes the JSON output to ci/npm-audit.json` so that it matches the actual behavior of scripts/generate-dev-deps-audit.js and the explanatory paragraph below. Do not alter any other text."}
Used tool: generate_file with input: {"filePath":"docs/code-quality-refactor-opportunities-2025-12-03.md","overwrite":false,"content":"# Code Quality and Security Refactor Opportunities (2025-12-03)\n\nCreated autonomously by voder.ai\n\nThis note captures small, low-risk refactors that can be implemented incrementally to further improve maintainability and security without changing public behavior.\n\n## 1. Decompose maintenance CLI implementation\n\n**Files:**\n- `src/maintenance/cli.ts`\n\n**Motivation:**\n- `cli.ts` is one of the larger source files and currently owns argument parsing, flag normalization, subcommand dispatch, and user-facing messaging.\n- While it still passes `max-lines` and `max-lines-per-function` rules, splitting responsibilities would improve navigability.\n\n**Potential refactors:**\n- Extract a dedicated `src/maintenance/flags.ts` module responsible solely for:\n  - Defining the `CliFlags` shape and defaults.\n  - Implementing `applyFlag` / `parseFlags` behavior and validation.\n- Extract a `src/maintenance/commands.ts` module for the four subcommand handlers:\n  - `handleDetect`, `handleVerify`, `handleReport`, `handleUpdate`.\n  - Keep `runMaintenanceCli` as a small coordination layer that wires parsed arguments to these handlers.\n\n## 2. Narrow helper responsibilities in require-story helpers\n\n**Files:**\n- `src/rules/helpers/require-story-helpers.ts`\n- `src/rules/helpers/require-story-core.ts`\n\n**Motivation:**\n- These helpers concentrate multiple kinds of functionality: AST visitor construction, IO behavior, message construction, and small utility predicates.\n- Individual functions are reasonably sized, but the number of exported helpers makes the files dense.\n\n**Potential refactors:**\n- Introduce a dedicated `src/rules/helpers/require-story-io.ts` (already partially present) as the single place for reading and writing files in tests and rules.\n- Move purely structural helpers (e.g., small predicates, formatting helpers) into a `require-story-utils.ts`-style module so each file focuses on a single axis of responsibility.\n\n## 3. Revisit targeted ESLint suppressions\n\n**Files:**\n- `src/rules/helpers/valid-story-reference-helpers.ts` (single `no-unused-vars` suppression on a type-only parameter)\n- `src/rules/helpers/valid-annotation-options.ts` (single `max-params` suppression for a central option-normalization helper)\n- `tests/utils/ts-language-options.ts` (single `no-magic-numbers` suppression to allow ECMA version constants)\n\n**Motivation:**\n- Each suppression is currently justified and localized, but a small refactor could remove them entirely, simplifying the lint configuration.\n\n**Potential refactors:**\n- Replace the suppressed `max-params` helper with an options object parameter so callers pass a single argument while preserving type safety.\n- For the `no-unused-vars` case, explore using a `type`-only import or restructuring the function signature so all parameters are meaningfully consumed.\n- Extract ECMA version numbers into named constants in a small shared test utility module to avoid the need for a `no-magic-numbers` override.\n\n## 4. Optional: add slim wrappers for Story/Req detection utilities\n\n**Files:**\n- `src/utils/reqAnnotationDetection.ts`\n- `src/utils/annotation-checker.ts`\n\n**Motivation:**\n- These utilities are well-tested but contain a moderate amount of conditional logic for different AST node types.\n\n**Potential refactors:**\n- Introduce thin, strongly-typed wrapper functions for the most common call sites (e.g., “analyze function declaration for traceability annotations”) that hide some of the configuration detail from rule implementations.\n- This would make rule modules slightly smaller and more declarative, leaving the complex branching in a shared, well-tested location.\n\nThese refactors should be tackled incrementally, one small change at a time, with existing Jest tests and ESLint rules acting as safety nets to ensure behavior remains unchanged."}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"docs: clarify dev audit, presets, @implements, and secret scanning"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19903613169,"timeout":600000}
---

**This was the result:**
---
Here’s what’s been implemented for the **##NOW** and **##NEXT** items, along with the updated plan.

---

## Work Completed

### 1) Correct dev-only dependency audit script (##NOW)

**Goal:** Use valid npm audit flags for dev-only audit and reliably produce a high-severity dev-deps JSON snapshot.

**Changes:**

- **Script:** `scripts/generate-dev-deps-audit.js`
  - Updated the npm audit invocation:
    - **Before:** `npm audit --omit=prod --audit-level=high --json` (invalid flag combination on current npm)
    - **Now:** `npm audit --include=dev --audit-level=high --json`
  - JSDoc updated to match behavior:
    - Requirement now states: run `npm audit --include=dev --audit-level=high --json`, capture UTF-8 output, write to `ci/npm-audit.json`, ensure directory exists, always exit `0`.
  - Behavior maintained:
    - Uses `spawnSync("npm", ["audit", ...], { encoding: "utf8" })`
    - Ensures `ci/` exists, writes `ci/npm-audit.json` from `stdout || stderr || ""`
    - Always `process.exit(0)` so it never blocks CI.

**Verification:**

- Ran the script directly:
  - `node scripts/generate-dev-deps-audit.js`
  - Confirmed `ci/npm-audit.json` exists.
- Ran full CI-equivalent gate:
  - `npm run ci-verify:full`
  - All steps passed (build, type-check, lint, tests, format:check, audits, duplication, traceability).
- Committed and pushed:
  - Commit: `chore: refine dev-only audit tooling and docs`
  - GitHub Actions `CI/CD Pipeline` run (ID `19903470985`) completed with **success**.

This completes the **##NOW** item.

---

### 2) Enhance dev-only audit and security documentation (##NEXT, item 1)

**Goal:** Clearly explain how the dev audit script works, what it outputs, and how it fits with other checks.

**Changes:**

- **File:** `docs/dependency-health.md`
  - In **“3. Dev-dependency audit and safety checks”**:
    - Expanded `npm run audit:dev-high` bullet:
      - Now explicitly states it:
        - Runs `npm audit --include=dev --audit-level=high --json`
        - Normalizes exit code to `0` (never fails CI directly)
        - Writes JSON output to `ci/npm-audit.json` for targeted inspection of high-severity dev-only vulnerabilities.
    - Clarified relationship with other scripts:
      - `npm run audit:ci` → `npm audit --json`, also writing `ci/npm-audit.json` as the general audit snapshot.
      - `npm run safety:deps` → runs `dry-aged-deps`, writes `ci/dry-aged-deps.json`.
    - Added a short paragraph explaining:
      - Dev audit focuses **exclusively** on dev deps via `--include=dev`.
      - Always exits `0`.
      - Output lives in `ci/npm-audit.json` alongside the full audit snapshot.

**Result:** Dev-only audit behavior, flags, and file locations are now fully documented and aligned with the script implementation.

---

### 3) Update main user-facing documentation (config examples, rule severity, @implements) (##NEXT, item 2)

**Goals:**
- Make the primary ESLint config example accurate for ESLint 9 flat config.
- Clarify intended severity for `valid-annotation-format`.
- Briefly introduce `@implements` and point to detailed docs.

**Changes:**

1. **README configuration example**

   - **File:** `README.md`
   - Replaced the older CommonJS-style snippet:

     ```js
     module.exports = [
       {
         env: { es2021: true, node: true },
         plugins: { traceability: {} },
         rules: { ... },
       },
     ];
     ```

   - With a modern ESLint 9 flat-config ESM example that mirrors the rest of the docs:

     ```js
     // eslint.config.js
     import js from "@eslint/js";
     import traceability from "eslint-plugin-traceability";

     export default [
       js.configs.recommended,
       traceability.configs.recommended,
     ];
     ```

   - Added a short lead-in sentence:
     - “This example shows the recommended starting point using the plugin's recommended preset alongside ESLint's recommended config:”

   This brings README into alignment with `user-docs/eslint-9-setup-guide.md` and `user-docs/examples.md`.

2. **Call out `valid-annotation-format` severity**

   - **File:** `user-docs/api-reference.md`
   - In the **“Configuration Presets → recommended”** section:
     - After the sentence noting `valid-annotation-format` is at `warn`, added:
       - This `warn` level is **intentional** to keep early adoption noise low, but projects can safely raise it to `error` if they want strict enforcement.
   - This clarifies why users see warnings by default and how to tighten it.

3. **Introduce `@implements` in user-facing API docs**

   - **File:** `user-docs/api-reference.md`
   - Immediately under `## Rules`, added a short introduction paragraph:

     - Explains that, in addition to `@story` and `@req`, the plugin also understands `@implements` for multi-story code.
     - Provides a one-line example:
       - `@implements docs/stories/010.0-PAYMENTS.story.md#REQ-PAYMENTS-REFUND`
     - Links to detailed docs:
       - `user-docs/migration-guide.md` (section **3.1 Multi-story @implements annotations**)
       - `docs/rules/valid-annotation-format.md`
       - `docs/rules/valid-req-reference.md`

   This makes `@implements` discoverable without duplicating the deep behavior docs.

---

### 4) Align secret-scanning documentation with implementation (##NEXT, item 3)

**Goal:** Ensure docs accurately describe where secret scanning runs vs pre-push checks, without changing behavior.

**Changes:**

- **File:** `docs/ci-cd-pipeline.md`
  - In **“Local Workflow and Hooks”**:
    - After describing `.husky/pre-push` running `npm run ci-verify:full`, added:

      > Secret scanning (`npm run security:secrets`) currently runs only in CI on the Node 20.x matrix entry and is not part of the pre-push hook, but it uses the same configuration so results stay consistent between local and CI.

  - This matches:
    - Workflow: `.github/workflows/ci-cd.yml` (secretlint step only on Node 20.x).
    - Hooks: `.husky/pre-push` runs `ci-verify:full` (no `security:secrets`).

**Result:** Documentation now correctly reflects that local pre-push and CI share the same core quality gates, with secret scanning as an extra CI-only safeguard.

---

### 5) Document minor refactor opportunities for later (##NEXT, item 4)

**Goal:** Perform a focused pass for remaining minor security / code-quality nits and document specific, low-risk refactors for later.

**Changes:**

- **New dev doc:** `docs/code-quality-refactor-opportunities-2025-12-03.md`
  - Summarizes potential incremental refactors (no behavior changes):

  1. **Decompose maintenance CLI implementation**
     - File: `src/maintenance/cli.ts`
     - Idea: Extract:
       - `src/maintenance/flags.ts` for flag shape/defaults and parsing.
       - `src/maintenance/commands.ts` for `handleDetect`, `handleVerify`, `handleReport`, `handleUpdate`.
       - Keep `runMaintenanceCli` as a small coordinator.

  2. **Narrow helper responsibilities in require-story helpers**
     - Files: `src/rules/helpers/require-story-helpers.ts`, `require-story-core.ts`
     - Idea: Further separate IO behavior, AST visitor wiring, and pure utilities, building on existing `require-story-io.ts` / `require-story-utils.ts`.

  3. **Revisit targeted ESLint suppressions**
     - Files with single, well-justified suppressions:
       - `valid-story-reference-helpers.ts` (`no-unused-vars`)
       - `valid-annotation-options.ts` (`max-params`)
       - `tests/utils/ts-language-options.ts` (`no-magic-numbers`)
     - Ideas:
       - Replace the `max-params` helper with an options object.
       - Adjust type usage / parameters to avoid `no-unused-vars`.
       - Move ECMA versions into named constants to drop the `no-magic-numbers` exception.

  4. **Optional: add slim wrappers for Story/Req detection utilities**
     - Files: `src/utils/reqAnnotationDetection.ts`, `annotation-checker.ts`
     - Idea: Create thin, strongly-typed wrappers for common use cases to make rule code more declarative and keep branching localized.

**Result:** These opportunities are now documented as follow-up work without changing current behavior or CI.

---

### Quality Checks and CI

For both commits, the full quality suite ran **locally** and **in CI**:

- Local:
  - `npm run ci-verify:full`
- Git hooks:
  - Pre-push hook invoked `npm run ci-verify:full` successfully.
- CI/CD:
  - Two main-branch runs of **“CI/CD Pipeline”** (IDs `19903470985` and `19903613169`) completed with **success**.

All tests, linting, type checks, formatting, duplication checks, and audits passed.

---

## Updated Plan with Status

### NOW

- [x] Correct the development-only dependency audit script so that it uses valid configuration for the audit tool and reliably produces a valid JSON snapshot focused on high-severity issues in dev dependencies.

### NEXT

- [x] Enhance the development-only audit and security documentation so it clearly explains how the dev audit script works, what its output means, and how it complements the production-only audit and dependency maturity checks.
- [x] Update the main user-facing documentation to clarify the recommended ESLint configuration examples, explicitly call out the intended severity of the annotation-format rule, and briefly introduce the @implements annotation style with links to the detailed guides.
- [x] Review the documented and implemented secret-scanning workflow to ensure it is clearly described how and when secret checks run locally and in CI, and adjust the description so that it reflects the intended parity between local pre-push checks and the CI pipeline without altering existing behavior.
- [x] Perform a focused pass over the codebase to look for any remaining minor security or code-quality nits (such as overly broad comments, small inline suppressions, or slightly oversized helper modules) and document specific, low-risk refactors that can be done incrementally later.

### LATER

- [ ] Implement the small, documented refactors to reduce the size or responsibility of any remaining large helper or CLI modules while keeping behavior and public APIs unchanged.
- [ ] Add narrowly scoped tests or checks that exercise any remaining defensive branches or error paths identified during the security and code-quality review to further strengthen confidence without changing behavior.
- [ ] Periodically re-evaluate the dev-only dependency risk and dry-aged-deps output to see whether new, policy-compliant versions of the tooling stack (especially release tooling) become available and, when they do, plan safe upgrades guided by the maturity rules.
- [ ] Capture the finalized handling of dev-only audits, secret scanning, and minor security nits in an updated or new decision record so that future contributors have a clear reference for the project’s security and audit posture.
---
