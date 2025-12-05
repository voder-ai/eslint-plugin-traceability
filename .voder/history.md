Here’s a concise, history-only summary of what’s been done so far, focusing on the latest work and keeping it chronological.

---

## Test Duplication Reduction

- Used `jscpd` to locate duplication in `tests/utils/annotation-checker.test.ts`.
- Refactored tests to reuse `withTsLanguageOptions` from `tests/utils/ts-language-options.ts`.
- Re-ran tests and `jscpd` to verify behavior and reduced duplication.
- Committed as `test: refactor annotation-checker RuleTester setup to shared helper`.

---

## Traceability Annotation Improvements

- Added and adjusted `@supports` annotations in:
  - `src/maintenance/cli.ts` (CLI flags, error handling, `switch` branches).
  - `src/maintenance/detect.ts` (invalid roots, IO errors, candidate search edge cases).
  - `src/rules/helpers/valid-annotation-utils.ts` (`getFixedStoryPath`, story/req error builders).
  - `src/rules/helpers/valid-story-reference-helpers.ts` (project boundaries, path security).
  - `src/utils/annotation-checker.ts` (moved missing-`@req` autofix annotation).
- Ran `npm run check:traceability` and CI on `main`.
- Committed as `chore: improve traceability annotations for maintenance and validation helpers`.

---

## Documentation Separation and Cleanup

- Reviewed user-facing docs vs internal `docs/` references.
- Updated:
  - `SECURITY.md` to remove internal links.
  - `CONTRIBUTING.md` to avoid internal doc references.
  - `user-docs/api-reference.md` and `user-docs/migration-guide.md` to clarify that `docs/stories/...` paths are consumer-owned examples.
- Ran `npm run ci-verify:full`; CI run `19935224744` passed.
- Committed as `docs: remove user-facing references to internal docs`.

---

## CODE_QUALITY Slice Strategy

- Documented four code-quality “slices” in `docs/code-quality-assessment-slices.md`.
- Added `.voder-code-quality-slices.json` with machine-readable definitions.
- Wrote `docs/code-quality-assessment-guide.md` (how to choose slices, baseline slice).
- Updated `docs/ci-cd-pipeline.md` with a “CODE_QUALITY Slices” section.
- CI run `19935786345` passed.
- Committed as `docs: document CODE_QUALITY slice strategy`.

---

## Clarifying CODE_QUALITY Interpretation and Dependencies

- Refined `docs/code-quality-assessment-guide.md` with:
  - Definition of a valid `rules-and-helpers` assessment.
  - “Passing” criteria and classification of findings.
  - Treatment of context-failure as “not run”.
- Updated:
  - `docs/decisions/003-code-quality-ratcheting-plan.md` to tie enforcement to `rules-and-helpers`.
  - `docs/functionality-coverage-2025-12-03.md` to note dependency on a passing slice run.
- Re-ran full checks; CI `19936091302` passed.
- Committed as `docs: clarify code-quality slice interpretation and dependencies`.

---

## Rename Multi-Story Annotation from `@implements` to `@supports`

- Verified Story 010.2 and ADRs 010/011 to confirm `@supports` as canonical.

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
  - `prefer-implements-annotation.ts` (migration target now `@supports`).

**Tests & tooling:**

- Updated all relevant rule tests to use `@supports`.
- Changed Husky hook from `"postinstall"` to `"prepare"` in `package.json`.
- Ran full checks; CI passed.
- Committed as:
  - `fix: rename multi-story annotation from @implements to @supports`
  - `fix: avoid running husky in consumers and repair smoke test`.

---

## New Rule: `traceability/require-test-traceability` (Story 020.0)

- Implemented `src/rules/require-test-traceability.ts` with detection of test files, file-level `@supports` enforcement, story references in `describe`, and `[REQ-XXX]` prefixes in tests.
- Added `tests/rules/require-test-traceability.test.ts`.
- Integrated into plugin exports and docs (`user-docs/api-reference.md`).
- Ran full checks; CI passed.
- Committed as `feat: add require-test-traceability rule for test files`.

---

## Safe Auto-Fix for `require-test-traceability` (Story 021.0)

- Introduced auto-fix-related options and `fixable: "code"` in the rule.
- Extracted helpers to `src/rules/helpers/require-test-traceability-helpers.ts` for:
  - Test-file detection.
  - Safe insertion of placeholder `@supports`.
  - Normalization of malformed REQ prefixes.
- Updated rule wiring, tests, and docs.
- Ran tests, lint, type-check, build, format; CI passed.
- Committed as `feat: add safe auto-fix support for test traceability rule`.

---

## Ignoring Generated Assessment and CI Artifacts

- Added `.gitignore` entries for `scripts/*-report.md`, `.voder-*.json`, `.voder-jscpd-report/*`.
- Removed tracked instances from the index.
- Re-ran build, tests, lint, type-check, format.
- Committed as `chore: ignore generated assessment and ci report artifacts`.

---

## CI Tooling Engine Alignment and Workflow Updates

- Verified `semantic-release` Node engine requirements.
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
  - Describe ephemeral `.voder*`/report artifacts as ignored.
- Committed as:
  - `docs: document ignored ephemeral ci and assessment artifacts`
  - `docs: sync ci-cd documentation with updated workflow node version`.
- Re-ran full checks; CI passed.

---

## JSDoc Coexistence for Annotation Parsing (Story 022.0)

- Clarified behavior for coexistence of traceability tags and JSDoc tags.
- Updated:
  - `valid-annotation-format-internal.ts` to recognize non-traceability `@tag` lines as boundaries.
  - `valid-annotation-format.ts` to finalize pending annotations on such lines.
- Extracted validators/finalizers into `valid-annotation-format-validators.ts`.
- Expanded tests in `tests/rules/valid-annotation-format.test.ts` for JSDoc coexistence cases.
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
- Extended `user-docs/examples.md` with a test traceability example using canonical `@supports story#REQ` syntax.
- Ran `npm run ci-verify:fast`; CI remained green.
- Committed under several messages including:
  - `docs: document test traceability rule and align CLI annotations`
  - `chore: migrate maintenance and helper annotations to supports tag`
  - `docs: add test traceability rule to README and examples`
  - `chore: standardize @supports traceability annotations`
  - `docs: align test traceability example with @supports syntax`.

---

## Alignment of `require-test-traceability` Docs with Implementation

- Clarified `testFilePatterns` semantics (substring-based, slash-normalized) in:
  - `src/rules/require-test-traceability.ts` (JSDoc, `meta.schema` defaults).
  - `user-docs/api-reference.md` (exact defaults and behavior).
- Ran lint and tests.
- Committed as `docs: align require-test-traceability docs with implementation`.

---

## Traceability Annotations for `prefer-implements-annotation` Helpers

