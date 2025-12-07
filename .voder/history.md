Here’s a history-only summary of what’s been done so far on the project, including the most recent work:

1. **Core rule refactors and improvements**
   - Refactored `valid-req-reference` to delegate parsing/validation/traversal/I/O into `valid-req-reference-helpers.ts`, and updated developer docs to describe this helper-module pattern. Ran the full quality suite.
   - Optimized `require-branch-annotation` control flow and performance, especially for nested branches. Added nested-branch tests to ensure autofix only affects inner branches, introduced a Jest performance test for large files, updated RuleTester expectations, and re-ran all checks.

2. **Test coverage, CI, and maintenance tooling**
   - Ran Jest with coverage, confirmed high coverage levels, and diagnosed CI anomalies as missing `node_modules` rather than code issues. Verified `ci-verify:full` on stable paths.
   - Reviewed `src/maintenance/*.ts` scripts, removed redundant `fs.statSync` calls, expanded tests for `verify` (exit codes, no-op, permission errors), simplified `update.ts` to use `getAllFiles`, and extended performance tests. Updated `.voder/plan.md` and confirmed CI stayed green.

3. **Dogfooding and traceability enforcement**
   - Completed a full dogfooding pass (Story 023) across stories, problems, rules, scripts, and checks.
   - Enabled `traceability/require-story-annotation` for TypeScript in `eslint.config.js`, tuned overrides to reduce inline disables, and validated with `report:eslint-suppressions`.
   - Added `tests/integration/dogfooding-validation.test.ts` to enforce story annotations across the repo.
   - Updated Story 023 and problem document `001-plugin-not-enforcing-own-traceability-rules.open.md` to record enforcement and the successful dogfooding test.
   - Expanded `docs/eslint-plugin-development-guide.md` with a “Dogfooding and Self-Validation” section and confirmed lint, CI, and Husky pre-push all run ESLint with `require-story-annotation` on `src` and `tests`.

4. **Plugin metadata and setup verification**
   - Added a `pluginMeta` export in `src/index.ts` (name, version, namespace).
   - Extended `tests/plugin-setup.test.ts` to assert the metadata fields and ensure the plugin version matches `package.json`.
   - Updated traceability annotations for REQ-PLUGIN-STRUCTURE and REQ-NPM-PACKAGE, revalidated exports/configuration and CLI error behavior, and refreshed Story 001 and related docs.

5. **Annotation and traceability helper alignment**
   - Audited helper-module traceability annotations (including `valid-req-reference-helpers.ts`) for correct `@supports` / `@req` usage and clarified expectations in the dev guide. Re-ran the full quality suite.
   - Implemented backtick-aware normalization in `normalizeCommentLine` so inline code spans are ignored when detecting `@story` / `@req` / `@supports` (Story 024.0). Added inline-code tests in `valid-annotation-format-internal.test.ts`, updated helper annotations, and ran full quality commands.
   - Improved `req` annotation detection heuristics in `src/utils/reqAnnotationDetection.ts`, adding tests for missing `sourceCode`/`node`, error paths, `@supports` coverage, and heuristics like `linesBeforeHasReq` and `parentChainHasReq`. Introduced `createMockSourceCode`, tied tests to Story 003.0, and achieved very high coverage (~99% statements, ~97% branches).

