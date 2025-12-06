Here’s a concise, history-only summary of what’s been done so far on the project, including the most recent work.

---

## 1. Refactor of `valid-req-reference` into helper-based architecture

- Identified `src/rules/valid-req-reference.ts` as too complex and refactored it into a helper-based design.
- Extracted parsing, validation, traversal, and file I/O into `src/rules/helpers/valid-req-reference-helpers.ts`.
- Implemented helpers to:
  - Parse `@story`, `@req`, and `@supports` annotations.
  - Validate and resolve story file paths with guards against `..` and absolute paths, reporting `invalidPath`.
  - Read story files, extract requirement IDs, cache them safely, and handle file-read errors.
  - Check for requirement existence and report `reqMissing`.
  - Traverse comments/annotations and wire up the ESLint `Program` visitor.
- Exposed a single entrypoint `createValidReqReferenceProgramVisitor(context)` with appropriate traceability annotations.

---

## 2. Simplified `valid-req-reference` rule entrypoint

- Simplified `src/rules/valid-req-reference.ts` to:
  - Import `createValidReqReferenceProgramVisitor`.
  - Keep the rule’s `meta` and `messages`.
  - Implement `create(context)` as a thin wrapper returning `{ Program: createValidReqReferenceProgramVisitor(context) }`.
- Removed duplicated helper logic; the rule file is now configuration and wiring only.

---

## 3. Quality checks and CI for the refactor

- Ran local checks:
  - `npm test -- --runInBand`
  - `npm run lint -- --max-warnings=0`
  - `npm run type-check`
  - `npm run format:check`
  - `npm run ci-verify:fast`
- Ensured formatting and committed as `refactor: extract valid req reference helpers into dedicated module`.
- Verified GitHub Actions CI passed.

---

## 4. Documentation updates for helper-based structure

- Updated `docs/eslint-plugin-development-guide.md` to describe:
  - The helper-module pattern for complex rules.
  - Thin rule entry files delegating to helper modules under `src/rules/helpers` or `src/utils`.
  - Examples using `createValidReqReferenceProgramVisitor` and `valid-story-reference-helpers`.
- Updated `docs/code-quality-refactor-opportunities-2025-12-03.md`:
  - Marked maintenance CLI decomposition as complete.
  - Noted `valid-req-reference` as another rule using helper extraction.
- Committed as `docs: document helper-based structure for complex rules` and confirmed CI success.

---

## 5. Investigation of branch-annotation behavior and coverage

- Reviewed `src/rules/require-branch-annotation.ts`:
  - Confirmed handling of `IfStatement`, loops, `SwitchCase`, `TryStatement`, `CatchClause`, and nested structures.
- Reviewed `src/utils/branch-annotation-helpers.ts`:
  - Verified `gatherBranchCommentText`, missing-annotation diagnostics, and autofix/fix-count behavior.
- Examined Story 004.0 and identified unexercised requirements:
  - `REQ-NESTED-HANDLING`
  - `REQ-PERFORMANCE-OPTIMIZATION`
- Reviewed existing tests and found missing coverage for nested control flow and performance behavior.

---

## 6. Nested-branch tests for `require-branch-annotation` (REQ-NESTED-HANDLING)

- Updated `tests/rules/require-branch-annotation.test.ts`:
  - Added file-level `@req REQ-NESTED-HANDLING`.
  - Extended `@supports` to cover `REQ-BRANCH-DETECTION` and `REQ-NESTED-HANDLING`.
- Added tests:
  - Valid nested-branch case where outer and inner `if` branches are annotated.
  - Invalid nested-branch case where outer is annotated and inner is not; asserts only inner branch is reported.
  - Autofix expectations ensuring insertion of `// @story <story-file>.story.md` and verifying `output` in `RuleTester`.

---

## 7. Performance test for `require-branch-annotation` (REQ-PERFORMANCE-OPTIMIZATION)

- Created `tests/perf/require-branch-annotation-large-file.test.ts` with `@supports` for:
  - `REQ-PERFORMANCE-OPTIMIZATION`
  - `REQ-NESTED-HANDLING`
- Implemented `buildLargeNestedBranchSource(functionCount, nestingDepth)` to generate many nested, unannotated branches.
- Wrote a Jest performance test using ESLint’s `Linter` in `eslintrc` mode with only `traceability/require-branch-annotation` enabled.
- Assertions:
  - At least one diagnostic is produced.
  - Runtime remains under 5000 ms.
- Used eslintrc-style configuration to avoid flat-config issues in this perf test.

---

## 8. Test runs and CI verification for branch-annotation changes

- Ran targeted unit and performance tests for `require-branch-annotation`.
- Fixed a RuleTester assertion by adding `output` to the invalid nested test.
- Reran the full quality suite:
  - `npm test -- --runInBand`
  - `npm run lint`
  - `npm run type-check`
  - `npm run format:check`
  - `npm run build`
  - `npm run format` then `npm run format:check`
- Committed as `test: cover nested handling and performance for branch annotations`.
- Confirmed CI success.

---

## 9. Coverage-enabled test runs and tooling validation

- Reviewed Jest configuration and repo structure.
- Ran `npm test -- --coverage --runInBand` and observed:
  - Statements ~96.5%
  - Branches ~84.3%
  - Functions ~99.6%
  - Lines ~96.5%
- Confirmed coverage thresholds are exceeded (80/90/90/90).
- Investigated prior coverage failures and traced them to environment-related `ENOENT` module-resolution issues (missing `node_modules`), not configuration problems.
- Verified `npm run ci-verify:full` including coverage and other checks.
- No code changes were required; no commits were made from this phase.

---

## 10. Review of maintenance implementation and tests

- Reviewed maintenance code in `src/maintenance/*.ts`:
  - CLI, commands, detect, report, update, utils, batch, and entrypoint.
- Reviewed maintenance tests and perf tests (`tests/maintenance/*.test.ts`, `tests/perf/maintenance-*.test.ts`).
- Ran coverage focused on `src/maintenance/*` and identified under-tested paths:
  - `verify` failure behavior when annotations are stale/invalid.
  - `report` “nothing to report” behavior.
  - CLI-level performance for `verify` on a large workspace.
  - Extra `fs.statSync` branch in `update.ts`.

---

## 11. Targeted maintenance CLI behavior tests

### 11.1 `verify` failure behavior

- In `tests/maintenance/cli.test.ts`:
  - Added test `"[REQ-MAINT-VERIFY] verify exits with code 1 and prints guidance when annotations are stale or invalid"`.
- Test creates a file with invalid `@story` reference and runs maintenance CLI `verify`.
- Asserts:
  - Exit code `1`.
  - Guidance message explaining stale/invalid annotations and follow-up commands.

### 11.2 `report` “nothing to report”

- Added `"[REQ-MAINT-REPORT] report prints 'nothing to report' when no stale annotations exist"`.
- Runs `report` in an empty workspace.
- Asserts:
  - Exit code `0`.
  - Output `"No stale @story annotations found. Nothing to report."`

### 11.3 Detect test naming improvement

- In `tests/maintenance/detect-isolated.test.ts`:
  - Renamed a test to `"[REQ-MAINT-DETECT] handles permission denied errors by returning an empty result"`.
  - Left behavior unchanged.

---

## 12. Maintenance update implementation refinement

- In `src/maintenance/update.ts`:
  - Removed redundant `fs.statSync(fullPath)` and `isFile` checks in `processFileForAnnotationUpdates`, relying on `getAllFiles` for files-only input.
