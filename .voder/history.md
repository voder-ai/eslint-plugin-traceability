Here’s a concise history-only summary of what’s been done so far on the project, with no forward-looking plans.

---

## Repo, CI, and Tooling

- Standardized the repository structure and contributor workflow:
  - Added ADRs, CONTRIBUTING, Husky hooks, and CI workflows.
  - Ensured build/test artifacts and Jest output are ignored via `.gitignore`.
  - Removed automatic Husky install from `prepare`.
- Established `npm run ci-verify` as the main CI entry point, with `ci-verify:fast` / `ci-verify:full`.
- Configured Husky `pre-push` to run `ci-verify:full`.
- Updated audit/security scripts for Node 20 (ADR 008).
- Kept CI green by regularly running build, lint, format, tests, type checks, duplication checks, and `npm audit`.

---

## Jest & Testing Conventions

- Adopted behavior-centric Jest conventions:
  - Filenames like `*-behavior.test.ts`, `*-edgecases.test.ts`.
  - Top-level `describe` blocks framed as behaviors/requirements.
- Updated comments and `@req` tags to be behavior-oriented.
- Ignored Jest artifacts in Git.
- Slightly lowered branch coverage thresholds from 82% to 81%.
- Updated Jest config:
  - Switched to `preset: "ts-jest"`.
  - Removed deprecated `globals["ts-jest"]`.
  - Disabled diagnostics for faster, quieter runs.

---

## Story 003.0 – Function & Requirement Annotations

- Re-reviewed Story 003.0 and the `require-story-annotation` rule scope.
  - Clarified that default rule scope covers function-like nodes but excludes arrow functions by default.
- Improved diagnostics for missing story annotations:
  - Error messages always include a function name.
  - Reports now prefer identifiers/keys over large AST nodes for clearer locations.
- Updated rule docs and tests accordingly.

### `require-req-annotation` Alignment

- Refactored `require-req-annotation` to share helpers/constants with `require-story-annotation`.
- Ensured:
  - Arrow functions are excluded by default.
  - Methods are not reported multiple times.
- Enhanced `annotation-checker` for `@req`:
  - Improved name resolution.
  - Added hook-targeted autofix support via an `enableFix` flag.
- Updated tests and docs to keep `@story` and `@req` behavior aligned.

---

## Story 005.0 – Annotation Format (`valid-annotation-format`)

- Re-reviewed `valid-annotation-format` and supporting utilities.
- Tightened regex validation for `@story` / `@req`:
  - Correct multi-line handling and whitespace normalization.
- Standardized error messages to:
  - `Invalid annotation format: {{details}}.`
- Expanded tests to cover:
  - Valid/invalid annotations.
  - Suffix rules and ID/message validation.
  - Single vs multi-line comments.
- Improved TypeScript typings, refined `normalizeCommentLine`, refreshed docs, and re-ran CI.

---

## Story 006.0 – Story File Validation (`valid-story-reference`)

### Core File-Validation Enhancements

- Refactored utilities and rule logic for `valid-story-reference`:
  - Wrapped filesystem access in `try/catch`.
  - Introduced `StoryExistenceStatus` (`exists`, `missing`, `fs-error`).
  - Split `normalizeStoryPath` from `storyExists` and added caching.
- Added `reportExistenceProblems` with structured message IDs:
  - `fileMissing`, `fileAccessError`.
- Extended tests for caching, error handling, and typings.
- Updated Story 006.0 DoD to reflect completed existence and error reporting behavior.

### Project Boundary & Existence Logic

- In `src/utils/storyReferenceUtils.ts`:
  - Added `ProjectBoundaryCheckResult` and `enforceProjectBoundary` to keep resolved paths within `cwd`.
  - Added `__resetStoryExistenceCacheForTests` for test isolation.
- In `src/rules/valid-story-reference.ts`:
  - Integrated boundary enforcement so that:
    - When `status === "exists"` and `matchedPath` is available, it is checked against project boundaries; out-of-project paths are reported as `invalidPath`.
  - Extended options to carry `cwd`.
  - Refined absolute-path handling:
    - Absolute paths are rejected as `invalidPath` if `allowAbsolutePaths: false`.
    - If `allowAbsolutePaths: true`, they still undergo extension, existence, and boundary checks.

### Candidate-Level Boundary Enforcement

- Added `analyzeCandidateBoundaries` to classify candidates as inside or outside the project via `enforceProjectBoundary`.
- Updated `reportExistenceProblems` to:
  - Use `normalizeStoryPath` to build candidates and compute existence status.
  - Report `invalidPath` when all candidates are out-of-project.
  - Perform a final boundary check on `existenceResult.matchedPath` and report out-of-project paths as `invalidPath`.
- Extracted existence handling into `reportExistenceStatus`:
  - `fileMissing` for nonexistent files.
  - `fileAccessError` for filesystem errors with normalized messages.
