Here’s the history-only summary of what’s been done so far, in chronological order.

---

## Test Duplication Reduction

- Used `jscpd` to find duplication in `tests/utils/annotation-checker.test.ts`.
- Refactored tests to reuse `withTsLanguageOptions` from `tests/utils/ts-language-options.ts`.
- Re-ran tests and `jscpd` to confirm behavior and reduced duplication.
- Committed as `test: refactor annotation-checker RuleTester setup to shared helper`.

---

## Traceability Annotation Improvements

- Added and refined `@supports` annotations in:
  - `src/maintenance/cli.ts`
  - `src/maintenance/detect.ts`
  - `src/rules/helpers/valid-annotation-utils.ts`
  - `src/rules/helpers/valid-story-reference-helpers.ts`
  - `src/utils/annotation-checker.ts` (moved missing-`@req` autofix annotation).
- Ran `npm run check:traceability` and project CI.
- Committed as `chore: improve traceability annotations for maintenance and validation helpers`.

---

## Documentation Separation and Cleanup

- Reviewed which docs are user-facing vs internal.
- Updated:
  - `SECURITY.md` to remove internal links.
  - `CONTRIBUTING.md` to avoid internal-only references.
  - `user-docs/api-reference.md` and `user-docs/migration-guide.md` to clarify `docs/stories/...` as consumer-owned examples.
- Ran `npm run ci-verify:full`; CI run `19935224744` passed.
- Committed as `docs: remove user-facing references to internal docs`.

---

## CODE_QUALITY Slice Strategy

- Documented four code-quality “slices” in `docs/code-quality-assessment-slices.md`.
- Added `.voder-code-quality-slices.json` with machine-readable definitions.
- Wrote `docs/code-quality-assessment-guide.md` describing slice selection and baseline slice.
- Updated `docs/ci-cd-pipeline.md` with a “CODE_QUALITY Slices” section.
- CI run `19935786345` passed.
- Committed as `docs: document CODE_QUALITY slice strategy`.

---

## Clarifying CODE_QUALITY Interpretation and Dependencies

- Refined `docs/code-quality-assessment-guide.md` to define:
  - What a valid `rules-and-helpers` assessment is.
  - Passing criteria and finding classifications.
  - “Context-failure” as “not run”.
- Updated:
  - `docs/decisions/003-code-quality-ratcheting-plan.md` to bind enforcement to `rules-and-helpers`.
  - `docs/functionality-coverage-2025-12-03.md` to note dependency on a passing slice run.
- Re-ran full checks; CI `19936091302` passed.
- Committed as `docs: clarify code-quality slice interpretation and dependencies`.

---

## Rename Multi-Story Annotation from `@implements` to `@supports`

- Confirmed `@supports` as canonical via Story 010.2 and ADRs 010/011.

**Docs:**

- Updated ADR 011, Story 010.2, `README.md`, `user-docs/api-reference.md`, and `user-docs/migration-guide.md` to use `@supports` and deprecate `@implements`.
- Updated rule docs for `valid-annotation-format`, `valid-req-reference`, and `prefer-implements-annotation`.

**Implementation:**

- Updated parsing and behavior in:
  - `valid-annotation-format-internal.ts`
  - `valid-implements-utils.ts`
  - `valid-annotation-format.ts`
  - `valid-req-reference.ts`
  - `src/utils/reqAnnotationDetection.ts`
  - `require-story-io.ts`
  - `prefer-implements-annotation.ts` (now migrates to `@supports`).

**Tests & tooling:**

- Updated rule tests to use `@supports`.
- Changed Husky hook from `"postinstall"` to `"prepare"` in `package.json`.
- Ran full checks; CI passed.
- Committed as:
  - `fix: rename multi-story annotation from @implements to @supports`
  - `fix: avoid running husky in consumers and repair smoke test`.

---

## New Rule: `traceability/require-test-traceability` (Story 020.0)

- Implemented `src/rules/require-test-traceability.ts`:
  - Detects test files.
  - Enforces file-level `@supports`.
  - Checks story references in `describe`.
  - Requires `[REQ-XXX]` prefixes in tests.
- Added `tests/rules/require-test-traceability.test.ts`.
- Exported the rule and documented it in `user-docs/api-reference.md`.
- Ran full checks; CI passed.
- Committed as `feat: add require-test-traceability rule for test files`.

---

## Safe Auto-Fix for `require-test-traceability` (Story 021.0)

- Introduced auto-fix options and `fixable: "code"` for the rule.
- Extracted helpers into `src/rules/helpers/require-test-traceability-helpers.ts` for:
  - Test-file detection.
  - Safe insertion of placeholder `@supports`.
  - Normalizing malformed REQ prefixes.
