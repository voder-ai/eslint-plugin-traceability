Here’s a history‑only summary of what’s been done on the project so far, including the most recent actions:

---

### Migration to `@supports` and unified traceability

- Introduced an `@supports`‑first migration path from legacy `@story` / `@req` via the `traceability/prefer-supports-annotation` rule.
- Automatically migrated simple legacy annotations in block comments, JSDoc, and line comments, adding a `LineComment` abstraction and updating tests and docs.
- Implemented a unified `traceability/require-traceability` rule that combines function‑level and branch‑level requirements.
- Converted `require-story-annotation` and `require-req-annotation` into aliases powered by a shared alias engine (`createAliasRule`, `createAliasRuleMeta`), and updated exports, presets, and documentation to foreground the unified rule.
- Tightened annotation handling with a `valid-annotation-format` rule and helpers to enforce whitespace rules and handle multi‑line and mixed `@req` + `@supports` cases.

---

### Function and branch annotation behavior

- Extended `traceability/require-branch-annotation` to cover:
  - `switch` statements (including grouped fallthrough and `default`),
  - loops (`for`, `while`, etc.),
  - `else-if` chains.
- Added `REQ-SWITCH-FALLTHROUGH` trace handling and refactored branch comment gathering to better match real AST patterns, restoring `else-if` autofix behavior.
- Enhanced function‑level rules to:
  - include arrow functions and nested/anonymous callbacks,
  - inherit annotations from parent scopes,
  - exclude test framework callbacks by default.
- Implemented `test-callback-exclusion` helpers to:
  - detect Jest/Mocha/Vitest helpers (including focused/skipped/alias variants) but not Vitest `bench`,
  - correctly handle nested callbacks inside excluded callbacks and treat local wrapper helpers as non‑excluded,
  - support `excludeTestCallbacks` (default `true`) and `additionalTestHelperNames` options.

---

### Redundant-annotation handling and scope analysis

- Strengthened the `no-redundant-annotation` rule using refactored helpers:
  - `getStatementPairsForRedundancy`,
  - `isStatementRedundantWithinScope`,
  - `getAnnotationCommentsFromStatement`,
  - `getRedundantStatementContext`.
- Clarified guarantees in the migration guide.
- Added `[REQ-SAFE-REMOVAL]` tests and broadened edge‑case coverage for comment removal, including EOF and invalid range scenarios.
- Increased test coverage for `annotation-scope-analyzer` and `branch-annotation-helpers` (notably `SwitchCase`, `CatchClause`, and loop constructs).

---

### Documentation and story alignment

- Updated README, API reference, examples, migration guide, ESLint 9 setup docs, and added `traceability-overview.md` plus an FAQ:
  - Emphasized `@supports`‑first usage.
  - Highlighted `require-traceability` and its aliases.
  - Explained redundant‑annotation cleanup and error severity (`no-redundant-annotation`, `REQ-ERROR-SEVERITY`).
  - Documented CLI test isolation and config presets.
- Aligned documentation and `src/index.ts` exports with the unified rule model and canonical names.
- Completed and documented the function‑annotations story (`003.0-DEV-FUNCTION-ANNOTATIONS`):
  - Closed GitHub issue #5 after release `v1.17.0`.
  - Recorded exact `gh` commands and expected outputs in that story’s Acceptance Criteria and DoD.

---

### Test, integration, and coverage work

- Expanded Jest coverage for:
  - `annotation-checker`,
  - `annotation-scope-analyzer`,
  - `branch-annotation-helpers`,
  - `require-story-utils.getNodeName`,
  - `test-callback-exclusion` helpers.
- Added integration tests:
  - `require-traceability-aliases.integration.test.ts` to validate the unified rule and aliases with shared fixtures and diagnostic assertions.
  - `require-traceability-test-callbacks.integration.test.ts` to cover:
    - combined `require-traceability` + `require-story-annotation`,
    - `describe`/`it` handling,
    - Vitest `bench`,
    - custom test helpers and `additionalTestHelperNames`,
    - annotation inheritance and exclusion behavior.
- Ensured tests reference appropriate stories and requirement IDs in headers and test names.

---

### Linting, complexity limits, and refactors

- Tightened ESLint complexity thresholds:
  - reduced cyclomatic complexity limit to 16,
  - lowered `max-lines-per-function` from 55 to 45.
- Refactored oversized helpers into smaller units, including:
  - wiring helpers in `src/index.ts` (`wireUnifiedFunctionAnnotationAliases`, `wirePreferSupportsAlias`) and alias meta creation,
  - `valid-annotation-format` internals (restored `collapseAnnotationValue` and refined whitespace/embedded `@supports` validation),
  - `prefer-implements-annotation` internals (`collectReqIndicesAfterStory`, `advanceInlineGroupIndex`, etc.) to clarify inline group handling.