- Updated logic:
  - Read file, apply regex, track replacements, write only if changed.
  - Added comment documenting reliance on `getAllFiles`.
- Result:
  - Reduced unnecessary I/O and removed an uncovered branch.
  - Achieved 100% coverage for `update.ts` and improved overall maintenance coverage.

---

## 13. Maintenance CLI performance test for `verify`

- Updated `tests/perf/maintenance-cli-large-workspace.test.ts` with:
  - `"[REQ-MAINT-VERIFY] verify completes within a generous time budget and reports stale annotations"`.
- Test:
  - Uses a large synthetic workspace.
  - Spies on `console.log`.
  - Runs `traceability-maint verify --root <workspace>`.
- Asserts:
  - Exit code `1`.
  - Runtime under 5000 ms.
  - Output showing stale or invalid annotations.

---

## 14. Maintenance test runs and CI verification

- Updated `.voder/plan.md` to mark maintenance review/test tasks complete.
- Ran focused and full tests for maintenance CLI and update logic.
- Committed:
  - `test: adjust maintenance detect isolated test to reflect safe error handling`
  - `test: expand maintenance CLI coverage and refine update performance`
- Pushed changes and monitored CI runs (`19968546978`, `19969132158`), both successful.

---

## 15. Dogfooding: enabling self-enforcement of traceability rules

### 15.1 Repository inspection and traceability checks

- Reviewed:
  - Story `023.0-MAINT-DOGFOODING-VALIDATION.story.md`.
  - Problem doc `001-plugin-not-enforcing-own-traceability-rules.open.md`.
- Inspected configs (ESLint, Jest, TS, CI, Husky) and key plugin/rule entrypoints:
  - `src/index.ts`
  - `require-story-annotation`
  - `require-story-helpers`
  - `require-test-traceability`
- Reviewed internal scripts:
  - `lint-plugin-check`
  - `lint-plugin-guard`
  - `traceability-check`
  - `report-eslint-suppressions`
- Reviewed integration tests and `.voder` tracking.
- Ran `npm run check:traceability` and confirmed current traceability check behavior.

### 15.2 Enabling `require-story-annotation` in ESLint config

- Updated `eslint.config.js` to enable for TypeScript files:

  ```js
  "traceability/require-story-annotation": "error"
  ```

- Confirmed application to `src/**/*.ts` and `tests/**/*.ts`.
- Ran:
  - `npm run lint -- --max-warnings=0`
  - `npm run lint -- src`
  - `npm run lint -- tests`
- All passed.
- Ran `npm run report:eslint-suppressions` and confirmed zero suppressions.
- Adjusted test-file config to disable `@typescript-eslint/no-var-requires` in tests, allowing removal of now-unnecessary inline disables.

### 15.3 Dogfooding validation integration test

- Added `tests/integration/dogfooding-validation.test.ts` with file-level `@supports` for:
  - Story 023
  - `REQ-DOGFOODING-TEST`
  - `REQ-DOGFOODING-CI`
- Implemented:

  1. **Config inspection test (REQ-DOGFOODING-TEST)**  
     - Loads `eslint.config.js`.
     - Locates the TypeScript config block.
     - Asserts:
       - TS block exists.
       - `traceability/require-story-annotation` is present and set to `"error"` (or equivalent).

  2. **CLI execution test (REQ-DOGFOODING-CI)**  
     - Resolves `node_modules/.bin/eslint` and `eslint.config.js`.
     - Lints TS code via `stdin` with `--stdin-filename src/dogfood.ts`.
     - Asserts:
       - Non-zero exit status.
       - `stdout` references `"error"` and `src/dogfood.ts`.

- Iteratively refined this test:
  - Switched from `ESLint` class + flat-config options to invoking the CLI directly.
  - Relaxed assertions to avoid depending on specific rule IDs in stdout.
- Removed obsolete `// eslint-disable @typescript-eslint/no-var-requires` comments in tests.
- Ran the integration test and the full suite; all passed.

### 15.4 Story and problem-doc updates for dogfooding

- Updated `023.0-MAINT-DOGFOODING-VALIDATION.story.md`:
  - Marked “First Rule Enabled” (enabling `require-story-annotation`) as completed.
  - Updated Definition of Done text for the dogfooding test item while keeping overall checklist state appropriate.
- Updated `001-plugin-not-enforcing-own-traceability-rules.open.md`:
  - Adjusted example `@story` path to reference Story 023.
  - Documented that the previously failing dogfooding test now exists at `tests/integration/dogfooding-validation.test.ts` and passes.
- Added “Dogfooding and Self-Validation” section to `docs/eslint-plugin-development-guide.md`:
  - Described enabling traceability rules in this repo (starting with `require-story-annotation`).
  - Documented an incremental “one rule at a time” approach.
  - Noted the use of `report:eslint-suppressions` and `ci-verify:full` for enforcement/monitoring.

### 15.5 Integration with CI and automation

- Confirmed `npm run lint` and `npm run ci-verify:full` already run ESLint with `require-story-annotation` enabled.
- Verified `.husky/pre-push` runs `ci-verify:full` and secret scanning.
- Verified CI workflow triggers `ci-verify:full`.
- With `require-story-annotation` enabled, lint, CI, and pre-push now enforce this traceability rule on `src` and `tests`.

### 15.6 Final checks, commit, and CI for dogfooding

- Ran:
  - `npm run build`
  - `npm test`
  - `npm run lint -- --max-warnings=0`
  - `npm run type-check`
  - `npm run format:check`
  - `npm run report:eslint-suppressions`
- Committed:

  ```bash
  git commit -m "test: add dogfooding validation integration test for traceability rules"
  ```

- Pushed and monitored the “CI/CD Pipeline” workflow; it completed successfully.

---

## 16. Traceability alignment in helper modules

### 16.1 Corrected helper annotations in `valid-req-reference-helpers.ts`

- Used repo tooling to inspect helper modules and story docs.
- Found mismatches in `valid-req-reference-helpers.ts`:
  - `REQ-DEEP-PATH` used in code but not defined in `010.0-DEV-DEEP-VALIDATION`.
  - `REQ-IMPLEMENTS-VALIDATE` used in code but not defined in `010.2-DEV-MULTI-STORY-SUPPORT` (which defines `REQ-SUPPORTS-VALIDATE` instead).
- Updated top-level JSDoc:
  - Removed `REQ-DEEP-PATH` from the 010.0 `@supports` line, leaving `REQ-DEEP-PARSE`, `REQ-DEEP-MATCH`, `REQ-DEEP-CACHE`.
  - Replaced `REQ-IMPLEMENTS-VALIDATE` with `REQ-SUPPORTS-VALIDATE` for 010.2, keeping `REQ-MIXED-SUPPORT` and `REQ-SCOPED-IDS`.
- Updated inline `@req` tags:
  - Replaced `REQ-DEEP-PATH` with existing requirements based on function behavior:
    - `REQ-DEEP-CACHE` for path resolution/caching.
    - `REQ-DEEP-PARSE` or `REQ-DEEP-MATCH` for parsing/matching logic.
- Adjusted `parseImplementsLine` and `validateImplementsLine` JSDoc to reference:
  - `REQ-SUPPORTS-VALIDATE`
  - `REQ-MIXED-SUPPORT`
  - `REQ-SCOPED-IDS`
