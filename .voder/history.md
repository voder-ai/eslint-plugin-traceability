Here’s a concise, history-only summary of what’s been done so far on the project:

1. **`valid-req-reference` rule refactor**
   - Extracted parsing/validation/traversal/file I/O into `valid-req-reference-helpers.ts`.
   - Exposed `createValidReqReferenceProgramVisitor(context)` as the entrypoint.
   - Simplified `valid-req-reference.ts` to meta/messages and delegated `Program` handling.
   - Ran tests, lint, type-check, format, `ci-verify`, and updated dev docs to describe the helper-module pattern.

2. **Improvements to `require-branch-annotation`**
   - Analyzed control-flow coverage and performance.
   - Added nested-branch tests (valid/invalid) verifying autofix only on inner branches.
   - Added a Jest performance test for large files (under 5000 ms while emitting diagnostics).
   - Updated RuleTester expectations to include `output` on nested invalid cases.
   - Re-ran the full quality suite successfully.

3. **Test coverage and CI reliability**
   - Ran Jest with coverage (≈96.5% statements/lines, ≈84.3% branches, ≈99.6% functions).
   - Identified historical coverage failures as due to missing `node_modules`, not code defects.
   - Validated `ci-verify:full` with unchanged code.

4. **Maintenance CLI enhancements**
   - Reviewed `src/maintenance/*.ts` and tests; identified under-tested paths and redundant `fs.statSync` usage in `update.ts`.
   - Added tests covering:
     - `verify` exit code 1 + guidance for stale/invalid annotations.
     - `report` “nothing to report” behavior with exit code 0.
     - Permission-denied behavior detection.
   - Simplified `update.ts` to rely on `getAllFiles` and removed redundant checks; achieved full coverage.
   - Extended performance tests for `verify` on synthetic large workspaces.
   - Updated `.voder/plan.md`, ran focused and full maintenance tests, and confirmed CI success.

5. **Dogfooding and enforcing traceability**
   - Performed a dogfooding inspection (Story 023) across stories, problem docs, configs, rule entrypoints, scripts, and traceability checks.
   - Enabled `traceability/require-story-annotation` for TypeScript files in `eslint.config.js` (`src` and `tests`).
   - Tuned ESLint overrides to reduce inline `eslint-disable` comments; validated with `npm run report:eslint-suppressions`.
   - Added `tests/integration/dogfooding-validation.test.ts` to assert:
     - TS ESLint config sets `traceability/require-story-annotation` to `"error"`.
     - ESLint fails on `src/dogfood.ts` when annotations are missing.
   - Iterated on the CLI-based dogfooding integration test and removed several inline disables.
   - Re-ran the new test and the full test suite.

6. **Dogfooding-related story and problem-doc updates**
   - Updated Story 023 to record that:
     - `require-story-annotation` is enabled.
     - A dogfooding validation test exists and passes.
     - Incremental dogfooding strategy is documented.
   - Updated `001-plugin-not-enforcing-own-traceability-rules.open.md` to reference Story 023, describe the green dogfooding test, and mark mitigation as partial.

7. **Dogfooding and self-validation documentation**
   - Expanded `docs/eslint-plugin-development-guide.md` with a “Dogfooding and Self-Validation” section describing:
     - Enabling traceability rules in the repo.
     - An incremental, one-rule-at-a-time rollout.
     - How `report:eslint-suppressions` and `ci-verify:full` fit into the process.
   - Verified that lint, CI, and Husky pre-push hooks run ESLint with `require-story-annotation` enabled for `src` and `tests`.

8. **Plugin-level metadata and setup verification**
   - Added `pluginMeta` in `src/index.ts`, reading from `package.json` and exposing `meta` with plugin `name`, `version`, and `namespace: "traceability"`.
   - Updated `tests/plugin-setup.test.ts` to assert:
     - Plugin `meta.name` and namespace.
     - Version parity with `package.json`.
   - Updated annotations for REQ-PLUGIN-STRUCTURE and REQ-NPM-PACKAGE.
   - Revalidated plugin export/meta, config integration, CLI error handling, and the full suite.
   - Updated Story 001 to mark plugin setup DoD and acceptance criteria as complete, linking to registry/tests, config tests, plugin meta, and docs.
   - Aligned README and guides with the current plugin structure.

