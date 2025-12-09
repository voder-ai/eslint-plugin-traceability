Here’s a history-only summary of what’s been done so far on the project, including the latest work:

1. Implemented an inline `@supports` migration path for legacy `@story`/`@req` by extending `traceability/prefer-supports-annotation` to auto-migrate simple pairs from block/JSDoc/line comments, adding a `LineComment` abstraction, and updating tests, docs, and dev stories, with CI passing.

2. Expanded branch-annotation coverage for `switch`, loops, and `else-if` in `traceability/require-branch-annotation`, including fallthrough grouping, `default` handling, and `REQ-SWITCH-FALLTHROUGH` traces; refactored comment gathering, added loop heuristics, restored `else-if` autofix, and validated performance in CI.

3. Added function-level traceability to arrow and nested functions by updating `require-story-annotation` and `require-req-annotation` to support arrow/anonymous callbacks with parent-scope lookup, plus new tests and Jest runs.

4. Consolidated behavior and aligned documentation for the upcoming unified rule, updating dev stories and rule docs (especially for branches), temporarily disabling `require-story-annotation` in some CLI runs, and re-running the full toolchain successfully.

5. Intentionally pushed a CI run with known lint/format failures by bypassing Husky (`git push --no-verify`), confirming `main` vs `origin/main` state, and validating that build/tests/type-check passed while lint/format failed as expected.

6. Introduced the unified `traceability/require-traceability` rule and alias model by composing existing rules, updating exports and presets, adding tests, briefly wiring a test directly to the unified rule, updating docs/dev stories, and running the full toolchain.

7. Finalized the alias refactor so `require-story-annotation` and `require-req-annotation` are true runtime aliases of `require-traceability`, added `createAliasRule`, adjusted metadata/messages, updated tests to assert shared behavior, removed the dedicated unified-rule test file, and re-verified CI.

8. Shifted UX/docs to be `@supports`‑first by updating rule metadata/messages/suggestions, clarifying internal comments, updating tests/examples/API/migration guide/README, marking the supports-migration dev story as complete, and passing the full verification pipeline.

9. Improved Jest branch coverage for `annotation-checker` by pruning unrealistic tests, adding `annotation-checker-branches.test.ts` with mocked parent-node/autofix-disabled scenarios, and re-running lint/type-check/format/CI.

10. Refactored missing-`@req` reporting by extracting `buildMissingReqReportOptions(node, enableFix)` from `annotation-checker.ts`, simplifying `reportMissing`, and validating via focused tests.

11. Extended test coverage for `branch-annotation-helpers.ts`, especially `gatherBranchCommentText` across `SwitchCase`, `CatchClause`, and loops using realistic `SourceCode`-like stubs, then re-ran Jest and `ci-verify:full`.

12. Aligned documentation around the unified rule and legacy aliases by updating README, API reference, examples, and migration/ESLint 9 setup docs, emphasizing `require-traceability`, documenting supporting rules and severities, and re-running all checks.

13. Performed dependency maintenance by bumping `ts-jest` to `^29.4.6`, updating the lockfile, re-running the full quality suite, performing dependency maturity/security checks, and recording results in `docs/dependency-health.md`.

14. Clarified unified-rule docs and created a traceability overview/FAQ by ensuring consistency across `src/index.ts`, README, and user docs; adding a Usage section and flat-config example; creating and linking `traceability-overview.md`; refining migration guide details; updating `no-redundant-annotation` severity docs; adding a JSDoc traceability block to `runEslint`; improving CLI test isolation; and re-running the toolchain.

15. Confirmed latest documentation and CI state by updating API reference examples to be `@supports`‑first, verifying alignment of docs/dev stories with the unified-rule model, re-running build/tests/lint/type-check/format:check, and confirming clean pre-push hooks and CI/CD success.

16. Added and extended integration tests for the unified rule and aliases in `require-traceability-aliases.integration.test.ts`, with shared helpers and fixtures verifying diagnostics under all three rule IDs and preset behavior, updating the dev story’s DoD, and passing all checks with CI success.

17. Documented redundant-annotation cleanup in the migration guide (section 3.3), explaining `no-redundant-annotation` behavior, patterns, safety guarantees, workflow, and configuration; aligned the dev story; ran `ci-verify:fast`; and confirmed CI success.