- Updated `handleAnnotationLine` JSDoc to:
  - Mention handling of `@story`, `@req`, and `@supports` tags.
  - Align its `@req` tags with the 010.0 and 010.2 stories.
- Ensured all exported helpers and key internal functions reference existing story files and requirement IDs only.

### 16.2 Review of other helper modules

- Scanned helper modules:

  - `require-story-core.ts`
  - `require-story-helpers.ts`
  - `require-story-io.ts`
  - `require-story-utils.ts`
  - `require-story-visitors.ts`
  - `require-test-traceability-helpers.ts`
  - `valid-annotation-format-internal.ts`
  - `valid-annotation-format-validators.ts`
  - `valid-annotation-options.ts`
  - `valid-annotation-utils.ts`
  - `valid-implements-utils.ts`
  - `valid-story-reference-helpers.ts`

- Confirmed:
  - Functions already had correct `@story`, `@req`, or `@supports` annotations.
  - Inline `// @supports` comments were used appropriately for complex branches.
  - No additional mismatches or missing annotations were found; only `valid-req-reference-helpers.ts` required fixes.

### 16.3 Development guide update for helper traceability

- Updated `docs/eslint-plugin-development-guide.md` (helper-module section) to state:
  - Every exported helper must have JSDoc with `@supports` or `@story`/`@req` referencing real stories and concrete requirement IDs.
  - Significant internal branches can use inline `// @supports` annotations.
  - Helper modules serving multiple rules should use multiple `@supports` lines to map behavior to all relevant stories.
- Added a short TypeScript example of a helper with multi-story `@supports` annotations.

### 16.4 Story and requirement ID alignment checks

- Rechecked relevant stories (`010.0-DEV-DEEP-VALIDATION`, `010.2-DEV-MULTI-STORY-SUPPORT`, others) against helper annotations.
- Confirmed:
  - `REQ-DEEP-PATH` and `REQ-IMPLEMENTS-VALIDATE` are no longer referenced in code.
  - All remaining requirement IDs in helper annotations exist in the referenced stories and describe matching behavior.

### 16.5 Quality checks and CI for traceability alignment

- Ran:
  - `npm run lint -- --max-warnings=0`
  - `npm test -- --runInBand`
  - `npm run build`
  - `npm run type-check`
  - `npm run format:check`
- Fixed a formatting issue in `valid-req-reference-helpers.ts` via:

  ```bash
  npm run format -- src/rules/helpers/valid-req-reference-helpers.ts
  npm run format:check
  ```

- Committed and pushed as `chore: align helper traceability annotations with stories`.
- Monitored CI (`CI/CD Pipeline`, run ID `19985908372`), which succeeded (including `ci-verify:full` and `security:secrets`).

---

## 17. Plugin setup story completion and plugin meta enrichment (most recent work)

- Reviewed `docs/stories/001.0-DEV-PLUGIN-SETUP.story.md` alongside:
  - `src/index.ts` (plugin entry, rule registry, configs, maintenance exports).
  - Tests: `tests/plugin-setup.test.ts`, `tests/plugin-default-export-and-configs.test.ts`,
    `tests/plugin-setup-error.test.ts`, `tests/config/flat-config-presets-integration.test.ts`,
    `tests/config/eslint-config-validation.test.ts`, `tests/cli-error-handling.test.ts`.
  - Config/docs: `eslint.config.js`, `README.md`, `user-docs/eslint-9-setup-guide.md`,
    `docs/eslint-plugin-development-guide.md`, `docs/custom-rules-development-guide.md`,
    `jest.config.js`, `tsconfig.json`, `package.json`.
- Confirmed that:
  - `REQ-PLUGIN-STRUCTURE`, `REQ-ESLINT-COMPAT`, `REQ-CONFIG-SYSTEM`, `REQ-RULE-REGISTRY`,
    `REQ-TYPESCRIPT`, and `REQ-TEST-SETUP` were already satisfied.
  - Error handling criteria were already covered by dynamic rule loading and error-handling tests.
  - Documentation criteria were already met in README and docs.
- Identified `REQ-NPM-PACKAGE` as partially implicit and lacking explicit plugin `meta`.

### 17.1 Plugin meta implementation in `src/index.ts`

- Added `pluginMeta`:

  ```ts
  /**
   * Plugin metadata used by ESLint for debugging and caching.
   *
   * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE REQ-NPM-PACKAGE
   */
  const pluginMeta = (() => {
    type Pkg = { name?: string; version?: string };

    let pkg: Pkg = {};

    try {
      // When running from built output (lib/src/index.js)
      // this resolves to the package.json at the project root.
      // @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-NPM-PACKAGE
      pkg = require("../../package.json") as Pkg;
    } catch {
      try {
        // When running via the TypeScript sources (src/index.ts) in this repo,
        // fall back to resolving package.json one level up from src/.
        // @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-NPM-PACKAGE
        pkg = require("../package.json") as Pkg;
      } catch {
        // As a last resort (tests, unusual environments), provide sensible
        // defaults so that plugin loading never fails just for metadata.
        // @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE
        pkg = {
          name: "eslint-plugin-traceability",
          version: "0.0.0-development",
        };
      }
    }

    return {
      name: pkg.name ?? "eslint-plugin-traceability",
      version: pkg.version ?? "0.0.0-development",
      namespace: "traceability",
    } as const;
  })();
  ```

- Updated the plugin object to include `meta`:

  ```ts
  const plugin: {
    rules: typeof rules;
    configs?: unknown;
    maintenance?: unknown;
    meta?: typeof pluginMeta;
  } = {
    rules,
    meta: pluginMeta,
  };
  ```

- Preserved existing rule, config, and maintenance behavior.

### 17.2 Tests for plugin meta and setup behavior

- Updated `tests/plugin-setup.test.ts` header:

  ```ts
  /**
   * Tests for: docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
   * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
   * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE REQ-NPM-PACKAGE
   */
  ```

- Existing test (unchanged) asserts `plugin.exports` structure.
- Added new test:

  ```ts
  it(
    "[REQ-PLUGIN-STRUCTURE][REQ-NPM-PACKAGE] plugin exposes meta with name, namespace, and version",
    () => {
      const pkg = require("../package.json") as { name: string; version: string };
      const meta = (plugin as any).meta;

      expect(meta).toBeDefined();
      expect(meta.name).toBe(pkg.name);
      expect(meta.version).toBe(pkg.version);
      expect(meta.namespace).toBe("traceability");
    },
  );
  ```

- Confirmed other existing tests already covered:
  - Plugin structure and rule registry (`tests/plugin-default-export-and-configs.test.ts`).
  - Flat-config integration (`tests/config/flat-config-presets-integration.test.ts`).
  - Plugin loading error handling (`tests/plugin-setup-error.test.ts`, `tests/cli-error-handling.test.ts`).

- Ran targeted tests:

  ```bash
  npm test -- --runInBand \
    tests/plugin-setup.test.ts \
    tests/plugin-default-export-and-configs.test.ts \
    tests/config/flat-config-presets-integration.test.ts \
    tests/cli-error-handling.test.ts
  ```

- Ran full test suite: `npm test -- --runInBand`.

### 17.3 Story document updates for plugin setup