9. **Traceability annotations in helper modules**
   - Reviewed helper modules for correct traceability tags.
   - Fixed `valid-req-reference-helpers.ts` annotations (removed invalid REQs, aligned `@supports`/`@req`).
   - Confirmed other helper annotations were consistent.
   - Clarified helper annotation expectations (including multi-story `@supports`) in the dev guide.
   - Re-ran the full quality suite.

10. **Ongoing quality and CI verification**
    - After each change batch, ran build, lint, tests (with coverage), type-check, format, `ci-verify`, and security scans.
    - Maintained green CI pipelines throughout.

11. **ESLint config validation and Story 002 completion**
    - Reviewed Story 002 and the ESLint flat-config setup.
    - Re-checked rules (`valid-story-reference`, `require-story-annotation`, `require-test-traceability`), config tests, and CLI/integration tests for flat-config behavior.
    - Ensured config patterns, presets, and rule schemas matched ESLint 9 and the story’s intent.
    - Extended `tests/config/eslint-config-validation.test.ts` to cover runtime config errors for `traceability/valid-story-reference`:
      - Unknown options mention rule ID and unexpected property.
      - Type errors (e.g., non-array `storyDirectories`) mention rule, bad value, and expected type.
    - Updated Story 002 to mark Error Handling and all DoD items complete, adding implementation links and confirming ADR alignment.
    - Ran targeted config tests and the full quality suite; CI/CD remained green.

12. **Inline-code ignore behavior for annotations (Story 024.0)**
    - Reviewed Story 024.0 and existing `valid-annotation-format` helpers/tests.
    - Implemented backtick-aware normalization in `normalizeCommentLine` (`valid-annotation-format-internal.ts`):
      - Trimmed lines and replaced backtick-wrapped spans with spaces.
      - Detected `@story`/`@req`/`@supports` only in the filtered string.
      - For annotation lines, returned from the annotation index onward; otherwise stripped leading `*`.
    - Updated helper annotations for Story 024.0.
    - Added `tests/rules/valid-annotation-format-internal.test.ts` covering:
      - Ignoring backtick-wrapped tags.
      - Mixed inline-code plus real annotations.
      - Multiple inline-code segments and non-backtick lines.
    - Verified integration with `valid-annotation-format` rule tests.
    - Updated Story 024.0 (AC and DoD marked complete, with implementation links).
    - Ran focused and full tests (`--runInBand`), build, lint, type-check (twice), `format:check`, and `duplication`.

13. **Coverage for `req` annotation detection heuristics**
    - Analyzed `src/utils/reqAnnotationDetection.ts` using branch coverage tools and targeted Jest runs.
    - Reviewed `tests/utils/annotation-checker.test.ts` and `src/utils/annotation-checker.ts`.
    - Added `tests/utils/req-annotation-detection.test.ts` to cover:
      - Missing `sourceCode`.
      - Missing `node`.
      - Error path from `getCommentsBefore` forcing fallback to `hasReqInJsdocOrComments`.
      - `@supports` in comments satisfying requirement detection.
    - Introduced a `createMockSourceCode` helper and traceability headers for Story 003.0 (REQ-ANNOTATION-REQ-DETECTION).
    - Raised coverage for `reqAnnotationDetection.ts` to about 95% statements/lines, 84% branches, 100% functions.
    - Committed tests and ran `npm run ci-verify:fast` successfully.

14. **CatchClause annotation position helpers and tests (Story 025.0)**
    - Investigated Story 025.0 and the branch-annotation helper logic.
    - Updated `gatherBranchCommentText` (`src/utils/branch-annotation-helpers.ts`) to:
      - Always compute `beforeText`.
      - For `CatchClause`:
        - Prefer `beforeText` if it contains `@story`/`@req`.
        - Otherwise, use inside-catch comments from `getCommentsInside(node.body)` when available.
        - Wrap `getCommentsInside` in try/catch and fall back to `beforeText` on error or empty result.
      - Leave non-`CatchClause` handling unchanged.
    - Updated `getBranchAnnotationInfo` to:
      - Preserve missing-story/missing-req logic.
      - Derive `indent`/`insertPos` from the catch body’s first statement, or from an empty body’s block start, so autofix inserts correctly.
    - Added:
      - `tests/utils/branch-annotation-catch-position.test.ts` to ensure:
        - Before-catch annotations override inside-catch annotations.
        - Inside-catch annotations are used when before-catch is empty.
        - Fallback behavior works without `getCommentsInside`.
      - `tests/utils/branch-annotation-catch-insert-position.test.ts` to validate:
        - Correct `CatchClause` autofix insertion line and indentation.
    - Cleaned up unused imports/types and ran targeted utils tests, `require-branch-annotation` tests, full Jest (`--ci --bail`), lint, type-check, format, build, duplication check.
    - Committed and pushed; CI/CD pipeline succeeded.

