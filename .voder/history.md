Here’s a history-only summary of what’s been done so far on the project, incorporating the most recent work and excluding any future plans:

---

### Migration to `@supports` and unified traceability

- Introduced an `@supports`‑first migration path from legacy `@story` / `@req` using the `traceability/prefer-supports-annotation` rule.
- Added auto‑migration for simple legacy annotations (block comments, JSDoc, line comments), introduced a `LineComment` abstraction, and updated related tests and docs.
- Implemented `traceability/require-traceability` as a unified rule covering both function‑level and branch‑level requirements.
- Converted `require-story-annotation` and `require-req-annotation` into aliases via a shared alias engine (`createAliasRule`, `createAliasRuleMeta`), and updated exports, presets, and documentation to foreground the unified rule.
- Tightened annotation handling via `valid-annotation-format` and helpers for whitespace, multi‑line annotations, and mixed `@req` + `@supports` scenarios.

---

### Function and branch annotation behavior

- Extended `traceability/require-branch-annotation` to support:
  - `switch` statements (including grouped fallthrough and `default`),
  - loops,
  - `else-if` chains.
- Added `REQ-SWITCH-FALLTHROUGH` handling and refactored branch comment gathering to better align with real AST patterns; restored autofix behavior for `else-if`.
- Enhanced function rules to:
  - include arrow functions and nested/anonymous callbacks,
  - inherit annotations from parent scopes,
  - exclude test framework callbacks by default.
- Implemented `test-callback-exclusion` helpers:
  - Detect Jest/Mocha/Vitest helpers (and variants) and explicitly exclude Vitest `bench`.
  - Handle nested callbacks and configuration via `excludeTestCallbacks` (default `true`) and `additionalTestHelperNames`.

---

### Redundant-annotation handling and scope analysis

- Strengthened `no-redundant-annotation` using refactored helpers (`getStatementPairsForRedundancy`, `isStatementRedundantWithinScope`, `getAnnotationCommentsFromStatement`, `getRedundantStatementContext`).
- Clarified guarantees and constraints in the migration guide.
- Added `[REQ-SAFE-REMOVAL]` tests and expanded edge‑case coverage around comment removal (including EOF and invalid ranges).
- Improved test coverage for `annotation-scope-analyzer` and `branch-annotation-helpers` (e.g., `SwitchCase`, `CatchClause`, loops).

---

### Documentation and story alignment

- Updated README, API reference, examples, migration guide, and ESLint 9 setup docs; added `traceability-overview.md` and an FAQ.
  - Emphasized `@supports`‑first usage and `require-traceability` as the primary rule.
  - Documented redundant‑annotation cleanup behavior and error severity.
  - Documented CLI test isolation and recommended config presets.
- Aligned docs and `src/index.ts` exports with unified rule names.
- Completed and documented story `003.0-DEV-FUNCTION-ANNOTATIONS`, closed GitHub issue #5 after release `v1.17.0`, and recorded exact `gh` flows and outputs as part of that story’s Acceptance Criteria and DoD.

---

### Test, integration, and coverage work

- Expanded Jest coverage for core helpers and rules:
  - `annotation-checker`,
  - `annotation-scope-analyzer`,
  - `branch-annotation-helpers`,
  - `require-story-utils.getNodeName`,
  - `test-callback-exclusion`.
- Added integration tests:
  - `require-traceability-aliases.integration.test.ts` to cover the unified rule and its aliases.
  - `require-traceability-test-callbacks.integration.test.ts` to cover combined rules, test helper handling, Vitest `bench`, custom helpers, and annotation inheritance/exclusion.
- Ensured tests consistently reference relevant stories and requirement IDs.

---

### Linting, complexity limits, and refactors

- Tightened ESLint limits:
  - cyclomatic complexity reduced to 16,
  - `max-lines-per-function` lowered from 55 to 45.
- Refactored larger helpers into smaller units, including:
  - wiring in `src/index.ts` (`wireUnifiedFunctionAnnotationAliases`, `wirePreferSupportsAlias`),
  - internals of `valid-annotation-format` (`collapseAnnotationValue`, whitespace and embedded `@supports` validation),
  - internals of `prefer-implements-annotation` (`collectReqIndicesAfterStory`, `advanceInlineGroupIndex`, etc.).
- Tightened typings in `test-callback-exclusion.ts` using `TraceabilityNodeWithParent` and more precise `TSESTree` types.

---

### Versioning, CI/CD, and contributing processes

- Updated dependencies (including `ts-jest`) and refreshed the lockfile, documenting dependency health.
- Evolved CI/CD and semantic-release practices to:
  - trunk-based development on `main`,
  - Conventional Commits,
  - CI-only releases,
  - explicit Node version matrix, secret scanning, and `ci-verify:full` behavior.
- Added/updated ADRs:
  - ADR 014 (version control and release strategy),
  - ADR 006 (CI/CD details),
  - ADR 013 (test-callback exclusion and Vitest `bench` handling).
- Updated `CONTRIBUTING.md` to reflect the unified CI/CD + semantic-release workflow.
- Validated CI via controlled failing runs (e.g., intentional lint/format failures) while keeping builds/tests green.

---

### Maintenance CLI and tooling traceability

- Ensured full traceability for maintenance CLI tools:
  - `src/maintenance/cli.ts`: annotated `switch` cases, help/usage, unknown commands, and error handlers.
  - `src/maintenance/commands.ts`: annotated handlers (`handleDetect`, `handleVerify`, `handleReport`, `handleUpdate`) with `REQ-MAINT-*`.
  - `src/maintenance/report.ts`: used `@supports` to distinguish success vs. stale‑annotation branches (`REQ-MAINT-SAFE`, `REQ-MAINT-REPORT`).
  - `src/maintenance/update.ts`: annotated per-file helpers, directory checks, and per-file loops.
  - `src/maintenance/index.ts`: module-level JSDoc to aggregate maintenance surface `@supports`.

---

### Plugin wiring and traceability annotations

- Enriched JSDoc and inline `@supports` annotations in `src/index.ts`:
  - `createAliasRuleMeta`, `wireUnifiedFunctionAnnotationAliases` tied to stories `003.0-DEV-FUNCTION-ANNOTATIONS` and `010.4-DEV-UNIFIED-FUNCTION-RULE-AND-ALIASES`.
  - `wirePreferSupportsAlias` linked to migration stories `010.3` and `010.4`.
  - `createTraceabilityFlatConfig` tied to stories `007.0-DEV-ERROR-REPORTING` and `002.0-DEV-ESLINT-CONFIG`.
  - Preserved existing metadata tags (`REQ-PLUGIN-STRUCTURE`, `REQ-NPM-PACKAGE`).