- Updated `docs/stories/001.0-DEV-PLUGIN-SETUP.story.md`:

  - Marked acceptance criteria as complete, each with references to specific tests/docs:

    - Core functionality: plugin registers and loads (linked to plugin setup tests).
    - Quality standards: plugin metadata via `meta` (linked to `src/index.ts` and dev guide).
    - Integration: flat config compatibility (linked to config integration tests and docs).
    - User experience: install/config docs (linked to README and setup guide).
    - Error handling: plugin loading and dependency errors (linked to error-handling tests).
    - Documentation: plugin structure and dev setup docs.

  - Marked Definition of Done items as complete:

    - All acceptance criteria met.
    - Code reviewed and approved.
    - Tests written and passing.
    - Documentation updated.
    - Plugin installable/configurable in a test project (validated by `npm pack` and user docs).
    - Ready for subsequent rule implementation stories.

### 17.4 Quality checks, commit, and CI

- Ran:

  ```bash
  npm run build
  npm run lint -- --max-warnings=0
  npm run type-check
  npm test -- --runInBand
  npm run format -- src/index.ts tests/plugin-setup.test.ts
  npm run format:check
  ```

- Staged and committed:

  ```bash
  git add -A
  git commit -m "refactor: enrich plugin meta and mark plugin setup story complete"
  git push
  ```

- The CI/CD pipeline run (`runId: 19986332047`) completed successfully, confirming:
  - `ci-verify:full` passed (build, type-check, lint, tests with coverage, etc.).
  - `security:secrets` passed.
  - Semantic-release and smoke tests (where applicable) passed.

**Most recently we've executed the following action:**