6. **Branch-annotation behavior for catch and else-if**

   - **CatchClause behavior (Story 025.0):**
     - Updated `gatherBranchCommentText` and `getBranchAnnotationInfo` to detect comments both before `catch` and inside the body.
     - Added tests for catch-position priority and autofix insertion; removed unused imports.
     - Created `tests/integration/catch-annotation-prettier.integration.test.ts` to verify `require-branch-annotation` works with Prettier 3.6.2, including empty catches with comment-only bodies.
     - Enhanced `branch-annotation-helpers.ts` with `extractCommentValue` and `gatherCatchClauseCommentText`, including fallback scans of lines inside the catch body.
     - Documented CatchClause behavior and Prettier compatibility in `docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md`, `docs/rules/require-branch-annotation.md`, and `user-docs/api-reference.md`, and added targeted tests and implementation links.

   - **Else-if behavior (Story 026.0):**
     - Implemented else-if-aware helpers in `branch-annotation-helpers.ts` (`isElseIfBranch`, updated `gatherBranchCommentText` / `getBranchAnnotationInfo` with a `parent` parameter) and adjusted insertion positions to match Prettier’s wrapped style.
     - Updated `reportMissingAnnotations` to pass the direct parent via ancestors.
     - Added unit tests in `tests/rules/require-branch-annotation.test.ts` ensuring all `IfStatement` branches (including `else if`) require annotations and that else-if chains are reported/autofixed consistently.
     - Added `tests/integration/else-if-annotation-prettier.integration.test.ts` (gated by `TRACEABILITY_EXPERIMENTAL_ELSE_IF`) to validate ESLint + Prettier behavior on realistic else-if code.
     - Refined `gatherElseIfCommentText` with `scanElseIfPrecedingComments`, `scanElseIfBetweenConditionAndBody`, and `scanElseIfInsideBlockComments`, simplifying logic to use these in priority order and honoring existing annotated `beforeText`.
     - Added focused helper tests: `tests/utils/branch-annotation-else-if-position.test.ts` and `tests/utils/branch-annotation-else-if-insert-position.test.ts`.
     - Updated `docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md` to mark implementation criteria as satisfied and added an “Implementation Links” section.

7. **Annotation format performance**
   - For Story 005.0, validated annotation format performance by adding `tests/perf/valid-annotation-format-large-file.test.ts`. This generates large TS sources with many annotations, runs `traceability/valid-annotation-format` via `Linter`, asserts diagnostics, and enforces a runtime under 5 seconds. Tests were tied to Story 005.0 and included in perf/full suites.

8. **Plugin configuration, ESLint 9 alignment, and story closure**
   - Re-reviewed Story 002 and the ESLint flat config (including `valid-story-reference`, `require-story-annotation`, `require-test-traceability` rule configs and integration tests).
   - Ensured alignment with ESLint 9 patterns, presets, and schemas.
   - Extended `tests/config/eslint-config-validation.test.ts` to cover runtime config errors for `traceability/valid-story-reference`.
   - Marked Story 002’s Definition of Done as complete and re-ran quality checks.

9. **Runtime, tooling, and dependency alignment**
   - Investigated compatibility among Node, Jest, ts-jest, and CI; confirmed Jest 30.2.0 and ts-jest 29.4.5 run on Node 22 despite earlier `engines.node` constraints.
   - Ran `npm list` and inspected `package-lock.json` to normalize dependency metadata, then re-verified build, tests, lint, type-check, and formatting.
   - Updated `package.json` `engines.node` to support Node 18.18, 20, 22, and 24+, and aligned the CI matrix in `.github/workflows/ci-cd.yml`.
   - Fixed semantic-release environment variable handling, updated `README.md` and `CONTRIBUTING.md` for Node/Jest/ts-jest compatibility, and confirmed multi-Node CI success.
   - Resolved Secretlint issues on Node 20 by dropping `--no-color` from `security:secrets` and re-ran `ci-verify:full` and secret scans across all supported Node versions.

10. **Rule naming and migration support**
    - Implemented migration from `prefer-implements-annotation` to `prefer-supports-annotation` (Story 010.3):
      - Kept implementation under the legacy key while exposing the new alias.
      - Marked the old name as deprecated via `replacedBy` metadata.
      - Updated tests, rule docs, API reference, migration guide, and README to cover both names and their ordering.
      - Ran the full quality suite.

11. **Ongoing quality verification**
    - After major changes, repeatedly ran:
      - `npm run build`
      - `npm test` (including coverage, perf, integration)
      - `npm run lint`
      - `npm run type-check`
      - `npm run format:check`
      - `ci-verify` and security scans
    - Ensured GitHub CI/CD pipelines stayed green (e.g., runs `19992305176`, `19996014527`, `19996411265`), validating integration of helper logic, tests, stories, and configuration changes.

