Here’s a history-only summary of what’s been done so far on the project, including the most recent work:

1. **Refactor of `valid-req-reference` rule**
   - Extracted parsing, validation, traversal, and file I/O into `valid-req-reference-helpers.ts`.
   - Exposed `createValidReqReferenceProgramVisitor(context)` as the rule’s single entrypoint.
   - Simplified `src/rules/valid-req-reference.ts` to keep `meta`/`messages` and delegate `Program` to the helper visitor.
   - Ran full local quality checks (tests, lint, type-check, format, CI-verify) and confirmed CI success.
   - Updated development docs to explain the helper-module pattern and documented helper placement under `src/rules/helpers` and `src/utils`.

2. **Enhancements to `require-branch-annotation`**
   - Investigated behavior with different control-flow constructs and identified missing coverage for nested control flow and performance requirements (REQ-NESTED-HANDLING, REQ-PERFORMANCE-OPTIMIZATION).
   - Added nested-branch tests (valid/invalid nested `if` scenarios and autofix expectations for inner branches only).
   - Implemented a Jest performance test (`tests/perf/require-branch-annotation-large-file.test.ts`) using ESLint’s `Linter` to exercise deeply nested branches and assert runtime under 5000 ms while still producing diagnostics.
   - Fixed RuleTester expectations (adding `output` for invalid nested cases), reran the full quality suite, committed changes, and confirmed CI success.

3. **Test coverage and CI reliability**
   - Ran Jest with coverage and verified high coverage (~96.5% statements/lines, ~84.3% branches, ~99.6% functions).
   - Determined earlier coverage failures were due to missing `node_modules`, not code issues.
   - Validated `ci-verify:full` without requiring code changes.

4. **Maintenance CLI review and improvements**
   - Reviewed `src/maintenance/*.ts` and tests, identifying under-tested paths in `verify`, `report`, CLI perf, and an extra `fs.statSync` branch in `update.ts`.
   - Added targeted tests:
     - `verify` exits with code 1 and prints guidance when annotations are stale/invalid.
     - `report` prints “nothing to report” and exits 0 when no stale annotations are found.
     - Renamed a detect test to clarify behavior around permission-denied errors.
   - Simplified `src/maintenance/update.ts` by removing redundant `fs.statSync`/is-file checks, documenting reliance on `getAllFiles`, and achieved full coverage for `update.ts`.
   - Extended the maintenance CLI perf test (`maintenance-cli-large-workspace.test.ts`) to include `verify` performance on a synthetic large workspace, checking exit code 1, runtime under 5000 ms, and appropriate output.
   - Ran focused and full maintenance tests, updated `.voder/plan.md` to mark maintenance review/testing as complete, committed changes, and confirmed CI success.

5. **Dogfooding and traceability enforcement**
   - Performed a dogfooding inspection pass (Story 023): reviewed the story and problem doc, ESLint/Jest/TS/CI/Husky configs, plugin/rule entrypoints, internal scripts, and traceability checks; ran `npm run check:traceability` to understand current behavior.
   - Enabled `traceability/require-story-annotation` for TypeScript files in `eslint.config.js`, ensuring application to `src` and `tests`.
   - Adjusted test overrides to avoid unnecessary inline `eslint-disable` comments; verified with `npm run report:eslint-suppressions`.
   - Added `tests/integration/dogfooding-validation.test.ts` to:
     - Assert that the TS ESLint config block sets `traceability/require-story-annotation` to `"error"`.
     - Run the ESLint CLI on `src/dogfood.ts` without annotations and verify non-zero exit and error output referencing the file.
   - Iterated on the dogfooding integration test (switching to CLI, relaxing stdout assumptions) and removed now-unnecessary inline disables in tests.
   - Ran the dogfooding integration test and the full test suite successfully.

6. **Story and problem-doc updates for dogfooding**
   - Updated Story 023 (`023.0-MAINT-DOGFOODING-VALIDATION.story.md`) to:
     - Record that the first traceability rule is enabled.
     - Note that the dogfooding validation test exists and passes.
     - Document the incremental dogfooding approach.
   - Updated `001-plugin-not-enforcing-own-traceability-rules.open.md` to:
     - Reference Story 023.
     - Document the dogfooding integration test and its passing state.
     - Mark the mitigation as partial.