- Updated rule wiring, tests, and docs.
- Ran tests, lint, type-check, build, format; CI passed.
- Committed as `feat: add safe auto-fix support for test traceability rule`.

---

## Ignoring Generated Assessment and CI Artifacts

- Added `.gitignore` patterns for:
  - `scripts/*-report.md`
  - `.voder-*.json`
  - `.voder-jscpd-report/*`
- Removed tracked instances from the index.
- Re-ran build, tests, lint, type-check, format.
- Committed as `chore: ignore generated assessment and ci report artifacts`.

---

## CI Tooling Engine Alignment and Workflow Updates

- Checked `semantic-release` Node engine requirements.
- Updated `.github/workflows/ci-cd.yml`:
  - `quality-and-deploy` matrix to Node `22.14.0` only.
  - `dependency-health` job to `22.14.0`.
  - Adjusted `semantic-release` condition and comments.
- Ran full checks; CI succeeded.
- Committed as `ci: align workflow node version with semantic-release engines`.

---

## CI/CD Docs Sync and Ephemeral Artifacts

- Updated `docs/ci-cd-pipeline.md` to:
  - Document Node `22.14.0` usage in CI and semantic-release.
  - Clarify consumer `engines.node >=18.18.0`.
  - Describe ignored ephemeral `.voder*` and report artifacts.
- Ran checks; CI passed.
- Committed as:
  - `docs: document ignored ephemeral ci and assessment artifacts`
  - `docs: sync ci-cd documentation with updated workflow node version`.

---

## JSDoc Coexistence for Annotation Parsing (Story 022.0)

- Clarified coexistence of traceability tags with regular JSDoc tags.

**Implementation:**

- Updated `valid-annotation-format-internal.ts` so non-traceability `@tag` lines act as boundaries.
- Updated `valid-annotation-format.ts` to finalize pending annotations on those lines.
- Extracted validators/finalizers into `valid-annotation-format-validators.ts`.

**Tests & docs:**

- Expanded `tests/rules/valid-annotation-format.test.ts` for JSDoc coexistence.
- Updated `docs/rules/valid-annotation-format.md` with a JSDoc coexistence section.
- Ran tests, lint, build, format; CI run `19950791613` passed.
- Committed as `fix: support JSDoc tag coexistence for annotation parsing`.

---

## README and Docs Updates for Test Traceability & Annotation Alignment

- Added `traceability/require-test-traceability` to `README.md` “Available Rules”.
- Standardized internal traceability comments from `@implements` to `@supports` across:
  - `src/maintenance/*`
  - `src/utils/annotation-checker.ts`
  - `src/rules/helpers/valid-story-reference-helpers.ts`
  - `src/rules/helpers/valid-annotation-utils.ts`
  - `src/rules/prefer-implements-annotation.ts`
  - `tests/utils/temp-dir-helpers.ts`
- Verified only descriptive `@implements` mentions remain.
- Synced security docs and CI workflow with `package.json` security scripts.
- Extended `user-docs/examples.md` with a test-traceability example using canonical `@supports story#REQ`.
- Ran `npm run ci-verify:fast`; CI stayed green.
- Committed under multiple messages, including:
  - `docs: document test traceability rule and align CLI annotations`
  - `chore: migrate maintenance and helper annotations to supports tag`
  - `docs: add test traceability rule to README and examples`
  - `chore: standardize @supports traceability annotations`
  - `docs: align test traceability example with @supports syntax`.

---

## Alignment of `require-test-traceability` Docs with Implementation

- Clarified `testFilePatterns` semantics (substring-based, slash-normalized).

**Changes:**

- Updated JSDoc and `meta.schema` defaults in `src/rules/require-test-traceability.ts`.
- Updated `user-docs/api-reference.md` with exact defaults and behavior.
- Ran lint and tests.
- Committed as `docs: align require-test-traceability docs with implementation`.

---

## Traceability Annotations for `prefer-implements-annotation` Helpers

- Added `@supports` annotations in `src/rules/prefer-implements-annotation.ts` for:
  - `CommentAnalysis`
  - `collectStoryAndReqMetadata`
  - `applyImplementsReplacement`
  - `analyzeComment`
  - `processComment`
- Confirmed other annotations in the file were sufficient.
- Ran lint, tests, build, type-check, format checks; CI run `19951915485` passed.
- Committed as `chore: add traceability annotations for prefer-implements-annotation helpers`.

---

## Additional Traceability Helper Review

- Reviewed `src/rules/helpers/valid-implements-utils.ts` for annotation coverage and exports.
- Determined no changes were necessary; existing checks continued to pass.

---

## Centralization of Maintenance and Debug Scripts

