Here’s the requested history-only summary, with no future plans included:

1. **Core rule refactors and performance**
   - Refactored `valid-req-reference` to extract parsing, validation, traversal, and I/O into `valid-req-reference-helpers.ts`, and updated developer docs to describe this helper-module pattern.
   - Optimized `require-branch-annotation` for nested branches, ensuring autofix only touches inner branches, added nested-branch tests, a Jest performance test for large files, updated RuleTester expectations, and re-ran the full quality suite.

2. **Tests, CI, and maintenance tooling**
   - Ran Jest with coverage and confirmed high coverage; determined CI anomalies were due to missing `node_modules`.
   - Verified `ci-verify:full` on stable paths.
   - Reviewed `src/maintenance/*.ts`, removed redundant `fs.statSync` calls, broadened `verify` tests (covering exit codes, no-op behavior, permission errors), simplified `update.ts` to use `getAllFiles`, extended performance tests, updated `.voder/plan.md`, and confirmed CI stayed green.

3. **Dogfooding and traceability enforcement**
   - Completed a full dogfooding pass (Story 023) across stories, problems, rules, scripts, and checks.
   - Enabled `traceability/require-story-annotation` for TypeScript in `eslint.config.js`, adjusted overrides to minimize inline disables, and validated with `report:eslint-suppressions`.
   - Added `tests/integration/dogfooding-validation.test.ts` to enforce story annotations repo-wide.
   - Updated Story 023 and problem doc `001-plugin-not-enforcing-own-traceability-rules.open.md` to record successful self-enforcement.
   - Expanded `docs/eslint-plugin-development-guide.md` with a “Dogfooding and Self-Validation” section and ensured lint/CI/Husky pre-push all run ESLint with `require-story-annotation` on `src` and `tests`.

4. **Plugin metadata and setup verification**
   - Added `pluginMeta` (name, version, namespace) to `src/index.ts`.
   - Extended `tests/plugin-setup.test.ts` to verify metadata and version synchronization with `package.json`.
   - Updated traceability annotations for REQ-PLUGIN-STRUCTURE and REQ-NPM-PACKAGE, revalidated exports/configuration and CLI error behavior, refreshed Story 001 and supporting docs.

5. **Annotation / traceability helpers and detection heuristics**
   - Audited helper-module annotations (including `valid-req-reference-helpers.ts`) for correct `@supports` / `@req` usage and clarified expectations in the dev guide; re-ran the full quality suite.
   - Implemented backtick-aware normalization in `normalizeCommentLine` so inline code spans are ignored when detecting `@story` / `@req` / `@supports` (Story 024.0), added inline-code tests in `valid-annotation-format-internal.test.ts`, updated helper annotations, and ran full quality commands.
   - Improved `req` annotation detection in `src/utils/reqAnnotationDetection.ts`, adding tests for missing `sourceCode`/node, error paths, `@supports`, and heuristics such as `linesBeforeHasReq` and `parentChainHasReq`, introduced `createMockSourceCode`, tied tests to Story 003.0, and achieved very high coverage.

6. **`catch` and `else-if` branch-annotation behavior**
   - **CatchClause (Story 025.0):**
     - Updated `gatherBranchCommentText` and `getBranchAnnotationInfo` to detect comments before `catch` and inside its body.
     - Added tests for comment priority and autofix insertion; removed unused imports.
     - Added `tests/integration/catch-annotation-prettier.integration.test.ts` to verify `require-branch-annotation` with Prettier 3.6.2, including empty catch bodies with comments only.
     - Enhanced `branch-annotation-helpers.ts` with `extractCommentValue` and `gatherCatchClauseCommentText`, including fallback scans inside the catch body.
     - Documented behavior in Story 025.0, the rule docs, and `user-docs/api-reference.md`, with targeted tests and implementation links.
   - **Else-if (Story 026.0):**
     - Implemented else-if-aware helpers in `branch-annotation-helpers.ts` (`isElseIfBranch`, and updated `gatherBranchCommentText` / `getBranchAnnotationInfo` with a `parent` parameter); tuned insertion positions to align with Prettier.
     - Updated `reportMissingAnnotations` to pass the parent via ancestors.
     - Added rule tests ensuring all `IfStatement` branches (including `else if`) require annotations and that else-if chains are consistently reported/autofixed.
     - Added `tests/integration/else-if-annotation-prettier.integration.test.ts` (behind `TRACEABILITY_EXPERIMENTAL_ELSE_IF`) for realistic ESLint+Prettier behavior.
     - Refined `gatherElseIfCommentText` with dedicated scanners for preceding comments, between-condition-and-body comments, and first-line-in-block comments in priority order.
     - Added focused helper tests for else-if positioning and insertion, and updated Story 026.0 with completed implementation links.