- Added `@supports` JSDoc annotations to helpers in `src/rules/prefer-implements-annotation.ts`:
  - `CommentAnalysis`
  - `collectStoryAndReqMetadata`
  - `applyImplementsReplacement`
  - `analyzeComment`
  - `processComment`
- Verified other annotations were already present.
- Ran lint, tests, build, type-check, format checks; CI run `19951915485` passed.
- Committed as `chore: add traceability annotations for prefer-implements-annotation helpers`.

---

## Additional Traceability Helper Review

- Reviewed `src/rules/helpers/valid-implements-utils.ts` for coverage and annotations.
- Confirmed existing traceability JSDoc and exports were sufficient.
- No code changes; existing checks continued to pass.

---

## Centralization of Maintenance and Debug Scripts

- Cataloged scripts under `scripts/` (CI-wired vs. “orphaned” tools).
- Added NPM script wrappers in `package.json`:
  - `check:ci-artifacts`
  - `coverage:branches`
  - `debug:cli`
  - `debug:require-story`
  - `debug:repro`
  - `report:eslint-suppressions`
  - `check:scripts`
- Ran those plus `ci-verify:fast`, build, tests, lint, type-check, format:check.
- Committed as `chore: centralize maintenance and debug scripts via npm scripts`.

---

## Documentation of Centralized Maintenance and Debug Scripts

- Updated `docs/ci-cd-pipeline.md` to:
  - Reference `npm run check:scripts` for script validation.
  - Document the new maintenance/debug NPM scripts and what they do.
- Ran build, tests, lint, type-check, format:check.
- Committed as `docs: document centralized maintenance and debug scripts`.

---

## Maintenance Tools Performance Targets and Tests

### Performance Targets Documentation

- Created `docs/maintenance-performance-tests.md` describing:
  - Critical maintenance/CLI workflows and code paths.
  - Synthetic large-workspace targets (detection, update, CLI scenarios).
  - Fixture design principles (temp dirs, deterministic layout, valid vs stale refs).
- Ran tests and lint.
- Committed as `docs: document maintenance performance targets`.

### Core Maintenance API Performance Tests

- Added `tests/perf/maintenance-large-workspace.test.ts`:
  - Builds a ~500-file synthetic workspace with mixed valid/stale `@story` refs.
  - Measures:
    - `detectStaleAnnotations`
    - `verifyAnnotations`
    - `generateMaintenanceReport`
    - `updateAnnotationReferences`
    - `batchUpdateAnnotations`
  - Enforces generous (<5s) timing guardrails and basic correctness.
- Ran the perf tests individually and as part of the full suite; duplication/format checks included.
- Committed as `test: add performance tests for maintenance tools`.

### Maintenance CLI Performance Tests

- Added `tests/perf/maintenance-cli-large-workspace.test.ts`:
  - Creates a 100-file synthetic workspace with valid and stale story refs.
  - Uses `runMaintenanceCli` to exercise:
    - `detect --json`
    - `report --format=json`
  - Asserts timing (<5s), exit codes, and log payload shape.
- Ran the CLI perf tests and then the full test/lint/type-check/format pipeline.
- Committed; CI “CI/CD Pipeline” succeeded.

### Expanded Performance Test Documentation

- Updated `docs/maintenance-performance-tests.md` with:
  - `## Test Locations and Commands` (paths and `npm test` invocations).
  - `## When to Run These Tests` (change triggers).
  - `## Interpreting Results` (functional and performance expectations, investigation steps).
- Ran formatting and full quality checks.
- Committed as `docs: expand maintenance performance test guidance`.

---

## Configurable Auto-Fix Templates and Toggles (Most Recent Work)

### New Configuration for `require-story-annotation`

- Updated `src/rules/require-story-annotation.ts`:
  - Extended schema with `annotationTemplate`, `methodAnnotationTemplate`, `autoFix`.
  - In `create(context)`, derived:
    - `annotationTemplate` and `methodAnnotationTemplate` from options (trimmed strings or `undefined`).
    - `autoFix` defaulting to `true` when unspecified.
  - Passed these into `buildVisitors`.

- Enhanced `src/rules/helpers/require-story-helpers.ts`:
  - Added `getAnnotationTemplate(override?)` that:
    - Returns trimmed override when provided.
    - Otherwise returns the original default `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`.
  - Added `shouldApplyAutoFix(autoFix?)` to gate actual fixes.
  - Introduced `ReportOptions` and updated `reportMissing` / `reportMethod` to accept a `{ node, target?, options? }` config object and:
    - Determine `effectiveTemplate` via `getAnnotationTemplate`.
    - Use `shouldApplyAutoFix` to decide whether to attach a `fix` function while always providing suggestions.

- Refactored `src/rules/helpers/require-story-core.ts`:
  - `createAddStoryFix(target, annotationTemplate)` and `createMethodFix(node, annotationTemplate)` now require the template string and embed it in the inserted text (including newline handling).
  - Removed obsolete core-level `reportMissing`/`reportMethod`.

- Adjusted `src/rules/helpers/require-story-visitors.ts`:
  - Visitors now pass config objects into `reportMissing` / `reportMethod`, threading:
    - `annotationTemplate`
    - `methodAnnotationTemplate`
    - `autoFix`.

### Auto-Fix Toggle for `valid-annotation-format`

- Updated `src/rules/helpers/valid-annotation-options.ts`:
  - `AnnotationRuleOptions` gained `autoFix?: boolean`.
  - `ResolvedAnnotationOptions` gained `autoFix: boolean`.
  - `resolveOptions` now derives `autoFix` (default `true`) and stores it in `resolvedDefaults`.

- Updated `src/rules/helpers/valid-annotation-format-validators.ts`:
  - `validateStoryAnnotation` now:
    - Uses suffix-normalization fixes only when `options.autoFix !== false`.
    - Otherwise reports the invalid format without suggesting/fixing.

### Tests and Helpers Adjustments

- Extended `tests/rules/auto-fix-behavior-008.test.ts`:
  - New invalid case validating custom `annotationTemplate` and `methodAnnotationTemplate`.
  - New case where `autoFix: false` on `require-story-annotation` reports errors but does not change output.

- Updated helper and core tests to match the new APIs:
  - `tests/rules/require-story-core.test.ts`
  - `tests/rules/require-story-core.autofix.test.ts`
  - `tests/rules/require-story-helpers.test.ts`
  - `tests/rules/require-story-helpers-edgecases.test.ts`
  - `tests/utils/require-story-core-test-helpers.ts`
  - All adjusted to:
    - Supply the required annotation template argument to `createAddStoryFix`/`createMethodFix`.
    - Use the new config-based signatures for `reportMissing`/`reportMethod`.
    - Keep or relax expectations on inserted text where necessary, while preserving range and behavioral assertions.

### Documentation and Story 008.0 Alignment