- Tightened typings in `test-callback-exclusion.ts` with `TraceabilityNodeWithParent` and more precise `TSESTree` call expression types.

---

### Versioning, CI/CD, and contributing processes

- Updated dependencies (including `ts-jest`) and the lockfile, and documented dependency health.
- Evolved CI/CD workflows and semantic-release configuration toward:
  - trunk-based development on `main`,
  - Conventional Commits,
  - CI-only releases,
  - a clarified Node version matrix, secret scanning, and `ci-verify:full` behavior.
- Added/updated ADRs:
  - ADR 014 (version control and release strategy),
  - ADR 006 (CI/CD details),
  - ADR 013 (test-callback exclusion coverage and Vitest `bench` handling).
- Updated `CONTRIBUTING.md` for the unified CI/CD workflow and semantic-release usage.
- Validated CI behavior with controlled failing runs (e.g., intentional lint/format failures while build/tests/type-check passed).

---

### Maintenance CLI and tooling traceability

- Ensured all maintenance CLI tools are fully traced:
  - `src/maintenance/cli.ts` uses inline `@supports` on `switch` cases, help/usage handling, unknown command branches, and error handlers.
  - `src/maintenance/commands.ts` functions (`handleDetect`, `handleVerify`, `handleReport`, `handleUpdate`) carry `@supports` for `REQ-MAINT-*`.
  - `src/maintenance/report.ts` uses `@supports` on success vs. stale-annotations branches to distinguish `REQ-MAINT-SAFE` from `REQ-MAINT-REPORT`.
  - `src/maintenance/update.ts` annotates per-file update helpers, directory existence checks, and per-file iteration loops.
  - `src/maintenance/index.ts` module-level JSDoc aggregates `@supports` for the maintenance tool surface.

---

### Plugin wiring and traceability annotations

- Enriched JSDoc and inline `@supports` in `src/index.ts` so that:
  - `createAliasRuleMeta` and `wireUnifiedFunctionAnnotationAliases` reference:
    - story `003.0-DEV-FUNCTION-ANNOTATIONS` (`REQ-ANNOTATION-REQUIRED`, `REQ-EXPORT-PRIORITY`),
    - unified function rule and alias engine story `010.4-DEV-UNIFIED-FUNCTION-RULE-AND-ALIASES` (`REQ-UNIFIED-ALIAS-ENGINE`).
  - `wirePreferSupportsAlias` references:
    - `010.3-DEV-MIGRATE-TO-SUPPORTS` / `REQ-RULE-NAME`,
    - `010.4` / `REQ-MIGRATION-RULE-NAMING`.
  - `createTraceabilityFlatConfig` references:
    - error-reporting story `007.0-DEV-ERROR-REPORTING` / `REQ-ERROR-SEVERITY`,
    - ESLint config presets story `002.0-DEV-ESLINT-CONFIG` / `REQ-CONFIG-PRESETS`.
  - Existing plugin metadata `@supports` tags (e.g., `REQ-PLUGIN-STRUCTURE`, `REQ-NPM-PACKAGE`) remain in place.

---

### Continuous quality verification

- Repeatedly ran the full quality suite after substantial changes:
  - `npm test` (often with `--runInBand` / `--bail`),
  - `npm run lint -- --max-warnings=0`,
  - `npm run type-check`,
  - `npm run build`,
  - `npm run format` / `npm run format:check`,
  - duplication and traceability checks.
- Used targeted runs (e.g., `ci-verify:fast`, specific integration tests) for focused validation.
- Regularly confirmed a clean Git status, committed with conventional messages, and pushed to `main`.
- Verified that GitHub “CI/CD Pipeline” workflows consistently completed successfully.

---

### `valid-annotation-format` rule and Voder metadata

- Enabled `valid-annotation-format` in the lint configuration and added targeted suppressions where needed so current files passed.
- Updated malformed or legacy annotations in helper modules to comply with the new format, then removed suppressions where possible.
- Refactored a duplicated helper pattern in traceability rule helpers into a shared function to reduce duplication without increasing complexity.
- Aligned remaining mixed `@story`/`@req` annotations on core rule entry points with the `@supports`‑first style.
- Committed Voder metadata updates (`.voder/history.md`, `.voder/implementation-progress.md`, `.voder/last-action.md`, `.voder/plan.md`, and related CSV/PNG files) under `chore: update voder metadata for valid-annotation-format rule work`.
- Ran the full local quality suite and confirmed GitHub `CI/CD Pipeline` run `20080702255` completed successfully.

---