7. **Documentation: dogfooding and self-validation**
   - Augmented `docs/eslint-plugin-development-guide.md` with a “Dogfooding and Self-Validation” section describing:
     - Enabling traceability rules in this repo (starting with `require-story-annotation`).
     - The one-rule-at-a-time rollout approach.
     - The role of `report:eslint-suppressions` and `ci-verify:full`.
   - Verified that lint, CI, and Husky pre-push hooks now run ESLint with `require-story-annotation` enforced on `src` and `tests`.

8. **Plugin-level metadata and setup verification**
   - Added `pluginMeta` in `src/index.ts` that reads `package.json` (with fallbacks) and exposes `name`, `version`, and `namespace: "traceability"`, attaching this as `meta` on the exported plugin.
   - Extended `tests/plugin-setup.test.ts` to assert that the plugin exports `meta` with expected name, namespace `"traceability"`, and version matching `package.json`.
   - Updated annotations in that test to cover REQ-PLUGIN-STRUCTURE and REQ-NPM-PACKAGE.
   - Revalidated plugin setup via targeted tests (plugin setup, default export/configs, flat-config integration, CLI error handling) and then the full suite.
   - Updated Story 001 (`001.0-DEV-PLUGIN-SETUP.story.md`) to mark plugin setup acceptance criteria and DoD as complete and tie them explicitly to registry/tests, config integration tests, plugin meta, and docs.
   - Performed a documentation/quality pass for plugin setup, ensuring README, setup guides, and dev guides accurately describe the plugin export structure, configs, and workflow.

9. **Traceability annotations in helpers**
   - Reviewed helper modules’ traceability annotations.
   - Found and fixed inconsistencies in `valid-req-reference-helpers.ts` (references to non-existent REQ IDs), realigning `@supports`/`@req` tags with actual stories and requirements.
   - Confirmed other helper modules already had correct annotations.
   - Updated the development guide to clarify helper-module annotation expectations, including multi-story `@supports` examples.
   - Reran the quality suite after these fixes.

10. **Ongoing quality and CI checks**
    - After each batch of changes, repeatedly ran local and CI checks: build, lint, tests with coverage, type-check, format, `ci-verify`, and security scan.
    - All checks reported success.

11. **ESLint config validation and Story 002 implementation**
    - Investigated Story 002 (`002.0-DEV-ESLINT-CONFIG.story.md`) and the existing ESLint setup:
      - Reviewed story, `eslint.config.js`, traceability XML, and user docs (`user-docs/eslint-9-setup-guide.md`, README, CI docs).
      - Reviewed rules and tests related to configuration and validation (`valid-story-reference`, `require-story-annotation`, `require-test-traceability`, `tests/config/*.test.ts`, and integration/CLI tests).
      - Confirmed existing flat-config patterns, presets, and rule schemas align with ESLint 9 and the story’s implementation notes.
    - Extended `tests/config/eslint-config-validation.test.ts` to validate ESLint runtime config error handling for `traceability/valid-story-reference` by:
      - Asserting errors for unknown option keys (e.g., `unknownOptionKey`) and checking error messages mention the rule ID and unexpected property.
      - Asserting errors for invalid option types (e.g., non-array `storyDirectories`), checking messages reference the rule ID, bad value, and array expectations.
      - Using `FlatESLint` with the standard override patterns and robust substring-based assertions.
    - Updated Story 002 to:
      - Mark the **Error Handling** acceptance criterion as completed.
      - Mark all Definition of Done items as complete, including tests for configuration loading, validation, and rule application.
      - Add an **Implementation Links** section pointing to `src/index.ts` configs, docs, rule schemas, and config validation tests.
      - Confirm alignment with ADRs `001-typescript-for-eslint-plugin.accepted.md` and `009-security-focused-lint-rules.accepted.md`.
    - Ran targeted and full quality checks (`npm test` on the config tests, `build`, `type-check`, `lint`, `format:check`, full `npm test`), committed (`test: add ESLint config validation error handling coverage`), pushed, and verified CI/CD success.