15. **Node/Jest/CI tooling investigation**
    - Reviewed `package.json`, `jest.config.js`, `tsconfig.json`, and CI workflows.
    - Verified Jest/ts-jest versions and `engines` constraints.
    - Confirmed:
      - Jest (30.2.0) is used with ts-jest (29.4.5).
      - Tests pass on local Node 22.
      - `npm run ci-verify:fast` passes.
    - Noted that Node 22 worked in practice while the `engines.node` range initially only claimed `>=18.18.0`.

16. **Normalization of bundled dependency metadata**
    - Ran `npm list jest ts-jest` and inspected `package-lock.json`.
    - Detected and normalized drift in bundled dependency metadata.
    - Committed `chore: normalize npm bundled dependency metadata`.
    - Verified build, tests, lint, type-check, and `format:check`; CI passed.

17. **Node support matrix alignment (engines, CI, docs)**
    - Updated `package.json` `engines.node` to `^18.18.0 || ^20.0.0 || ^22.0.0 || >=24.0.0`.
    - Updated `.github/workflows/ci-cd.yml`:
      - Expanded the `quality-and-deploy` matrix to Node 18.18.0, 20.0.0, 22.14.0, 24.0.0.
      - Fixed semantic-release env var usage (`$GITHUB_OUTPUT` instead of `$GITHUBOUTPUT`).
    - Updated documentation:
      - `README.md` installation notes to list these Node versions with ESLint v9+.
      - `CONTRIBUTING.md` to document official Node versions and Jest/ts-jest compatibility.
    - Ran build, tests, lint, type-check, `format:check`.
    - Committed `chore: align Node support matrix with Jest and CI`; multi-Node CI passed.

18. **Secretlint / multi-Node CI compatibility**
    - Investigated Node 20 CI failure in `security:secrets` due to `secretlint` rejecting `--no-color`.
    - Updated `package.json` `security:secrets` script to remove `--no-color`.
    - Re-ran build, tests, lint, type-check, `format:check`.
    - Committed `chore: fix secretlint invocation for multi-node CI matrix`.
    - Confirmed success across all Node versions for `ci-verify:full` and `security:secrets`.

19. **Migration to `prefer-supports-annotation` with deprecated alias (Story 010.3, REQ‑RULE‑NAME)**
    - In `src/index.ts`:
      - Kept `RULE_NAMES` referencing `"prefer-implements-annotation"` as the implementation key.
      - Simplified the rules map type to `Record<string, Rule.RuleModule>`.
      - Added alias wiring that:
        - Looks up `rules["prefer-implements-annotation"]`.
        - Clones it into `rules["prefer-supports-annotation"]` with `meta.deprecated = false`.
        - Marks the original `prefer-implements-annotation` rule `meta.deprecated = true`, sets `replacedBy = ["prefer-supports-annotation"]`, and appends a deprecation note to `meta.docs.description`.
      - Verified that both names appear in `Object.keys(p.rules)` from the built artifact.
    - Tests:
      - Updated `tests/rules/prefer-implements-annotation.test.ts`:
        - Describe block now references both rule names.
        - Kept the implementation import from `prefer-implements-annotation`.
        - Added a second `ruleTester.run("prefer-supports-annotation", ...)` with identical cases.
        - Extended configuration tests verifying both keys are absent from presets and behave identically when configured via flat config.
      - Updated `tests/plugin-default-export-and-configs.test.ts` to assert the expected rule-name list now includes both `"prefer-implements-annotation"` and `"prefer-supports-annotation"` in the correct order.
    - Documentation:
      - `docs/rules/prefer-implements-annotation.md`:
        - Retitled to `prefer-supports-annotation` and reframed the rule under the new name.
        - Added a deprecated-alias note for `traceability/prefer-implements-annotation`.
        - Updated examples to use the new key while mentioning the alias.
      - `user-docs/api-reference.md`:
        - Described `prefer-supports-annotation` as primary, with the alias clearly marked as deprecated.
        - Updated section headings, narrative, and examples.
      - `user-docs/migration-guide.md`:
        - Renamed the relevant section and updated references to the new rule name.
        - Added notes on the deprecated alias and updated configuration snippets.
      - `README.md`:
        - Updated the rule list entry to use `traceability/prefer-supports-annotation` as canonical, with the alias listed as deprecated-but-supported.
    - Quality checks:
      - Ran `npm run type-check`, Jest (`--runInBand`), `npm run lint`, `npm run format` on touched files, `npm run format:check`, and `npm run build`.
      - Committed as `refactor: introduce prefer-supports-annotation primary rule name with deprecated alias`.
      - Pushed and verified CI/CD success.

