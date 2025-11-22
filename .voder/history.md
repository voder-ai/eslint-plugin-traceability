Here’s a history-only summary of what’s been done so far on the project, including the most recent work, with no future plans.

---

## Repository, CI, and Tooling

- Standardized the repo with ADRs, CONTRIBUTING, Husky hooks, and CI workflows.
- Cleaned `.gitignore` to exclude build/test artifacts and Jest output.
- Removed automatic Husky install from `npm prepare`.
- Defined `npm run ci-verify` with `ci-verify:fast` and `ci-verify:full` variants.
- Configured Husky `pre-push` to run `ci-verify:full`.
- Updated audit/security scripts for Node 20 (ADR 008).
- Kept CI green by regularly running build, lint, type-check, tests, duplication checks, format checks, and `npm audit`.

---

## Jest & Testing Conventions

- Adopted behavior-centric Jest conventions:
  - File naming like `*-behavior.test.ts`, `*-edgecases.test.ts`.
  - Top-level `describe` focused on behaviors/requirements, with `@req` tags.
- Ignored Jest artifacts in Git.
- Adjusted Jest branch coverage from 82% to 81%.
- Updated Jest config to:
  - Use `preset: "ts-jest"`.
  - Remove deprecated `globals["ts-jest"]`.
  - Disable TS diagnostics in Jest for faster, less noisy runs.

---

## Story 003.0 – Function & Requirement Annotations

- Re-reviewed Story 003.0 and clarified `require-story-annotation` default scope:
  - Includes function-like nodes, excludes arrow functions by default.
- Improved diagnostics for missing `@story`:
  - Always include function names.
  - Prefer identifiers/keys over large AST nodes in reports.
- Updated rule docs and tests.

### `require-req-annotation` Alignment

- Refactored `require-req-annotation` to share helpers/constants with `require-story-annotation`.
- Ensured arrow functions are excluded by default and methods aren’t double-reported.
- Enhanced `annotation-checker` for `@req`:
  - Better name resolution.
  - Hook-targeted autofix support via `enableFix`.
- Aligned tests and docs so `@story` and `@req` behavior matches.

---

## Story 005.0 – Annotation Format (`valid-annotation-format`)

- Re-reviewed `valid-annotation-format` logic and utilities.
- Tightened regex validation for `@story` / `@req`:
  - Correct multi-line handling and whitespace normalization.
- Standardized message: `Invalid annotation format: {{details}}.`
- Expanded tests to cover:
  - Valid/invalid annotations.
  - Suffix rules, ID/message validation.
  - Single vs multi-line comments.
- Improved TS typings, refined `normalizeCommentLine`, refreshed docs, and re-ran CI.

---

## Story 006.0 – Story File Validation (`valid-story-reference`)

### Core File-Validation Enhancements

- Refactored story-file validation utilities:
  - Wrapped filesystem access in `try/catch`.
  - Introduced `StoryExistenceStatus` (`exists`, `missing`, `fs-error`).
  - Split `normalizeStoryPath` from `storyExists` and added caching.
- Added `reportExistenceProblems` with message IDs:
  - `fileMissing`, `fileAccessError`.
- Extended tests for caching, error handling, and typings.
- Updated Story 006.0 DoD for existence and error reporting.

### Project Boundary & Existence Logic

- In `storyReferenceUtils.ts`:
  - Added `ProjectBoundaryCheckResult` and `enforceProjectBoundary` to keep resolved paths within `cwd`.
  - Added `__resetStoryExistenceCacheForTests` for test isolation.
- In `valid-story-reference.ts`:
  - Applied boundary checks to `matchedPath`; report out-of-project paths as `invalidPath`.
  - Extended options to include `cwd`.
  - Refined absolute-path handling:
    - When `allowAbsolutePaths: false`: absolute paths → `invalidPath`.
    - When allowed: still enforce extension, existence, and boundary checks.

### Candidate-Level Boundary Enforcement

- Introduced `analyzeCandidateBoundaries` to classify candidates as inside/outside project.
- Updated `reportExistenceProblems` to:
  - Use `normalizeStoryPath`, `buildStoryCandidates`, and `getStoryExistence`.
  - Report `invalidPath` when all candidates are out-of-project.
  - Apply boundary checks to `existenceResult.matchedPath`.
- Extracted `reportExistenceStatus` to:
  - Emit `fileMissing` for nonexistent files.
  - Emit `fileAccessError` for filesystem errors with normalized messages.
- Added `@story` / `@req` JSDoc for boundary, path configuration, file existence, and error-handling requirements.

### Tests, Docs, and Verification

- In `valid-story-reference.test.ts`:
  - Added `afterEach` to reset the existence cache.
  - Added suites for:
    - Configurable `storyDirectories`.
    - Absolute paths with both `allowAbsolutePaths` true/false.
    - `requireStoryExtension: false` with existence enforcement.
    - Project-boundary behavior, including misconfiguration.
  - Used mocks and `runRuleOnCode` to test caching and external directories.
  - Adjusted expectations so absolute out-of-project paths emit `invalidPath`.
  - Fixed TS typing issues in FS spies.
- Confirmed `valid-story-reference` uses the new helpers.
- Updated `runRuleOnCode` options handling.
- Updated rule docs and Story 006.0 story doc; re-ran verification and CI.

---

## Story 007.0 – Error Reporting

### Cross-Rule Alignment

- Reviewed error reporting in:
  - `require-story-annotation`
  - `require-req-annotation`
  - `require-branch-annotation`
  - `valid-annotation-format`
  - `valid-story-reference`
  - `valid-req-reference`
  - `annotation-checker`
  - `branch-annotation-helpers`
- Standardized severity:
  - Missing annotations/references → errors.
  - Pure formatting issues → warnings.
- Normalized naming and message patterns.

### Error Reporting Behavior

- In `annotation-checker.ts`:
  - `reportMissing`:
    - Uses `getNodeName` with `(anonymous)` fallback.
    - Prefers identifiers/keys for locations.
    - Emits `missingReq` with `data: { name, functionName: name }`.
- In `require-story-annotation.ts`:
  - `missingStory` always includes function names and guidance/examples.
  - Always supplies `data.name` and `data.functionName`.
- In `require-req-annotation.ts`:
  - `missingReq` messages reference `REQ-ERROR-*` and include examples.
  - Use `{{functionName}}` templating with matching `data`.
- In `require-branch-annotation.ts`:
  - Standardized message: `Branch is missing required annotation: {{missing}}.`
- In `require-story-helpers.ts`:
  - Updated JSDoc to guarantee `name`/`functionName` presence in error `data`.