---

### Continuous quality verification

- Repeatedly ran a full quality suite after substantial changes:
  - `npm test` (often with `--runInBand` / `--bail`),
  - `npm run lint -- --max-warnings=0`,
  - `npm run type-check`,
  - `npm run build`,
  - `npm run format` / `npm run format:check`,
  - duplication and traceability checks.
- Used targeted runs (`ci-verify:fast`, specific integration suites) for focused validation.
- Regularly checked for a clean Git status, committed with conventional messages, pushed to `main`, and monitored the GitHub “CI/CD Pipeline” workflow.

---

### `valid-annotation-format` rule and Voder metadata

- Enabled `valid-annotation-format` in the lint config, added temporary suppressions, and then fixed underlying annotation issues to remove suppressions where possible.
- Updated malformed/legacy annotations to conform to the new format.
- Refactored duplicated helper patterns in traceability rule helpers into shared functions without increasing complexity.
- Standardized remaining mixed `@story`/`@req` annotations on core rule entry points to an `@supports`‑first style.
- Updated Voder metadata (`.voder/history.md`, `.voder/implementation-progress.md`, `.voder/last-action.md`, `.voder/plan.md`, CSV/PNG files) under a `chore: update voder metadata for valid-annotation-format rule work` commit.
- Ran the full quality suite and confirmed CI run `20080702255` succeeded.

---

### Test isolation and `annotation-checker` tests

- Reviewed existing `annotation-checker` tests, performance tests under `tests/perf`, maintenance detection logic/tests, and Jest config.
- Added `tests/utils/annotation-checker-autofix-behavior.test.ts`:
  - Focused on `checkReqAnnotation` autofix behavior using mocked dependencies and a `createContextStub`.
  - Verified autofix targets for various node shapes and behavior when `enableFix: false`.
  - Tagged with `REQ-ANNOTATION-AUTOFIX`, `REQ-ANNOTATION-REPORTING`.
- Removed `tests/utils/annotation-checker-branches.test.ts` to reduce duplication and improve naming.
- Refactored performance maintenance tests to be self-contained:
  - `tests/perf/maintenance-large-workspace.test.ts` and `tests/perf/maintenance-cli-large-workspace.test.ts` now create/clean their own workspaces and manage `process.cwd()` locally.
- Strengthened permission-handling coverage in `tests/maintenance/detect-isolated.test.ts` by stubbing `fs.readFileSync` and simulating `EACCES`.
- Audited loops in tests, confirming remaining loops are perf data generators, code snippets, or simple cleanup logic.
- Ran the full quality suite and pushed under `test: rename annotation checker and improve maintenance test isolation`; CI run `20081726107` succeeded.

---

### Dependency/tooling update: Prettier 3.7.4

- Upgraded `prettier` from `^3.6.2` to `^3.7.4` and regenerated `package-lock.json`.
- Verified via:
  - `npm run format` / `npm run format:check`,
  - `npm run build`,
  - `npm test -- --runInBand`,
  - `npm run lint`,
  - `npm run type-check`.
- Committed as `build: update prettier to 3.7.4` and pushed; CI run `20091128834` completed successfully with no new release.

---

### Story 027.0 and GitHub issue #6 closure (initial docs alignment)

- Reviewed `docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md` and GitHub issue #6.
- Confirmed the latest release as `v1.17.0`.
- Closed GitHub issue #6 with a comment noting the catch-block false positive fix having shipped in `v1.17.0`.
- Verified the issue is now in `CLOSED` state.
- Updated Story 027.0 to:
  - Mark the “Issue #6 Resolution” Acceptance Criterion as completed.
  - Mark the corresponding DoD item for closing issue #6 as completed.
- Re-ran full tests (55 suites, 476 tests) and all quality commands (build, lint, type-check, format:check).
- Committed as `docs(stories): mark story 027.0 redundant-annotation issue closure as complete`; CI run `20092064020` succeeded.

*(Note: this earlier closure step was later complemented by additional test coverage and rule changes described below.)*

---

### Maintenance and CLI performance tests

1. **Performance budgets and constants**

   - Updated `tests/perf/maintenance-large-workspace.test.ts`:
     - Introduced `LARGE_WORKSPACE_PERF_BUDGET_MS = 5000` with documentation tying it to `docs/maintenance-performance-tests.md`.
     - Replaced hard-coded `5000` thresholds in expectations with the constant.
   - Updated `tests/perf/maintenance-cli-large-workspace.test.ts`:
     - Introduced `CLI_LARGE_WORKSPACE_PERF_BUDGET_MS = 5000` with similar documentation.
     - Replaced hard-coded `5000` thresholds with the constant.

2. **Docs for performance expectations**

   - Updated `docs/maintenance-performance-tests.md`:
     - Clarified the **5-second per-operation budget** for large-workspace maintenance and CLI operations.
     - Explained how this budget is codified via the constants in the perf tests.
     - Updated “Test Locations and Commands” to reference `tests/perf/maintenance-*.test.ts` and aligned Jest command examples with the current layout.
   - Added `docs/performance-tests-overview.md`:
     - Described the purpose and scope of `tests/perf/*`.
     - Documented 5-second budgets for large-workspace maintenance and CLI tests, plus guardrails for large-file rule perf tests.
     - Described when to run perf tests and how to interpret timing failures.
   - Updated `docs/jest-testing-guide.md`:
     - Added “Performance Tests and Runtime Guarantees” describing:
       - The role of `tests/perf/*`.
       - The 5-second budgets encoded via constants.
       - When developers should run these tests.
     - Linked to `docs/maintenance-performance-tests.md` and `docs/performance-tests-overview.md`.

3. **Additional CLI perf scenario (deeply nested workspace)**

   - Extended `tests/perf/maintenance-cli-large-workspace.test.ts`:
     - Added `createDeepNestedCliWorkspace` to build a deeply nested directory structure with a small number of TypeScript files that mix valid and stale `@story` references and a valid story file at the root.
     - Added a test:
       - `"[REQ-MAINT-DETECT] detect traverses deeply nested directories within a generous time budget"`.
       - Uses `createDeepNestedCliWorkspace`, temporarily changes `process.cwd()`, spies on `console.log`, runs `runMaintenanceCli` with `detect --root <root> --json`, and asserts:
         - exit code is 0 or 1,
         - runtime stays under `CLI_LARGE_WORKSPACE_PERF_BUDGET_MS`,
         - JSON output includes `root` and a non-empty `stale` array.
       - Restores `cwd` and the console spy, and calls `cleanup()` in a `finally` block.

