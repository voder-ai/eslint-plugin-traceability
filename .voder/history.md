Here’s a concise, history-only summary of what’s been done so far on the project, including the most recent work, with no forward-looking plans.

---

### 1. Refactor of `valid-req-reference` rule
- Extracted parsing, validation, traversal, and file I/O into `valid-req-reference-helpers.ts`.
- Introduced `createValidReqReferenceProgramVisitor(context)` as the rule entrypoint.
- Simplified `valid-req-reference.ts` to only `meta`/`messages` and delegated `Program` handling to the helper.
- Ran full local quality suite (tests, lint, type-check, format, `ci-verify`) and confirmed CI success.
- Updated development docs to describe the helper-module pattern and placement under `src/rules/helpers` and `src/utils`.

### 2. Enhancements to `require-branch-annotation`
- Investigated control-flow coverage, identifying missing nested cases and performance requirements.
- Added nested-branch tests for valid/invalid nested `if` scenarios and autofix behavior (fixes only inner branches).
- Implemented a Jest performance test (`require-branch-annotation-large-file.test.ts`) using ESLint’s `Linter` to exercise deeply nested branches and assert runtime under 5000 ms while still producing diagnostics.
- Updated RuleTester expectations to include `output` for invalid nested cases.
- Reran full quality suite and confirmed CI success.

### 3. Test coverage and CI reliability
- Ran Jest with coverage and confirmed high coverage (~96.5% statements/lines, ~84.3% branches, ~99.6% functions).
- Determined earlier coverage failures were caused by missing `node_modules`, not code issues.
- Validated `ci-verify:full` without code changes.

### 4. Maintenance CLI review and improvements
- Reviewed `src/maintenance/*.ts` and tests, identifying under-tested paths in `verify`, `report`, performance, and an extra `fs.statSync` branch in `update.ts`.
- Added tests to cover:
  - `verify` exiting with code 1 and printing guidance on stale/invalid annotations.
  - `report` printing “nothing to report” and exiting 0 when no stale annotations exist.
  - Permission-denied behavior via a clearer detect test.
- Simplified `update.ts` by removing redundant `fs.statSync`/is-file checks and documenting reliance on `getAllFiles`, achieving full coverage there.
- Extended the maintenance CLI perf test to measure `verify` on a large synthetic workspace (exit code 1, under 5000 ms, expected output).
- Ran focused and full maintenance tests, updated `.voder/plan.md`, committed, and confirmed CI success.

### 5. Dogfooding and traceability enforcement
- Performed a dogfooding inspection pass (Story 023) across stories, problem docs, configs, plugin/rule entrypoints, scripts, and traceability checks.
- Ran `npm run check:traceability` to validate current behavior.
- Enabled `traceability/require-story-annotation` for TypeScript files in `eslint.config.js` covering `src` and `tests`.
- Adjusted ESLint test overrides to minimize inline `eslint-disable` comments and verified via `npm run report:eslint-suppressions`.
- Added `tests/integration/dogfooding-validation.test.ts` to:
  - Assert TS ESLint config sets `traceability/require-story-annotation` to `"error"`.
  - Run ESLint CLI on `src/dogfood.ts` without annotations and confirm non-zero exit and error output referencing the file.
- Iterated on the dogfooding integration test (using CLI, relaxing stdout assumptions) and removed now-unneeded inline disables.
- Ran the dogfooding integration test and full suite successfully.

### 6. Story and problem-doc updates for dogfooding
- Updated Story 023 to record:
  - `require-story-annotation` enabled.
  - Dogfooding validation test exists and passes.
  - Incremental dogfooding strategy.
- Updated `001-plugin-not-enforcing-own-traceability-rules.open.md` to:
  - Reference Story 023.
  - Describe the dogfooding integration test and its green status.
  - Mark mitigation as partial.

### 7. Documentation on dogfooding and self-validation
- Extended `docs/eslint-plugin-development-guide.md` with “Dogfooding and Self-Validation” describing:
  - Enabling traceability rules inside this repo.
  - One-rule-at-a-time rollout.
  - Roles of `report:eslint-suppressions` and `ci-verify:full`.
- Verified lint, CI, and Husky pre-push hooks run ESLint with `require-story-annotation` enforced on `src` and `tests`.