12. **Formatter-focused branch tests and story alignment**
    - Confirmed existing Prettier integration tests for:
      - `catch` clauses: `tests/integration/catch-annotation-prettier.integration.test.ts`.
      - `else if` branches: `tests/integration/else-if-annotation-prettier.integration.test.ts` (behind `TRACEABILITY_EXPERIMENTAL_ELSE_IF`).
    - Verified these tests against `branch-annotation-helpers.ts`, rule tests, and helper tests (`branch-annotation-catch-*`, `branch-annotation-else-if-*`) to ensure they reflect the intended formatter-aware behavior.
    - Confirmed that plain `else` branches and other branch types still use the “comments immediately before branch” model, already covered by existing rule and performance tests.
    - Ran local quality checks:
      - `npm test -- --runInBand`
      - `npm run lint -- --max-warnings=0`
      - `npm run type-check`
      - `npm run format:check`
      - `npm run duplication`
    - Committed and pushed the change `test: add formatter integration tests for catch and else-if branches`, and verified GitHub Actions CI/CD run `19997138824` completed successfully.

13. **Latest documentation updates for else-if behavior**
    - Updated `docs/rules/require-branch-annotation.md`:
      - Rewrote “Else-if annotation positions” to list the three supported locations (before `else if`, between condition and `{`, first comment-only lines inside the block), define precedence, and describe autofix locations (placeholders inside the consequent block) with references to unit/helper/integration tests.
    - Updated `user-docs/api-reference.md`:
      - Refined the `traceability/require-branch-annotation` description to emphasize nearby comments and formatter-aware behavior for `catch` and `else if`.
      - Added “Behavior notes” detailing valid locations, precedence, and autofix for `catch` and `else if`, clarifying that other branches still use the “immediately before branch” model.
    - Updated `user-docs/migration-guide.md`:
      - Added “3.2 Else-if branch annotations and formatter compatibility” explaining that most existing `else if` annotations require no changes, comments moved by formatters into supported positions are now recognized, and many old workarounds/suppressions can be removed.
    - Updated `docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md`:
      - Marked documentation-related acceptance criteria and Definition of Done as completed and noted that rule docs, Prettier notes, and migration guidance are in place.
    - Ran local quality checks (`npm test -- --runInBand`, `npm run lint`, `npm run type-check`, `npm run format:check`, `npm run build`) and committed/pushed `docs: document else-if branch annotation behavior and migration`.

