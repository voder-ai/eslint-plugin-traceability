Here’s a history-only summary of what’s been done so far on the project, including the most recent cycle.

---

### Migration to `@supports` and unified traceability

- Introduced an `@supports`‑first migration path from legacy `@story` / `@req` via `traceability/prefer-supports-annotation`.
- Auto-migrated simple legacy annotations across block comments, JSDoc, and line comments, adding a `LineComment` abstraction and updating tests and docs accordingly.
- Implemented a unified `traceability/require-traceability` rule that combines function‑level and branch‑level requirements.
- Converted `require-story-annotation` and `require-req-annotation` to aliases backed by a shared alias engine (`createAliasRule`, `createAliasRuleMeta`), and updated exports, presets, and documentation to center on the unified rule.
- Tightened and clarified annotation format handling via `valid-annotation-format` and its helpers, covering whitespace rules and multi‑line / mixed `@req` + `@supports` semantics.

---

### Function and branch annotation behavior

- Extended `traceability/require-branch-annotation` to support:
  - `switch` statements (including grouped fallthrough and `default`),
  - loop constructs (`for`, `while`, etc.),
  - `else-if` chains.
- Added `REQ-SWITCH-FALLTHROUGH` trace handling and refactored branch comment gathering to better match realistic AST patterns, restoring the `else-if` autofix behavior.
- Enhanced function‑level rules to:
  - cover arrow functions, nested / anonymous callbacks,
  - inherit annotations from parent scopes,
  - exclude test framework callbacks by default.
- Implemented `test-callback-exclusion` helpers that:
  - recognize Jest/Mocha/Vitest helpers (including focused/skipped/alias variants) but never exclude Vitest `bench`,
  - properly handle nested callbacks inside excluded test callbacks while treating local wrapper helpers as non‑excluded,
  - expose configuration: `excludeTestCallbacks` (default `true`) and `additionalTestHelperNames`.

---

### Redundant-annotation handling and scope analysis

- Strengthened `no-redundant-annotation` by refactoring core helpers (`getStatementPairsForRedundancy`, `isStatementRedundantWithinScope`, `getAnnotationCommentsFromStatement`, `getRedundantStatementContext`) and clarifying guarantees in the migration guide.
- Added `[REQ-SAFE-REMOVAL]` tests and broadened coverage of edge cases for comment removal (including EOF/invalid ranges).
- Increased test coverage for `annotation-scope-analyzer` and `branch-annotation-helpers`, especially for comment detection around `SwitchCase`, `CatchClause`, and loops.

---

### Documentation and story alignment

- Updated README, API reference, examples, migration guide, ESLint 9 setup docs, and added `traceability-overview.md` + FAQ to:
  - emphasize `@supports`‑first usage,
  - highlight `require-traceability` and its aliases,
  - explain redundant-annotation cleanup and severity (`no-redundant-annotation`, `REQ-ERROR-SEVERITY`),
  - document CLI test isolation and config presets.
- Aligned docs and `src/index.ts` exports with the unified rule model and canonical names.
- Completed and documented the function-annotations story (`003.0-DEV-FUNCTION-ANNOTATIONS`), including:
  - closing GitHub issue #5 after release `v1.17.0`,
  - recording exact `gh` commands and expected outputs in the story’s Acceptance Criteria and DoD.

---

### Test, integration, and coverage work

- Expanded Jest coverage for:
  - `annotation-checker`,
  - `annotation-scope-analyzer`,
  - `branch-annotation-helpers`,
  - `require-story-utils.getNodeName`,
  - `test-callback-exclusion` helpers.
- Added integration tests:
  - `require-traceability-aliases.integration.test.ts` to validate the unified rule plus aliases, using shared fixtures and diagnostic assertions.
  - `require-traceability-test-callbacks.integration.test.ts` to cover:
    - combined `require-traceability` + `require-story-annotation` behavior,
    - `describe`/`it` handling,
    - Vitest `bench`,
    - custom test helpers and `additionalTestHelperNames`,
    - annotation inheritance and exclusion logic.
- Ensured tests reference appropriate stories and requirement IDs (e.g., `REQ-UNIFIED-ALIAS-ENGINE`, migration rules, test-callback exclusion requirements) in headers and test names.

---

### Linting, complexity, and refactors