### 8. Plugin-level metadata and setup verification
- Added `pluginMeta` in `src/index.ts`, reading from `package.json` with fallbacks, exposing `name`, `version`, and `namespace: "traceability"`, and attached it as `meta` on the plugin export.
- Updated `tests/plugin-setup.test.ts` to assert:
  - Plugin exports `meta` with correct name and `"traceability"` namespace.
  - Version matches `package.json`.
- Updated test annotations to cover REQ-PLUGIN-STRUCTURE and REQ-NPM-PACKAGE.
- Revalidated plugin setup via targeted tests (plugin export/meta, configs, flat-config integration, CLI error handling) and full suite.
- Updated Story 001 to mark plugin setup acceptance criteria and DoD as complete and linked to registry/tests, config integration tests, plugin meta, and docs.
- Performed a documentation/quality pass on README, setup guides, and dev guides to ensure they match the actual plugin structure and workflow.

### 9. Traceability annotations in helpers
- Reviewed helper modules’ traceability annotations.
- Fixed inconsistencies in `valid-req-reference-helpers.ts` by removing/adjusting references to non-existent REQ IDs and realigning `@supports`/`@req` with actual stories and requirements.
- Confirmed other helper modules already had correct annotations.
- Updated the development guide to clarify helper-module annotation expectations, including multi-story `@supports`.
- Reran the quality suite.

### 10. Ongoing quality and CI checks
- After each work batch, repeatedly ran build, lint, tests (with coverage), type-check, format, `ci-verify`, and security scans.
- Confirmed all checks and CI pipelines remained green.

### 11. ESLint config validation and Story 002 implementation
- Reviewed Story 002 and the ESLint configuration:
  - Read `002.0-DEV-ESLINT-CONFIG.story.md`, `eslint.config.js`, traceability XML, and user docs.
  - Reviewed relevant rules and tests (`valid-story-reference`, `require-story-annotation`, `require-test-traceability`, `tests/config/*.test.ts`, and integration/CLI tests).
  - Confirmed alignment of flat-config patterns, presets, and rule schemas with ESLint 9 and story notes.
- Extended `tests/config/eslint-config-validation.test.ts` to cover runtime config error handling for `traceability/valid-story-reference`:
  - Errors on unknown option keys, checking messages for rule ID and unexpected property.
  - Errors on invalid option types (e.g., non-array `storyDirectories`), checking messages for rule ID, bad value, and array expectations.
  - Used `FlatESLint` with standard overrides and robust substring-based assertions.
- Updated Story 002 to:
  - Mark Error Handling acceptance criterion as complete.
  - Mark all DoD items (config loading, validation, rule-application tests) as complete.
  - Add Implementation Links to `src/index.ts` configs, docs, rule schemas, and config validation tests.
  - Confirm alignment with ADRs 001 and 009.
- Ran targeted config tests and full quality suite, committed (`test: add ESLint config validation error handling coverage`), pushed, and verified CI/CD success.

### 12. Inline-code ignore behavior for annotations (Story 024.0)
- Reviewed Story 024.0, related helpers, and existing tests for `valid-annotation-format`.
- Implemented centralized backtick-aware filtering in `normalizeCommentLine` (`valid-annotation-format-internal.ts`):
  - Trimmed input line.
  - Replaced backtick-wrapped segments with same-length spaces to preserve positions.
  - Ran annotation detection (`@story`, `@req`, `@supports`) on the filtered string.
  - If no annotation found, stripped leading `*` (JSDoc-style) from filtered text before returning.
  - If annotation found, returned `filtered.slice(annotationMatch.index)` so inline code before the annotation doesn’t affect extraction.
- Ensured consistent use of the filtered string for detection and returned values.
- Updated traceability annotations in the helper file (file header `@supports` and inline `@supports` on backtick-filtering logic).
- Added focused unit tests in `tests/rules/valid-annotation-format-internal.test.ts` to verify:
  - Backtick-wrapped `@story`/`@req` are ignored and replaced by correctly sized spaces.
  - Combined inline-code patterns normalize without false annotation detection.
  - Lines mixing inline-code references and real annotations normalize to the real annotation only.
  - Multiple inline-code segments per line are correctly filtered.
  - Lines without backticks but with real annotations normalize as expected.