- Cataloged `scripts/` tools and identified CI-wired vs “orphaned” scripts.
- Added NPM wrappers in `package.json`:
  - `check:ci-artifacts`
  - `coverage:branches`
  - `debug:cli`
  - `debug:require-story`
  - `debug:repro`
  - `report:eslint-suppressions`
  - `check:scripts`
- Ran these plus `ci-verify:fast`, build, tests, lint, type-check, format:check.
- Committed as `chore: centralize maintenance and debug scripts via npm scripts`.

---

## Documentation of Centralized Maintenance and Debug Scripts

- Updated `docs/ci-cd-pipeline.md` to:
  - Reference `npm run check:scripts`.
  - Document the new maintenance/debug scripts and their purposes.
- Ran build, tests, lint, type-check, format:check.
- Committed as `docs: document centralized maintenance and debug scripts`.

---

## Maintenance Tools Performance Targets and Tests

### Performance Targets Documentation

- Created `docs/maintenance-performance-tests.md` describing:
  - Critical maintenance/CLI workflows.
  - Synthetic large-workspace targets.
  - Fixture design principles (temp dirs, deterministic layouts, valid vs stale refs).
- Ran tests and lint.
- Committed as `docs: document maintenance performance targets`.

### Core Maintenance API Performance Tests

- Added `tests/perf/maintenance-large-workspace.test.ts`:
  - Builds ~500-file synthetic workspace with mixed valid/stale `@story` refs.
  - Measures:
    - `detectStaleAnnotations`
    - `verifyAnnotations`
    - `generateMaintenanceReport`
    - `updateAnnotationReferences`
    - `batchUpdateAnnotations`
  - Enforces <5s timing guardrails and basic correctness.
- Ran perf tests individually and in the full suite; duplication/format checks included.
- Committed as `test: add performance tests for maintenance tools`.

### Maintenance CLI Performance Tests

- Added `tests/perf/maintenance-cli-large-workspace.test.ts`:
  - Creates 100-file synthetic workspace.
  - Uses `runMaintenanceCli` to exercise:
    - `detect --json`
    - `report --format=json`
  - Asserts <5s timing, exit codes, and payload shape.
- Ran CLI perf tests and full pipeline (test/lint/type-check/format).
- CI “CI/CD Pipeline” succeeded.

### Expanded Performance Test Documentation

- Updated `docs/maintenance-performance-tests.md` with:
  - Test locations and commands.
  - When to run the tests.
  - How to interpret results and investigate issues.
- Ran formatting and full quality checks.
- Committed as `docs: expand maintenance performance test guidance`.

---

## Configurable Auto-Fix Templates and Toggles (Story 008.0)

### `require-story-annotation` Configuration

- Updated `src/rules/require-story-annotation.ts`:
  - Extended schema with `annotationTemplate`, `methodAnnotationTemplate`, and `autoFix`.
  - In `create(context)`, derived resolved templates and `autoFix` (default `true`).
  - Passed these into `buildVisitors`.

- Enhanced `src/rules/helpers/require-story-helpers.ts`:
  - Added `getAnnotationTemplate(override?)`:
    - Returns trimmed override when present.
    - Otherwise returns the original default:
      `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`.
  - Added `shouldApplyAutoFix(autoFix?)` to gate actual fixes while still providing suggestions.
  - Introduced `ReportOptions` and updated `reportMissing` / `reportMethod` to accept a config object and:
    - Compute `effectiveTemplate` via `getAnnotationTemplate`.
    - Use `shouldApplyAutoFix` to decide whether to attach a `fix` function.

- Refactored `src/rules/helpers/require-story-core.ts`:
  - `createAddStoryFix(target, annotationTemplate)` and
    `createMethodFix(node, annotationTemplate)` now require the template string and embed it in the inserted text.
  - Removed obsolete core-level `reportMissing`/`reportMethod` functions (later reintroduced in a new injected form; see below).

- Updated `src/rules/helpers/require-story-visitors.ts`:
  - Visitors now pass config objects into `reportMissing` / `reportMethod`, threading:
    - `annotationTemplate`
    - `methodAnnotationTemplate`
    - `autoFix`.

### `valid-annotation-format` Auto-Fix Toggle

- Updated `src/rules/helpers/valid-annotation-options.ts`:
  - `AnnotationRuleOptions` now supports `autoFix?: boolean`.
  - `ResolvedAnnotationOptions` gained `autoFix: boolean`.
  - `resolveOptions` now derives `autoFix` with a default of `true`.

- Updated `src/rules/helpers/valid-annotation-format-validators.ts`:
  - `validateStoryAnnotation` now:
    - Applies suffix-normalization fixes only when `options.autoFix !== false`.
    - Otherwise reports invalid format without fixing.

### Tests and Helper Adjustments