7. **Annotation format performance**
   - For Story 005.0, added `tests/perf/valid-annotation-format-large-file.test.ts` to synthesize large TS files with many annotations, run `traceability/valid-annotation-format` via `Linter`, assert diagnostics, and enforce runtime under 5 seconds, tying tests to the story and including them in perf/full suites.

8. **Plugin config, ESLint 9 alignment, and Story 002 closure**
   - Re-reviewed Story 002 and the ESLint flat config for traceability rules, plus integration tests.
   - Ensured alignment with ESLint 9 patterns, presets, and schemas.
   - Extended `tests/config/eslint-config-validation.test.ts` to cover runtime config errors for `traceability/valid-story-reference`.
   - Marked Story 002’s Definition of Done complete and re-ran quality checks.

9. **Runtime, tooling, and dependency alignment**
   - Investigated Node/Jest/ts-jest/CI compatibility; confirmed Jest 30.2.0 and ts-jest 29.4.5 run on Node 22 despite earlier `engines.node` settings.
   - Ran `npm list` and inspected `package-lock.json` to normalize dependency metadata; re-verified build, tests, lint, type-check, and formatting.
   - Updated `package.json` `engines.node` to support Node 18.18, 20, 22, 24+ and aligned the CI matrix.
   - Fixed semantic-release environment variable handling; updated `README.md` and `CONTRIBUTING.md` for Node/Jest/ts-jest compatibility; confirmed multi-Node CI success.
   - Resolved Secretlint issues on Node 20 by removing `--no-color` from `security:secrets`, then re-ran `ci-verify:full` and secret scans across all supported Node versions.

10. **Rule naming and migration support**
    - Implemented migration from `prefer-implements-annotation` to `prefer-supports-annotation` (Story 010.3) by:
      - Keeping implementation under the old key and exposing the new alias.
      - Marking the old name as deprecated via `replacedBy`.
      - Updating tests, docs, API reference, migration guide, and README to cover both names and ordering.
      - Running full quality checks.

11. **Ongoing quality verification**
    - After major changes, repeatedly executed:
      - `npm run build`
      - `npm test` (coverage, perf, integration)
      - `npm run lint`
      - `npm run type-check`
      - `npm run format:check`
      - `ci-verify` and security scans
    - Verified GitHub CI/CD pipelines remained green (e.g., runs `19992305176`, `19996014527`, `19996411265`).

12. **Formatter-focused branch tests and story alignment**
    - Validated Prettier integration tests for:
      - `catch`: `tests/integration/catch-annotation-prettier.integration.test.ts`
      - `else if`: `tests/integration/else-if-annotation-prettier.integration.test.ts` (with `TRACEABILITY_EXPERIMENTAL_ELSE_IF`)
    - Ensured these tests match `branch-annotation-helpers.ts`, rule tests, and helper tests for catch/else-if behavior.
    - Confirmed plain `else` and other branches still use the “comments immediately before branch” model, with existing rule/perf coverage.
    - Ran local quality commands (`npm test -- --runInBand`, lint, type-check, format:check, duplication).
    - Committed and pushed `test: add formatter integration tests for catch and else-if branches` and confirmed CI run `19997138824` succeeded.

