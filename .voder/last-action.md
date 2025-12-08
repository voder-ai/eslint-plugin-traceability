# Last Action Executed (Agentic)

**Action:** Used tool: list_directory with input: {"dirPath":"src"}
Used tool: list_directory with input: {"dirPath":"tests"}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts","startLine":1,"endLine":260}
Used tool: search_file_content with input: {"filePath":"tests","pattern":"checkReqAnnotation","isRegex":false}
Used tool: find_files with input: {"pattern":"*.test.ts","directory":"tests"}
Used tool: search_file_content with input: {"filePath":"src/rules","pattern":"checkReqAnnotation","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/rules","pattern":"checkReqAnnotation","isRegex":false}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src/rules"}
Used tool: search_file_content with input: {"filePath":"src/rules/require-req-annotation.ts","pattern":"checkReqAnnotation","isRegex":false}
Used tool: read_file with input: {"filePath":"src/rules/require-req-annotation.ts","startLine":70,"endLine":140}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts"}
Used tool: find_files with input: {"pattern":"*req-annotation*.test.ts","directory":"tests"}
Used tool: read_file with input: {"filePath":"tests/rules/require-req-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/req-annotation-detection.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/annotation-checker.test.ts"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--coverage","--passWithNoTests=false","--collectCoverageFrom=src/utils/annotation-checker.ts","--coverageReporters=text","--testLocationInResults=false"]}
Used tool: modify_file with input: {"filePath":"tests/utils/annotation-checker.test.ts","instruction":"In the invalid test cases array, after the existing case named \"[REQ-TYPESCRIPT-SUPPORT] missing @req on TSMethodSignature\", append two new invalid test objects that exercise the branches where enableFix is false and where the fixer attaches to an ExpressionStatement. The first should configure options: [{ enableFix: false }] and assert that the error has no output change (output: null) for a TSDeclareFunction without @req. The second should provide code where a TSDeclareFunction is wrapped in an expression statement (e.g., exported via `export default declare function foo(): void;` if syntactically valid, or a function used in an IIFE) and assert that the autofix inserts the JSDoc before the expression statement. Follow existing test naming conventions and keep REQ-TYPESCRIPT-SUPPORT tagging. If the exact TS syntax for such a wrapper is awkward, instead use a class with a TSMethodSignature where the underlying node's parent is an ExpressionStatement via TypeScript's AST; focus on triggering getFixTargetNode's ExpressionStatement branch. Preserve formatting and style."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--coverage","--passWithNoTests=false","--collectCoverageFrom=src/utils/annotation-checker.ts","--coverageReporters=text","--testLocationInResults=false"]}
Used tool: search_file_content with input: {"filePath":"tests","pattern":"jest.mock(\"../../src/utils/annotation-checker","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/rules/require-req-annotation.test.ts","startLine":1,"endLine":260}
Used tool: modify_file with input: {"filePath":"tests/utils/annotation-checker.test.ts","instruction":"In the local `rule` definition's meta.schema array, change it from `schema: [],` to `schema: [{ type: \"object\", additionalProperties: false }],` so that the test rule accepts a single options object. Then, in the `create` function, destructure `const [{ enableFix = true } = {}] = context.options as any || [];` and pass this down to checkReqAnnotation calls, i.e., `checkReqAnnotation(context, node, { enableFix });` for both TSDeclareFunction and TSMethodSignature. Finally, update the new invalid tests you previously added so that their `options` property is `options: [[{ enableFix: false }]],` matching the updated schema."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--coverage","--passWithNoTests=false","--collectCoverageFrom=src/utils/annotation-checker.ts","--coverageReporters=text","--testLocationInResults=false"]}
Used tool: search_file_content with input: {"filePath":"src/rules/require-req-annotation.ts","pattern":"checkReqAnnotation","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/utils/annotation-checker.test.ts","pattern":"TSDeclareFunction wrapped in ExpressionStatement","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/utils/annotation-checker.test.ts","startLine":80,"endLine":140}
Used tool: modify_file with input: {"filePath":"tests/utils/annotation-checker.test.ts","instruction":"In the invalid cases for the local `annotation-checker` rule, remove the entire test object named \"[REQ-TYPESCRIPT-SUPPORT] missing @req on TSDeclareFunction with enableFix=false\" to avoid schema/options conflicts for this helper rule. Also remove the entire test object named \"[REQ-TYPESCRIPT-SUPPORT] missing @req on TSDeclareFunction wrapped in ExpressionStatement\" since the underlying TypeScript AST does not produce an ExpressionStatement parent for TSDeclareFunction. Do not change any other tests."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--coverage","--passWithNoTests=false","--collectCoverageFrom=src/utils/annotation-checker.ts","--coverageReporters=text","--testLocationInResults=false"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--passWithNoTests=false"]}
Used tool: run_command with input: {"command":"npx","args":["jest","--ci","--runInBand","--coverage","--passWithNoTests=false","--collectCoverageFrom=src/utils/annotation-checker.ts","--coverageReporters=json-summary","--testLocationInResults=false"]}
Used tool: read_file with input: {"filePath":"jest.config.js","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts","startLine":40,"endLine":120}
Used tool: modify_file with input: {"filePath":"tests/utils/annotation-checker.test.ts","instruction":"In the local `rule`'s `meta` object, change `schema: [{ type: \"object\", additionalProperties: false }],` back to `schema: [],` because this helper rule is only used to drive annotation-checker behavior and does not need options. In the `create` function, remove the options destructuring and simply call `checkReqAnnotation(context, node)` for both TSDeclareFunction and TSMethodSignature, reverting those handlers to not pass an options object. Leave the invalid tests as-is (they no longer use options) and keep the rest of the file unchanged."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--passWithNoTests=false"]}
Used tool: run_command with input: {"command":"git","args":["status","-sb"]}
Used tool: generate_file with input: {"filePath":"tests/utils/annotation-checker-branches.test.ts","content":"/**\n * Focused branch coverage tests for annotation-checker helper.\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-AUTOFIX REQ-ANNOTATION-REPORTING\n */\n\njest.mock(\"../../src/utils/reqAnnotationDetection\", () => ({\n  // Always report that no requirement annotation is present so we exercise\n  // the missing-annotation reporting and autofix paths in the helper.\n  hasReqAnnotation: jest.fn(() => false),\n}));\n\njest.mock(\"../../src/rules/helpers/require-story-utils\", () => ({\n  // Provide a stable, human-readable name so reporting paths are predictable\n  // without depending on the full real implementation.\n  getNodeName: jest.fn(() => \"mockName\"),\n}));\n\nimport { checkReqAnnotation } from \"../../src/utils/annotation-checker\";\n\n/**\n * Build a minimal ESLint rule context stub that captures report() calls.\n *\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REPORTING\n */\nfunction createContextStub() {\n  const report = jest.fn();\n  const sourceCode = {\n    getJSDocComment: jest.fn(() => null),\n    getCommentsBefore: jest.fn(() => []),\n  } as any;\n\n  const context = {\n    getSourceCode() {\n      return sourceCode;\n    },\n    report,\n  } as any;\n\n  return { context, report };\n}\n\ndescribe(\"annotation-checker helper branch coverage (Story 003.0-DEV-FUNCTION-ANNOTATIONS)\", () => {\n  it(\"[REQ-ANNOTATION-AUTOFIX] attaches fix directly to node when parent is missing\", () => {\n    const { context, report } = createContextStub();\n    const node = { type: \"FunctionDeclaration\" } as any; // no parent property\n\n    checkReqAnnotation(context, node, { enableFix: true });\n\n    expect(report).toHaveBeenCalledTimes(1);\n    const reportArg = report.mock.calls[0][0];\n\n    expect(reportArg).toHaveProperty(\"fix\");\n    const fixer = { insertTextBefore: jest.fn() } as any;\n\n    reportArg.fix(fixer);\n\n    expect(fixer.insertTextBefore).toHaveBeenCalledWith(\n      node,\n      \"/** @req <REQ-ID> */\\n\",\n    );\n  });\n\n  it(\"[REQ-ANNOTATION-AUTOFIX] attaches fix to MethodDefinition wrapper when parent is a method\", () => {\n    const { context, report } = createContextStub();\n    const methodParent = { type: \"MethodDefinition\" } as any;\n    const node = {\n      type: \"FunctionExpression\",\n      parent: methodParent,\n      id: { type: \"Identifier\", name: \"methodImpl\" },\n    } as any;\n\n    checkReqAnnotation(context, node, { enableFix: true });\n\n    expect(report).toHaveBeenCalledTimes(1);\n    const reportArg = report.mock.calls[0][0];\n\n    const fixer = { insertTextBefore: jest.fn() } as any;\n    reportArg.fix(fixer);\n\n    expect(fixer.insertTextBefore).toHaveBeenCalledWith(\n      methodParent,\n      \"/** @req <REQ-ID> */\\n\",\n    );\n  });\n\n  it(\"[REQ-ANNOTATION-AUTOFIX] attaches fix to VariableDeclarator when node is its init\", () => {\n    const { context, report } = createContextStub();\n    const declarator: any = { type: \"VariableDeclarator\" };\n    const node: any = { type: \"FunctionExpression\", parent: declarator };\n    declarator.init = node;\n\n    checkReqAnnotation(context, node, { enableFix: true });\n\n    expect(report).toHaveBeenCalledTimes(1);\n    const reportArg = report.mock.calls[0][0];\n\n    const fixer = { insertTextBefore: jest.fn() } as any;\n    reportArg.fix(fixer);\n\n    expect(fixer.insertTextBefore).toHaveBeenCalledWith(\n      declarator,\n      \"/** @req <REQ-ID> */\\n\",\n    );\n  });\n\n  it(\"[REQ-ANNOTATION-AUTOFIX] attaches fix to ExpressionStatement wrapper when parent is an expression\", () => {\n    const { context, report } = createContextStub();\n    const expressionParent = { type: \"ExpressionStatement\" } as any;\n    const node = {\n      type: \"FunctionExpression\",\n      parent: expressionParent,\n      id: { type: \"Identifier\", name: \"iife\" },\n    } as any;\n\n    checkReqAnnotation(context, node, { enableFix: true });\n\n    expect(report).toHaveBeenCalledTimes(1);\n    const reportArg = report.mock.calls[0][0];\n\n    const fixer = { insertTextBefore: jest.fn() } as any;\n    reportArg.fix(fixer);\n\n    expect(fixer.insertTextBefore).toHaveBeenCalledWith(\n      expressionParent,\n      \"/** @req <REQ-ID> */\\n\",\n    );\n  });\n\n  it(\"[REQ-ANNOTATION-AUTOFIX] omits fix when enableFix is false\", () => {\n    const { context, report } = createContextStub();\n    const node = {\n      type: \"FunctionDeclaration\",\n      parent: { type: \"Program\" },\n      id: { type: \"Identifier\", name: \"noFix\" },\n    } as any;\n\n    checkReqAnnotation(context, node, { enableFix: false });\n\n    expect(report).toHaveBeenCalledTimes(1);\n    const reportArg = report.mock.calls[0][0];\n\n    expect(reportArg.fix).toBeUndefined();\n  });\n});\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--passWithNoTests=false","tests/utils/annotation-checker-branches.test.ts"]}
Used tool: run_command with input: {"command":"npx","args":["jest","--ci","--runInBand","--coverage","--passWithNoTests=false","--collectCoverageFrom=src/utils/annotation-checker.ts","--coverageReporters=text","--testLocationInResults=false","tests/utils/annotation-checker.test.ts","tests/utils/annotation-checker-branches.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--passWithNoTests=false"]}
Used tool: read_file with input: {"filePath":"package.json","startLine":1,"endLine":260}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: add focused branch coverage tests for annotation checker helper"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}

**Response:**

```
Here’s what I implemented to execute the **##NOW** and **##NEXT** sections.

---

## What I did

### ✅ NOW: Identify uncovered branches / paths in annotation helper

- Ran a focused coverage run for the annotation helper:

  ```bash
  npm test -- --runInBand --coverage --passWithNoTests=false \
    --collectCoverageFrom=src/utils/annotation-checker.ts \
    --coverageReporters=text \
    --testLocationInResults=false
  ```

- From the coverage report for `src/utils/annotation-checker.ts` before changes:

  - Statements ~95.97%
  - Branches ~80.64%
  - Uncovered lines were in the middle of the file (around the autofix / reporting logic):

    ```text
    annotation-checker.ts | 95.97 | 80.64 | 100 | 95.97 | 54-55,61-62,68-69,76-77
    ```

- Mapping those lines to code in `src/utils/annotation-checker.ts` showed the **uncovered branches** were:

  1. `getFixTargetNode` branches:
     - `if (!parent)` – no-parent path.
     - `if (parent.type === "MethodDefinition")`
     - `if (parent.type === "VariableDeclarator" && parent.init === node)`
     - `if (parent.type === "ExpressionStatement")`

  2. `reportMissing` option branch:
     - `if (enableFix)` – the `enableFix === false` path was not exercised.

- Existing tests:
  - `tests/utils/annotation-checker.test.ts` drove `checkReqAnnotation` via TS AST (TSDeclareFunction, TSMethodSignature) but only for the default `enableFix: true` path and without explicit coverage of all `getFixTargetNode` branches.
  - `tests/utils/req-annotation-detection.test.ts` thoroughly covered the heuristics in `reqAnnotationDetection`, not the fix-target logic.

So the mid-section branches (fix target selection + “no fix” path) were the gap.

**Status:** **NOW item completed.**

---

### ✅ NEXT: Design and implement new focused tests + review coverage

#### 1. Keep existing TS integration helper stable

I briefly experimented with routing options through the helper rule in `tests/utils/annotation-checker.test.ts`, but this complicated schema and RuleTester config. I rolled those changes back to keep this helper simple:

- `tests/utils/annotation-checker.test.ts` now has:

  ```ts
  const rule: any = {
    meta: {
      type: "problem",
      fixable: "code",
      docs: {
        description: "Test helper for checking @req annotation",
        recommended: "error",
      },
      messages: { missingReq: "Missing @req annotation" },
      schema: [],             // back to no options
    },
    create(context: any) {
      return {
        TSDeclareFunction: (node: any) => checkReqAnnotation(context, node),
        TSMethodSignature: (node: any) => checkReqAnnotation(context, node),
      };
    },
  };
  ```

- It still:
  - Exercises autofix for TSDeclareFunction and TSMethodSignature.
  - Verifies the default autofix behavior in TS syntax, without introducing extra complexity or options.

#### 2. Add a new focused branch-coverage test suite

To target the mid-section logic explicitly and deterministically, I added:

**File:** `tests/utils/annotation-checker-branches.test.ts`

Key points:

- At top of file, explicitly mock the detection and naming helpers:

  ```ts
  /**
   * Focused branch coverage tests for annotation-checker helper.
   * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-AUTOFIX REQ-ANNOTATION-REPORTING
   */

  jest.mock("../../src/utils/reqAnnotationDetection", () => ({
    // Always report that no requirement annotation is present so we exercise
    // the missing-annotation reporting and autofix paths in the helper.
    hasReqAnnotation: jest.fn(() => false),
  }));

  jest.mock("../../src/rules/helpers/require-story-utils", () => ({
    // Provide a stable, human-readable name so reporting paths are predictable
    // without depending on the full real implementation.
    getNodeName: jest.fn(() => "mockName"),
  }));

  import { checkReqAnnotation } from "../../src/utils/annotation-checker";
  ```

  This ensures:
  - `checkReqAnnotation` always treats the node as missing a requirement annotation.
  - We reliably hit `reportMissing` and `createMissingReqFix` without depending on complex source-code heuristics.
  - Reported `name` is deterministic (`"mockName"`).

- Helper to stub the ESLint context:

  ```ts
  /**
   * Build a minimal ESLint rule context stub that captures report() calls.
   *
   * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REPORTING
   */
  function createContextStub() {
    const report = jest.fn();
    const sourceCode = {
      getJSDocComment: jest.fn(() => null),
      getCommentsBefore: jest.fn(() => []),
    } as any;

    const context = {
      getSourceCode() {
        return sourceCode;
      },
      report,
    } as any;

    return { context, report };
  }
  ```

- **Tests added** (each tagged with `[REQ-ANNOTATION-AUTOFIX]` and referencing the story requirements):

  1. **No parent -> fix attaches directly to node** (covers the `!parent` branch):

     ```ts
     it("[REQ-ANNOTATION-AUTOFIX] attaches fix directly to node when parent is missing", () => {
       const { context, report } = createContextStub();
       const node = { type: "FunctionDeclaration" } as any; // no parent

       checkReqAnnotation(context, node, { enableFix: true });

       expect(report).toHaveBeenCalledTimes(1);
       const reportArg = report.mock.calls[0][0];

       expect(reportArg).toHaveProperty("fix");
       const fixer = { insertTextBefore: jest.fn() } as any;

       reportArg.fix(fixer);

       expect(fixer.insertTextBefore).toHaveBeenCalledWith(
         node,
         "/** @req <REQ-ID> */\n",
       );
     });
     ```

  2. **MethodDefinition parent -> fix attaches to `MethodDefinition` wrapper**:

     ```ts
     it("[REQ-ANNOTATION-AUTOFIX] attaches fix to MethodDefinition wrapper when parent is a method", () => {
       const { context, report } = createContextStub();
       const methodParent = { type: "MethodDefinition" } as any;
       const node = {
         type: "FunctionExpression",
         parent: methodParent,
         id: { type: "Identifier", name: "methodImpl" },
       } as any;

       checkReqAnnotation(context, node, { enableFix: true });

       const reportArg = report.mock.calls[0][0];
       const fixer = { insertTextBefore: jest.fn() } as any;
       reportArg.fix(fixer);

       expect(fixer.insertTextBefore).toHaveBeenCalledWith(
         methodParent,
         "/** @req <REQ-ID> */\n",
       );
     });
     ```

  3. **VariableDeclarator.init -> fix attaches to `VariableDeclarator`**:

     ```ts
     it("[REQ-ANNOTATION-AUTOFIX] attaches fix to VariableDeclarator when node is its init", () => {
       const { context, report } = createContextStub();
       const declarator: any = { type: "VariableDeclarator" };
       const node: any = { type: "FunctionExpression", parent: declarator };
       declarator.init = node;

       checkReqAnnotation(context, node, { enableFix: true });

       const reportArg = report.mock.calls[0][0];
       const fixer = { insertTextBefore: jest.fn() } as any;
       reportArg.fix(fixer);

       expect(fixer.insertTextBefore).toHaveBeenCalledWith(
         declarator,
         "/** @req <REQ-ID> */\n",
       );
     });
     ```

  4. **ExpressionStatement parent -> fix attaches to `ExpressionStatement` wrapper**:

     ```ts
     it("[REQ-ANNOTATION-AUTOFIX] attaches fix to ExpressionStatement wrapper when parent is an expression", () => {
       const { context, report } = createContextStub();
       const expressionParent = { type: "ExpressionStatement" } as any;
       const node = {
         type: "FunctionExpression",
         parent: expressionParent,
         id: { type: "Identifier", name: "iife" },
       } as any;

       checkReqAnnotation(context, node, { enableFix: true });

       const reportArg = report.mock.calls[0][0];
       const fixer = { insertTextBefore: jest.fn() } as any;
       reportArg.fix(fixer);

       expect(fixer.insertTextBefore).toHaveBeenCalledWith(
         expressionParent,
         "/** @req <REQ-ID> */\n",
       );
     });
     ```

  5. **`enableFix: false` -> report without fix**:

     ```ts
     it("[REQ-ANNOTATION-AUTOFIX] omits fix when enableFix is false", () => {
       const { context, report } = createContextStub();
       const node = {
         type: "FunctionDeclaration",
         parent: { type: "Program" },
         id: { type: "Identifier", name: "noFix" },
       } as any;

       checkReqAnnotation(context, node, { enableFix: false });

       expect(report).toHaveBeenCalledTimes(1);
       const reportArg = report.mock.calls[0][0];

       expect(reportArg.fix).toBeUndefined();
     });
     ```

This directly drives the helper in a **unit-test style**, rather than through ESLint’s full parser/RuleTester path, which keeps the tests precise and fast.

#### 3. Verify tests and coverage

- Verified the new test file in isolation:

  ```bash
  npm test -- --runInBand --passWithNoTests=false tests/utils/annotation-checker-branches.test.ts
  ```

  Result: 1 suite, 5 tests passed.

- Verified coverage for the helper using only its two test files:

  ```bash
  npx jest --ci --runInBand --coverage --passWithNoTests=false \
    --collectCoverageFrom=src/utils/annotation-checker.ts \
    --coverageReporters=text \
    --testLocationInResults=false \
    tests/utils/annotation-checker.test.ts \
    tests/utils/annotation-checker-branches.test.ts
  ```

  Coverage for `annotation-checker.ts` with these tests:

  - Statements: 100%
  - Branches: 90.9%
  - Functions: 100%
  - Lines: 100%

- Then ran the **full** test suite (Jest config’s global thresholds still enforced):

  ```bash
  npm test -- --runInBand --passWithNoTests=false
  ```

- In the full coverage report (from CI-equivalent run), `src/utils/annotation-checker.ts` now shows:

  - Statements: 100%
  - Branches: 97.14%
  - Functions: 100%
  - Lines: 100%

  So:
  - The previously-uncovered fix-target-selection branches and `enableFix === false` path are now covered.
  - The file is well above the global branch threshold (80%) and very close to full branch coverage, matching the plan’s goal to “further solidify” the helper.

#### 4. Quality checks and CI

Before committing/pushing, I ran:

- `npm run lint -- --max-warnings=0`
- `npm run type-check`
- `npm run format:check`
- `npm test -- --runInBand --passWithNoTests=false`

Then:

- Staged and committed as tests-only:

  ```bash
  test: add focused branch coverage tests for annotation checker helper
  ```

- Pushed to `main`. The pre-push hook ran `ci-verify:full` and `security:secrets`, and GitHub Actions CI/CD (“CI/CD Pipeline”) completed successfully.

---

## Updated Plan

### NOW

- [x] Identify the specific conditional branches and error-handling paths in the traceability annotation helper logic that are not yet exercised by existing tests so we know exactly which behaviors need additional coverage.

### NEXT

- [x] Design new focused tests that trigger each of the uncovered branches in the annotation helper logic (for example, different missing-annotation scenarios and option combinations) using the existing rules as entry points.
- [x] Implement the new tests in the appropriate test suite so that each identified branch and error path in the annotation helper is executed and its behavior asserted.
- [x] Review coverage results conceptually to ensure the mid-section of the annotation helper is now fully covered and that the new tests accurately reflect the documented stories and requirements.

### LATER

- [ ] Refine and, if helpful, lightly refactor the annotation helper to reduce internal duplication or complexity now that its behavior is well covered by tests.
- [ ] Expand similar branch-coverage reviews to other shared helper modules to ensure critical utility logic across the plugin has strong, explicitly tested edge-case coverage.
- [ ] Consider adding a small internal guideline or checklist for future helper functions to ensure new branches are always accompanied by dedicated tests when introduced.

If you’d like, I can next tackle the LATER items, starting with a small refactor pass over `annotation-checker.ts` now that its behavior is tightly covered.
```