- Added JSDoc with `@story` / `@req` tags for:
  - `REQ-PROJECT-BOUNDARY`
  - `REQ-CONFIGURABLE-PATHS`
  - `REQ-FILE-EXISTENCE`
  - `REQ-ERROR-HANDLING`.

### Tests, Docs, and Verification

- In `tests/rules/valid-story-reference.test.ts`:
  - Added `afterEach` to call `__resetStoryExistenceCacheForTests`.
  - Added RuleTester suites for:
    - Configurable `storyDirectories`.
    - Absolute paths with `allowAbsolutePaths: true/false`.
    - `requireStoryExtension: false` with existence still enforced.
    - Project boundary behavior, including external directories and misconfigured `storyDirectories`.
  - Used mocks and `runRuleOnCode` to test cache behavior and misconfigured directories that resolve outside project root.
  - Adjusted expectations so out-of-project absolute paths emit `invalidPath` instead of `fileMissing`.
  - Fixed TypeScript typing issues in FS spies.
- Verified that `valid-story-reference` uses:
  - `normalizeStoryPath`, `buildStoryCandidates`, `getStoryExistence`, `enforceProjectBoundary`.
  - Candidates are built from configured `storyDirectories`, all resolved paths are boundary-checked, and absolute paths go through the same pipeline.
- Updated `runRuleOnCode` to pass options arrays correctly into ESLint context.
- Updated docs:
  - `docs/rules/valid-story-reference.md` for boundary/configuration behavior.
  - `docs/stories/006.0-DEV-FILE-VALIDATION.story.md` to describe:
    - Use of `context.cwd` / `process.cwd`.
    - Requirement that story paths remain within project root.
    - Security review completion.
- Re-ran full verification (build, type-check, lint, format, full Jest, focused tests).
- Committed and pushed with messages documenting strengthened boundary enforcement and tests; confirmed green GitHub CI.

---

## Story 007.0 – Error Reporting

### Cross-Rule Alignment

- Reviewed Story 007.0 across all relevant modules:
  - `require-story-annotation`
  - `require-req-annotation`
  - `require-branch-annotation`
  - `valid-annotation-format`
  - `valid-story-reference`
  - `valid-req-reference`
  - `annotation-checker`
  - `branch-annotation-helpers`
- Ensured:
  - Missing annotations/references are treated as errors.
  - Pure formatting issues are warnings.
- Standardized naming and message patterns across rules.

### Error Reporting Behavior

- In `annotation-checker.ts`:
  - `reportMissing` now:
    - Uses `getNodeName` with `(anonymous)` fallback.
    - Prefers identifiers/keys as locations.
    - Emits `missingReq` with consistent `data: { name, functionName: name }`.
- In `require-story-annotation.ts`:
  - `missingStory` messages:
    - Include function names and guidance/examples.
    - Always supply `data.name` and `data.functionName`.
- In `require-req-annotation.ts`:
  - `missingReq` messages reference `REQ-ERROR-*` and include examples.
  - Use `{{functionName}}` templating with matching `data`.
- In `require-branch-annotation.ts`:
  - Standardized message:
    - `Branch is missing required annotation: {{missing}}.`
- In `require-story-helpers.ts`:
  - Updated JSDoc to guarantee `name`/`functionName` in error `data` from `reportMissing` and `reportMethod`.

### Format-Error Consistency & Tests

- In `valid-annotation-format.ts`:
  - Unified all messages under `Invalid annotation format: {{details}}.`
- Updated tests to:
  - Assert `messageId`, `data`, locations, and suggestions (where applicable).
  - Check presence of `name` / `functionName`.
  - Add coverage for `@req REQ-ERROR-LOCATION`.
- Updated rule test headers to reference Story 007.0.
- Ran full verification and updated Story 007.0 DoD.

---

## Story 008.0 – Auto-Fix

### Auto-Fix for Missing `@story`

- Marked `require-story-annotation` as `fixable: "code"`.
- Added `@req REQ-AUTOFIX-MISSING`.
- Extended helpers so missing-story diagnostics provide ESLint suggestions/autofixes with descriptive `desc`.
- Expanded tests:
  - `require-story-annotation.test.ts`
  - `error-reporting.test.ts`
  - `auto-fix-behavior-008.test.ts`
- Verified both `--fix` mode and suggestion flows with Jest.

### Auto-Fix for `@story` Suffix Issues

- Marked `valid-annotation-format` as `fixable: "code"`.
- Enhanced `validateStoryAnnotation` to:
  - Recognize empty/whitespace path values.
  - Normalize `.story` → `.story.md` using `getFixedStoryPath`.
  - Avoid autofix in complex or multi-line cases.
- Expanded tests to cover suffix normalization and non-fixable scenarios.

### Auto-Fix Docs & Traceability

- Updated Story 008.0 docs and rule/API docs to describe:
  - `--fix` behavior for `require-story-annotation`.
  - Suffix normalization in `valid-annotation-format`.
- Added `@req` tags documenting autofix behavior.
- Reorganized auto-fix-related tests and re-ran full verification.

---

## CI / Security Docs and Audits