- Tightened ESLint complexity thresholds:
  - reduced cyclomatic complexity to 16,
  - lowered `max-lines-per-function` from 55 to 45 for TS/JS files.
- Refactored several oversized helpers into smaller units, including:
  - wiring helpers in `src/index.ts` (`wireUnifiedFunctionAnnotationAliases`, `wirePreferSupportsAlias`) and alias meta creation.
  - `valid-annotation-format` internals, restoring `collapseAnnotationValue` behavior and refining whitespace and embedded `@supports` validation.
  - `prefer-implements-annotation` internals (`collectReqIndicesAfterStory`, `advanceInlineGroupIndex`, etc.) to clarify inline group handling.
- Tightened typings in `test-callback-exclusion.ts` by introducing `TraceabilityNodeWithParent` and better-typed `TSESTree` call expressions.

---

### Versioning, CI/CD, and contributing processes

- Updated dependencies (including `ts-jest`) and lockfile, and documented dependency health.
- Evolved CI/CD workflows and semantic-release configuration toward:
  - trunk-based development on `main`,
  - Conventional Commits,
  - CI-only releases,
  - clarified node version matrix, secret scanning, and `ci-verify:full` behavior.
- Added/updated ADRs:
  - ADR 014 for version control and release strategy,
  - ADR 006 for CI/CD details,
  - ADR 013 for test-callback exclusion coverage and Vitest `bench` handling.
- Updated `CONTRIBUTING.md` for the unified CI/CD workflow and semantic-release usage.
- Validated CI behavior through controlled failing runs (e.g., lint/format failures while build/tests/type-check still pass).

---

### Maintenance CLI and tooling

- Ensured maintenance CLI tools (`detect`, `verify`, `report`, `update`) are fully traced:
  - `src/maintenance/cli.ts` uses inline `@supports` on `switch` cases, help/usage handling, unknown command branches, and error handlers.
  - `src/maintenance/commands.ts` function JSDocs (`handleDetect`, `handleVerify`, `handleReport`, `handleUpdate`) carry `@supports` for `REQ-MAINT-*` requirements.
  - `src/maintenance/report.ts` applies `@supports` to the “no stale annotations” vs. “stale annotations present” branches to distinguish `REQ-MAINT-SAFE` from `REQ-MAINT-REPORT`.
  - `src/maintenance/update.ts` annotates:
    - per-file update helpers,
    - directory existence checks,
    - per-file iteration loops for batch updates.
  - `src/maintenance/index.ts` module-level JSDoc aggregates `@supports` for the full maintenance tool surface (`REQ-MAINT-DETECT`, `REQ-MAINT-UPDATE`, `REQ-MAINT-BATCH`, `REQ-MAINT-VERIFY`, `REQ-MAINT-REPORT`, `REQ-MAINT-SAFE`).

---

### Plugin wiring and traceability annotations

- Enriched JSDoc and inline `@supports` annotations in `src/index.ts` so that:
  - `createAliasRuleMeta` and `wireUnifiedFunctionAnnotationAliases` reference:
    - function-annotation story `003.0-DEV-FUNCTION-ANNOTATIONS` (`REQ-ANNOTATION-REQUIRED`, `REQ-EXPORT-PRIORITY`),
    - the unified function rule and alias engine story `010.4-DEV-UNIFIED-FUNCTION-RULE-AND-ALIASES` (`REQ-UNIFIED-ALIAS-ENGINE`).
  - `wirePreferSupportsAlias` references:
    - `010.3-DEV-MIGRATE-TO-SUPPORTS` / `REQ-RULE-NAME`,
    - `010.4` / `REQ-MIGRATION-RULE-NAMING` for unified alias naming.
  - `createTraceabilityFlatConfig` references:
    - error-severity and reporting story `007.0-DEV-ERROR-REPORTING` / `REQ-ERROR-SEVERITY`,
    - ESLint config presets story `002.0-DEV-ESLINT-CONFIG` / `REQ-CONFIG-PRESETS`.
  - Existing plugin metadata `@supports` tags (e.g., `REQ-PLUGIN-STRUCTURE`, `REQ-NPM-PACKAGE`) remain in place.

---

### Continuous quality verification