4. **Runtime verification commands documentation**

   - Updated `docs/performance-tests-overview.md` with “Recommended Runtime Verification Commands”:
     - Documented:
       - `npm run ci-verify:fast` as a quick local gate.
       - `npm run ci-verify:full` to mirror full CI (including perf tests and coverage).
       - `npm test -- --runInBand --ci --testPathPatterns tests/perf` to run only perf suites.
     - Clarified that perf tests are part of `ci-verify:full`, so a passing run implies perf guarantees are met.

5. **Verification and CI**

   - Ran targeted perf tests (`npm test -- --runInBand --ci --testPathPatterns tests/perf` and focused runs for the CLI perf file).
   - Ran `npm run ci-verify:fast` after tightening the perf budgets.
   - For each batch of changes, executed:
     - `npm run build`,
     - `npm test -- --runInBand --ci`,
     - `npm run lint`,
     - `npm run type-check`,
     - `npm run format:check`.
   - Committed and pushed:
     - `test: tighten maintenance and CLI performance tests`,
     - `test: add deep nested CLI performance scenario and docs`,
     - `docs: document performance tests and runtime verification commands`.
   - Monitored the `CI/CD Pipeline` workflow for each push; all runs completed successfully.

---

### Latest work: refined catch-block handling for `no-redundant-annotation`

Most recently, the focus has been on correctly handling catch blocks in the `no-redundant-annotation` rule, based on story 027.0 and the historical regression from issue #6.

1. **New rule-level test for catch-block handling**

   - Reviewed:
     - `tests/rules/no-redundant-annotation.test.ts`,
     - `docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md`,
     - `src/utils/annotation-scope-analyzer.ts`,
     - `src/rules/no-redundant-annotation.ts`,
     - `src/utils/branch-annotation-helpers.ts`,
     - `tests/integration/no-redundant-annotation.integration.test.ts`,
     - `package.json`.
   - Updated `tests/rules/no-redundant-annotation.test.ts`:
     - Extended the file-level JSDoc to include `REQ-CATCH-BLOCK-HANDLING`.
     - Added a new **valid** test case encoding the try/if/else-if/catch scenario from story 027.0, mirroring the regression from issue #6:
       - The code uses:
         - `// @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.story.md`
         - `// @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SAFE-ONLY`
       - Annotations appear on the try branch paths and the catch block.
       - The test is named to include `[REQ-CATCH-BLOCK-HANDLING]` and notes the issue #6 scenario.
     - Placed this test among other preservation / no-false-positive scenarios in the `valid` array so that **no redundant-annotation errors** are expected for this pattern.
   - Ran the focused rule test:
     - `npm test -- --runInBand --testPathPattern tests/rules/no-redundant-annotation.test.ts`
     - Then re-ran with `--testPathPatterns` (alternative spelling) to ensure coverage.

2. **Rule change: treat catch blocks as distinct execution paths**

   - Updated `src/rules/no-redundant-annotation.ts`:
     - In the `BlockStatement` visitor within `create()`, added a guard that:
       - Checks if the `BlockStatement`’s parent is a `CatchClause`.
       - If so, **returns early**, skipping redundancy analysis for that block.
     - Annotated this guard with an inline `@supports` comment referencing story 027.0 and `REQ-CATCH-BLOCK-HANDLING`, documenting that catch blocks are treated as distinct execution paths and their internal annotations are not considered redundant.
   - This change ensures that a catch block’s traceability annotation is retained even when matching try-branch annotations exist.
   - Re-ran the focused no-redundant-annotation rule tests to confirm the new catch-block scenario passes.

3. **Story 027.0 acceptance criteria update**

   - Updated `docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md`:
     - Marked the **“No False Positives”** Acceptance Criterion as completed (`[x]`), now that catch block handling is implemented and explicitly tested via the new rule test.
     - Left the **“Issue #6 Resolution”** criterion **unchecked** as instructed.
     - Left other story text unchanged.

4. **Integration-level scenario for the try/if/else-if/catch pattern**

   - Updated `tests/integration/no-redundant-annotation.integration.test.ts`:
     - Added a second integration test directly encoding the try/if/else-if/catch pattern from story 027.0 / issue #6.
     - The code snippet:
       - Declares `filterVulnerableVersions` and uses:
         - `// @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md`
         - `// @req REQ-SAFE-ONLY`
       - Annotates:
         - the try block branches,
         - the catch block,
         - following the structure used in the story.
     - Configures the rule:
       - `"traceability/no-redundant-annotation": ["warn"]`.
     - Asserts that `result.messages` contains **no** diagnostics with `ruleId === "traceability/no-redundant-annotation"`.
     - Names the test to include `[REQ-CATCH-BLOCK-HANDLING]` and notes that it covers the regression from issue #6.