12. **Inline-code ignore behavior for annotations (Story 024.0)**
    - Reviewed `docs/stories/024.0-DEV-IGNORE-INLINE-CODE-REFS.story.md`, helper implementations, and existing tests for `valid-annotation-format`.
    - Implemented centralized backtick-aware filtering in the comment normalization helper:

      - **File:** `src/rules/helpers/valid-annotation-format-internal.ts`
      - Updated `normalizeCommentLine` so that:
        - The input line is trimmed.
        - Backtick-wrapped segments matching `` `[^`]*` `` are replaced with spaces of identical length, preserving character positions.
        - Annotation detection (`@story`, `@req`, `@supports`) runs against this filtered string.
        - If no annotation is found, leading `*` (for JSDoc-style comments) is removed from the filtered text and that result is returned.
        - If an annotation is found, the function returns `filtered.slice(annotationMatch.index)`, preserving correct annotation extraction even when there are backtick segments earlier in the line.
      - Ensured that the filtered string is used consistently for both detection and returned values.
      - Added and refined traceability annotations:
        - File header JSDoc uses a single `@supports` line referencing `docs/stories/024.0-DEV-IGNORE-INLINE-CODE-REFS.story.md` and REQ-IGNORE-INLINE-CODE, REQ-PRESERVE-BOUNDARIES, REQ-CENTRALIZED-FILTER.
        - Added an inline `@supports` comment directly above the backtick-filtering logic.

    - Added focused unit tests for the normalization helper:

      - **File added:** `tests/rules/valid-annotation-format-internal.test.ts`
      - Wrote tests tied to Story 024.0 and its requirements (`@story` and `@req` tags in the test header) that verify:
        - Backtick-wrapped `@story` in explanatory text is removed and not detected as an annotation, while preserving other text and spacing (spaces equal to the length of the removed segment).
        - Backtick-wrapped `@req` is similarly ignored and replaced with spaces of equal length.
        - Combined patterns like `` `@story` + `@req` `` normalize to a string with correctly sized space runs and no annotation tokens.
        - Lines containing a mix of backtick-wrapped references (e.g., `` `@supports` ``) and a real `@story` annotation outside backticks still normalize to just the real `@story` annotation (demonstrating correct detection of actual annotations).
        - Multiple inline code segments on the same line (`first `@story` and second `@req` markers`) are each filtered with correct spacing.
        - Lines with no backticks but with real annotations (e.g., `" * @story ..."` JSDoc-style) still normalize as before, with leading `*` stripped and the annotation preserved.
      - Adjusted test expectations to reflect how `normalizeCommentLine` receives raw comment values (no leading `//`) and to match exact space counts created by replacing each backtick span with spaces of that span’s length.
      - Confirmed these tests call `normalizeCommentLine` directly from `src/rules/helpers/valid-annotation-format-internal`.

    - Verified integration with existing rule tests:
      - Ran `npm test -- --runInBand --runTestsByPath tests/rules/valid-annotation-format-internal.test.ts` repeatedly while iterating on expectations and helper behavior.
      - Ran the entire Jest suite (`npm test -- --runInBand`) and confirmed all suites and tests still pass, including `tests/rules/valid-annotation-format.test.ts`.

    - Updated traceability documentation for Story 024.0:

      - **File:** `docs/stories/024.0-DEV-IGNORE-INLINE-CODE-REFS.story.md`
      - Marked all Acceptance Criteria items as completed, including:
        - Ignoring backtick-wrapped annotation keywords during parsing.
        - Handling common documentation patterns like `` `@story` + `@req` ``.
        - Correctly validating lines that combine inline-code references and real annotations.
        - Ensuring multi-line support, no regressions, and documented behavior.
      - Marked all Definition of Done items as completed, covering:
        - Implementation of backtick stripping in `normalizeCommentLine`.
        - Unit tests for acceptance-criteria scenarios.
        - Passing existing tests and documentation updates.
      - Added an **Implementation Links** section referencing:
        - `src/rules/helpers/valid-annotation-format-internal.ts` (`normalizeCommentLine`).
        - `tests/rules/valid-annotation-format-internal.test.ts`.

    - Quality checks, commits, and CI:
      - Ran:
        - `npm test -- --runInBand --verbose --runTestsByPath tests/rules/valid-annotation-format-internal.test.ts`
        - Full `npm test -- --runInBand`
        - `npm run build`
        - `npm run lint`
        - `npm run type-check` (twice during the process)
        - `npm run format:check`
        - `npm run duplication`
      - Committed and pushed:
        - `fix: ignore inline-code annotation references in comment normalization`
        - `docs: mark inline-code ignore story 024.0 as implemented`
      - Confirmed Git hooks and CI/CD:
        - Local `ci-verify:full` and related checks ran via pre-push hooks.
        - GitHub Actions “CI/CD Pipeline (main)” runs (including run IDs 19987675537 and 19987706130) completed successfully for these commits.