- Repeatedly executed the full quality suite after substantial changes, including:
  - `npm test` (often with `--runInBand` / `--bail`),
  - `npm run lint -- --max-warnings=0`,
  - `npm run type-check`,
  - `npm run build`,
  - `npm run format` / `npm run format:check`,
  - duplication and traceability checks.
- Used targeted runs (e.g., `ci-verify:fast`, specific integration tests) for focused validation.
- Regularly confirmed a clean Git status, committed changes with conventional, descriptive messages (e.g., `chore: tighten eslint complexity threshold to 16`, `refactor: lower max function length and split oversized helpers`, `chore: add @supports traceability to plugin and maintenance wiring`), and pushed to `main`.
- Verified that GitHub CI workflows (`CI/CD Pipeline`) consistently completed successfully after each change set.

---

### Recent work on `valid-annotation-format` and Voder metadata

- Enabled the `valid-annotation-format` rule in the project’s lint configuration and introduced targeted suppressions so that existing TS/JS files pass linting with the rule active.
- Updated malformed or legacy traceability annotations in helper modules to comply with the new format rule and removed corresponding suppressions where appropriate.
- Refactored a duplicated helper pattern in traceability rule helpers into a shared function to reduce duplication without increasing complexity.
- Aligned remaining mixed `@story`/`@req` annotations on core rule entry points with the `@supports`‑first style, making annotation usage consistent across the codebase.
- In the most recent cycle:
  - Reviewed the working tree and confirmed that only Voder metadata files were uncommitted (e.g., `.voder/history.md`, `.voder/implementation-progress.md`, `.voder/last-action.md`, `.voder/plan.md`, `.voder/progress-chart.png`, `.voder/progress-log-areas.csv`, `.voder/progress-log.csv`).
  - Committed these metadata updates with `chore: update voder metadata for valid-annotation-format rule work`.
  - Ran the full local quality suite (`npm run build`, `npm run type-check`, `npm run lint`, `npm test`, `npm run format:check`), all of which passed.
  - Pushed the changes to the remote and confirmed that the `CI/CD Pipeline` on `main` (run ID `20080702255`) completed successfully with a `success` conclusion.

**Most recently we've executed the following action:**