- Tests call `normalizeCommentLine` directly and include `@story`/`@req` tags tied to Story 024.0.
- Verified integration with existing rule tests and confirmed `valid-annotation-format` behavior remained correct.
- Updated Story 024.0 to mark all Acceptance Criteria and DoD items complete and added Implementation Links.
- Ran `npm test` (focused and full with `--runInBand`), `build`, `lint`, `type-check` (twice), `format:check`, and `duplication`.
- Committed and pushed:
  - `fix: ignore inline-code annotation references in comment normalization`
  - `docs: mark inline-code ignore story 024.0 as implemented`
- Confirmed local `ci-verify:full` via pre-push hooks and successful CI/CD runs (e.g., run IDs 19987675537 and 19987706130).

### 13. Coverage for req annotation detection heuristics
- Investigated coverage for `src/utils/reqAnnotationDetection.ts` using:
  - `npm run coverage:branches`
  - Focused Jest runs and inspection via `scripts/extract-uncovered-branches.js`.
- Reviewed `tests/utils/annotation-checker.test.ts` and `src/utils/annotation-checker.ts`.
- Added `tests/utils/req-annotation-detection.test.ts` targeting `hasReqAnnotation` and its heuristics:
  - Behavior when `sourceCode` is missing.
  - Behavior when `node` is missing.
  - `try`/`catch` path by forcing `getCommentsBefore` to throw, confirming fallback to `hasReqInJsdocOrComments` via a JSDoc `@req`.
  - Confirmed `@supports` in comments is treated as satisfying requirement detection.
  - Included minimal `createMockSourceCode` helper.
  - Added header `@supports` for Story 003.0 and REQ-ANNOTATION-REQ-DETECTION.
- Ran focused Jest commands (including coverage collection for `reqAnnotationDetection.ts`).
- Improved focused coverage for `reqAnnotationDetection.ts` to ~95% statements/lines, ~84% branches, 100% functions on the targeted run.
- Staged and committed (`test: add coverage tests for req annotation detection heuristics`).
- Ran `npm run ci-verify:fast` and verified main CI/CD (`CI/CD Pipeline`, run ID 19988568223) succeeded with full checks and semantic-release.

### 14. CatchClause annotation position helpers and tests (most recent work)
- Investigated Story 025.0 (`DEV-CATCH-ANNOTATION-POSITION`), existing branch-annotation helpers, and tests.
- Extended `gatherBranchCommentText` in `src/utils/branch-annotation-helpers.ts`:
  - Left existing `SwitchCase` handling unchanged.
  - Always computed `beforeText` from `getCommentsBefore(node)`.
  - For `CatchClause`:
    - If `beforeText` contains `@story` or `@req`, returned `beforeText` directly (position priority).
    - Otherwise, if `node.body` exists and `sourceCode.getCommentsInside` is available, attempted to gather inside comments from the catch body, mapping and joining them.
    - Returned inside text when available; if calls to `getCommentsInside` throw or produce no useful text, fell back to `beforeText`.
  - For non-`CatchClause` nodes, continued returning `beforeText`.
  - Adjusted mapper/typing names (`_c`, `_node`) to satisfy lint rules and made the `getCommentsInside` call robust to errors via try/catch.
- Updated `getBranchAnnotationInfo` in the same helper:
  - Continued computing `missingStory`/`missingReq` from `gatherBranchCommentText`.
  - Initialized `indent` and `insertPos` from the branch line as before.
  - For `CatchClause` with a body:
    - If the body’s `body` array had a first statement with a `loc.start.line`, derived `indent` from that line and set `insertPos` to its start.
    - If the body was empty but had `loc.start`, used the block’s line, derived `blockIndent`, computed `innerIndent = blockIndent + "  "`, and set `insertPos` accordingly.
- Left `reportMissingStory`, `reportMissingReq`, and `reportMissingAnnotations` logic unchanged apart from using the updated `getBranchAnnotationInfo`.
- Added `tests/utils/branch-annotation-catch-position.test.ts`:
  - Created a `createMockSourceCode` helper with `lines`, `getCommentsBefore`, and `getCommentsInside`.
  - Tested:
    - Preference for before-catch annotations when present (both `@story` and `@req` before the catch; inside annotations ignored).
    - Fallback to inside-catch annotations when before-catch is empty.
    - Fallback to before-catch text when `getCommentsInside` is not implemented on `SourceCode`.
  - Included `@story` and `@supports` tags for Stories 004.0 and 025.0 and REQ IDs (dual-position detection, fallback, position priority, Prettier-safe autofix).