14. **Most recent work: formatter-aware examples and cross-references**
    - Inspected project structure and relevant files using directory listings and file reads (including `user-docs/examples.md`, the branch-annotation stories, `user-docs/api-reference.md`, `src/utils/branch-annotation-helpers.ts`, and the Prettier integration tests for `catch` and `else if`).

    - **Added a new formatter-aware examples section:**
      - Modified `user-docs/examples.md` to append a new section:
        - `## 6. Branch annotations with if/else/else-if and Prettier`
          - Introduced the section as an example of keeping `traceability/require-branch-annotation` satisfied while still running Prettier.
          - **Section 6.1 – Before formatting:**
            - Added a self-contained TypeScript example with an `if / else if / else` chain.
            - Placed `@story` and `@req` annotations immediately before the `if` and `else if` branches, using story paths such as:
              - `docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md`
              - `docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md`
            - Used requirement IDs such as `REQ-BRANCH-DETECTION` and `REQ-DUAL-POSITION-DETECTION-ELSE-IF`.
            - Included an `else` branch and a brief comment explaining that it can be annotated in the same pattern when treated as a significant branch.
            - Included an ESLint CLI example that runs only `traceability/require-branch-annotation:error` with `--no-eslintrc`.
          - **Section 6.2 – After formatting with Prettier:**
            - Added a representative “after formatting” version where Prettier has wrapped the `else if` condition and moved the annotations into the first comment-only lines inside the consequent block body.
            - Kept valid `@story` and `@req` annotations in one of the supported locations recognized by the rule (inside the `else if` block).
            - Explicitly noted that exact layout may vary between Prettier versions, but the rule accepts any of the supported positions.
          - Added a “Notes” bullet list under section 6 explaining:
            - For most branch types, the rule associates comments immediately before the branch keyword with that branch.
            - For `catch` and `else if` branches, the rule is formatter-aware and also inspects comments between the condition and block and the first comment-only lines inside the block body, so users need not fight Prettier when it moves annotations.
            - When annotations exist in more than one place around an `else if` branch, the rule prefers:
              1. comments immediately before the `else if` line,
              2. then comments between the condition and block,
              3. and finally comments inside the block body—matching the behavior described in the API reference and in stories 025.0 and 026.0.
          - Preserved the existing markdown style and the Attribution line at the top of the file.

    - **Aligned API reference with the new examples and story behavior:**
      - Updated `user-docs/api-reference.md` in the `traceability/require-branch-annotation` “Behavior notes” section for **Else-if branches**:
        - Kept the bullet describing valid annotation locations but appended an inline note pointing readers to `user-docs/examples.md` section **6. Branch annotations with if/else/else-if and Prettier** for a concrete before/after example.
        - Clarified the precedence bullet (“When annotations appear in more than one of these locations…”) to state that the precedence mirrors real-world formatter behavior and matches the scenarios in stories 025.0 and 026.0.
        - Added a short paragraph after the autofix bullet explaining that the formatter-aware if/else/else-if example in `user-docs/examples.md` (section 6) shows both the hand-written and formatted code the rule considers valid, using the existing relative link style to `examples.md`.

    - **Quality checks and CI for the latest changes:**
      - Ran:
        - `npm test -- --runInBand --passWithNoTests=false`
        - `npm run lint`
        - `npm run type-check`
        - `npm run build`
        - `npm run format:check`
      - Staged all changes, including any updated traceability artifacts.
      - Committed with the message:
        - `docs: add formatter-aware else-if branch annotation examples`
      - Pushed to the remote and confirmed the GitHub Actions **CI/CD Pipeline** run `19997373543` completed successfully.

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"src/utils"}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts"}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts","startLine":130,"endLine":220}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts","startLine":220,"endLine":320}
Used tool: find_files with input: {"pattern":"*reqAnnotationDetection*.test.*","directory":"tests"}
Used tool: search_file_content with input: {"filePath":"src","pattern":"hasReqAnnotation","isRegex":false}
Used tool: find_files with input: {"pattern":"*req-annotation*","directory":"tests"}
Used tool: read_file with input: {"filePath":"tests/utils/req-annotation-detection.test.ts"}
Used tool: modify_file with input: {"filePath":"tests/utils/req-annotation-detection.test.ts","instruction":"Add a new test case after the existing test that checks \"fallbackTextBeforeHasReq returns false when node.range is not an array\". The new test should be named \"[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns false when range[0] is not a number\" and should construct a SourceCode with getText returning a string that contains an @req marker, a node with a range where the first element is not a number, and then assert that _hasReqAnnotation returns false, ensuring that the guard on the numeric start index is exercised."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--reporters=default","--testPathPattern","tests/utils/req-annotation-detection.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--reporters=default","tests/utils/req-annotation-detection.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--reporters=default"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: add coverage for fallbackTextBeforeHasReq numeric range guard"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19997622688,"timeout":600000}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts","startLine":90,"endLine":140}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts","startLine":100,"endLine":140}
---

**This was the result:**
---
Here’s what I implemented for the ##NOW and ##NEXT sections, plus the updated plan with checkboxes.

---

## What I did

### NOW

- Reviewed `src/utils/reqAnnotationDetection.ts`, focusing on the previously uncovered conditional in `fallbackTextBeforeHasReq`:

  ```ts
  function fallbackTextBeforeHasReq(sourceCode: any, node: any): boolean {
    if (
      typeof sourceCode?.getText !== "function" ||
      !Array.isArray((node && node.range) || [])
    ) {
      return false;
    }
    const range = node.range;

    // Guard when the node range cannot provide a numeric start index.
    if (!Array.isArray(range) || typeof range[0] !== "number") {
      return false;
    }

    try {
      const start = Math.max(0, range[0] - FALLBACK_WINDOW);
      const textBefore = sourceCode.getText().slice(start, range[0]);

      if (
        typeof textBefore === "string" &&
        (textBefore.includes("@req") || textBefore.includes("@supports"))
      ) {
        return true;
      }
    } catch {
      /* noop */
    }
    return false;
  }
  ```

- Clarified scenarios:
  - Early-return `false` when:
    - `sourceCode.getText` is not a function, OR
    - `node.range` is missing/not an array, OR
    - `node.range` is an array but `range[0]` is not a number.
  - Otherwise, it computes a bounded text window before the node and returns `true` iff that window contains `@req` or `@supports`, and `false` if not, or if `getText()` throws (via the `catch`).

This gave a clear picture of how to exercise each side of the numeric-start-index guard.

---

### NEXT

#### 1) Confirmed the dedicated test file and target branch scenarios