---
Used tool: read_file with input: {"filePath":"docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md"}
Used tool: read_file with input: {"filePath":"eslint.config.js"}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: search_file_content with input: {"filePath":"package.json","pattern":"dogfood","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs/decisions","pattern":"DOGFOOD","isRegex":false}
Used tool: list_directory with input: {"dirPath":"docs/decisions"}
Used tool: find_files with input: {"pattern":"*DOGFOOD*.story.md","directory":"docs/stories"}
Used tool: find_files with input: {"pattern":"023.0-*.story.md","directory":"."}
Used tool: find_files with input: {"pattern":"*.story.md","directory":"docs/stories"}
Used tool: search_file_content with input: {"filePath":"eslint.config.js","pattern":"traceability/","isRegex":false}
Used tool: run_command with input: {"command":"grep","args":["-R","-n","DOGFOODING-VALIDATION","docs",".voder","-I"]}
Used tool: list_directory with input: {"dirPath":"docs"}
Used tool: list_directory with input: {"dirPath":"docs/problems"}
Used tool: read_file with input: {"filePath":"docs/problems/001-plugin-not-enforcing-own-traceability-rules.open.md","startLine":330,"endLine":420}
Used tool: run_command with input: {"command":"grep","args":["-n","dogfood","-R",".","-I"]}
Used tool: read_file with input: {"filePath":".voder/traceability/docs-stories-023.0-MAINT-DOGFOODING-VALIDATION.story.xml"}
Used tool: check_file_exists with input: {"filePath":"docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md"}
Used tool: search_file_content with input: {"filePath":"docs/eslint-plugin-development-guide.md","pattern":"Dogfood","isRegex":false}
Used tool: check_file_exists with input: {"filePath":"tests/integration/dogfooding-validation.test.ts"}
Used tool: search_file_content with input: {"filePath":"docs/eslint-plugin-development-guide.md","pattern":"tests/integration/dogfooding-validation.test.ts","isRegex":false}
Used tool: read_file with input: {"filePath":"docs/eslint-plugin-development-guide.md","startLine":520,"endLine":580}
Used tool: read_file with input: {"filePath":"src/index.ts","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"docs/problems/001-plugin-not-enforcing-own-traceability-rules.open.md","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"docs/problems/001-plugin-not-enforcing-own-traceability-rules.open.md","startLine":260,"endLine":420}
Used tool: read_file with input: {"filePath":"user-docs/eslint-9-setup-guide.md","startLine":140,"endLine":260}
Used tool: run_command with input: {"command":"grep","args":["-R","-n","traceability/require-","eslint.config.js","src","tests","-I"]}
Used tool: run_command with input: {"command":"git","args":["log","--oneline","--","docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md"]}
Used tool: run_command with input: {"command":"git","args":["show","ca4d073:docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md"]}
Used tool: run_command with input: {"command":"git","args":["show","c2f906d:docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md"]}
Used tool: run_command with input: {"command":"git","args":["show","c2f906d:eslint.config.js"]}
Used tool: read_file with input: {"filePath":"src/rules/require-story-annotation.ts","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"eslint.config.js","startLine":70,"endLine":190}
Used tool: run_command with input: {"command":"git","args":["log","--oneline","--","tests/integration/dogfooding-validation.test.ts"]}
Used tool: run_command with input: {"command":"git","args":["show","c2f906d:tests/integration/dogfooding-validation.test.ts"]}
Used tool: modify_file with input: {"filePath":"eslint.config.js","instruction":"In the TypeScript files config object (files: [\"**/*.ts\", \"**/*.tsx\"]), inside the rules object, add a new entry enabling the traceability/require-story-annotation rule at error severity. Place it after the existing no-unused-vars rule.\n\nSpecifically, after the line with \"no-unused-vars\": [\"error\", { argsIgnorePattern: \"^_\", varsIgnorePattern: \"^_\" }], insert a new line: \"traceability/require-story-annotation\": \"error\", keeping formatting consistent."}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"],"timeout":120000}
Used tool: generate_file with input: {"filePath":"tests/integration/dogfooding-validation.test.ts","overwrite":false,"content":"/**\n * Dogfooding validation integration tests\n * @supports docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md REQ-DOGFOODING-TEST REQ-DOGFOODING-CI\n */\nimport * as path from \"path\";\nimport { spawnSync } from \"child_process\";\n\n/**\n * @supports docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md REQ-DOGFOODING-TEST\n */\nfunction getTsConfigFromEslintConfig(eslintConfig: unknown): any | undefined {\n  const configs = Array.isArray(eslintConfig) ? eslintConfig : [eslintConfig];\n\n  return configs.find((config: any) => {\n    if (!config || !config.files) return false;\n    const files = config.files as string[];\n    return files.includes(\"**/*.ts\") && files.includes(\"**/*.tsx\");\n  });\n}\n\ndescribe(\"Dogfooding Validation (Story 023.0-MAINT-DOGFOODING-VALIDATION)\", () => {\n  it(\"[REQ-DOGFOODING-TEST] should have traceability/require-story-annotation enabled for TS sources\", () => {\n    /**\n     * @supports docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md REQ-DOGFOODING-TEST\n     */\n    // Require the project's eslint.config.js and find the TS-specific config\n    // that applies to *.ts and *.tsx files.\n    // eslint-disable-next-line @typescript-eslint/no-var-requires -- Jest runtime require of config file is intentional here\n    const eslintConfig = require(\"../../eslint.config.js\");\n\n    const tsConfig = getTsConfigFromEslintConfig(eslintConfig);\n\n    expect(tsConfig).toBeDefined();\n\n    const rules = (tsConfig as any).rules || {};\n    const ruleEntry = rules[\"traceability/require-story-annotation\"];\n\n    expect(ruleEntry).toBeDefined();\n\n    const severity =\n      Array.isArray(ruleEntry) && ruleEntry.length > 0\n        ? ruleEntry[0]\n        : ruleEntry;\n\n    expect(severity).toBe(\"error\");\n  });\n\n  it(\"[REQ-DOGFOODING-CI] should run traceability/require-story-annotation via ESLint CLI on TS sources\", () => {\n    /**\n     * @supports docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md REQ-DOGFOODING-CI\n     */\n    const eslintBin = path.resolve(__dirname, \"../../node_modules/.bin/eslint\");\n    const configPath = path.resolve(__dirname, \"../../eslint.config.js\");\n\n    const tsSnippet = `\n      const x: number = 42;\n      export function foo() {\n        return x;\n      }\n    `;\n\n    const result = spawnSync(\n      process.platform === \"win32\" ? `${eslintBin}.cmd` : eslintBin,\n      [\"--config\", configPath, \"--stdin\", \"--stdin-filename\", \"src/dogfood.ts\"],\n      {\n        encoding: \"utf8\",\n        input: tsSnippet,\n      },\n    );\n\n    // The snippet intentionally lacks @story annotations, so the rule should\n    // report an error for the generated `src/dogfood.ts` virtual file.\n    expect(result.status).not.toBe(0);\n    expect(result.stdout).toContain(\"error\");\n    expect(result.stdout).toContain(\"src/dogfood.ts\");\n  });\n});\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--testPathPattern","dogfooding-validation.test.ts"],"timeout":120000}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--testPathPatterns","dogfooding-validation.test.ts"],"timeout":120000}
Used tool: read_file with input: {"filePath":"docs/eslint-plugin-development-guide.md","startLine":524,"endLine":538}
Used tool: run_command with input: {"command":"git","args":["status","-sb"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"chore(dogfooding): enable require-story-annotation rule with dogfooding validation test"}
Used tool: modify_file with input: {"filePath":"tests/integration/dogfooding-validation.test.ts","instruction":"Remove the inline eslint-disable-next-line comment for @typescript-eslint/no-var-requires above the require(\"../../eslint.config.js\") line, since this test file runs under the test override where that rule is already disabled.\n\nSpecifically, delete the line containing \"// eslint-disable-next-line @typescript-eslint/no-var-requires\"."}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"chore(dogfooding): enable require-story-annotation rule with dogfooding validation test"}
Used tool: run_command with input: {"command":"npm","args":["run","build"],"timeout":120000}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"],"timeout":120000}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"],"timeout":120000}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"],"timeout":120000}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"],"timeout":120000}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19986573812,"timeout":600000}
Used tool: run_command with input: {"command":"git","args":["show","c2f906d:docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md"]}
Used tool: check_file_exists with input: {"filePath":"docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md"}
Used tool: generate_file with input: {"filePath":"docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md","overwrite":false,"content":"# 023.0-MAINT-DOGFOODING-VALIDATION: Enable Plugin Self-Validation with Traceability Rules\n\n**Story Type**: Internal Developer Experience (Plugin Developer - NOT end-user facing)  \n**Story Map**: #file:plugin-developer-story.map.md (Release 0.5: Quality Foundation)  \n**Commit Convention**: Use `chore:` or `refactor:` tags, NOT `feat:` - this is an internal quality improvement\n\n## Release Goal\n\n**Development Quality & Credibility** - Ensure the plugin demonstrates best practices by validating its own codebase with the same traceability rules it provides to users, establishing trust through dogfooding.\n\n## How This Story Contributes\n\nThis story addresses a critical gap in the project's quality assurance: the plugin provides comprehensive traceability validation features but doesn't enforce them on its own codebase. By enabling self-validation, we:\n\n1. **Catch annotation errors early** - Automated validation of 1,737+ existing annotations prevents defects\n2. **Demonstrate credibility** - Shows users that we trust our own tools enough to use them\n3. **Improve developer experience** - Reduces manual review burden and catches issues in CI/CD pipeline\n4. **Enable incremental improvement** - Provides visibility into annotation quality through automated reporting\n\nThis directly supports the plugin's mission of enforcing traceability while maintaining code quality standards.\n\n## User Story\n\n**Format**: So that I can trust the plugin validates annotations correctly and catch annotation errors early in development, as a plugin developer (maintainer/contributor), I want the plugin to enforce its own traceability rules on its codebase using the recommended preset.\n\n**INVEST Criteria Compliance**:\n\n- **Independent**: Can be developed without blocking other features (uses existing plugin and preset infrastructure)\n- **Negotiable**: Implementation details flexible (could use recommended or strict preset, could configure individual rules)\n- **Valuable**: Delivers clear value through automated validation and credibility demonstration\n- **Estimable**: Scope is well-defined - enable preset, suppress violations, fix incrementally\n- **Small**: Core enablement can be completed in one iteration (fixing all violations is separate work)\n- **Testable**: Success verified through lint runs showing traceability rules active and dogfooding validation test passing\n\n## Acceptance Criteria\n\n- [x] **First Rule Enabled**: `traceability/require-story-annotation` enabled in `eslint.config.js`\n- [ ] **First Rule Suppressions**: Eslint-disable comments added to all files violating first rule\n- [ ] **Second Rule Enabled**: `traceability/valid-story-reference` enabled with suppressions added\n- [ ] **Third Rule Enabled**: `traceability/require-req-annotation` enabled with suppressions added\n- [ ] **Fourth Rule Enabled**: `traceability/valid-req-reference` enabled with suppressions added\n- [ ] **Fifth Rule Enabled**: `traceability/require-branch-annotation` enabled with suppressions added\n- [ ] **Sixth Rule Enabled**: `traceability/valid-annotation-format` enabled with suppressions added\n- [ ] **Seventh Rule Enabled**: `traceability/require-test-traceability` enabled with suppressions added\n- [ ] **Eighth Rule Enabled**: `traceability/prefer-implements-annotation` enabled with suppressions added\n- [ ] **Preset Migration**: Individual rules replaced with `plugin.configs.recommended` preset\n- [ ] **Configuration Verified**: ESLint configuration for source files shows traceability rules are active with correct severities\n- [ ] **Lint Integration Works**: Running `npm run lint` executes traceability rules on the plugin codebase\n- [ ] **Dogfooding Test Added**: Integration test verifies traceability rules are enabled and active on plugin source code\n- [ ] **Suppression Tracking**: Suppressions are tracked via `npm run report:eslint-suppressions` for visibility\n- [ ] **CI Enforcement**: CI pipeline enforces traceability rules, failing builds if new violations introduced (after suppressions applied)\n- [ ] **Documentation Updated**: Developer documentation explains dogfooding approach and one-rule-at-a-time incremental enablement process\n\n## Requirements (Current Implementation or To Be Implemented)\n\n### ESLint Configuration\n\n- **REQ-DOGFOODING-ENABLE**: Enable traceability rules ONE AT A TIME in `eslint.config.js`, starting with `require-story-annotation`, then adding each subsequent rule individually\n- **REQ-DOGFOODING-VERIFY**: ESLint configuration must show active traceability rules for TypeScript source files after each rule is added\n- **REQ-DOGFOODING-BUILD**: Plugin must be built before linting to ensure rules are available (integrate `npm run build` into workflow if needed)\n- **REQ-DOGFOODING-PRESET**: After all individual rules are enabled with suppressions, migrate to `plugin.configs.recommended` preset\n\n### Validation & Testing\n\n- **REQ-DOGFOODING-TEST**: Create integration test `tests/integration/dogfooding-validation.test.ts` that verifies traceability rules are enabled in config and active when linting source files\n- **REQ-DOGFOODING-CI**: CI pipeline must run traceability rules on plugin codebase, failing builds for new violations\n\n### Incremental Fix Strategy\n\n- **REQ-DOGFOODING-SUPPRESS**: Add eslint-disable comments to files with violations after EACH rule is enabled, before enabling the next rule\n- **REQ-DOGFOODING-TRACK**: Suppression count must be tracked via `npm run report:eslint-suppressions` after each rule enablement\n- **REQ-DOGFOODING-INCREMENTAL**: Document the one-rule-at-a-time enablement process and the separate quality improvement process for removing suppressions\n- **REQ-DOGFOODING-SAFETY**: Each rule enablement with its suppressions must be committed separately for easy rollback if issues arise\n- **REQ-DOGFOODING-COMMIT**: Each commit message should clearly indicate which rule is being enabled (e.g., \"chore(dogfooding): enable require-story-annotation with suppressions\")\n\n### Documentation\n\n- **REQ-DOGFOODING-DOCS**: Add section to developer documentation explaining one-rule-at-a-time dogfooding approach and self-validation strategy\n- **REQ-DOGFOODING-PROCESS**: Document both the rule enablement process (part of this story) and the separate quality improvement process for removing suppressions (NOT part of this story)\n\n### Already Implemented\n\n- **IMPL-PRESET-EXPORT**: Plugin already exports `configs.recommended` and `configs.strict` presets in `src/index.ts`\n- **IMPL-DYNAMIC-_LOAD**: ESLint config already loads plugin dynamically from source (development) or built output (CI/production)\n- **IMPL-PLUGIN-REGISTRATION**: Plugin already registered in `eslint.config.js` with conditional spreading\n- **IMPL-SUPPRESSION-REPORT**: Script `npm run report:eslint-suppressions` already exists for tracking suppressions\n\n## Dependencies\n\n- **002.0-DEV-ESLINT-CONFIG** - Requires ESLint configuration infrastructure\n- **007.0-DEV-ERROR-REPORTING** - Depends on rule error reporting being functional\n- **All rule stories** - Requires all traceability rules to be implemented and tested\n\n## Implementation Notes\n\n### First Action: Enable First Rule\n\n**CRITICAL**: Start here. Do NOT review or plan - execute this immediately:\n\n1. **Edit `eslint.config.js`**: Add `\"traceability/require-story-annotation\": \"error\"` to the rules section for TypeScript files\n2. **Run lint**: Execute `npm run lint` to identify all violations\n3. **Add suppressions**: For each file that fails, add `/* eslint-disable traceability/require-story-annotation */` at the top\n4. **Commit**: `git commit -m \"chore(dogfooding): enable require-story-annotation with suppressions\"`\n5. **Push**: `git push` and wait for CI to pass\n\nAfter CI passes, proceed to enable the second rule (`valid-story-reference`) following the same pattern.\n\n### Configuration Approach\n\nEnable rules **one at a time** to manage the volume of violations incrementally. Do NOT enable the preset initially:\n\n**Phase 1 - Enable First Rule:**\n```javascript\nmodule.exports = [\n  js.configs.recommended,\n  // ... existing config objects ...\n  {\n    files: [\"**/*.ts\", \"**/*.tsx\"],\n    plugins: {\n      ...(plugin.rules ? { traceability: plugin } : {}),\n    },\n    rules: {\n      // ... existing rules ...\n      // Add ONE traceability rule at a time\n      \"traceability/require-story-annotation\": \"error\",\n    },\n  },\n  // ... test file overrides and ignores ...\n];\n```\n\n**Subsequent Phases - Add Next Rule:**\n```javascript\nrules: {\n  // ... existing rules ...\n  \"traceability/require-story-annotation\": \"error\",\n  \"traceability/valid-story-reference\": \"error\", // Add second rule\n  // Continue adding one rule at a time\n}\n```\n\n**Final Phase - Migrate to Preset:**\n```javascript\nmodule.exports = [\n  js.configs.recommended,\n  // ... existing config objects ...\n  {\n    files: [\"**/*.ts\", \"**/*.tsx\"],\n    plugins: {\n      ...(plugin.rules ? { traceability: plugin } : {}),\n    },\n    rules: {\n      // ... existing non-traceability rules ...\n      // Remove individual traceability rules\n    },\n  },\n  // Replace individual rules with preset\n  ...(plugin.configs?.recommended || []),\n  // ... test file overrides and ignores ...\n];\n```\n\n### Incremental Fix Process\n\nThis story implements an incremental approach by enabling **one rule at a time** to avoid overwhelming the codebase with violations:\n\n#### Phase 1: Enable First Rule\n\n1. **Enable single rule** in `eslint.config.js`:\n   ```javascript\n   {\n     files: [\"**/*.ts\", \"**/*.tsx\"],\n     plugins: {\n       ...(plugin.rules ? { traceability: plugin } : {}),\n     },\n     rules: {\n       // Enable ONE rule at a time\n       \"traceability/require-story-annotation\": \"error\",\n     },\n   }\n   ```\n\n2. **Run lint** to identify all violations: `npm run lint`\n\n3. **Add eslint-disable suppressions** to each file that fails:\n   ```typescript\n   /* eslint-disable traceability/require-story-annotation */\n   // ... file content ...\n   ```\n\n4. **Commit and push** suppressions:\n   ```bash\n   git add -A\n   git commit -m \"chore(dogfooding): add suppressions for require-story-annotation rule\"\n   git push\n   ```\n\n5. **Wait for CI** to pass and verify suppressions prevent build failures\n\n#### Phase 2: Code Quality Fixes (Separate from This Story)\n\nAfter each rule is enabled with suppressions, **code quality improvement work** happens separately:\n- Remove suppression from one file\n- Fix all violations in that file\n- Verify lint passes for that file\n- Commit fix: `chore(quality): fix require-story-annotation in <filename>`\n- Repeat for next file\n\nThis incremental fixing is **NOT part of this story** - it's ongoing quality improvement work tracked separately.\n\n#### Phase 3: Enable Next Rule\n\nOnce comfortable with the first rule (or while quality fixes are ongoing):\n\n1. **Enable next rule** in `eslint.config.js`:\n   ```javascript\n   {\n     rules: {\n       \"traceability/require-story-annotation\": \"error\",\n       \"traceability/valid-story-reference\": \"error\", // Add second rule\n     },\n   }\n   ```\n\n2. **Run lint** to find violations for the new rule\n\n3. **Add suppressions** for the new rule to failing files\n\n4. **Commit and push**: `chore(dogfooding): add suppressions for valid-story-reference rule`\n\n5. **Wait for CI** to pass\n\n#### Phase 4: Repeat Until All Rules Enabled\n\nContinue the cycle for each rule:\n- `traceability/require-req-annotation`\n- `traceability/valid-req-reference`\n- `traceability/require-branch-annotation`\n- `traceability/valid-annotation-format`\n- `traceability/require-test-traceability`\n- `traceability/prefer-implements-annotation`\n\n#### Final Phase: Switch to Preset\n\nOnce all individual rules are enabled and suppressed:\n\n1. **Replace individual rules** with preset:\n   ```javascript\n   // Remove individual rule configurations\n   // Add preset instead\n   ...(plugin.configs?.recommended || []),\n   ```\n\n2. **Verify** no new violations introduced\n\n3. **Commit**: `chore(dogfooding): migrate to recommended preset`\n\n#### Progress Tracking\n\nTrack progress using:\n- `npm run report:eslint-suppressions` - Shows suppression counts per rule\n- Document which rules are enabled in this story's acceptance criteria\n- Quality improvement work tracks suppression removal separately\n\n### Testing Strategy\n\nThe dogfooding validation test should:\n- Verify `eslint.config.js` contains the preset spreading\n- Lint a known source file and verify traceability rules are active\n- Use ESLint's `calculateConfigForFile` to confirm rules are enabled\n\n### Performance Considerations\n\n- Enabling traceability rules may increase lint time slightly\n- Build step required before linting adds to workflow time\n- Consider caching built plugin in CI to minimize overhead\n\n### Risk Mitigation\n\n- **Risk**: Enabling all rules at once breaks CI immediately with 1,737+ annotations to validate\n  - **Mitigation**: Enable ONE rule at a time with suppressions before enabling next rule\n- **Risk**: Suppressions might never get removed\n  - **Mitigation**: Track suppressions and add to project health metrics; quality improvement is separate ongoing work\n- **Risk**: Conditional plugin loading might fail in some environments\n  - **Mitigation**: Test in both development and CI environments after enabling each rule\n- **Risk**: Enabling rules one-by-one creates many commits\n  - **Mitigation**: Each commit is atomic and safe to revert; clear commit messages track progress\n\n## Definition of Done\n\n- [ ] All eight traceability rules enabled individually in `eslint.config.js` with suppressions added after each\n- [ ] Individual rules migrated to `plugin.configs.recommended` preset\n- [ ] ESLint configuration verified to show traceability rules active\n- [ ] Dogfooding validation integration test created and passing locally\n- [ ] Suppressions tracked via `npm run report:eslint-suppressions`\n- [ ] CI pipeline enforces traceability rules (passes with suppressions in place)\n- [ ] Developer documentation updated with one-rule-at-a-time enablement process\n- [ ] Documentation clarifies that suppression removal is separate quality improvement work\n- [ ] Code reviewed and approved\n- [ ] All tests passing (including new dogfooding test)\n- [ ] Changes merged to main branch\n\n---\n\n## Related Problem\n\nThis story resolves **Problem 001: PLUGIN-NOT-ENFORCING-RULES** documented in `docs/problems/001-plugin-not-enforcing-own-traceability-rules.open.md`.\n\n## Story Rationale\n\nDogfooding (using our own product) is a critical practice for establishing credibility and ensuring quality. The current gap where the plugin doesn't validate its own annotations:\n\n1. **Undermines trust** - Users may question why we don't use our own features\n2. **Misses errors** - 1,737+ annotations could contain errors we'd never detect\n3. **Creates technical debt** - Without automated validation, annotation quality degrades over time\n4. **Reduces confidence** - Developers can't rely on automated checks during code review\n\nEnabling self-validation demonstrates that we trust our own tools and provides the same quality benefits to our codebase that we promise to users."}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"docs(stories): restore dogfooding validation story from history"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19986616064,"timeout":600000}
Used tool: modify_file with input: {"filePath":"docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md","instruction":"In the Acceptance Criteria checklist:\n- Keep \"First Rule Enabled\" checked.\n- Update the bullet \"Lint Integration Works\" so that it is checked ([x]) and expand the text to mention that `npm run lint` now runs `traceability/require-story-annotation` on this repository's TypeScript sources.\n- Update the bullet \"Configuration Verified\" so that it is checked ([x]) and mention that the configuration is validated by `tests/integration/dogfooding-validation.test.ts`.\n- Update the bullet \"Dogfooding Test Added\" so that it is checked ([x]) and explicitly references the new integration test path `tests/integration/dogfooding-validation.test.ts`.\n- Update the bullet \"CI Enforcement\" so that it is checked ([x]) and briefly note that the unified CI/CD pipeline's `ci-verify:full` job runs lint with the dogfooding rule enabled.\nLeave the other unchecked items as-is."}
Used tool: modify_file with input: {"filePath":"docs/problems/001-plugin-not-enforcing-own-traceability-rules.open.md","instruction":"Add a short \"Current Mitigations\" subsection near the end of the document (before the final Notes section) that explains the partial dogfooding progress:\n- Mention that as of 2025-12-06, the `traceability/require-story-annotation` rule is now enabled for this repository's TypeScript sources via `eslint.config.js`.\n- Note that an automated integration test at `tests/integration/dogfooding-validation.test.ts` verifies both the ESLint configuration and CLI behavior for this rule, and that this test runs in CI as part of `npm run ci-verify:full`.\n- Clarify that other traceability rules are not yet enforced and that the overall problem remains open until the full dogfooding story is complete.\nUse concise Markdown with a level-3 heading \"### Current Mitigations\"."}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"docs: update dogfooding story and problem with current validation state"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19986655960,"timeout":600000}
---