20. **Story 025.0 documentation alignment with implementation (most recent actions)**
    - Analyzed current CatchClause behavior and tests:
      - Inspected `src/utils/branch-annotation-helpers.ts` (`gatherBranchCommentText`, `getBranchAnnotationInfo`).
      - Reviewed CatchClause-focused tests:
        - `tests/utils/branch-annotation-catch-position.test.ts`
        - `tests/utils/branch-annotation-catch-insert-position.test.ts`
        - Relevant cases in `tests/rules/require-branch-annotation.test.ts`.
      - Reviewed related stories and user docs for context:
        - `docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md`
        - `docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md`
        - `docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md`
        - `docs/stories/008.0-DEV-AUTO-FIX.story.md`
        - `docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md`
        - `docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md`
        - `docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md`
        - `user-docs/api-reference.md`.
      - Searched for related traceability requirement IDs and story references across `src`, `tests`, and `docs`.
    - Updated `docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md`:
      - Acceptance Criteria:
        - Marked as completed: Before-Catch Position, Inside-Catch Position, Position Priority, Auto-Fix Compatibility, No Regression.
        - Left Prettier Compatibility unchecked, with a note that it’s indirectly covered by inside-catch detection and insert-position logic but lacks an explicit end-to-end Prettier integration test.
      - Definition of Done:
        - Marked as completed: core acceptance criteria, CatchClause dual-position handling in `gatherBranchCommentText`, unit tests for annotation position scenarios, autofix insert-position behavior, and no regressions.
        - Left explicit Prettier integration test and some documentation/migration-guide updates unchecked, with brief notes calling these out as still open.
      - Added a new `## Implementation Links` section listing:
        - `src/utils/branch-annotation-helpers.ts` (CatchClause logic).
        - `src/rules/require-branch-annotation.ts` (rule wiring).
        - `tests/utils/branch-annotation-catch-position.test.ts`.
        - `tests/utils/branch-annotation-catch-insert-position.test.ts`.
        - `tests/rules/require-branch-annotation.test.ts`.
    - Verified behavior and traceability:
      - Ran targeted Jest tests:
        - `tests/utils/branch-annotation-catch-position.test.ts`
        - `tests/utils/branch-annotation-catch-insert-position.test.ts`
        - `tests/rules/require-branch-annotation.test.ts`
      - Confirmed that CatchClause dual-position detection, fallback behavior, and autofix positioning behave as described in Story 025.0.
      - Verified that helper and test files carry appropriate `@story` / `@supports` annotations referencing Story 025.0 and related requirements.
      - Ran `npm run ci-verify:fast` (type-check, traceability checks, duplication, tests).
    - Performed a brief scan of related stories:
      - Confirmed that the base branch-annotation story (004.0), auto-fix and test-annotation stories (008.0, 020.0, 021.0), and multi-story support (010.2) were already aligned with existing implementations.
      - Verified that Story 026.0 (else-if Prettier compatibility) remains correctly marked as not yet implemented without conflicting tests or code references.
    - Committed documentation-only changes as:
      - `docs: align catch annotation story with current implementation`
    - Pushed changes and observed the GitHub “CI/CD Pipeline” workflow complete successfully for that commit.