- Extended `tests/rules/auto-fix-behavior-008.test.ts`:
  - Added a case for custom `annotationTemplate` and `methodAnnotationTemplate`.
  - Added a case where `autoFix: false` on `require-story-annotation` reports but does not modify output.

- Updated tests to reflect new APIs:
  - `tests/rules/require-story-core.test.ts`
  - `tests/rules/require-story-core.autofix.test.ts`
  - `tests/rules/require-story-helpers.test.ts`
  - `tests/rules/require-story-helpers-edgecases.test.ts`
  - `tests/utils/require-story-core-test-helpers.ts`
  - Adjusted to:
    - Pass annotation templates to `createAddStoryFix`/`createMethodFix`.
    - Use config-based signatures for `reportMissing`/`reportMethod`.
    - Relax or preserve expectations on inserted text as needed while maintaining behavior assertions.

### Docs and Story 008.0 Alignment

- Updated `user-docs/api-reference.md`:
  - Documented for `traceability/require-story-annotation`:
    - `annotationTemplate`
    - `methodAnnotationTemplate`
    - `autoFix` (with unchanged default template).
  - Documented `autoFix` for `traceability/valid-annotation-format` to disable suffix-normalization fixes when `false`.

- Updated `docs/stories/008.0-DEV-AUTO-FIX.story.md`:
  - Marked `REQ-AUTOFIX-TEMPLATE` as implemented via templates.
  - Marked `REQ-AUTOFIX-SELECTIVE` as implemented via `autoFix` in both rules.
  - Updated Technical Considerations to confirm configurability and default behavior.

- Ran:
  - `npm test -- --runInBand`
  - `npm run lint`
  - `npm run type-check`
  - `npm run build`
  - `npm run format` and `npm run format:check`
- Committed as `feat: add configurable auto-fix templates and toggles` (with a follow-up refinement commit).
- CI/CD Pipeline completed successfully.

---

## Complexity Hotspot Identification and Refactor of `require-story` Helpers/IO

### Complexity Assessment

- Used ESLint with aggressive temporary rules to find complexity hotspots:

  ```bash
  npx eslint --config eslint.config.js \
    src/rules/helpers src/utils src/maintenance/flags.ts \
    --format json --output-file eslint-complexity-report.json \
    --rule complexity:error \
    --rule max-lines-per-function:error \
    --rule max-lines:error

  npx eslint --config eslint.config.js \
    src/rules/helpers src/maintenance \
    --format json --output-file eslint-complexity-report-detailed.json \
    --rule complexity:["error",{"max":1}]
  ```

- Findings:
  - `src/rules/helpers/require-story-helpers.ts`:
    - Multiple functions above the strict test limit.
    - File exceeded `max-lines` (306 > 300).
  - `src/rules/helpers/require-story-io.ts`:
    - `fallbackTextBeforeHasStory` was highly complex.
  - Other helpers/maintenance files had moderate complexity but within the actual project limit (`max: 18`).

- Selected `require-story-helpers.ts` and its IO counterpart as the primary refactor target.

### Refactor of `fallbackTextBeforeHasStory` in `require-story-io.ts`

- Introduced three internal helpers and simplified the main function:

  1. `getFallbackRangeStart(sourceCode, node): number | null`
     - Centralizes guards around `sourceCode.getText` and `node.range`.
     - Returns `null` if `getText` is unavailable or `range` is invalid.
     - JSDoc references `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md` and `REQ-ANNOTATION-REQUIRED`.

  2. `getFallbackTextWindow(sourceCode, nodeStartIndex): string | null`
     - Computes a bounded window using `FALLBACK_WINDOW`.
     - Uses `sourceCode.getText().slice(start, nodeStartIndex)` inside try/catch.
     - Returns `null` on non-string result or any error (treated as “no annotation”).
     - JSDoc references the same story/requirement, emphasizing safe, fixed-size scanning and non-fatal failures.

  3. `fallbackTextHasMarker(textBefore): boolean`
     - Returns `false` if the input is not a string.
     - Checks for `"@story"` or `"@supports"` in the text.
     - JSDoc references:
       - `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md`
       - `docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md`
       - `REQ-ANNOTATION-REQUIRED`
       - `REQ-REQUIRE-ACCEPTS-IMPLEMENTS`.

- Rewrote `fallbackTextBeforeHasStory` to:

  - Call `getFallbackRangeStart` and abort with `false` on `null`.
  - Call `getFallbackTextWindow` and pass the result into `fallbackTextHasMarker`.
  - Preserve the original JSDoc and external API.

- Behavior confirmed unchanged by existing tests.

### Simplifications in `require-story-helpers.ts`

**1. Removed Local LOOKBACK/FALLBACK Constants**