---
Used tool: get_git_status with input: {}
Used tool: list_directory with input: {"dirPath":"."}
Used tool: find_files with input: {"pattern":"annotation-checker-*.test.*","directory":"tests"}
Used tool: read_file with input: {"filePath":"tests/utils/annotation-checker-branches.test.ts","startLine":1,"endLine":400}
Used tool: list_directory with input: {"dirPath":"tests/perf"}
Used tool: read_file with input: {"filePath":"tests/perf/maintenance-large-workspace.test.ts","startLine":1,"endLine":400}
Used tool: read_file with input: {"filePath":"tests/perf/maintenance-cli-large-workspace.test.ts","startLine":1,"endLine":400}
Used tool: read_file with input: {"filePath":"tests/maintenance/detect-isolated.test.ts","startLine":1,"endLine":400}
Used tool: search_file_content with input: {"filePath":"jest.config.js","pattern":"testEnvironment","isRegex":false}
Used tool: read_file with input: {"filePath":"src/maintenance/detect.ts","startLine":1,"endLine":400}
Used tool: read_file with input: {"filePath":"src/maintenance/utils.ts","startLine":1,"endLine":260}
Used tool: generate_file with input: {"filePath":"tests/utils/annotation-checker-autofix-behavior.test.ts","overwrite":false,"content":"/**\n * Focused autofix behavior tests for annotation-checker helper.\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-AUTOFIX REQ-ANNOTATION-REPORTING\n */\n\njest.mock(\"../../src/utils/reqAnnotationDetection\", () => ({\n  // Always report that no requirement annotation is present so we exercise\n  // the missing-annotation reporting and autofix paths in the helper.\n  hasReqAnnotation: jest.fn(() => false),\n}));\n\njest.mock(\"../../src/rules/helpers/require-story-utils\", () => ({\n  // Provide a stable, human-readable name so reporting paths are predictable\n  // without depending on the full real implementation.\n  getNodeName: jest.fn(() => \"mockName\"),\n}));\n\nimport { checkReqAnnotation } from \"../../src/utils/annotation-checker\";\n\n/**\n * Build a minimal ESLint rule context stub that captures report() calls.\n *\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REPORTING\n */\nfunction createContextStub() {\n  const report = jest.fn();\n  const sourceCode = {\n    getJSDocComment: jest.fn(() => null),\n    getCommentsBefore: jest.fn(() => []),\n  } as any;\n\n  const context = {\n    getSourceCode() {\n      return sourceCode;\n    },\n    report,\n  } as any;\n\n  return { context, report };\n}\n\ndescribe(\n  \"annotation-checker helper autofix behavior (Story 003.0-DEV-FUNCTION-ANNOTATIONS)\",\n  () => {\n    it(\"[REQ-ANNOTATION-AUTOFIX] attaches fix directly to node when parent is missing\", () => {\n      const { context, report } = createContextStub();\n      const node = { type: \"FunctionDeclaration\" } as any; // no parent property\n\n      checkReqAnnotation(context, node, { enableFix: true });\n\n      expect(report).toHaveBeenCalledTimes(1);\n      const reportArg = report.mock.calls[0][0];\n\n      expect(reportArg).toHaveProperty(\"fix\");\n      const fixer = { insertTextBefore: jest.fn() } as any;\n\n      reportArg.fix(fixer);\n\n      expect(fixer.insertTextBefore).toHaveBeenCalledWith(\n        node,\n        \"/** @req <REQ-ID> */\\n\",\n      );\n    });\n\n    it(\"[REQ-ANNOTATION-AUTOFIX] attaches fix to MethodDefinition wrapper when parent is a method\", () => {\n      const { context, report } = createContextStub();\n      const methodParent = { type: \"MethodDefinition\" } as any;\n      const node = {\n        type: \"FunctionExpression\",\n        parent: methodParent,\n        id: { type: \"Identifier\", name: \"methodImpl\" },\n      } as any;\n\n      checkReqAnnotation(context, node, { enableFix: true });\n\n      expect(report).toHaveBeenCalledTimes(1);\n      const reportArg = report.mock.calls[0][0];\n\n      const fixer = { insertTextBefore: jest.fn() } as any;\n      reportArg.fix(fixer);\n\n      expect(fixer.insertTextBefore).toHaveBeenCalledWith(\n        methodParent,\n        \"/** @req <REQ-ID> */\\n\",\n      );\n    });\n\n    it(\"[REQ-ANNOTATION-AUTOFIX] attaches fix to VariableDeclarator when node is its init\", () => {\n      const { context, report } = createContextStub();\n      const declarator: any = { type: \"VariableDeclarator\" };\n      const node: any = { type: \"FunctionExpression\", parent: declarator };\n      declarator.init = node;\n\n      checkReqAnnotation(context, node, { enableFix: true });\n\n      expect(report).toHaveBeenCalledTimes(1);\n      const reportArg = report.mock.calls[0][0];\n\n      const fixer = { insertTextBefore: jest.fn() } as any;\n      reportArg.fix(fixer);\n\n      expect(fixer.insertTextBefore).toHaveBeenCalledWith(\n        declarator,\n        \"/** @req <REQ-ID> */\\n\",\n      );\n    });\n\n    it(\"[REQ-ANNOTATION-AUTOFIX] attaches fix to ExpressionStatement wrapper when parent is an expression\", () => {\n      const { context, report } = createContextStub();\n      const expressionParent = { type: \"ExpressionStatement\" } as any;\n      const node = {\n        type: \"FunctionExpression\",\n        parent: expressionParent,\n        id: { type: \"Identifier\", name: \"iife\" },\n      } as any;\n\n      checkReqAnnotation(context, node, { enableFix: true });\n\n      expect(report).toHaveBeenCalledTimes(1);\n      const reportArg = report.mock.calls[0][0];\n\n      const fixer = { insertTextBefore: jest.fn() } as any;\n      reportArg.fix(fixer);\n\n      expect(fixer.insertTextBefore).toHaveBeenCalledWith(\n        expressionParent,\n        \"/** @req <REQ-ID> */\\n\",\n      );\n    });\n\n    it(\"[REQ-ANNOTATION-AUTOFIX] omits fix when enableFix is false\", () => {\n      const { context, report } = createContextStub();\n      const node = {\n        type: \"FunctionDeclaration\",\n        parent: { type: \"Program\" },\n        id: { type: \"Identifier\", name: \"noFix\" },\n      } as any;\n\n      checkReqAnnotation(context, node, { enableFix: false });\n\n      expect(report).toHaveBeenCalledTimes(1);\n      const reportArg = report.mock.calls[0][0];\n\n      expect(reportArg.fix).toBeUndefined();\n    });\n  },\n);\n"}
Used tool: remove_file with input: {"filePath":"tests/utils/annotation-checker-branches.test.ts"}
Used tool: modify_file with input: {"filePath":"tests/perf/maintenance-large-workspace.test.ts","instruction":"Replace the shared workspace setup using beforeAll/afterAll with per-test workspace creation and cleanup. For each test, call createLargeWorkspace() at the start of the test, use the returned root path for operations, and ensure cleanup() is called in a finally block. Keep the shape and assertions of each test the same, only adjusting them so they no longer rely on outer-scoped shared state."}
Used tool: modify_file with input: {"filePath":"tests/perf/maintenance-cli-large-workspace.test.ts","instruction":"Refactor the tests to avoid sharing workspace state across tests. Remove the beforeAll/afterAll hooks and originalCwd variable. For each test, create a fresh workspace by calling createCliLargeWorkspace(), change the working directory if necessary within the test, and ensure you restore process.cwd() and call cleanup() in a finally block. Preserve the existing assertions and overall behavior."}
Used tool: modify_file with input: {"filePath":"tests/maintenance/detect-isolated.test.ts","instruction":"Refactor the permission-focused test \"handles permission denied errors by returning an empty result\" to avoid relying on real filesystem permission changes. Instead, stub or mock fs.readFileSync or another appropriate fs call within detectStaleAnnotations so that it throws a permission-like error for the specific directory or file, and then assert that detectStaleAnnotations returns an empty array rather than throwing. Keep the intent of validating graceful handling of permission errors but make the test platform-tolerant."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","tests/maintenance/detect-isolated.test.ts","tests/perf/maintenance-cli-large-workspace.test.ts","tests/perf/maintenance-large-workspace.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: rename annotation checker and improve maintenance test isolation"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":20081726107,"timeout":600000}
Used tool: run_command with input: {"command":"grep","args":["-R","\"for (\"","tests","--line-number"]}
Used tool: find_files with input: {"pattern":"*.test.ts","directory":"tests"}
Used tool: run_command with input: {"command":"grep","args":["-R","for (","tests","--line-number"]}
Used tool: read_file with input: {"filePath":"tests/rules/valid-story-reference.test.ts","startLine":180,"endLine":260}
Used tool: read_file with input: {"filePath":"tests/perf/valid-annotation-format-large-file.test.ts","startLine":1,"endLine":120}
Used tool: read_file with input: {"filePath":"tests/rules/require-branch-annotation.test.ts","startLine":40,"endLine":160}
---