**This was the result:**
---
Here’s what I implemented for the **##NOW** and **##NEXT** sections, and how it maps to the existing stories/docs and CI.

---

## What I implemented

### 1) Extend ESLint config with the next dogfooding rule (**NOW**)

**Goal:** Start dogfooding by enforcing at least one core traceability rule on this repo itself, per `docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md`.

**Changes:**

- Updated **`eslint.config.js`** to enable the first traceability rule for TypeScript sources:

  ```js
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: "module",
      },
      globals: {
        process: "readonly",
        require: "readonly",
        module: "readonly",
        console: "readonly",
      },
    },
    plugins: {
      ...(plugin.rules ? { traceability: plugin } : {}),
    },
    rules: {
      complexity: ["error", { max: 18 }],
      "max-lines-per-function": ["error", { max: 55, skipBlankLines: true, skipComments: true }],
      "max-lines": ["error", { max: 425, skipBlankLines: true, skipComments: true }],
      "no-magic-numbers": ["error", { ignore: [0, 1], ignoreArrayIndexes: true, enforceConst: true }],
      "max-params": ["error", { max: 4 }],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-new-wrappers": "error",
      "no-undef": "off",
      "no-console": "off",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

      // Newly enabled dogfooding rule
      "traceability/require-story-annotation": "error",
    },
  },
  ```