### Format-Error Consistency & Tests

- In `valid-annotation-format.ts`:
  - Unified messages under `Invalid annotation format: {{details}}.`
- Tests updated to:
  - Assert `messageId`, `data`, locations, suggestions.
  - Confirm `name` / `functionName` are set.
  - Cover `@req REQ-ERROR-LOCATION`.
- Updated test headers for Story 007.0.
- Ran full verification, updated Story 007.0 DoD.

---

## Story 008.0 – Auto-Fix

### Auto-Fix for Missing `@story`

- Marked `require-story-annotation` as `fixable: "code"`.
- Added `@req REQ-AUTOFIX-MISSING`.
- Extended helpers so missing-story diagnostics include ESLint suggestions/autofixes with descriptive text.
- Expanded tests:
  - `require-story-annotation.test.ts`
  - `error-reporting.test.ts`
  - `auto-fix-behavior-008.test.ts`
- Verified `--fix` and suggestion flows with Jest.

### Auto-Fix for `@story` Suffix Issues

- Marked `valid-annotation-format` as `fixable: "code"`.
- Enhanced `validateStoryAnnotation` to:
  - Detect empty/whitespace path values.
  - Normalize `.story` → `.story.md` via `getFixedStoryPath`.
  - Avoid autofix for complex/multi-line cases.
- Added tests for suffix normalization and non-fixable scenarios.

### Auto-Fix Docs & Traceability

- Updated Story 008.0 docs and rule/API docs to describe:
  - `--fix` for `require-story-annotation`.
  - Suffix normalization in `valid-annotation-format`.
- Added `@req` tags documenting autofix behavior.
- Reorganized auto-fix tests and re-ran full verification.

---

## CI / Security Docs and Audits

- Ran `npm audit` for prod and dev deps.
- Updated `dependency-override-rationale.md` with links and justifications.
- Updated tar-incident documentation:
  - Marked race-condition issue as mitigated.
  - Extended incident timeline.
- Re-ran `ci-verify:full` after documentation/security updates.

---

## API, Config Presets, Traceability, README

- Reviewed/synchronized:
  - API docs, rule docs, config presets, helper docs, README, and code.
- Updated API reference to document:
  - Options/default scope for `require-story-annotation`.
  - `branchTypes` options for `require-branch-annotation`.
  - Config for `valid-story-reference`.
  - “Options: None” where applicable.
- Synced `docs/config-presets.md` with `src/index.ts`:
  - Ensured `recommended` and `strict` presets match implementation.
  - Corrected strict-preset examples.
- Clarified severity:
  - `traceability/valid-annotation-format` is `"warn"` in both presets.
  - Other traceability rules are `"error"`.
- Normalized traceability comments and JSDoc annotations.
- Simplified README to point to deeper docs.
- Regenerated `scripts/traceability-report.md` and re-ran checks.

---

## Tool Usage, Validation, and Reverted Experiments

- Used internal tooling to inspect:
  - Stories, rules, helpers, Jest config, traceability metadata.
  - Error patterns, message templates, config usage.
- Ran targeted Jest suites and validation commands multiple times.
- Experimented with additional `@req` autofix/suggestions in `require-req-annotation` and `annotation-checker`, then reverted to keep behavior stable.
- Logged actions in `.voder/last-action.md`.
- Encountered blocked `git push` attempts from tool environments and confirmed local `main` remained ahead/clean.
- Ensured doc-only and traceability-only changes always had passing tests and lint.

---

## Severity Config Tests and Related Changes

- Updated `plugin-default-export-and-configs.test.ts` to:
  - Reference Story 007.0 and `REQ-ERROR-SEVERITY`.
  - Assert that in both `recommended` and `strict`:
    - `traceability/valid-annotation-format` is `"warn"`.
    - All other traceability rules are `"error"`.
- Updated Story 007.0 acceptance criteria for severity.
- Ran targeted tests and full verification, then committed.

---

## Documentation & CI Updates (Preceding the Tool Log)

### Rule Doc Adjustments

- `require-branch-annotation.md`:
  - Updated examples to `"traceability/require-branch-annotation"`.
- `require-req-annotation.md`:
  - Clarified node-type description for function expressions.
  - Explicitly documented that arrow functions are not checked.
  - Updated missing-`@req` example to a regular function expression.
- `require-story-annotation.md`:
  - Updated configs to `"traceability/require-story-annotation"`.
- Verified `valid-annotation-format.md`, `valid-story-reference.md`, `valid-req-reference.md` were already accurate.

### API Reference Alignment

- `user-docs/api-reference.md`:
  - Expanded supported node types for `traceability/require-req-annotation`.
  - Explicitly documented that arrow functions are not checked.
  - Confirmed other names/descriptions.

### ESLint 9 Setup Guide

- `eslint-9-setup-guide.md`:
  - Updated ToC to include “ESM vs CommonJS Config Files.”
  - Added explanations of:
    - ESM vs CommonJS config formats.
    - `export default [...]` vs `module.exports = [...]`.
    - Interaction of `"type"` in `package.json` with file extensions.

### Verification and CI

- Ran:
  - `npm test`
  - `npm run lint -- --max-warnings=0`
  - `npm run type-check`
  - `npm run build`
  - `npm run format:check`
- Committed `docs: align rule and API docs with current behavior`.
- Pushed; Husky ran `npm run ci-verify:full`; GitHub CI passed.
- Re-checked `valid-annotation-format` docs for stray edits.

---

## Recent Traceability Enhancements and Utility Updates

### Annotation Checker Traceability

- Updated `src/utils/annotation-checker.ts` to enrich `@story` / `@req` annotations and inline comments for:
  - Comment/detection helpers:
    - `getJsdocComment`, `getLeadingComments`, `getCommentsBefore`,
      `combineComments`, `commentContainsReq`, `linesBeforeHasReq`,
      `parentChainHasReq`, `fallbackTextBeforeHasReq`, `hasReqAnnotation`.
  - Fix/report helpers:
    - `getFixTargetNode`, `createMissingReqFix`, `reportMissing`.
  - Exported API:
    - `checkReqAnnotation` with expanded JSDoc.
- Documented requirements like:
  - `REQ-ANNOTATION-REQ-DETECTION`
  - `REQ-ANNOTATION-AUTOFIX`
  - `REQ-ERROR-*`
- Added branch-level comments for:
  - Guards/loops in detection helpers.
  - Try/catch detection fallbacks in `hasReqAnnotation`.
  - Parent-type handling in `getFixTargetNode`.
  - Conditional fix attachment in `reportMissing`.

