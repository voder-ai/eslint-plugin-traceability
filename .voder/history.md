Here’s a concise history-only summary of the project work so far, including the most recent changes.

---

### `@supports`-first traceability and migration

- Implemented an `@supports`-first migration path from legacy `@story` / `@req` via `traceability/prefer-supports-annotation`.
- Auto-migrated simple legacy annotations in block comments, JSDoc, and line comments.
- Introduced a `LineComment` abstraction, updated tests and docs, and validated everything in CI.

---

### Function- and branch-level traceability rules

- Expanded `traceability/require-branch-annotation` to cover:
  - `switch` statements (including grouped fallthrough and `default`),
  - loops,
  - `else-if` chains.
- Added `REQ-SWITCH-FALLTHROUGH` traces, refactored comment gathering, and restored `else-if` autofix.
- Extended function-level rules (`require-story-annotation`, `require-req-annotation`) to:
  - support arrow functions and nested/anonymous callbacks,
  - look up annotations from parent scopes.
- Added tests and documentation, then ran the full toolchain.

---

### Unified traceability rule and aliases

- Introduced `traceability/require-traceability` to unify function- and branch-level behavior.
- Updated exports, presets, tests, and docs to focus on the unified rule.
- Converted `require-story-annotation` and `require-req-annotation` to aliases of `require-traceability` using `createAliasRule`.
- Reworked UX and documentation to be `@supports`-first across metadata, examples, migration guide, API reference, and README.

---

### Coverage improvements and internal refactors

- Increased Jest branch coverage for `annotation-checker`, pruning unrealistic tests.
- Refactored missing-`@req` reporting via `buildMissingReqReportOptions` and a simplified `reportMissing`.
- Expanded coverage for `branch-annotation-helpers.ts`, especially `gatherBranchCommentText` for `SwitchCase`, `CatchClause`, and loops, using realistic AST stubs.
- Re-ran lint, type-check, format, build, and CI.

---

### Documentation alignment with the unified model

- Updated README, API reference, examples, migration guide, and ESLint 9 setup docs to center on `require-traceability` and its aliases.
- Added `traceability-overview.md` and an FAQ and clarified unified-rule docs.
- Synchronized `src/index.ts`, README, and user docs and documented `no-redundant-annotation` severity and CLI test isolation.
- Ensured all API examples and dev stories are `@supports`-first and verified via CI and hooks.

---

### Redundant-annotation handling

- Documented redundant-annotation cleanup in the migration guide, including guarantees from `no-redundant-annotation` and common workflows.
- Raised branch coverage for `annotation-scope-analyzer`, focusing on comment-removal edge cases and added `[REQ-SAFE-REMOVAL]` tests.
- Refactored `no-redundant-annotation` helpers, extracting:
  - `getStatementPairsForRedundancy`,
  - `isStatementRedundantWithinScope`,
  - `getAnnotationCommentsFromStatement`.
- Rewrote `getRedundantStatementContext` using these helpers, simplified scope-pair collection, and expanded tests for nuanced redundancy scenarios.
- Ran the full quality suite.

---

### Helper utilities and extra coverage

- Added focused coverage for `require-story-utils.getNodeName` (various node types and defensive branches).
- Further increased `annotation-scope-analyzer` coverage for comment-removal behavior, including EOF and invalid ranges.
- Re-ran Jest, build, lint, type-check, and format.

---

### Version control, release, and contributing docs

- Updated dependencies (e.g., `ts-jest`), refreshed lockfile, and documented dependency health.
- Aligned CI/CD workflows, `semantic-release`, scripts, Husky hooks, contributing docs, and ADRs with current behavior.
- Added ADR 014 for version control and release strategy (trunk-based on `main`, Conventional Commits, CI-only releases).
- Updated ADR 006 and CI/CD docs for node matrix and secret scanning; clarified `ci-verify:full` and hooks.
- Updated `CONTRIBUTING.md` for semantic-release and the unified CI/CD workflow.
- Re-ran tests, lint, type-check, build, and format; confirmed CI.

---

### Unified rule integration tests

- Added `require-traceability-aliases.integration.test.ts` to exercise the unified rule and its aliases together against shared fixtures and diagnostics.
- Updated the related dev story’s Definition of Done and confirmed CI.

---

### CI behavior validation

- Ran a controlled CI session with intentional lint/format failures to confirm:
  - correct `main` vs `origin/main` handling,
  - that build/tests/type-check still pass while lint/format fail as expected.

---

### Test-callback exclusion (helpers and rule)

- Reviewed design and helpers for excluding test-framework callbacks from required function annotations.
- Implemented `excludeTestCallbacks` in function-level helpers:
  - Extended `ReportOptions` and plumbing in `require-story-helpers.ts`.
  - Implemented `isTestFrameworkCallback` and supporting constants to detect anonymous arrow callbacks passed to Jest/Vitest/Mocha-style helpers.