**Most recently we've executed the following action:**

---
Used tool: get_git_status with input: {}
Used tool: find_files with input: {"pattern":"reqAnnotationDetection.*","directory":"src"}
Used tool: list_directory with input: {"dirPath":"tests"}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts"}
Used tool: search_file_content with input: {"filePath":"src/utils/reqAnnotationDetection.ts","pattern":"hasReqAnnotation","isRegex":false}
Used tool: find_files with input: {"pattern":"*reqAnnotation*","directory":"tests"}
Used tool: find_files with input: {"pattern":"*annotation-checker*","directory":"tests"}
Used tool: read_file with input: {"filePath":"tests/utils/annotation-checker.test.ts"}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--coverage","--collectCoverageFrom","src/utils/reqAnnotationDetection.ts","--runTestsByPath","tests/utils/annotation-checker.test.ts"]}
Used tool: run_command with input: {"command":"nl","args":["-ba","src/utils/reqAnnotationDetection.ts"]}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-io.ts"}
Used tool: read_file with input: {"filePath":"jest.config.js"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: run_command with input: {"command":"npm","args":["run","coverage:branches"]}
Used tool: find_files with input: {"pattern":"*reqAnnotationDetection*","directory":"coverage"}
Used tool: search_file_content with input: {"filePath":"scripts/extract-uncovered-branches.js","pattern":"reqAnnotationDetection","isRegex":false}
Used tool: read_file with input: {"filePath":"scripts/extract-uncovered-branches.js"}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts","startLine":150,"endLine":220}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts","startLine":220,"endLine":280}
Used tool: generate_file with input: {"filePath":"tests/utils/req-annotation-detection.test.ts","content":"/**\n * Tests for advanced @req detection heuristics\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION\n */\nimport type { TSESTree } from \"@typescript-eslint/utils\";\nimport { hasReqAnnotation as _hasReqAnnotation } from \"../../src/utils/reqAnnotationDetection\";\n\n// Small helper to construct a minimal SourceCode-like object for the detection helpers.\nfunction createMockSourceCode(options: {\n  lines?: string[] | null;\n  text?: string;\n  commentsBefore?: any[];\n} = {}) {\n  const { lines = null, text = \"\", commentsBefore = [] } = options;\n  return {\n    lines: lines ?? undefined,\n    getText() {\n      return text;\n    },\n    getCommentsBefore() {\n      return commentsBefore;\n    },\n  } as any;\n}\n\ndescribe(\"reqAnnotationDetection advanced heuristics (Story 003.0-DEV-FUNCTION-ANNOTATIONS)\", () => {\n  it(\"[REQ-ANNOTATION-REQ-DETECTION] returns false when sourceCode is missing\", () => {\n    const has = _hasReqAnnotation(null as any, [], undefined as any, {\n      loc: null,\n    } as unknown as TSESTree.Node);\n\n    expect(has).toBe(false);\n  });\n\n  it(\"[REQ-ANNOTATION-REQ-DETECTION] returns false when node is missing\", () => {\n    const context = {\n      getSourceCode() {\n        return createMockSourceCode({ lines: [\"/** @req REQ-TEST */\"] });\n      },\n    } as any;\n\n    const has = _hasReqAnnotation(null as any, [], context, undefined as any);\n\n    expect(has).toBe(false);\n  });\n\n  it(\"[REQ-ANNOTATION-REQ-DETECTION] inspects jsdoc and comments when advanced heuristics throw\", () => {\n    const context = {\n      getSourceCode() {\n        // This object intentionally causes hasReqInAdvancedHeuristics to throw by\n        // providing a getCommentsBefore implementation that throws on access.\n        return {\n          getCommentsBefore() {\n            throw new Error(\"boom\");\n          },\n        } as any;\n      },\n    } as any;\n\n    const jsdoc = { value: \"/** @req REQ-FROM-JSDOC */\" } as any;\n\n    const has = _hasReqAnnotation(jsdoc, [], context, {\n      // Minimal shape – the helper will call into the mock sourceCode and trigger the throw\n      parent: {},\n    } as any);\n\n    expect(has).toBe(true);\n  });\n\n  it(\"[REQ-ANNOTATION-REQ-DETECTION] treats @supports in comments as satisfying requirement\", () => {\n    const context = {\n      getSourceCode() {\n        return createMockSourceCode();\n      },\n    } as any;\n\n    const comments = [{ value: \"// @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-X\" }];\n\n    const has = _hasReqAnnotation(null as any, comments, context, {\n      parent: {},\n    } as any);\n\n    expect(has).toBe(true);\n  });\n});\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/utils/req-annotation-detection.test.ts","tests/utils/annotation-checker.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--coverage","--collectCoverageFrom","src/utils/reqAnnotationDetection.ts","--runTestsByPath","tests/utils/req-annotation-detection.test.ts","tests/utils/annotation-checker.test.ts"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: add coverage tests for req annotation detection heuristics"}
Used tool: run_command with input: {"command":"npm","args":["run","ci-verify:fast"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19988568223,"timeout":600000}
---

**This was the result:**
---
Here’s what I implemented and how it maps to your plan.

## Work performed

### New focused tests for req annotation detection heuristics

Created `tests/utils/req-annotation-detection.test.ts` with targeted cases for `hasReqAnnotation` and its helpers in `src/utils/reqAnnotationDetection.ts`.

Header + traceability:

```ts
/**
 * Tests for advanced @req detection heuristics
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
```

Key scenarios covered:

1. **Guard when `sourceCode` is missing**  
   Exercises the `if (!sourceCode || !node)` early-return in `hasReqInAdvancedHeuristics` and the `try`/`catch` path in `hasReqAnnotation`:

   ```ts
   it("[REQ-ANNOTATION-REQ-DETECTION] returns false when sourceCode is missing", () => {
     const has = _hasReqAnnotation(null as any, [], undefined as any, {
       loc: null,
     } as unknown as TSESTree.Node);

     expect(has).toBe(false);
   });
   ```

2. **Guard when `node` is missing**  
   Ensures the same guard is hit when `node` is `undefined` (so advanced heuristics short‑circuit and we don’t blow up on node metadata):

   ```ts
   it("[REQ-ANNOTATION-REQ-DETECTION] returns false when node is missing", () => {
     const context = {
       getSourceCode() {
         return createMockSourceCode({ lines: ["/** @req REQ-TEST */"] });
       },
     } as any;

     const has = _hasReqAnnotation(null as any, [], context, undefined as any);

     expect(has).toBe(false);
   });
   ```

3. **Advanced heuristics throw → fall back to jsdoc/comments**  
   Explicitly drives the `try`/`catch` in `hasReqAnnotation` and the fallback to `hasReqInJsdocOrComments` by making `getCommentsBefore` throw:

   ```ts
   it("[REQ-ANNOTATION-REQ-DETECTION] inspects jsdoc and comments when advanced heuristics throw", () => {
     const context = {
       getSourceCode() {
         return {
           getCommentsBefore() {
             throw new Error("boom");
           },
         } as any;
       },
     } as any;

     const jsdoc = { value: "/** @req REQ-FROM-JSDOC */" } as any;

     const has = _hasReqAnnotation(jsdoc, [], context, {
       parent: {},
     } as any);

     expect(has).toBe(true);
   });
   ```

4. **`@supports` in comments satisfies requirement detection**  
   Ensures `commentContainsReq` and `hasReqInJsdocOrComments` treat `@supports` as equivalent to `@req`:

   ```ts
   it("[REQ-ANNOTATION-REQ-DETECTION] treats @supports in comments as satisfying requirement", () => {
     const context = {
       getSourceCode() {
         return createMockSourceCode();
       },
     } as any;

     const comments = [
       {
         value:
           "// @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-X",
       },
     ];

     const has = _hasReqAnnotation(null as any, comments, context, {
       parent: {},
     } as any);

     expect(has).toBe(true);
   });
   ```

Helper used to simulate a minimal `SourceCode` object:

```ts
function createMockSourceCode(options: {
  lines?: string[] | null;
  text?: string;
  commentsBefore?: any[];
} = {}) {
  const { lines = null, text = "", commentsBefore = [] } = options;
  return {
    lines: lines ?? undefined,
    getText() {
      return text;
    },
    getCommentsBefore() {
      return commentsBefore;
    },
  } as any;
}
```

### Quality and coverage checks

Targeted tests:

```bash
npm test -- --runTestsByPath tests/utils/req-annotation-detection.test.ts tests/utils/annotation-checker.test.ts
```

with coverage focused on `reqAnnotationDetection.ts`:

```bash
npm test -- --coverage --collectCoverageFrom src/utils/reqAnnotationDetection.ts --runTestsByPath tests/utils/req-annotation-detection.test.ts tests/utils/annotation-checker.test.ts
```

Result for `reqAnnotationDetection.ts` (focused run):

- Statements: 95.27%
- Branches: 84.31% (improved from 46.87% in the initial focused run)
- Functions: 100%
- Lines: 95.27%

Full CI-equivalent fast verification:

```bash
npm run ci-verify:fast
```

passed, and then I pushed. The main CI/CD workflow (`CI/CD Pipeline`) for run `19988568223` completed successfully (semantic-release + full checks), so the change is green end-to-end.

Commit:

```text
test: add coverage tests for req annotation detection heuristics
```

## Updated plan with status

## NOW

- [x] Design and add focused tests that exercise the currently uncovered conditional branches in the req-annotation detection utility so those specific paths in its logic are executed and verified.

(Implemented via `tests/utils/req-annotation-detection.test.ts`, targeting the guards and error-handling branches in `hasReqAnnotation`/advanced heuristics and verifying `@supports` handling.)

## NEXT

- [x] Review the new tests to ensure they clearly document the intended behavior of those branches, include proper story and requirement traceability annotations, and fit the existing test structure and naming conventions.

  - Tests include a `@supports` header referencing `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md` and requirement `REQ-ANNOTATION-REQ-DETECTION`.
  - Test names follow the existing `[REQ-...]` prefix convention and the describe block names the story.
  - Structure (plain Jest `describe`/`it`, small helper for mocks) matches existing utils tests.

- [x] Run the surrounding higher-level tests that rely on req-annotation detection to confirm that the added coverage did not change observable behavior and that the new tests meaningfully increase branch coverage for that module.

  - `npm run ci-verify:fast` (type-check, traceability check, duplication, and all rules/maintenance tests) passed.
  - Full `npm test -- --coverage` (as part of the CI pipeline after push) passed with global thresholds met.
  - No regressions in rules or maintenance behavior; coverage for `src/utils/reqAnnotationDetection.ts` is now substantially higher, and overall project coverage remains above configured thresholds.

## LATER

- [ ] Identify any remaining low-coverage conditions in the annotation-detection utilities and add small, focused tests for them to further strengthen confidence in edge-case handling.
- [ ] Revisit the story and decision documents that define req-annotation behavior to ensure they explicitly reference these edge-case branches and, if helpful, add implementation links to the new tests.
---