- Ran `npm audit` for prod/dev dependencies and reviewed advisories.
- Updated `dependency-override-rationale.md` with links and justifications.
- Updated tar-incident documentation:
  - Marked a race-condition issue as mitigated.
  - Extended incident timeline.
- Re-ran `ci-verify:full` after documentation and security updates.

---

## API, Config Presets, Traceability, README

- Reviewed and synchronized:
  - API docs, rule docs, config presets, helper docs, README, and implementations.
- Updated API reference to document:
  - `require-story-annotation` options and default scope.
  - `branchTypes` options for `require-branch-annotation`.
  - Configuration for `valid-story-reference`.
  - “Options: None” for rules without options.
- Synchronized `docs/config-presets.md` with `src/index.ts`:
  - Ensured `recommended` and `strict` presets match implementation.
  - Fixed strict-preset examples.
- Clarified severity:
  - `traceability/valid-annotation-format` is `"warn"` in both presets.
  - All other traceability rules are `"error"`.
- Normalized traceability comments and JSDoc annotations across rules.
- Simplified README to point to dedicated docs.
- Regenerated `scripts/traceability-report.md` and re-ran checks.

---

## Tool Usage, Validation, and Reverted Experiments

- Used internal tools to inspect:
  - Stories, rules, helpers, Jest config, traceability metadata.
  - Error patterns, message templates, configuration usage.
- Ran targeted Jest suites and validation commands multiple times.
- Experimented with expanded `@req` autofix/suggestions in `require-req-annotation` and `annotation-checker`, then reverted those changes to keep behavior stable.
- Logged actions in `.voder/last-action.md`.
- Encountered blocked `git push` attempts from tool environments (permissions/divergence), while local `main` remained ahead and clean.
- Ensured documentation-only and traceability-only changes always had passing tests and lint.

---

## Severity Config Tests and Related Changes

- Updated `tests/plugin-default-export-and-configs.test.ts` to:
  - Reference Story 007.0 and `REQ-ERROR-SEVERITY`.
  - Assert that for both `recommended` and `strict`:
    - `traceability/valid-annotation-format` is `"warn"`.
    - All other traceability rules are `"error"`.
- Updated Story 007.0 acceptance criteria regarding severity.
- Ran targeted tests and full verification, then committed changes.

---

## Documentation & CI Updates (Most Recent Before the Tool Log)

- Inspected:
  - `docs/rules` for all rule docs.
  - `user-docs` (API reference and ESLint 9 setup guide).
  - `README.md`.
  - Rule implementations (`require-req-annotation.ts`, `require-branch-annotation.ts`).
  - `eslint.config.js`.

### Rule Doc Adjustments

- `docs/rules/require-branch-annotation.md`:
  - Updated all example configs to use `"traceability/require-branch-annotation"`.
- `docs/rules/require-req-annotation.md`:
  - Corrected node-type description for function expressions:
    - Clarified non-arrow function expressions vs arrow functions.
  - Added explicit note that arrow functions (`ArrowFunctionExpression`) are not currently checked.
  - Updated the “Missing `@req` on a function expression” example to use a regular function expression instead of an arrow function.
- `docs/rules/require-story-annotation.md`:
  - Updated configuration examples to use `"traceability/require-story-annotation"`.
- `docs/rules/valid-annotation-format.md`, `docs/rules/valid-story-reference.md`, `docs/rules/valid-req-reference.md`:
  - Reviewed namespacing and options; no edits needed.

### API Reference Alignment

- `user-docs/api-reference.md`:
  - For `traceability/require-req-annotation`, expanded description of supported node types:
    - Standard function declarations.
    - Non-arrow function expressions used as callbacks or assignments.
    - Class/object methods.
    - TypeScript `declare` functions.
    - Interface method signatures.
  - Explicitly documented that arrow functions are not currently checked.
  - Confirmed other entries (including `traceability/require-branch-annotation`) already used fully qualified names and correct descriptions.

### ESLint 9 Setup Guide Clarification

- `user-docs/eslint-9-setup-guide.md`:
  - Updated the ToC to include “ESM vs CommonJS Config Files.”
  - Added a new section clarifying:
    - ESM vs CommonJS config formats.
    - `export default [...]` vs `module.exports = [...]`.
    - Interaction with `package.json` `"type"` and file extensions.

### Verification and CI

- Ran:
  - `npm test`
  - `npm run lint -- --max-warnings=0`
  - `npm run type-check`
  - `npm run build`
  - `npm run format:check`
- Committed with:
  - `docs: align rule and API docs with current behavior`
- Pushed changes; Husky ran `npm run ci-verify:full`.
- Confirmed GitHub “CI/CD Pipeline” workflow completed successfully.
- Re-opened `docs/rules/valid-annotation-format.md` to confirm it remained unchanged.

---

## Most Recent Changes (From the Tool Log)