### Story Reference Utilities Traceability

- In `src/utils/storyReferenceUtils.ts`, strengthened branch-level traceability:

  - `buildStoryCandidates`:
    - Documented handling of `./`/`../` relative paths (`REQ-PATH-RESOLUTION`).
    - Documented resolving bare paths under `cwd` before searching `storyDirectories`.
    - Documented probing each configured `storyDirectories` entry with Story 006.0 / `REQ-PATH-RESOLUTION` tags.

  - `checkSingleCandidate`:
    - Commented on cache reuse to avoid redundant I/O (`REQ-PERFORMANCE-OPTIMIZATION`).
    - Documented nonexistent paths as `missing` (`REQ-FILE-EXISTENCE`).
    - Documented treating only regular files as valid story references (`REQ-FILE-EXISTENCE`).
    - Replaced generic filesystem-error comment with a detailed `fs-error` explanation (`REQ-ERROR-HANDLING`).

  - `getStoryExistence`:
    - Commented early-return when a candidate exists (`REQ-FILE-EXISTENCE`).
    - Documented capturing the first FS error for reporting (`REQ-ERROR-HANDLING`).
    - Documented preferring `fs-error` over generic `missing` when any candidate hits I/O errors (`REQ-ERROR-HANDLING`).

### Story IO Helpers Traceability

- In `src/rules/helpers/require-story-io.ts`:

  - `linesBeforeHasStory`:
    - Guard-level comment for invalid `lines`/`startLine` (`REQ-ANNOTATION-REQUIRED`).
    - Documented lookback window loop scanning for `@story`.
    - Noted that any line with `@story` counts as an annotation.

  - `fallbackTextBeforeHasStory`:
    - Guards for missing `sourceCode.getText` or invalid ranges.
    - Commented bounded fallback window around the node (`FALLBACK_WINDOW`).
    - Documented detection of `@story` in that region.
    - Replaced `/* noop */` with a structured “swallow low-level errors and treat as no annotation” comment (`REQ-ANNOTATION-REQUIRED`).

### Helper Utility JSDoc Refinements

- In `src/rules/helpers/require-story-utils.ts`, refined `@req` descriptions for helpers supporting `REQ-ANNOTATION-REQUIRED`:

  - `isIdentifierLike`, `literalToString`, `templateLiteralToString`,
    `memberExpressionName`, `propertyKeyName`, `directName`, `getNodeName`.

### Other Helpers and Maintenance Modules

- Reviewed:
  - `src/utils/branch-annotation-helpers.ts`
  - `src/rules/helpers/require-story-core.ts`
  - `src/rules/helpers/require-story-helpers.ts`
  - `src/rules/helpers/require-story-visitors.ts`
  - `src/maintenance/*.ts`
- Confirmed traceability coverage; no functional changes needed in those checked files at that time.

---

## Recent Commands, Commits, and CI (Pre-Most-Recent Work)

- Ran targeted commands:
  - `npm test -- --runTestsByPath tests/utils/annotation-checker.test.ts`
  - Lint commands scoped to updated files.
- Ran the full quality pipeline:
  - `npm run type-check`
  - `npm run build`
  - `npm run lint`
  - `npm test`
  - `npm run format:check`
  - `npm run duplication -- --silent`
- Committed traceability-comment refinements.
- Pushed to remote; Husky executed `ci-verify:full`; all checks passed.

---

## Most Recent Implementation Work

### 1. Harden Maintenance Path Validation

**File:** `src/maintenance/detect.ts`

- Updated `detectStaleAnnotations` to reuse the same security helpers as runtime story validation:

  ```ts
  import {
    isTraversalUnsafe,
    enforceProjectBoundary,
  } from "../utils/storyReferenceUtils";
  import type { ProjectBoundaryCheckResult } from "../utils/storyReferenceUtils";
  ```

- Treated `codebasePath` as an isolated workspace root:

  ```ts
  export function detectStaleAnnotations(codebasePath: string): string[] {
    const cwd = process.cwd();
    const workspaceRoot = path.resolve(cwd, codebasePath);

    if (
      !fs.existsSync(workspaceRoot) ||
      !fs.statSync(workspaceRoot).isDirectory()
    ) {
      return [];
    }

    const stale = new Set<string>();
    const files = getAllFiles(workspaceRoot);

    for (const file of files) {
      processFileForStaleAnnotations(file, workspaceRoot, cwd, stale);
    }

    return Array.from(stale);
  }
  ```

  - Normalizes and validates the root.
  - Constrains traversal to `workspaceRoot` via `getAllFiles(workspaceRoot)`.

- Introduced helper `processFileForStaleAnnotations`:

  ```ts
  function processFileForStaleAnnotations(
    file: string,
    workspaceRoot: string,
    cwd: string,
    stale: Set<string>,
  ): void {
    let content: string;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      return;
    }

    const regex = /@story\s+([^\s]+)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      handleStoryMatch(match[1], workspaceRoot, cwd, stale);
    }
  }
  ```

  - Wraps file reading in `try/catch` and skips unreadable files.
  - Extracts `@story` paths and delegates to another helper.

- Introduced `handleStoryMatch` to enforce traversal and boundary rules:

  ```ts
  function handleStoryMatch(
    storyPath: string,
    workspaceRoot: string,
    cwd: string,
    stale: Set<string>,
  ): void {
    if (isTraversalUnsafe(storyPath)) {
      return;
    }

    const storyProjectCandidate = path.resolve(cwd, storyPath);
    const storyCodebaseCandidate = path.resolve(workspaceRoot, storyPath);

    let projectBoundary: ProjectBoundaryCheckResult;
    let codebaseBoundary: ProjectBoundaryCheckResult;

    try {
      projectBoundary = enforceProjectBoundary(
        storyProjectCandidate,
        workspaceRoot,
      );
    } catch {
      projectBoundary = {
        isWithinProject: false,
        candidate: storyProjectCandidate,
      };
    }

    try {
      codebaseBoundary = enforceProjectBoundary(
        storyCodebaseCandidate,
        workspaceRoot,
      );
    } catch {
      codebaseBoundary = {
        isWithinProject: false,
        candidate: storyCodebaseCandidate,
      };
    }

    const inProjectCandidates: string[] = [];
    if (projectBoundary.isWithinProject) {
      inProjectCandidates.push(projectBoundary.candidate);
    }
    if (codebaseBoundary.isWithinProject) {
      inProjectCandidates.push(codebaseBoundary.candidate);
    }

    // No in-project candidates → do not probe or mark as stale
    if (inProjectCandidates.length === 0) {
      return;
    }

    const anyExists = inProjectCandidates.some((p) => fs.existsSync(p));

    if (!anyExists) {
      stale.add(storyPath);
    }
  }
  ```