**Most recently we've executed the following action:**

---
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts"}
Used tool: find_files with input: {"pattern":"*reqAnnotationDetection*","directory":"tests"}
Used tool: list_directory with input: {"dirPath":"tests/utils"}
Used tool: read_file with input: {"filePath":"tests/utils/req-annotation-detection.test.ts"}
Used tool: read_file with input: {"filePath":"jest.config.js"}
Used tool: find_files with input: {"pattern":"*coverage-final.json","directory":"."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--coverage","--runInBand","--ci","--","src/utils/reqAnnotationDetection.ts","tests/utils/req-annotation-detection.test.ts"]}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-io.ts","startLine":1,"endLine":140}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-io.ts","startLine":140,"endLine":320}
Used tool: read_file with input: {"filePath":"package.json","startLine":1,"endLine":200}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts","startLine":40,"endLine":120}
Used tool: read_file with input: {"filePath":"scripts/extract-uncovered-branches.js","startLine":1,"endLine":260}
Used tool: search_file_content with input: {"filePath":"src/utils/reqAnnotationDetection.ts","pattern":"//","isRegex":false}
Used tool: modify_file with input: {"filePath":"tests/utils/req-annotation-detection.test.ts","instruction":"Append additional tests at the end of the file to cover uncovered branches in src/utils/reqAnnotationDetection.ts, including: (1) linesBeforeHasReq returns false when lines is not an array or startLine is not a number; (2) parentChainHasReq returns false when sourceCode.getCommentsBefore is not a function and leadingComments/parent chain lacks req/supports; (3) parentChainHasReq returns true when sourceCode.getCommentsBefore returns comments containing @req; (4) fallbackTextBeforeHasReq returns false when sourceCode.getText is not a function or node.range is not an array; (5) fallbackTextBeforeHasReq returns true when text window contains @req; (6) fallbackTextBeforeHasReq returns false when getText throws; (7) hasReqInAdvancedHeuristics short-circuits and returns false when sourceCode or node is missing; (8) hasReqAnnotation returns true when jsdoc contains @supports and advanced heuristics are false. Use createMockSourceCode helper where helpful, and preserve existing imports and describe block. Keep tests within the existing describe block. Ensure new tests use requirement IDs in names as in existing tests."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--coverage","--runInBand","--ci","--","src/utils/reqAnnotationDetection.ts","tests/utils/req-annotation-detection.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--coverage","--runInBand","--ci"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: add coverage tests for req annotation detection heuristics"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19991895911,"timeout":600000}
Used tool: modify_file with input: {"filePath":"tests/utils/req-annotation-detection.test.ts","instruction":"Before the final closing `});` of the describe block, insert a new Jest test case that verifies hasReqAnnotation swallows exceptions thrown by context.getSourceCode itself and still falls back to jsdoc/comments. The test name should include the requirement ID like the others. Example structure:\n\n  it(\"[REQ-ANNOTATION-REQ-DETECTION] falls back to jsdoc/comments when context.getSourceCode throws\", () => {\n    const context = {\n      getSourceCode() {\n        throw new Error(\"boom from getSourceCode\");\n      },\n    } as any;\n\n    const jsdoc = { value: \"/** @req REQ-FROM-GETSOURCECODE */\" } as any;\n\n    const has = _hasReqAnnotation(jsdoc, [], context, { parent: {} } as any);\n\n    expect(has).toBe(true);\n  });\n\nKeep indentation consistent with existing tests."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci","--","tests/utils/req-annotation-detection.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","tests/utils/req-annotation-detection.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check","--","tests/utils/req-annotation-detection.test.ts"]}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts","startLine":100,"endLine":140}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: extend req annotation detection coverage"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19991953822,"timeout":600000}
---

**This was the result:**
---
## What I implemented

### ✅ NOW

- [x] Design and add focused unit tests that cover the currently uncovered edge-case branches in the req-annotation detection helper so those paths are exercised and verified against their intended behavior.

I extended the existing unit tests in:

- `tests/utils/req-annotation-detection.test.ts`

to more fully exercise `src/utils/reqAnnotationDetection.ts`.

**Behaviors covered by the new tests:**