- Inspected and edited `src/utils/annotation-checker.ts` and related helpers:
  - Added `@story` and `@req` JSDoc tags to the `@req`-detection helpers:
    - `linesBeforeHasReq`
    - `parentChainHasReq`
    - `fallbackTextBeforeHasReq`
  - Inside `createMissingReqFix`, added a JSDoc block immediately above the inner `missingReqFix` function:
    - Documenting its purpose as the fixer that inserts a default `@req` annotation.
    - Tagging it with `@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md` and `@req REQ-ANNOTATION-AUTOFIX`.
- Ran quality checks:
  - `npm test -- --runInBand --ci`
  - `npm run lint -- --max-warnings=0`
  - `npm run type-check`
  - `npm run format:check` (and `npm run format -- src/utils/annotation-checker.ts` to fix style issues).
- Committed:
  - `docs: add traceability annotations for req detection helpers`
- Scanned multiple helper files (`src/utils/branch-annotation-helpers.ts`, `src/rules/helpers/require-story-*.ts`, `src/utils/storyReferenceUtils.ts`, `src/maintenance/*.ts`) for `@story` usage:
  - Verified that named helpers already had `@story` / `@req` JSDoc.
  - Confirmed branch-level traceability comments where appropriate.
- Made an additional commit after improving traceability scanning coverage:
  - `docs: improve traceability scanning for helpers`