- Added `tests/utils/branch-annotation-catch-insert-position.test.ts`:
  - Verified that for a `CatchClause` with a single statement in its body, `reportMissingAnnotations` ultimately calls `fixer.insertTextBeforeRange` at the index corresponding to the first statement’s line, with inner indentation matching that line.
  - Used a minimal mock `context` with `getSourceCode`, `getIndexFromLoc`, and `report` that immediately invokes the fixer.
  - Removed an unused type import and adjusted typing to satisfy type-check and lint.
- Ran targeted and then full checks:
  - `npm test` on the new utils tests.
  - `npm test -- --runTestsByPath tests/rules/require-branch-annotation.test.ts`.
  - Full `npm test -- --ci --bail`.
  - `npm run lint -- --max-warnings=0`.
  - `npm run type-check`.
  - `npm run format` on the touched files and `npm run format:check`.
  - `npm run build` and `npm run duplication`.
- Committed the changes (CatchClause helper behavior and tests) and pushed.
- Verified GitHub Actions `CI/CD Pipeline` run `19990071286` completed successfully with all checks green.

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"."}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: read_file with input: {"filePath":".github/workflows/ci.yml"}
Used tool: read_file with input: {"filePath":"jest.config.js"}
Used tool: read_file with input: {"filePath":"tsconfig.json"}
Used tool: run_command with input: {"command":"node","args":["-v"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/rules/require-story-reference.test.ts","--runInBand"]}
Used tool: list_directory with input: {"dirPath":"tests"}
Used tool: list_directory with input: {"dirPath":"tests/rules"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: list_directory with input: {"dirPath":"docs/decisions"}
Used tool: read_file with input: {"filePath":"docs/decisions/002-jest-for-eslint-testing.accepted.md"}
Used tool: list_directory with input: {"dirPath":".github"}
Used tool: list_directory with input: {"dirPath":".github/workflows"}
Used tool: read_file with input: {"filePath":".github/workflows/ci-cd.yml"}
Used tool: search_file_content with input: {"filePath":"docs/decisions/003-code-quality-ratcheting-plan.md","pattern":"Node"}
Used tool: search_file_content with input: {"filePath":"CONTRIBUTING.md","pattern":"Node","isRegex":false}
Used tool: find_files with input: {"pattern":"*.md","directory":"docs/decisions"}
Used tool: search_file_content with input: {"filePath":"README.md","pattern":"Node","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs/decisions/adr-pre-push-parity.md","pattern":"Node","isRegex":false}
Used tool: search_file_content with input: {"filePath":"CONTRIBUTING.md","pattern":"Supported Node","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs/decisions/002-jest-for-eslint-testing.accepted.md","pattern":"Node 22","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs/decisions/004-automated-version-bumping-for-ci-cd.md","pattern":"Node","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs/decisions/adr-commit-branch-tests.md","pattern":"Node","isRegex":false}
Used tool: search_file_content with input: {"filePath":"package.json","pattern":"jest","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs/decisions/002-jest-for-eslint-testing.accepted.md","pattern":"ts-jest","isRegex":false}
Used tool: search_file_content with input: {"filePath":"README.md","pattern":"Jest","isRegex":false}
Used tool: search_file_content with input: {"filePath":"package-lock.json","pattern":"ts-jest","isRegex":false}
Used tool: run_command with input: {"command":"npm","args":["list","jest","ts-jest"]}
Used tool: run_command with input: {"command":"npm","args":["run","ci-verify:fast"]}
Used tool: get_git_status with input: {}
Used tool: read_file with input: {"filePath":"CONTRIBUTING.md"}
Used tool: search_file_content with input: {"filePath":"CONTRIBUTING.md","pattern":"Supported Node versions","isRegex":false}
Used tool: read_file with input: {"filePath":"README.md"}
Used tool: read_file with input: {"filePath":"docs/decisions/001-typescript-for-eslint-plugin.accepted.md"}
Used tool: run_command with input: {"command":"node","args":["-e","console.log(require('jest/package.json').engines)"]}
Used tool: run_command with input: {"command":"node","args":["-e","console.log(require('ts-jest/package.json'))"]}
Used tool: search_file_content with input: {"filePath":"docs/decisions/005-github-actions-validation-tooling.accepted.md","pattern":"Node","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs/decisions/adr-commit-branch-tests.md","pattern":"Node","isRegex":false}
Used tool: search_file_content with input: {"filePath":"docs/decisions/adr-pre-push-parity.md","pattern":"Node","isRegex":false}
Used tool: run_command with input: {"command":"git","args":["diff","--","package-lock.json"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"chore: normalize npm bundled dependency metadata"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19990434378,"timeout":600000}
Used tool: modify_file with input: {"filePath":"package.json","instruction":"Update the `engines.node` field to more precisely match Jest's supported Node versions while retaining the minimum 18.18.0 requirement. Replace the existing value \">=18.18.0\" with \"^18.18.0 || ^20.0.0 || ^22.0.0 || >=24.0.0\"."}
Used tool: modify_file with input: {"filePath":".github/workflows/ci-cd.yml","instruction":"In the `quality-and-deploy` job's strategy.matrix.node-version list, expand the single entry '22.14.0' to a matrix covering all supported Node majors. Replace the existing line `node-version: ['22.14.0']` with `node-version: ['18.18.0', '20.0.0', '22.14.0', '24.0.0']`. Leave the dependency-health job's node-version unchanged."}
Used tool: run_command with input: {"command":"git","args":["diff","--",".github/workflows/ci-cd.yml"]}
Used tool: get_git_status with input: {}
Used tool: modify_file with input: {"filePath":".github/workflows/ci-cd.yml","instruction":"Fix the typo in the semantic-release step where GITHUB_OUTPUT is misspelled. Replace `$GITHUBOUTPUT` with `$GITHUB_OUTPUT` to match the other lines. Do not change anything else."}
Used tool: modify_file with input: {"filePath":"CONTRIBUTING.md","instruction":"Under the \"Reporting Issues\" section where environment details are listed (node version, eslint version, OS), add a short sentence after the bullet list clarifying the officially supported Node.js versions for this project: \"This project officially supports Node.js 18.18.x, 20.x, 22.14.x, and 24.x, matching the test matrix and Jest/ts-jest compatibility.\" Keep the rest of the document unchanged."}
Used tool: modify_file with input: {"filePath":"README.md","instruction":"In the Installation section, update the \"Prerequisites\" line to clarify the supported Node.js range in line with the engines field. Replace \"Prerequisites: Node.js >=18.18.0 and ESLint v9+.\" with \"Prerequisites: Node.js 18.18.x, 20.x, 22.14.x, or 24.x and ESLint v9+.\" Leave everything else unchanged."}
Used tool: run_command with input: {"command":"git","args":["diff","--","package.json","README.md","CONTRIBUTING.md"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"chore: align Node support matrix with Jest and CI"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19990532792,"timeout":600000}
Used tool: get_github_run_details with input: {"runId":19990532792}
Used tool: get_github_workflow_logs with input: {"runId":19990532792,"jobId":"20.0.0"}
Used tool: get_github_workflow_logs with input: {"runId":19990532792}
Used tool: get_github_workflow_logs with input: {"runId":19990532792,"jobId":"Quality and Deploy (20.0.0)"}
Used tool: get_github_workflow_logs with input: {"runId":19990532792}
Used tool: run_command with input: {"command":"gh","args":["run","view","19990532792","--job","19990532792","--log"]}
Used tool: run_command with input: {"command":"npm","args":["run","security:secrets"]}
Used tool: get_github_pipeline_status with input: {}
Used tool: get_github_run_details with input: {"runId":19990532792}
Used tool: run_command with input: {"command":"gh","args":["run","view","19990532792","--log","--job","Quality and Deploy (20.0.0)"]}
Used tool: run_command with input: {"command":"gh","args":["run","view","19990532792","--log","--job","quality-and-deploy (20.0.0)"]}
Used tool: run_command with input: {"command":"gh","args":["run","view","19990532792","--log"]}
Used tool: modify_file with input: {"filePath":"package.json","instruction":"In the scripts section, update the `security:secrets` script to stop passing the unsupported `--no-color` flag to secretlint. Replace the current value `secretlint \"**/*\" --no-color` with `secretlint \"**/*\"` and leave all other scripts unchanged."}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"chore: fix secretlint invocation for multi-node CI matrix"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19990639988,"timeout":600000}
---

**This was the result:**
---
Here’s what I implemented for the **##NOW** and **##NEXT** sections, and how the project now behaves.

---

## What I found (##NOW)

- **Tooling stack in use**
  - Test runner: **Jest 30.2.0**
  - TS transformer: **ts-jest 29.4.5**
  - Language: **TypeScript 5.9.x**, compiled via `tsc`
  - Jest preset/config: `jest.config.js` uses `preset: "ts-jest"` and `transform` for `ts/tsx`.

- **Runtime + engine compatibility**
  - Local Node: `v22.17.1`.
  - Jest `engines` (from `jest/package.json`):
    - `^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0`
  - ts-jest `engines`:
    - `^14.15.0 || ^16.10.0 || ^18.0.0 || >=20.0.0`
  - Plugin’s declared engines (before change):  
    - `"node": ">=18.18.0"` in `package.json`.

- **Actual behavior under latest Node**
  - `npm test` (Jest full suite) passes on Node 22 locally:
    - 44 test suites, 318 tests, all passing.
  - `npm run ci-verify:fast` also passes (rules + maintenance subset).
  - There is **no current Jest startup error** under Node 22 with the existing Jest/ts-jest versions.

- **Constraint / gap identified**
  - The **engines field** was very loose (`>=18.18.0`), while Jest clearly limits support to specific majors.
  - CI previously only tested Node `22.14.0`, so compatibility on other Node majors (18, 20, 24) wasn’t being enforced by automation.
  - Some dev tooling (ESLint 9, semantic‑release, npm 11, secretlint) has **stricter or more specific engine ranges**, but these are dev-only and run in CI, not in consumers’ projects.

**Decision:**  
Keep Jest + ts-jest as-is (they’re already up-to-date and working) and **tighten the Node support story** by:
- Making the `engines.node` field explicitly match the **Jest-supported majors** while preserving the minimum `18.18.0`.
- Expanding CI to test against **all declared supported Node majors**.

This avoids unnecessary Jest churn and makes Node support explicit and verifiable.

---

## Changes implemented (##NEXT)

### 1. Implement the chosen fix for Jest/Node compatibility

**Files touched:**
- `package.json`

**What I changed:**

1. **Engines field aligned to Jest-supported majors**

   Updated:

   ```json
   "engines": {
-    "node": ">=18.18.0"
+    "node": "^18.18.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
   }
   ```

   Rationale:
   - Keeps the **minimum** at 18.18.0 (consistent with ESLint 9 and previous docs).
   - Explicitly declares support for the **same major ranges** Jest itself documents:
     - Node 18 (from 18.18.x)
     - Node 20
     - Node 22
     - Node 24+
   - Avoids promising support on Node 19, 21, or other untested majors.

2. **Verified tests and tooling still pass on local Node 22**

   - `npm run build`
   - `npm test`
   - `npm run lint`
   - `npm run type-check`
   - `npm run format:check`

   All pass successfully.

---

### 2. Align CI configuration with supported Node versions

**File touched:**
- `.github/workflows/ci-cd.yml`

**What I changed:**

1. **Expanded matrix to test all supported Node majors**

   In the `quality-and-deploy` job:

   ```yaml
   strategy:
     matrix:
-      node-version: ['22.14.0']
+      node-version: ['18.18.0', '20.0.0', '22.14.0', '24.0.0']
   ```

   - CI now runs the *full* `ci-verify:full` gate and `security:secrets` on:
     - Node **18.18.0**
     - Node **20.0.0**
     - Node **22.14.0**
     - Node **24.0.0**

2. **Kept semantic-release pinned to Node 22.14.0**

   The release step remains constrained:

   ```yaml
   if: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' && matrix['node-version'] == '22.14.0' && success() }}
   ```

   - Release automation still runs only in the **Node 22.14.0** job to avoid environment drift in publishing.
   - Other Node jobs purely validate compatibility.

3. **Fixed a typo introduced during YAML editing**

   - During first edit, `"$GITHUB_OUTPUT"` in one place was mistakenly changed to `"$GITHUBOUTPUT"`.
   - Corrected back to `"$GITHUB_OUTPUT"` so the semantic-release step behaves correctly.

4. **Resolved CI failure in the new Node 20 job (`security:secrets` step)**

   - Failure cause (Node 20 job):

     ```text
     TypeError [ERR_PARSE_ARGS_UNKNOWN_OPTION]: Unknown option '--no-color'
     ...
     at node_modules/secretlint/module/cli.js:161:33
     ```

   - The new secretlint CLI (v11.2.5) now uses Node’s `parseArgs` and **does not support `--no-color`**.
   - Fix in `package.json` scripts:

     ```json
     "scripts": {
-      "security:secrets": "secretlint \"**/*\" --no-color",
+      "security:secrets": "secretlint \"**/*\"",
       ...
     }
     ```

   - Verified locally:

     ```bash
     npm run security:secrets
     ```

     runs successfully.

   - Re-ran local full CI-equivalent gate (what pre-push runs):

     ```bash
     # invoked implicitly by pre-push hooks too
     npm run ci-verify:full
     ```

     All steps passed, including secretlint.

5. **Final CI verification**

   After pushing the changes:
   - The new **CI/CD Pipeline** run (`ID: 19990639988`) completed with **conclusion: success**.
   - All matrix jobs (Node 18.18.0, 20.0.0, 22.14.0, 24.0.0) passed:
     - `npm run ci-verify:full`
     - `npm run security:secrets`
     - Artifact uploads
   - No remaining Node- or Jest-related issues in CI.

---

### 3. Update documentation for supported Node versions

**Files touched:**
- `README.md`
- `CONTRIBUTING.md`

**What I changed:**

1. **User-facing README**

   In the **Installation** section:

   ```md
- Prerequisites: Node.js >=18.18.0 and ESLint v9+.
+ Prerequisites: Node.js 18.18.x, 20.x, 22.14.x, or 24.x and ESLint v9+.
   ```

   - Makes the supported Node range explicit and matches:
     - `package.json` `engines.node`
     - CI matrix (`18.18.0`, `20.0.0`, `22.14.0`, `24.0.0`)

2. **Contributor-facing docs**

   In **CONTRIBUTING.md**, after the environment bullets:

   ```md
4. Specify your environment:
   - `node` version: `node -v`
   - `eslint` version: `npx eslint -v`
   - Operating system and shell.

This project officially supports Node.js 18.18.x, 20.x, 22.14.x, and 24.x, matching the test matrix and Jest/ts-jest compatibility.
   ```

   - Ensures contributors know which Node versions are expected to work with the test suite and local tooling.

---

## Plan status

Updated plan with completed items:

## NOW

- [x] Analyze the existing test tooling stack and the Jest startup error under the latest supported Node version to decide whether to resolve the issue by upgrading Jest and its related tooling or by narrowing the officially supported Node engine range.

## NEXT

- [x] Implement the chosen fix for the Jest and Node compatibility issue, either by updating the Jest and ts-jest dependency chain and adjusting configuration or by tightening the Node engines field to match the versions where the tests are known to run successfully.
- [x] Align the continuous integration configuration with the final supported Node versions so that the test matrix explicitly covers all declared supported versions and reliably detects any future environment-specific test failures.
- [x] Review the testing and contribution documentation to ensure they clearly state the supported Node versions and any relevant notes about running the test suite locally, reflecting the changes made to the tooling or engine constraints.

## LATER

- [ ] Evaluate whether any remaining performance-heavy tests should be separated into a dedicated performance test script to keep the standard test run fast while still preserving coverage in CI.
- [ ] Periodically reassess Jest and related tooling versions as new Node releases appear to ensure that the supported Node matrix and dependency versions remain in sync without introducing environment-specific test failures.
- [ ] Consider adding a small automated check or badge that summarizes the currently supported Node versions based on the engines field and CI matrix, to make compatibility more visible to contributors and users.

All quality checks are currently passing locally and in CI, and the Node/Jest compatibility story is now explicit, enforced by the matrix, and documented.
---