All tests use the existing traceability header:

```ts
/**
 * Tests for advanced @req detection heuristics
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
```

and requirement IDs in test names.

1. **`linesBeforeHasReq` edge paths**

   - Returns `false` when `sourceCode.lines` is **not an array**:
     ```ts
     it("[REQ-ANNOTATION-REQ-DETECTION] linesBeforeHasReq returns false when lines is not an array", () => { … });
     ```
   - Returns `false` when `startLine` is **not a number** (invalid/missing `loc`):
     ```ts
     it("[REQ-ANNOTATION-REQ-DETECTION] linesBeforeHasReq returns false when startLine is not a number", () => { … });
     ```

2. **`parentChainHasReq` edge and success paths**

   - Returns `false` when `sourceCode.getCommentsBefore` is **not a function** and no parent `leadingComments` contain `@req`/`@supports`:
     ```ts
     it("[REQ-ANNOTATION-REQ-DETECTION] parentChainHasReq returns false when getCommentsBefore is not a function and no leadingComments/parents have req", () => { … });
     ```
   - Returns `true` when `getCommentsBefore` returns comments containing `@req` on a parent:
     ```ts
     it("[REQ-ANNOTATION-REQ-DETECTION] parentChainHasReq returns true when getCommentsBefore returns comments containing @req", () => { … });
     ```

3. **`fallbackTextBeforeHasReq` guard and success paths**

   - Returns `false` when `sourceCode.getText` is **not a function**:
     ```ts
     it("[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns false when getText is not a function", () => { … });
     ```
   - Returns `false` when `node.range` is **not an array**:
     ```ts
     it("[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns false when node.range is not an array", () => { … });
     ```
   - Returns `true` when the fallback text window **contains `@req`**:
     ```ts
     it("[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns true when text window contains @req", () => { … });
     ```
   - Returns `false` when `getText` itself **throws**, exercising the internal `try/catch`:
     ```ts
     it("[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns false when getText throws", () => { … });
     ```

4. **`hasReqInAdvancedHeuristics` short-circuit behavior**

   - Short-circuits and returns `false` when `sourceCode` is missing (no `getSourceCode` available):
     ```ts
     it("[REQ-ANNOTATION-REQ-DETECTION] hasReqInAdvancedHeuristics short-circuits and returns false when sourceCode is missing", () => { … });
     ```
   - Short-circuits and returns `false` when `node` is missing:
     ```ts
     it("[REQ-ANNOTATION-REQ-DETECTION] hasReqInAdvancedHeuristics short-circuits and returns false when node is missing", () => { … });
     ```

5. **`hasReqAnnotation` fallback behavior and JSDoc handling**

   - Confirms that when **advanced heuristics return false**, but JSDoc contains `@supports`, the function still returns `true`:
     ```ts
     it("[REQ-ANNOTATION-REQ-DETECTION] hasReqAnnotation returns true when jsdoc contains @supports and advanced heuristics are false", () => { … });
     ```
   - New edge case: `context.getSourceCode` itself **throws**, and `hasReqAnnotation` swallows the error and falls back to JSDoc/comments:
     ```ts
     it("[REQ-ANNOTATION-REQ-DETECTION] falls back to jsdoc/comments when context.getSourceCode throws", () => { … });
     ```

These tests build on the original ones (missing `sourceCode`/`node`, advanced heuristics throwing via `getCommentsBefore`, and `@supports` in comments) to cover the previously uncovered edge branches around guards and error-handling in the helpers.

After adding these, I ran:

- `npm test -- --coverage --runInBand --ci`

Key result for `src/utils/reqAnnotationDetection.ts`:

- Statements: **99.14%**
- Branches: **96.61%**
- Functions: **100%**
- Lines: **99.14%**

Only two non-critical lines remain uncovered, and all key branches/guards in the heuristics are now exercised.

A first commit captured this work:

- `test: add coverage tests for req annotation detection heuristics`


### ✅ NEXT

- [x] Review updated coverage and confirm that all key branches in the req-annotation detection helper are now covered, adjusting or adding tests if any paths remain untested or mis-specified.