18. Increased branch coverage for `annotation-scope-analyzer` and validated comment-removal edge cases by extending its tests (multiple `REQ-*` in `@supports`, CR-only newlines, strictness modes, coverage checks, removal ranges), adding traceability annotations, and confirming coverage and CI success.

19. Refactored `no-redundant-annotation` helpers by extracting `getStatementPairsForRedundancy`, `isStatementRedundantWithinScope`, and `getAnnotationCommentsFromStatement`; rewriting `getRedundantStatementContext` to use them; annotating with `@supports`; then refactoring scope-pair collection with `getScopeCommentsFromJSDocAndLeading` and a simplified `getScopePairs` using `gatherBranchCommentText` and extraction helpers; all verified via tests, lint/type-check/format/build/duplication with passing CI.

20. Generalized internal code-quality doc references in `CONTRIBUTING.md`, ensuring user-facing docs no longer link to internal dev stories and that workflow descriptions match `package.json` and Husky hooks; then ran `check:scripts`, lint, tests, type-check, format:check, build, duplication, and `security:secrets`, and validated CI.

21. Expanded coverage for `no-redundant-annotation` tests with scenarios for function-scope JSDoc vs statement duplicates, multi-REQ `@supports` redundancy, mixed annotations introducing new IDs (valid), intentional branch+statement duplication (valid), and ensuring test names carry requirement IDs; verified improved coverage and semantics, then re-ran build/lint/type-check/format:check with CI success.

22. Added focused coverage for `require-story-utils`’s `getNodeName` by creating `tests/rules/require-story-utils.test.ts` with traceability annotations, covering identifiers, literals, template literals, member/qualified names, property keys, wrappers, and fallbacks; achieved high coverage, verified behavior, and ran full local quality checks with a successful CI pipeline (`20052886131`).

23. Further extended `getNodeName` coverage for defensive template literal branches by analyzing uncovered lines, adding tests for non-TemplateLiteral nodes with `quasis`, TemplateLiterals with expressions, nullish/missing `quasis`, and `raw`-only fallbacks, updating `tests/rules/require-story-utils.test.ts`, running focused Jest/coverage and the full suite, committing (`test: extend getNodeName coverage for defensive template literal branches`), pushing, and confirming CI/CD run `20053398211` succeeded, while recording that remaining uncovered guards are intentionally untested defensive fallbacks.

24. Most recently, focused on documenting and consolidating the version control and release strategy, and aligning CI/CD and contributor docs with actual configuration:
    - Reviewed the existing CI/CD workflow (`.github/workflows/ci-cd.yml`), release tooling (`.releaserc.json`), `package.json` scripts and `engines`, Husky hooks, `CONTRIBUTING.md`, `docs/ci-cd-pipeline.md`, and relevant ADRs (`006`, `007`, `adr-pre-push-parity`, and `docs/conventional-commits-guide.md`) to confirm the current trunk-based, semantic-release-driven model.
    - Identified that documentation around Node version matrix, secret scanning, pre-push behavior, and the release trigger model was slightly out of sync or scattered across multiple files.
    - Created a new ADR, `docs/decisions/014-version-control-and-release-strategy.accepted.md`, which consolidates and formalizes:
      - Trunk-based development on `main` as the single long-lived integration branch.
      - Mandatory use of Conventional Commits (with explicit mapping of commit types to semantic version bumps and which types do not trigger releases).
      - A single unified CI/CD workflow that:
        - Runs all quality gates on a Node matrix.
        - Runs semantic-release only on `push` to `main` and only for the Node `22.14.0` matrix entry.
        - Never releases on `pull_request` events.
        - Uses semantic-release as the sole release orchestrator, with automated npm publishing from CI only and no manual tagging or `npm publish`.
      - Pre-push parity with CI by running `npm run ci-verify:full`, plus the existing ADR links and rationale/consequences.
    - Updated ADR `docs/decisions/006-semantic-release-for-automated-publishing.accepted.md` by adding a short section after “Context and Problem Statement” clarifying that it also codifies trunk-based development on `main`, and that semantic-release runs only from CI on push to `main` in a single unified workflow, not via tag-based or manual triggers.
    - Updated `docs/ci-cd-pipeline.md` to:
      - Reflect the actual Node.js matrix in `ci-cd.yml` (`18.18.0`, `20.0.0`, `22.14.0`, `24.0.0`) and align the “Supported Runtime and Tooling” section with `engines.node: "^18.18.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"`, explaining that CI covers a representative subset and users must satisfy the engines constraint.
      - Clarify that secret scanning (`npm run security:secrets`) runs for every matrix entry, not just a single Node version.
      - Document that semantic-release is guarded to run only on `push` events to `main` and only for `node-version: 22.14.0`, and that the workflow still runs on `pull_request` for feedback but never releases from PRs.
      - Confirm and describe the relationship between `ci-verify:full`, Husky pre-push hooks, and CI, and then update the “Local Workflow and Hooks” section so that the pre-push hook is documented as running both `npm run ci-verify:full` and `npm run security:secrets`, removing the earlier statement that secret scanning was CI-only.
    - Updated `CONTRIBUTING.md` (primarily in the “Pull Request Process” and surrounding guidance) to:
      - Explicitly state that the repository uses semantic-release with Conventional Commits and a single unified CI/CD workflow running on pushes to `main` to decide when to publish a new version.
      - Emphasize that contributors should focus on clear Conventional Commit messages, because releases are never triggered manually or by tags and instead happen automatically from CI on successful pushes to `main`.
    - Ran local quality checks (`npm test -- --runInBand --ci --bail`, `npm run lint`, `npm run type-check`, `npm run build`, `npm run format:check`), staged and committed the documentation changes (`docs: document trunk-based version control and release strategy`, then `docs: refine CI/CD and contributor docs for release flow`), pushed to `main`, and confirmed that the GitHub “CI/CD Pipeline” workflow completed successfully for both pushes.