- Updated `require-story-annotation` to:
  - add `excludeTestCallbacks` (default `true`) to its schema,
  - pass the option into helper visitors.
- Added helper tests and rule-level tests verifying exclusion and behavior when `excludeTestCallbacks: false`.
- Documented `excludeTestCallbacks` in the API reference and dev stories.
- Ran tests, lint, type-check, format, and build; confirmed CI.

---

### Broadened test callback exclusion coverage

- Expanded `TEST_FUNCTION_NAMES` for core, focused, skipped, alias, and hook helpers (Jest/Mocha/Vitest), while explicitly never excluding Vitest `bench`.
- Ensured only simple identifiers are recognized (no dotted forms).
- Extended helper and rule tests for the larger helper set, Mocha APIs, and Vitest APIs (including `bench` behavior).
- Updated ADR 013 to accepted status, clarifying coverage and bench behavior.
- Ran tests and CI-verify; confirmed CI.

---

### Nested and wrapped test callbacks

- Updated the function-annotations dev story to:
  - detail supported test callbacks,
  - associate acceptance with `REQ-TEST-CALLBACK-EXCLUSION`,
  - document nested callbacks and wrapper behavior.
- Added helper tests for:
  - nested anonymous callbacks inside excluded test callbacks (inheritance),
  - callbacks passed to local wrappers being treated as non-excluded.
- Re-ran `ci-verify:fast`; confirmed CI/CD.

---

### Configurable additional test helper names

**Helpers**

- Introduced `CallbackExclusionOptions` with:
  - `excludeTestCallbacks?: boolean`,
  - `additionalTestHelperNames?: string[]`.
- Extended helper signatures (`requiresOwnFunctionAnnotation`, `shouldProcessNode`, etc.) to accept these options.
- Implemented logic to treat anonymous callbacks passed to configured names as test callbacks when `excludeTestCallbacks` is true.
- Guaranteed Vitest `bench` is never excluded, even if listed.
- Extracted callback-exclusion logic to `test-callback-exclusion.ts` (exports options, constants, `isRecognizedTestHelperName`, `isTestFrameworkCallback`).
- Added helper tests for custom helpers and `bench` non-exclusion.

**Rule-level**

- Extended `require-story-annotation` schema with `additionalTestHelperNames`.
- Wired options through visitors.
- Added rule tests confirming exclusion for custom helpers and non-exclusion for `bench`.

**Docs**

- Updated the function-annotations dev story and ADR 013 to cover `additionalTestHelperNames`.
- Ran targeted tests, ESLint, and `ci-verify:fast`; confirmed CI.

---

### Complexity threshold tightening

- Verified that lowering cyclomatic complexity to 16 across TS/JS passes.
- Updated `eslint.config.js` for `complexity: ["error", { max: 16 }]` in TS and JS rule blocks.
- Confirmed no code changes were required.
- Ran lint, type-check, duplication, format:check, tests, and build.
- Committed as `chore: tighten eslint complexity threshold to 16`.

---

### Integration tests for test callback exclusion with the unified rule

- Added `tests/integration/require-traceability-test-callbacks.integration.test.ts` to cover:
  - `require-traceability` and `require-story-annotation` together in a flat ESLint config,
  - JS/TS snippets using `describe`/`it`,
  - Vitest `bench` callbacks,
  - custom helper wrappers.
- Implemented `lintTextWithConfig` using `FlatESLint` and a helper `getRuleMessages`.
- Verified behavior of `excludeTestCallbacks`, `additionalTestHelperNames`, and invariants around `bench`.
- Iterated test snippets and expectations to account for annotation inheritance and exclusion logic.
- Ran targeted Jest, formatting, and the full quality suite; committed as `test: add integration coverage for test callback exclusion behavior`; confirmed CI/CD.

---

### Most recent work: type tightening and max-lines-per-function refactors

#### Typed test callback exclusion helper

- In `src/rules/helpers/test-callback-exclusion.ts`:
  - Imported `TSESTree` from `@typescript-eslint/utils`.
  - Introduced `TraceabilityNodeWithParent = TSESTree.Node & { parent?: TraceabilityNodeWithParent | null }`.
  - Updated `isTestFrameworkCallback` to accept `TraceabilityNodeWithParent | null | undefined` instead of `any`.
  - Typed the parent call expression as `TraceabilityNodeWithParent & TSESTree.CallExpression`.
- Kept all callback-exclusion behavior identical.
- Ran type-check, targeted lint, and targeted tests.
- Committed as `refactor: tighten types for test callback exclusion helper`.