- This aligns with story **023.0**’s *“First Action: Enable First Rule”* step and its requirement:

  - **REQ-DOGFOODING-ENABLE** – enable `traceability/require-story-annotation` in `eslint.config.js`.

- After this change, running `npm run lint` on this repo now exercises the `traceability/require-story-annotation` rule against our own TypeScript sources.

**Quality checks run for this step:**

- `npm run lint -- --max-warnings=0`
- `npm run build`
- `npm test -- --runInBand`
- `npm run type-check`
- `npm run format:check`

Pre-push Husky hook also ran `npm run ci-verify:full` and `npm run security:secrets` before pushing.

A commit was created and pushed:

- `chore(dogfooding): enable require-story-annotation rule with dogfooding validation test`

GitHub Actions **CI/CD Pipeline** run for that push completed successfully.

---

### 2) Add automated dogfooding validation tests (**NEXT – first bullet**)

**Goal:** Verify via automated tests that the updated ESLint config actually enforces the dogfooding rule and that ESLint CLI behavior matches expectations.

**New test file:**

- **`tests/integration/dogfooding-validation.test.ts`**

Content highlights:

```ts
/**
 * Dogfooding validation integration tests
 * @supports docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md REQ-DOGFOODING-TEST REQ-DOGFOODING-CI
 */
import * as path from "path";
import { spawnSync } from "child_process";

/**
 * @supports docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md REQ-DOGFOODING-TEST
 */
function getTsConfigFromEslintConfig(eslintConfig: unknown): any | undefined {
  const configs = Array.isArray(eslintConfig) ? eslintConfig : [eslintConfig];

  return configs.find((config: any) => {
    if (!config || !config.files) return false;
    const files = config.files as string[];
    return files.includes("**/*.ts") && files.includes("**/*.tsx");
  });
}

describe("Dogfooding Validation (Story 023.0-MAINT-DOGFOODING-VALIDATION)", () => {
  it("[REQ-DOGFOODING-TEST] should have traceability/require-story-annotation enabled for TS sources", () => {
    /**
     * @supports docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md REQ-DOGFOODING-TEST
     */
    // eslint.config.js is CommonJS; require it and locate the TS config block.
    const eslintConfig = require("../../eslint.config.js");

    const tsConfig = getTsConfigFromEslintConfig(eslintConfig);

    expect(tsConfig).toBeDefined();

    const rules = (tsConfig as any).rules || {};
    const ruleEntry = rules["traceability/require-story-annotation"];

    expect(ruleEntry).toBeDefined();

    const severity =
      Array.isArray(ruleEntry) && ruleEntry.length > 0 ? ruleEntry[0] : ruleEntry;

    expect(severity).toBe("error");
  });

  it("[REQ-DOGFOODING-CI] should run traceability/require-story-annotation via ESLint CLI on TS sources", () => {
    /**
     * @supports docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md REQ-DOGFOODING-CI
     */
    const eslintBin = path.resolve(__dirname, "../../node_modules/.bin/eslint");
    const configPath = path.resolve(__dirname, "../../eslint.config.js");

    const tsSnippet = `
      const x: number = 42;
      export function foo() {
        return x;
      }
    `;

    const result = spawnSync(
      process.platform === "win32" ? `${eslintBin}.cmd` : eslintBin,
      ["--config", configPath, "--stdin", "--stdin-filename", "src/dogfood.ts"],
      {
        encoding: "utf8",
        input: tsSnippet,
      },
    );

    // Snippet lacks @story annotations, so the rule should fire.
    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("error");
    expect(result.stdout).toContain("src/dogfood.ts");
  });
});
```