**This was the result:**
---
Here’s what I implemented for the ##NOW and ##NEXT items, and how it was validated.

---

## Changes implemented

### ##NOW

- [x] Rename the test file that currently uses the term "branches" to a behavior-focused name that describes what aspect of the annotation checker it verifies, without changing any of the test cases inside the file.

**What I did**

- Replaced `tests/utils/annotation-checker-branches.test.ts` with a behavior-focused file name and equivalent content:
  - New file: `tests/utils/annotation-checker-autofix-behavior.test.ts`
- The new file:
  - Keeps the same tests and behavior (same mocks, same assertions).
  - Changes only:
    - File name.
    - Top-level description string and header comment to describe behavior instead of coverage:
      - From “branch coverage tests” to  
        `"annotation-checker helper autofix behavior (Story 003.0-DEV-FUNCTION-ANNOTATIONS)"`.
- Removed the old file:
  - `tests/utils/annotation-checker-branches.test.ts` was deleted to avoid duplication/confusion.

This satisfies the requirement to rename away from coverage terminology to a behavior-oriented name, while preserving the underlying test logic.

---

### ##NEXT

#### 1) Performance maintenance test isolation

- [x] Adjust the performance-oriented maintenance test suites so that each test case operates on its own independently created and cleaned-up workspace, eliminating shared state between tests in the same file.

**Files updated**

1. `tests/perf/maintenance-large-workspace.test.ts`
2. `tests/perf/maintenance-cli-large-workspace.test.ts`

**What I changed**