#### Lowered max lines per function and split oversized helpers

- Reduced `max-lines-per-function` from 55 to 45 for TS and JS in `eslint.config.js`.
- Refactored functions exceeding the new limit:

**`src/index.ts`**

- Introduced `createAliasRuleMeta` to merge rule metadata for aliases.
- Extracted unified function-rule alias wiring into `wireUnifiedFunctionAnnotationAliases()` and invoked it.
- Extracted `prefer-supports-annotation` alias wiring into `wirePreferSupportsAlias()` and invoked it.
- Preserved existing alias behavior; relied on existing integration and plugin tests.

**`src/rules/valid-annotation-format.ts`**

- Added helpers:
  - `handleImplementsLine` for `@supports` lines.
  - `handleStoryOrReqLine` for `@story`/`@req` lines, now using trimmed values.
  - `extendPendingAnnotation` for continuation lines.
  - `processCommentLines` to drive line-by-line processing.
- Simplified `processComment` to delegate to `processCommentLines`.
- Reworked `processCommentLine` to orchestrate these helpers while preserving behavior for:
  - multi-line annotations,
  - non-traceability JSDoc tags,
  - pending annotation finalization.

**`src/rules/helpers/valid-annotation-format-validators.ts`**

- In `validateStoryAnnotation`:
  - Kept whitespace sensitivity but only rejects whitespace when the collapsed value fails the configured path pattern.
- In `validateReqAnnotation`:
  - Added a guard to skip extra `@req` validation when the collapsed value contains embedded `@supports`, so mixed `@req/@supports` usage is tolerated while pure multi-line IDs are still validated.

**`src/rules/helpers/valid-annotation-utils.ts`**

- Restored `collapseAnnotationValue` to its original behavior of stripping all whitespace.

**`src/rules/prefer-implements-annotation.ts`**

- Added `collectReqIndicesAfterStory` to scan following `@req` lines after a `@story`.
- Simplified `handleInlineStorySequence` to use the helper’s `{ reqIndices, nextIndex }` and removed an unused `n` variable.
- Introduced `advanceInlineGroupIndex` and simplified `processInlineGroup` to a small loop over `group.length`.

- Ran targeted linting, targeted tests for `valid-annotation-format` and `prefer-implements-annotation`, the full test suite, build, and formatting.
- Committed as `refactor: lower max function length and split oversized helpers`.

#### Plan and CI updates

- Updated `.voder/plan.md` to mark:
  - test callback exclusion typing task as complete,
  - lowering max function length and splitting helpers as complete.
- Ran `npm run ci-verify:full`, pushed to `main`, and waited for the `CI/CD Pipeline` workflow, which completed successfully.

**Most recently we've executed the following action:**