13. **Else-if documentation updates**
    - Updated `docs/rules/require-branch-annotation.md` to fully describe else-if annotation positions, precedence, and autofix placement, with links to tests.
    - Updated `user-docs/api-reference.md` to emphasize nearby comments and formatter-aware behavior for `catch`/`else if`, including behavior notes for valid locations, precedence, and autofix, and clarifying that other branches still follow the “immediately before branch” model.
    - Updated `user-docs/migration-guide.md` with “3.2 Else-if branch annotations and formatter compatibility,” explaining impact on existing code and removal of workarounds.
    - Updated Story 026.0 with completed documentation acceptance criteria and DoD, ran local quality, and committed `docs: document else-if branch annotation behavior and migration`.

14. **Formatter-aware examples and cross-references**
    - Reviewed relevant files (`user-docs/examples.md`, stories, `user-docs/api-reference.md`, `branch-annotation-helpers.ts`, and Prettier integration tests).
    - Extended `user-docs/examples.md` with section 6, “Branch annotations with if/else/else-if and Prettier,” including:
      - A “before formatting” TypeScript example with an if/else-if/else chain annotated by `@story`/`@req`.
      - An “after formatting with Prettier” example where else-if annotations are moved inside the consequent block but remain valid.
      - Notes on which branch types rely on preceding comments, formatter-aware handling of `catch`/`else if`, and precedence rules, referencing stories 025.0 and 026.0.
    - Updated `user-docs/api-reference.md` to point to the new examples section, clarify precedence mirroring formatter behavior, and explain how the example shows both handwritten and formatted code accepted by the rule.
    - Ran tests, lint, type-check, build, format:check; committed `docs: add formatter-aware else-if branch annotation examples`; confirmed CI run `19997373543` succeeded.

15. **Numeric-range guard coverage in req-annotation detection**
    - Reviewed `src/utils/reqAnnotationDetection.ts`, focusing on `fallbackTextBeforeHasReq` guard conditions:
      - `false` when `sourceCode.getText` is not a function, `node.range` is missing/not an array, or `range[0]` is non-numeric.
      - Otherwise, a bounded window before the node is scanned for `@req`/`@supports`.
    - Confirmed existing tests already covered most edge cases and identified the missing branch where `node.range` is an array but `range[0]` is not numeric.
    - Added a test in `tests/utils/req-annotation-detection.test.ts` (`[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns false when range[0] is not a number`) to exercise this guard.
    - Ran targeted Jest, then full Jest, build, lint, type-check, and format:check; all passed.
    - Committed `test: add coverage for fallbackTextBeforeHasReq numeric range guard` and confirmed the “CI/CD Pipeline” on `main` completed successfully.

