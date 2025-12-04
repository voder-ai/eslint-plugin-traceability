# Last Action Executed (Agentic)

**Action:** Used tool: list_directory with input: {"dirPath":"."}
Used tool: get_git_status with input: {}
Used tool: find_files with input: {"pattern":"*.test.ts","directory":"tests"}
Used tool: list_directory with input: {"dirPath":"tests"}
Used tool: read_file with input: {"filePath":".voder-jscpd-report/jscpd-report.json"}
Used tool: read_file with input: {"filePath":"tests/utils/annotation-checker.test.ts"}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: read_file with input: {"filePath":"tests/utils/require-story-core-test-helpers.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core-edgecases.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/cli.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/ts-language-options.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/temp-dir-helpers.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/batch.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/report.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-req-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: modify_file with input: {"filePath":"tests/rules/require-req-annotation.test.ts","instruction":"1. After the existing `const ruleTester = new RuleTester({` block (ending with the closing `} as any);` line), insert a new helper function:\n\n```ts\n/**\n * Build a standard missingReq error object for a given function name.\n *\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQUIRED - Standardize missingReq error shape in tests\n */\nfunction missingReq(functionName: string) {\n  return {\n    messageId: \"missingReq\" as const,\n    data: { name: functionName, functionName },\n  };\n}\n```\n\n2. In the `runAnnotationCheckerTests(\"require-req-annotation\", { ... })` configuration object, update each `invalid` test case so that the `errors` array uses the new helper instead of repeating the full object:\n   - For the case named `[REQ-TYPESCRIPT-SUPPORT] missing @req on TSDeclareFunction`, change:\n\n```ts\nerrors: [\n  {\n    messageId: \"missingReq\",\n    data: { name: \"baz\", functionName: \"baz\" },\n  },\n],\n```\n\n   to:\n\n```ts\nerrors: [missingReq(\"baz\")],\n```\n\n   - For the case named `[REQ-TYPESCRIPT-SUPPORT] missing @req on TSMethodSignature`, change the `errors` array similarly to:\n\n```ts\nerrors: [missingReq(\"method\")],\n```\n\n3. In the `ruleTester.run(\"require-req-annotation\", rule, { ... })` call, update all `invalid` test cases so that any `errors` array that currently inlines a `missingReq` error object instead calls the helper. For each case where `errors` is:\n\n```ts\nerrors: [\n  {\n    messageId: \"missingReq\",\n    data: { name: \"XYZ\", functionName: \"XYZ\" },\n  },\n],\n```\n\nreplace it with:\n\n```ts\nerrors: [missingReq(\"XYZ\")],\n```\n\nand for cases where the `errors` array contains only that single `missingReq` object (with the `name` and `functionName` values matching), ensure the helper is used. Do not alter any other properties or tests."}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: read_file with input: {"filePath":"src/maintenance/detect.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts"}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/cli.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-annotation-utils.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts"}
Used tool: modify_file with input: {"filePath":"src/maintenance/detect.ts","instruction":"Add @implements annotations to the remaining unannotated branches as described in scripts/traceability-report.md.\n\n1. On the `catch` block in detectStaleAnnotations (the `catch {` around fs.readFileSync in processFileForStaleAnnotations), insert line comments immediately inside the catch block:\n\n```ts\n  } catch {\n    // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT\n    // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE\n    return;\n  }\n```\n\n2. In `handleStoryMatch`, for the `if (inProjectCandidates.length === 0) {` branch, add a line comment inside the branch before the `return;`:\n\n```ts\n  if (inProjectCandidates.length === 0) {\n    // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT\n    return;\n  }\n```\n\n3. In `getInProjectCandidates`, for each `catch` block that currently sets `projectBoundary` or `codebaseBoundary` after calling enforceProjectBoundary, add an @implements comment at the top of the catch block body, before the assignment, indicating that these errors are treated as out-of-project by design:\n\n```ts\n  } catch {\n    // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT\n    projectBoundary = {\n      isWithinProject: false,\n      candidate: storyProjectCandidate,\n    };\n  }\n```\n\nand similarly for the second catch block (for codebaseBoundary), using the same @implements line.\n\n4. In `anyInProjectCandidateExists`, add an @implements comment to the arrow function body used by `some`:\n\nChange the implementation from:\n\n```ts\nfunction anyInProjectCandidateExists(inProjectCandidates: string[]): boolean {\n  return inProjectCandidates.some((p) => fs.existsSync(p));\n}\n```\n\nto:\n\n```ts\nfunction anyInProjectCandidateExists(inProjectCandidates: string[]): boolean {\n  return inProjectCandidates.some((p) => {\n    // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT\n    return fs.existsSync(p);\n  });\n}\n```\n\nKeep all existing logic intact apart from these comment insertions."}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-annotation-utils.ts","instruction":"Add @implements annotations to the specific branches flagged as missing traceability in scripts/traceability-report.md.\n\n1. In `collapseAnnotationValue`, annotate the return statement to indicate it implements the multiline support requirement. Change the body from:\n\n```ts\nexport function collapseAnnotationValue(value: string): string {\n  return value.replace(/\\s+/g, \"\");\n}\n```\n\nto:\n\n```ts\nexport function collapseAnnotationValue(value: string): string {\n  // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-MULTILINE-SUPPORT\n  return value.replace(/\\s+/g, \"\");\n}\n```\n\n2. In `getFixedStoryPath`, add fine-grained @implements comments to each conditional branch that was previously unannotated:\n   - For the initial traversal check `if (original.includes(\"..\")) {`, inside the branch before `return null;`, add:\n\n```ts\n    // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE\n```\n\n   - For the `if (/\\.story\\.md$/.test(original)) {` branch, add:\n\n```ts\n    // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT\n```\n\n   - For the `if (/\\.story$/.test(original)) {` branch, add:\n\n```ts\n    // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE\n```\n\n   - For the `if (/\\.md$/.test(original)) {` branch, add:\n\n```ts\n    // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE\n```\n\n   - Immediately before the final `return `${original}.story.md`;` line, add:\n\n```ts\n  // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE REQ-AUTOFIX-SAFE\n```\n\nDo not change any logic or function signatures, only insert these comments."}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts","instruction":"Add @implements annotations to the specific control-flow branches reported as missing traceability in scripts/traceability-report.md.\n\n1. In `analyzeCandidateBoundaries`, add comments to the branches that set the in/out-of-project flags:\n   - Inside the `if (boundary.isWithinProject) {` block, before `hasInProjectCandidate = true;`, add:\n\n```ts\n      // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY\n```\n\n   - Inside the `else` block, before `hasOutOfProjectCandidate = true;`, add:\n\n```ts\n      // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY\n```\n\n2. In `handleProjectBoundaryForExistence`, add @implements comments to the key decision points:\n   - At the top of the `if (candidates.length > 0) {` block, before computing `const { hasInProjectCandidate, hasOutOfProjectCandidate } = ...`, add:\n\n```ts\n    // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-CONFIGURABLE-PATHS\n```\n\n   - Inside that block, in the `if (hasOutOfProjectCandidate && !hasInProjectCandidate) {` branch, before `reportInvalidPath(...)`, add:\n\n```ts\n      // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY\n```\n\n   - In the later `if (existenceResult && existenceResult.status === \"exists\" && existenceResult.matchedPath) {` block, before `const boundary = enforceProjectBoundary(...)`, add:\n\n```ts\n    // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY\n```\n\n   - Inside that inner `if (!boundary.isWithinProject) {` branch, before `reportInvalidPath(...)`, add:\n\n```ts\n      // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY\n```\n\n3. In `performSecurityValidations`, add @implements comments for the absolute path and traversal checks:\n   - In the absolute path check, inside `if (path.isAbsolute(storyPath)) {`, before `if (!allowAbsolute) {`, add:\n\n```ts\n    // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-SECURITY-VALIDATION\n```\n\n   - In the traversal check, inside `if (containsTraversal) {`, before `const full = path.resolve(...)`, add:\n\n```ts\n    // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-SECURITY-VALIDATION\n```\n\n   - Inside that block, in the `if (!full.startsWith(cwd + path.sep)) {` branch, before `reportInvalidPath(...)`, add:\n\n```ts\n      // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-SECURITY-VALIDATION\n```\n\nOnly insert these comments; do not alter any logic or function signatures."}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["test"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","src/maintenance/detect.ts","src/rules/helpers/valid-annotation-utils.ts","src/rules/helpers/valid-story-reference-helpers.ts","tests/rules/require-req-annotation.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: reduce duplication in tests and improve traceability annotations"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19934178462,"timeout":600000}

**Response:**

```
Here’s what I implemented for the **##NOW** and **##NEXT** sections and where things stand.

---

## What I did

### 1) NOW – Refactor the most duplicated test file

**Task:**  
- [x] Analyze the most highly duplicated test file and refactor it to use shared helpers or data builders so that repeated RuleTester setups and case definitions are centralized, reducing duplication without changing test behavior.

**Work:**

I targeted **`tests/rules/require-req-annotation.test.ts`**, which was one of the worst offenders in the jscpd report (≈65% duplicated lines).

Changes:

- Introduced a shared helper to standardize the repeated `missingReq` error objects:

  ```ts
  /**
   * Build a standard missingReq error object for a given function name.
   *
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-REQUIRED - Standardize missingReq error shape in tests
   */
  function missingReq(functionName: string) {
    return {
      messageId: "missingReq" as const,
      data: { name: functionName, functionName },
    };
  }
  ```

- Replaced all inline single‑object `errors` arrays with the helper:

  Before:

  ```ts
  errors: [
    {
      messageId: "missingReq",
      data: { name: "baz", functionName: "baz" },
    },
  ],
  ```

  After:

  ```ts
  errors: [missingReq("baz")],
  ```

  This was applied to:
  - The TypeScript-specific invalid cases in the **`runAnnotationCheckerTests`** call.
  - All invalid cases in the main **`ruleTester.run("require-req-annotation", ...)`** block where the error is a standard `missingReq` with `name === functionName`.

**Result:**

- The tests are now less repetitive and easier to maintain: all `missingReq` expectations are centralized.
- `npm test` still passes.
- `npm run duplication` continues to pass with an overall very low duplication percentage (≈0.82% of lines), and `tests/utils/**` remains ignored as intended for helper-heavy test code.

---

### 2) NEXT – Traceability improvements

#### 2a) Add/Refine annotations for unannotated functions/branches

**Task:**  
- [ ] Review the project’s traceability report and add or refine story and requirement annotations on any remaining unannotated functions and control-flow branches so that implementation traceability is effectively complete for existing features.

**Work done in this iteration:**

Using the previous `scripts/traceability-report.md` as a to‑do list, I focused on the concrete missing spots it listed and added **`@implements`** annotations in three key areas.

1. **`src/maintenance/detect.ts`**

   Addressed missing annotations in:

   - The `catch` around `fs.readFileSync` in `processFileForStaleAnnotations`:

     ```ts
     try {
       content = fs.readFileSync(file, "utf8");
     } catch {
       // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
       // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE
       return;
     }
     ```

   - The “no in-project candidates” guard in `handleStoryMatch`:

     ```ts
     if (inProjectCandidates.length === 0) {
       // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
       return;
     }
     ```

   - Both `catch` blocks in `getInProjectCandidates`, documenting the “treat boundary errors as out-of-project” behavior:

     ```ts
     } catch {
       // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
       projectBoundary = {
         isWithinProject: false,
         candidate: storyProjectCandidate,
       };
     }
     ```

     and similarly for `codebaseBoundary`.

   - The existence check in `anyInProjectCandidateExists`:

     ```ts
     function anyInProjectCandidateExists(inProjectCandidates: string[]): boolean {
       return inProjectCandidates.some((p) => {
         // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
         return fs.existsSync(p);
       });
     }
     ```

   These cover several of the branches and the arrow function previously reported as missing annotations.

2. **`src/rules/helpers/valid-annotation-utils.ts`**

   - For **multiline value collapsing**:

     ```ts
     export function collapseAnnotationValue(value: string): string {
       // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-MULTILINE-SUPPORT
       return value.replace(/\s+/g, "");
     }
     ```

   - For **all branches** in `getFixedStoryPath`:

     ```ts
     if (original.includes("..")) {
       // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
       return null;
     }

     if (/\.story\.md$/.test(original)) {
       // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT
       return null;
     }

     if (/\.story$/.test(original)) {
       // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE
       return `${original}.md`;
     }

     if (/\.md$/.test(original)) {
       // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE
       return original.replace(/\.md$/, ".story.md");
     }

     // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE REQ-AUTOFIX-SAFE
     return `${original}.story.md`;
     ```

   This ties each path-fixing branch directly back to Story 008.0’s requirements (`REQ-AUTOFIX-FORMAT`, `REQ-AUTOFIX-PRESERVE`, `REQ-AUTOFIX-SAFE`).

3. **`src/rules/helpers/valid-story-reference-helpers.ts`**

   - In **`analyzeCandidateBoundaries`**, to document the project‑boundary classification:

     ```ts
     if (boundary.isWithinProject) {
       // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY
       hasInProjectCandidate = true;
     } else {
       // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY
       hasOutOfProjectCandidate = true;
     }
     ```

   - In **`handleProjectBoundaryForExistence`**, at key decisions:

     ```ts
     if (candidates.length > 0) {
       // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-CONFIGURABLE-PATHS
       const { hasInProjectCandidate, hasOutOfProjectCandidate } =
         analyzeCandidateBoundaries(candidates, cwd);

       if (hasOutOfProjectCandidate && !hasInProjectCandidate) {
         // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY
         reportInvalidPath({ storyPath, commentNode, context });
         return true;
       }
     }

     if (
       existenceResult &&
       existenceResult.status === "exists" &&
       existenceResult.matchedPath
     ) {
       // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY
       const boundary = enforceProjectBoundary(existenceResult.matchedPath, cwd);
       if (!boundary.isWithinProject) {
         // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY
         reportInvalidPath({ storyPath, commentNode, context });
         return true;
       }
     }
     ```

   - In **`performSecurityValidations`**, for absolute path and traversal checks:

     ```ts
     if (path.isAbsolute(storyPath)) {
       // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-SECURITY-VALIDATION
       if (!allowAbsolute) {
         reportInvalidPath({ storyPath, commentNode, context });
         return false;
       }
     }

     const containsTraversal = storyPath.includes("..") || /\\|\//.test(storyPath);
     if (containsTraversal) {
       // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-SECURITY-VALIDATION
       const full = path.resolve(cwd, path.normalize(storyPath));
       if (!full.startsWith(cwd + path.sep)) {
         // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-SECURITY-VALIDATION
         reportInvalidPath({ storyPath, commentNode, context });
         return false;
       }
     }
     ```

**Status:**

- We **significantly reduced** the set of unannotated branches in `detect.ts` and in the core validation helpers for annotation format and story reference.
- Some inline arrow functions inside `valid-annotation-format.ts` (e.g., small callbacks in `forEach` / `some`) are still unannotated and remain as future cleanup opportunities.
- `npm run check:traceability` passes and regenerated `scripts/traceability-report.md`.

Because there are still a few remaining unannotated “helper” arrows in `valid-annotation-format.ts`, I’m leaving this task as **partially complete** and keeping it unchecked in the plan.

---

### 3) NEXT – Re-run duplication & traceability checks

**Task:**  
- [x] Once duplication and traceability improvements are in place, re-run the project’s duplication and traceability checks to confirm that overall code-quality indicators have improved enough to allow a full functionality assessment.

**Work:**

- Ran **duplication check**:

  ```sh
  npm run duplication
  ```

  - Still passes under the configured threshold (`--threshold 3`, ignoring `tests/utils/**`).
  - Overall duplication remains very low: about **0.82% of lines / 1.56% of tokens**.

- Ran **traceability check**:

  ```sh
  npm run check:traceability
  ```

  - Succeeds and rewrote `scripts/traceability-report.md` to reflect the new annotations.
  - The specific missing-function/branch entries in `detect.ts`, `valid-annotation-utils.ts`, and `valid-story-reference-helpers.ts` are now addressed by explicit `@implements` comments.

---

### 4) NEXT – Tasks not yet completed in this iteration

**Task:**  
- [ ] Apply the same refactoring approach to the remaining test files that have very high duplication, extracting common configuration, fixtures, and assertion patterns into reusable test utilities while ensuring existing behaviors remain covered.

Status:

- I have **not yet** refactored additional high-duplication test files such as:
  - `tests/rules/valid-annotation-format.test.ts`
  - `tests/rules/require-branch-annotation.test.ts`
  - `tests/rules/valid-story-reference.test.ts`
  - `tests/maintenance/cli.test.ts`
- Those remain to be tackled in a follow-up iteration with additional shared helpers (similar to `missingReq` or the existing `require-story-core-test-helpers` and `ts-language-options` utilities).

---

**Task:**  
- [ ] Revisit the existing lint-rule suppression for the function that exceeds the parameter limit and either refactor the code to remove the need for the suppression or update its rationale to clearly document why it remains the preferred design.

Status:

- I did **not** modify `src/rules/helpers/valid-annotation-options.ts` or the `resolvePattern` helper in this pass.
- The existing `max-params` suppression and its rationale remain unchanged and should be revisited in a dedicated, small refactor later.

---

### 5) Quality checks and CI/CD

Before committing/pushing, I ran:

- `npm run lint -- --max-warnings=0`
- `npm test`
- `npm run build`
- `npm run type-check`
- `npm run format:check`
- `npm run duplication`
- `npm run check:traceability`

Prettier initially reported formatting issues in the touched files; I fixed them with:

```sh
npm run format -- src/maintenance/detect.ts src/rules/helpers/valid-annotation-utils.ts src/rules/helpers/valid-story-reference-helpers.ts tests/rules/require-req-annotation.test.ts
npm run format:check
```

Then I committed:

- `refactor: reduce duplication in tests and improve traceability annotations`

Pushed to `main`, which triggered the **CI/CD Pipeline**. The latest run (`ID: 19934178462`) completed with **success**.

---

## Updated Plan

### NOW

- [x] Analyze the most highly duplicated test file and refactor it to use shared helpers or data builders so that repeated RuleTester setups and case definitions are centralized, reducing duplication without changing test behavior.

### NEXT

- [ ] Apply the same refactoring approach to the remaining test files that have very high duplication, extracting common configuration, fixtures, and assertion patterns into reusable test utilities while ensuring existing behaviors remain covered.
- [ ] Review the project’s traceability report and add or refine story and requirement annotations on any remaining unannotated functions and control-flow branches so that implementation traceability is effectively complete for existing features. *(Partially done: maintenance and helper modules updated; some inline arrows in `valid-annotation-format.ts` still remain.)*
- [ ] Revisit the existing lint-rule suppression for the function that exceeds the parameter limit and either refactor the code to remove the need for the suppression or update its rationale to clearly document why it remains the preferred design.
- [x] Once duplication and traceability improvements are in place, re-run the project’s duplication and traceability checks to confirm that overall code-quality indicators have improved enough to allow a full functionality assessment.

If you’d like, next I can focus either on refactoring another specific high-duplication test file (e.g., `valid-annotation-format.test.ts`) or on removing the `max-params` suppression in `valid-annotation-options.ts` via a small value-object refactor.
```
