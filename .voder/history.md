Here’s a concise, history-only summary of what’s been done so far, including the most recent work:

1. **Core rule refactors and improvements**
   - Refactored the `valid-req-reference` rule by extracting parsing/validation/traversal/file I/O into `valid-req-reference-helpers.ts`, leaving the rule file as a thin wrapper. Updated developer docs to describe the helper-module pattern and ran the full quality suite.
   - Improved `require-branch-annotation` with better control-flow and performance characteristics, added nested-branch tests to ensure autofix only targets inner branches, and introduced a Jest perf test for large files. Updated RuleTester expectations and re-ran checks.

2. **Test coverage, CI, and maintenance tooling**
   - Ran Jest with coverage and confirmed high coverage; identified that missing `node_modules` caused some CI coverage anomalies rather than code gaps. Verified `ci-verify:full` on stable paths.
   - Reviewed maintenance CLI scripts in `src/maintenance/*.ts`, removed redundant `fs.statSync` usage, expanded tests for `verify` (exit codes, no-op scenarios, permission errors), simplified `update.ts` to rely on `getAllFiles`, and extended performance tests. Updated `.voder/plan.md` and confirmed CI remained green.

3. **Dogfooding and traceability enforcement**
   - Performed a comprehensive dogfooding pass (Story 023) across stories, problem docs, rules, scripts, and checks.
   - Enabled `traceability/require-story-annotation` for TS files via `eslint.config.js`, tuned overrides to reduce inline disables, and verified behavior using `report:eslint-suppressions`.
   - Added `tests/integration/dogfooding-validation.test.ts` to enforce the story-annotation rule across the repo.
   - Updated Story 023 and problem doc `001-plugin-not-enforcing-own-traceability-rules.open.md` to record the new enforcement, green dogfooding test, and partial mitigation status.
   - Expanded `docs/eslint-plugin-development-guide.md` with a “Dogfooding and Self-Validation” section and confirmed that lint, CI, and Husky pre-push hooks now run ESLint with `require-story-annotation` on `src` and `tests`.

4. **Plugin metadata and setup verification**
   - Added a `pluginMeta` export in `src/index.ts` (name, version, namespace).
   - Extended `tests/plugin-setup.test.ts` to assert meta fields and ensure the plugin version matches `package.json`.
   - Updated traceability annotations for REQ-PLUGIN-STRUCTURE and REQ-NPM-PACKAGE, revalidated exports/configs and CLI error behavior, and refreshed Story 001 and related docs.

5. **Annotation and traceability helper alignment**
   - Audited helper-module traceability annotations, especially in `valid-req-reference-helpers.ts`, aligning `@supports`/`@req` usage and clarifying expectations in the dev guide. Re-ran the full quality suite.
   - Implemented backtick-aware normalization in `normalizeCommentLine` so inline code spans are ignored when detecting `@story` / `@req` / `@supports` (Story 024.0). Added inline-code tests in `valid-annotation-format-internal.test.ts`, updated helper annotations, and ran full quality commands.
   - Improved `req` annotation detection heuristics in `src/utils/reqAnnotationDetection.ts` with targeted tests for missing `sourceCode`/`node`, error paths, `@supports` coverage, and advanced heuristics (`linesBeforeHasReq`, `parentChainHasReq`, etc.). Added `createMockSourceCode`, tied tests to Story 003.0, and achieved very high coverage (~99% statements, ~97% branches).