16. **Most recent work: extended coverage for advanced req-annotation heuristics**
    - Performed a focused review of `src/utils/reqAnnotationDetection.ts`, examining guard branches and early returns in:
      - `linesBeforeHasReq`
      - `parentChainHasReq`
      - `fallbackTextBeforeHasReq`
      - `hasReqInAdvancedHeuristics`
      - `hasReqInJsdocOrComments`
      - `hasReqAnnotation`
    - Cataloged the positive detection paths:
      - Preceding lines (`linesBeforeHasReq`)
      - Parent chain comments/`leadingComments` (`parentChainHasReq`)
      - Fallback text window (`fallbackTextBeforeHasReq`)
      - JSDoc and nearby comments (`hasReqInJsdocOrComments`)
      - Support for both `@req` and `@supports`.
    - Cross-checked tests in `tests/utils/req-annotation-detection.test.ts` and `tests/rules/require-req-annotation.test.ts`, and identified three under-tested scenarios:
      1. Positive detection via `linesBeforeHasReq` when preceding lines contain `@req`.
      2. Positive detection via `parentChainHasReq` when `getCommentsBefore` exists but is not callable, and parent `leadingComments` include `@supports`.
      3. JSDoc-only detection when `context` is `undefined`.
    - Implemented three new tests in `tests/utils/req-annotation-detection.test.ts`:
      - A test where preceding lines include `/** @req REQ-LINE-BEFORE */` and the node starts on a later line, asserting `_hasReqAnnotation` returns `true`.
      - A test where `context.getSourceCode()` returns an object with a non-function `getCommentsBefore`, and a parent node has `leadingComments` containing an `@supports` marker, asserting `_hasReqAnnotation` returns `true`.
      - A test where JSDoc contains `@req` and `context` is `undefined`, asserting `_hasReqAnnotation` returns `true`.
    - Ensured all new tests use `[REQ-ANNOTATION-REQ-DETECTION]` in their names and rely on the existing `@supports` header in the test file for traceability.
    - Ran targeted Jest for `tests/utils/req-annotation-detection.test.ts` and `tests/rules/require-req-annotation.test.ts`, then `npm run ci-verify:fast`.
    - Committed `test: extend req annotation detection coverage for advanced heuristics`, pushed, and confirmed the GitHub `CI/CD Pipeline` run `19997900404` completed successfully.
    - From the subsequent full CI run, confirmed coverage for `src/utils/reqAnnotationDetection.ts` reached 100% statements, 98.3% branches, 100% functions, and 100% lines, with no changes to the production utility itself and no regressions in rule behavior.

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"."}
Used tool: find_files with input: {"pattern":"*branch-annotation-helpers*","directory":"."}
Used tool: get_git_status with input: {}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/branch-annotation-helpers.test.ts"}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: read_file with input: {"filePath":"docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md"}
Used tool: read_file with input: {"filePath":"docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","startLine":210,"endLine":270}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","startLine":60,"endLine":210}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","instruction":"1) After the existing `function extractCommentValue(_c: any): string {` definition, insert a new helper function:\n\n```ts\n/**\n * Collect a single contiguous comment line at the given index, appending its\n * trimmed text to the accumulator. Returns true when a valid comment was\n * collected and false when scanning should stop (blank or non-comment line).\n * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION\n * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION REQ-FALLBACK-LOGIC\n * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF REQ-FALLBACK-LOGIC-ELSE-IF\n */\nfunction collectCommentLine(\n  lines: string[],\n  index: number,\n  comments: string[],\n): boolean {\n  const line = lines[index];\n  if (!line || !line.trim()) {\n    return false;\n  }\n  if (!/^\\s*(\\/\\/|\\/\\*)/.test(line)) {\n    return false;\n  }\n\n  comments.push(line.trim());\n  return true;\n}\n```\n\n2) In `gatherCatchClauseCommentText`, replace the while-loop that scans inside `node.body` using explicit line checks with a call to the new helper. Replace:\n\n```ts\n    while (i <= endIndex) {\n      const line = lines[i];\n      if (!line || !line.trim()) {\n        break;\n      }\n      if (!/^\\s*(\\/\\/|\\/\\*)/.test(line)) {\n        break;\n      }\n      comments.push(line.trim());\n      i++;\n    }\n```\n\nwith:\n\n```ts\n    while (i <= endIndex) {\n      if (!collectCommentLine(lines, i, comments)) {\n        break;\n      }\n      i++;\n    }\n```\n\n3) In `scanElseIfBetweenConditionAndBody`, replace the for-loop body that duplicates the same line/comment checks. Replace:\n\n```ts\n  const comments: string[] = [];\n  for (\n    let lineIndex = conditionEndLine;\n    lineIndex < consequentStartLine - 1;\n    lineIndex++\n  ) {\n    const line = lines[lineIndex];\n    if (!line || !line.trim()) {\n      break;\n    }\n    if (!/^\\s*(\\/\\/|\\/\\*)/.test(line)) {\n      break;\n    }\n    comments.push(line.trim());\n  }\n```\n\nwith:\n\n```ts\n  const comments: string[] = [];\n  for (\n    let lineIndex = conditionEndLine;\n    lineIndex < consequentStartLine - 1;\n    lineIndex++\n  ) {\n    if (!collectCommentLine(lines, lineIndex, comments)) {\n      break;\n    }\n  }\n```\n\n4) In `scanElseIfInsideBlockComments`, replace the while-loop body that duplicates the same line/comment checks. Replace:\n\n```ts\n  const comments: string[] = [];\n  let lineIndex = consequentStartLine;\n\n  while (lineIndex < lines.length) {\n    const line = lines[lineIndex];\n    if (!line || !line.trim()) {\n      break;\n    }\n    if (!/^\\s*(\\/\\/|\\/\\*)/.test(line)) {\n      break;\n    }\n    comments.push(line.trim());\n    lineIndex++;\n  }\n```\n\nwith:\n\n```ts\n  const comments: string[] = [];\n  let lineIndex = consequentStartLine;\n\n  while (lineIndex < lines.length) {\n    if (!collectCommentLine(lines, lineIndex, comments)) {\n      break;\n    }\n    lineIndex++;\n  }\n```"}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","src/utils/branch-annotation-helpers.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: deduplicate branch comment scanning helpers"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19998105848,"timeout":600000}
---