### Test isolation and `annotation-checker` tests

- Used repo inspection helpers to review:
  - existing `annotation-checker` tests,
  - performance tests under `tests/perf`,
  - maintenance detection logic and tests (`src/maintenance/detect.ts`, `src/maintenance/utils.ts`, `tests/maintenance/detect-isolated.test.ts`),
  - Jest configuration.
- Added `tests/utils/annotation-checker-autofix-behavior.test.ts`:
  - Focused on autofix behavior of `checkReqAnnotation`.
  - Mocked `reqAnnotationDetection.hasReqAnnotation` to always return `false`.
  - Mocked `require-story-utils.getNodeName` to return `"mockName"`.
  - Introduced a `createContextStub` helper to capture `context.report` calls.
  - Verified autofix targets for nodes with no parent, methods, variable initializers, expression statements, and the no-fix case when `enableFix: false`.
  - Tagged tests with `REQ-ANNOTATION-AUTOFIX` and `REQ-ANNOTATION-REPORTING`.
- Removed `tests/utils/annotation-checker-branches.test.ts` to avoid duplication and improve behavior-focused naming.
- Refactored performance maintenance tests for isolation:
  - `tests/perf/maintenance-large-workspace.test.ts`: each test now creates and cleans up its own large workspace using `createLargeWorkspace()` and `cleanup()` in `finally`.
  - `tests/perf/maintenance-cli-large-workspace.test.ts`: each test now creates its own CLI workspace, manages `process.cwd()` locally, and calls `cleanup()` in `finally`, retaining existing CLI command logic and assertions.
- Strengthened permission-handling coverage in `tests/maintenance/detect-isolated.test.ts`:
  - Replaced actual filesystem permission changes with `fs.readFileSync` stubbing using `jest.spyOn`.
  - Simulated an `EACCES` error only for a specific file, delegated to the real implementation otherwise.
  - Verified `detectStaleAnnotations` does not throw, and returns an empty array on the simulated permission error.
- Audited loops and conditionals in tests by searching for `for (`:
  - Confirmed remaining loops are either:
    - performance-oriented data generators in `tests/perf/*`,
    - code snippets embedded in test strings for lint rule inputs,
    - a simple cleanup loop in `valid-story-reference` tests.
  - Determined no additional refactors were needed for non‑performance tests.
- Ran the full quality suite:
  - `npm test -- --runInBand --ci`,
  - `npm run lint -- --max-warnings=0`,
  - `npm run type-check`,
  - `npm run format:check` (plus targeted `npm run format` on modified tests),
  - `npm run build`.
- Staged, committed, and pushed with message:
  - `test: rename annotation checker and improve maintenance test isolation`.
- Confirmed GitHub `CI/CD Pipeline (main)` run `20081726107` completed successfully.

---

### Dependency/tooling update: Prettier 3.7.4

- Inspected `package.json` devDependencies.
- Updated `prettier` from `^3.6.2` to `^3.7.4` in `package.json`.
- Ran `npm install` to regenerate `package-lock.json`:
  - Reported 1 package changed, 981 packages audited, 0 vulnerabilities.
- Ran verification commands:
  - `npm run format` (Prettier `--write .`) → all files unchanged, confirming style compatibility.
  - `npm run build` (TypeScript compile) → success.
  - `npm test -- --runInBand` → all tests passed.
  - `npm run lint` with `--max-warnings=0` → success.
  - `npm run type-check` (`tsc --noEmit`) → success.
  - `npm run format:check` → all files conformed to Prettier 3.7.4.
- Staged and committed:
  - `git add -A`
  - `git commit -m "build: update prettier to 3.7.4"`
- Pushed to `main` and monitored CI:
  - Workflow run `20091128834` on `main` completed successfully, with `ci-verify:full`, `security:secrets`, and semantic-release all passing and no new release triggered.

---

### Most recent actions: Story 027.0 and GitHub issue #6 closure

- Checked Git status and opened `docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md` for context.
- Queried GitHub for the state of issue #6:
  - `gh issue view 6 --json state,stateReason,closedAt --jq .state` → `OPEN`.
- Determined the latest released version:
  - `gh release list --limit 1 --json tagName --jq .[0].tagName` → `v1.17.0`.
- Closed GitHub issue #6 with an explanatory comment:
  - `gh issue close 6 --comment "Catch block false positive fix (no-redundant-annotation) shipped in v1.17.0; closing as completed."`
  - Result: issue `voder-ai/eslint-plugin-traceability#6` marked closed.
- Verified the issue is now closed:
  - `gh issue view 6 --json state,stateReason,closedAt --jq .state` → `CLOSED`.