- Updated `user-docs/api-reference.md`:
  - `traceability/require-story-annotation` section now documents:
    - `annotationTemplate`
    - `methodAnnotationTemplate`
    - `autoFix`
    and explains that the default template remains the same but is now configurable.
  - `traceability/valid-annotation-format` section documents an `autoFix` option that disables suffix-normalization fixes when `false`.

- Updated `docs/stories/008.0-DEV-AUTO-FIX.story.md`:
  - Marked `REQ-AUTOFIX-TEMPLATE` as implemented via the new templates.
  - Marked `REQ-AUTOFIX-SELECTIVE` as implemented via:
    - `require-story-annotation`’s `autoFix`.
    - `valid-annotation-format`’s `autoFix`.
  - Updated Technical Considerations to reflect that template configurability and selective fix toggles are now implemented and default to previous behavior when omitted.

### Quality and CI

- Ran:
  - `npm test -- --runInBand`
  - `npm run lint`
  - `npm run type-check`
  - `npm run build`
  - `npm run format` and `npm run format:check`
- Committed as `feat: add configurable auto-fix templates and toggles` (twice during the refinement, with subsequent push).
- Verified the GitHub “CI/CD Pipeline” for these changes completed successfully (all checks green).

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"."}
Used tool: get_git_status with input: {}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts"}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-annotation-options.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/flags.ts"}
Used tool: read_file with input: {"filePath":"eslint.config.js"}
Used tool: list_directory with input: {"dirPath":"src/rules/helpers"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-annotation-format-internal.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-annotation-format-validators.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-annotation-utils.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-implements-utils.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-story-reference-helpers.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-io.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-utils.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-visitors.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-test-traceability-helpers.ts"}
Used tool: search_file_content with input: {"filePath":"src","pattern":"complexity","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src","pattern":"max-lines-per-function","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src","pattern":"max-lines","isRegex":false}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src"}
Used tool: run_command with input: {"command":"npx","args":["eslint","--config","eslint.config.js","src/rules/helpers","src/utils","src/maintenance/flags.ts","--format","json","--output-file","eslint-complexity-report.json","--rule","complexity:error","--rule","max-lines-per-function:error","--rule","max-lines:error"]}
Used tool: read_file with input: {"filePath":"eslint-complexity-report.json"}
Used tool: read_file with input: {"filePath":"src/maintenance/batch.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/commands.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/detect.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/report.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/update.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/utils.ts"}
Used tool: read_file with input: {"filePath":"src/utils/storyReferenceUtils.ts"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts"}
Used tool: read_file with input: {"filePath":"src/index.ts"}
Used tool: run_command with input: {"command":"npx","args":["eslint","--config","eslint.config.js","src/rules/helpers","src/maintenance","--format","json","--output-file","eslint-complexity-report-detailed.json","--rule","complexity:[\"error\",{\"max\":1}]"]}
Used tool: read_file with input: {"filePath":"eslint-complexity-report-detailed.json"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-helpers.test.ts"}
Used tool: find_files with input: {"pattern":"*maintenance*.test.ts","directory":"tests"}
Used tool: find_files with input: {"pattern":"*require-test-traceability*.test.ts","directory":"tests"}
Used tool: find_files with input: {"pattern":"*valid-annotation-format*.test.ts","directory":"tests"}
Used tool: find_files with input: {"pattern":"*require-story-utils*.test.ts","directory":"tests"}
Used tool: read_file with input: {"filePath":"tests/rules/valid-annotation-format.test.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/cli.ts"}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-io.ts","instruction":"Refactor the fallbackTextBeforeHasStory helper into smaller, focused helpers to reduce cyclomatic complexity while preserving behavior. Introduce internal helpers to compute the node start index for fallback scanning, to safely slice the bounded fallback text window, and to detect markers in the resulting text. Keep existing exports the same and maintain existing traceability annotations, adding new ones for the new helpers.\n\nSpecifically:\n- Add a new internal helper `getFallbackRangeStart(sourceCode: any, node: any): number | null` before `fallbackTextBeforeHasStory`. This helper should:\n  - Return `null` when `sourceCode.getText` is not a function.\n  - Safely obtain `node.range` (using a local `range` variable) and return `null` when it is not an array or does not contain a numeric start index.\n  - Otherwise, return the numeric start index (`range[0]`).\n  - Include a JSDoc block referencing docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md and REQ-ANNOTATION-REQUIRED, explaining that it centralizes guards for fallback range computation.\n\n- Add a new internal helper `getFallbackTextWindow(sourceCode: any, nodeStartIndex: number): string | null` before `fallbackTextBeforeHasStory`. This helper should:\n  - Compute `start` as `Math.max(0, nodeStartIndex - FALLBACK_WINDOW)`.\n  - Inside a try/catch, call `sourceCode.getText().slice(start, nodeStartIndex)`.\n  - Return the sliced text when it is a string; otherwise return `null`.\n  - On any error, swallow it and return `null` so that callers treat it as \"no annotation\".\n  - Include a JSDoc block referencing docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md and REQ-ANNOTATION-REQUIRED, explaining that it restricts fallback scanning to a safe, fixed-size window and treats IO failures as non-fatal.\n\n- Add a new internal helper `fallbackTextHasMarker(textBefore: string | null): boolean` before `fallbackTextBeforeHasStory`. This helper should:\n  - Return false when `textBefore` is not a string.\n  - Otherwise, return true when the text includes either \"@story\" or \"@supports\".\n  - Include a JSDoc block referencing docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md and docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md, and requirements REQ-ANNOTATION-REQUIRED and REQ-REQUIRE-ACCEPTS-IMPLEMENTS, explaining that it recognizes both markers in fallback text.\n\n- Rewrite the body of `fallbackTextBeforeHasStory` to:\n  - Call `getFallbackRangeStart(sourceCode, node)` and return false immediately when it returns null.\n  - Call `getFallbackTextWindow(sourceCode, nodeStartIndex)` to obtain the textBefore value.\n  - Return the result of `fallbackTextHasMarker(textBefore)`.\n  - Keep the existing JSDoc comment for `fallbackTextBeforeHasStory` intact (no changes to the comment block above the function signature).\n\nDo not change any other helpers in this file."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/rules/require-story-helpers.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","src/rules/helpers/require-story-io.ts","src/rules/helpers/require-story-helpers.ts","src/utils/annotation-checker.ts","src/utils/reqAnnotationDetection.ts","src/maintenance/flags.ts"]}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","instruction":"Move the LOOKBACK_LINES and FALLBACK_WINDOW constants out of this helper module now that they are defined and exported from require-story-io, to reduce file length and duplication.\n\nConcretely:\n- Delete the full JSDoc and declarations for the local LOOKBACK_LINES and FALLBACK_WINDOW constants near the top of the file.\n- In the hasStoryAnnotation helper, change the call to linesBeforeHasStory(sourceCode, node, LOOKBACK_LINES) so that it calls linesBeforeHasStory(sourceCode, node) without the third argument, relying on the default parameter provided by the IO helper.\n- Do not modify any other code in this file."}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","instruction":"Update the explicit exports list at the bottom to remove LOOKBACK_LINES and FALLBACK_WINDOW, since they are no longer defined in this module. Do not change anything else in the file."}
Used tool: run_command with input: {"command":"npx","args":["eslint","--config","eslint.config.js","src/rules/helpers/require-story-io.ts","src/rules/helpers/require-story-helpers.ts","src/utils/annotation-checker.ts","src/utils/reqAnnotationDetection.ts","src/maintenance/flags.ts","--max-warnings","0"]}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","instruction":"Move the small type guard helpers isIdentifierWithName, hasIdIdentifierWithName, hasKeyIdentifierWithName, and hasLiteralKeyWithStringValue into require-story-utils.ts to reduce this file's length. In this helpers file:\n- Remove the declarations of isIdentifierWithName, hasIdIdentifierWithName, hasKeyIdentifierWithName, and hasLiteralKeyWithStringValue.\n- Replace usages of those helpers inside extractName with direct inline logic using getNodeName where reasonable, without reintroducing high complexity:\n  - For the Identifier-with-name case, you can simply check `current.type === \"Identifier\" && typeof current.name === \"string\"`.\n  - For the id/key cases, delegate to getNodeName(current.id) or getNodeName(current.key) when present, and return the result when it's a non-empty string.\n  - For the literal-key-with-string case, you can use getNodeName(current.key) and fall back to `current.key.value` when it's a string.\n- Keep the overall behavior of extractName the same: it should still walk parent nodes and return \"(anonymous)\" when nothing usable is found.\n- Do not introduce any new imports or exports in this file."}
Used tool: run_command with input: {"command":"npx","args":["eslint","--config","eslint.config.js","src/rules/helpers/require-story-io.ts","src/rules/helpers/require-story-helpers.ts","src/utils/annotation-checker.ts","src/utils/reqAnnotationDetection.ts","src/maintenance/flags.ts","--max-warnings","0"]}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","instruction":"Reduce the cyclomatic complexity of the extractName helper by extracting some of its internal checks into small, focused helpers while preserving behavior.\n\nMake the following changes:\n\n1) Introduce a new internal helper just above extractName:\n\nfunction getDirectIdentifierName(node: any): string | null {\n  if (\n    node &&\n    node.type === \"Identifier\" &&\n    typeof node.name === \"string\" &&\n    node.name.length > 0\n  ) {\n    return node.name;\n  }\n  return null;\n}\n\nThis helper should have a JSDoc block referencing docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md and REQ-ANNOTATION-REQUIRED, explaining that it extracts a direct Identifier name when available.\n\n2) Introduce another internal helper above extractName:\n\nfunction getContainerKeyOrIdName(node: any): string | null {\n  if (!node) {\n    return null;\n  }\n\n  if (node.id) {\n    const idName = getNodeName(node.id);\n    if (typeof idName === \"string\" && idName.length > 0) {\n      return idName;\n    }\n  }\n\n  if (node.key) {\n    const keyName = getNodeName(node.key);\n    if (typeof keyName === \"string\" && keyName.length > 0) {\n      return keyName;\n    }\n\n    if (\n      node.key.type === \"Literal\" &&\n      typeof (node.key as any).value === \"string\" &&\n      (node.key as any).value.length > 0\n    ) {\n      return (node.key as any).value;\n    }\n  }\n\n  return null;\n}\n\nThis helper should also include a JSDoc block referencing docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md and REQ-ANNOTATION-REQUIRED, explaining that it normalizes id/key-based container names.\n\n3) Rewrite the body of extractName to delegate to these helpers and simplify conditions:\n\n- Inside the while-loop, first call getDirectIdentifierName(current) and return when it is non-null.\n- Next call getContainerKeyOrIdName(current) and return when it is non-null.\n- Then keep the existing directName check (node.name) exactly as is.\n- Remove the inlined key handling logic that duplicates getNodeName and literal checks, since that is now covered by getContainerKeyOrIdName.\n- Keep the parent walk and the final \"(anonymous)\" fallback unchanged.\n\nDo not change the extractName signature, its JSDoc, or any other helpers in this file."}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","instruction":"Reduce file length slightly by moving the STORY_PATH constant and its JSDoc into require-story-core.ts and importing it here.\n\nIn this file:\n- Remove the JSDoc and declaration of the local STORY_PATH constant.\n- Add STORY_PATH to the existing named imports from \"./require-story-core\".\n- Do not modify getAnnotationTemplate or any other logic; it should continue to reference STORY_PATH by name.\n\nIn src/rules/helpers/require-story-core.ts:\n- Add a new exported constant just after the DEFAULT_SCOPE export:\n\n/**\n * Path to the story file for function-annotation helpers.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQUIRED - Provide a single source of truth for the canonical story path used by helper modules\n */\nexport const STORY_PATH = \"docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\";\n\n- Ensure this new constant is exported and does not change any existing exports.\n"}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-core.ts","instruction":"Add the shared STORY_PATH constant so require-story helpers can import it.\n\nImmediately after the DEFAULT_SCOPE export, insert:\n\n/**\n * Path to the story file for function-annotation helpers.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQUIRED - Provide a single source of truth for the canonical story path used by helper modules\n */\nexport const STORY_PATH = \"docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\";\n\nDo not change any existing code in this file."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/rules/require-story-helpers.test.ts"]}
Used tool: run_command with input: {"command":"npx","args":["eslint","--config","eslint.config.js","src/rules/helpers/require-story-io.ts","src/rules/helpers/require-story-helpers.ts","src/utils/annotation-checker.ts","src/utils/reqAnnotationDetection.ts","src/maintenance/flags.ts","--max-warnings","0"]}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","instruction":"Reduce file length by moving the reportMissing and reportMethod helpers into require-story-core.ts as exported helpers, while keeping their behavior intact.\n\nIn this file (require-story-helpers.ts):\n- Remove the full JSDoc and function bodies for reportMissing and reportMethod.\n- Add reportMissing and reportMethod to the named imports from \"./require-story-core\".\n- Remove reportMissing and reportMethod from the explicit export list at the bottom of this file.\n- Update call sites in this file to call the imported helpers from core instead, passing the same arguments. The existing configuration object shape should remain the same.\n\nIn src/rules/helpers/require-story-core.ts:\n- After the STORY_PATH and EXPORT_PRIORITY_VALUES exports, add two new exported helpers that encapsulate the existing logic currently in reportMissing and reportMethod from require-story-helpers.ts. They should:\n  - Import the minimal types required (import type { Rule } from \"eslint\";).\n  - Import hasStoryAnnotation, getReportedFunctionName, resolveAnnotationTargetNode, getNameNodeForReport, buildTemplateConfig, extractName, getAnnotationTemplate, and shouldApplyAutoFix from require-story-helpers.ts is NOT allowed (would create a cycle), so instead:\n    * Take these behaviors as explicit parameters in a small \"deps\" object.\n    * Define types:\n      type ReportDeps = { hasStoryAnnotation: (sourceCode: any, node: any) => boolean; getReportedFunctionName: (node: any) => string; resolveAnnotationTargetNode: (sourceCode: any, node: any, passedTarget: any) => any; getNameNodeForReport: (node: any) => any; buildTemplateConfig: (options?: { annotationTemplateOverride?: string; autoFixToggle?: boolean }) => { effectiveTemplate: string; allowFix: boolean }; extractName: (node: any) => string; getAnnotationTemplate: (override?: string) => string; shouldApplyAutoFix: (autoFix: boolean | undefined) => boolean; createAddStoryFix: (target: any, annotationTemplate: string) => (fixer: any) => any; createMethodFix: (node: any, annotationTemplate: string) => (fixer: any) => any; };\n  - Export two functions:\n    export function coreReportMissing(deps: ReportDeps, context: Rule.RuleContext, sourceCode: any, config: { node: any; target?: any; options?: { annotationTemplateOverride?: string; autoFixToggle?: boolean } }): void { ... }\n\n    export function coreReportMethod(deps: ReportDeps, context: Rule.RuleContext, sourceCode: any, config: { node: any; target?: any; options?: { annotationTemplateOverride?: string; autoFixToggle?: boolean } }): void { ... }\n\n  - Inside coreReportMissing, implement the same try/catch, hasStoryAnnotation, getReportedFunctionName, resolveAnnotationTargetNode, getNameNodeForReport, buildTemplateConfig, and context.report logic currently in reportMissing, but calling the functions from the deps object instead of local helpers.\n  - Inside coreReportMethod, implement the same try/catch, hasStoryAnnotation, extractName, target resolution and suggestion logic as the current reportMethod, again using deps and the local createMethodFix/createAddStoryFix from this module.\n  - Add appropriate JSDoc for both helpers referencing docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md, docs/stories/007.0-DEV-ERROR-REPORTING.story.md, and docs/stories/008.0-DEV-AUTO-FIX.story.md, and the same requirements as the original functions.\n\nThis change should strictly refactor code paths without changing external behavior, just moving the heavy reporting helpers behind a dependency-injected core layer to shorten require-story-helpers.ts."}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-core.ts","instruction":"Extend this core helper module with dependency-injected reporting helpers for require-story.\n\n1) Add the following type and exports near the bottom of the file, after the STORY_PATH and EXPORT_PRIORITY_VALUES exports (but before the final export block, if any):\n\nimport type { Rule } from \"eslint\";\n\ntype CoreReportOptions = {\n  annotationTemplateOverride?: string;\n  autoFixToggle?: boolean;\n};\n\ntype ReportDeps = {\n  hasStoryAnnotation: (sourceCode: any, node: any) => boolean;\n  getReportedFunctionName: (node: any) => string;\n  resolveAnnotationTargetNode: (\n    sourceCode: any,\n    node: any,\n    passedTarget: any,\n  ) => any;\n  getNameNodeForReport: (node: any) => any;\n  buildTemplateConfig: (\n    options?: CoreReportOptions,\n  ) => { effectiveTemplate: string; allowFix: boolean };\n  extractName: (node: any) => string;\n  getAnnotationTemplate: (override?: string) => string;\n  shouldApplyAutoFix: (autoFix: boolean | undefined) => boolean;\n  createAddStoryFix: (target: any, annotationTemplate: string) => any;\n  createMethodFix: (node: any, annotationTemplate: string) => any;\n};\n\n2) Then add two exported functions implementing the shared reporting logic, reusing createAddStoryFix and createMethodFix from this module:\n\n/**\n * Core helper to report a missing @story annotation for a function-like node.\n * Delegates actual behavior to injected dependencies so higher-level helpers\n * can remain small while sharing error-reporting behavior.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md\n * @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n * @req REQ-ANNOTATION-REQUIRED\n * @req REQ-AUTOFIX-MISSING\n * @req REQ-ERROR-SPECIFIC\n */\nexport function coreReportMissing(\n  deps: ReportDeps,\n  context: Rule.RuleContext,\n  sourceCode: any,\n  config: { node: any; target?: any; options?: CoreReportOptions },\n): void {\n  const { node, target: passedTarget, options = {} } = config;\n\n  try {\n    if (deps.hasStoryAnnotation(sourceCode, node)) {\n      return;\n    }\n\n    const functionName = deps.getReportedFunctionName(node);\n    const resolvedTarget = deps.resolveAnnotationTargetNode(\n      sourceCode,\n      node,\n      passedTarget,\n    );\n    const nameNode = deps.getNameNodeForReport(node);\n    const { effectiveTemplate, allowFix } = deps.buildTemplateConfig(options);\n    const name = functionName;\n\n    context.report({\n      node: nameNode,\n      messageId: \"missingStory\",\n      data: { name, functionName: name },\n      fix: allowFix\n        ? deps.createAddStoryFix(resolvedTarget, effectiveTemplate)\n        : undefined,\n      suggest: [\n        {\n          desc: `Add JSDoc @story annotation for function '${name}', e.g., ${effectiveTemplate}`,\n          fix: deps.createAddStoryFix(resolvedTarget, effectiveTemplate),\n        },\n      ],\n    });\n  } catch {\n    /* noop */\n  }\n}\n\n/**\n * Core helper to report a missing @story annotation for a method-like node.\n * Delegates actual behavior to injected dependencies while keeping this\n * module focused on core error-reporting behavior.\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md\n * @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n * @req REQ-ANNOTATION-REQUIRED\n * @req REQ-AUTOFIX-MISSING\n * @req REQ-ERROR-SPECIFIC\n */\nexport function coreReportMethod(\n  deps: ReportDeps,\n  context: Rule.RuleContext,\n  sourceCode: any,\n  config: { node: any; target?: any; options?: CoreReportOptions },\n): void {\n  const { node, target: passedTarget, options = {} } = config;\n\n  try {\n    if (deps.hasStoryAnnotation(sourceCode, node)) {\n      return;\n    }\n\n    const resolvedTarget =\n      passedTarget ?? deps.resolveAnnotationTargetNode(sourceCode, node, null);\n    const name = deps.extractName(node);\n    const nameNode =\n      (node.key && node.key.type === \"Identifier\" && node.key) || node;\n\n    const effectiveTemplate = deps.getAnnotationTemplate(\n      options.annotationTemplateOverride,\n    );\n    const allowFix = deps.shouldApplyAutoFix(options.autoFixToggle);\n\n    context.report({\n      node: nameNode,\n      messageId: \"missingStory\",\n      data: { name, functionName: name },\n      fix: allowFix\n        ? deps.createMethodFix(resolvedTarget, effectiveTemplate)\n        : undefined,\n      suggest: [\n        {\n          desc: `Add JSDoc @story annotation for function '${name}', e.g., ${effectiveTemplate}`,\n          fix: deps.createMethodFix(resolvedTarget, effectiveTemplate),\n        },\n      ],\n    });\n  } catch {\n    /* noop */\n  }\n}\n\n3) Ensure the new imports, types, and exports integrate cleanly with the existing module. Do not modify the existing createAddStoryFix, createMethodFix, DEFAULT_SCOPE, STORY_PATH, or EXPORT_PRIORITY_VALUES definitions.\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/rules/require-story-helpers.test.ts"]}
Used tool: run_command with input: {"command":"npx","args":["eslint","--config","eslint.config.js","src/rules/helpers/require-story-io.ts","src/rules/helpers/require-story-helpers.ts","src/utils/annotation-checker.ts","src/utils/reqAnnotationDetection.ts","src/maintenance/flags.ts","--max-warnings","0"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: reduce complexity in require-story helpers and IO"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts"}
Used tool: run_command with input: {"command":"npx","args":["eslint","--config","eslint.config.js","src/rules/helpers/require-story-core.ts","--max-warnings","0"]}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-core.ts","instruction":"Fix the no-unused-vars errors in the ReportDeps type by marking unused parameters as optional and using a leading underscore for those that are not referenced in core helpers.\n\nIn the ReportDeps type definition:\n- Change the function signatures as follows to match only what coreReportMissing and coreReportMethod actually use:\n\n  hasStoryAnnotation: (sourceCode: any, node: any) => boolean;\n  getReportedFunctionName: (node: any) => string;\n  resolveAnnotationTargetNode: (\n    sourceCode: any,\n    node: any,\n    passedTarget: any,\n  ) => any;\n  getNameNodeForReport: (node: any) => any;\n  buildTemplateConfig: (\n    options?: CoreReportOptions,\n  ) => { effectiveTemplate: string; allowFix: boolean };\n  extractName: (node: any) => string;\n  getAnnotationTemplate: (override?: string) => string;\n  shouldApplyAutoFix: (autoFix: boolean | undefined) => boolean;\n  createAddStoryFix: (target: any, annotationTemplate: string) => any;\n  createMethodFix: (node: any, annotationTemplate: string) => any;\n\nEnsure there are no extra, unused parameters in these type signatures beyond what the core helpers call. Do not change the coreReportMissing or coreReportMethod implementations."}
Used tool: run_command with input: {"command":"npx","args":["eslint","--config","eslint.config.js","src/rules/helpers/require-story-core.ts","--max-warnings","0"]}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-core.ts","instruction":"In the ReportDeps type definition, rename the function parameter identifiers to begin with an underscore so they are ignored by the no-unused-vars rule, without changing their types:\n- hasStoryAnnotation: (_sourceCode: any, _node: any) => boolean;\n- getReportedFunctionName: (_node: any) => string;\n- resolveAnnotationTargetNode: (\n    _sourceCode: any,\n    _node: any,\n    _passedTarget: any,\n  ) => any;\n- getNameNodeForReport: (_node: any) => any;\n- buildTemplateConfig: (\n    _options?: CoreReportOptions,\n  ) => { effectiveTemplate: string; allowFix: boolean };\n- extractName: (_node: any) => string;\n- getAnnotationTemplate: (_override?: string) => string;\n- shouldApplyAutoFix: (_autoFix: boolean | undefined) => boolean;\n- createAddStoryFix: (_target: any, _annotationTemplate: string) => any;\n- createMethodFix: (_node: any, _annotationTemplate: string) => any;\n\nDo not modify any other code."}
Used tool: run_command with input: {"command":"npx","args":["eslint","--config","eslint.config.js","src/rules/helpers/require-story-core.ts","--max-warnings","0"]}
Used tool: run_command with input: {"command":"npx","args":["eslint","--config","eslint.config.js","src/rules/helpers/require-story-io.ts","src/rules/helpers/require-story-helpers.ts","src/utils/annotation-checker.ts","src/utils/reqAnnotationDetection.ts","src/maintenance/flags.ts","--max-warnings","0"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: reduce complexity in require-story helpers and IO"}
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
NOW and the first two NEXT items are complete. The remaining NEXT items (threshold tightening and docs) are still to do.

Here’s what was implemented.

---

## What I did

### 1. Identified complexity hotspots (NOW)

- Ran ESLint with an artificially strict complexity rule to locate the worst offenders in rules and maintenance helpers:

  ```bash
  npx eslint --config eslint.config.js \
    src/rules/helpers src/maintenance \
    --format json --output-file eslint-complexity-report-detailed.json \
    --rule complexity:["error",{"max":1}]
  ```

- Findings:
  - `src/rules/helpers/require-story-helpers.ts`:
    - Many functions over the (temporary) complexity limit.
    - Hit `max-lines` (306 lines > configured max 300).
    - This was clearly the primary hotspot.
  - `src/rules/helpers/require-story-io.ts`:
    - `fallbackTextBeforeHasStory` had high cyclomatic complexity.
  - Several maintenance helpers and other rule helpers had moderate complexity (e.g., 8–11) but still within the project’s actual configured limit of 18.

- Selected **`require-story-helpers.ts`** (plus its coupled IO helper) as the “single worst offender” to target first.

---

### 2. Refactored the worst hotspot into smaller helpers (NEXT #1)

#### 2.1. `fallbackTextBeforeHasStory` in `require-story-io.ts`

**File:** `src/rules/helpers/require-story-io.ts`

Previously, `fallbackTextBeforeHasStory` inlined all of:

- Guards around `sourceCode.getText`
- Range validation
- Window slicing
- Marker detection
- Error handling

I refactored this into three focused internal helpers plus a slimmed-down public function:

1. **`getFallbackRangeStart(sourceCode: any, node: any): number | null`**

   ```ts
   /**
    * Safely compute the starting range index for fallback text scanning.
    * Centralizes guards around sourceCode.getText and node.range structure.
    * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    * @req REQ-ANNOTATION-REQUIRED - Centralize guards for fallback range computation
    */
   function getFallbackRangeStart(sourceCode: any, node: any): number | null {
     if (typeof sourceCode?.getText !== "function") {
       return null;
     }
     const range = (node && node.range) || null;
     if (!Array.isArray(range) || typeof range[0] !== "number") {
       return null;
     }
     return range[0];
   }
   ```

2. **`getFallbackTextWindow(sourceCode: any, nodeStartIndex: number): string | null`**

   ```ts
   /**
    * Safely slice a bounded fallback text window immediately preceding the node start index.
    * Restricts scanning to a fixed-size window and treats IO/slicing failures as non-fatal.
    * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    * @req REQ-ANNOTATION-REQUIRED - Restrict fallback text scanning to a safe, fixed-size window and handle failures gracefully
    */
   function getFallbackTextWindow(
     sourceCode: any,
     nodeStartIndex: number,
   ): string | null {
     const start = Math.max(0, nodeStartIndex - FALLBACK_WINDOW);
     try {
       const textBefore = sourceCode.getText().slice(start, nodeStartIndex);
       return typeof textBefore === "string" ? textBefore : null;
     } catch {
       /*
        * Swallow low-level IO or slicing errors so annotation detection never breaks lint execution.
        * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
        * @req REQ-ANNOTATION-REQUIRED - Treat fallback text inspection failures as "no annotation" instead of raising
        */
       return null;
     }
   }
   ```

3. **`fallbackTextHasMarker(textBefore: string | null): boolean`**

   ```ts
   /**
    * Detect whether the provided fallback text window contains a story marker.
    * Recognizes both @story and @supports annotations in the inspected text.
    * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
    * @req REQ-ANNOTATION-REQUIRED - Recognize story annotations discovered via fallback text scanning
    * @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Recognize @supports annotations discovered via fallback text scanning
    */
   function fallbackTextHasMarker(textBefore: string | null): boolean {
     if (typeof textBefore !== "string") {
       return false;
     }
     return textBefore.includes("@story") || textBefore.includes("@supports");
   }
   ```

4. **Rewritten `fallbackTextBeforeHasStory`**

   The public helper now just orchestrates:

   ```ts
   export function fallbackTextBeforeHasStory(
     sourceCode: any,
     node: any,
   ): boolean {
     const nodeStartIndex = getFallbackRangeStart(sourceCode, node);
     if (nodeStartIndex === null) {
       return false;
     }
     const textBefore = getFallbackTextWindow(sourceCode, nodeStartIndex);
     return fallbackTextHasMarker(textBefore);
   }
   ```

Behavior is unchanged (as confirmed by tests), but the cyclomatic complexity of this helper is substantially reduced.

---

### 3. Simplified `require-story-helpers` and eliminated the max-lines violation (NEXT #2)

**File:** `src/rules/helpers/require-story-helpers.ts`

This file had both a `max-lines` violation and several complex helpers. I applied a series of small refactors that preserve behavior:

#### 3.1. Removed duplicated constants and used IO defaults

Previously, the file redefined `LOOKBACK_LINES` and `FALLBACK_WINDOW`. Those are now owned by `require-story-io.ts`.

Changes:

- Deleted the local `LOOKBACK_LINES` and `FALLBACK_WINDOW` constants and their JSDoc.
- Left the imports from `./require-story-io`:

  ```ts
  import {
    linesBeforeHasStory,
    parentChainHasStory,
    fallbackTextBeforeHasStory,
  } from "./require-story-io";
  ```

- Updated `hasStoryAnnotation` to rely on the IO helper’s default lookback:

  ```ts
  if (linesBeforeHasStory(sourceCode, node)) {
    return true;
  }
  ```

This removed a chunk of lines and duplication while keeping detection behavior identical.

#### 3.2. Centralized story path in `require-story-core`

Previously `require-story-helpers` had its own `STORY_PATH` constant. To reduce length and duplication:

- Added a shared constant in `require-story-core.ts`:

  ```ts
  /**
   * Path to the story file for function-annotation helpers.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-REQUIRED - Provide a single source of truth for the canonical story path used by helper modules
   */
  export const STORY_PATH =
    "docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md";
  ```

- Removed the local `STORY_PATH` from `require-story-helpers.ts`.
- Imported it instead:

  ```ts
  import {
    DEFAULT_SCOPE,
    EXPORT_PRIORITY_VALUES,
    STORY_PATH,
    createAddStoryFix,
    createMethodFix,
    coreReportMissing,
    coreReportMethod,
  } from "./require-story-core";
  ```

- `getAnnotationTemplate` continues to reference `STORY_PATH` unchanged.

#### 3.3. Reduced `extractName` complexity

`extractName` was a notable complexity hotspot.

I introduced two small helpers:

1. **`getDirectIdentifierName`**

   ```ts
   /**
    * Extract a direct Identifier name when available on the given node.
    * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    * @req REQ-ANNOTATION-REQUIRED - Extract direct Identifier-based names from nodes
    */
   function getDirectIdentifierName(node: any): string | null {
     if (
       node &&
       node.type === "Identifier" &&
       typeof node.name === "string" &&
       node.name.length > 0
     ) {
       return node.name;
     }
     return null;
   }
   ```

2. **`getContainerKeyOrIdName`**

   ```ts
   /**
    * Normalize container nodes that expose names via id/key properties.
    * Supports common function and method containers, including literal keys.
    * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    * @req REQ-ANNOTATION-REQUIRED - Normalize container id/key-based names into a single helper
    */
   function getContainerKeyOrIdName(node: any): string | null {
     if (!node) {
       return null;
     }

     if (node.id) {
       const idName = getNodeName(node.id);
       if (typeof idName === "string" && idName.length > 0) {
         return idName;
       }
     }

     if (node.key) {
       const keyName = getNodeName(node.key);
       if (typeof keyName === "string" && keyName.length > 0) {
         return keyName;
       }

       if (
         node.key.type === "Literal" &&
         typeof (node.key as any).value === "string" &&
         (node.key as any).value.length > 0
       ) {
         return (node.key as any).value;
       }
     }

     return null;
   }
   ```

Then `extractName` became:

```ts
function extractName(node: any): string {
  let current: any = node;

  while (current) {
    const directIdentifierName = getDirectIdentifierName(current);
    if (directIdentifierName) {
      return directIdentifierName;
    }

    const containerName = getContainerKeyOrIdName(current);
    if (containerName) {
      return containerName;
    }

    const directName = (current as any).name;
    if (typeof directName === "string" && directName.length > 0) {
      return directName;
    }

    current = current.parent;
  }

  return "(anonymous)";
}
```

Behavior is unchanged (still walks parents and returns `"(anonymous)"` when no name is found), but the per-function complexity is lower and the intent is clearer.

#### 3.4. Moved reporting logic into dependency-injected core helpers

To reduce both line count and complexity in `require-story-helpers.ts`, I moved the heavy reporting logic behind core helpers in `require-story-core.ts`.

**In `require-story-core.ts`**

- Added a `ReportDeps` type and `CoreReportOptions`:

  ```ts
  import type { Rule } from "eslint";

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

- Added `coreReportMissing` and `coreReportMethod`:

  ```ts
  export function coreReportMissing(
    deps: ReportDeps,
    context: Rule.RuleContext,
    sourceCode: any,
    config: { node: any; target?: any; options?: CoreReportOptions },
  ): void {
    const { node, target: passedTarget, options = {} } = config;

    try {
      if (deps.hasStoryAnnotation(sourceCode, node)) {
        return;
      }

      const functionName = deps.getReportedFunctionName(node);
      const resolvedTarget = deps.resolveAnnotationTargetNode(
        sourceCode,
        node,
        passedTarget,
      );
      const nameNode = deps.getNameNodeForReport(node);
      const { effectiveTemplate, allowFix } = deps.buildTemplateConfig(options);
      const name = functionName;

      context.report({
        node: nameNode,
        messageId: "missingStory",
        data: { name, functionName: name },
        fix: allowFix
          ? deps.createAddStoryFix(resolvedTarget, effectiveTemplate)
          : undefined,
        suggest: [
          {
            desc: `Add JSDoc @story annotation for function '${name}', e.g., ${effectiveTemplate}`,
            fix: deps.createAddStoryFix(resolvedTarget, effectiveTemplate),
          },
        ],
      });
    } catch {
      /* noop */
    }
  }
  ```

  ```ts
  export function coreReportMethod(
    deps: ReportDeps,
    context: Rule.RuleContext,
    sourceCode: any,
    config: { node: any; target?: any; options?: CoreReportOptions },
  ): void {
    const { node, target: passedTarget, options = {} } = config;

    try {
      if (deps.hasStoryAnnotation(sourceCode, node)) {
        return;
      }

      const resolvedTarget =
        passedTarget ??
        deps.resolveAnnotationTargetNode(sourceCode, node, null);
      const name = deps.extractName(node);
      const nameNode =
        (node.key && node.key.type === "Identifier" && node.key) || node;

      const effectiveTemplate = deps.getAnnotationTemplate(
        options.annotationTemplateOverride,
      );
      const allowFix = deps.shouldApplyAutoFix(options.autoFixToggle);

      context.report({
        node: nameNode,
        messageId: "missingStory",
        data: { name, functionName: name },
        fix: allowFix
          ? deps.createMethodFix(resolvedTarget, effectiveTemplate)
          : undefined,
        suggest: [
          {
            desc: `Add JSDoc @story annotation for function '${name}', e.g., ${effectiveTemplate}`,
            fix: deps.createMethodFix(resolvedTarget, effectiveTemplate),
          },
        ],
      });
    } catch {
      /* noop */
    }
  }
  ```

- These helpers reuse the existing `createAddStoryFix` and `createMethodFix` and are fully dependency-injected so there’s no circular dependency with `require-story-helpers.ts`.

**Back in `require-story-helpers.ts`**

- `reportMissing` and `reportMethod` are now thin wrappers delegating to `coreReportMissing` / `coreReportMethod` and passing in the existing behavior as `deps`:

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

- Both helpers remain exported for callers; callers see no API change.

Combined, these changes:

- Removed the `max-lines` violation in `require-story-helpers.ts` (file is now under 300 lines).
- Dropped complexity scores for the previously worst functions.
- Kept behavior identical (all tests around these helpers pass).

---

### 4. Verification and CI

I ran the following locally:

- Targeted tests:

  ```bash
  npm test -- --runTestsByPath tests/rules/require-story-helpers.test.ts
  ```

- Full test suite:

  ```bash
  npm test
  ```

- Build and type-check:

  ```bash
  npm run build
  npm run type-check
  ```

- Lint and formatting checks:

  ```bash
  npm run lint
  npm run format:check
  ```

All passed.

Then:

- Staged and committed with Conventional Commit:

  ```text
  refactor: reduce complexity in require-story helpers and IO
  ```

- Pushed to `main`.
- The GitHub Actions **CI/CD Pipeline** workflow ran and completed successfully (`conclusion: success`), including the full `ci-verify:full` run (build, lint, type-check, tests, duplication, audits, secret scan, etc.).

---

## Status vs. Plan

Here is the updated plan with checkboxes:

### NOW

- [x] Identify the helper functions with the highest logical complexity in the rules and maintenance helpers and select the single worst offender as the first target for a small, behavior-preserving refactor that will reduce its complexity without changing external behavior.

  - Done via strict ESLint complexity runs; `require-story-helpers.ts` (and its IO counterpart) identified and selected.

### NEXT

- [x] Refactor the selected high-complexity helper function into smaller, focused helpers while keeping behavior identical and ensuring all existing tests around that area continue to pass.

  - Done:
    - `fallbackTextBeforeHasStory` refactored into three helpers + wrapper in `require-story-io.ts`.
    - `extractName` and reporting helpers refactored in `require-story-helpers.ts`, with behavior verified by existing tests.

- [x] Repeat the same analysis-and-refactor process for the next most complex helper functions until the key hotspots identified in the assessment have been simplified to an acceptable complexity level.

  - Done for the main hotspot cluster:
    - Additional simplification in `require-story-helpers.ts` (identifier/container name resolution and reporting).
    - Shared `STORY_PATH` and core reporting helpers introduced in `require-story-core.ts`.
    - All these helpers now satisfy existing lint complexity thresholds and file-length limits.

- [ ] Once the main helper hotspots are simplified, lower the configured complexity threshold in the linting rules to lock in the new standard without introducing violations.

  - Not yet done. The global complexity limit in `eslint.config.js` remains at `max: 18`. A future step can either tighten this globally or add stricter overrides for helper/maintenance modules now that they are cleaner.

- [ ] Review the user-facing documentation for the valid-annotation-format and related rules to locate any mismatches between documented defaults (such as story path patterns or examples) and the actual implementation, and update the docs to match real behavior.

  - Not started. Implementation and tests remain the source of truth; documentation alignment remains a follow-up task.

- [ ] Scan the remaining examples and quick-start snippets to ensure they are consistent with the current default configuration and recently added auto-fix options, adjusting wording or paths where necessary.

  - Not started. Examples still need to be systematically checked against current defaults and auto-fix capabilities.

### LATER

- [ ] Extend the complexity review to other parts of the codebase beyond the initially identified helpers, gradually tightening standards while keeping changes small and fully covered by tests.
- [ ] Consider introducing targeted unit tests around newly extracted helper functions to better document their behavior and guard against regressions as complexity is reduced.
- [ ] Review all rule and maintenance documentation in one pass to ensure terminology, option names, and defaults are consistently described, especially where recent features like auto-fix toggles and templates were added.
- [ ] After complexity and documentation have been tightened, reassess overall code quality metrics to determine if further ratcheting (such as stricter limits or additional structural rules) is both safe and beneficial.

If you’d like, the next concrete steps can be:

- Tighten complexity just for helpers/maintenance via an additional flat-config block (e.g., `max: 16`) and confirm no violations.
- Then address the doc-alignment NEXT items (valid-annotation-format defaults and examples).
---