**This was the result:**
---
Here’s what I implemented for the ##NOW and ##NEXT items and their current status.

## What I changed

### 1) Reviewed duplicated logic in branch-annotation helper (NOW)

I inspected:

- `src/utils/branch-annotation-helpers.ts` (especially lines 60–270)
- `tests/utils/branch-annotation-helpers.test.ts`
- Latest `jscpd` output via `npm run duplication`

From `jscpd`, there was a clone:

- `src/utils/branch-annotation-helpers.ts [252:7 - 261:10]`
- `src/utils/branch-annotation-helpers.ts [227:3 - 236:2]`

In the file, I confirmed three places all duplicated the same pattern of “scan consecutive comment lines until non-comment/blank”:

- Inside `gatherCatchClauseCommentText` (line-based fallback in catch bodies)
- `scanElseIfBetweenConditionAndBody`
- `scanElseIfInsideBlockComments`

These all used the same:

```ts
const line = lines[i]; // or lines[lineIndex]
if (!line || !line.trim()) break;
if (!/^\s*(\/\/|\/\*)/.test(line)) break;
comments.push(line.trim());
```

This was the duplication the plan referenced.

### 2) Introduced a shared helper and refactored call sites (NEXT)

I extracted the common logic into a single helper function and wired all the duplicated sites to use it, preserving behavior.

#### New helper: `collectCommentLine`

Added directly after `extractCommentValue`:

```ts
/**
 * Collect a single contiguous comment line at the given index, appending its
 * trimmed text to the accumulator. Returns true when a valid comment was
 * collected and false when scanning should stop (blank or non-comment line).
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION
 * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION REQ-FALLBACK-LOGIC
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF REQ-FALLBACK-LOGIC-ELSE-IF
 */
function collectCommentLine(
  lines: string[],
  index: number,
  comments: string[],
): boolean {
  const line = lines[index];
  if (!line || !line.trim()) {
    return false;
  }
  if (!/^\s*(\/\/|\/\*)/.test(line)) {
    return false;
  }

  comments.push(line.trim());
  return true;
}
```

This captures the exact behavior of the duplicated comment-scanning blocks and includes traceability annotations tying it to the relevant stories and requirements.

#### Updated `gatherCatchClauseCommentText` fallback

Replaced the manual `while` loop that scanned inside the catch body:

**Before:**

```ts
while (i <= endIndex) {
  const line = lines[i];
  if (!line || !line.trim()) {
    break;
  }
  if (!/^\s*(\/\/|\/\*)/.test(line)) {
    break;
  }
  comments.push(line.trim());
  i++;
}
```

**After:**

```ts
while (i <= endIndex) {
  if (!collectCommentLine(lines, i, comments)) {
    break;
  }
  i++;
}
```

Behavior is identical: as soon as a non-comment or blank line is encountered, `collectCommentLine` returns `false` and the loop breaks.

#### Updated `scanElseIfBetweenConditionAndBody`

**Before:**

```ts
const comments: string[] = [];
for (
  let lineIndex = conditionEndLine;
  lineIndex < consequentStartLine - 1;
  lineIndex++
) {
  const line = lines[lineIndex];
  if (!line || !line.trim()) {
    break;
  }
  if (!/^\s*(\/\/|\/\*)/.test(line)) {
    break;
  }
  comments.push(line.trim());
}
```

**After:**

```ts
const comments: string[] = [];
for (
  let lineIndex = conditionEndLine;
  lineIndex < consequentStartLine - 1;
  lineIndex++
) {
  if (!collectCommentLine(lines, lineIndex, comments)) {
    break;
  }
}
```