**Most recently we've executed the following action:**

---
Used tool: read_file with input: {"filePath":"src/rules/annotation-scope-analyzer.ts","startLine":180,"endLine":260}
Used tool: find_files with input: {"pattern":"*annotation-scope-analyzer*","directory":"tests"}
Used tool: find_files with input: {"pattern":"*annotation-checker*","directory":"tests"}
Used tool: find_files with input: {"pattern":"*annotation-scope-analyzer*","directory":"src"}
Used tool: read_file with input: {"filePath":"src/utils/annotation-scope-analyzer.ts","startLine":180,"endLine":260}
Used tool: read_file with input: {"filePath":"src/utils/annotation-scope-analyzer.ts","startLine":260,"endLine":360}
Used tool: read_file with input: {"filePath":"tests/utils/annotation-scope-analyzer.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/annotation-checker-branches.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/annotation-checker.test.ts"}
Used tool: read_file with input: {"filePath":"src/utils/annotation-scope-analyzer.ts"}
Used tool: modify_file with input: {"filePath":"tests/utils/annotation-scope-analyzer.test.ts","instruction":"After the existing test named \"[REQ-SAFE-REMOVAL] computes removal range for inline comment\", insert the following two tests:\n\n    it(\n      \"[REQ-SAFE-REMOVAL] consumes trailing spaces and tabs following a full-line comment\",\n      () => {\n        const source =\n          \"const x = 1;\\n// @story docs/stories/001.story.md   \\t  \\nconst y = 2;\\n\";\n        const sourceCode = {\n          getText() {\n            return source;\n          },\n        } as unknown as ReturnType<Rule.RuleContext[\"getSourceCode\"]>;\n\n        const start = source.indexOf(\"// @story\");\n        const end = start + \"// @story docs/stories/001.story.md\".length;\n        const comment = { range: [start, end] };\n\n        const [removalStart, removalEnd] = getCommentRemovalRange(\n          comment,\n          sourceCode,\n        );\n        const removed =\n          source.slice(0, removalStart) + source.slice(removalEnd);\n\n        expect(removed).toBe(\"const x = 1;\\nconst y = 2;\\n\");\n      },\n    );\n\n    it(\n      \"[REQ-SAFE-REMOVAL] handles full-line comment at end of file without trailing newline\",\n      () => {\n        const source =\n          \"const x = 1;\\n// @story docs/stories/001.story.md\";\n        const sourceCode = {\n          getText() {\n            return source;\n          },\n        } as unknown as ReturnType<Rule.RuleContext[\"getSourceCode\"]>;\n\n        const start = source.indexOf(\"// @story\");\n        const end = start + \"// @story docs/stories/001.story.md\".length;\n        const comment = { range: [start, end] };\n\n        const [removalStart, removalEnd] = getCommentRemovalRange(\n          comment,\n          sourceCode,\n        );\n        const removed =\n          source.slice(0, removalStart) + source.slice(removalEnd);\n\n        expect(removed).toBe(\"const x = 1;\\n\");\n        expect(removalEnd).toBe(source.length);\n      },\n    );\n\nAfter the existing test named \"[REQ-SAFE-REMOVAL] returns [0, 0] for comments with invalid range length (EXPECTS EXPECTED_RANGE_LENGTH usage)\", insert the following test:\n\n    it(\n      \"[REQ-SAFE-REMOVAL] returns [0, 0] when comment range is not an array\",\n      () => {\n        const source = \"const x = 1;\";\n        const sourceCode = {\n          getText() {\n            return source;\n          },\n        } as unknown as ReturnType<Rule.RuleContext[\"getSourceCode\"]>;\n\n        const comment = { range: null as unknown as [number, number] };\n\n        const range = getCommentRemovalRange(comment, sourceCode);\n        expect(range).toEqual([0, 0]);\n      },\n    );"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--testPathPattern","tests/utils/annotation-scope-analyzer.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--testPathPatterns","tests/utils/annotation-scope-analyzer.test.ts"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: extend annotation-scope-analyzer coverage for comment removal edge cases"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--passWithNoTests"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":20062448241}
---