- Updated Story 027.0 to reflect the closure:
  - Edited `docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md` to:
    - Change the **Acceptance Criteria** checkbox for “**Issue #6 Resolution**” from `[ ]` to `[x]`.
    - Change the **Definition of Done** checkbox for closing GitHub issue #6 from `[ ]` to `[x]`.
- Re‑ran the full test suite:
  - `npm test -- --runInBand` → 55/55 suites and 476/476 tests passed, including:
    - `tests/rules/no-redundant-annotation.test.ts`
    - `tests/utils/annotation-scope-analyzer.test.ts`
    - `tests/integration/no-redundant-annotation.integration.test.ts`
- Ran additional quality checks:
  - `npm run build` → success.
  - `npm run lint` → success.
  - `npm run type-check` → success.
  - `npm run format:check` → success.
- Staged and committed the story changes:
  - `git add -A`
  - `git commit -m "docs(stories): mark story 027.0 redundant-annotation issue closure as complete"`
- Pushed to `main` and confirmed CI:
  - `git push` triggered pre-push hooks (`npm run ci-verify:full`, `npm run security:secrets`) which passed.
  - GitHub “CI/CD Pipeline (main)” run `20092064020` completed with status `success`.

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"tests"}
Used tool: list_directory with input: {"dirPath":"docs"}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: list_directory with input: {"dirPath":"tests/perf"}
Used tool: read_file with input: {"filePath":"docs/maintenance-performance-tests.md"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: read_file with input: {"filePath":"tests/perf/maintenance-large-workspace.test.ts"}
Used tool: read_file with input: {"filePath":"tests/perf/maintenance-cli-large-workspace.test.ts"}
Used tool: read_file with input: {"filePath":"tests/perf/require-branch-annotation-large-file.test.ts"}
Used tool: read_file with input: {"filePath":"tests/perf/valid-annotation-format-large-file.test.ts"}
Used tool: read_file with input: {"filePath":"docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md"}
Used tool: modify_file with input: {"filePath":"tests/perf/maintenance-large-workspace.test.ts","instruction":"After the existing imports from perf_hooks and maintenance modules, insert a new constant declaration:\n\nconst LARGE_WORKSPACE_PERF_BUDGET_MS = 5000;\n\nwith a preceding comment noting that this budget is documented in docs/maintenance-performance-tests.md. Then, replace all occurrences of `expect(durationMs).toBeLessThan(5000);` and `expect(singleDuration).toBeLessThan(5000);` and `expect(batchDuration).toBeLessThan(5000);` in this file so that they instead compare against `LARGE_WORKSPACE_PERF_BUDGET_MS` (e.g., `expect(durationMs).toBeLessThan(LARGE_WORKSPACE_PERF_BUDGET_MS);`). Do not change any other logic or text."}
Used tool: modify_file with input: {"filePath":"tests/perf/maintenance-cli-large-workspace.test.ts","instruction":"After the existing imports from perf_hooks and runMaintenanceCli, insert a new constant declaration:\n\nconst CLI_LARGE_WORKSPACE_PERF_BUDGET_MS = 5000;\n\nwith a preceding comment noting that this budget is documented in docs/maintenance-performance-tests.md. Then, replace all occurrences of `expect(durationMs).toBeLessThan(5000);` in this file so that they instead compare against `CLI_LARGE_WORKSPACE_PERF_BUDGET_MS`. Do not change any other logic or text."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci","--testPathPattern","tests/perf"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci","--testPathPatterns","tests/perf"]}
Used tool: modify_file with input: {"filePath":"docs/maintenance-performance-tests.md","instruction":"Update the \"Timing expectations\" and any other explicit references to time budgets to clarify that the large-workspace maintenance and CLI tests enforce a maximum wall-clock runtime of 5 seconds per operation, and that this value is codified as constants in `tests/perf/maintenance-large-workspace.test.ts` and `tests/perf/maintenance-cli-large-workspace.test.ts`. Ensure the doc explicitly states the 5s budget and ties it to those constants, keeping the existing structure and wording wherever possible."}
Used tool: read_file with input: {"filePath":"tests/maintenance/detect-isolated.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/report.test.ts"}
Used tool: generate_file with input: {"filePath":"docs/performance-tests-overview.md","content":"# Performance Test Suite Overview\n\nThis document explains the purpose of the performance tests, the time limits they enforce, and how to interpret and act on performance test failures when working on the maintenance tools or rules.\n\n## Scope\n\nThis overview focuses on the performance tests under `tests/perf`:\n\n- `tests/perf/maintenance-large-workspace.test.ts`\n- `tests/perf/maintenance-cli-large-workspace.test.ts`\n- `tests/perf/require-branch-annotation-large-file.test.ts`\n- `tests/perf/valid-annotation-format-large-file.test.ts`\n\nIt is closely related to `docs/maintenance-performance-tests.md`, which dives deeper into maintenance-tool performance scenarios.\n\n## Time Limits and Budgets\n\nThe large-workspace maintenance and CLI tests encode an explicit **5 second per-operation budget**:\n\n- `tests/perf/maintenance-large-workspace.test.ts` defines `LARGE_WORKSPACE_PERF_BUDGET_MS = 5000`.\n- `tests/perf/maintenance-cli-large-workspace.test.ts` defines `CLI_LARGE_WORKSPACE_PERF_BUDGET_MS = 5000`.\n\nEach operation under test (a single call to `detectStaleAnnotations`, `verifyAnnotations`, `generateMaintenanceReport`, `updateAnnotationReferences`, `batchUpdateAnnotations`, or one CLI invocation) must complete within this budget on CI-class hardware. The tests measure wall-clock time around the operation and assert that the duration is **less than** the configured budget.\n\nThe rule-level performance tests (`require-branch-annotation-large-file` and `valid-annotation-format-large-file`) use similar 5 second guardrails for analyzing synthetic large files.\n\n## When to Run Performance Tests\n\nRun the performance tests in these situations:\n\n- When changing code in:\n  - `src/maintenance/*`\n  - `src/utils/storyReferenceUtils.ts`\n  - `src/rules/require-branch-annotation.ts`\n  - `src/rules/valid-annotation-format.ts`\n- When modifying file traversal, annotation parsing, or batch update behavior.\n- When investigating or addressing reported slowdowns in maintenance tooling or rule execution.\n\nThey are heavier than unit tests and do **not** need to run on every edit. Use them before merging substantial changes or as part of periodic CI jobs.\n\n## Interpreting Failures\n\nIf a performance test fails:\n\n1. Check whether the failure is functional (unexpected result, error) or purely timing-related.\n2. For timing-related failures:\n   - Re-run the specific perf test locally to rule out transient slowdowns.\n   - Compare with recent changes in traversal, parsing, or update logic.\n   - Add temporary logging or timers around suspected hotspots to identify regressions.\n3. Only consider adjusting the 5 second budgets after understanding the cause and confirming that CI hardware characteristics have changed.\n\nFor deeper guidance on maintenance-specific scenarios and expectations, see `docs/maintenance-performance-tests.md`.\n"}
Used tool: modify_file with input: {"filePath":"docs/jest-testing-guide.md","instruction":"In the section that talks about performance or long-running tests (or near the end if no such section exists), add a short subsection titled \"Performance Tests and Runtime Guarantees\". In that subsection, briefly explain that `tests/perf/*` encodes performance expectations for the maintenance tools and key rules, that the large-workspace maintenance and CLI tests enforce a 5 second per-operation budget (via constants in those files), and that developers should run these tests before merging significant changes to the maintenance tools or those rules. Mention `docs/maintenance-performance-tests.md` and `docs/performance-tests-overview.md` as the primary references. Keep wording concise and consistent with the existing guide style."}
Used tool: run_command with input: {"command":"npm","args":["run","ci-verify:fast"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: tighten maintenance and CLI performance tests"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
Used tool: modify_file with input: {"filePath":"tests/perf/maintenance-cli-large-workspace.test.ts","instruction":"After the existing createCliLargeWorkspace function, add a new helper function named createDeepNestedCliWorkspace that builds a more deeply nested directory structure (e.g., several levels of nested subdirectories) while still writing a small number of TypeScript files containing both valid and stale @story references and a single valid story file at the workspace root. Then, near the bottom of the file inside the existing describe block, add a new test case named \"[REQ-MAINT-DETECT] detect traverses deeply nested directories within a generous time budget\" that:\n\n- Calls createDeepNestedCliWorkspace to get { root, cleanup } and temporarily changes process.cwd() to the root (mirroring the existing tests' pattern).\n- Uses jest.spyOn(console, \"log\").mockImplementation(() => {}) to capture output.\n- Invokes runMaintenanceCli with the same detect --root <root> --json arguments as the first test.\n- Asserts that the exit code is 0 or 1, that durationMs is less than CLI_LARGE_WORKSPACE_PERF_BUDGET_MS, and that the parsed JSON payload has the expected shape (root string, stale array with at least one element).\n- Restores cwd, the spy, and calls cleanup in a finally block.\n\nKeep the new helper and test stylistically consistent with the existing ones, and reuse the existing CLI_LARGE_WORKSPACE_PERF_BUDGET_MS constant for the time budget rather than introducing a new constant."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci","--testPathPatterns","tests/perf/maintenance-cli-large-workspace.test.ts"]}
Used tool: modify_file with input: {"filePath":"docs/maintenance-performance-tests.md","instruction":"In the \"Test Locations and Commands\" section, update the listed Jest test paths and examples to reflect that the current performance tests live under `tests/perf` rather than `tests/maintenance/perf`. Specifically, change the bullet points and example commands so they mention `tests/perf/maintenance-large-workspace.test.ts`, `tests/perf/maintenance-cli-large-workspace.test.ts`, etc., and use `jest` examples that match the existing `npm test` usage. Keep the structure and intent of the section the same, just align paths/commands with the current repository layout."}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: add deep nested CLI performance scenario and docs"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
Used tool: modify_file with input: {"filePath":"docs/performance-tests-overview.md","instruction":"At the end of the document, add a new section titled \"Recommended Runtime Verification Commands\". In that section, briefly list the key npm scripts and Jest invocations developers should run before merging substantial changes to the maintenance tools or rules, for example:\n\n- `npm run ci-verify:fast` for a quick but meaningful gate during development.\n- `npm run ci-verify:full` when you want to mirror the full CI pipeline locally (including coverage, audits, and performance-sensitive tests under `tests/perf`).\n- `npm test -- --runInBand --ci --testPathPatterns tests/perf` to focus specifically on the performance suites when investigating or tuning performance.\n\nAlso mention that `ci-verify:full` already runs Jest with coverage (which includes the performance tests), so passing that command implies that performance guarantees are currently being met."}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"docs: document performance tests and runtime verification commands"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
---

**This was the result:**
---
Here’s what was implemented for the **NOW** and **NEXT** sections, and the updated plan.

---

## What I implemented

### 1) NOW – Strengthen large-workspace performance tests

**Goal:** Enforce a clear max runtime for maintenance tools on a realistic big project, via explicit time limits in tests.

**Changes:**

1. **Core maintenance perf tests**

   - File: `tests/perf/maintenance-large-workspace.test.ts`
   - Added a shared performance budget constant:
     ```ts
     // Performance budget for large-workspace maintenance tests; documented in docs/maintenance-performance-tests.md.
     const LARGE_WORKSPACE_PERF_BUDGET_MS = 5000;
     ```
   - Updated all timing assertions to reference the constant instead of a magic number:
     ```ts
     expect(durationMs).toBeLessThan(LARGE_WORKSPACE_PERF_BUDGET_MS);
     expect(singleDuration).toBeLessThan(LARGE_WORKSPACE_PERF_BUDGET_MS);
     expect(batchDuration).toBeLessThan(LARGE_WORKSPACE_PERF_BUDGET_MS);
     ```

2. **CLI maintenance perf tests**

   - File: `tests/perf/maintenance-cli-large-workspace.test.ts`
   - Added a CLI-specific budget constant:
     ```ts
     // Performance budget documented in docs/maintenance-performance-tests.md
     const CLI_LARGE_WORKSPACE_PERF_BUDGET_MS = 5000;
     ```
   - Updated all timing assertions to reference the constant:
     ```ts
     expect(durationMs).toBeLessThan(CLI_LARGE_WORKSPACE_PERF_BUDGET_MS);
     ```

3. **Documentation alignment (NOW scope)**

   - File: `docs/maintenance-performance-tests.md`
   - Clarified that:
     - There is a **5 second per-operation budget** for large-workspace maintenance operations (detect, verify, report, updates).
     - This is **codified as constants** in:
       - `tests/perf/maintenance-large-workspace.test.ts`
       - `tests/perf/maintenance-cli-large-workspace.test.ts`
     - Tests measure wall-clock time around each operation and assert it’s below this threshold.

4. **Verification for NOW**

   - Ran perf-only Jest tests:
     ```bash
     npm test -- --runInBand --ci --testPathPatterns tests/perf
     ```
     → All 4 perf suites passed.
   - Ran fast CI bundle:
     ```bash
     npm run ci-verify:fast
     ```
   - Full checks before push:
     ```bash
     npm run build
     npm test -- --runInBand --ci
     npm run lint
     npm run type-check
     npm run format:check
     ```
   - Commit: `test: tighten maintenance and CLI performance tests`
   - Push triggered CI (`CI/CD Pipeline`) and the run completed successfully.

**Result:** Large-workspace maintenance tests now encode and enforce a 5-second per-operation time limit via explicit constants, with docs explicitly tying to that limit.

---

### 2) NEXT-1 – Developer-facing docs on perf tests & time limits

**Goal:** Explain purpose of perf tests, configured time limits, and how to interpret failures.

**Changes:**

1. **Dedicated overview doc**

   - New file: `docs/performance-tests-overview.md`
   - Content highlights:
     - Scope: `tests/perf/*` suites (maintenance and rule-level performance tests).
     - Explains:
       - 5-second per-operation budget and where constants live:
         - `LARGE_WORKSPACE_PERF_BUDGET_MS` in `maintenance-large-workspace.test.ts`
         - `CLI_LARGE_WORKSPACE_PERF_BUDGET_MS` in `maintenance-cli-large-workspace.test.ts`
       - Which scenarios are covered (large workspaces and large annotated files).
       - When to run perf tests and how to interpret timing failures.
     - Points to `docs/maintenance-performance-tests.md` for deeper maintenance-specific details.

2. **Existing maintenance perf doc clarified**

   - File: `docs/maintenance-performance-tests.md`
   - Clarified:
     - 5-second **per operation** limit as a hard constraint, not just a guideline.
     - Explicit reference to the test constants:
       - `tests/perf/maintenance-large-workspace.test.ts`
       - `tests/perf/maintenance-cli-large-workspace.test.ts`
     - Updated **Test Locations and Commands** to reflect current Jest layout:
       - Core API perf: `tests/perf/maintenance-large-workspace.test.ts`
       - CLI perf: `tests/perf/maintenance-cli-large-workspace.test.ts`
       - Example commands using `npx jest` on `tests/perf/...`.

3. **Jest testing guide hook-in**

   - File: `docs/jest-testing-guide.md`
   - Added a short subsection:
     - **“Performance Tests and Runtime Guarantees”**
     - Explains that:
       - `tests/perf/*` encode performance expectations for maintenance tools and key rules.
       - Large-workspace maintenance and CLI tests enforce a 5s per-operation budget via constants.
       - Developers should run these tests before merging significant changes to the maintenance tools or the covered rules.
       - References: `docs/maintenance-performance-tests.md`, `docs/performance-tests-overview.md`.

4. **Verification for NEXT-1**

   - Checks executed as part of later steps:
     - `npm run build`
     - `npm test -- --runInBand --ci`
     - `npm run lint`
     - `npm run type-check`
     - `npm run format:check`

**Result:** Internal developer docs now clearly explain the purpose of perf tests, the enforced time limits, and how to act on failures.

---

### 3) NEXT-2 – Additional realistic perf scenario for CLI / plugin

**Goal:** Extend perf coverage with an additional realistic scenario (deeply nested directories) using the same time-budget approach.

**Changes:**

- File: `tests/perf/maintenance-cli-large-workspace.test.ts`

1. **New deep-nested workspace helper**

   ```ts
   function createDeepNestedCliWorkspace(): { root: string; cleanup: () => void } {
     const root = fs.mkdtempSync(
       path.join(os.tmpdir(), "traceability-cli-deep-nested-"),
     );

     // Create a deeply nested directory structure with a small number of files.
     for (let branchIndex = 0; branchIndex < 3; branchIndex += 1) {
       const level1 = path.join(
         root,
         `branch-${branchIndex.toString().padStart(3, "0")}`,
       );
       fs.mkdirSync(level1);

       const level2 = path.join(level1, "deep", "nested", "structure");
       fs.mkdirSync(path.join(level1, "deep"), { recursive: true });
       fs.mkdirSync(path.join(level1, "deep", "nested"), { recursive: true });
       fs.mkdirSync(level2, { recursive: true });

       for (let fileIndex = 0; fileIndex < 3; fileIndex += 1) {
         const filePath = path.join(
           level2,
           `deep-file-${fileIndex.toString().padStart(3, "0")}.ts`,
         );
         const validStory = "cli-valid.story.md";
         const staleStory = "cli-deep-stale.story.md";
         const content = `/**
 * @story ${validStory}
 * @story ${staleStory}
 */
export function cli_deep_example_${branchIndex}_${fileIndex}() {}
`;
         fs.writeFileSync(filePath, content, "utf8");
       }
     }

     // Valid story at root
     fs.writeFileSync(
       path.join(root, "cli-valid.story.md"),
       "# cli valid",
       "utf8",
     );

     return {
       root,
       cleanup: () => {
         fs.rmSync(root, { recursive: true, force: true });
       },
     };
   }
   ```

2. **New deep-nested CLI perf test**

   - Added to the same `describe` block:

   ```ts
   it("[REQ-MAINT-DETECT] detect traverses deeply nested directories within a generous time budget", () => {
     const { root, cleanup } = createDeepNestedCliWorkspace();
     const originalCwd = process.cwd();
     process.chdir(root);

     const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

     try {
       const start = performance.now();
       const exitCode = runMaintenanceCli([
         "node",
         "traceability-maint",
         "detect",
         "--root",
         root,
         "--json",
       ]);
       const durationMs = performance.now() - start;

       expect(exitCode === 0 || exitCode === 1).toBe(true);
       expect(durationMs).toBeLessThan(CLI_LARGE_WORKSPACE_PERF_BUDGET_MS);

       expect(logSpy).toHaveBeenCalledTimes(1);
       const payloadRaw = String(logSpy.mock.calls[0][0]);
       const payload = JSON.parse(payloadRaw) as {
         root: string;
         stale: string[];
       };
       expect(payload.root).toBe(root);
       expect(Array.isArray(payload.stale)).toBe(true);
       expect(payload.stale.length).toBeGreaterThan(0);
     } finally {
       logSpy.mockRestore();
       process.chdir(originalCwd);
       cleanup();
     }
   });
   ```

   - This:
     - Uses the same 5s CLI budget constant.
     - Exercises deep nested directory traversal with both valid and stale `@story` references.
     - Validates both runtime and JSON output structure.

3. **Verification for NEXT-2**

   - Focused test:
     ```bash
     npm test -- --runInBand --ci --testPathPatterns tests/perf/maintenance-cli-large-workspace.test.ts
     ```
   - Full suite and quality checks (covered again in NEXT-3 section).

- Commit: `test: add deep nested CLI performance scenario and docs`

**Result:** Perf coverage now includes a deep nested-directory CLI scenario, guarding against regressions in traversal behavior as well as flat large-workspace scenarios.

---

### 4) NEXT-3 – Clarify runtime verification commands in internal docs

**Goal:** Document which runtime verification commands to run before merging substantial changes, and how they relate to performance guarantees.

**Changes:**

1. **Performance tests overview – runtime commands**

   - File: `docs/performance-tests-overview.md`
   - Added section: **“Recommended Runtime Verification Commands”**
   - Lists and explains:

     ```text
     - npm run ci-verify:fast
       For a quick but meaningful verification gate during development.

     - npm run ci-verify:full
       To mirror the full CI pipeline locally (includes coverage, audits, and performance-sensitive tests under tests/perf).

     - npm test -- --runInBand --ci --testPathPatterns tests/perf
       To focus specifically on the performance suites when investigating or tuning performance.
     ```

   - Explicit note:
     - `ci-verify:full` runs Jest with coverage **including perf tests**, so a passing run implies performance guarantees are currently respected.

2. **Maintenance perf doc – commands alignment**

   - File: `docs/maintenance-performance-tests.md`
   - Updated **Test Locations and Commands** to:
     - Reference `tests/perf/maintenance-large-workspace.test.ts` and `tests/perf/maintenance-cli-large-workspace.test.ts`.
     - Show `npx jest tests/perf/...` examples aligned with how Jest is actually configured here.
     - Retain mention of Vitest only as an “if your project uses Vitest instead” note.

3. **Verification for NEXT-3 & final state**

   - Ran:
     ```bash
     npm run build
     npm test -- --runInBand --ci
     npm run lint
     npm run type-check
     npm run format:check
     ```
   - Commits:
     - `docs: document performance tests and runtime verification commands`
   - Each push triggered the `CI/CD Pipeline` workflow on GitHub; all monitored runs completed with `conclusion: success`.

---

## Updated Plan

### NOW

- [x] Strengthen the existing large-workspace performance tests so they enforce a clear maximum runtime for the maintenance tools on a realistic big project, by encoding explicit time limits in the tests and keeping all current behavior and assertions intact.

### NEXT

- [x] Add a short developer-facing documentation section that explains the purpose of the performance tests, the configured time limits they enforce, and how to interpret and act on a performance test failure when working on the maintenance tools or rules.
- [x] Extend the performance test coverage to include at least one additional realistic scenario for the maintenance CLI or plugin (such as a workspace with many small files or deeply nested directories), using the same explicit time-limit approach to guard against regressions in that pattern.
- [x] Clarify in the internal development documentation which runtime verification commands developers should run before merging substantial changes, including how these commands relate to the performance guarantees encoded in the tests.

### LATER

- [ ] Periodically revisit and, if appropriate, tighten the performance time limits in the tests as the implementation becomes more efficient, ensuring they remain challenging but realistic for typical CI environments.
- [ ] Introduce targeted performance micro-benchmarks for the most critical helper functions used by the maintenance tools or hot-path rule helpers, so that algorithmic regressions are caught earlier and more locally than full-workspace tests.
- [ ] Look for any remaining runtime edge cases in the maintenance CLI (such as extremely large numbers of files or unusual directory structures) and, where needed, add focused tests or small defensive checks so that behavior remains predictable and robust under stress.
---