- Deleted local `LOOKBACK_LINES` and `FALLBACK_WINDOW` plus their JSDoc.
- Left `linesBeforeHasStory`, `parentChainHasStory`, `fallbackTextBeforeHasStory` imported from `./require-story-io`.
- Updated `hasStoryAnnotation` to:

  ```ts
  if (linesBeforeHasStory(sourceCode, node)) {
    return true;
  }
  ```

- Reduced duplication and lines while preserving behavior via IO defaults.

**2. Centralized STORY_PATH in `require-story-core.ts`**

- Added in `src/rules/helpers/require-story-core.ts`:

  ```ts
  /**
   * Path to the story file for function-annotation helpers.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-REQUIRED - Provide a single source of truth for the canonical story path used by helper modules
   */
  export const STORY_PATH =
    "docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md";
  ```

- Removed local `STORY_PATH` from `require-story-helpers.ts`.
- Imported `STORY_PATH` from core and continued using it in `getAnnotationTemplate`.

**3. Reduced `extractName` Cyclomatic Complexity**

- Introduced:

  - `getDirectIdentifierName(node): string | null`
    - Extracts `Identifier` names with non-empty `name`.
    - JSDoc references story 003.0 and `REQ-ANNOTATION-REQUIRED`.

  - `getContainerKeyOrIdName(node): string | null`
    - Checks `node.id` via `getNodeName`.
    - Checks `node.key` via `getNodeName` and falls back to literal string `value` when appropriate.
    - JSDoc references story 003.0 and `REQ-ANNOTATION-REQUIRED`.

- Rewrote `extractName` to:

  - Loop over `current` while truthy.
  - First call `getDirectIdentifierName(current)` and return if non-null.
  - Then call `getContainerKeyOrIdName(current)` and return if non-null.
  - Then fall back to direct `current.name` when a non-empty string.
  - Walk up via `current = current.parent`.
  - Return `"(anonymous)"` when nothing found.

- Maintained observable behavior while lowering per-function complexity.

**4. Moved Reporting Logic to Core with Dependency Injection**

- In `require-story-core.ts`:

  - Imported `Rule` type from `eslint`.
  - Introduced:

    ```ts
    type CoreReportOptions = {
      annotationTemplateOverride?: string;
      autoFixToggle?: boolean;
    };

    type ReportDeps = {
      hasStoryAnnotation: (_sourceCode: any, _node: any) => boolean;
      getReportedFunctionName: (_node: any) => string;
      resolveAnnotationTargetNode: (
        _sourceCode: any,
        _node: any,
        _passedTarget: any,
      ) => any;
      getNameNodeForReport: (_node: any) => any;
      buildTemplateConfig: (
        _options?: CoreReportOptions,
      ) => { effectiveTemplate: string; allowFix: boolean };
      extractName: (_node: any) => string;
      getAnnotationTemplate: (_override?: string) => string;
      shouldApplyAutoFix: (_autoFix: boolean | undefined) => boolean;
      createAddStoryFix: (_target: any, _annotationTemplate: string) => any;
      createMethodFix: (_node: any, _annotationTemplate: string) => any;
    };
    ```

  - Implemented `coreReportMissing`:

    - Uses `deps.hasStoryAnnotation` to early-return when annotation already exists.
    - Computes:
      - `functionName` via `deps.getReportedFunctionName`.
      - `resolvedTarget` via `deps.resolveAnnotationTargetNode`.
      - `nameNode` via `deps.getNameNodeForReport`.
      - `{ effectiveTemplate, allowFix }` via `deps.buildTemplateConfig`.
    - Calls `context.report` with:
      - `messageId: "missingStory"`.
      - `data: { name, functionName: name }`.
      - `fix`: conditional on `allowFix`, using `deps.createAddStoryFix`.
      - `suggest`: always present, with the same template-based fix.
    - Wraps logic in try/catch to avoid throwing from lint.

    - JSDoc references:
      - `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md`
      - `docs/stories/007.0-DEV-ERROR-REPORTING.story.md`
      - `docs/stories/008.0-DEV-AUTO-FIX.story.md`
      - `REQ-ANNOTATION-REQUIRED`
      - `REQ-AUTOFIX-MISSING`
      - `REQ-ERROR-SPECIFIC`.

  - Implemented `coreReportMethod`:

    - Checks `deps.hasStoryAnnotation` and returns if already annotated.
    - Determines `resolvedTarget` via provided `target` or `deps.resolveAnnotationTargetNode`.
    - Derives `name` via `deps.extractName`.
    - Chooses `nameNode` as `node.key` when it’s an `Identifier`; otherwise `node`.
    - Uses:
      - `effectiveTemplate` via `deps.getAnnotationTemplate`.
      - `allowFix` via `deps.shouldApplyAutoFix`.
    - Calls `context.report` analogously to `coreReportMissing` but using `deps.createMethodFix`.

    - JSDoc mirrors `coreReportMissing`.