**This was the result:**
---
Analyzed and implemented as requested. Here’s what was done and the updated plan.

## What I implemented

### ##NOW – Analysis of uncovered branches

- Inspected `src/utils/annotation-scope-analyzer.ts`, focusing on `getCommentRemovalRange` and the surrounding logic:
  - Branches of interest:
    - Early guard: invalid `range` (not array or wrong length) → `[0, 0]`.
    - `onlyWhitespaceBeforeComment` deciding whether to expand `removalStart` to the line start.
    - Loop that consumes trailing spaces/tabs after the comment.
    - Conditional inclusion of newline(s) (`\n`, `\r`, `\r\n`) when the comment owns the line and there is text after it.
    - Behavior when the comment is at end-of-file with no trailing newline.

- Correlated this with existing tests in `tests/utils/annotation-scope-analyzer.test.ts`:
  - Already covered:
    - Full-line comment with `\n`.
    - Full-line comment with `\r\n`.
    - Full-line comment with standalone `\r`.
    - Inline comment on a code line.
    - Guard for wrong range length (array of wrong size).
  - Not fully exercised:
    - Trailing spaces/tabs after a full-line comment.
    - Full-line comment at end-of-file without a newline.
    - Guard when `range` is non-array (e.g. `null`).

This completes the “analyze uncovered branches and derive needed scenarios” part.

### ##NEXT – Design, implement, and validate tests

#### 1) Designed concrete test cases

Based on the analysis, I designed three additional scenarios:

1. **Trailing whitespace after full-line comment**  
   Verifies the loop that consumes spaces and tabs after the comment, ensuring the entire logical line is removed, including trailing whitespace.

2. **Full-line comment at end-of-file without trailing newline**  
   Ensures behavior when `removalEnd` reaches `fullText.length`, so no newline is consumed and the function still correctly trims the comment while leaving the preceding line intact.

3. **Non-array `range` value**  
   Exercises the guard `!Array.isArray(range) || range.length !== EXPECTED_RANGE_LENGTH`, confirming it returns `[0, 0]` when `range` is not an array at all (e.g. `null`).

All are behavior-focused and framed as REQ-SAFE-REMOVAL behavior.

#### 2) Added new tests to the existing suite

I extended `tests/utils/annotation-scope-analyzer.test.ts` (which already has proper traceability annotations):

File header (unchanged, already compliant):

```ts
/**
 * Unit tests for annotation-scope-analyzer utilities
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS REQ-DUPLICATION-DETECTION REQ-STATEMENT-SIGNIFICANCE REQ-SAFE-REMOVAL REQ-CONFIGURABLE-STRICTNESS
 */
```

New tests (summarized; all names include `[REQ-SAFE-REMOVAL]`):

1. **Trailing spaces and tabs after full-line comment**

```ts
it(
  "[REQ-SAFE-REMOVAL] consumes trailing spaces and tabs following a full-line comment",
  () => {
    const source =
      "const x = 1;\n// @story docs/stories/001.story.md    \t  \nconst y = 2;\n";
    const sourceCode = {
      getText() {
        return source;
      },
    } as unknown as ReturnType<Rule.RuleContext["getSourceCode"]>;

    const start = source.indexOf("// @story");
    const end = start + "// @story docs/stories/001.story.md".length;
    const comment = { range: [start, end] };

    const [removalStart, removalEnd] = getCommentRemovalRange(
      comment,
      sourceCode,
    );
    const removed =
      source.slice(0, removalStart) + source.slice(removalEnd);

    expect(removed).toBe("const x = 1;\nconst y = 2;\n");
  },
);
```