5. **Quality checks, commit, and CI**

   - Ran focused and full quality commands:
     - `npm test -- --runInBand --testPathPatterns tests/rules/no-redundant-annotation.test.ts`
     - `npm test -- --runInBand`
     - `npm run lint -- --max-warnings=0`
     - `npm run type-check`
     - `npm run build`
     - `npm run format:check`
   - After formatting issues were detected on touched files, ran:
     - `npm run format -- src/rules/no-redundant-annotation.ts tests/integration/no-redundant-annotation.integration.test.ts tests/rules/no-redundant-annotation.test.ts`
     - Followed by:
       - `npm run lint -- --max-warnings=0`
       - `npm run type-check`
       - `npm run format:check`
   - Staged and committed changes:
     - `fix: avoid redundant-annotation false positives for catch blocks`
   - Pushed to the remote and monitored the GitHub **“CI/CD Pipeline”** workflow via:
     - `get_github_pipeline_status`
     - `wait_for_github_workflow` (for “CI/CD Pipeline”)
   - Confirmed the pipeline completed successfully across the configured matrix and semantic-release stages.

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"."}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: list_directory with input: {"dirPath":"src"}
Used tool: list_directory with input: {"dirPath":"tests"}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: read_file with input: {"filePath":"src/rules/require-branch-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-branch-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"src/rules/no-redundant-annotation.ts"}
Used tool: read_file with input: {"filePath":"docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-report-helpers.ts"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-loop-helpers.ts"}
Used tool: search_file_content with input: {"filePath":"src","pattern":"reportMissingAnnotations","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src","pattern":"gatherBranchCommentText","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src","pattern":"validateBranchTypes","isRegex":false}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src"}
Used tool: find_files with input: {"pattern":"*.ts","directory":"tests/rules"}
Used tool: search_file_content with input: {"filePath":"/Users/tomhoward/Projects/eslint-plugin-traceability/src/utils/branch-annotation-helpers.ts","pattern":"annotationPlacement","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests","pattern":"should be equal to one of the allowed values","isRegex":false}
Used tool: search_file_content with input: {"filePath":"/Users/tomhoward/Projects/eslint-plugin-traceability/tests/rules/require-branch-annotation.test.ts","pattern":"annotationPlacement","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/rules/no-redundant-annotation.test.ts"}
Used tool: search_file_content with input: {"filePath":"/Users/tomhoward/Projects/eslint-plugin-traceability/src/index.ts","pattern":"validateBranchTypes","isRegex":false}
Used tool: search_file_content with input: {"filePath":"/Users/tomhoward/Projects/eslint-plugin-traceability/src/rules","pattern":"validateBranchTypes","isRegex":false}
Used tool: search_file_content with input: {"filePath":"/Users/tomhoward/Projects/eslint-plugin-traceability/src/rules/require-branch-annotation.ts","pattern":"annotationPlacement","isRegex":false}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","instruction":"Introduce an AnnotationPlacement type and extend gatherBranchCommentText and reportMissingAnnotations-related exports to accept an optional placement parameter, defaulting to \"before\" for now. Do not change existing behavior inside helper functions.\n\n1. At the top-level exports, after DEFAULT_BRANCH_TYPES and BranchType definitions, add a new exported type alias:\n\nexport type AnnotationPlacement = \"before\" | \"inside\";\n\nInclude a JSDoc comment referencing story 028.0 and REQ-PLACEMENT-CONFIG to maintain traceability.\n\n2. Update the signature of gatherBranchCommentText to accept a fourth parameter annotationPlacement of type AnnotationPlacement with a default value of \"before\". Keep the implementation body unchanged and do not reference annotationPlacement yet. Add a brief JSDoc @supports line referencing docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG to indicate it participates in placement configuration.\n\n3. Ensure the export list for gatherBranchCommentText remains the same, just with the new parameter; no other call sites are adjusted here (they will be updated in branch-annotation-report-helpers.ts).\n\n4. Do not modify any other functions or logic in this file."}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-report-helpers.ts","instruction":"Update imports and helper signatures to thread the new AnnotationPlacement option without changing behavior.\n\n1. Update the import from \"./branch-annotation-helpers\" at the top so it also imports AnnotationPlacement and gatherBranchCommentText (which is now placement-aware):\n\nimport {\n  gatherBranchCommentText,\n  reportMissingStory,\n  reportMissingReq,\n  AnnotationPlacement,\n} from \"./branch-annotation-helpers\";\n\n2. Extend getBaseBranchIndentAndInsertPos to accept a new annotationPlacement: AnnotationPlacement parameter, but do not change its internal logic yet. The function should keep using the existing behavior for all placements for now. Add a brief JSDoc @supports line referencing docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG.\n\n3. Extend getBranchAnnotationInfo to accept an annotationPlacement: AnnotationPlacement parameter and pass it through to gatherBranchCommentText and getBaseBranchIndentAndInsertPos. Do not change the logic that computes missingStory/missingReq or indent/insertPos.\n\n4. Update reportMissingAnnotations to accept an additional optional options parameter or to derive annotationPlacement from context.options[0]?.annotationPlacement, defaulting to \"before\" when not provided or invalid. For this NOW step, keep it minimal:\n\n- At the start of reportMissingAnnotations, compute:\n\nconst rawOptions: any = context.options && context.options[0];\nconst annotationPlacement: AnnotationPlacement =\n  rawOptions && (rawOptions.annotationPlacement === \"inside\" || rawOptions.annotationPlacement === \"before\")\n    ? rawOptions.annotationPlacement\n    : \"before\";\n\n- Pass annotationPlacement into getBranchAnnotationInfo.\n\n5. Do not change any other behavior in this file yet; do not add new messages or autofix logic.\n\n6. Ensure all new/updated functions include appropriate @story/@supports annotations for docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md with REQ-PLACEMENT-CONFIG where relevant."}
Used tool: modify_file with input: {"filePath":"src/rules/require-branch-annotation.ts","instruction":"Extend the rule schema and options handling to expose the new annotationPlacement configuration without changing detection behavior.\n\n1. Update the imports from \"../utils/branch-annotation-helpers\" to import the AnnotationPlacement type in addition to validateBranchTypes and reportMissingAnnotations:\n\nimport {\n  validateBranchTypes,\n  reportMissingAnnotations,\n  AnnotationPlacement,\n} from \"../utils/branch-annotation-helpers\";\n\n2. In the meta.schema definition, under properties, add a new annotationPlacement property with a simple enum validation and default backward-compatible behavior:\n\nannotationPlacement: {\n  enum: [\"before\", \"inside\"],\n},\n\nKeep additionalProperties: false.\n\n3. In the create function, after obtaining branchTypesOrListener and before building handlers, compute the resolved annotationPlacement from context.options[0]?.annotationPlacement with validation and a default of \"before\":\n\nconst rawOptions: any = context.options[0] || {};\nconst annotationPlacement: AnnotationPlacement =\n  rawOptions.annotationPlacement === \"inside\" || rawOptions.annotationPlacement === \"before\"\n    ? rawOptions.annotationPlacement\n    : \"before\";\n\n4. When constructing handlers[type], pass annotationPlacement through to reportMissingAnnotations by updating the call signature to include it *only if* reportMissingAnnotations is updated to accept options. Since reportMissingAnnotations now derives placement from context.options, keep the call the same for NOW; do not change the arguments in this step.\n\n5. Add appropriate JSDoc @supports annotations near the new schema property or placement handling code referencing docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG and REQ-DEFAULT-BACKWARD-COMPAT.\n\n6. Do not yet change any of the rule’s runtime behavior based on annotationPlacement; that will be implemented in NEXT steps.\n\n7. Ensure TypeScript types remain valid by using the imported AnnotationPlacement type only for local variables or context, not in the exported RuleModule schema typing."}
Used tool: modify_file with input: {"filePath":"tests/rules/require-branch-annotation.test.ts","instruction":"Add initial tests to verify that the new annotationPlacement option is accepted and does not break existing behavior. For NOW, we only assert that ESLint accepts the option and that behavior matches the default.\n\n1. At the top JSDoc, add a @story/@supports reference for docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md with REQ-PLACEMENT-CONFIG and REQ-DEFAULT-BACKWARD-COMPAT.\n\n2. In the main runRule({ valid, invalid }) block, add two additional valid cases near the other configuration tests:\n\n- One case that uses options: [{ annotationPlacement: \"before\" }] with a simple if-statement that has standard before-brace annotations, asserting no errors.\n- One case that uses options: [{ annotationPlacement: \"inside\" }] with the same code (before-brace annotations), also asserting no errors for NOW (since behavior is unchanged when placement is toggled).\n\nGive the tests descriptive names including [REQ-PLACEMENT-CONFIG] and [REQ-DEFAULT-BACKWARD-COMPAT] so they clearly trace to story 028.0.\n\n3. Do not introduce any new invalid tests for placement yet; those will be added when inside-brace behavior is implemented in NEXT steps.\n\n4. Keep existing tests unchanged aside from the additions and JSDoc augmentations."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--coverage=false"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: modify_file with input: {"filePath":"src/rules/require-branch-annotation.ts","instruction":"Prefix the local annotationPlacement variable in create() with an underscore to satisfy no-unused-vars until placement is wired into behavior.\n\nReplace the declaration:\nconst annotationPlacement: AnnotationPlacement =\n  rawOptions.annotationPlacement === \"inside\" ||\n  rawOptions.annotationPlacement === \"before\"\n    ? rawOptions.annotationPlacement\n    : \"before\";\n\nwith:\nconst _annotationPlacement: AnnotationPlacement =\n  rawOptions.annotationPlacement === \"inside\" ||\n  rawOptions.annotationPlacement === \"before\"\n    ? rawOptions.annotationPlacement\n    : \"before\";\n\nLeave all other code unchanged for now."}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","instruction":"Mark the unused annotationPlacement parameter in gatherBranchCommentText as intentionally unused to satisfy no-unused-vars until it is used in NEXT steps.\n\nIn the gatherBranchCommentText signature, change the parameter name from annotationPlacement to _annotationPlacement:\n\nexport function gatherBranchCommentText(\n  sourceCode: ReturnType<Rule.RuleContext[\"getSourceCode\"]>,\n  node: any,\n  parent?: any,\n  annotationPlacement: AnnotationPlacement = \"before\",\n): string {\n\nbecomes:\n\nexport function gatherBranchCommentText(\n  sourceCode: ReturnType<Rule.RuleContext[\"getSourceCode\"]>,\n  node: any,\n  parent?: any,\n  _annotationPlacement: AnnotationPlacement = \"before\",\n): string {\n\nDo not alter the body."}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-report-helpers.ts","instruction":"Mark the annotationPlacement parameter in getBaseBranchIndentAndInsertPos as intentionally unused until placement-specific indentation behavior is implemented.\n\nChange the signature from:\nfunction getBaseBranchIndentAndInsertPos(\n  sourceCode: ReturnType<Rule.RuleContext[\"getSourceCode\"]>,\n  node: any,\n  annotationPlacement: AnnotationPlacement,\n): { indent: string; insertPos: number } {\n\nto:\nfunction getBaseBranchIndentAndInsertPos(\n  sourceCode: ReturnType<Rule.RuleContext[\"getSourceCode\"]>,\n  node: any,\n  _annotationPlacement: AnnotationPlacement,\n): { indent: string; insertPos: number } {\n\nDo not change the function body."}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"feat: add annotationPlacement option for branch annotations"}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-report-helpers.ts","instruction":"Refactor getBranchAnnotationInfo into two smaller helpers to satisfy max-lines-per-function without changing behavior.\n\n1. Extract the existing logic that computes text, hasSupports, missingStory, and missingReq into a new helper function named getBranchMissingFlags:\n\n/**\n * Compute which annotations are missing for a branch based on its gathered comment text.\n * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\n * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG\n */\nfunction getBranchMissingFlags(\n  sourceCode: ReturnType<Rule.RuleContext[\"getSourceCode\"]>,\n  node: any,\n  parent: any | undefined,\n  annotationPlacement: AnnotationPlacement,\n): { missingStory: boolean; missingReq: boolean } {\n  const text = gatherBranchCommentText(sourceCode, node, parent, annotationPlacement);\n  const hasSupports = /@supports\\b/.test(text);\n  const missingStory = !/@story\\b/.test(text) && !hasSupports;\n  const missingReq = !/@req\\b/.test(text) && !hasSupports;\n  return { missingStory, missingReq };\n}\n\n2. Extract the indentation and insertPos computation (calls to getBaseBranchIndentAndInsertPos and the else-if block that adjusts commentLine) into a separate helper named getBranchIndentAndInsertPos:\n\n/**\n * Compute indentation and insert position used for auto-fix insertion on a branch.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG\n */\nfunction getBranchIndentAndInsertPos(\n  sourceCode: ReturnType<Rule.RuleContext[\"getSourceCode\"]>,\n  node: any,\n  parent: any | undefined,\n  annotationPlacement: AnnotationPlacement,\n): { indent: string; insertPos: number } {\n  let { indent, insertPos } = getBaseBranchIndentAndInsertPos(\n    sourceCode,\n    node,\n    annotationPlacement,\n  );\n\n  if (\n    node.type === \"IfStatement\" &&\n    parent &&\n    parent.type === \"IfStatement\" &&\n    parent.alternate === node &&\n    node.consequent &&\n    node.consequent.type === \"BlockStatement\" &&\n    node.consequent.loc &&\n    node.consequent.loc.start\n  ) {\n    const commentLine = node.consequent.loc.start.line + 1;\n    const commentLineInfo = getIndentAndInsertPosForLine(\n      sourceCode,\n      commentLine,\n      indent,\n    );\n\n    indent = commentLineInfo.indent;\n    insertPos = commentLineInfo.insertPos;\n  }\n\n  return { indent, insertPos };\n}\n\n3. Rewrite getBranchAnnotationInfo to delegate to these helpers and simply combine their results:\n\nfunction getBranchAnnotationInfo( ... ): { ... } {\n  const { missingStory, missingReq } = getBranchMissingFlags(sourceCode, node, parent, annotationPlacement);\n  const { indent, insertPos } = getBranchIndentAndInsertPos(sourceCode, node, parent, annotationPlacement);\n  return { missingStory, missingReq, indent, insertPos };\n}\n\n4. Preserve all existing @story/@supports annotations on getBranchAnnotationInfo and add new annotations on the helper functions as shown. Do not alter external behavior or signatures.\n\n5. Run Prettier later; focus only on this structural refactor in this edit."}
Used tool: run_command with input: {"command":"npm","args":["run","format"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"feat: add annotationPlacement option for branch annotations"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--coverage=false"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":20338016267,"timeout":600000}
Used tool: read_file with input: {"filePath":"tests/utils/branch-annotation-helpers.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/branch-annotation-else-if-position.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/branch-annotation-catch-position.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/branch-annotation-catch-insert-position.test.ts"}
Used tool: modify_file with input: {"filePath":"tests/utils/branch-annotation-helpers.test.ts","instruction":"Extend tests to exercise annotationPlacement configuration wiring at the helper level without changing behavior.\n\n1. Update the import line to also import AnnotationPlacement:\nimport { validateBranchTypes, DEFAULT_BRANCH_TYPES, gatherBranchCommentText, AnnotationPlacement } from \"../../src/utils/branch-annotation-helpers\";\n\n2. Add a new describe block at the end of the file to verify that gatherBranchCommentText accepts the extra annotationPlacement parameter and, for NOW, behaves identically for \"before\" and \"inside\" options:\n\ndescribe(\"gatherBranchCommentText annotationPlacement wiring (Story 028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION)\", () => {\n  it(\"[REQ-PLACEMENT-CONFIG][REQ-DEFAULT-BACKWARD-COMPAT] treats 'before' and 'inside' placement the same for existing behavior\", () => {\n    const sourceCode: any = {\n      lines: [],\n      getCommentsBefore: jest.fn().mockReturnValue([\n        { value: \"@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\" },\n      ]),\n    };\n\n    const ifNode: any = {\n      type: \"IfStatement\",\n      loc: { start: { line: 1 } },\n      consequent: {\n        type: \"BlockStatement\",\n        loc: { start: { line: 1 }, end: { line: 3 } },\n      },\n    };\n\n    const parent: any = {\n      type: \"IfStatement\",\n      alternate: ifNode,\n    };\n\n    const beforeText = gatherBranchCommentText(\n      sourceCode as any,\n      ifNode,\n      parent,\n      \"before\" as AnnotationPlacement,\n    );\n    const insideText = gatherBranchCommentText(\n      sourceCode as any,\n      ifNode,\n      parent,\n      \"inside\" as AnnotationPlacement,\n    );\n\n    expect(beforeText).toBe(insideText);\n    expect(beforeText).toContain(\n      \"@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\",\n    );\n  });\n});\n\n3. Add an appropriate JSDoc @story/@supports header comment above the new describe referencing docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG and REQ-DEFAULT-BACKWARD-COMPAT.\n\nDo not change any existing tests."}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: cover annotationPlacement wiring for branch helpers"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--coverage=false"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":20338146773,"timeout":600000}
---

**This was the result:**
---
Here’s what I implemented and how it maps to the plan.

---

## Updated Plan Status

### NOW

- [x] Extend the branch-annotation rule configuration so it accepts an `annotationPlacement` option (with allowed values and a default matching current behavior) and propagate that option into the internal branch-annotation helper functions without yet changing how annotations are located, so the rule’s runtime behavior remains the same while exposing the new configuration surface required by the story.

### NEXT

- [x] Add new rule-level tests for the branch-annotation rule that configure `annotationPlacement` with both the default and the new value, verifying that the option is accepted, validated, and wired through without breaking existing annotation detection behavior.
- [ ] Implement the first slice of inside-brace placement behavior for simple `if`/`else` blocks, using the `annotationPlacement` option to require annotations on the first executable line inside the block when set to the new mode, and adjust or add tests to confirm both modes behave as specified in the story.
- [ ] Extend the inside-brace placement behavior to `catch` clauses, `else-if` chains, and loop constructs so that all branch types covered by the story follow the standardized placement rules when `annotationPlacement` selects the new mode, including appropriate error messages that mention the expected placement.
- [ ] Introduce autofix logic that, when `annotationPlacement` requires inside-brace placement, moves annotations from the legacy before-brace location into the correct first-line-inside-brace position for supported branch types, and add tests that verify both the transformed code and that unsupported or ambiguous cases are left unchanged with clear diagnostics.
- [ ] Update the redundant-annotation rule’s behavior and tests, if required by the story, so that it interprets annotations according to the new placement semantics, ensuring that inside-brace annotations on branches are treated consistently and do not reintroduce redundant-annotation false positives.
- [ ] Update user-facing documentation (API reference, examples, migration guide) to describe the `annotationPlacement` option, its defaults, the new standardized inside-brace placement, and the recommended migration path from legacy before-brace annotations, including at least one concrete before/after example for a branch and a catch block.
- [ ] Once the feature is released, close GitHub issue #7 with a comment referencing the release version that implements the standardized annotation placement, then update story 028.0 to mark the relevant acceptance criteria and Definition of Done items as completed, citing the implemented tests as evidence.

_(The remaining NEXT bullets involve behavior changes, autofix, redundancy rule alignment, docs, and issue closure. In this cycle I completed the configuration surface + wiring + tests; inside-brace semantics and migration behavior are intentionally deferred to keep this increment small and safe.)_

---

## What I Implemented

### 1. New `annotationPlacement` configuration surface

**Files:**

- `src/utils/branch-annotation-helpers.ts`
- `src/utils/branch-annotation-report-helpers.ts`
- `src/rules/require-branch-annotation.ts`

**Changes:**

1. **Introduced `AnnotationPlacement` type**

   ```ts
   /**
    * Placement options for branch annotations relative to their associated branch.
    * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
    * @req REQ-PLACEMENT-CONFIG - Allow configuration of annotation placement (before/inside)
    */
   export type AnnotationPlacement = "before" | "inside";
   ```

   This type is now the canonical representation of placement mode for branch annotations.

2. **Extended `gatherBranchCommentText` to accept placement parameter**

   ```ts
   /**
    * Gather leading comment text for a branch node.
    * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
    * @req REQ-COMMENT-ASSOCIATION
    * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
    * @supports REQ-DUAL-POSITION-DETECTION
    * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
    */
   export function gatherBranchCommentText(
     sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
     node: any,
     parent?: any,
     _annotationPlacement: AnnotationPlacement = "before",
   ): string {
     // ...existing logic unchanged...
   }
   ```

   - The new `_annotationPlacement` parameter is currently **ignored** (leading underscore) so behavior is identical to before.
   - This wires placement awareness into the helper API without changing semantics yet, satisfying the “expose config surface without behavior change” requirement.

3. **Threaded placement into report helpers**

   In `src/utils/branch-annotation-report-helpers.ts`:

   - Import of placement and comment helper:

     ```ts
     import {
       gatherBranchCommentText,
       reportMissingStory,
       reportMissingReq,
       AnnotationPlacement,
     } from "./branch-annotation-helpers";
     ```

   - New helper to compute which annotations are missing, using placement-aware gathering:

     ```ts
     /**
      * Compute which annotations are missing for a branch based on its gathered comment text.
      * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
      * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
      */
     function getBranchMissingFlags(
       sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
       node: any,
       parent: any | undefined,
       annotationPlacement: AnnotationPlacement,
     ): { missingStory: boolean; missingReq: boolean } {
       const text = gatherBranchCommentText(
         sourceCode,
         node,
         parent,
         annotationPlacement,
       );
       const hasSupports = /@supports\b/.test(text);
       const missingStory = !/@story\b/.test(text) && !hasSupports;
       const missingReq = !/@req\b/.test(text) && !hasSupports;
       return { missingStory, missingReq };
     }
     ```

   - New helper to compute indentation and insert position, now parameterized by placement (but not behaviorally different yet):

     ```ts
     /**
      * Compute indentation and insert position used for auto-fix insertion on a branch.
      * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
      * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
      */
     function getBranchIndentAndInsertPos(
       sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
       node: any,
       parent: any | undefined,
       annotationPlacement: AnnotationPlacement,
     ): { indent: string; insertPos: number } {
       let { indent, insertPos } = getBaseBranchIndentAndInsertPos(
         sourceCode,
         node,
         annotationPlacement, // currently ignored inside helper
       );

       // existing else-if-specific adjustment preserved
       if (
         node.type === "IfStatement" &&
         parent &&
         parent.type === "IfStatement" &&
         parent.alternate === node &&
         node.consequent &&
         node.consequent.type === "BlockStatement" &&
         node.consequent.loc &&
         node.consequent.loc.start
       ) {
         const commentLine = node.consequent.loc.start.line + 1;
         const commentLineInfo = getIndentAndInsertPosForLine(
           sourceCode,
           commentLine,
           indent,
         );

         indent = commentLineInfo.indent;
         insertPos = commentLineInfo.insertPos;
       }

       return { indent, insertPos };
     }
     ```

   - `getBranchAnnotationInfo` is now a thin composition:

     ```ts
     function getBranchAnnotationInfo(
       sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
       node: any,
       parent: any | undefined,
       annotationPlacement: AnnotationPlacement,
     ) {
       const { missingStory, missingReq } = getBranchMissingFlags(
         sourceCode,
         node,
         parent,
         annotationPlacement,
       );
       const { indent, insertPos } = getBranchIndentAndInsertPos(
         sourceCode,
         node,
         parent,
         annotationPlacement,
       );
       return { missingStory, missingReq, indent, insertPos };
     }
     ```

   - `reportMissingAnnotations` now resolves placement from rule options and passes it through:

     ```ts
     export function reportMissingAnnotations(
       context: Rule.RuleContext,
       node: any,
       storyFixCountRef: { count: number },
     ): void {
       const sourceCode = context.getSourceCode();

       const rawOptions: any = context.options && context.options[0];
       const annotationPlacement: AnnotationPlacement =
         rawOptions &&
         (rawOptions.annotationPlacement === "inside" ||
           rawOptions.annotationPlacement === "before")
           ? rawOptions.annotationPlacement
           : "before";

       const parent = (node as any).parent;

       const { missingStory, missingReq, indent, insertPos } =
         getBranchAnnotationInfo(
           sourceCode,
           node,
           parent,
           annotationPlacement,
         );

       // ...existing reporting logic unchanged...
     }
     ```

   At this point:

   - The rule can read `options[0].annotationPlacement` and thread it through the helper pipeline.
   - Because `gatherBranchCommentText` and indentation logic still behave the same for all placements, runtime behavior is unchanged.

4. **Extended require-branch-annotation rule schema with `annotationPlacement`**

   In `src/rules/require-branch-annotation.ts`:

   - Import the placement type:

     ```ts
     import {
       validateBranchTypes,
       reportMissingAnnotations,
       AnnotationPlacement,
     } from "../utils/branch-annotation-helpers";
     ```

   - Add schema property (with traceability):

     ```ts
     schema: [
       {
         type: "object",
         properties: {
           branchTypes: {
             type: "array",
             items: { type: "string" },
             uniqueItems: true,
           },
           /**
            * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG REQ-DEFAULT-BACKWARD-COMPAT
            */
           annotationPlacement: {
             enum: ["before", "inside"],
           },
         },
         additionalProperties: false,
       },
     ],
     ```

   - Resolve placement in `create` (currently stored but not used directly, since the helpers derive it from `context.options`):

     ```ts
     /**
      * Resolve annotation placement configuration with backward-compatible default.
      *
      * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG REQ-DEFAULT-BACKWARD-COMPAT
      */
     const rawOptions: any = context.options[0] || {};
     const _annotationPlacement: AnnotationPlacement =
       rawOptions.annotationPlacement === "inside" ||
       rawOptions.annotationPlacement === "before"
         ? rawOptions.annotationPlacement
         : "before";
     ```

   - Branch handlers remain unchanged:

     ```ts
     handlers[type] = function branchHandler(node) {
       if (
         type === "SwitchCase" &&
         isSwitchCaseNode(node) &&
         isFallthroughIntermediateCase(node)
       ) {
         return;
       }
       reportMissingAnnotations(context, node, storyFixCountRef);
     };
     ```

   So:

   - The rule **schema** now accepts `annotationPlacement: "before" | "inside"`.
   - The **implementation** reads that option via `context.options[0]` in the report helper, with a default of `"before"` to preserve backward compatibility.
   - Actual placement semantics are still legacy/dual-position; inside-brace enforcement is **not** yet implemented.

---

### 2. New tests for `annotationPlacement` (rule and helper level)

**Files:**

- `tests/rules/require-branch-annotation.test.ts`
- `tests/utils/branch-annotation-helpers.test.ts`

**Rule-level tests:**

1. **Traceability updates**

   The header of `require-branch-annotation.test.ts` now includes story 028.0 and corresponding requirements:

   ```ts
   /**
    * ...
    * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
    * ...
    * @req REQ-PLACEMENT-CONFIG - Rule supports configurable annotation placement modes
    * @req REQ-DEFAULT-BACKWARD-COMPAT - Default placement remains backward compatible with existing behavior
    * ...
    * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG REQ-DEFAULT-BACKWARD-COMPAT
    */
   ```

2. **New valid cases exercising the option**

   Two new `valid` entries:

   ```ts
   {
     name: "[REQ-PLACEMENT-CONFIG][REQ-DEFAULT-BACKWARD-COMPAT] if-statement with before-brace annotations using annotationPlacement: 'before'",
     code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-PLACEMENT-CONFIG
if (condition) {}`,
     options: [{ annotationPlacement: "before" }],
   },
   {
     name: "[REQ-PLACEMENT-CONFIG][REQ-DEFAULT-BACKWARD-COMPAT] if-statement with before-brace annotations using annotationPlacement: 'inside' (temporary backward-compatible behavior)",
     code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-PLACEMENT-CONFIG
if (condition) {}`,
     options: [{ annotationPlacement: "inside" }],
   },
   ```

   These verify:

   - ESLint accepts the `annotationPlacement` option at the schema level.
   - Both `"before"` and `"inside"` currently behave identically for a simple if-statement with before-brace annotations (as intended for this incremental step).

   No new invalid cases for placement are added yet; those will come once inside-brace semantics are implemented.

**Helper-level tests:**

In `tests/utils/branch-annotation-helpers.test.ts`:

- Imported the placement type:

  ```ts
  import {
    validateBranchTypes,
    DEFAULT_BRANCH_TYPES,
    gatherBranchCommentText,
    AnnotationPlacement,
  } from "../../src/utils/branch-annotation-helpers";
  ```

- Added a new describe block with traceability to story 028.0:

  ```ts
  /**
   * Tests for annotationPlacement wiring at helper level
   * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
   * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
   * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-DEFAULT-BACKWARD-COMPAT
   */
  describe(
    "gatherBranchCommentText annotationPlacement wiring (Story 028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION)",
    () => {
      it(
        "[REQ-PLACEMENT-CONFIG][REQ-DEFAULT-BACKWARD-COMPAT] treats 'before' and 'inside' placement the same for existing behavior",
        () => {
          const sourceCode: any = {
            lines: [],
            getCommentsBefore: jest.fn().mockReturnValue([
              {
                value:
                  "@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md",
              },
            ]),
          };

          const ifNode: any = {
            type: "IfStatement",
            loc: { start: { line: 1 } },
            consequent: {
              type: "BlockStatement",
              loc: { start: { line: 1 }, end: { line: 3 } },
            },
          };

          const parent: any = {
            type: "IfStatement",
            alternate: ifNode,
          };

          const beforeText = gatherBranchCommentText(
            sourceCode as any,
            ifNode,
            parent,
            "before" as AnnotationPlacement,
          );
          const insideText = gatherBranchCommentText(
            sourceCode as any,
            ifNode,
            parent,
            "inside" as AnnotationPlacement,
          );

          expect(beforeText).toBe(insideText);
          expect(beforeText).toContain(
            "@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md",
          );
        },
      );
    },
  );
  ```

This confirms that:

- `gatherBranchCommentText` accepts the new placement parameter.
- For now, `"before"` and `"inside"` are wired identically, which is the intended state for this incremental step.

---

## Quality Checks and CI/CD

Before each push, and as part of Husky pre-commit/pre-push plus CI:

- **Tests**

  - `npm test -- --runInBand --coverage=false`
  - CI: `npm run test -- --coverage`

  All 55 suites / 484 tests pass (coverage still above thresholds).

- **Type checking**

  - `npm run type-check` (`tsc --noEmit`): passes.

- **Linting**

  - `npm run lint`: passes with `--max-warnings=0`.

  I had one intermediate lint failure due to `max-lines-per-function` after refactoring `getBranchAnnotationInfo`; I fixed it by splitting that function into `getBranchMissingFlags` and `getBranchIndentAndInsertPos`, then reran lint successfully.

- **Formatting**

  - `npm run format` followed by `npm run format:check`: passes, all TS files formatted.

- **Duplication**

  - `npm run duplication` (jscpd, threshold 3): passes, ~2.95% duplicated lines, unchanged from prior state.

- **Security & audits**

  - CI and pre-push ran:
    - `npm run check:traceability`
    - `npm run safety:deps`
    - `npm run audit:ci`
    - `npm audit --omit=dev --audit-level=high`
    - `npm run audit:dev-high`
    - `npm run security:secrets` (secretlint)

- **CI/CD**

  Two pushes were made:

  1. `feat: add annotationPlacement option for branch annotations`
  2. `test: cover annotationPlacement wiring for branch helpers`

  Each push triggered the unified **CI/CD Pipeline** on GitHub Actions; runs `20338016267` and `20338146773` both completed with `success`. The `ci-verify:full` job (build, type-check, lint, duplication, tests with coverage, format check, audits, ci-artifact check) and `security:secrets` all passed, followed by semantic-release logic (no breaking changes introduced).

---

## Current State vs. Story 028.0

With this work:

- The plugin now **formally supports** an `annotationPlacement` option on `require-branch-annotation`:
  - Schema: `annotationPlacement: "before" | "inside"`.
  - Default: `"before"` when not specified or invalid, maintaining backward compatibility.
  - Implementation: option is correctly read from `context.options[0]` and threaded through the branch helpers.
- Tests cover:
  - Rule-level acceptance for both `"before"` and `"inside"` while preserving existing behavior.
  - Helper-level wiring for `gatherBranchCommentText` with both placement values.

What is **not yet done** (and remains in the NEXT checklist):

- Inside-brace-only semantics for `annotationPlacement: "inside"` (simple if/else, catch/else-if/loops, switch, etc.).
- Placement-specific error messaging and validation (flagging before-brace annotations as misplaced in inside mode).
- Autofix migration of annotations from before-brace to inside-brace.
- Alignment of `no-redundant-annotation` behavior with inside-placement semantics.
- User-facing documentation updates and GitHub issue #7 closure.

These will be addressed in subsequent increments, following the same pattern: small, behaviorally-focused changes with dedicated tests and passing CI at each step.
---