I reviewed the updated Jest coverage summary (full suite) and focused on `src/utils/reqAnnotationDetection.ts`. After the first wave of tests, branch coverage was already high; after the final additions, coverage is as above (≈99% statements / ≈97% branches, 100% functions).

I then added one more targeted test (the `context.getSourceCode` throws scenario) to explicitly exercise the outer `try/catch` in `hasReqAnnotation`, ensuring that:

- Exceptions thrown while obtaining `sourceCode` are swallowed, and
- JSDoc/comment-based detection still runs.

Re-running the **full** test suite with coverage confirmed:

- Global thresholds all satisfied (per `jest.config.js`: 90/80/90/90),
- `reqAnnotationDetection.ts` with very high coverage and only minor non-essential uncovered lines remaining.

No mis-specified expectations surfaced; all tests align with the intended behavior described in the function comments and stories.

---

- [x] Ensure the new tests and any touched helper code are correctly annotated with the appropriate story and requirement IDs, keeping traceability aligned with the detection requirements story.

Traceability checks:

- The test file retains and continues to use:
  ```ts
  /**
   * Tests for advanced @req detection heuristics
   * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
   */
  ```
- All new tests include the requirement ID in their names, e.g.:
  - `"[REQ-ANNOTATION-REQ-DETECTION] linesBeforeHasReq returns false when lines is not an array"`
  - `"[REQ-ANNOTATION-REQ-DETECTION] falls back to jsdoc/comments when context.getSourceCode throws"`

I did not modify the production helper `src/utils/reqAnnotationDetection.ts`, so no new code-level annotations were needed there.

`npm run check:traceability` ran (as part of `ci-verify:full` in pre-push and CI) and passed, confirming traceability completeness.

---

- [x] Briefly review neighboring annotation-detection utilities and tests to spot any similar uncovered edge paths and, where practical, extend tests to close the most important gaps.

Neighboring utilities in `src/utils`:

- `annotation-checker.ts`
- `branch-annotation-helpers.ts`
- `storyReferenceUtils.ts`

From the full coverage run:

- `annotation-checker.ts`: 95.93% statements, 80.64% branches
- `branch-annotation-helpers.ts`: 97.18% statements, 84.78% branches
- `storyReferenceUtils.ts`: 99.09% statements, 97.05% branches

All three already have strong coverage, with no 0% files or glaring untested regions. The remaining missed branches are localized to a small number of lines and are mostly minor alternative paths rather than entire untested features.

Given this, in this cycle I:

- **Reviewed** the coverage for these neighboring files to ensure there were no obvious holes akin to the earlier `reqAnnotationDetection` gaps.
- **Did not** add further tests here, as the cost/benefit for the remaining tiny coverage gaps was lower than for the `req` detection helper and the plan only asked to extend tests “where practical.”

This satisfies the requested brief review without introducing unnecessary changes.

---

## Quality checks and CI

Before each push, the Husky **pre-push** hook ran:

- `npm run ci-verify:full`
- `npm run security:secrets`

This includes build, type-check, lint, duplication, full Jest with coverage, format check, audits, and traceability checks.

Additionally, I ran targeted commands during development:

- `npm test -- --runInBand --ci -- tests/utils/req-annotation-detection.test.ts`
- `npm run lint -- tests/utils/req-annotation-detection.test.ts`
- `npm run type-check`
- `npm run format:check`

All passed.

After each push, the **CI/CD Pipeline** workflow on GitHub Actions was automatically triggered for `main`. I monitored the latest runs:

- Run ID `19991895911`: **success**
- Run ID `19991953822`: **success**

No CI steps failed; semantic-release evaluated commits and (as expected for `test:` changes) did not publish a new release.

---

## Updated plan

### NOW

- [x] Design and add focused unit tests that cover the currently uncovered edge-case branches in the req-annotation detection helper so those paths are exercised and verified against their intended behavior.

### NEXT

- [x] Review updated coverage and confirm that all key branches in the req-annotation detection helper are now covered, adjusting or adding tests if any paths remain untested or mis-specified.
- [x] Ensure the new tests and any touched helper code are correctly annotated with the appropriate story and requirement IDs, keeping traceability aligned with the detection requirements story.
- [x] Briefly review neighboring annotation-detection utilities and tests to spot any similar uncovered edge paths and, where practical, extend tests to close the most important gaps.
---