- In `require-story-helpers.ts`:

  - Removed the previous local implementations of `reportMissing` and `reportMethod`.
  - Imported `coreReportMissing` and `coreReportMethod`.
  - Implemented thin wrappers:

    ```ts
    function reportMissing(
      context: Rule.RuleContext,
      sourceCode: any,
      config: { node: any; target?: any; options?: ReportOptions },
    ): void {
      coreReportMissing(
        {
          hasStoryAnnotation,
          getReportedFunctionName,
          resolveAnnotationTargetNode,
          getNameNodeForReport,
          buildTemplateConfig,
          extractName,
          getAnnotationTemplate,
          shouldApplyAutoFix,
          createAddStoryFix,
          createMethodFix,
        },
        context,
        sourceCode,
        config,
      );
    }

    function reportMethod(
      context: Rule.RuleContext,
      sourceCode: any,
      config: { node: any; target?: any; options?: ReportOptions },
    ): void {
      coreReportMethod(
        {
          hasStoryAnnotation,
          getReportedFunctionName,
          resolveAnnotationTargetNode,
          getNameNodeForReport,
          buildTemplateConfig,
          extractName,
          getAnnotationTemplate,
          shouldApplyAutoFix,
          createAddStoryFix,
          createMethodFix,
        },
        context,
        sourceCode,
        config,
      );
    }
    ```

  - Kept `reportMissing` and `reportMethod` exported for callers.
  - Updated the explicit export list to remove items no longer defined locally (e.g., `LOOKBACK_LINES`, `FALLBACK_WINDOW`) while retaining the public API surface that remains valid.

### Verification, Commit, and CI

- Ran targeted and full checks:

  - `npm test -- --runTestsByPath tests/rules/require-story-helpers.test.ts`
  - `npx eslint --config eslint.config.js src/rules/helpers/require-story-io.ts src/rules/helpers/require-story-helpers.ts src/utils/annotation-checker.ts src/utils/reqAnnotationDetection.ts src/maintenance/flags.ts --max-warnings 0`
  - `npx eslint --config eslint.config.js src/rules/helpers/require-story-core.ts --max-warnings 0`
  - `npm run build`
  - `npm test`
  - `npm run lint`
  - `npm run type-check`
  - `npm run format:check`

- Staged and committed as:

  ```text
  refactor: reduce complexity in require-story helpers and IO
  ```

- Pushed to `main`.
- GitHub “CI/CD Pipeline” workflow ran to completion with `conclusion: success` (including full `ci-verify:full`).

**Most recently we've executed the following action:**