6. **Branch-annotation behavior (catch and else-if)**
   - For CatchClause behavior (Story 025.0):
     - Updated `gatherBranchCommentText` and `getBranchAnnotationInfo` to account for `CatchClause` comments both before the clause and inside the body.
     - Added tests covering catch-position priority and autofix insertion, and removed unused imports.
     - Created `tests/integration/catch-annotation-prettier.integration.test.ts` to exercise `require-branch-annotation` with real Prettier 3.6.2, ensuring before-catch and inside-body annotations remain valid after formatting, including empty catches with comment-only bodies.
     - Enhanced `branch-annotation-helpers.ts` with `extractCommentValue` and a specialized `gatherCatchClauseCommentText`, including a fallback that scans lines inside the catch body when comment APIs are limited.
     - Documented CatchClause behavior and Prettier compatibility in `docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md`, `docs/rules/require-branch-annotation.md`, and `user-docs/api-reference.md`, and added targeted tests and implementation links.

   - For else-if behavior (Story 026.0):
     - Implemented else-if-aware helpers in `branch-annotation-helpers.ts`, including `isElseIfBranch`, enhanced `gatherBranchCommentText` and `getBranchAnnotationInfo` to accept `parent`, and adjusted insertion positions for else-if branches to align with Prettier-wrapped style.
     - Added `reportMissingAnnotations` logic to pass the direct parent via ancestors.
     - Created unit tests in `tests/rules/require-branch-annotation.test.ts` to assert:
       - All `IfStatement` branches (including `else if`) require annotations.
       - Else-if Prettier-style chains report missing annotations correctly and reflect the current autofix behavior (first placeholder `@story` before the outer `if`, with helpers ready for finer-grained insertion).
     - Added integration tests in `tests/integration/else-if-annotation-prettier.integration.test.ts` that run ESLint + Prettier CLI on realistic else-if code, validating that annotations survive Prettier’s formatting. These tests are gated behind `TRACEABILITY_EXPERIMENTAL_ELSE_IF` and are skipped by default, but fully wired and traceable.
     - Updated `branch-annotation-helpers.ts` again to refine `gatherElseIfCommentText`:
       - Added three structured scanning helpers for else-if annotations:
         - `scanElseIfPrecedingComments` (before-else comments within a small window above the node),
         - `scanElseIfBetweenConditionAndBody` (comments between condition end and block start),
         - `scanElseIfInsideBlockComments` (first comment-only lines inside the block).
       - Simplified `gatherElseIfCommentText` to use these helpers in priority order, while respecting pre-existing `beforeText` when it already contains annotations.
       - This refactor brought the function under ESLint’s complexity and size limits without changing behavior.
     - Introduced two focused helper tests:
       - `tests/utils/branch-annotation-else-if-position.test.ts` for:
         - detection of annotations before `else if`,
         - fallback to between-condition-and-body comments,
         - position priority when both positions exist.
       - `tests/utils/branch-annotation-else-if-insert-position.test.ts` for verifying that `reportMissingAnnotations` computes the insert position for else-if autofix inside the block body with appropriate indentation.
     - Updated `docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md`:
       - Marked implementation-focused acceptance criteria (before-else position, after-condition position, Prettier behavior via gated tests, position priority, autofix compatibility, no regression) as satisfied.
       - Added an “Implementation Links” section referencing the updated helpers, rule file, unit tests, and integration tests.
       - Left documentation-related acceptance criteria and DoD items (rule docs and migration guide updates) intentionally unchecked to reflect remaining documentation work.

7. **Annotation format performance**
   - For Story 005.0, confirmed that annotation validation was already functionally complete and added a performance-focused Jest test `tests/perf/valid-annotation-format-large-file.test.ts`. This test generates large TS sources with many annotations, exercises `traceability/valid-annotation-format` via the `Linter`, asserts diagnostics, and enforces a runtime under 5 seconds. Tied tests to Story 005.0 requirements and ran both standalone and full-suite perf tests.

8. **Plugin configuration, ESLint 9 alignment, and story completion**
   - Re-reviewed Story 002 and the ESLint flat configuration, re-checked rule configurations (`valid-story-reference`, `require-story-annotation`, `require-test-traceability`) and their integration tests.
   - Ensured alignment with ESLint 9 patterns, presets, and schemas.
   - Extended `tests/config/eslint-config-validation.test.ts` to cover runtime config errors for `traceability/valid-story-reference`.
   - Marked Story 002’s Definition of Done as complete and re-ran quality checks.

9. **Runtime, tooling, and dependency alignment**
   - Investigated Node/Jest/ts-jest/CI compatibility:
     - Confirmed Jest 30.2.0 and ts-jest 29.4.5 work on Node 22 despite earlier `engines.node` constraints.
   - Ran `npm list` and inspected `package-lock.json` to normalize bundled dependency metadata, then re-verified build, tests, lint, type-check, and format.
   - Updated `package.json` `engines.node` to support Node 18.18, 20, 22, and 24+, and aligned the CI matrix in `.github/workflows/ci-cd.yml`.
   - Fixed semantic-release environment variable handling, updated `README.md` and `CONTRIBUTING.md` to reflect Node/Jest/ts-jest compatibility, and confirmed multi-Node CI success.
   - Resolved Secretlint issues on Node 20 by removing `--no-color` from the `security:secrets` script, then re-ran `ci-verify:full` and secret scanning across all supported Node versions.

