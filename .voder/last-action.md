# Last Action Executed (Resumed)

**Timestamp:** 2025-11-22T01:50:46.132Z

**Mode:** Resumed - Completing interrupted cycle

**Action:** Used tool: list_directory with input: {"dirPath":"."}
Used tool: find_files with input: {"pattern":"*annotation*","directory":"."}
Used tool: find_files with input: {"pattern":"*.md","directory":"docs"}
Used tool: find_files with input: {"pattern":"*.md","directory":"prompts"}
Used tool: list_directory with input: {"dirPath":"docs"}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: list_directory with input: {"dirPath":"src"}
Used tool: list_directory with input: {"dirPath":"src/utils"}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts"}
Used tool: read_file with input: {"filePath":"docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md"}
Used tool: read_file with input: {"filePath":"docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md"}
Used tool: search_file_content with input: {"filePath":"src/utils/annotation-checker.ts","pattern":"function ","isRegex":false}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts","startLine":1,"endLine":400}
Used tool: list_directory with input: {"dirPath":"src/rules"}
Used tool: list_directory with input: {"dirPath":"src/utils"}
Used tool: list_directory with input: {"dirPath":"src/rules/helpers"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts"}
Used tool: read_file with input: {"filePath":"src/utils/storyReferenceUtils.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-io.ts"}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts","startLine":400,"endLine":800}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-utils.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-visitors.ts"}
Used tool: search_file_content with input: {"filePath":"src/utils/branch-annotation-helpers.ts","pattern":"function ","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/utils/storyReferenceUtils.ts","pattern":"function ","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"function ","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","pattern":"function ","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-io.ts","pattern":"function ","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/utils/annotation-checker.ts","pattern":"if (","isRegex":false}
Used tool: read_file with input: {"filePath":"src/index.ts"}
Used tool: read_file with input: {"filePath":"src/rules/require-story-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/rules/require-req-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/rules/require-branch-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: list_directory with input: {"dirPath":"src/maintenance"}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src/utils"}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src/maintenance"}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src/rules/helpers"}
Used tool: read_file with input: {"filePath":"src/maintenance/utils.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/batch.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/detect.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/update.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/report.ts"}
Used tool: get_git_status with input: {}
Used tool: read_file with input: {"filePath":"src/maintenance/index.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-visitors.ts"}
Used tool: read_file with input: {"filePath":"src/utils/storyReferenceUtils.ts"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts"}
Used tool: modify_file with input: {"filePath":"src/utils/storyReferenceUtils.ts","instruction":"In the `buildStoryCandidates` function, add branch-level traceability comments with @story and @req markers:\n\n1) Immediately before the `if (storyPath.startsWith(\"./\") || storyPath.startsWith(\"../\")) {` line, insert:\n```ts\n  // When the story path is already explicitly relative, resolve it only against the current working directory.\n  // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md\n  // @req REQ-PATH-RESOLUTION - Preserve explicit relative story path semantics when building candidate locations\n```\n\n2) Immediately before the `candidates.push(path.resolve(cwd, storyPath));` inside the `else` block, insert:\n```ts\n    // For bare paths, first try resolving directly under the current working directory.\n    // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md\n    // @req REQ-PATH-RESOLUTION - Attempt direct resolution from cwd before probing configured story directories\n```\n\n3) Immediately before the `for (const dir of storyDirs) {` loop, insert:\n```ts\n    // Probe each configured story directory for a matching story filename.\n    // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md\n    // @req REQ-PATH-RESOLUTION - Expand search across configured storyDirectories while staying within project\n```\n\nIn the `checkSingleCandidate` function, add branch- and error-handling traceability comments:\n\n4) Immediately after `const cached = fileExistStatusCache.get(candidate);` and before the `if (cached) {` line, insert:\n```ts\n  // Reuse any cached filesystem result to avoid redundant disk IO for the same candidate.\n  // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md\n  // @req REQ-PERFORMANCE-OPTIMIZATION - Short-circuit on cached existence checks\n```\n\n5) Immediately before `if (!exists) {` insert:\n```ts\n    // When the path does not exist at all, record a simple \"missing\" status.\n    // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md\n    // @req REQ-FILE-EXISTENCE - Distinguish non-existent story paths from other failure modes\n```\n\n6) Immediately before `if (stat.isFile()) {` insert:\n```ts\n      // Treat existing regular files as valid story candidates; other entry types are considered missing.\n      // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md\n      // @req REQ-FILE-EXISTENCE - Only regular files may satisfy a story path reference\n```\n\n7) Replace the existing single-line comment `// Any filesystem error is captured and surfaced as fs-error.` in the `catch (error)` block with the following multi-line comment including traceability tags:\n```ts\n    // Any filesystem error is captured and surfaced as an fs-error status instead of throwing.\n    // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md\n    // @req REQ-ERROR-HANDLING - Represent filesystem failures as fs-error results while keeping callers resilient\n```\n\nIn the `getStoryExistence` function, add comments for the main control-flow branches:\n\n8) Immediately before the `if (res.status === \"exists\") {` line, insert:\n```ts\n    // As soon as a candidate file is confirmed to exist, return a successful existence result.\n    // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md\n    // @req REQ-FILE-EXISTENCE - Prefer the first positively-matched story file\n```\n\n9) Immediately before the `if (res.status === \"fs-error\" && !firstFsError) {` line, insert:\n```ts\n    // Remember the first filesystem error so callers can inspect a representative failure if no files exist.\n    // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md\n    // @req REQ-ERROR-HANDLING - Surface a single representative filesystem error without failing fast\n```\n\n10) Immediately before the `if (firstFsError) {` line near the end of the function, insert:\n```ts\n  // Prefer reporting a filesystem error over a generic missing status when at least one candidate failed to read.\n  // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md\n  // @req REQ-ERROR-HANDLING - Distinguish IO failures from simple \"missing\" results in existence checks\n```"}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-io.ts","instruction":"Augment branch- and loop-level traceability comments in the IO helpers.\n\n1) In `linesBeforeHasStory`, immediately before the `if (!Array.isArray(lines) || typeof startLine !== \"number\") {` guard, insert:\n```ts\n  // Guard against missing or non-array source lines or an invalid start line before scanning.\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-REQUIRED - Fail gracefully when source lines or locations are unavailable\n```\n\n2) Still in `linesBeforeHasStory`, immediately before the `for (let i = from; i < to; i++) {` loop, insert:\n```ts\n  // Walk each physical line in the configured lookback window to search for an inline @story marker.\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-REQUIRED - Scan preceding lines for existing story annotations\n```\n\n3) Immediately before the `if (typeof text === \"string\" && text.includes(\"@story\")) {` inside that loop, insert:\n```ts\n    // Treat any line containing \"@story\" as evidence that the function is already annotated.\n    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n    // @req REQ-ANNOTATION-REQUIRED - Detect explicit @story markers in raw source text\n```\n\n4) In `fallbackTextBeforeHasStory`, immediately before the guard `if (typeof sourceCode?.getText !== \"function\" || !Array.isArray((node && node.range) || [])) {` insert:\n```ts\n  // Skip fallback text inspection when the sourceCode API or node range information is not available.\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-REQUIRED - Avoid throwing when source text or range metadata cannot be read\n```\n\n5) Still in `fallbackTextBeforeHasStory`, immediately before the `if (!Array.isArray(range) || typeof range[0] !== \"number\") {` check, insert:\n```ts\n  // Guard against malformed range values that cannot provide a numeric start index for slicing.\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-REQUIRED - Validate node range structure before computing fallback window\n```\n\n6) Inside the `try` block of `fallbackTextBeforeHasStory`, immediately before the `const start = Math.max(0, range[0] - FALLBACK_WINDOW);` line, insert:\n```ts\n    // Limit the fallback inspection window to a bounded region immediately preceding the node.\n    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n    // @req REQ-ANNOTATION-REQUIRED - Restrict fallback text scanning to a safe, fixed-size window\n```\n\n7) Immediately before the `if (typeof textBefore === \"string\" && textBefore.includes(\"@story\")) {` line, insert:\n```ts\n    // Detect any @story marker that appears within the bounded fallback window.\n    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n    // @req REQ-ANNOTATION-REQUIRED - Recognize story annotations discovered via fallback text scanning\n```\n\n8) Replace the existing `/* noop */` comment inside the `catch { ... }` block of `fallbackTextBeforeHasStory` with a more descriptive comment that includes traceability tags:\n```ts\n    /*\n     * Swallow low-level IO or slicing errors so annotation detection never breaks lint execution.\n     * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n     * @req REQ-ANNOTATION-REQUIRED - Treat fallback text inspection failures as \"no annotation\" instead of raising\n     */\n```"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/utils/annotation-checker.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","src/utils/annotation-checker.ts","src/utils/storyReferenceUtils.ts","src/rules/helpers/require-story-io.ts"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"chore: refine traceability comments in core annotation utilities"}
Used tool: search_file_content with input: {"filePath":"src/utils","pattern":"@story ???","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src","pattern":"@req UNKNOWN","isRegex":false}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src/utils"}
Used tool: search_file_content with input: {"filePath":"src/utils/annotation-checker.ts","pattern":"@story ???","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/utils/branch-annotation-helpers.ts","pattern":"@story ???","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/utils/storyReferenceUtils.ts","pattern":"@story ???","isRegex":false}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src"}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-utils.ts","instruction":"Strengthen traceability annotations on helper functions by adding requirement descriptions.\n\n1) In the JSDoc for `isIdentifierLike`, replace the existing single-line `@req` tag with a more descriptive one:\n- Find the block that currently contains:\n` * @req REQ-ANNOTATION-REQUIRED`\n- Replace that line with:\n` * @req REQ-ANNOTATION-REQUIRED - Recognize Identifier/JSXIdentifier nodes and return their name`\n\n2) In the JSDoc for `literalToString`, replace the existing `@req` line similarly:\n` * @req REQ-ANNOTATION-REQUIRED`\n→\n` * @req REQ-ANNOTATION-REQUIRED - Convert simple Literal nodes into stable string names when possible`\n\n3) In the JSDoc for `templateLiteralToString`, update the `@req` line to:\n` * @req REQ-ANNOTATION-REQUIRED - Support simple, expression-free TemplateLiteral names for reporting`\n\n4) In the JSDoc for `memberExpressionName`, update the `@req` line to:\n` * @req REQ-ANNOTATION-REQUIRED - Resolve non-computed member-like nodes into property names when safe`\n\n5) In the JSDoc for `propertyKeyName`, update the `@req` line to:\n` * @req REQ-ANNOTATION-REQUIRED - Extract key names from Property/ObjectProperty nodes used in function containers`\n\n6) In the JSDoc for `directName`, update the `@req` line to:\n` * @req REQ-ANNOTATION-REQUIRED - Prefer direct id/key names before falling back to deeper AST inspection`\n\n7) In the JSDoc for `getNodeName`, update the `@req` line to:\n` * @req REQ-ANNOTATION-REQUIRED - Provide a unified way to obtain a stable, human-readable name from AST nodes`\n"}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","src/rules/helpers/require-story-utils.ts","src/utils/storyReferenceUtils.ts","src/rules/helpers/require-story-io.ts"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"chore: enhance traceability descriptions in helper utilities"}
Used tool: run_command with input: {"command":"npm","args":["run","lint","!--help"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["test"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","duplication","--","--silent"]}
Used tool: git_push with input: {}
Used tool: read_file with input: {"filePath":"src/utils/storyReferenceUtils.ts","startLine":80,"endLine":260}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","startLine":260,"endLine":360}

**Response:**

```
Here’s what I’ve done to execute the **##NOW** and **##NEXT** sections of the plan, plus the updated checklist.

---

## What I implemented

### ##NOW

- **Reviewed `src/utils/annotation-checker.ts`**

  - Confirmed that **every named helper function** already has:
    - A JSDoc block with:
      - `@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md`
      - An appropriate `@req` describing the requirement it implements.
  - Verified that **significant branches/flows** are covered with inline traceability comments:
    - `linesBeforeHasReq`:
      - Guard for missing/invalid `lines`/`startLine`.
      - Loop scanning lines in lookback window.
      - Branch detecting `@req` in raw source text.
    - `parentChainHasReq`:
      - Loop walking parent chain.
      - Branches checking `getCommentsBefore` and `leadingComments`.
    - `fallbackTextBeforeHasReq`:
      - Guard for missing `getText` / `range`.
      - Guard for malformed ranges.
      - Fallback window slice, detection of `@req`, and catch block that treats failures as “no annotation”.
    - `hasReqAnnotation`:
      - Try/catch with traceability on advanced heuristics, and final “BRANCH @req detection” comment for JSDoc/comments fallback.
    - `getFixTargetNode` and `reportMissing`:
      - Branches for selecting appropriate target nodes (no parent / method / variable declarator / expression statement).
      - Conditional attach of autofix option.
    - Exported `checkReqAnnotation`:
      - Branch for “missing @req” path, with `@story`/`@req` documenting both detection and reporting responsibilities.

  This file is now fully compliant (and previously largely was) with the traceability requirements for both function-level and key branch-level annotations.

---

### ##NEXT

#### 1) Scan other core helper and utility modules and add missing annotations

Focused on core helpers that underpin annotation and file validation:

1. **`src/utils/storyReferenceUtils.ts`**

   - This is the main story-file existence and path-resolution helper. It already had function-level JSDoc with `@story` and `@req`s for:
     - `StoryExistenceStatus`, `StoryPathCheckResult`, `StoryExistenceResult`
     - `ProjectBoundaryCheckResult`
     - `enforceProjectBoundary`
     - `__resetStoryExistenceCacheForTests`
     - `buildStoryCandidates`
     - `storyExists`, `normalizeStoryPath`
     - `isAbsolutePath`, `containsPathTraversal`, `isTraversalUnsafe`, `hasValidExtension`, `isUnsafeStoryPath`
   - I **added detailed branch-level traceability comments** to the key algorithms (see next section).

2. **`src/rules/helpers/require-story-io.ts`**

   - This file already had JSDoc on the three IO helpers (`linesBeforeHasStory`, `parentChainHasStory`, `fallbackTextBeforeHasStory`) and constants with `@story`/`@req`:
     - `LOOKBACK_LINES`, `FALLBACK_WINDOW`
   - I augmented branch-level comments inside these helpers.

3. **`src/rules/helpers/require-story-utils.ts`**

   - This file already had a rich file header and `@story`/`@req` tags for all helper functions.
   - I **refined the `@req` descriptions** for each internal helper function to be explicit about what part of `REQ-ANNOTATION-REQUIRED` they implement.

4. **Other helpers/utilities that were reviewed and already compliant:**

   - `src/utils/branch-annotation-helpers.ts`  
     (branch config/validation, comment gathering, and missing-annotation reporting)
   - `src/rules/helpers/require-story-core.ts`  
     (`createAddStoryFix`, `createMethodFix`, `DEFAULT_SCOPE`, `EXPORT_PRIORITY_VALUES`, reporting helpers)
   - `src/rules/helpers/require-story-helpers.ts`  
     (export-scope logic, multiple detection heuristics, reporting helpers, explicit exports)
   - `src/rules/helpers/require-story-visitors.ts`  
     (visitor builders for function-like nodes, with per-visitor and per-handler annotations)
   - `src/maintenance/*.ts`  
     (maintenance tools for annotation updates/detection/reporting already had function-level and key branch-level traceability comments.)

   No additional annotations were needed in those files beyond what’s already present.

#### 2) Add branch-level annotations for key conditionals / loops / try/catch

**In `src/utils/storyReferenceUtils.ts`:**

- **`buildStoryCandidates`**
  - Added branch-level comments for the core resolution strategy:
    - Before the relative-path branch:
      - Explains that explicitly relative paths are resolved only against `cwd`.
      - Tagged with:
        - `@story docs/stories/006.0-DEV-FILE-VALIDATION.story.md`
        - `@req REQ-PATH-RESOLUTION - Preserve explicit relative story path semantics when building candidate locations`
    - Before the first `candidates.push(path.resolve(cwd, storyPath));` in the `else`:
      - Explains direct resolution under `cwd` for bare paths.
      - Tagged with REQ-PATH-RESOLUTION.
    - Before the `for (const dir of storyDirs)` loop:
      - Documents probing configured story directories.
      - Tagged with REQ-PATH-RESOLUTION.

- **`checkSingleCandidate`**
  - After the cache lookup, before `if (cached)`:
    - Notes reuse of cached results to avoid repeated disk IO.
    - Tagged with:
      - `@req REQ-PERFORMANCE-OPTIMIZATION - Short-circuit on cached existence checks`
  - Before `if (!exists)`:
    - Explains recording a “missing” status when a path does not exist.
    - Tagged with `@req REQ-FILE-EXISTENCE`.
  - Before `if (stat.isFile())`:
    - Explains treating only regular files as valid story candidates.
    - Tagged with `@req REQ-FILE-EXISTENCE`.
  - Replaced the generic comment in the `catch (error)` with:
    - Multi-line comment explaining that filesystem errors are surfaced as `"fs-error"` instead of throwing.
    - Tagged with:
      - `@req REQ-ERROR-HANDLING - Represent filesystem failures as fs-error results while keeping callers resilient`.

- **`getStoryExistence`**
  - Before `if (res.status === "exists")`:
    - Explains early return when any candidate is confirmed to exist.
    - Tagged with `@req REQ-FILE-EXISTENCE`.
  - Before `if (res.status === "fs-error" && !firstFsError)`:
    - Explains capturing the first representative filesystem error.
    - Tagged with `@req REQ-ERROR-HANDLING`.
  - Before `if (firstFsError)` at the end:
    - Explains preferring fs-error over a generic missing result when there was an IO failure.
    - Tagged with `@req REQ-ERROR-HANDLING`.

**In `src/rules/helpers/require-story-io.ts`:**

- **`linesBeforeHasStory`**
  - Before the guard:
    - Comments that we fail gracefully when lines/startLine are invalid.
    - Tagged with `@req REQ-ANNOTATION-REQUIRED`.
  - Before the loop:
    - Describes scanning the configured lookback window for `@story`.
    - Tagged with `@req REQ-ANNOTATION-REQUIRED`.
  - Inside the loop, before `if (typeof text === "string" && text.includes("@story"))`:
    - Notes that any line containing `@story` proves the function is already annotated.
    - Tagged with `@req REQ-ANNOTATION-REQUIRED`.

- **`fallbackTextBeforeHasStory`**
  - Before the initial guard:
    - Explains skipping fallback scanning when `getText` or `range` metadata is not usable.
    - Tagged with `@req REQ-ANNOTATION-REQUIRED`.
  - Before the `range`-shape guard:
    - Explains guarding against malformed ranges.
    - Tagged with `@req REQ-ANNOTATION-REQUIRED`.
  - Inside `try`:
    - Before `const start = ...`:
      - Describes limiting the fallback window to a bounded region.
    - Before checking `textBefore.includes("@story")`:
      - Describes detection of `@story` markers in that window.
    - Both tagged with `@req REQ-ANNOTATION-REQUIRED`.
  - In the `catch`:
    - Replaced `/* noop */` with a structured comment explaining:
      - We swallow low-level IO/slicing errors so linting never breaks.
      - Tagged with `@req REQ-ANNOTATION-REQUIRED`.

These changes ensure the **key control-flow paths** in the IO and story-path helpers are explicitly traced to the relevant stories/requirements.

#### 3) Enhance JSDoc on key helper utilities

**In `src/rules/helpers/require-story-utils.ts`:**

- Strengthened the `@req` descriptions in the JSDoc for each helper to clearly state *what aspect* of `REQ-ANNOTATION-REQUIRED` they fulfill:

  - `isIdentifierLike`  
    → `Recognize Identifier/JSXIdentifier nodes and return their name`
  - `literalToString`  
    → `Convert simple Literal nodes into stable string names when possible`
  - `templateLiteralToString`  
    → `Support simple, expression-free TemplateLiteral names for reporting`
  - `memberExpressionName`  
    → `Resolve non-computed member-like nodes into property names when safe`
  - `propertyKeyName`  
    → `Extract key names from Property/ObjectProperty nodes used in function containers`
  - `directName`  
    → `Prefer direct id/key names before falling back to deeper AST inspection`
  - `getNodeName` (exported helper used by rules)  
    → `Provide a unified way to obtain a stable, human-readable name from AST nodes`

- These enhancements make the **API surface of `getNodeName` and its helpers** more self-documenting for future traceability alignment, while retaining the existing `@param`/`@returns` structure.

Other exported helpers like `checkReqAnnotation`, `enforceProjectBoundary`, and the branch maintenance utilities already had good JSDoc, including parameter/return descriptions where needed, so no additional changes were required there for this pass.

---

## Quality checks and CI / CD

After making the changes, I ran the following:

- **Targeted checks** while iterating:
  - `npm test -- --runTestsByPath tests/utils/annotation-checker.test.ts`
  - `npm run lint -- src/utils/annotation-checker.ts src/utils/storyReferenceUtils.ts src/rules/helpers/require-story-io.ts`
  - `npm run lint -- src/rules/helpers/require-story-utils.ts src/utils/storyReferenceUtils.ts src/rules/helpers/require-story-io.ts`

- **Full pre-push quality gates:**
  - `npm run type-check`
  - `npm run build`
  - `npm run lint`
  - `npm test`
  - `npm run format:check`
  - `npm run duplication -- --silent`

All of these passed successfully (duplication reports some clones in tests but under the configured threshold).

Then:

- Committed in small increments with Conventional Commit messages:
  - `chore: refine traceability comments in core annotation utilities`
  - `chore: enhance traceability descriptions in helper utilities`
- Pushed to `main` using the automated `git_push` tool, which in this repository automatically ran the **full CI-equivalent pipeline** (`ci-verify:full`), including:
  - traceability checks
  - safety/audit checks
  - build, type-check
  - lint and plugin-guard checks
  - duplication
  - full Jest test suite with coverage
  - format checks
  - npm audit + dev-deps audit

The CI-equivalent pre-push run completed successfully, so the pipeline for the latest commit is **green**.

---

## Updated Plan

### NOW

- [x] Review the annotation-checking utility module and add missing @story and @req annotations to every named helper function and any obvious significant branches so that this core file fully complies with the traceability format requirements.

### NEXT

- [x] Scan other core helper and utility modules for any remaining named functions that lack @story and @req annotations, and add concise, accurate traceability comments referencing the appropriate stories and requirements.
- [x] Review conditional branches, loops, and try/catch blocks across the main rule helper and utility files to identify significant logic paths that still lack branch-level @story and @req comments, and add those annotations where needed.
- [x] Enhance the JSDoc on key exported helper functions by adding clear @param and @returns descriptions where they are currently missing, focusing on utilities that are part of the public or semi-public API surface so their behavior is fully documented.

### LATER

- [ ] Once traceability annotations and JSDoc improvements are in place, reassess overall documentation quality against the project’s stories and traceability rules to confirm it reaches the threshold needed to support a reliable functionality assessment.
- [ ] If that reassessment reveals any residual documentation inconsistencies or redundancies (for example, overlapping explanations of particular rules or presets), plan and implement a small follow-up cleanup pass to simplify and align user-facing and internal docs without changing behavior.
```
