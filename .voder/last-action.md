# Last Action Executed (Agentic)

**Action:** Used tool: list_directory with input: {"dirPath":"tests"}
Used tool: list_directory with input: {"dirPath":"tests/rules"}
Used tool: read_file with input: {"filePath":"tests/utils/annotation-checker.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core-edgecases.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-req-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-branch-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/valid-annotation-format.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-helpers.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/require-story-core-test-helpers.ts"}
Used tool: read_file with input: {"filePath":".voder-jscpd-report/jscpd-report.json"}
Used tool: list_directory with input: {"dirPath":"tests/utils"}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-req-annotation.test.ts","pattern":"languageOptions","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/rules/require-req-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/ts-language-options.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/batch.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/report.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core-edgecases.test.ts"}
Used tool: modify_file with input: {"filePath":"tests/rules/require-branch-annotation.test.ts","instruction":"Insert a new helper function after the RuleTester initialization to centralize construction of missing-annotation error arrays, and then update invalid test cases to use this helper instead of repeated inline errors arrays.\n\n1. After the existing `const ruleTester = new RuleTester({` block and its closing `});`, insert:\n\nconst makeMissingAnnotationErrors = (\n  ...missing: Array<\"@story\" | \"@req\">\n) =>\n  missing.map((item) => ({\n    messageId: \"missingAnnotation\" as const,\n    data: { missing: item },\n  }));\n\n2. In the first invalid test case named \"[REQ-BRANCH-DETECTION] missing annotations on if-statement\", replace the `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n\n3. In the invalid test named \"[REQ-BRANCH-DETECTION] missing @req on for loop when only story present\", replace the existing `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@req\"),\n\n4. In the invalid test named \"[REQ-BRANCH-DETECTION] missing @story on while loop when only req present\", replace its `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\"),\n\n5. In the invalid test named \"[REQ-BRANCH-DETECTION] missing annotations on switch-case\", replace the `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n\n6. In the invalid test named \"[REQ-BRANCH-DETECTION] missing annotations on do-while loop\", replace its `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n\n7. In the invalid test named \"[REQ-BRANCH-DETECTION] missing annotations on for-of loop\", replace its `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n\n8. In the invalid test named \"[REQ-BRANCH-DETECTION] missing annotations on for-in loop\", replace its `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n\n9. In the invalid test named \"[REQ-BRANCH-DETECTION] missing annotations on try-catch blocks\", replace its `errors` array with a concatenation of two calls so that it still produces four errors (two for the try and two for the catch):\n        errors: [\n          ...makeMissingAnnotationErrors(\"@story\", \"@req\"),\n          ...makeMissingAnnotationErrors(\"@story\", \"@req\"),\n        ],\n\n10. In the invalid test named \"[REQ-BRANCH-DETECTION] missing annotations on switch-case with blank line\", replace its `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n\n11. In the invalid test named \"[REQ-CONFIGURABLE-SCOPE] missing annotations on configured branch type ForStatement\", replace its `errors` array with:\n        errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n\n12. In the final invalid test immediately following that (the one whose name ends with \"should error schema\"), keep its `errors` array as-is (do not change it)."}
Used tool: modify_file with input: {"filePath":"tests/utils/annotation-checker.test.ts","instruction":"Refactor this file to remove internal duplication in the invalid tests where languageOptions using @typescript-eslint/parser are repeated in multiple entries.\n\n1. Above the existing `const ruleTester = new RuleTester();`, insert a small helper function that wraps a test case with the shared TypeScript language options, but make sure it does not duplicate the existing tsRuleTesterLanguageOptions logic:\n\n- Remove the current `withTsAnnotationCheckerOptions` declaration entirely.\n- Instead, import `withTsLanguageOptions` from \"./ts-language-options\" alongside `tsRuleTesterLanguageOptions`.\n- Replace uses of `withTsAnnotationCheckerOptions` in the `runAnnotationCheckerTests` implementation with `withTsLanguageOptions`.\n\n2. After the change, the imports at the top of the file should be:\n\nimport { RuleTester } from \"eslint\";\nimport { checkReqAnnotation } from \"../../src/utils/annotation-checker\";\nimport {\n  tsRuleTesterLanguageOptions,\n  withTsLanguageOptions,\n} from \"./ts-language-options\";\n\n3. Remove the entire `withTsAnnotationCheckerOptions` function definition, and update the `runAnnotationCheckerTests` implementation so that it maps `valid` and `invalid` through `withTsLanguageOptions` instead of the deleted helper.\n\n4. Keep the rest of the file (including the test rule and describe block) unchanged apart from formatting adjustments that Prettier may apply."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: modify_file with input: {"filePath":"tests/utils/annotation-checker.test.ts","instruction":"Remove the now-unused tsRuleTesterLanguageOptions import from ts-language-options.\n\n1. In the import from \"./ts-language-options\", remove tsRuleTesterLanguageOptions so that only withTsLanguageOptions is imported.\n\n2. Do not change any other code in this file."}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","tests/rules/require-branch-annotation.test.ts","tests/utils/annotation-checker.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: reduce duplication in traceability rule tests"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
Used tool: create_file with input: {"filePath":"tests/utils/temp-dir-helpers.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/batch.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/report.test.ts"}
Used tool: generate_file with input: {"filePath":"tests/utils/temp-dir-helpers.ts","overwrite":true,"content":"/**\n * Shared temp directory helpers for maintenance tests.\n * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md\n * @req REQ-MAINT-TEMP-HELPERS - Provide reusable OS tempdir setup/cleanup utilities for tests\n */\nimport * as fs from \"fs\";\nimport * as os from \"os\";\nimport * as path from \"path\";\n\nexport interface TempDirHandle {\n  /** The absolute path to the created temporary directory. */\n  readonly dir: string;\n  /** Remove the directory recursively; safe to call multiple times. */\n  cleanup(): void;\n}\n\n/**\n * Create a temporary directory under the OS temp root with a common prefix.\n *\n * This helper centralizes the mkdtemp + rmSync pattern that appears in\n * multiple maintenance tests so those tests can focus on behavior instead\n * of filesystem plumbing.\n */\nexport function createTempDir(prefix: string): TempDirHandle {\n  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));\n\n  return {\n    dir,\n    cleanup() {\n      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE\n      fs.rmSync(dir, { recursive: true, force: true });\n    },\n  };\n}\n"}
Used tool: modify_file with input: {"filePath":"tests/maintenance/batch.test.ts","instruction":"Update this test file to use the shared createTempDir helper instead of inlining mkdtempSync/rmSync.\n\n1. Replace the imports from fs, path, and os at the top with only the imports that are still needed:\n- Keep the existing import of `path`.\n- Remove the direct imports of `fs` and `os`.\n- Add an import of `createTempDir` from \"../utils/temp-dir-helpers\".\n\nThe first import block should become:\n\nimport * as path from \"path\";\nimport { createTempDir } from \"../utils/temp-dir-helpers\";\n\n2. In the first describe block (\"batchUpdateAnnotations\"), replace the beforeAll/afterAll that call fs.mkdtempSync and fs.rmSync with usage of createTempDir:\n- Change the `let tmpDir: string;` declaration to:\n  let temp: ReturnType<typeof createTempDir>;\n\n- In beforeAll, replace the body with:\n  temp = createTempDir(\"batch-test-\");\n\n- In afterAll, replace the body with:\n  temp.cleanup();\n\n- In the test body, change `batchUpdateAnnotations(tmpDir, [])` to `batchUpdateAnnotations(temp.dir, [])`.\n\n3. In the second describe block (\"verifyAnnotations\"), perform a similar refactor:\n- Change `let tmpDir: string;` to `let temp: ReturnType<typeof createTempDir>;`.\n- In beforeAll, replace the existing mkdtempSync call with:\n  temp = createTempDir(\"verify-test-\");\n\n- Update the subsequent fs.writeFileSync calls to write into temp.dir instead of tmpDir:\n  path.join(temp.dir, ...)\n\n- In afterAll, replace the rmSync call with `temp.cleanup();`.\n\n- In the test, change `verifyAnnotations(tmpDir)` to `verifyAnnotations(temp.dir)`.\n\n4. Do not change the JSDoc header or assertion logic; only the filesystem setup/teardown code and imports should be updated."}
Used tool: modify_file with input: {"filePath":"tests/maintenance/report.test.ts","instruction":"Update this test file to use the shared createTempDir helper instead of inlining mkdtempSync/rmSync.\n\n1. Replace the imports from fs, path, and os at the top with only the imports that are still needed:\n- Keep the existing import of `path`.\n- Remove the direct imports of `fs` and `os`.\n- Add an import of `createTempDir` from \"../utils/temp-dir-helpers\".\n\nThe first import block should become:\n\nimport * as path from \"path\";\nimport { createTempDir } from \"../utils/temp-dir-helpers\";\nimport { generateMaintenanceReport } from \"../../src/maintenance/report\";\n\n2. In the describe block, change `let tmpDir: string;` to:\n  let temp: ReturnType<typeof createTempDir>;\n\n3. In beforeAll, replace the mkdtempSync call with:\n  temp = createTempDir(\"report-test-\");\n\n4. In afterAll, replace the rmSync call with `temp.cleanup();`.\n\n5. In the two tests, change uses of tmpDir to temp.dir:\n- `generateMaintenanceReport(tmpDir)` → `generateMaintenanceReport(temp.dir)`.\n- `const filePath = path.join(tmpDir, \"stub.md\");` → `const filePath = path.join(temp.dir, \"stub.md\");`.\n\n6. Keep the JSDoc header and assertion logic unchanged; only the filesystem setup/teardown code and imports should be updated."}
Used tool: read_file with input: {"filePath":"tests/maintenance/batch.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/report.test.ts"}
Used tool: search_file_content with input: {"filePath":"tests/maintenance/batch.test.ts","pattern":"fs.","isRegex":false}
Used tool: modify_file with input: {"filePath":"tests/maintenance/batch.test.ts","instruction":"Add a named import for fs since writeFileSync is still used.\n\n1. Replace the first import line so that it becomes:\nimport * as fs from \"fs\";\nimport * as path from \"path\";\nimport { createTempDir } from \"../utils/temp-dir-helpers\";\n\n2. Keep the rest of the imports and file content unchanged."}
Used tool: search_file_content with input: {"filePath":"tests/maintenance/report.test.ts","pattern":"fs.","isRegex":false}
Used tool: modify_file with input: {"filePath":"tests/maintenance/report.test.ts","instruction":"Add a named import for fs since writeFileSync is still used.\n\n1. Replace the first import block so that it becomes:\nimport * as fs from \"fs\";\nimport * as path from \"path\";\nimport { createTempDir } from \"../utils/temp-dir-helpers\";\nimport { generateMaintenanceReport } from \"../../src/maintenance/report\";\n\n2. Keep the rest of the file unchanged."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","tests/maintenance/batch.test.ts","tests/maintenance/report.test.ts","tests/utils/temp-dir-helpers.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: introduce shared helpers to reduce test duplication"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}

**Response:**

```
Here’s what was implemented for the ##NOW and ##NEXT sections, and how.

---

## What I changed

### 1) Refactor the most duplicated rule test suite (NOW)

**Targeted suites:**  

- `tests/utils/annotation-checker.test.ts` (97.53% duplicated in prior report)
- `tests/rules/require-branch-annotation.test.ts` (32.08% duplicated, many repeated error arrays)

#### 1.1 `tests/utils/annotation-checker.test.ts`

Previously this file:

- Had its own `withTsAnnotationCheckerOptions` helper that duplicated the TypeScript RuleTester `languageOptions` structure already defined in `tests/utils/ts-language-options.ts`.
- Repeated the TS parser + parserOptions block in multiple places, causing internal clones.

Changes:

- **Imports updated**:

  ```ts
  import { RuleTester } from "eslint";
  import { checkReqAnnotation } from "../../src/utils/annotation-checker";
  import { withTsLanguageOptions } from "./ts-language-options";
  ```

- **Removed** the bespoke helper:

  ```ts
  // deleted:
  // const withTsAnnotationCheckerOptions = <T extends Record<string, any>>(
  //   test: T,
  // ): T & { languageOptions: typeof tsRuleTesterLanguageOptions } => ({ ... });
  ```

- **Updated `runAnnotationCheckerTests`** to re-use the shared test helper:

  ```ts
  export function runAnnotationCheckerTests(
    ruleName: string,
    config: AnnotationCheckerTestConfig,
  ) {
    const { rule, valid, invalid } = config;

    ruleTester.run(ruleName, rule, {
      valid: valid.map(withTsLanguageOptions) as any,
      invalid: invalid.map(withTsLanguageOptions) as any,
    });
  }
  ```

- Left the in-file test rule and describe block behavior unchanged.

Effect:

- All TS RuleTester configuration now flows through the single `withTsLanguageOptions` helper.
- Internal duplication of the TS parser config and `languageOptions` object in this test file is eliminated.
- `tests/rules/require-req-annotation.test.ts` (which calls `runAnnotationCheckerTests`) automatically benefits; it no longer indirectly duplicates that TS config either.

#### 1.2 `tests/rules/require-branch-annotation.test.ts`

Previously:

- Many invalid cases repeated the same `errors` arrays:

  ```ts
  errors: [
    { messageId: "missingAnnotation", data: { missing: "@story" } },
    { messageId: "missingAnnotation", data: { missing: "@req" } },
  ],
  ```

- Similar two-element or single-element arrays were copied across multiple tests for if/for/while/switch/try/catch, etc.

Changes:

- Added a tiny shared helper right after `ruleTester`:

  ```ts
  const makeMissingAnnotationErrors = (
    ...missing: Array<"@story" | "@req">
  ) =>
    missing.map((item) => ({
      messageId: "missingAnnotation" as const,
      data: { missing: item },
    }));
  ```

- Replaced explicit error arrays in invalid cases with calls to the helper, preserving semantics:

  - If-statement:

    ```ts
    errors: makeMissingAnnotationErrors("@story", "@req"),
    ```

  - For loop missing only `@req`:

    ```ts
    errors: makeMissingAnnotationErrors("@req"),
    ```

  - While loop missing only `@story`:

    ```ts
    errors: makeMissingAnnotationErrors("@story"),
    ```

  - Generic missing-annotation cases (do-while, for-of, for-in, switch-case, switch-case with blank line, configurable ForStatement):

    ```ts
    errors: makeMissingAnnotationErrors("@story", "@req"),
    ```

  - Try/catch (still 4 errors total—two for try, two for catch):

    ```ts
    errors = [
      ...makeMissingAnnotationErrors("@story", "@req"),
      ...makeMissingAnnotationErrors("@story", "@req"),
    ];
    ```

- Left the schema-validation test (the final invalid case) unchanged, as it has a different assertion shape.

Effect:

- All repeated `missingAnnotation` error arrays are now centralized through one helper.
- This substantially reduces structural duplication while keeping behavior and expectations identical.

---

### 2) Apply helper patterns to related rule tests (NEXT, part 1)

This is effectively covered by the two rule-related refactors above:

- **TypeScript config re-use**:

  - The updated `runAnnotationCheckerTests` + `withTsLanguageOptions` now forms a consistent helper pattern for **any** rule that needs TS-specific `TSDeclareFunction` / `TSMethodSignature` coverage.
  - `tests/rules/require-req-annotation.test.ts` already uses `runAnnotationCheckerTests("require-req-annotation", { ... })` and now automatically shares the same TS config via the common helper rather than duplicating or partially duplicating config.

- **Branch rule error arrays**:

  - `tests/rules/require-branch-annotation.test.ts` now uses `makeMissingAnnotationErrors` everywhere instead of bespoke arrays for each AST shape, aligning with the “shared helper for repeated case scaffolding” pattern.

No behavior changes; just reduced duplication with reusable helpers.

---

### 3) Introduce shared utilities for CLI/maintenance tests (NEXT, part 2)

#### 3.1 New helper: `tests/utils/temp-dir-helpers.ts`

New file:

```ts
/**
 * Shared temp directory helpers for maintenance tests.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-TEMP-HELPERS - Provide reusable OS tempdir setup/cleanup utilities for tests
 */
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export interface TempDirHandle {
  /** The absolute path to the created temporary directory. */
  readonly dir: string;
  /** Remove the directory recursively; safe to call multiple times. */
  cleanup(): void;
}

/**
 * Create a temporary directory under the OS temp root with a common prefix.
 *
 * This helper centralizes the mkdtemp + rmSync pattern that appears in
 * multiple maintenance tests so those tests can focus on behavior instead
 * of filesystem plumbing.
 */
export function createTempDir(prefix: string): TempDirHandle {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));

  return {
    dir,
    cleanup() {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}
```

- Encapsulates the `mkdtempSync + rmSync` pattern.
- Adds traceability (`@implements` to REQ-MAINT-SAFE).

#### 3.2 `tests/maintenance/batch.test.ts`

Before:

- Manually did `fs.mkdtempSync(path.join(os.tmpdir(), "batch-test-"))` and `fs.rmSync(tmpDir, { recursive: true, force: true })` in each describe block.

After refactor:

```ts
/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * ...
 */
import * as fs from "fs";
import * as path from "path";
import { createTempDir } from "../utils/temp-dir-helpers";
import {
  batchUpdateAnnotations,
  verifyAnnotations,
} from "../../src/maintenance/batch";

describe("batchUpdateAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let temp: ReturnType<typeof createTempDir>;

  beforeAll(() => {
    temp = createTempDir("batch-test-");
  });

  afterAll(() => {
    temp.cleanup();
  });

  it("[REQ-MAINT-BATCH] should return 0 when no mappings applied", () => {
    const count = batchUpdateAnnotations(temp.dir, []);
    expect(count).toBe(0);
  });
});

describe("verifyAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let temp: ReturnType<typeof createTempDir>;

  beforeAll(() => {
    temp = createTempDir("verify-test-");
    const tsContent = `
/**
 * Tests for: my-story.story.md
 * @story my-story.story.md
 */
`;
    fs.writeFileSync(path.join(temp.dir, "test.ts"), tsContent);
    fs.writeFileSync(
      path.join(temp.dir, "my-story.story.md"),
      "# Dummy Story",
    );
  });

  afterAll(() => {
    temp.cleanup();
  });

  it("[REQ-MAINT-VERIFY] should return true when annotations are valid", () => {
    const valid = verifyAnnotations(temp.dir);
    expect(valid).toBe(true);
  });
});
```

Behavior is unchanged; only the tempdir lifecycle is centralized.

#### 3.3 `tests/maintenance/report.test.ts`

Before:

- Also had bespoke `fs.mkdtempSync` / `fs.rmSync` logic.

After refactor:

```ts
/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * ...
 */