- Located the dedicated test suite for this utility:

  - `tests/utils/req-annotation-detection.test.ts`

- Verified that this file already covers many edge cases for:
  - Missing `sourceCode`/node
  - `linesBeforeHasReq` guards
  - `parentChainHasReq` with/without `getCommentsBefore`
  - `fallbackTextBeforeHasReq` when:
    - `getText` is not a function
    - `node.range` is not an array
    - `getText` throws
    - valid numeric range with `@req` present in the window

- Identified the missing path: the guard where `node.range` is an array but `range[0]` is **not** a number (`typeof range[0] !== "number"`), which previously was not exercised.

#### 2) Implemented a new unit test for the numeric-range guard

In `tests/utils/req-annotation-detection.test.ts`, I added this test immediately after the “node.range is not an array” case:

```ts
it("[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns false when range[0] is not a number", () => {
  const context = {
    getSourceCode() {
      return createMockSourceCode({
        text: "/* @req REQ-IN-TEXT-BUT-INVALID-RANGE */",
      });
    },
  } as any;

  const node = {
    // First element of range is not a number; guard on numeric start index should trigger
    range: ["not-a-number", 10] as any,
    parent: {},
  } as any;

  const has = _hasReqAnnotation(null as any, [], context, node);

  expect(has).toBe(false);
});
```

Details:

- Uses the existing helper `createMockSourceCode` for a minimal `SourceCode`-like object.
- `text` includes an `@req` marker so that, **if** the numeric guard did not work, the fallback window logic would likely see an annotation and return `true`.
- `node.range` is an array, but `range[0]` is a string (`"not-a-number"`), which should trigger the guard:

  ```ts
  if (!Array.isArray(range) || typeof range[0] !== "number") {
    return false;
  }
  ```

- The assertion `expect(has).toBe(false)` verifies that the guard short-circuits correctly and that we don’t enter the slice window when the numeric start index is invalid.

Traceability:

- The file already has a header:

  ```ts
  /**
   * Tests for advanced @req detection heuristics
   * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
   */
  ```

  so the new test is covered by that `@supports` annotation and references the `REQ-ANNOTATION-REQ-DETECTION` requirement in its name.

#### 3) Ran checks and confirmed coverage

- Ran the Jest test suite non-interactively:

  ```bash
  npm test -- --runInBand --reporters=default
  ```

  Result: all suites passed, including `tests/utils/req-annotation-detection.test.ts`.

- Ran the standard quality checks:

  ```bash
  npm run build
  npm run lint
  npm run type-check
  npm run format:check
  ```

  All passed with exit code 0.

- The pre-push hook then executed the CI-equivalent pipeline (`npm run ci-verify:full` and `npm run security:secrets`), which also passed. Coverage after the change shows:

  - `src/utils/reqAnnotationDetection.ts`: 99.14% statements, 96.61% branches, 100% functions, 99.14% lines.
  - The specific numeric-start-index guard in `fallbackTextBeforeHasReq` is now exercised via the new test.

- Committed and pushed:

  ```text
  test: add coverage for fallbackTextBeforeHasReq numeric range guard
  ```

- The GitHub Actions “CI/CD Pipeline” run for `main` completed successfully.

---

## Updated Plan

### NOW

- [x] Review the conditional logic around the uncovered branch in the req-annotation detection utility so you clearly understand what scenario it handles and what inputs are needed to exercise each side of that branch.

### NEXT

- [x] Identify or confirm the dedicated test file that verifies the req-annotation detection utility and sketch one or more test cases that will drive execution through the previously uncovered branch paths.
- [x] Implement new unit tests for the req-annotation detection utility that cover both sides of the uncovered conditional branch, including any relevant edge cases, and annotate these tests with the appropriate story and requirement references.
- [x] Run the existing automated checks implicitly triggered by the workflow to confirm the new tests pass and that overall coverage now includes the previously uncovered branch.

### LATER

- [ ] Review the full req-annotation detection utility for any additional subtle edge cases that might benefit from explicit tests, and extend the suite where helpful.
- [ ] Consider small refactorings to the req-annotation detection utility to make branch conditions and intent clearer, guided by the new tests to keep behavior stable.
- [ ] Update or add internal documentation, if needed, to describe the expected behavior of the req-annotation detection heuristics so future contributors understand how the newly tested branch should behave.
---