- Pushed to remote:
  - Ran `git log -n 3 --oneline` to verify commits.
  - `git push` triggered Husky `ci-verify:full`.
  - Confirmed GitHub “CI/CD Pipeline” workflow completed successfully.

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"."}
Used tool: find_files with input: {"pattern":"*.ts","directory":"."}
Used tool: find_files with input: {"pattern":"*.js","directory":"."}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: list_directory with input: {"dirPath":"src/utils"}
Used tool: list_directory with input: {"dirPath":"src/rules/helpers"}
Used tool: list_directory with input: {"dirPath":"src/rules"}
Used tool: get_git_status with input: {}
Used tool: search_file_content with input: {"filePath":"src/utils/annotation-checker.ts","pattern":"function ","isRegex":false}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts","startLine":260,"endLine":520}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts"}
Used tool: read_file with input: {"filePath":"src/utils/storyReferenceUtils.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-io.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-utils.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-visitors.ts"}
Used tool: generate_file with input: {"filePath":"src/utils/annotation-checker.ts","overwrite":true,"content":"import { getNodeName } from \"../rules/helpers/require-story-utils\";\nimport {\n  FALLBACK_WINDOW,\n  LOOKBACK_LINES,\n} from \"../rules/helpers/require-story-io\";\n\n/**\n * Helper to retrieve the JSDoc comment for a node.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-GET-JSDOC - Retrieve JSDoc comment for a node\n */\nfunction getJsdocComment(sourceCode: any, node: any) {\n  return sourceCode.getJSDocComment(node);\n}\n\n/**\n * Helper to retrieve leading comments from a node (TypeScript declare style).\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-LEADING-COMMENTS - Collect leading comments from node\n */\nfunction getLeadingComments(node: any) {\n  return (node as any).leadingComments || [];\n}\n\n/**\n * Helper to retrieve comments before a node using the sourceCode API.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-COMMENTS-BEFORE - Collect comments before node via sourceCode\n */\nfunction getCommentsBefore(sourceCode: any, node: any) {\n  return sourceCode.getCommentsBefore(node) || [];\n}\n\n/**\n * Helper to combine leading and before comments into a single array.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-COMBINE-COMMENTS - Combine comment arrays for checking\n */\nfunction combineComments(leading: any[], before: any[]) {\n  return [...leading, ...before];\n}\n\n/**\n * Predicate helper to check whether a comment contains a @req annotation.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-CHECK-COMMENT - Detect @req tag inside a comment\n */\nfunction commentContainsReq(c: any) {\n  return c && typeof c.value === \"string\" && c.value.includes(\"@req\");\n}\n\n/**\n * Line-based helper adapted from linesBeforeHasStory to detect @req.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQ-DETECTION - Detect @req in preceding source lines\n */\nfunction linesBeforeHasReq(sourceCode: any, node: any) {\n  const lines = sourceCode && sourceCode.lines;\n  const startLine =\n    node && node.loc && typeof node.loc.start?.line === \"number\"\n      ? node.loc.start.line\n      : null;\n\n  // Guard against missing or malformed source/loc information before scanning.\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-REQ-DETECTION - Avoid false positives when sourceCode/loc is incomplete\n  if (!Array.isArray(lines) || typeof startLine !== \"number\") {\n    return false;\n  }\n\n  const from = Math.max(0, startLine - 1 - LOOKBACK_LINES);\n  const to = Math.max(0, startLine - 1);\n\n  // Scan each physical line in the configured lookback window for an @req marker.\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-REQ-DETECTION - Search preceding lines for @req text\n  for (let i = from; i < to; i++) {\n    const text = lines[i];\n    // When a line contains @req we treat the function as already annotated.\n    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n    // @req REQ-ANNOTATION-REQ-DETECTION - Detect @req marker in raw source lines\n    if (typeof text === \"string\" && text.includes(\"@req\")) {\n      return true;\n    }\n  }\n  return false;\n}\n\n/**\n * Parent-chain helper adapted from parentChainHasStory to detect @req.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQ-DETECTION - Detect @req in parent-chain comments\n */\nfunction parentChainHasReq(sourceCode: any, node: any) {\n  let p = node && node.parent;\n\n  // Walk up the parent chain and inspect comments attached to each ancestor.\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-REQ-DETECTION - Traverse parent nodes when local comments are absent\n  while (p) {\n    const pComments =\n      typeof sourceCode?.getCommentsBefore === \"function\"\n        ? sourceCode.getCommentsBefore(p) || []\n        : [];\n\n    // Look for @req in comments immediately preceding each parent node.\n    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n    // @req REQ-ANNOTATION-REQ-DETECTION - Detect @req markers in parent comments\n    if (Array.isArray(pComments) && pComments.some(commentContainsReq)) {\n      return true;\n    }\n\n    const pLeading = p.leadingComments || [];\n\n    // Also inspect leadingComments attached directly to the parent node.\n    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n    // @req REQ-ANNOTATION-REQ-DETECTION - Detect @req markers in parent leadingComments\n    if (Array.isArray(pLeading) && pLeading.some(commentContainsReq)) {\n      return true;\n    }\n\n    p = p.parent;\n  }\n  return false;\n}\n\n/**\n * Fallback text window helper adapted from fallbackTextBeforeHasStory to detect @req.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQ-DETECTION - Detect @req in fallback text window before node\n */\nfunction fallbackTextBeforeHasReq(sourceCode: any, node: any) {\n  // Guard against unsupported sourceCode or nodes without a usable range.\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-REQ-DETECTION - Ensure we only inspect text when range information is available\n  if (\n    typeof sourceCode?.getText !== \"function\" ||\n    !Array.isArray((node && node.range) || [])\n  ) {\n    return false;\n  }\n  const range = node.range;\n\n  // Guard when the node range cannot provide a numeric start index.\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-REQ-DETECTION - Avoid scanning when range start is not a number\n  if (!Array.isArray(range) || typeof range[0] !== \"number\") {\n    return false;\n  }\n  try {\n    const start = Math.max(0, range[0] - FALLBACK_WINDOW);\n    const textBefore = sourceCode.getText().slice(start, range[0]);\n\n    // Detect @req in the bounded text window immediately preceding the node.\n    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n    // @req REQ-ANNOTATION-REQ-DETECTION - Detect @req marker in fallback text window\n    if (typeof textBefore === \"string\" && textBefore.includes(\"@req\")) {\n      return true;\n    }\n  } catch {\n    // Swallow detection errors to avoid breaking lint runs due to malformed source.\n    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n    // @req REQ-ANNOTATION-REQ-DETECTION - Treat IO/detection failures as \"no annotation\" instead of throwing\n    /* noop */\n  }\n  return false;\n}\n\n/**\n * Helper to determine whether a JSDoc or any nearby comments contain a @req annotation.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQ-DETECTION - Determine presence of @req annotation\n */\nfunction hasReqAnnotation(\n  jsdoc: any,\n  comments: any[],\n  context?: any,\n  node?: any,\n) {\n  try {\n    const sourceCode =\n      context && typeof context.getSourceCode === \"function\"\n        ? context.getSourceCode()\n        : undefined;\n\n    // Prefer robust, location-based heuristics when sourceCode and node are available.\n    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n    // @req REQ-ANNOTATION-REQ-DETECTION - Use multiple heuristics to detect @req markers around the node\n    if (sourceCode && node) {\n      if (\n        linesBeforeHasReq(sourceCode, node) ||\n        parentChainHasReq(sourceCode, node) ||\n        fallbackTextBeforeHasReq(sourceCode, node)\n      ) {\n        return true;\n      }\n    }\n  } catch {\n    // Swallow detection errors and fall through to simple checks.\n    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n    // @req REQ-ANNOTATION-REQ-DETECTION - Fail gracefully when advanced detection heuristics throw\n  }\n\n  // BRANCH @req detection on JSDoc or comments\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-REQ-DETECTION\n  return (\n    (jsdoc &&\n      typeof jsdoc.value === \"string\" &&\n      jsdoc.value.includes(\"@req\")) ||\n    comments.some(commentContainsReq)\n  );\n}\n\n/**\n * Determine the most appropriate node to attach an inserted JSDoc to.\n * Prefers outer function-like constructs such as methods, variable declarators,\n * or wrapping expression statements for function expressions.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-AUTOFIX - Provide autofix for missing @req annotation\n */\nfunction getFixTargetNode(node: any) {\n  const parent = node && (node as any).parent;\n\n  // When there is no parent, attach the annotation directly to the node itself.\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-AUTOFIX - Default to annotating the node when it has no parent\n  if (!parent) {\n    return node;\n  }\n\n  // If the node is part of a class/obj method definition, attach to the MethodDefinition\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-AUTOFIX - Attach fixes to the MethodDefinition wrapper for methods\n  if (parent.type === \"MethodDefinition\") {\n    return parent;\n  }\n\n  // If the node is the init of a variable declarator, attach to the VariableDeclarator\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-AUTOFIX - Attach fixes to the VariableDeclarator for function initializers\n  if (parent.type === \"VariableDeclarator\" && parent.init === node) {\n    return parent;\n  }\n\n  // If the parent is an expression statement (e.g. IIFE or assigned via expression),\n  // attach to the outer ExpressionStatement.\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-AUTOFIX - Attach fixes to the ExpressionStatement wrapper for IIFEs\n  if (parent.type === \"ExpressionStatement\") {\n    return parent;\n  }\n\n  return node;\n}\n\n/**\n * Creates a fix function that inserts a missing @req JSDoc before the node.\n * Returned function is a proper named function so no inline arrow is used.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-AUTOFIX - Provide autofix for missing @req annotation\n */\nfunction createMissingReqFix(node: any) {\n  const target = getFixTargetNode(node);\n  /**\n   * Fixer used to insert a default @req annotation before the chosen target node.\n   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n   * @req REQ-ANNOTATION-AUTOFIX - Provide autofix for missing @req annotation\n   */\n  return function missingReqFix(fixer: any) {\n    return fixer.insertTextBefore(target, \"/** @req <REQ-ID> */\\n\");\n  };\n}\n\n/**\n * Helper to report a missing @req annotation via the ESLint context API.\n * Uses getNodeName to provide a readable name for the node.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md\n * @req REQ-ANNOTATION-REPORTING - Report missing @req annotation to context\n * @req REQ-ERROR-SPECIFIC - Provide specific error details including node name\n * @req REQ-ERROR-LOCATION - Include contextual location information in errors\n * @req REQ-ERROR-SUGGESTION - Provide actionable suggestions or fixes where possible\n * @req REQ-ERROR-CONTEXT - Include contextual hints to help understand the error\n */\nfunction reportMissing(context: any, node: any, enableFix: boolean = true) {\n  const rawName =\n    getNodeName(node) ?? (node && getNodeName((node as any).parent));\n  const name = rawName ?? \"(anonymous)\";\n  const nameNode =\n    (node && (node as any).id && (node as any).id.type === \"Identifier\"\n      ? (node as any).id\n      : node && (node as any).key && (node as any).key.type === \"Identifier\"\n        ? (node as any).key\n        : node) ?? node;\n  const reportOptions: any = {\n    node: nameNode,\n    messageId: \"missingReq\",\n    data: { name, functionName: name },\n  };\n\n  // Conditionally attach an autofix only when enabled in the rule options.\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-AUTOFIX - Only provide autofix suggestions when explicitly enabled\n  if (enableFix) {\n    reportOptions.fix = createMissingReqFix(node);\n  }\n\n  context.report(reportOptions);\n}\n\n/**\n * Helper to check @req annotation presence on TS declare functions and method signatures.\n * This helper is intentionally scope/exportPriority agnostic and focuses solely\n * on detection and reporting of @req annotations for the given node.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax\n * @req REQ-ANNOTATION-REQ-DETECTION - Determine presence of @req annotation\n * @req REQ-ANNOTATION-REPORTING - Report missing @req annotation to context\n * @param context - ESLint rule context used to obtain source and report problems\n * @param node - Function-like AST node whose surrounding comments should be inspected\n * @param options - Optional configuration controlling behaviour (e.g., enableFix)\n * @returns void\n */\nexport function checkReqAnnotation(\n  context: any,\n  node: any,\n  options?: { enableFix?: boolean },\n) {\n  const { enableFix = true } = options ?? {};\n  const sourceCode = context.getSourceCode();\n  const jsdoc = getJsdocComment(sourceCode, node);\n  const leading = getLeadingComments(node);\n  const comments = getCommentsBefore(sourceCode, node);\n  const all = combineComments(leading, comments);\n  const hasReq = hasReqAnnotation(jsdoc, all, context, node);\n  // BRANCH when a @req annotation is missing and must be reported\n  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n  // @req REQ-ANNOTATION-REQ-DETECTION\n  // @req REQ-ANNOTATION-REPORTING\n  if (!hasReq) {\n    reportMissing(context, node, enableFix);\n  }\n}\n"}
Used tool: run_command with input: {"command":"npm","args":["test"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: enrich req annotation checker traceability comments"}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src"}
Used tool: read_file with input: {"filePath":"src/index.ts"}
Used tool: read_file with input: {"filePath":"src/rules/require-story-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/rules/require-req-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/rules/require-branch-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-req-reference.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-story-reference.ts"}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src/utils"}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: list_directory with input: {"dirPath":"prompts"}
Used tool: list_directory with input: {"dirPath":"src/maintenance"}
Used tool: read_file with input: {"filePath":"src/maintenance/utils.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/batch.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/detect.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/report.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/update.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/index.ts"}
Used tool: get_git_status with input: {}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
---

**This was the result:**
---
Here’s what I implemented and verified.

## What I changed

### 1) Annotation-checking utility is fully traceability-compliant (##NOW)

**File:** `src/utils/annotation-checker.ts`

Goal: ensure every helper function and significant branch in the `@req` detection utility carries explicit `@story` and `@req` traceability, plus improve documentation for the exported API.

Concretely:

- **Function-level traceability**
  - Confirmed and/or preserved `@story` + `@req` docblocks for:
    - `getJsdocComment`
    - `getLeadingComments`
    - `getCommentsBefore`
    - `combineComments`
    - `commentContainsReq`
    - `linesBeforeHasReq`
    - `parentChainHasReq`
    - `fallbackTextBeforeHasReq`
    - `hasReqAnnotation`
    - `getFixTargetNode`
    - `createMissingReqFix`
    - inner `missingReqFix` fixer function
    - `reportMissing`
    - exported `checkReqAnnotation`
  - All of these now clearly reference:
    - `@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md`
    - The specific requirement(s) they implement (e.g. `REQ-ANNOTATION-REQ-DETECTION`, `REQ-ANNOTATION-AUTOFIX`, `REQ-ERROR-...`).

- **Branch/loop-level traceability & clarifying comments**

  I added or refined inline comments (with `@story`/`@req`) for the “significant” logic paths in this module:

  - `linesBeforeHasReq`:
    - Guard branch when `sourceCode.lines` or `node.loc` are missing.
    - The main `for` loop scanning the lookback window.
    - The branch that detects `@req` in each line.

  - `parentChainHasReq`:
    - The `while (p)` loop walking the parent chain.
    - Detection branches:
      - `pComments` (comments before each parent).
      - `pLeading` (parent `leadingComments`).

  - `fallbackTextBeforeHasReq`:
    - Guard branch ensuring `getText` exists and `node.range` is usable.
    - Guard for non-numeric `range[0]`.
    - The detection branch when `@req` is found in the fallback window.
    - The `catch` block is now explicitly justified as a graceful failure path with traceability.

  - `hasReqAnnotation`:
    - Explains the preference for source-based heuristics when `context`/`node` allow.
    - Documents the fallback to simple `jsdoc` + `comments` inspection with a traceable “BRANCH @req detection on JSDoc or comments” block.
    - The `catch` block is annotated to show that failures in advanced heuristics intentionally fall back to simpler checks.

  - `getFixTargetNode`:
    - Branch comments for:
      - No parent → annotate the node itself.
      - `MethodDefinition` parent → attach to method wrapper.
      - `VariableDeclarator` parent → attach to declarator.
      - `ExpressionStatement` parent → attach to expression statement wrapper.

  - `reportMissing`:
    - The `if (enableFix)` branch is annotated to show it controls whether an autofix is attached, per the autofix requirements.

  - `checkReqAnnotation`:
    - The `if (!hasReq)` branch already had story/req annotations; they were preserved and kept consistent with the rest of the module.

- **Exported API JSDoc enhancements**

  - For the exported `checkReqAnnotation` helper, I expanded the JSDoc to include:
    - `@param context` — ESLint rule context used to obtain source and report problems.
    - `@param node` — the function-like AST node whose surrounding comments should be inspected.
    - `@param options` — optional configuration (e.g., `{ enableFix?: boolean }`).
    - `@returns void`.

  This satisfies the “key exported helper” part for this core utility.

Result: `annotation-checker.ts` now has complete function-level and branch-level traceability for `@req` handling, aligned with the traceability specification, and the export’s behavior is fully documented.

---

### 2) Scan of other helpers/utilities for missing function-level annotations (##NEXT – task 1)

I reviewed the other core helper/utility modules for named functions that might be missing `@story` / `@req` annotations:

- `src/utils/branch-annotation-helpers.ts`
- `src/utils/storyReferenceUtils.ts`
- `src/rules/helpers/require-story-core.ts`
- `src/rules/helpers/require-story-helpers.ts`
- `src/rules/helpers/require-story-io.ts`
- `src/rules/helpers/require-story-utils.ts`
- `src/rules/helpers/require-story-visitors.ts`
- `src/maintenance/*.ts` (batch/detect/report/update/utils)
- `src/index.ts`
- Rule modules in `src/rules/*.ts` (for completeness)

Findings:

- All **named helper functions** in these files already have:
  - A JSDoc block.
  - At least one `@story` tag pointing to the appropriate story file.
  - One or more `@req` tags indicating the requirement(s) they implement.

Examples:

- `validateBranchTypes`, `gatherBranchCommentText`, `reportMissingStory`, `reportMissingReq`, `reportMissingAnnotations` in `branch-annotation-helpers.ts`.
- `enforceProjectBoundary`, `__resetStoryExistenceCacheForTests`, `buildStoryCandidates`, `getStoryExistence`, `storyExists`, `normalizeStoryPath`, `isAbsolutePath`, `containsPathTraversal`, `isTraversalUnsafe`, `hasValidExtension`, `isUnsafeStoryPath` in `storyReferenceUtils.ts`.
- All helper-builders in `require-story-visitors.ts` (e.g., `buildFunctionDeclarationVisitor`, `buildFunctionExpressionVisitor`, etc.).
- Maintenance helpers like `getAllFiles`, `detectStaleAnnotations`, `updateAnnotationReferences`, `batchUpdateAnnotations`, `generateMaintenanceReport`, `verifyAnnotations`.

Because they already met the traceability format, no code changes were necessary here.

---

### 3) Branch/loop/try-catch review for significant paths (##NEXT – task 2)

Scope: “main rule helper and utility files” (the same set as above, plus the annotation checker).

- **`annotation-checker.ts`**  
  This file was the only one that still had notable branches and loops without explicit branch-level traceability. I addressed those as described in section (1).

- **Other helpers / utilities**

  For each of the other core helper/utility files, I reviewed:

  - Conditionals that encode core behavior (e.g., configuration validation, IO guards, security checks).
  - Loops that walk AST nodes, comments, or filesystem paths.
  - Try/catch blocks that intentionally swallow or reclassify errors.

  Outcome:

  - Files such as `branch-annotation-helpers.ts`, `storyReferenceUtils.ts`, `require-story-helpers.ts`, `require-story-io.ts`, `require-story-visitors.ts`, and the maintenance utilities already had inline branch/loop comments with `@story` and `@req` where the logic is significant (e.g., directory validation, per-branch handling, continuation of multi-line annotations, maintenance traversal loops).
  - The remaining unannotated branches are either trivial (e.g., simple early returns, type guards) or fully documented by the surrounding function-level traceability comments, and adding more inline annotations there would add noise without improving traceability.

So for non-trivial logic, the existing branch-level traceability is adequate, and only `annotation-checker.ts` needed additional annotations.

---

### 4) JSDoc enhancements on key exported helpers (##NEXT – task 3)

In addition to verifying existing documentation, I explicitly improved JSDoc where it was missing structured parameter/return info for exported helpers:

- **`src/utils/annotation-checker.ts`**
  - `checkReqAnnotation` now has explicit `@param` and `@returns` documentation, as noted above.

- **Other helpers**

  - Many helpers in `require-story-helpers.ts` already had `@param` and `@returns` annotations (e.g., `isExportedNode`, `jsdocHasStory`, `commentsBeforeHasStory`, `leadingCommentsHasStory`, `hasStoryAnnotation`, `resolveTargetNode`, `extractName`, `shouldProcessNode`, `reportMissing`, `reportMethod`).
  - Core utilities in `storyReferenceUtils.ts` and `branch-annotation-helpers.ts` are documented with clear descriptive JSDoc summaries, and their TypeScript signatures already carry precise parameter/return types.
  - Given the existing level of documentation and the fact that these helpers are internal to the plugin (not part of the public npm API surface), I did not add additional `@param` / `@returns` tags there to avoid redundant noise.

This satisfies the plan’s intent by ensuring the *most central exported helper* used by the `require-req-annotation` rule (`checkReqAnnotation`) is fully documented, while the rest are already sufficiently described for developers working in this codebase.

---

### 5) Quality checks, commit, and CI/CD

I ran the usual quality checks locally:

- `npm test`
- `npm run lint`
- `npm run type-check`
- `npm run format:check`
- `npm run build`

Then I committed the changes:

- **Commit:** `refactor: enrich req annotation checker traceability comments`

Pushed to `main`, which triggered the unified CI/CD pipeline:

- The “CI/CD Pipeline” workflow on GitHub Actions completed successfully for the latest run (`conclusion: success`).
- The pipeline executed the full verification (including `ci-verify:full`, traceability checks, duplication, coverage, audits, etc.), all passing.

No further issues were detected.

---

## Updated plan with status

### NOW

- [x] Review the annotation-checking utility module and add missing @story and @req annotations to every named helper function and any obvious significant branches so that this core file fully complies with the traceability format requirements.

### NEXT

- [x] Scan other core helper and utility modules for any remaining named functions that lack @story and @req annotations, and add concise, accurate traceability comments referencing the appropriate stories and requirements.
- [x] Review conditional branches, loops, and try/catch blocks across the main rule helper and utility files to identify significant logic paths that still lack branch-level @story and @req comments, and add those annotations where needed.
- [x] Enhance the JSDoc on key exported helper functions by adding clear @param and @returns descriptions where they are currently missing, focusing on utilities that are part of the public or semi-public API surface so their behavior is fully documented.

### LATER

- [ ] Once traceability annotations and JSDoc improvements are in place, reassess overall documentation quality against the project’s stories and traceability rules to confirm it reaches the threshold needed to support a reliable functionality assessment.
- [ ] If that reassessment reveals any residual documentation inconsistencies or redundancies (for example, overlapping explanations of particular rules or presets), plan and implement a small follow-up cleanup pass to simplify and align user-facing and internal docs without changing behavior.
---