10. **Rule naming and migration support**
    - Implemented the migration from `prefer-implements-annotation` to `prefer-supports-annotation` (Story 010.3):
      - Kept implementation under the legacy `"prefer-implements-annotation"` key while exposing the new `"prefer-supports-annotation"` alias.
      - Marked the old name as deprecated with `replacedBy` metadata.
      - Updated tests, rule docs, API reference, migration guide, and README to cover both names and export/config ordering.
      - Ran the full quality suite to validate behavior.

11. **Ongoing quality verification**
    - After each batch of changes, repeatedly ran:
      - `npm run build`
      - `npm test` (with coverage, perf, and integration tests as appropriate)
      - `npm run lint`
      - `npm run type-check`
      - `npm run format:check`
      - `ci-verify` and security scans
    - Ensured GitHub CI/CD pipelines stayed green (including run IDs such as `19992305176`, `19996014527`, and `19996411265`), confirming that new helper logic, tests, story updates, and configuration changes integrated cleanly.

This captures the history of work completed so far, up through the latest else-if helper refactors, tests, story alignment, and CI validation.

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"docs/rules"}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: check_file_exists with input: {"filePath":"user-docs/api-reference.md"}
Used tool: check_file_exists with input: {"filePath":"user-docs/migration-guide.md"}
Used tool: read_file with input: {"filePath":"docs/rules/require-branch-annotation.md"}
Used tool: read_file with input: {"filePath":"docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md"}
Used tool: read_file with input: {"filePath":"user-docs/api-reference.md"}
Used tool: read_file with input: {"filePath":"user-docs/migration-guide.md"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts"}
Used tool: modify_file with input: {"filePath":"docs/rules/require-branch-annotation.md","instruction":"In the \"### Else-if annotation positions\" section, replace the existing paragraph and bullet list down to (but not including) the next \"### Options\" heading with updated content that more precisely documents all supported annotation positions, their precedence, and auto-fix behavior. The new section should read:\n\n\"### Else-if annotation positions\n\nFor `else if` branches, the rule is formatter-aware and recognizes annotations in several closely related positions. Conceptually, there are three supported locations, with a defined precedence:\n\n1. **Preceding-line comments** – Line or block comments immediately before the `else if` line (including comments that ESLint associates with the `IfStatement` via `getCommentsBefore`). This is the primary, legacy-friendly location and behaves like annotations on a normal `if` branch.\n2. **Comments between the condition and the block** – Comment-only lines that appear after the `else if (condition)` but before the opening `{` of the consequent block. This covers styles where the condition and the block are on separate lines and a comment sits between them, for example:\n\n   ```js\n   } else if (condition)\n   // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\n   // @req REQ-BRANCH-DETECTION\n   {\n     handleCondition();\n   }\n   ```\n3. **First comment-only lines inside the consequent block** – When formatters such as Prettier wrap a long `else if` condition and move comments inside the block body, annotations placed on the first comment-only lines inside the `{ ... }` block are also accepted and associated with the `else if` branch.\n\nWhen annotations are present in more than one of these locations, the rule applies the following precedence for validation and reporting:\n\n1. Comments immediately before the `else if` line.\n2. Comment-only lines between the `else if (condition)` and the opening `{`.\n3. The first comment-only lines inside the consequent block body.\n\nThis precedence avoids duplicate diagnostics when multiple comments exist around the same `else if` branch while still honoring formatter-driven placements.\n\nWhen the rule applies an auto-fix for missing annotations on an `else if` branch, it inserts placeholder `@story` and `@req` comments as the first comment-only line inside the consequent block body (just after the opening `{`). This placement is chosen to align with where Prettier tends to keep comments for wrapped `else if` conditions so that, after formatting, the placeholders remain attached to the branch. Other branch types continue to receive auto-fix annotations immediately before the branch keyword.\n\nThis behavior is covered by unit tests in `tests/rules/require-branch-annotation.test.ts`, utility tests in `tests/utils/branch-annotation-else-if-position.test.ts` and `tests/utils/branch-annotation-else-if-insert-position.test.ts`, and integration tests in `tests/integration/else-if-annotation-prettier.integration.test.ts`.\""}
Used tool: modify_file with input: {"filePath":"user-docs/api-reference.md","instruction":"In the `### traceability/require-branch-annotation` section, replace the current Description paragraph and Behavior notes bullet list with a more detailed, user-friendly explanation of else-if behavior that mirrors the internal rule documentation but stays focused on observable behavior. Specifically:\n\n1. Replace the single Description paragraph that currently mentions both catch and else-if with:\n\n\"Description: Ensures significant code branches (if/else chains, loops, switch cases, try/catch) have both `@story` and `@req` annotations in nearby comments. For most branches, the rule looks for annotations in comments immediately preceding the branch keyword (for example, the line above an `if` or `for` statement). For `catch` clauses and `else if` branches, the rule is formatter-aware and accepts annotations in additional positions that common formatters like Prettier use when they reflow code.\"\n\n2. Immediately after the Options list for this rule, insert a new \"Behavior notes\" subsection that documents catch and else-if behavior in user-facing terms:\n\n\"Behavior notes:\n\n- **Catch clauses**:\n  - Valid locations for `@story` / `@req` annotations are either immediately before the `catch` keyword or on the first comment-only lines inside the catch block (before any executable statements).\n  - If annotations exist in both locations, the comments immediately before `catch` take precedence for validation and reporting.\n  - When auto-fixing missing annotations on a catch clause, the rule inserts placeholder comments inside the catch block body so that formatters like Prettier keep them attached to the branch.\n\n- **Else-if branches**:\n  - Valid locations for `@story` / `@req` annotations include:\n    - Line or block comments immediately before the `else if` line.\n    - Comment-only lines between the `else if (condition)` and the opening `{` of the consequent block (for styles where the condition and block are on separate lines).\n    - The first comment-only lines inside the consequent block body, which is where formatters like Prettier often move comments when they wrap long `else if` conditions.\n  - When annotations appear in more than one of these locations, the rule prefers the comments immediately before the `else if` line, then comments between the condition and the block, and finally comments inside the block body. This precedence avoids duplicate diagnostics while remaining compatible with formatter-driven layouts.\n  - When auto-fixing missing annotations on an `else if` branch, the rule inserts placeholder comments as the first comment-only line inside the consequent block body (just after the opening `{`), which is a stable location under Prettier and similar formatters.\n\nThese behaviors are intentionally limited to `catch` clauses and `else if` branches; other branch types (plain `if`, `else`, loops, and `switch` cases) continue to use the simpler \"comments immediately before the branch\" association model for both validation and auto-fix placement.\"\n\nDo not change the rule name, Options heading, default severity, or example code; only adjust the description and add the new Behavior notes subsection as described."}
Used tool: modify_file with input: {"filePath":"user-docs/migration-guide.md","instruction":"In `user-docs/migration-guide.md`, add a brief note about the else-if annotation behavior to help existing projects understand what, if anything, they need to change.\n\n1. After the existing subsection `### 3.1 Multi-story @supports annotations` (and its content), insert a new subsection:\n\n\"### 3.2 Else-if branch annotations and formatter compatibility\n\nVersions 1.x of `eslint-plugin-traceability` extend the `traceability/require-branch-annotation` rule to better support formatter-driven layouts for `else if` branches. In most projects you **do not need to change existing annotations**:\n\n- Comments immediately before an `else if` line remain valid and continue to satisfy the rule.\n- When formatters such as Prettier move comments between the `else if (condition)` and the opening `{`, or into the first comment-only lines inside the `{ ... }` block, those annotations are now also recognized and associated with the correct branch.\n\nIf you previously added suppressions or workaround comments around `else if` branches due to formatter conflicts, you can usually remove those workarounds after upgrading to 1.x as long as your annotations live in one of the supported locations. For new code, you can place annotations either directly above the `else if` or, when you know a formatter will wrap a long condition, on the first comment-only line inside the consequent block body, which is where the rule places auto-fix placeholders by default.\"\n\n2. Do not modify the surrounding headings or other content; just insert this new subsection at the described location."}
Used tool: modify_file with input: {"filePath":"docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md","instruction":"In the Acceptance Criteria and Definition of Done sections, mark the documentation-related items as completed now that rule docs and migration guide have been updated.\n\n1. In the Acceptance Criteria list, change the unchecked item `- [ ] **Documentation**: Rule documentation explains both valid annotation positions and Prettier compatibility` to `- [x] **Documentation**: Rule documentation explains both valid annotation positions and Prettier compatibility`.\n\n2. In the Definition of Done list, change the unchecked items:\n   - `- [ ] Rule documentation updated with Prettier compatibility notes`\n   - `- [ ] Migration guide updated if needed for existing codebases`\n\nto checked items:\n   - `- [x] Rule documentation updated with Prettier compatibility notes`\n   - `- [x] Migration guide updated if needed for existing codebases`.\n\nDo not alter any other text in the story file."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"docs: document else-if branch annotation behavior and migration"}
Used tool: git_push with input: {}
---

**This was the result:**
---
Here’s what I implemented to complete the **##NOW** and **##NEXT** items, plus the updated plan.

---

## What I changed

### 1. Internal rule docs: else-if behavior (##NOW)

**File:** `docs/rules/require-branch-annotation.md`

I rewrote the **“Else-if annotation positions”** section so it now:

- Explicitly enumerates **three supported positions** for `else if` annotations:
  1. **Preceding-line comments** immediately before the `else if` line (including comments ESLint associates via `getCommentsBefore`).
  2. **Comments between the `else if (condition)` and the `{`**, for styles where the condition and block are on separate lines.
  3. **First comment-only lines inside the consequent block**, to match how Prettier often relocates comments when wrapping long `else if` conditions.

- Documents the **precedence** between these positions for validation/reporting:

  1. Comments immediately before the `else if` line.
  2. Comments between the condition and the `{`.
  3. Comments inside the block body.

- Clarifies **auto-fix behavior**:

  - For `else if` branches, auto-fix inserts placeholder `@story` and `@req` comments **as the first comment-only line inside the consequent block body** (just after `{`), chosen to be stable under Prettier.
  - Other branch types still get auto-fix comments **immediately before** the branch keyword.

- References the relevant **tests**:
  - `tests/rules/require-branch-annotation.test.ts`
  - `tests/utils/branch-annotation-else-if-position.test.ts`
  - `tests/utils/branch-annotation-else-if-insert-position.test.ts`
  - `tests/integration/else-if-annotation-prettier.integration.test.ts`

This now matches the actual implementation in `src/utils/branch-annotation-helpers.ts` and the story’s requirements.

---

### 2. User-facing API reference: else-if behavior (##NEXT, item 1)

**File:** `user-docs/api-reference.md`

In the **`traceability/require-branch-annotation`** section:

- **Updated the Description** to:

  - Emphasize that the rule ensures branches (if/else chains, loops, switch, try/catch) have both `@story` and `@req` in **nearby comments**.
  - Explain that for most branches it looks **immediately before** the branch keyword.
  - Call out that for **`catch`** and **`else if`** it is **formatter-aware** and accepts additional positions used by Prettier when reflowing code.

- Added a detailed **“Behavior notes”** subsection right after the Options list:

  - **Catch clauses**:
    - Valid locations: immediately before `catch`, or first comment-only lines inside the block.
    - Precedence: before-`catch` comments win when both exist.
    - Auto-fix: inserts placeholders **inside the catch block body** so Prettier keeps them attached.

  - **Else-if branches**:
    - Valid locations:
      - Immediately before the `else if` line.
      - Between `else if (condition)` and the opening `{`.
      - First comment-only lines **inside** the consequent block.
    - Precedence: before-`else if` → between condition & `{` → inside block body.
    - Auto-fix: inserts placeholders as the **first comment-only line inside the block body**, just after `{`, to stay stable under Prettier.

  - Clarified that **other branch types** (plain `if`, `else`, loops, `switch` cases) still use the simpler “comments immediately before the branch” model.

This keeps the API doc user-friendly and focused on **observable behavior**, without exposing low-level helper implementation details.

---

### 3. Migration guide: else-if adaptations (##NEXT, item 2)

**File:** `user-docs/migration-guide.md`

After section **“3.1 Multi-story `@supports` annotations”**, I added:

#### `3.2 Else-if branch annotations and formatter compatibility`

This new subsection explains for users:

- With 1.x:

  - **No changes are required** for existing annotations:
    - Comments immediately before an `else if` remain valid.
    - Annotations moved by Prettier (between `else if (condition)` and `{`, or onto first comment-only lines inside the block) are now also recognized.

- If teams previously had **workarounds or suppressions** due to formatter conflicts on `else if`:

  - They can typically **remove** those workarounds after upgrading, provided annotations are in one of the supported locations.

- For **new code**:

  - It’s fine to place annotations directly above the `else if`.
  - For long wrapped conditions, they can place annotations on the **first comment-only line inside the consequent block body**, matching where auto-fix places placeholders and where Prettier tends to keep them.

This gives clear, concise guidance on what to expect and whether any migration steps are actually needed (usually: none).

---

### 4. Else-if story document updated (##NEXT, item 3)

**File:** `docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md`

I updated the status of documentation-related criteria:

- In **Acceptance Criteria**:

  - Changed:

    - `- [ ] **Documentation**: Rule documentation explains both valid annotation positions and Prettier compatibility`

    to:

    - `- [x] **Documentation**: Rule documentation explains both valid annotation positions and Prettier compatibility`

- In **Definition of Done**:

  - Marked as completed:

    - `- [x] Rule documentation updated with Prettier compatibility notes`
    - `- [x] Migration guide updated if needed for existing codebases`

All other story text remains unchanged; this just reflects that the docs and migration guidance are now in place.

---

## Quality checks executed

Before committing and pushing, I ran the standard checks:

- **Tests**

  - `npm test -- --runInBand`  
    → All suites pass (48/48 run, 1 skipped, 352 tests passed, 2 skipped).

- **Lint**

  - `npm run lint`  
    → ESLint passes with `--max-warnings=0`.

- **Type checking**

  - `npm run type-check`  
    → `tsc --noEmit` passes.

- **Formatting**

  - `npm run format:check`  
    → Prettier reports all matched files correctly formatted.

- **Build**

  - `npm run build`  
    → TypeScript project builds successfully.

On push, the **full CI-equivalent** pre-push hook and CI pipeline (including `ci-verify:full` and `security:secrets`) completed successfully, as shown in the logs you saw (build, tests with coverage, lint, duplication, audits, secretlint, and artifact checks all passed).

The changes were committed as:

- `docs: document else-if branch annotation behavior and migration`

and pushed to `main`.

---

## Updated Plan

### NOW

- [x] Revise the internal rule documentation for branch annotations so that the else-if section clearly describes all supported annotation positions, their precedence, and how auto-fix behaves, matching the current else-if implementation and Story 026.0 requirements.

### NEXT

- [x] Update the user-facing API reference for the branch-annotation rule so that it explains the else-if behavior in user-friendly terms, including the supported annotation positions and Prettier-friendly layout, without exposing internal implementation details.
- [x] Review the migration guide and add a concise note describing how existing projects should adapt their else-if annotations, if at all, to benefit from the new behavior while avoiding surprises.
- [x] Revisit the else-if story document to ensure its documentation-related acceptance criteria and Definition of Done items accurately reflect the updated rule docs and migration guidance.

### LATER

- [ ] Expand formatter-focused integration tests to cover additional branch types such as plain else blocks, nested if/else chains, and switch cases to verify annotation stability under common formatters.
- [ ] Review all branch-annotation-related stories together (if/else-if/else, catch, switch) to confirm consistent, complete behavior descriptions across branch types and adjust stories or docs where inconsistencies appear.
- [ ] Create or extend a developer-oriented guide that summarizes intended annotation positions and auto-fix behavior for all supported branch types, including how those behaviors interact with formatters like Prettier.
- [ ] Once else-if and other branch behaviors are fully documented and stable, perform a focused refactoring pass over the branch-annotation helper utilities to keep them small, clear, and easy to maintain without changing observable behavior.
---