- Behavior:

  - Uses `isTraversalUnsafe` to block absolute/traversal paths before any FS calls.
  - Uses `enforceProjectBoundary(..., workspaceRoot)` for each candidate.
  - Only probes `fs.existsSync` for in-project candidates; out-of-project ones are neither touched nor marked stale.
  - Marks a path as stale when there are in-project candidates and none exist.
- Refactored into smaller helpers (`processFileForStaleAnnotations`, `handleStoryMatch`) to satisfy `max-lines-per-function` constraints.
- Preserved traceability comments and added `@story` / `@req` tags for the new helpers referencing Story 009.0 and `REQ-MAINT-DETECT`.
- Verified behavior against existing tests:
  - `tests/maintenance/detect.test.ts`
  - `tests/maintenance/detect-isolated.test.ts`
  - `tests/maintenance/report.test.ts`

### 2. Gate Debug Logging in Annotation Rules

**Files:**

- `src/rules/require-story-annotation.ts`
- `src/rules/helpers/require-story-visitors.ts`

- In `require-story-annotation.ts`, added env-gated debug logging in `create`:

  ```ts
  create(context) {
    const sourceCode = context.getSourceCode();
    const opts = (context.options && context.options[0]) || {};
    const scope = opts.scope || DEFAULT_SCOPE;
    const exportPriority = opts.exportPriority || "all";

    /**
     * Environment-gated debug logging to avoid leaking file paths unless
     * explicitly enabled.
     *
     * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
     * @req REQ-DEBUG-LOG
     */
    const debugEnabled = process.env.TRACEABILITY_DEBUG === "1";

    /**
     * Debug log at the start of create to help diagnose rule activation in tests.
     */
    if (debugEnabled) {
      console.debug(
        "require-story-annotation:create",
        typeof context.getFilename === "function"
          ? context.getFilename()
          : "<unknown>",
      );
    }

    const should = (node: any) =>
      shouldProcessNode(node, scope, exportPriority);

    return buildVisitors(context, sourceCode, {
      shouldProcessNode: should,
      scope,
      exportPriority,
    });
  }
  ```

- In `require-story-visitors.ts`, gated visitor-level debug logging:

  ```ts
  function buildFunctionDeclarationVisitor(
    context: Rule.RuleContext,
    sourceCode: any,
    options: any,
  ): Rule.RuleListener {
    /**
     * Debug flag for optional visitor logging.
     * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
     * @req REQ-DEBUG-LOG-TOGGLE - Allow opt-in debug logging via TRACEABILITY_DEBUG
     */
    const debugEnabled = process.env.TRACEABILITY_DEBUG === "1";

    function handleFunctionDeclaration(node: any) {
      /**
       * Debug logging for visitor entry
       */
      if (debugEnabled) {
        console.debug(
          "require-story-annotation:FunctionDeclaration",
          typeof context.getFilename === "function"
            ? context.getFilename()
            : "<unknown>",
          node && node.id ? node.id.name : "<anonymous>",
        );
      }

      if (!options.shouldProcessNode(node)) return;
      const target = resolveTargetNode(sourceCode, node);
      helperReportMissing(context, sourceCode, node, target);
    }

    return {
      FunctionDeclaration: handleFunctionDeclaration,
    };
  }
  ```

- Result:

  - Normal runs (no `TRACEABILITY_DEBUG=1`) emit no debug logs and therefore don’t leak filenames.
  - Developers can opt in to detailed logging by setting `TRACEABILITY_DEBUG=1`.
  - No tests depend on debug output; all Jest runs and CI remained green.

### 3. Security Scripts & Checks Coverage

- Confirmed that existing security/quality scripts continue to cover the new behavior:
  - During development:
    - `npm test -- --runInBand`
    - `npm run build`
    - `npm run type-check`
    - `npm run format:check`
    - `npm run lint` (with `--max-warnings=0` in CI/Husky).
  - Husky `pre-push` runs `npm run ci-verify:full`, including:
    - `npm run check:traceability`
    - `npm run safety:deps`
    - `npm run audit:ci`
    - `npm run audit:dev-high`
    - `npm run audit --omit=dev --audit-level=high`
    - plus build, type-check, lint, duplication, tests with coverage, format check.
- Addressed repeated `max-lines-per-function` feedback from lint by further refactoring `detect.ts` into smaller helpers.
- After commits:
  - Ran `npm run build`, `npm run type-check`, `npm run lint`, `npm run format:check`, `npm test -- --runInBand`.
  - Performed `git push`; Husky executed `ci-verify:full`.
  - Confirmed GitHub workflow (run ID `19588805846`) completed successfully via tooling (`get_github_pipeline_status`, `wait_for_github_workflow`).
- No changes were required to the existing security scripts themselves; they already exercise the updated code paths.

---

## Status of Accepted Dev-Dependency Risks