2. **Full-line comment at EOF without newline**

```ts
it(
  "[REQ-SAFE-REMOVAL] handles full-line comment at end of file without trailing newline",
  () => {
    const source =
      "const x = 1;\n// @story docs/stories/001.story.md";
    const sourceCode = {
      getText() {
        return source;
      },
    } as unknown as ReturnType<Rule.RuleContext["getSourceCode"]>;

    const start = source.indexOf("// @story");
    const end = start + "// @story docs/stories/001.story.md".length;
    const comment = { range: [start, end] };

    const [removalStart, removalEnd] = getCommentRemovalRange(
      comment,
      sourceCode,
    );
    const removed =
      source.slice(0, removalStart) + source.slice(removalEnd);

    expect(removed).toBe("const x = 1;\n");
    expect(removalEnd).toBe(source.length);
  },
);
```

3. **Non-array `range`**

```ts
it(
  "[REQ-SAFE-REMOVAL] returns [0, 0] when comment range is not an array",
  () => {
    const source = "const x = 1;";
    const sourceCode = {
      getText() {
        return source;
      },
    } as unknown as ReturnType<Rule.RuleContext["getSourceCode"]>;

    const comment = { range: null as unknown as [number, number] };

    const range = getCommentRemovalRange(comment, sourceCode);
    expect(range).toEqual([0, 0]);
  },
);
```

These tests live alongside the existing ones and use the same story/requirement traceability structure.

#### 3) Reviewed tests for behavior focus and independence

- All new tests:
  - Verify observable behavior (resulting string or returned range), not internal implementation details.
  - Use self-contained `source` strings and synthetic `sourceCode` objects with `getText()`, avoiding shared mutable state.
  - Use clear, requirement-tagged test names: `[REQ-SAFE-REMOVAL] ...`.
  - Do not depend on other tests or execution order.

#### 4) Verified coverage and adjusted as needed

- Ran focused tests first:

  ```bash
  npm test -- --runInBand --testPathPatterns tests/utils/annotation-scope-analyzer.test.ts
  ```

  Result: 1 suite, 21 tests, all passing.

- Ran full quality checks:

  ```bash
  npm run build
  npm run lint -- --max-warnings=0
  npm run type-check
  npm run format:check
  npm test -- --runInBand --passWithNoTests
  ```

  All passed.

- Complete CI-equivalent run occurred in pre-push and in CI:

  - `npm run ci-verify:full` (build, type-check, lint, duplication, coverage, format, audits, traceability, etc.).
  - `npm run security:secrets`.

- Post-change Jest coverage report (excerpt):

  ```text
  src/utils
    annotation-scope-analyzer.ts          |     100 |      100 |     100 |     100 |
  ```

  The previously uncovered branches in `annotation-scope-analyzer.ts` are now fully covered; there are no remaining uncovered branches in that module, so no additional “defensive-only” code paths need explicit documentation.

- Git operations:

  - Committed with:

    ```text
    test: extend annotation-scope-analyzer coverage for comment removal edge cases
    ```

  - Pushed to `main`.
  - GitHub Actions `CI/CD Pipeline (main)` run `20062448241` completed with conclusion `success`.

## Updated Plan

### NOW

- [x] Analyze the behavior of the logic around the currently uncovered branches in the annotation scope analyzer so you can determine exactly what scenarios and inputs new tests need to cover for those code paths.

### NEXT

- [x] Design concrete test cases that exercise each of the identified scenarios for the uncovered branches, focusing on observable behavior and edge conditions rather than internal implementation details.
- [x] Add the new tests to the existing test suite that covers the annotation scope analyzer, ensuring they follow the project’s traceability conventions with appropriate @supports annotations and requirement IDs in test names.
- [x] Review the new tests to confirm they are behavior-focused and independent, and that together they exercise all previously uncovered branches in the targeted section of the annotation scope analyzer.
- [x] Adjust or extend the tests if any branches remain uncovered for legitimate behavioral paths, and explicitly document in code comments where remaining branches are purely defensive guards that are intentionally left untested.

If you’d like, I can next look at other minor coverage gaps (e.g., in maintenance helpers or specific rules) and propose similarly targeted tests.
---