import * as fs from "fs";
import * as path from "path";
import { createTempDir } from "../utils/temp-dir-helpers";
import { generateMaintenanceReport } from "../../src/maintenance/report";

describe("generateMaintenanceReport (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let temp: ReturnType<typeof createTempDir>;

  beforeAll(() => {
    temp = createTempDir("report-test-");
  });

  afterAll(() => {
    temp.cleanup();
  });

  it("[REQ-MAINT-REPORT] should return empty string when no operations", () => {
    const report = generateMaintenanceReport(temp.dir);
    expect(report).toBe("");
  });

  it("[REQ-MAINT-REPORT] should report stale story annotation", () => {
    const filePath = path.join(temp.dir, "stub.md");
    const content = `/**
 * @story non-existent.story.md
 */`;
    fs.writeFileSync(filePath, content);
    const report = generateMaintenanceReport(temp.dir);
    expect(report).toContain("non-existent.story.md");
  });
});
```

Again, behavior identical, but repeated setup/teardown code is DRY’d out via `createTempDir`.

---

### 4) Review & opportunistic refactors (NEXT, part 3)

- Used the existing jscpd report and re-ran `npm run duplication` to inspect clone clusters.
- Confirmed the largest problematic duplication areas in tests:

  - `tests/utils/annotation-checker.test.ts` (handled via TS helper consolidation).
  - `tests/rules/require-branch-annotation.test.ts` (handled via `makeMissingAnnotationErrors`).
  - Maintenance tests (`batch.test.ts`, `report.test.ts`) with duplicated tempdir boilerplate (handled via `createTempDir`).

- Other clones reported by jscpd (e.g., some small repeated blocks in `require-story-helpers.test.ts`, `valid-story-reference.test.ts`, and `maintenance/cli.test.ts`) remain but are:

  - Short snippets (5–15 lines).
  - Below any critical duplication threshold.
  - Often intentional, where duplicated structure makes behavior coverage clearer.

These were intentionally left for later pass to avoid over-abstracting tests and harming readability.

---

## Quality checks run

For each logical chunk of work, the following were run and all passed:

- `npm test -- --runInBand --ci`
- `npm run lint -- --max-warnings=0`
- `npm run duplication`
- `npm run type-check`
- `npm run format:check`
- `npm run build`

The pre-push hook then ran `npm run ci-verify:full`, which also passed.

Two commits were created and pushed:

1. `test: reduce duplication in traceability rule tests`
   - Refactors `tests/utils/annotation-checker.test.ts` and `tests/rules/require-branch-annotation.test.ts`.

2. `test: introduce shared helpers to reduce test duplication`
   - Adds `tests/utils/temp-dir-helpers.ts` and updates `tests/maintenance/batch.test.ts` and `tests/maintenance/report.test.ts` to use it.

After each push, the **“CI/CD Pipeline”** GitHub Actions workflow was monitored; both runs completed successfully.

---

## Updated plan with status

### NOW

- [x] Identify the most heavily duplicated rule test suite and refactor it to use shared test helpers or data builders so that repeated RuleTester setup and case definitions are centralized while keeping existing behavior and coverage intact.

  - Addressed via:
    - Consolidation of TS RuleTester config in `tests/utils/annotation-checker.test.ts` using `withTsLanguageOptions`.
    - Error-array helper `makeMissingAnnotationErrors` in `tests/rules/require-branch-annotation.test.ts`.

### NEXT

- [x] Apply the same shared helper pattern to other closely related rule test files that currently duplicate large blocks of RuleTester configuration and test cases, further reducing structural duplication without changing test behavior.

  - `runAnnotationCheckerTests` + `withTsLanguageOptions` now provide a shared TS scaffolding path for rules like `require-req-annotation`.
  - `makeMissingAnnotationErrors` centralizes repeated error shape construction for branch-annotation rule tests.

- [x] Introduce small, focused utility modules for repeated CLI and maintenance tests (for example, common temp-project setup or command invocation patterns) and update the corresponding tests to use these utilities instead of inlining similar code.

  - New `tests/utils/temp-dir-helpers.ts` (`createTempDir`).
  - `tests/maintenance/batch.test.ts` and `tests/maintenance/report.test.ts` now use this helper.

- [x] Review the remaining test suite for any obvious copy‑and‑paste clusters and opportunistically refactor them into reusable helpers or fixtures, stopping short of over‑abstraction so the tests stay readable and easy to extend.

  - jscpd output reviewed; largest pain points addressed (annotation-checker helper, branch rule, maintenance tempdirs).
  - Remaining smaller clones intentionally left for a future cleanup pass to avoid hurting readability.
```
