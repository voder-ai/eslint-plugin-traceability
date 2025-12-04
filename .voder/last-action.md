# Last Action Executed (Resumed)

**Timestamp:** 2025-12-04T15:41:29.953Z

**Mode:** Resumed - Completing interrupted cycle

**Action:** Used tool: list_directory with input: {"dirPath":"."}
Used tool: get_git_status with input: {}
Used tool: list_directory with input: {"dirPath":"tests"}
Used tool: list_directory with input: {"dirPath":"tests/rules"}
Used tool: list_directory with input: {"dirPath":"tests/utils"}
Used tool: list_directory with input: {"dirPath":".voder-jscpd-report"}
Used tool: read_file with input: {"filePath":".voder-jscpd-report/jscpd-report.json"}
Used tool: read_file with input: {"filePath":"tests/utils/annotation-checker.test.ts"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: read_file with input: {"filePath":"tests/rules/require-req-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/require-story-core-test-helpers.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core-edgecases.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-branch-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/error-reporting.test.ts"}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-req-annotation.test.ts","pattern":"languageOptions","isRegex":false}
Used tool: find_files with input: {"pattern":".jscpd*","directory":"."}
Used tool: read_file with input: {"filePath":"tests/utils/ts-language-options.ts"}
Used tool: read_file with input: {"filePath":"eslint.config.js"}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: run_command with input: {"command":"npx","args":["jscpd","src","tests","--reporters","json","--output",".voder-jscpd-report/jscpd-report-latest.json"]}
Used tool: read_file with input: {"filePath":".voder-eslint-report.json"}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: read_file with input: {"filePath":"src/maintenance/detect.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts"}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts"}
Used tool: modify_file with input: {"filePath":"tests/utils/annotation-checker.test.ts","instruction":"Refactor to remove internal duplication of RuleTester languageOptions blocks by centralizing TS language options in withTsLanguageOptions helper (already imported) and eliminating redundant inline languageOptions from test case definitions. Ensure behavior remains the same and test names and assertions are untouched."}
Used tool: search_file_content with input: {"filePath":".voder-jscpd-report/jscpd-report.json","pattern":"tests/utils/annotation-checker.test.ts","isRegex":false}
Used tool: read_file with input: {"filePath":".voder-jscpd-report/jscpd-report-latest.json/jscpd-report.json"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/utils/annotation-checker.test.ts","tests/rules/require-req-annotation.test.ts"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: refactor annotation-checker RuleTester setup to shared helper"}
Used tool: modify_file with input: {"filePath":"src/maintenance/cli.ts","instruction":"For each control-flow branch (if, switch/case, try/catch) listed as missing annotations in scripts/traceability-report.md, add inline traceability comments using @implements pointing to the appropriate maintenance stories and requirements. Use concise comments that explain why the branch exists in terms of requirements, without changing runtime behavior."}
Used tool: modify_file with input: {"filePath":"src/maintenance/detect.ts","instruction":"Add missing @implements or @story/@req annotations for the arrow function at line 176 and for any control-flow branches (try/catch, if) reported as missing in scripts/traceability-report.md. Ensure each branch has a brief, precise traceability comment tying it back to docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md and the relevant REQ IDs, without altering logic."}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-annotation-utils.ts","instruction":"Add missing @story/@req or @implements annotations for the if-statements called out in scripts/traceability-report.md, describing what each condition is enforcing with respect to docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md and 010.1/010.2 stories as appropriate. Keep comments minimal and focused on why the branch exists."}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: modify_file with input: {"filePath":"src/maintenance/detect.ts","instruction":"Add inline @implements and/or @story/@req annotations on the remaining branches reported as missing in scripts/traceability-report.md (catch blocks, if statements in getInProjectCandidates and anyInProjectCandidateExists), tying them back to docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md and REQ-MAINT-DETECT / REQ-MAINT-SAFE. Keep comments concise and avoid changing runtime logic."}
Used tool: modify_file with input: {"filePath":"src/rules/valid-annotation-format.ts","instruction":"For each if-statement listed as missing traceability in scripts/traceability-report.md, add concise comments using @story/@req or @implements that explain which validation or autofix requirement from docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md, 008.0-DEV-AUTO-FIX.story.md, 010.1-DEV-CONFIGURABLE-PATTERNS.story.md, or 010.2-DEV-MULTI-STORY-SUPPORT.story.md the branch enforces. Do not alter behavior."}
Used tool: modify_file with input: {"filePath":"src/utils/annotation-checker.ts","instruction":"Annotate the missingReqFix function expression returned by createMissingReqFix with @story/@req or @implements comments directly above its definition, referencing docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md and REQ-ANNOTATION-AUTOFIX / REQ-ANNOTATION-REPORTING. Ensure no runtime behavior change."}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: read_file with input: {"filePath":"src/maintenance/cli.ts"}
Used tool: modify_file with input: {"filePath":"src/maintenance/cli.ts","instruction":"Convert existing mixed JSDoc/inline traceability comments on control-flow branches into consistent single-line // @implements comments immediately inside the if/switch/try/catch blocks as needed so that the traceability checker associates them with the reported branch nodes. Keep the textual content but follow the preferred @implements <story> <REQ-ID> format per branch."}
Used tool: modify_file with input: {"filePath":"src/maintenance/detect.ts","instruction":"Adjust traceability comments for branch-level annotations so that for each if/catch/try/arrow callback reported as missing in scripts/traceability-report.md, there is a nearby // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT (and REQ-MAINT-SAFE when applicable) comment aligned with the branch node rather than embedded inside other comments. Avoid changing runtime behavior."}
Used tool: modify_file with input: {"filePath":"src/utils/annotation-checker.ts","instruction":"Ensure the missingReqFix function expression returned from createMissingReqFix has a dedicated line-level // @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-AUTOFIX REQ-ANNOTATION-REPORTING comment immediately before its definition so that the traceability checker sees it as annotating that function node."}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-annotation-utils.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts"}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-annotation-utils.ts","instruction":"Add inline // @implements comments immediately inside each if block that the traceability report still flags in this file (lines around 64, 71, 78, 85, 114) so that each branch is clearly tied to REQ-REQ-FORMAT or REQ-ERROR-SPECIFICITY from docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md and 010.1-REQ-STORY-PATH-STRICTNESS.story.md. Do not change logic."}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: modify_file with input: {"filePath":"src/maintenance/cli.ts","instruction":"Add a single-line // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE traceability comment immediately inside the if (!command || ...) block and immediately above the try statement to ensure the checker associates them with the reported IfStatement and TryStatement nodes, without changing logic."}
Used tool: modify_file with input: {"filePath":"src/maintenance/detect.ts","instruction":"Inside the try/catch blocks in processFileForStaleAnnotations and getInProjectCandidates, and inside the if conditions called out in the traceability report (existence checks in detectStaleAnnotations and handleStoryMatch, and final existence/mark-stale checks), insert concise // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT (plus REQ-MAINT-SAFE where appropriate) comments as the first statement in each branch body to directly annotate the branch nodes."}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-annotation-utils.ts","instruction":"Directly above each still-reported if statement in this file (the first five in getFixedStoryPath and the kind checks in buildStoryErrorMessage/buildReqErrorMessage), insert inline // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT REQ-ERROR-SPECIFICITY comments describing that the branch enforces presence or correctness of story/req identifiers, without changing behavior."}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts","pattern":"for (const candidate","isRegex":false}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts","instruction":"Inside the for-of loop over candidates and each if block that the traceability report flags in this file (for-of at line 58 and the related ifs around 60, 93, 98, 105, 112, 139, 141, 151, 154), insert concise // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-SECURITY-VALIDATION comments as the first statements so the branches are explicitly traced to file-validation requirements without changing logic."}
Used tool: modify_file with input: {"filePath":"src/utils/annotation-checker.ts","instruction":"Replace the existing // @implements line before the missingReqFix function with a JSDoc-style block on the function itself: a brief description plus @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-AUTOFIX REQ-ANNOTATION-REPORTING, so the traceability checker associates it as a function-level annotation instead of a branch-level comment."}
Used tool: modify_file with input: {"filePath":"src/maintenance/detect.ts","instruction":"For the arrow function passed into Array.prototype.some in anyInProjectCandidateExists (reported as an unannotated arrow function), convert the existing inline branch comments to a JSDoc comment on the arrow callback parameter itself using @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT REQ-MAINT-SAFE, without changing behavior."}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: modify_file with input: {"filePath":"src/maintenance/cli.ts","instruction":"Move the // @implements traceability comment for the if (!command || ...) condition to be the first statement inside the if block body (directly under the opening brace) and similarly place a // @implements comment as the first statement inside the try block body, rather than before the try keyword, so the checker associates them with the correct branch nodes. Keep the existing comment text content."}
Used tool: run_command with input: {"command":"npm","args":["run","check:traceability"]}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"chore: improve traceability annotations for maintenance and validation helpers"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["test"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}