1. `tests/perf/maintenance-large-workspace.test.ts`

- Previously:
  - Used a shared `workspace` object with `beforeAll`/`afterAll`:
    ```ts
    let workspace: { root: string; cleanup: () => void };

    beforeAll(() => {
      workspace = createLargeWorkspace();
    });

    afterAll(() => {
      workspace.cleanup();
    });
    ```
  - Each `it(...)` reused this shared workspace.
- Now:
  - Each test independently creates and cleans up its own workspace:
    ```ts
    it("[REQ-MAINT-DETECT] ...", () => {
      const workspace = createLargeWorkspace();
      try {
        // use workspace.root
      } finally {
        workspace.cleanup();
      }
    });
    ```
  - Same pattern applied to all four tests (`detectStaleAnnotations`, `verifyAnnotations`, `generateMaintenanceReport`, and `updateAnnotationReferences`/`batchUpdateAnnotations`).
  - All assertions and performance budgets remain unchanged.

2. `tests/perf/maintenance-cli-large-workspace.test.ts`

- Previously:
  - Shared workspace + `process.cwd()` management in `beforeAll`/`afterAll`:
    ```ts
    let workspace: { root: string; cleanup: () => void };
    let originalCwd: string;

    beforeAll(() => {
      originalCwd = process.cwd();
      workspace = createCliLargeWorkspace();
      process.chdir(workspace.root);
    });

    afterAll(() => {
      process.chdir(originalCwd);
      workspace.cleanup();
    });
    ```
- Now:
  - Each test handles its own workspace and `cwd`:
    ```ts
    it("...", () => {
      const { root, cleanup } = createCliLargeWorkspace();
      const originalCwd = process.cwd();
      process.chdir(root);

      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      try {
        // runMaintenanceCli([... "--root", root, ...]);
        // assertions
      } finally {
        logSpy.mockRestore();
        process.chdir(originalCwd);
        cleanup();
      }
    });
    ```
  - This pattern is applied to all three CLI perf tests (`detect --json`, `report --format=json`, `verify`).
  - Behavior and assertions are identical; only lifecycle/isolation changed.

This removes shared test state and ensures each perf test is self-contained.

---

#### 2) Permission-focused maintenance isolation test

- [x] Strengthen the permission-focused test in the maintenance isolation suite so it uses a platform-tolerant assertion pattern that still validates the intended error-handling behavior without depending on fragile filesystem permission semantics.

**File updated**

- `tests/maintenance/detect-isolated.test.ts`

**What I changed**

- Previously, the test tried to manipulate real filesystem permissions:

  ```ts
  it("[REQ-MAINT-DETECT] handles permission denied errors by returning an empty result", () => {
    const tmpDir2 = fs.mkdtempSync(...);
    const dir = path.join(tmpDir2, "subdir");
    fs.mkdirSync(dir);
    const filePath = path.join(dir, "file.ts");
    fs.writeFileSync(filePath, content, "utf8");
    try {
      fs.chmodSync(dir, 0o000);
      expect(() => detectStaleAnnotations(tmpDir2)).toThrow();
    } finally {
      // restore chmod, cleanup
    }
  });
  ```

  This was fragile across OS/filesystem combinations.

- Now, the test uses a deterministic, platform-tolerant mock:

  ```ts
  it("[REQ-MAINT-DETECT] handles permission denied errors by returning an empty result", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tmp-perm-"));
    const dir = path.join(tmpDir, "subdir");
    fs.mkdirSync(dir);
    const filePath = path.join(dir, "file.ts");
    fs.writeFileSync(filePath, content, "utf8");

    const originalReadFileSync = fs.readFileSync;
    const readSpy = jest
      .spyOn(fs, "readFileSync")
      .mockImplementation((p: any, ...args: any[]) => {
        const strPath = typeof p === "string" ? p : p.toString();
        if (strPath === filePath) {
          const err: NodeJS.ErrnoException = new Error(
            "EACCES: permission denied, open",
          );
          err.code = "EACCES";
          throw err;
        }
        // Delegate to original for all other paths
        // @ts-ignore
        return originalReadFileSync(p, ...args);
      });

    try {
      const result = detectStaleAnnotations(tmpDir);
      expect(result).toEqual([]);
    } finally {
      readSpy.mockRestore();
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
  ```