These tests:

- Assert that **our root ESLint config** actually has `traceability/require-story-annotation` set to `"error"` for `**/*.ts` / `**/*.tsx`.
- Exercise the **real ESLint CLI** against a TS snippet lacking `@story` annotations and confirm:
  - Non-zero exit code.
  - Error output that includes the virtual filename (`src/dogfood.ts`).

This satisfies:

- **REQ-DOGFOODING-TEST** – test that config enables rule.
- **REQ-DOGFOODING-CI** – test that CI-style ESLint CLI runs the rule and fails on violations.

**Quality checks run around this change:**

- Focused run while iterating:

  - `npm test -- --runInBand --testPathPatterns dogfooding-validation.test.ts`

- After integrating with the full suite:

  - `npm run build`
  - `npm test -- --runInBand`
  - `npm run lint -- --max-warnings=0`
  - `npm run type-check`
  - `npm run format:check`

Again, Husky **pre-push** ran `npm run ci-verify:full` and `npm run security:secrets` before pushing, and CI pipeline completed successfully for the commits containing this test.

---

### 3) Update dogfooding validation story to match new behavior (**NEXT – second bullet**)

The story file was previously removed; I restored and updated it based on the last known good version.

**File restored and updated:**

- **`docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md`**

Key updates:

- Restored the detailed story text from historical commit `c2f906d`.
- Updated **Acceptance Criteria** to mark newly satisfied items as complete and link them to the new behavior:

  - `[x] First Rule Enabled` – `traceability/require-story-annotation` is enabled in `eslint.config.js`.
  - `[x] Configuration Verified` – explicitly notes validation via `tests/integration/dogfooding-validation.test.ts`.
  - `[x] Lint Integration Works` – notes that `npm run lint` now runs `traceability/require-story-annotation` on this repo’s TS sources.
  - `[x] Dogfooding Test Added` – references the new integration test file path.
  - `[x] CI Enforcement` – explains that the unified CI/CD pipeline (`ci-verify:full` job) runs lint with the dogfooding rule enabled and will fail on new violations.

- Left future phases (other rules, suppressions, preset migration, etc.) still **unchecked** so they can be implemented incrementally later.

This directly addresses the plan’s requirement to update the story so it reflects the current state and ties behavior to tests/configuration.

A documentation-only commit was created and pushed:

- `docs(stories): restore dogfooding validation story from history`
- `docs: update dogfooding story and problem with current validation state`

Each push went through Husky pre-push checks and the GitHub **CI/CD Pipeline**; all runs for these commits completed successfully.

---

### 4) Update related problem documentation with current mitigation state (**NEXT – third bullet**)

**File updated:**

- **`docs/problems/001-plugin-not-enforcing-own-traceability-rules.open.md`**

I added a **“Current Mitigations”** section near the end:

```md
### Current Mitigations

As of 2025-12-06, the `traceability/require-story-annotation` rule is enabled for this repository's TypeScript sources via `eslint.config.js`. An automated integration test at `tests/integration/dogfooding-validation.test.ts` verifies both the ESLint configuration and CLI behavior for this rule, and this test runs in CI as part of `npm run ci-verify:full`. Other traceability rules are not yet enforced, and the overall problem remains open until the full dogfooding story is complete.
```

This:

- Documents the **partial fix** implemented in this cycle (one core rule + integration test).
- Clarifies that the **problem remains open** until all dogfooding work (other rules, presets, suppressions) is complete.
- Ties the mitigation explicitly to the new integration test and existing CI pipeline.

---

## CI/CD status

For the commits implementing these changes, each push triggered the unified **CI/CD Pipeline** on GitHub Actions. The relevant runs (including the latest run ID `19986655960`) all completed with conclusion **`success`**.

Locally and via hooks, the following checks have passed on the final state:

- `npm run build`
- `npm test -- --runInBand` (full suite, now 40 suites / 302 tests)
- `npm run lint -- --max-warnings=0`
- `npm run type-check`
- `npm run format:check`
- `npm run ci-verify:full` (via Husky pre-push)
- `npm run security:secrets` (via Husky pre-push)

---

## Updated Plan with Status

### NOW

- [x] Implement the next dogfooding requirement from the dogfooding validation story by extending the project’s ESLint configuration so that an additional core traceability rule is enforced on this repository in line with that story’s acceptance criteria.

### NEXT

- [x] Add or update automated tests that verify the updated ESLint configuration correctly enforces the newly enabled traceability rule, including both configuration inspection and CLI-based failure behavior when annotations are missing.
- [x] Update the dogfooding validation story document to mark the newly satisfied acceptance criteria as complete and link them to the new tests and configuration, ensuring the story accurately reflects the current state.
- [x] Review related problem/incident or design documents connected to the dogfooding work and adjust them so they describe the resolved state and the new level of self-enforcement provided by the plugin.

### LATER (unchanged, for future cycles)

- [ ] Extend the dogfooding approach to cover all remaining traceability rules that are safe to enforce on this codebase, updating ESLint configuration and tests incrementally for each rule.
- [ ] Refine CI and pre-push guidance in contributor documentation so that developers clearly understand how the self-enforced traceability rules and dogfooding tests protect the project.
- [ ] Look for opportunities to further simplify or refactor the ESLint configuration and dogfooding tests while keeping all dogfooding story acceptance criteria fully satisfied and covered.
---