**Response:**

```
Here’s what I implemented for the **##NOW** and **##NEXT** sections, and where things currently stand.

---

## What I did for ##NOW

### [x] Analyze the most highly duplicated test file and refactor it

**Goal:** Reduce duplication in the most duplicated test file by using shared helpers / builders without changing behavior.

**How I approached it:**

1. **Identified the worst offender via jscpd**

   - Looked at `.voder-jscpd-report/jscpd-report.json`.
   - The most duplicated test file was:
     - `tests/utils/annotation-checker.test.ts`  
       - `duplicatedLines: 79`, `percentage: 97.53%` (previous report).

2. **Refactored `tests/utils/annotation-checker.test.ts`**

   File: `tests/utils/annotation-checker.test.ts`

   - Kept the existing shared helper pattern, but ensured the file is structured as a **single, reusable test harness** for TS-specific annotation behavior:
     - `runAnnotationCheckerTests(ruleName, config)`:
       - Accepts a `rule`, plus `valid` and `invalid` case arrays.
       - Internally uses:
         ```ts
         ruleTester.run(ruleName, rule, {
           valid: valid.map(withTsLanguageOptions),
           invalid: invalid.map(withTsLanguageOptions),
         });
         ```
       - `withTsLanguageOptions` comes from `tests/utils/ts-language-options.ts`, which centralizes the `RuleTester` TS parser configuration.
     - `rule`: a minimal helper rule that delegates to `checkReqAnnotation` for `TSDeclareFunction` and `TSMethodSignature`.

   - All **test case names and expectations** were preserved:
     - Valid:
       - `"[REQ-TYPESCRIPT-SUPPORT] valid TSDeclareFunction with @req"`
       - `"[REQ-TYPESCRIPT-SUPPORT] valid TSMethodSignature with @req"`
     - Invalid:
       - `"[REQ-TYPESCRIPT-SUPPORT] missing @req on TSDeclareFunction"`
       - `"[REQ-TYPESCRIPT-SUPPORT] missing @req on TSMethodSignature"`

   - This keeps test coverage and semantics identical while centralizing the TS `languageOptions` setup and RuleTester configuration.

3. **Verified behavior**

   - Targeted tests:
     ```bash
     npm test -- --runTestsByPath \
       tests/utils/annotation-checker.test.ts \
       tests/rules/require-req-annotation.test.ts
     ```
   - Both suites passed.

4. **Verified duplication improvement**

   - Ran a fresh jscpd including `tests/utils/**`:
     ```bash
     npx jscpd src tests --reporters json \
       --output .voder-jscpd-report/jscpd-report-latest.json
     ```
   - In the new report, `tests/utils/annotation-checker.test.ts` shows:
     - `duplicatedLines: 0`, `percentage: 0`.

5. **Commit**

   - Commit: `test: refactor annotation-checker RuleTester setup to shared helper`

---

## What I did for ##NEXT

### [ ] Apply the same refactoring approach to remaining high-duplication test files

I **did not yet refactor the other highly duplicated tests** (for example:

- `tests/maintenance/cli.test.ts`
- `tests/rules/require-story-helpers.test.ts`
- `tests/rules/valid-story-reference.test.ts`
- `tests/rules/require-story-core*.test.ts`

The duplication for those still appears in the jscpd output (the CI duplication step passes but still reports clones). This item remains **open**.

---

### [ ] Review traceability report and complete annotations

**Goal:** Close remaining traceability gaps so functions and control-flow branches are fully annotated.

I **made substantial progress** but did **not** drive the report to zero missing functions/branches. Current summary (from `scripts/traceability-report.md` at the end of work):

- `Functions missing @story/@req`: **7**
- `Branches missing @story/@req`: **34**

What I did:

#### 1. Maintenance CLI (`src/maintenance/cli.ts`)

- Added branch-level `@implements` comments that explicitly tie CLI branches to maintenance requirements:

  - For the help/usage path:
    ```ts
    if (!command || command === "-h" || command === "--help") {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE - Branch to show usage when no command or help flag is provided; handle help requests safely and provide discoverable usage output
      printHelp();
      return EXIT_OK;
    }
    ```

  - For the main `try` (error safety around subcommand dispatch):
    ```ts
    try {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE - Catch unexpected errors and surface concise diagnostics without crashing
      switch (command) { ... }
    } catch (error: unknown) {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE - Catch-all error branch ...
      ...
    }
    ```

  - For each case in the `switch`:
    - `detect`, `verify`, `report`, `update` each annotated with `REQ-MAINT-DETECT/VERIFY/REPORT/UPDATE`.
    - The `update` case also annotates printing help on `EXIT_USAGE` with `REQ-MAINT-SAFE`.
  - For the `default:` branch (unknown commands) and `printHelp()` itself, added `REQ-MAINT-SAFE` annotations.

These comments are placed **inside** the relevant blocks so the checker is more likely to associate them with the specific branch nodes.

#### 2. Maintenance detection logic (`src/maintenance/detect.ts`)

- Annotated key branches and helper logic to connect with maintenance/validation requirements.

  Examples:

  - Early return when workspace root is invalid:
    ```ts
    if (
      !fs.existsSync(workspaceRoot) ||
      !fs.statSync(workspaceRoot).isDirectory()
    ) {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE
      return [];
    }
    ```

  - In `processFileForStaleAnnotations`:
    ```ts
    try {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
      content = fs.readFileSync(file, "utf8");
    } catch {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE
      return;
    }
    ```

  - In `handleStoryMatch`, `getInProjectCandidates`, and `anyInProjectCandidateExists`, added `@implements` comments around:
    - Skipping unsafe paths (`isUnsafeStoryPath`)
    - Project-boundary enforcement and failure fallbacks
    - Existence checks and stale-marking behavior
    - Per-candidate existence checks in `some`:
      ```ts
      return inProjectCandidates.some(
        /**
         * @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT REQ-MAINT-SAFE
         */
        (p) => {
          const exists = fs.existsSync(p);
          if (!exists) {
            // @implements ... REQ-MAINT-SAFE ...
          }
          return exists;
        },
      );
      ```

#### 3. Annotation format helpers (`src/rules/helpers/valid-annotation-utils.ts`)

- Focused on the branches the report highlighted (if statements in `getFixedStoryPath` and the `kind === "missing"` checks):

  - For suffix decisions in `getFixedStoryPath`, added `@implements` tying each case to:
    - `REQ-REQ-FORMAT`
    - `REQ-ERROR-SPECIFICITY`
    - plus the autofix stories where applicable.

    Example:
    ```ts
    if (original.includes("..")) {
      // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT REQ-ERROR-SPECIFICITY - Enforces correctness of the story identifier by rejecting paths that use unsafe traversal segments.
      ...
    }
    ```

  - Similarly for `.story.md`, `.story`, `.md`, and the default no-extension case.

  - For `buildStoryErrorMessage` and `buildReqErrorMessage`, added rationale comments to the `kind === "missing"` branches indicating they enforce presence vs. correctness of identifiers.

#### 4. Valid-story-reference helpers (`src/rules/helpers/valid-story-reference-helpers.ts`)

- Added `@implements` on:

  - `for (const candidate of candidates)` loop and its `if/else`:
    ```ts
    for (const candidate of candidates) {
      // @implements docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-SECURITY-VALIDATION
      const boundary = enforceProjectBoundary(candidate, cwd);
      if (boundary.isWithinProject) {
        // @implements ... REQ-PROJECT-BOUNDARY
        hasInProjectCandidate = true;
      } else {
        // @implements ... REQ-PROJECT-BOUNDARY
        hasOutOfProjectCandidate = true;
      }
    }
    ```

  - The candidates-length check, out-of-project-only case, and matched-path boundary checks in `handleProjectBoundaryForExistence`.

  - Absolute-path and traversal checks in `performSecurityValidations`, tying them to `REQ-PROJECT-BOUNDARY` and `REQ-SECURITY-VALIDATION`.

#### 5. Annotation checker (`src/utils/annotation-checker.ts`)

- Function-level annotation for the **autofix factory**:

  ```ts
  /**
   * Creates a fix function that inserts a missing @req JSDoc before the node.
   * ...
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-AUTOFIX - Provide autofix for missing @req annotation
   * @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-AUTOFIX REQ-ANNOTATION-REPORTING
   */
  function createMissingReqFix(node: any) {
    const target = getFixTargetNode(node);
    ...
  }
  ```

- The traceability checker still reports the inner `missingReqFix` **function expression** as missing `@story/@req`. Addressing that fully will require either:
  - Enhancing the checker to treat the outer function’s annotations as covering inner named functions; or
  - Adding additional per-function annotations in a way that doesn’t clutter the file.

  I have not yet done that deeper change, so this item remains **partially complete**.

Given the remaining **7 functions** and **34 branches** reported missing annotations, this plan item is **not fully complete** yet.

---

### [ ] Revisit lint-rule suppression for over-parameterized function

- The suppression recorded in `.voder-eslint-report.json` is for:
  - `src/rules/helpers/valid-annotation-options.ts`, function `resolvePattern` (5 parameters, `max-params` is 4).
- I **examined** this via the ESLint report but did **not yet**:
  - Refactor `resolvePattern` to reduce parameters, or
  - Change/update the suppression comment/rationale.

This remains **to be done**.

---

### [x] Re-run duplication and traceability checks after improvements

This item is done (for the currently implemented improvements):

- **Duplication**:
  - `npm run duplication`
    - Still finds some clones (mostly around `tests/maintenance/cli.test.ts` and some rule tests) but within the configured threshold.
  - `npx jscpd src tests --reporters json ...`
    - Confirmed that `tests/utils/annotation-checker.test.ts` is now at `duplicatedLines: 0`.

- **Traceability**:
  - Ran repeatedly:
    ```bash
    npm run check:traceability
    ```
  - Confirmed it completes successfully and updates `scripts/traceability-report.md` with the latest counts.
  - Counts have shifted somewhat as annotations were added/refined, though there is still remaining work to reach “effectively complete” coverage.

- These checks, plus full CI (`ci-verify:full`), all passed on push.

---

## Updated Plan

Here is the updated plan with checkboxes reflecting what’s actually complete so far:

### NOW

- [x] Analyze the most highly duplicated test file and refactor it to use shared helpers or data builders so that repeated RuleTester setups and case definitions are centralized, reducing duplication without changing test behavior.

### NEXT

- [ ] Apply the same refactoring approach to the remaining test files that have very high duplication, extracting common configuration, fixtures, and assertion patterns into reusable test utilities while ensuring existing behaviors remain covered.
- [ ] Review the project’s traceability report and add or refine story and requirement annotations on any remaining unannotated functions and control-flow branches so that implementation traceability is effectively complete for existing features.
- [ ] Revisit the existing lint-rule suppression for the function that exceeds the parameter limit and either refactor the code to remove the need for the suppression or update its rationale to clearly document why it remains the preferred design.
- [x] Once duplication and traceability improvements are in place, re-run the project’s duplication and traceability checks to confirm that overall code-quality indicators have improved enough to allow a full functionality assessment.

### LATER

- [ ] Consider tightening selected linting thresholds (such as maximum complexity or function length) in small increments, guided by current violation hotspots, to further reinforce maintainable design without causing widespread breakage.
- [ ] Enhance internal developer documentation to describe the shared testing helpers, traceability expectations, and how to extend them when adding new rules or maintenance features so future work naturally preserves high code quality.
- [ ] Evaluate whether the traceability check should be made stricter (for example, failing when coverage drops below an agreed threshold) once the current gaps are closed and the team is comfortable with the process.

If you’d like, the next focused step can be either:
- systematically closing the remaining traceability-report items file-by-file, or
- tackling duplication in `tests/maintenance/cli.test.ts` and the overlapping require-story helper/core tests.
```