---
Used tool: get_git_status with input: {}
Used tool: run_command with input: {"command":"git","args":["describe","--tags","--abbrev=0"]}
Used tool: run_command with input: {"command":"git","args":["remote","get-url","origin"]}
Used tool: run_command with input: {"command":"gh","args":["issue","view","5","--json","number,title,state,stateReason,closedAt","--jq",".state"]}
Used tool: read_file with input: {"filePath":"docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md","startLine":1,"endLine":400}
Used tool: run_command with input: {"command":"gh","args":["issue","close","5","--comment","Function annotation rule and test callback exclusion shipped in v1.17.0; closing as completed."]}
Used tool: run_command with input: {"command":"gh","args":["issue","view","5","--json","state,stateReason,closedAt","--jq",".state"]}
Used tool: modify_file with input: {"filePath":"docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md","instruction":"In the Acceptance Criteria section, change the checkbox for \"**Issue #5 Resolution**\" from unchecked to checked, and append a short note mentioning that issue #5 was closed after release v1.17.0 with a closing comment referencing that version.\n\nIn the Definition of Done section, change the checkbox for the GitHub issue closure item from unchecked to checked, and update its text to indicate that issue #5 has been closed using `gh issue close 5 --comment \"Function annotation rule and test callback exclusion shipped in v1.17.0; closing as completed.\"` and verified with `gh issue view 5 --json state,stateReason,closedAt --jq '.state'` returning `\"CLOSED\"`.\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"docs: mark function-annotations story as complete after closing issue 5"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
---

**This was the result:**
---
Here’s what I’ve done to execute the plan, with tasks updated.

---

## Actions Performed

### ##NOW

- [x] Close the external GitHub issue that tracks the function-annotations work (issue #5) by adding a final comment that references the released version containing the completed implementation and then marking the issue as closed so its state is recorded as finished in GitHub.

**What I did**

1. Determined the latest released version:
   - `git describe --tags --abbrev=0` → `v1.17.0`.

2. Closed GitHub issue #5 with a version-referencing comment:
   - Command run:
     ```bash
     gh issue close 5 --comment "Function annotation rule and test callback exclusion shipped in v1.17.0; closing as completed."
     ```
   - GitHub CLI output confirmed the issue was closed.

3. Verified the issue state matches the story’s acceptance criterion:
   - Command run:
     ```bash
     gh issue view 5 --json state,stateReason,closedAt --jq .state
     ```
   - Output: `CLOSED`.

This satisfies **REQ-ISSUE-5-RESOLUTION** and the Acceptance Criterion “Issue #5 Resolution.”

---

### ##NEXT

- [x] Update the function-annotations story file so that the acceptance criterion and Definition of Done items related to the GitHub issue resolution are checked off and explicitly reference the closed issue and the release version that contained the fix.
- [x] Confirm that all tests and code annotations linked to the function-annotations story (including REQ IDs and @supports tags) still accurately describe the implemented behavior of the unified rule and test callback exclusion, and adjust any outdated wording in the story to match the current implementation.

**What I did**

1. Updated the story file `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md`:

   - In **Acceptance Criteria**, changed the “Issue #5 Resolution” item from unchecked to checked and added a note about the actual release/version:

     ```markdown
     - [x] **Issue #5 Resolution**: GitHub issue #5 is closed using with a comment referencing the release version. Verification: run `gh issue view 5 --json state,stateReason,closedAt --jq '.state'` and confirm output is `"CLOSED"`. `gh issue close 5 --comment "<message>"` can be used to complete this ONCE all the other acceptance criteria are met. Note: Issue #5 was closed after release v1.17.0 with a closing comment explicitly referencing that version.
     ```

   - In **Definition of Done**, changed the GitHub issue closure item from unchecked to checked and made it concrete with the exact command and verification used:

     ```markdown
     - [x] GitHub issue #5 closed using `gh issue close 5 --comment "Function annotation rule and test callback exclusion shipped in v1.17.0; closing as completed."` after feature is published and verified with `gh issue view 5 --json state,stateReason,closedAt --jq '.state'` returning `"CLOSED"`.
     ```

   This aligns the story text with the actual state and the exact commands used.

2. Confirmed implementation and tests still match the story:

   - Earlier assessments (and the latest test run) already show:
     - `require-traceability` unified rule and aliases (`require-story-annotation`, `require-req-annotation`) behave as documented.
     - Test-callback exclusion and `additionalTestHelperNames` work per **REQ-TEST-CALLBACK-EXCLUSION** and related requirements, with Vitest `bench` always enforced.
     - Story references and requirement IDs in tests (e.g., in `tests/rules/require-story-annotation.test.ts`, `tests/utils/req-annotation-detection.test.ts`, integration tests for unified rule/aliases) are consistent with `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md`.

   - No wording in the story conflicted with the implemented behavior; the only outdated part was the unchecked/forward-looking issue-closure items, which I updated as above.

3. Ran quality checks after doc update:

   - `npm test -- --runInBand`
   - `npm run lint`
   - `npm run type-check`
   - `npm run build`
   - `npm run format:check`

   All passed successfully.

4. Committed and pushed the changes:

   - Staged all changes: `git add -A`
   - Commit (docs-only logical change):
     ```text
     docs: mark function-annotations story as complete after closing issue 5
     ```
   - Push: `git push`

5. Verified CI/CD pipeline:

   - Observed the new “CI/CD Pipeline” run for main.
   - Waited for completion; conclusion: **success** (all quality gates and semantic-release pipeline passed).

---

## Updated Plan

### NOW

- [x] Close the external GitHub issue that tracks the function-annotations work (issue #5) by adding a final comment that references the released version containing the completed implementation and then marking the issue as closed so its state is recorded as finished in GitHub.

### NEXT

- [x] Update the function-annotations story file so that the acceptance criterion and Definition of Done items related to the GitHub issue resolution are checked off and explicitly reference the closed issue and the release version that contained the fix.
- [x] Confirm that all tests and code annotations linked to the function-annotations story (including REQ IDs and @supports tags) still accurately describe the implemented behavior of the unified rule and test callback exclusion, and adjust any outdated wording in the story to match the current implementation.

### LATER

- [ ] Remove any remaining inline lint rule suppressions in helper and rule modules by simplifying code or extracting utilities so that all enabled lint rules pass without local disables while keeping behavior unchanged.
- [ ] Extract small duplicated logic fragments in helper and rule modules into shared internal utilities so the duplication checker reports fewer clones without modifying public behavior or rule outputs.
- [ ] Incrementally tighten file-level size limits in the linting configuration and split oversized modules into smaller, focused files as those limits are ratcheted down, keeping each file easy to understand and maintain.
---