---
Used tool: run_command with input: {"command":"git","args":["status","-sb"]}
Used tool: run_command with input: {"command":"git","args":["ls-files"]}
Used tool: read_file with input: {"filePath":".gitignore"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: read_file with input: {"filePath":"scripts/check-no-tracked-ci-artifacts.js"}
Used tool: read_file with input: {"filePath":"scripts/report-eslint-suppressions.js"}
Used tool: read_file with input: {"filePath":"scripts/traceability-check.js"}
Used tool: read_file with input: {"filePath":"scripts/ci-audit.js"}
Used tool: search_file_content with input: {"filePath":".voder/implementation-progress.md","pattern":"## NOW","isRegex":false}
Used tool: read_file with input: {"filePath":"coverage-tmp/coverage-summary.json"}
Used tool: read_file with input: {"filePath":"eslint-complexity-report.json"}
Used tool: read_file with input: {"filePath":"eslint-complexity-report-detailed.json"}
Used tool: read_file with input: {"filePath":"scripts/eslint-suppressions-report.md"}
Used tool: read_file with input: {"filePath":"scripts/traceability-report.md"}
Used tool: read_file with input: {"filePath":"scripts/ci-safety-deps.js"}
Used tool: read_file with input: {"filePath":"scripts/generate-dev-deps-audit.js"}
Used tool: read_file with input: {"filePath":"scripts/extract-uncovered-branches.js"}
Used tool: read_file with input: {"filePath":"scripts/cli-debug.js"}
Used tool: search_file_content with input: {"filePath":"package.json","pattern":"coverage-tmp","isRegex":false}
Used tool: search_file_content with input: {"filePath":".gitignore","pattern":"coverage-tmp","isRegex":false}
Used tool: search_file_content with input: {"filePath":"package.json","pattern":"eslint-complexity-report","isRegex":false}
Used tool: find_files with input: {"pattern":"*coverage-tmp*","directory":"."}
Used tool: search_file_content with input: {"filePath":"package.json","pattern":"complexity","isRegex":false}
Used tool: run_command with input: {"command":"git","args":["log","-n","5","--oneline"]}
Used tool: search_file_content with input: {"filePath":".gitignore","pattern":"coverage-tmp/","isRegex":false}
Used tool: modify_file with input: {"filePath":".gitignore","instruction":"Append the following lines at the end of the file:\n\n\n# Coverage summary temp directory\ncoverage-tmp/\n\n# ESLint complexity JSON reports\neslint-complexity-report.json\neslint-complexity-report-detailed.json\n"}
Used tool: run_command with input: {"command":"git","args":["rm","--cached","coverage-tmp/coverage-summary.json","eslint-complexity-report.json","eslint-complexity-report-detailed.json"]}
Used tool: run_command with input: {"command":"git","args":["status","-sb"]}
Used tool: run_command with input: {"command":"git","args":["ls-files"]}
Used tool: run_command with input: {"command":"npm","args":["run","check:ci-artifacts"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"chore: ignore and remove generated coverage and complexity reports"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci","--bail"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19956138474,"timeout":600000}
---

**This was the result:**
---
Here’s what I implemented for the **##NOW** and **##NEXT** sections, plus the updated plan with checkmarks.

---

## What I did for ##NOW

### [x] Review the current repository contents to identify generated reports/coverage/CI artifacts that are still tracked and classify them.

I inspected the tracked file set and relevant scripts:

- Used:
  - `git status -sb`
  - `git ls-files`
  - Read `.gitignore` and key scripts under `scripts/`.

### Tracked generated artifacts I identified

From `git ls-files` and file contents, the only **generated** artifacts that were still tracked were:

1. **Coverage summary (Jest)**  
   - `coverage-tmp/coverage-summary.json`  
   - Clearly a Jest coverage output: contains per-file coverage metrics under absolute paths.

2. **ESLint complexity reports**  
   - `eslint-complexity-report.json`  
   - `eslint-complexity-report-detailed.json`  
   - JSON output from previous one-off ESLint runs with complexity/max-lines rules, not hand-authored source or documentation.

These are ephemeral analysis outputs, not source/config/docs.

### Generated artifacts already handled (not tracked)

During the review I also confirmed some artifacts **are not tracked but already ignored**, which aligns with the intent:

- CI audit / maturity outputs:
  - `ci/npm-audit.json` (from `scripts/ci-audit.js`)
  - `ci/dry-aged-deps.json` (from `scripts/ci-safety-deps.js`)
  - Both live under `ci/`, and `.gitignore` already has `ci/`.  
  - `npm run check:ci-artifacts` (which walks `git ls-files` for any `ci/` paths) passes with no findings.

- Script-generated Markdown reports:
  - `scripts/eslint-suppressions-report.md` (from `scripts/report-eslint-suppressions.js`)
  - `scripts/traceability-report.md` (from `scripts/traceability-check.js`)
  - Both paths are explicitly ignored in `.gitignore`:
    - `scripts/eslint-suppressions-report.md`
    - `scripts/traceability-report.md`
  - `git ls-files` confirms these `.md` files are not tracked.

**Classification summary:**

- **Transient / generated & should NOT be tracked:**
  - `coverage-tmp/coverage-summary.json`
  - `eslint-complexity-report.json`
  - `eslint-complexity-report-detailed.json`
  - `ci/npm-audit.json`, `ci/dry-aged-deps.json`
  - `scripts/eslint-suppressions-report.md`
  - `scripts/traceability-report.md`

- **Legitimate source/config/docs & SHOULD remain tracked:**
  - All `src/**`, `tests/**`, `docs/**`, `user-docs/**`, `scripts/*.js`, configs, and `.voder/**` as currently in git.

This completes the **NOW** task.

---

## What I did for ##NEXT

### [x] Update ignore rules so generated reports/coverage/CI artifacts are excluded going forward

I updated `.gitignore` to explicitly ignore the remaining tracked artifacts:

Appended:

```gitignore
# Coverage summary temp directory
coverage-tmp/

# ESLint complexity JSON reports
eslint-complexity-report.json
eslint-complexity-report-detailed.json
```

Existing patterns already cover other generated artifacts:

- `coverage/` and `*.lcov`
- `ci/` (covers `ci/npm-audit.json`, `ci/dry-aged-deps.json`)
- `scripts/eslint-suppressions-report.md`
- `scripts/traceability-report.md`
- `scripts/tsc-output.md`

Together these ensure **all known generated reports and CI artifacts are ignored**.

---

### [x] Remove already-tracked generated reports and CI artifacts from version control

I untracked the three remaining generated files while keeping them locally:

```bash
git rm --cached coverage-tmp/coverage-summary.json \
  eslint-complexity-report.json \
  eslint-complexity-report-detailed.json
```

`git ls-files` after this change confirms:

- `coverage-tmp/coverage-summary.json` – no longer in git
- `eslint-complexity-report.json` – no longer in git
- `eslint-complexity-report-detailed.json` – no longer in git

Only source, configuration, documentation, and `.voder/**` remain tracked.

These changes were committed as:

```text
chore: ignore and remove generated coverage and complexity reports
```

---

### [x] Verify maintenance/CI scripts that produce these reports still function with outputs treated as transient

I verified behavior on both local and CI paths:

1. **Local quality checks (non-CI)**

   Ran the full local suite using project scripts:

   - `npm run build`
   - `npm test -- --runInBand --ci --bail`
   - `npm run lint -- --max-warnings=0`
   - `npm run type-check`
   - `npm run format:check`

   All passed successfully, demonstrating that:

   - Jest still produces coverage (including `coverage-tmp/coverage-summary.json`) without needing it in git.
   - ESLint and the plugin still work as before.
   - No script relies on those files being tracked.

2. **CI-style checks (pre-push and GitHub Actions)**

   - The `git push` triggered Husky’s pre-push hook:

     ```text
     > eslint-plugin-traceability@1.0.5 ci-verify:full
     ...
     > eslint-plugin-traceability@1.0.5 test
     > jest --ci --bail --coverage
     ...
     > eslint-plugin-traceability@1.0.5 format:check
     ```

     This run:
     - Generated coverage (including temp coverage data).
     - Ran `scripts/traceability-check.js`, which wrote `scripts/traceability-report.md`.
     - Ran `scripts/ci-audit.js` and `scripts/ci-safety-deps.js`, which wrote to `ci/npm-audit.json` and `ci/dry-aged-deps.json`.

     All succeeded, and since these output locations are now ignored, they function as **transient artifacts only**, not part of version control.

   - On GitHub, I monitored the pipeline:

     - Latest run: **“CI/CD Pipeline”**, run ID `19956138474`
     - Conclusion: **success**

   This confirms CI and all maintenance scripts still behave correctly with their outputs treated as ephemeral.

---

### [x] Confirm no remaining tracked files that look like generated reports/CI artifacts

I validated in two ways:

1. **Tracked file scan**

   - Re-ran: `git ls-files`
   - Verified:
     - No `coverage-tmp/**` entries.
     - No `eslint-complexity-report*.json` entries.
     - No `ci/**` files tracked (only the `scripts/*.js` that write into `ci/`).
     - No tracked `scripts/*-report.*` or other obviously generated report files.

2. **Automated CI-artifact checker**

   Ran:

   ```bash
   npm run check:ci-artifacts
   ```

   Output:

   ```text
   > eslint-plugin-traceability@1.0.5 check:ci-artifacts
   > node scripts/check-no-tracked-ci-artifacts.js
   ```

   Exit code `0`, confirming:
   - No tracked files under any `ci/` directory (excluding `.voder/ci/`, which we don’t use).
   - This is consistent with the manual `git ls-files` check.

At this point, **all known generated reports, coverage summaries, and CI outputs are either untracked and ignored or never tracked in the first place**.

---

## Updated Plan with Checkmarks

### NOW

- [x] Review the current repository contents to identify all files that are clearly generated reports, coverage outputs, or CI artifacts that are still tracked, and classify which of them should be treated as transient build or assessment outputs rather than source or documentation.

### NEXT

- [x] Update the repository’s ignore rules so that all identified generated reports, coverage outputs, and CI artifacts are excluded from version control going forward while keeping source, configuration, and documentation files tracked.
- [x] Remove the already-tracked generated reports and CI artifacts from version control so that the tracked file set contains only source, configuration, and documentation files.
- [x] Verify that any maintenance or CI scripts that produce these reports still function correctly with the outputs treated as transient files, adjusting script paths or documentation comments if necessary to make their transient nature explicit.
- [x] Confirm that there are no remaining tracked files that match the patterns of generated reports or CI artifacts by re-reviewing the tracked file list after cleanup.

### LATER (not executed in this task)

- [ ] Introduce or refine an automated check in the development tooling that fails if generated reports or CI artifacts are accidentally committed in the future, reinforcing the repository hygiene policy.
- [ ] Update internal development documentation to clearly list which directories and file patterns are considered ephemeral outputs so contributors know not to commit them.
- [ ] After repository hygiene is confirmed, re-evaluate the version control assessment and, once it passes thresholds, proceed with a full functionality assessment and any follow-up improvements it reveals.

---

If you’d like, next I can help re-run or interpret the VERSION_CONTROL assessment/score (once it’s recalculated) and then proceed with the FUNCTIONALITY evaluation that was previously blocked.
---