Loop bounds and stopping conditions remain the same; only the duplicated logic is centralized.

#### Updated `scanElseIfInsideBlockComments`

**Before:**

```ts
const comments: string[] = [];
let lineIndex = consequentStartLine;

while (lineIndex < lines.length) {
  const line = lines[lineIndex];
  if (!line || !line.trim()) {
    break;
  }
  if (!/^\s*(\/\/|\/\*)/.test(line)) {
    break;
  }
  comments.push(line.trim());
  lineIndex++;
}
```

**After:**

```ts
const comments: string[] = [];
let lineIndex = consequentStartLine;

while (lineIndex < lines.length) {
  if (!collectCommentLine(lines, lineIndex, comments)) {
    break;
  }
  lineIndex++;
}
```

Again, behavior is unchanged; we just factor the comment-line decision into the helper.

### 3) Verified behavior and tests (NEXT)

I ran the full quality suite:

- `npm run lint -- --max-warnings=0` ✅
- `npm test -- --runInBand` ✅
- `npm run type-check` ✅
- `npm run build` ✅
- `npm run format:check` (initially failed on the updated file)  
  - Fixed style via `npm run format -- src/utils/branch-annotation-helpers.ts`
  - Re-ran `npm run format:check` ✅

Then re-ran full CI-equivalent locally after commit:

- `npm run build` ✅
- `npm test -- --runInBand` ✅
- `npm run lint -- --max-warnings=0` ✅
- `npm run type-check` ✅
- `npm run format:check` ✅

I also checked duplication:

- `npm run duplication` (run as part of `ci-verify:full` and visible in `git push` output)

Previously:

- 29 clones; one of them was in `src/utils/branch-annotation-helpers.ts`.

Now:

- 28 clones.
- No clone entries reference `src/utils/branch-annotation-helpers.ts`.
- Overall duplicated lines dropped from 362 (2.53%) to 353 (2.47%).

This confirms that the targeted duplication in `branch-annotation-helpers.ts` was eliminated without introducing new clones and with all tests still passing.

No new tests were necessary; existing catch and else-if position tests already cover:

- `gatherCatchClauseCommentText` behavior and insert positions
- else-if comment positioning and insert positions
- Prettier integration for catch and else-if via the existing integration tests

### 4) Git + CI

- Staged all changes: `src/utils/branch-annotation-helpers.ts` and auto-formatted docs/user-docs touched by Prettier.
- Commit:

  ```bash
  refactor: deduplicate branch comment scanning helpers
  ```

- Pushed to `main`.

Push triggered the CI/CD GitHub Actions workflow:

- Most recent run: `CI/CD Pipeline (main)` with ID `19998105848`.
- I waited for it via `wait_for_github_workflow` and it completed with `conclusion: success`.

The CI run includes:

- `npm run ci-verify:full` (build, test with coverage, lint, type-check, duplication, audits, traceability, artifact checks)
- `npm run security:secrets`
- `semantic-release` and post-publish smoke test on the Node 22.14.0 job, as usual

Everything passed.

## Updated Plan with Status

### NOW

- [x] Review the duplicated logic in the branch-annotation helper module around the catch and else-if comment-gathering functions to understand exactly which behaviors are repeated and which are safe candidates for extraction into a shared helper.

### NEXT

- [x] Identify a minimal, behavior-preserving helper or small set of helpers that can replace the duplicated logic while keeping the existing catch and else-if annotation semantics intact, and sketch how call sites would use them.
- [x] Refactor the branch-annotation helper module to introduce the new shared helper functionality and update all relevant callers so that the previous duplicated code paths are removed without changing external behavior.
- [x] Verify that the existing unit, rule, and formatter-integration tests for catch and else-if branch annotations still fully pass and, if needed, add a focused test to cover any subtle branch that was previously only exercised through the duplicated code paths.
- [x] Confirm that the overall duplication level reported for the helpers has decreased and that the resulting code remains readable and easy to maintain.

If you’d like, I can next apply the same style of micro-extraction to the small duplication blocks in `require-story-visitors.ts` and `require-story-core.ts` under the LATER section, one helper at a time.
---