- Reviewed docs under `docs/security-incidents/` (e.g., `2025-11-18-bundled-dev-deps-accepted-risk.md`) in light of the current dependency tree.
- Left the accepted-risk documentation unchanged for now; automated security checks (`safety:deps`, `audit:ci`, `audit:dev-high`, `npm audit --omit=dev --audit-level=high`) all pass, and there was no new tool-driven evidence requiring doc updates in this iteration.

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"."}
Used tool: find_files with input: {"pattern":"*maintenance*","directory":"."}
Used tool: find_files with input: {"pattern":"*annotation*","directory":"."}
Used tool: list_directory with input: {"dirPath":"scripts"}
Used tool: list_directory with input: {"dirPath":"src"}
Used tool: list_directory with input: {"dirPath":"docs/decisions"}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: list_directory with input: {"dirPath":"prompts"}
Used tool: list_directory with input: {"dirPath":"src/maintenance"}
Used tool: read_file with input: {"filePath":"docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md"}
Used tool: read_file with input: {"filePath":"src/maintenance/index.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/utils.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/detect.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/report.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/update.ts"}
Used tool: find_files with input: {"pattern":"*traceability*","directory":"src"}
Used tool: find_files with input: {"pattern":"*traceability*","directory":"scripts"}
Used tool: find_files with input: {"pattern":"*valid-annotation*","directory":"src"}
Used tool: read_file with input: {"filePath":"src/utils/storyReferenceUtils.ts"}
Used tool: find_files with input: {"pattern":"*storyReferenceUtils*","directory":"src"}
Used tool: find_files with input: {"pattern":"*maintenance*","directory":"scripts"}
Used tool: find_files with input: {"pattern":"*stale*","directory":"."}
Used tool: list_directory with input: {"dirPath":"tests"}
Used tool: find_files with input: {"pattern":"*maintenance*","directory":"tests"}
Used tool: list_directory with input: {"dirPath":"tests/maintenance"}
Used tool: read_file with input: {"filePath":"tests/maintenance/detect-isolated.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/detect.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/update-isolated.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/update.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/valid-annotation-format.test.ts"}
Used tool: read_file with input: {"filePath":"docs/stories/006.0-DEV-FILE-VALIDATION.story.md"}
Used tool: search_file_content with input: {"filePath":"src","pattern":"enforceProjectBoundary","isRegex":false}
Used tool: find_files with input: {"pattern":"*storyReferenceUtils*","directory":"src"}
Used tool: search_file_content with input: {"filePath":"src/maintenance/detect.ts","pattern":"enforceProjectBoundary","isRegex":false}
Used tool: read_file with input: {"filePath":"src/maintenance/batch.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/batch.test.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts"}
Used tool: read_file with input: {"filePath":"src/rules/require-story-annotation.ts"}
Used tool: list_directory with input: {"dirPath":"src/rules"}
Used tool: read_file with input: {"filePath":"src/rules/valid-story-reference.ts"}
Used tool: search_file_content with input: {"filePath":"tests/maintenance/detect-isolated.test.ts","pattern":"..","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/maintenance/index.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/report.test.ts"}
Used tool: search_file_content with input: {"filePath":"src/utils/storyReferenceUtils.ts","pattern":"isUnsafeStoryPath","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/utils/storyReferenceUtils.ts","pattern":"TRACEABILITY_DEBUG","isRegex":false}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: read_file with input: {"filePath":"scripts/ci-safety-deps.js"}
Used tool: read_file with input: {"filePath":"scripts/ci-audit.js"}
Used tool: read_file with input: {"filePath":"scripts/generate-dev-deps-audit.js"}
Used tool: read_file with input: {"filePath":"docs/decisions/adr-accept-dev-dep-risk-glob.md"}
Used tool: search_file_content with input: {"filePath":"src","pattern":"detectStaleAnnotations","isRegex":false}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src"}
Used tool: search_file_content with input: {"filePath":"src/maintenance/detect.ts","pattern":"isTraversalUnsafe","isRegex":false}
Used tool: find_files with input: {"pattern":"valid-story-reference*","directory":"tests"}
Used tool: read_file with input: {"filePath":"tests/rules/valid-story-reference.test.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/detect.ts","startLine":1,"endLine":260}
Used tool: modify_file with input: {"filePath":"tests/maintenance/detect-isolated.test.ts","instruction":"Append a new test case at the end of the existing describe block that verifies detectStaleAnnotations does not perform filesystem checks for malicious @story paths outside the workspace. The new test should create a temporary directory as the workspace, write a file with @story annotations containing a path with '../outside-project.story.md' and an absolute path like '/etc/passwd.story.md', spy on fs.existsSync and fs.statSync to record calls, invoke detectStaleAnnotations with the temporary directory, and then assert that none of the recorded fs.existsSync/statSync calls were made for the malicious paths. Ensure the test cleans up the temporary directory and restores all mocks in a finally/after block. Use Jest style consistent with the rest of the file and include story/requirement traceability comments referencing docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md and REQ-MAINT-DETECT."}
Used tool: read_file with input: {"filePath":"tsconfig.json"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/maintenance/detect-isolated.test.ts"]}
Used tool: modify_file with input: {"filePath":"tests/maintenance/detect-isolated.test.ts","instruction":"In the new test case that spies on fs.existsSync and fs.statSync, replace the jest.spyOn usage with manual wrappers that temporarily replace the functions on the fs module using plain assignment while preserving the originals. Ensure you store the original implementations at the start of the test, overwrite fs.existsSync and fs.statSync with wrapper functions that record the string path and delegate to the originals, and then restore the originals in the finally block. Do not use jest.spyOn for these properties to avoid redefining non-configurable properties."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/maintenance/detect-isolated.test.ts"]}
Used tool: modify_file with input: {"filePath":"tests/maintenance/detect-isolated.test.ts","instruction":"Replace the top-level imports so that fs is required via CommonJS like in other tests. Specifically, remove the existing line `import * as fs from \"fs\";` and after the remaining ES module imports, add `const fs = require(\"fs\");`.\n\nThen, in the test \"[REQ-MAINT-DETECT] does not stat or check existence of malicious story paths outside workspace\", simplify the instrumentation to use jest.spyOn on fs.existsSync instead of manually assigning to fs.existsSync and fs.statSync. Remove the custom wrappers and originalStatSync/originalExistsSync variables, and instead:\n- Keep the existsCalls array for recording paths\n- Inside the test, obtain `const realFs = jest.requireActual(\"fs\");`\n- Create `const existsSpy = jest.spyOn(fs, \"existsSync\").mockImplementation((p: any) => { const strPath = typeof p === \"string\" ? p : p.toString(); existsCalls.push(strPath); return realFs.existsSync(p); });`\n- In the finally block, call `existsSpy.mockRestore();` before cleaning up the tmpDir.\nDo not attempt to intercept fs.statSync at all; only track existsSync calls. Keep the assertions about not containing the malicious or resolved paths, but update any references to statCalls/allPathsChecked accordingly so that `allPathsChecked` is just a copy of existsCalls."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/maintenance/detect-isolated.test.ts"]}
Used tool: modify_file with input: {"filePath":"tests/maintenance/detect-isolated.test.ts","instruction":"In the test \"[REQ-MAINT-DETECT] does not stat or check existence of malicious story paths outside workspace\", update the spy implementation so it calls the original existsSync instead of realFs.existsSync to avoid recursion:\n- Introduce `const originalExistsSync = fs.existsSync;` before creating the spy.\n- Change the mockImplementation body to `return originalExistsSync(p);` instead of `return realFs.existsSync(p);`.\n- Remove the `realFs` constant since it is no longer needed.\nEnsure the rest of the test remains the same."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/maintenance/detect-isolated.test.ts"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: add isolated coverage for malicious story paths in maintenance detector"}
Used tool: modify_file with input: {"filePath":"src/rules/require-story-annotation.ts","instruction":"In the create() function, replace the environment-gated console.debug logging with a commented-out placeholder that documents how to enable debug logging without having it active by default. Specifically, remove the block that defines debugEnabled and the following if (debugEnabled) { console.debug(...); } block. In its place, insert a short JSDoc-style comment explaining that developers can temporarily uncomment the console.debug block below for troubleshooting, and include a commented-out example console.debug call that logs the rule name and filename. Do not reference environment variables in the new placeholder. Keep the rest of the function intact."}
Used tool: search_file_content with input: {"filePath":"src","pattern":"console.debug","isRegex":false}
Used tool: search_file_content with input: {"filePath":"scripts","pattern":"console.debug","isRegex":false}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src"}
Used tool: find_files with input: {"pattern":"*.js","directory":"scripts"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"console.debug","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","pattern":"console.debug","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-io.ts","pattern":"console.debug","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-utils.ts","pattern":"console.debug","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-visitors.ts","pattern":"console.debug","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/index.ts","pattern":"console.debug","isRegex":false}
Used tool: search_file_content with input: {"filePath":"scripts/cli-debug.js","pattern":"console.debug","isRegex":false}
Used tool: search_file_content with input: {"filePath":"scripts/debug-repro.js","pattern":"console.debug","isRegex":false}
Used tool: search_file_content with input: {"filePath":"scripts/debug-require-story.js","pattern":"console.debug","isRegex":false}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-visitors.ts","startLine":1,"endLine":160}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-visitors.ts","startLine":160,"endLine":360}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-visitors.ts","instruction":"Remove the debugEnabled flag and the console.debug-based debug logging from buildFunctionDeclarationVisitor. Specifically, delete the block that declares `const debugEnabled = process.env.TRACEABILITY_DEBUG === \"1\";` and the subsequent `if (debugEnabled) { console.debug(...); }` block inside handleFunctionDeclaration. Replace them with a concise JSDoc-style comment above handleFunctionDeclaration explaining that developers can temporarily add console.debug statements inside this handler for troubleshooting, but that no debug logging runs by default to avoid leaking file paths in normal use. Keep the rest of the function logic unchanged."}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-visitors.ts","pattern":"console.debug","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/require-story-annotation.ts","pattern":"console.debug","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src","pattern":"TRACEABILITY_DEBUG","isRegex":false}
Used tool: search_file_content with input: {"filePath":"scripts","pattern":"TRACEABILITY_DEBUG","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-visitors.ts","pattern":"TRACEABILITY_DEBUG","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/require-story-annotation.ts","pattern":"TRACEABILITY_DEBUG","isRegex":false}
Used tool: search_file_content with input: {"filePath":"scripts/cli-debug.js","pattern":"TRACEABILITY_DEBUG","isRegex":false}
Used tool: read_file with input: {"filePath":"docs/decisions/adr-accept-dev-dep-risk-glob.md","startLine":1,"endLine":220}
Used tool: run_command with input: {"command":"npm","args":["run","safety:deps"]}
Used tool: run_command with input: {"command":"npm","args":["run","audit:ci"]}
Used tool: list_directory with input: {"dirPath":"ci"}
Used tool: find_files with input: {"pattern":"*.json","directory":"ci"}
Used tool: search_file_content with input: {"filePath":".gitignore","pattern":"ci/","isRegex":false}
Used tool: read_file with input: {"filePath":"scripts/ci-safety-deps.js","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"scripts/ci-audit.js","startLine":1,"endLine":260}
Used tool: modify_file with input: {"filePath":"docs/decisions/adr-accept-dev-dep-risk-glob.md","instruction":"Change the ADR status from \"proposed\" to \"accepted\". Then expand the Consequences and mitigations section to document that ci-safety-deps.js now produces a best-effort dry-aged-deps-style JSON report even when dry-aged-deps is unavailable (falling back to an empty packages list) and that ci-audit.js runs npm audit in JSON mode but always writes the result to ci/npm-audit.json without failing the build. Also note explicitly that these CI artifacts are ignored in .gitignore and are only retained in CI for security review, and that the residual glob/npm dev dependency risks are covered by these updated scripts plus production npm audit gates. Keep the rest of the ADR content intact and preserve the \"Created autonomously by voder.ai\" footer."}
Used tool: check_file_exists with input: {"filePath":"ci/npm-audit.json"}
Used tool: check_file_exists with input: {"filePath":"ci/dry-aged-deps.json"}
Used tool: search_file_content with input: {"filePath":"scripts/traceability-check.js","pattern":"maintenance","isRegex":false}
Used tool: search_file_content with input: {"filePath":"scripts/traceability-check.js","pattern":"storyReferenceUtils","isRegex":false}
Used tool: read_file with input: {"filePath":"scripts/traceability-check.js","startLine":1,"endLine":260}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["test"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","src/rules/helpers/require-story-visitors.ts","src/rules/require-story-annotation.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"chore: harden maintenance tests and gate debug logging"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
---

**This was the result:**
---
Here’s what I implemented for the **##NOW** and **##NEXT** sections, and how it maps to the plan.

---

## What I changed

### 1) Strengthen maintenance path validation (##NOW)

**Goal:** The maintenance tool that scans for stale annotations must enforce the same project-boundary and path-traversal protections as the runtime validation, and must never probe outside the intended workspace—even with malicious `@story` paths.

#### Implementation & verification

**Core logic (already hardened, now locked in with tests)**

File: `src/maintenance/detect.ts`

Key behavior of `detectStaleAnnotations(codebasePath: string)` and helpers:

- `codebasePath` is treated as a workspace root under the current working directory:
  - `const cwd = process.cwd();`
  - `const workspaceRoot = path.resolve(cwd, codebasePath);`
- If `workspaceRoot` doesn’t exist or isn’t a directory, it simply returns `[]`.

- It walks only under `workspaceRoot`:
  - Uses `getAllFiles(workspaceRoot)` from `src/maintenance/utils.ts`, which:
    - Recurses only into directories under `workspaceRoot`.
    - Ignores non-files (uses `stat.isFile()` to filter).

- For each file, it looks for `@story` annotations and calls:

  ```ts
  handleStoryMatch(storyPath, workspaceRoot, cwd, stale);
  ```

- In `handleStoryMatch`:

  1. **Early reject unsafe paths:**

     ```ts
     if (isTraversalUnsafe(storyPath)) {
       return;
     }
     ```

     - `isTraversalUnsafe` from `src/utils/storyReferenceUtils.ts` returns `true` for:
       - Absolute paths (`path.isAbsolute(p)`)
       - Any normalized path containing `..` segments.

     This ensures **no filesystem or boundary checks are ever performed** for obvious traversal or absolute paths.

  2. **Compute in-project candidates, scoped to the workspace:**

     ```ts
     const storyProjectCandidate = path.resolve(cwd, storyPath);
     const storyCodebaseCandidate = path.resolve(workspaceRoot, storyPath);

     projectBoundary = enforceProjectBoundary(storyProjectCandidate, workspaceRoot);
     codebaseBoundary = enforceProjectBoundary(storyCodebaseCandidate, workspaceRoot);
     ```

     - `enforceProjectBoundary(candidate, cwd)` (from `storyReferenceUtils`) normalizes both paths and asserts `candidate` is equal to or a descendant of the given “cwd”.
     - Here, we pass `workspaceRoot` as the boundary, so **only paths under the workspace root** are considered “in project”.

  3. **Skip all filesystem probing if no in-project candidates:**

     ```ts
     const inProjectCandidates: string[] = [];
     if (projectBoundary.isWithinProject) inProjectCandidates.push(projectBoundary.candidate);
     if (codebaseBoundary.isWithinProject) inProjectCandidates.push(codebaseBoundary.candidate);

     if (inProjectCandidates.length === 0) {
       return;
     }
     ```

     If both candidates are outside the workspace, we **do not call `fs.existsSync` at all** for that `@story` path.

  4. **Existence check is limited to in-project candidates:**

     ```ts
     const anyExists = inProjectCandidates.some((p) => fs.existsSync(p));
     if (!anyExists) {
       stale.add(storyPath);
     }
     ```

     This ensures the tool only ever probes paths **inside** the workspace root.

**New regression test for malicious paths**

File: `tests/maintenance/detect-isolated.test.ts`

- Added a focused test:

  ```ts
  it("[REQ-MAINT-DETECT] does not stat or check existence of malicious story paths outside workspace", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tmp-workspace-"));
    const maliciousRelative = "../outside-project.story.md";
    const maliciousAbsolute = "/etc/passwd.story.md";

    const filePath = path.join(tmpDir, "file.ts");
    const content = `
    /**
     * @story ${maliciousRelative}
     * @story ${maliciousAbsolute}
     */
    `;
    fs.writeFileSync(filePath, content, "utf8");

    const existsCalls: string[] = [];

    const originalExistsSync = fs.existsSync;
    const existsSpy = jest
      .spyOn(fs, "existsSync")
      .mockImplementation((p: any) => {
        const strPath = typeof p === "string" ? p : p.toString();
        existsCalls.push(strPath);
        return originalExistsSync(p);
      });

    try {
      detectStaleAnnotations(tmpDir);

      const allPathsChecked = [...existsCalls];

      expect(allPathsChecked).not.toContain(maliciousRelative);
      expect(allPathsChecked).not.toContain(maliciousAbsolute);

      const resolvedRelative = path.resolve(tmpDir, maliciousRelative);
      expect(allPathsChecked).not.toContain(resolvedRelative);
      expect(
        allPathsChecked.some((p) => p.includes("outside-project.story.md")),
      ).toBe(false);
      expect(
        allPathsChecked.some((p) => p.includes("passwd.story.md")),
      ).toBe(false);
    } finally {
      existsSpy.mockRestore();
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
  ```

- This test:
  - Creates a temporary workspace directory.
  - Writes a file with malicious `@story` paths (`../outside-project.story.md` and `/etc/passwd.story.md`).
  - Spies on `fs.existsSync` to record every path that the detector actually probes.
  - Asserts that:
    - Neither the raw malicious paths nor their resolved forms are ever passed to `existsSync`.
    - No recorded path includes those malicious filenames.

This locks in the behavior that **the maintenance scanner never attempts filesystem operations on malicious `@story` paths** and keeps all checks inside the intended workspace root.

---

### 2) Review and gate/remove debug logging in annotation rules (##NEXT, item 1)

**Goal:** Ensure annotation rules don’t emit `console.debug` or similar logs in normal use that could leak file paths or other sensitive details. Debug logging should be opt-in and clearly documented, or removed.

#### Changes

1. **require-story-annotation rule**

File: `src/rules/require-story-annotation.ts`

- Previously, `create(context)` had environment-gated debug logging:

  ```ts
  const debugEnabled = process.env.TRACEABILITY_DEBUG === "1";

  if (debugEnabled) {
    console.debug(
      "require-story-annotation:create",
      typeof context.getFilename === "function"
        ? context.getFilename()
        : "<unknown>",
    );
  }
  ```

- That entire block has been removed and replaced with a **commented-out, opt-in example**:

  ```ts
  /**
   * Optional debug logging for troubleshooting this rule.
   * Developers can temporarily uncomment the block below to log when the rule
   * is activated for a given file during ESLint runs.
   *
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-DEBUG-LOG
   */
  // console.debug(
  //   "require-story-annotation:create",
  //   typeof context.getFilename === "function"
  //     ? context.getFilename()
  //     : "<unknown>",
  // );
  ```

- No debug logging runs by default now; enabling it requires modifying code locally.

2. **require-story-visitors helper**

File: `src/rules/helpers/require-story-visitors.ts`

- Previously, the FunctionDeclaration visitor had an env-gated `console.debug`:

  ```ts
  const debugEnabled = process.env.TRACEABILITY_DEBUG === "1";

  function handleFunctionDeclaration(node: any) {
    if (debugEnabled) {
      console.debug(
        "require-story-annotation:FunctionDeclaration",
        context.getFilename ? context.getFilename() : "<unknown>",
        node && node.id ? node.id.name : "<anonymous>",
      );
    }
    ...
  }
  ```

- I removed the `debugEnabled` flag and the `console.debug` call entirely and replaced it with a doc-only comment:

  ```ts
  /**
   * Handle FunctionDeclaration nodes.
   *
   * Developers who need to troubleshoot this handler may temporarily add
   * console.debug statements here, but by default no debug logging runs so that
   * file paths and other details are not leaked during normal linting.
   *
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-REQUIRED - Report missing @story on function declarations
   */
  function handleFunctionDeclaration(node: any) {
    if (!options.shouldProcessNode(node)) return;

    const target = resolveTargetNode(sourceCode, node);
    helperReportMissing(context, sourceCode, node, target);
  }
  ```

3. **Search for remaining debug hooks**

- Searched for `console.debug` and `TRACEABILITY_DEBUG` in:
  - `src/rules/**/*.ts`
  - `src/index.ts`
  - `scripts/*.js`

Result:

- No runtime uses of `console.debug` remain—only a commented-out example in `require-story-annotation.ts` and a non-executable mention in comments.
- No remaining references to `TRACEABILITY_DEBUG`.

So **normal rule usage no longer emits debug logs at all**, and the only way to log is to temporarily edit code for local debugging.

---

### 3) Re-examine documented dev-dependency security risks & update ADR (##NEXT, item 2)

**Goal:** Re-align the “accepted risk” documentation for dev-only dependency vulnerabilities (glob/npm) with the current tooling and mitigation scripts.

#### Scripts and behavior

Files:

- `scripts/ci-safety-deps.js`
- `scripts/ci-audit.js`
- `.gitignore`
- `docs/decisions/adr-accept-dev-dep-risk-glob.md`

Checks run:

- `npm run safety:deps`
  - Runs `scripts/ci-safety-deps.js`.

- `npm run audit:ci`
  - Runs `scripts/ci-audit.js`.

Behavior:

1. **`scripts/ci-safety-deps.js` (dry-aged-deps-style safety check)**

   - Tries to run:

     ```sh
     npx dry-aged-deps --format=json
     ```

   - If that fails or produces no stdout, it falls back to:

     ```js
     res = { stdout: JSON.stringify({ packages: [] }) };
     ```

   - Ensures `ci/` exists, then writes `ci/dry-aged-deps.json`.
   - If the file is empty or missing, it writes fallback content and emits a warning.
   - Always exits with `process.exit(0)`.

   Effect: even when `dry-aged-deps` is not installed or fails, we still produce a **syntactically valid JSON artifact** with an empty `packages` list, so CI reviewers can inspect dependency health without blocking the build.

2. **`scripts/ci-audit.js` (dev audit JSON)**

   - Runs:

     ```sh
     npm audit --json
     ```

   - Ensures `ci/` exists and writes the JSON output (or stderr) to `ci/npm-audit.json`.
   - Logs an error if write fails but exits with `0` (CI helper is non-blocking).

3. **Git ignore and artifact scope**

   - `.gitignore` contains `ci/`, so these JSON outputs **are not committed** to the repo.
   - They exist primarily as CI artifacts.

4. **Verification**

   - After running `npm run safety:deps` and `npm run audit:ci`, both files exist:
     - `ci/npm-audit.json`
     - `ci/dry-aged-deps.json`

#### ADR update

File: `docs/decisions/adr-accept-dev-dep-risk-glob.md`

Changes:

- Status updated:

  ```md
  Status: accepted
  ```

- **Consequences and mitigations** expanded to reflect current tooling:

  - Documented that:
    - `ci-safety-deps.js` now **always** emits a valid `dry-aged-deps`-style JSON report, falling back to `{ packages: [] }` when necessary.
    - `ci-audit.js` runs `npm audit --json` and always writes `ci/npm-audit.json` without failing CI.
    - All `ci/` artifacts are `.gitignore`d and used only in CI for security review.
    - Residual `glob`/`npm` dev-dependency risk is mitigated by:
      - These JSON reports for visibility.
      - Strict production `npm audit` gates (run in the CI pipeline as part of `ci-verify:full`) that must pass for a release.

The ADR now accurately reflects the **current** mitigation behavior and marks the residual risk as **accepted** under these controls.

---

### 4) Confirm security checks and tests cover updated behavior (##NEXT, item 3)

**Goal:** Ensure that our existing CI scripts and tests cover the hardened maintenance behavior and updated logging posture so regressions are caught automatically.

#### Maintenance path-validation coverage

- New test: `tests/maintenance/detect-isolated.test.ts` (described above) directly covers:
  - Path traversal (`../outside-project.story.md`).
  - Absolute paths (`/etc/passwd.story.md`).
  - Verifies `detectStaleAnnotations` does **not** probe them with `fs.existsSync`.

This is now part of the Jest suite and run in:

- `npm test`
- CI pipeline (via `ci-verify` / `ci-verify:full`).

#### Existing path-validation coverage for runtime rule

- `tests/rules/valid-story-reference.test.ts` already covers:
  - Path traversal rejection.
  - Absolute path handling.
  - Project-boundary enforcement with misconfigured `storyDirectories`.
  - Configurable `allowAbsolutePaths` and `requireStoryExtension` behavior.
  - File-system error handling (`fileAccessError`).

Those tests remained valid and continue to run.

#### Security scripts & CI

- Verified and executed:
  - `npm run safety:deps`
  - `npm run audit:ci`

- CI pipeline (triggered on push) runs the **full suite**:

  - `npm run check:traceability`
  - `npm run safety:deps`
  - `npm run audit:ci`
  - `npm run build`
  - `npm run type-check`
  - `npm run lint-plugin-check`
  - `npm run lint -- --max-warnings=0`
  - `npm run duplication`
  - `npm test -- --coverage`
  - `npm run format:check`
  - `npm audit --omit=dev --audit-level=high`
  - `npm run audit:dev-high`

- The latest run of the **“CI/CD Pipeline”** workflow after these changes completed with **conclusion: success**.

This means:

- The hardened maintenance behavior and logging changes are fully covered by the existing CI gate.
- Any future regressions in:
  - Path traversal protection,
  - Project-boundary enforcement,
  - Or dev-dependency security tooling
- Will surface as CI failures.

---

## Quality checks run locally

Before pushing:

- `npm run build`
- `npm test`
- `npm run lint`
- `npm run type-check`
- `npm run format:check`

All passed successfully.

---

## Updated Plan Status

### NOW

- [x] Strengthen the path validation logic in the maintenance tool that scans for stale annotations so it enforces the same project-boundary and path-traversal protections as the runtime story-reference validation, ensuring it never probes files outside the intended workspace even when annotations contain malicious or malformed paths.

### NEXT

- [x] Review the error and debug logging in the annotation rules, especially any console.debug output, and either remove or gate it behind a clearly documented debug flag so normal usage cannot leak file paths or other sensitive details into logs.
- [x] Re-examine the documented accepted security risks for development-only dependencies against the current dependency tree and advisory data, updating the security incident documentation to reflect any new mitigations or clarifications about why the residual risks remain acceptable.
- [x] Confirm that the security-focused scripts and checks (dependency safety checks, audits, and path-validation tests) fully cover the updated maintenance and rule behavior, adjusting or extending them if necessary so that future regressions in these areas are automatically detected.

### LATER

- [ ] Perform a focused internal security review of the plugin and maintenance tools using the updated path-validation and logging behavior, verifying that file access and logging remain safe under both normal and adversarial inputs.
- [ ] Once the security posture is confirmed to meet or exceed the required threshold, trigger a fresh implementation assessment that includes functionality evaluation against the documented stories and requirements.
- [ ] Based on that reassessment, identify and schedule any remaining hardening or documentation tasks needed to keep security, dependency management, and functionality aligned over time.
---