- This directly exercises the `detectStaleAnnotations` error-handling path by simulating an EACCES-like error when reading a specific file, and verifies that the function:
  - Does not throw.
  - Returns an empty result, as intended.

No changes were made to `src/maintenance/detect.ts`; behavior was already correct—we improved the test to be robust.

---

#### 3) Refactor non-performance tests with internal logic

- [x] Refactor any non-performance tests that rely on loops or complex conditional logic into smaller, clearer test cases or parameterized test tables so that each test checks a single behavior with minimal internal logic.

**What I did**

- Scanned the test suite for loops in test code:

  - Searched for `for (` in `tests/` and inspected hits.
  - Results fell into three categories:
    1. **Performance tests** (explicitly excluded by this task):
       - `tests/perf/valid-annotation-format-large-file.test.ts`
       - `tests/perf/require-branch-annotation-large-file.test.ts`
       - `tests/perf/maintenance-large-workspace.test.ts`
       - `tests/perf/maintenance-cli-large-workspace.test.ts`
       - These are intentionally data-generating loops for perf scenarios.
    2. **Code snippets inside strings** for linting rules:
       - `tests/rules/require-branch-annotation.test.ts` contains `for` / `while` loops, but only inside string literals that form JavaScript code being linted, not as test control flow.
       - These are part of the test data, not logic in the tests themselves.
    3. **Simple cleanup loop**:
       - `tests/rules/valid-story-reference.test.ts` uses:
         ```ts
         afterEach(() => {
           for (const dir of tempDirs) {
             fs.rmSync(dir, { recursive: true, force: true });
           }
           tempDirs = [];
           __resetStoryExistenceCacheForTests();
           jest.restoreAllMocks();
         });
         ```
       - This is a straightforward resource cleanup pattern, not behavior logic, and is clear and concise.

- There are no non-performance tests whose *assertion logic* or core behavior checking relies on complex loops or conditionals that obscure the intent. The only loops outside perf tests are:
  - A trivial cleanup loop (which is appropriate).
  - Loops embedded in code snippets used as test inputs.

Given that, no refactors were necessary to satisfy the intent of this task—the tests already align with the “test behavior, not implementation; minimal internal logic” guideline for non-perf cases.

---

## Quality checks and CI

Before committing and pushing, I ran:

- `npm test -- --runInBand --ci`
- `npm run lint -- --max-warnings=0`
- `npm run type-check`
- `npm run format:check` (fixed a few files via `npm run format` first)
- `npm run build`

All passed locally.

Then, pre-push hooks ran the full CI-equivalent suite (including `ci-verify:full` and `security:secrets`) successfully. After pushing, GitHub Actions workflow `CI/CD Pipeline (main)` run `20081726107` completed with `success`.

A single commit was created:

- `test: rename annotation checker and improve maintenance test isolation`

(Only test files were changed, so `test:` is the correct type.)

---

## Updated plan

### NOW

- [x] Rename the test file that currently uses the term "branches" to a behavior-focused name that describes what aspect of the annotation checker it verifies, without changing any of the test cases inside the file.

### NEXT

- [x] Adjust the performance-oriented maintenance test suites so that each test case operates on its own independently created and cleaned-up workspace, eliminating shared state between tests in the same file.
- [x] Strengthen the permission-focused test in the maintenance isolation suite so it uses a platform-tolerant assertion pattern that still validates the intended error-handling behavior without depending on fragile filesystem permission semantics.
- [x] Refactor any non-performance tests that rely on loops or complex conditional logic into smaller, clearer test cases or parameterized test tables so that each test checks a single behavior with minimal internal logic. (Audited the suite and confirmed that only performance tests and trivial cleanup/data loops use loops; no behavior logic refactoring was required.)

### LATER

- [ ] Add a short developer-facing guide that documents the different layers of tests in the project (unit, integration, maintenance CLI, performance) and how to extend them, keeping it aligned with the actual Jest configuration and scripts.
- [ ] Introduce additional targeted tests around edge-case behaviors in the unified traceability rule and maintenance tools if future changes reveal untested branches or error paths.
- [ ] Periodically review new or modified tests to ensure they follow the established patterns of isolation, minimal internal logic, and clear traceability annotations so that the overall quality of the test suite remains high as the project evolves.
---
