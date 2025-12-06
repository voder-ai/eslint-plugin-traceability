Here’s a concise history-only summary of what’s been done so far on the project, including the most recent work.

1. **`valid-req-reference` rule refactor**
   - Extracted parsing, validation, traversal, and file I/O into `valid-req-reference-helpers.ts`.
   - Simplified `valid-req-reference.ts` to meta/messages and delegated `Program` handling to a helper-based visitor.
   - Updated dev docs to describe the helper-module pattern and re-ran the full quality suite.

2. **`require-branch-annotation` improvements**
   - Analyzed control-flow and performance.
   - Added nested-branch test cases to ensure autofix applies only to inner branches.
   - Added a Jest performance test for large files (<5000 ms).
   - Updated RuleTester expectations and re-ran the full suite.

3. **Test coverage and CI reliability**
   - Ran Jest with coverage (~96.5% statements/lines, ~84.3% branches, ~99.6% functions).
   - Determined earlier coverage failures were due to missing `node_modules`.
   - Verified `ci-verify:full` on unchanged code.

4. **Maintenance CLI enhancements**
   - Reviewed `src/maintenance/*.ts` and tests; identified under-tested paths and redundant `fs.statSync` in `update.ts`.
   - Added tests for `verify` exit codes, “nothing to report,” and permission-denied handling.
   - Simplified `update.ts` to rely on `getAllFiles`, achieving full coverage.
   - Extended performance tests for `verify` and updated `.voder/plan.md`.
   - Confirmed CI success.

5. **Dogfooding and enforcing traceability**
   - Performed a dogfooding inspection (Story 023) across stories, problem docs, rules, scripts, and checks.
   - Enabled `traceability/require-story-annotation` for TS files in `eslint.config.js`.
   - Tuned ESLint overrides, reduced inline disables, and validated via `report:eslint-suppressions`.
   - Added `tests/integration/dogfooding-validation.test.ts` to assert the rule is enforced and fails on missing annotations.
   - Re-ran tests and iterated on CLI-based dogfooding.

6. **Dogfooding-related story and problem-doc updates**
   - Updated Story 023 to document enabled `require-story-annotation`, the dogfooding validation test, and incremental dogfooding.
   - Updated problem doc `001-plugin-not-enforcing-own-traceability-rules.open.md` to reference Story 023, describe the green dogfooding test, and mark mitigation as partial.

7. **Dogfooding and self-validation documentation**
   - Expanded `docs/eslint-plugin-development-guide.md` with a “Dogfooding and Self-Validation” section covering:
     - Enabling traceability rules in the repo.
     - Incremental rollout strategy.
     - Role of `report:eslint-suppressions` and `ci-verify:full`.
   - Verified lint, CI, and Husky pre-push hooks run ESLint with `require-story-annotation` for `src` and `tests`.

8. **Plugin-level metadata and setup verification**
   - Added `pluginMeta` in `src/index.ts` to expose `meta` (name, version, namespace).
   - Updated `tests/plugin-setup.test.ts` to assert meta fields and version parity with `package.json`.
   - Updated annotations for REQ-PLUGIN-STRUCTURE and REQ-NPM-PACKAGE.
   - Revalidated plugin exports, configs, CLI error handling, and updated Story 001 and docs.

9. **Traceability annotations in helper modules**
   - Reviewed helper traceability tags.
   - Fixed `valid-req-reference-helpers.ts` annotations and aligned `@supports`/`@req`.
   - Confirmed other helpers’ annotations and clarified expectations in the dev guide.
   - Re-ran the full quality suite.

10. **Ongoing quality and CI verification**
    - After each change batch, ran build, lint, tests with coverage, type-check, format, `ci-verify`, and security scans.
    - Maintained green CI pipelines.

11. **ESLint config validation and Story 002 completion**
    - Reviewed Story 002 and flat-config setup.
    - Re-checked rules (`valid-story-reference`, `require-story-annotation`, `require-test-traceability`) and related config/integration tests.
    - Ensured ESLint 9-aligned patterns, presets, and schemas.
    - Extended `tests/config/eslint-config-validation.test.ts` to cover runtime config errors for `traceability/valid-story-reference` (unknown options and type errors).
    - Updated Story 002 to mark DoD complete and re-ran tests and quality checks.

12. **Inline-code ignore behavior for annotations (Story 024.0)**
    - Reviewed Story 024.0 and existing helpers/tests.
    - Implemented backtick-aware normalization in `normalizeCommentLine` to ignore inline-code spans for `@story`/`@req`/`@supports` detection.
    - Updated helper annotations and added `tests/rules/valid-annotation-format-internal.test.ts` cases for inline code.
    - Verified integration with the main rule and updated Story 024.0 to mark AC/DoD complete.
    - Ran full quality commands.

13. **Initial coverage for `req` annotation detection heuristics**
    - Analyzed `src/utils/reqAnnotationDetection.ts` and related tests.
    - Added `tests/utils/req-annotation-detection.test.ts` covering:
      - Missing `sourceCode`/`node`.
      - Error path from `getCommentsBefore`.
      - `@supports` in comments satisfying requirement detection.
    - Introduced `createMockSourceCode` and Story 003.0 traceability.
    - Raised coverage and ran `ci-verify:fast`.

14. **CatchClause annotation helpers and tests (Story 025.0)**
    - Updated `gatherBranchCommentText` to handle `CatchClause` by checking `beforeText` then inside-catch comments.
    - Updated `getBranchAnnotationInfo` to refine indent/insert position for catch bodies.
    - Added tests for catch position/priority and autofix insertion behavior.
    - Cleaned unused imports and ran targeted and full quality commands.

15. **Node/Jest/CI tooling investigation**
    - Reviewed Node/Jest/ts-jest configuration and CI workflows.
    - Confirmed Jest 30.2.0 and ts-jest 29.4.5 run successfully on Node 22.
    - Noted mismatch with the previous `engines.node` range.

16. **Normalization of bundled dependency metadata**
    - Ran `npm list` checks, inspected `package-lock.json`, and normalized drift in bundled dependency metadata.
    - Committed the change and verified build, tests, lint, type-check, and format.

17. **Node support matrix alignment**
    - Updated `package.json` `engines.node` to support Node 18.18, 20, 22, and 24+.
    - Updated CI matrix in `.github/workflows/ci-cd.yml` to match.
    - Fixed semantic-release env var usage.
    - Updated `README.md` and `CONTRIBUTING.md` for Node/Jest/ts-jest compatibility.
    - Re-ran quality commands; multi-Node CI passed.

18. **Secretlint / multi-Node CI compatibility**
    - Investigated Node 20 failures in `security:secrets` due to `--no-color`.
    - Removed `--no-color` from the `security:secrets` script.
    - Re-ran quality checks and confirmed `ci-verify:full` and `security:secrets` passed on all Node versions.

19. **Migration to `prefer-supports-annotation` with deprecated alias (Story 010.3)**
    - In `src/index.ts`, kept implementation under `"prefer-implements-annotation"` and wired a non-deprecated alias `"prefer-supports-annotation"`.
    - Marked `"prefer-implements-annotation"` deprecated with `replacedBy` metadata and updated docs description.
    - Updated tests to run both rule names and assert presence/order in plugin exports and configs.
    - Updated docs (`prefer-supports-annotation` rule doc, API reference, migration guide, README).
    - Ran type-check, Jest, lint, format checks, and build; CI succeeded.

20. **Story 025.0 documentation alignment**
    - Reviewed CatchClause behavior and tests against Story 025.0 and related stories/docs.
    - Updated `docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md`:
      - Marked core AC and DoD for CatchClause behavior as complete.
      - Left Prettier-specific items open with notes.
      - Added implementation links.
    - Verified tests and annotations, ran `ci-verify:fast`, and confirmed related stories’ alignment.

21. **Extended coverage for `req` annotation detection heuristics**
    - Further analyzed `reqAnnotationDetection.ts` and its tests/coverage.
    - Extended `tests/utils/req-annotation-detection.test.ts` to cover additional edge cases for:
      - `linesBeforeHasReq`, `parentChainHasReq`, `fallbackTextBeforeHasReq`.
      - `hasReqInAdvancedHeuristics`, `hasReqAnnotation` including error/fallback paths.
    - Ensured names and headers reference REQ-ANNOTATION-REQ-DETECTION and Story 003.0.
    - Achieved ~99% statements/lines and ~97% branch coverage for `reqAnnotationDetection.ts`.
    - Ran Jest with coverage, lint, type-check, format checks, and `ci-verify:full`; all passed.

22. **Performance coverage for annotation format validation (Story 005.0) – most recent work**
    - Reviewed Story `005.0-DEV-ANNOTATION-VALIDATION` and related annotation-format rules/helpers and tests.
    - Confirmed all acceptance criteria were already implemented; the remaining gaps were Definition-of-Done items around performance and readiness for file validation.
    - Added a new performance test:
      - `tests/perf/valid-annotation-format-large-file.test.ts`
      - Generates a large TS source with many mixed-validity annotations and runs `traceability/valid-annotation-format` via `Linter`.
      - Asserts that diagnostics are produced and the rule completes analysis well under a 5-second guardrail.
      - Includes `@supports` header pointing to Story 005.0 and its REQ IDs.
    - Ran the new perf test directly and as part of the full test suite.
    - Updated `docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md` DoD:
      - Marked “Performance tested with various annotation patterns” as done.
      - Marked “Ready for file validation logic (006.0-DEV-FILE-VALIDATION)” as done.
    - Staged, committed (`test: add performance coverage for annotation format validation`), pushed, and monitored CI (`runId: 19992305176`), which completed successfully with all checks green.

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"."}
Used tool: list_directory with input: {"dirPath":"docs"}
Used tool: list_directory with input: {"dirPath":"prompts"}
Used tool: list_directory with input: {"dirPath":"tests"}
Used tool: list_directory with input: {"dirPath":"src"}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: read_file with input: {"filePath":"docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: list_directory with input: {"dirPath":"tests/integration"}
Used tool: list_directory with input: {"dirPath":"docs/rules"}
Used tool: list_directory with input: {"dirPath":"tests/rules"}
Used tool: read_file with input: {"filePath":"tests/integration/cli-integration.test.ts"}
Used tool: read_file with input: {"filePath":"tests/integration/dogfooding-validation.test.ts"}
Used tool: read_file with input: {"filePath":"docs/rules/require-branch-annotation.md"}
Used tool: list_directory with input: {"dirPath":"user-docs"}
Used tool: read_file with input: {"filePath":"eslint.config.js"}
Used tool: read_file with input: {"filePath":"tsconfig.json"}
Used tool: search_file_content with input: {"filePath":"tests","pattern":"Prettier","isRegex":false}
Used tool: find_files with input: {"pattern":"*.test.ts","directory":"tests"}
Used tool: search_file_content with input: {"filePath":"tests/utils/branch-annotation-catch-position.test.ts","pattern":"Prettier","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/utils/branch-annotation-catch-position.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/branch-annotation-catch-insert-position.test.ts"}
Used tool: read_file with input: {"filePath":"jest.config.js"}
Used tool: read_file with input: {"filePath":".prettierrc"}
Used tool: read_file with input: {"filePath":"user-docs/api-reference.md"}
Used tool: read_file with input: {"filePath":"user-docs/examples.md"}
Used tool: read_file with input: {"filePath":"user-docs/migration-guide.md"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts"}
Used tool: run_command with input: {"command":"node","args":["-e","const prettier=require('prettier');"]}
Used tool: run_command with input: {"command":"node","args":["-e","(async () => { const prettier = await import('prettier'); console.log(typeof prettier.format, Object.keys(prettier)); })().catch(e => { console.error(e); process.exit(1); });"]}
Used tool: run_command with input: {"command":"node","args":["-e","const prettier=require('prettier'); const code=`try {\\n  doSomething();\\n}\\n// @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\\n// @req REQ-CATCH-PATH\\ncatch (error) {\\n  handleError(error);\\n}`; console.log(prettier.format(code,{parser:'typescript'}));"]}
Used tool: run_command with input: {"command":"node","args":["-e","(async () => { const prettier = await import('prettier'); const code=`try {\\n  doSomething();\\n}\\n// @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\\n// @req REQ-CATCH-PATH\\ncatch (error) {\\n  handleError(error);\\n}`; const result = await prettier.format(code,{parser:'typescript'}); console.log(result); })().catch(e => { console.error(e); process.exit(1); });"]}
Used tool: generate_file with input: {"filePath":"tests/integration/catch-annotation-prettier.integration.test.ts","content":"/**\n * Prettier integration tests for CatchClause annotation positions.\n * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\n * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-PRETTIER-COMPATIBILITY\n */\nimport path from \"path\";\nimport { spawnSync } from \"child_process\";\nimport * as prettier from \"prettier\";\n\ndescribe(\"CatchClause annotations with Prettier (Story 025.0-DEV-CATCH-ANNOTATION-POSITION)\", () => {\n  const eslintPkgDir = path.dirname(require.resolve(\"eslint/package.json\"));\n  const eslintCliPath = path.join(eslintPkgDir, \"bin\", \"eslint.js\");\n  const configPath = path.resolve(__dirname, \"../../eslint.config.js\");\n\n  function runEslintWithRequireBranchAnnotation(code: string) {\n    const args = [\n      \"--no-config-lookup\",\n      \"--config\",\n      configPath,\n      \"--stdin\",\n      \"--stdin-filename\",\n      \"catch.js\",\n      \"--rule\",\n      \"no-unused-vars:off\",\n      \"--rule\",\n      \"traceability/require-branch-annotation:error\",\n    ];\n\n    return spawnSync(process.execPath, [eslintCliPath, ...args], {\n      encoding: \"utf-8\",\n      input: code,\n    });\n  }\n\n  async function formatWithPrettier(source: string): Promise<string> {\n    // Use the TypeScript parser since many consumers use this rule in TS code; the\n    // snippets in these tests are valid in both JS and TS.\n    return prettier.format(source, { parser: \"typescript\" });\n  }\n\n  it(\n    \"[REQ-PRETTIER-COMPATIBILITY-BEFORE] accepts code where annotations start before catch but are moved inside by Prettier\",\n    async () => {\n      const original = `\nfunction doSomething() {\n  return 42;\n}\n\nfunction handleError(error) {\n  console.error(error);\n}\n\ntry {\n  doSomething();\n}\n// @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\n// @req REQ-CATCH-PATH\ncatch (error) {\n  handleError(error);\n}\n`;\n\n      const formatted = await formatWithPrettier(original);\n\n      // Sanity check: Prettier should move the branch annotations inside the catch body.\n      expect(formatted).toContain(\"catch (error) {\");\n      const catchIndex = formatted.indexOf(\"catch (error) {\");\n      const storyIndex = formatted.indexOf(\n        \"@story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\",\n      );\n      expect(storyIndex).toBeGreaterThan(catchIndex);\n\n      const result = runEslintWithRequireBranchAnnotation(formatted);\n\n      expect(result.status).toBe(0);\n    },\n  );\n\n  it(\n    \"[REQ-PRETTIER-COMPATIBILITY-INSIDE] accepts code where annotations start inside the catch body and are preserved by Prettier\",\n    async () => {\n      const original = `\nfunction doSomething() {\n  return 42;\n}\n\nfunction handleError(error) {\n  console.error(error);\n}\n\ntry {\n  doSomething();\n} catch (error) {\n  // @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\n  // @req REQ-CATCH-INSIDE\n  handleError(error);\n}\n`;\n\n      const formatted = await formatWithPrettier(original);\n\n      // Sanity: annotations should still be associated with the catch body after formatting.\n      expect(formatted).toContain(\"catch (error) {\");\n      const catchIndex = formatted.indexOf(\"catch (error) {\");\n      const storyIndex = formatted.indexOf(\n        \"@story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\",\n      );\n      expect(storyIndex).toBeGreaterThan(catchIndex);\n\n      const result = runEslintWithRequireBranchAnnotation(formatted);\n\n      expect(result.status).toBe(0);\n    },\n  );\n\n  it(\n    \"[REQ-PRETTIER-COMPATIBILITY-EMPTY] accepts empty catch blocks with inside-catch annotations after Prettier formatting\",\n    async () => {\n      const original = `\nfunction doSomething() {\n  return 42;\n}\n\ntry {\n  doSomething();\n} catch (error) {\n  // @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\n  // @req REQ-CATCH-EMPTY\n}\n`;\n\n      const formatted = await formatWithPrettier(original);\n\n      const result = runEslintWithRequireBranchAnnotation(formatted);\n\n      expect(result.status).toBe(0);\n    },\n  );\n});\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/integration/catch-annotation-prettier.integration.test.ts"]}
Used tool: check_file_exists with input: {"filePath":"src/index.js"}
Used tool: list_directory with input: {"dirPath":"lib/src"}
Used tool: run_command with input: {"command":"ls","args":["-R","lib/src"]}
Used tool: list_directory with input: {"dirPath":"lib"}
Used tool: modify_file with input: {"filePath":"tests/integration/catch-annotation-prettier.integration.test.ts","instruction":"Replace the existing Prettier import and helper with a CLI-based formatter that spawns the Prettier binary.\n\n1. Remove the line `import * as prettier from \"prettier\";`.\n2. Add a new constant for the Prettier binary path near the other top-level constants.\n3. Replace the `formatWithPrettier` implementation to invoke the Prettier CLI via spawnSync instead of calling the Prettier API.\n4. Update the tests to call the new synchronous `formatWithPrettier` helper (remove unnecessary async/await where appropriate).\n\nConcrete edits:\n- After the existing imports, ensure only `path` and `spawnSync` are imported.\n- Inside the `describe` block, directly after the definitions of `eslintPkgDir`, `eslintCliPath`, and `configPath`, add a new `prettierBin` constant that resolves the Prettier CLI path with a Windows-aware suffix.\n- Replace the `async function formatWithPrettier` with a synchronous function that spawns Prettier and returns `stdout`, throwing an Error when the process exits non-zero.\n- Update each `it` callback to be synchronous (remove `async` keyword) and call `const formatted = formatWithPrettier(original);` instead of using `await`.\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/integration/catch-annotation-prettier.integration.test.ts"]}
Used tool: list_directory with input: {"dirPath":"node_modules/prettier"}
Used tool: run_command with input: {"command":"node","args":["-e","console.log(require.resolve('prettier'));"]}
Used tool: run_command with input: {"command":"node","args":["-e","const fs=require('fs');const path=require('path');const dir=path.dirname(require.resolve('prettier'));console.log('DIR',dir);console.log(fs.readdirSync(dir));"]}
Used tool: run_command with input: {"command":"node","args":["-e","const path=require('path');console.log(require.resolve('prettier/package.json'));console.log(path.join(path.dirname(require.resolve('prettier/package.json')),'bin','prettier.cjs'));"]}
Used tool: modify_file with input: {"filePath":"tests/integration/catch-annotation-prettier.integration.test.ts","instruction":"Update the Prettier CLI path resolution to use the package.json directory and bin/prettier.cjs, and adjust formatWithPrettier to invoke Node with that script instead of calling the binary directly.\n\n1. Replace the existing `prettierBin` constant with two constants:\n   - `prettierPackageJson` resolved via `require.resolve(\"prettier/package.json\")`.\n   - `prettierCliPath` built with `path.join(path.dirname(prettierPackageJson), \"bin\", \"prettier.cjs\")`.\n2. Update `formatWithPrettier` to call `spawnSync(process.execPath, [prettierCliPath, \"--parser\", \"typescript\"], ...)` instead of spawning `prettierBin` directly.\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/integration/catch-annotation-prettier.integration.test.ts"]}
Used tool: modify_file with input: {"filePath":"tests/integration/catch-annotation-prettier.integration.test.ts","instruction":"Update the ESLint rule configuration in runEslintWithRequireBranchAnnotation to only enforce the rule on CatchClause nodes.\n\nReplace the second \"--rule\" argument string from\n\"traceability/require-branch-annotation:error\" to\n\"traceability/require-branch-annotation:[\\\"error\\\",{\\\"branchTypes\\\":[\\\"CatchClause\\\"]}]\".\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/integration/catch-annotation-prettier.integration.test.ts"]}
Used tool: run_command with input: {"command":"node","args":["-e","(async () => { const prettier = await import('prettier'); const code=`function doSomething() {\\n  return 42;\\n}\\n\\nfunction handleError(error) {\\n  console.error(error);\\n}\\n\\ntry {\\n  doSomething();\\n}\\n// @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\\n// @req REQ-CATCH-PATH\\ncatch (error) {\\n  handleError(error);\\n}\\n`; const result = await prettier.format(code,{parser:'typescript'}); console.log(result); })().catch(e => { console.error(e); process.exit(1); });"]}
Used tool: generate_file with input: {"filePath":"tests/fixtures/prettier-catch-before.js","content":"function doSomething() {\n  return 42;\n}\n\nfunction handleError(error) {\n  console.error(error);\n}\n\ntry {\n  doSomething();\n} catch (error) {\n  // @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\n  // @req REQ-CATCH-PATH\n  handleError(error);\n}\n"}
Used tool: run_command with input: {"command":"node","args":["node_modules/eslint/bin/eslint.js","--no-config-lookup","--config","eslint.config.js","--rule","no-unused-vars:off","--rule","traceability/require-branch-annotation:[\"error\",{\"branchTypes\":[\"CatchClause\"]}]","tests/fixtures/prettier-catch-before.js"]}
Used tool: run_command with input: {"command":"node","args":["node_modules/eslint/bin/eslint.js","--no-config-lookup","--config","eslint.config.js","--rule","no-unused-vars:off","--rule","no-magic-numbers:off","--rule","no-undef:off","--rule","traceability/require-branch-annotation:[\"error\",{\"branchTypes\":[\"CatchClause\"]}]","tests/fixtures/prettier-catch-before.js"]}
Used tool: read_file with input: {"filePath":"src/rules/require-branch-annotation.ts"}
Used tool: run_command with input: {"command":"node","args":["-e","(async () => { const prettier = await import('prettier'); const code=`function doSomething() {\\n  return 42;\\n}\\n\\nfunction handleError(error) {\\n  console.error(error);\\n}\\n\\n// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\\n// @req REQ-BRANCH-TRY\\ntry {\\n  doSomething();\\n}\\n// @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\\n// @req REQ-CATCH-PATH\\ncatch (error) {\\n  handleError(error);\\n}\\n`; const result = await prettier.format(code,{parser:'typescript'}); console.log(result); })().catch(e => { console.error(e); process.exit(1); });"]}
Used tool: modify_file with input: {"filePath":"tests/integration/catch-annotation-prettier.integration.test.ts","instruction":"1. In runEslintWithRequireBranchAnnotation, replace the rules array to disable other core rules that would interfere with the integration scenario and revert require-branch-annotation to a simple severity:\n- After the existing \"--rule\", \"no-unused-vars:off\", add:\n  \"--rule\",\n  \"no-magic-numbers:off\",\n  \"--rule\",\n  \"no-undef:off\",\n  \"--rule\",\n  \"no-console:off\",\n  and change the final rule string back to \"traceability/require-branch-annotation:error\".\n\n2. Update the `original` source strings in all three tests to include annotations on the try block as well, so that the TryStatement branch passes `require-branch-annotation` and the test only exercises CatchClause behavior:\n\n- For the BEFORE test, prepend the try block with:\n  `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md` and\n  `// @req REQ-BRANCH-TRY` on their own lines immediately before `try {`.\n\n- For the INSIDE test, similarly add those two comment lines immediately before the `try {` line.\n\n- For the EMPTY test, likewise add those two comment lines immediately before the `try {` line.\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/integration/catch-annotation-prettier.integration.test.ts"]}
Used tool: read_file with input: {"filePath":"tests/fixtures/prettier-catch-before.js"}
Used tool: generate_file with input: {"filePath":"tests/fixtures/prettier-catch-before.js","overwrite":true,"content":"function doSomething() {\n  return 42;\n}\n\nfunction handleError(error) {\n  console.error(error);\n}\n\n// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\n// @req REQ-BRANCH-TRY\ntry {\n  doSomething();\n} catch (error) {\n  // @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\n  // @req REQ-CATCH-PATH\n  handleError(error);\n}\n"}
Used tool: run_command with input: {"command":"node","args":["node_modules/eslint/bin/eslint.js","--no-config-lookup","--config","eslint.config.js","--rule","no-unused-vars:off","--rule","no-magic-numbers:off","--rule","no-undef:off","--rule","no-console:off","--rule","traceability/require-branch-annotation:error","tests/fixtures/prettier-catch-before.js"]}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","instruction":"Extend CatchClause handling in gatherBranchCommentText to support environments where sourceCode.getCommentsInside is not available by scanning the catch block body lines for leading comment-only lines.\n\nWithin the existing `if (node.type === \"CatchClause\")` block:\n\n1. Keep the early return when `beforeText` already contains annotations.\n2. Keep the current `getCommentsInside` logic, but *only* return `insideText` when it is non-empty; if it is empty or an error is thrown, fall through to the new fallback instead of immediately returning `beforeText`.\n3. After the `getCommentsInside` try/catch block, add a new fallback that:\n   - Checks `node.body && node.body.loc && node.body.loc.start && node.body.loc.end`.\n   - Uses `sourceCode.lines` to inspect the lines inside the catch block body.\n   - Computes zero-based indices from `node.body.loc.start.line` / `end.line`.\n   - Starting from the first line *inside* the block (i.e., `startIndex + 1`), collects consecutive lines that begin with comment markers (`//` or `/*`) using a regular expression similar to the SwitchCase logic (`/^\\s*(\\/\\/|\\/*)/`).\n   - Stops when it encounters a non-comment or blank line, so only the leading comment block at the top of the catch body is used.\n   - Trims each collected line before joining them with spaces into `insideText`.\n   - Returns `insideText` when non-empty, otherwise falls back to `beforeText`.\n4. Ensure the final `return` at the end of the CatchClause block remains `return beforeText;` so that when no inside comments are found and no annotations are present, behavior is unchanged.\n\nBe careful to use the same `commentToValue` helper for any token-based paths, and only introduce the new line-based fallback when `getCommentsInside` is not available or returns no annotation content.\n"}
Used tool: modify_file with input: {"filePath":"tests/utils/branch-annotation-catch-position.test.ts","instruction":"Append a new test case that exercises the line-based CatchClause fallback when getCommentsInside is not available but comments exist as the first lines inside the catch block.\n\nAfter the existing tests, add:\n\n  it(\"[REQ-FALLBACK-LOGIC] collects inside-catch comments using line-based fallback when getCommentsInside is unavailable\", () => {\n    const lines = [\n      \"try {\",\n      \"  doSomething();\",\n      \"} catch (error) {\",\n      \"  // @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\",\n      \"  // @req REQ-CATCH-LINE-FALLBACK\",\n      \"  handleError(error);\",\n      \"}\",\n    ];\n\n    const sourceCode: any = {\n      lines,\n      getCommentsBefore() {\n        return [];\n      },\n    };\n\n    const node: any = {\n      type: \"CatchClause\",\n      loc: { start: { line: 3 } },\n      body: {\n        type: \"BlockStatement\",\n        loc: { start: { line: 3 }, end: { line: 7 } },\n        body: [],\n      },\n    };\n\n    const text = gatherBranchCommentText(sourceCode, node);\n    expect(text).toContain(\n      \"@story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\",\n    );\n    expect(text).toContain(\"@req REQ-CATCH-LINE-FALLBACK\");\n  });\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/utils/branch-annotation-catch-position.test.ts","tests/integration/catch-annotation-prettier.integration.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/integration/catch-annotation-prettier.integration.test.ts"]}
Used tool: read_file with input: {"filePath":"docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md"}
Used tool: read_file with input: {"filePath":"docs/rules/require-branch-annotation.md"}
Used tool: search_file_content with input: {"filePath":"user-docs/api-reference.md","pattern":"traceability/require-branch-annotation","isRegex":false}
Used tool: read_file with input: {"filePath":"user-docs/api-reference.md"}
Used tool: modify_file with input: {"filePath":"docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md","instruction":"Update acceptance criteria and Definition of Done to reflect the new Prettier integration tests and documentation, and mention the new integration test in Implementation Links and Prettier behavior notes.\n\n1. In the Acceptance Criteria list, change the \"Prettier Compatibility\" item from unchecked to checked and append a short parenthetical noting that it is covered by the new integration tests in `tests/integration/catch-annotation-prettier.integration.test.ts`.\n2. In the Acceptance Criteria list, change the \"Documentation\" item from unchecked to checked and mention that both the internal rule documentation and user API reference now describe catch annotation positions and Prettier compatibility.\n3. In the Implementation Links section, add a new bullet for the integration tests file: `tests/integration/catch-annotation-prettier.integration.test.ts – end-to-end Prettier + ESLint integration tests for CatchClause annotations`.\n4. In the Prettier Behavior Documentation subsection, update the tested Prettier version from `v3.4.2` to `v3.6.2` and note that the behavior is exercised via the CLI in the new integration tests.\n5. In the Definition of Done list, update the items as follows:\n   - Mark \"Integration test with actual Prettier-formatted code\" as checked and mention the new `tests/integration/catch-annotation-prettier.integration.test.ts` file.\n   - Mark \"Rule documentation updated with Prettier compatibility notes\" as checked.\n   - Leave \"Migration guide updated...\" as-is for now (still pending).\n   - Adjust the first bullet so it no longer mentions the explicit Prettier integration test and documentation items as open; instead, state that all acceptance criteria are now met, with references to the relevant tests and docs.\n"}
Used tool: modify_file with input: {"filePath":"docs/rules/require-branch-annotation.md","instruction":"Expand the Rule Details section to describe catch clause annotation positions and Prettier compatibility.\n\n1. After the first paragraph under \"## Rule Details\", replace the single-sentence description with a slightly longer explanation:\n   - Note that for most branch types the rule looks for `@story` and `@req` in comments immediately preceding the branch.\n   - Explain that for `CatchClause` nodes the rule also accepts annotations placed as the first comment-only lines inside the catch block body, to remain compatible with formatters such as Prettier that move `catch` comments into the block.\n2. Add a new subsection titled \"### Catch clause annotation positions\" before the \"### Options\" section that:\n   - States the two valid locations for catch annotations: immediately before the `catch` keyword, or as the first comments inside the catch block body.\n   - Documents that when annotations are present in both positions, the before-catch position takes precedence.\n   - States that the rule’s auto-fix logic for missing catch annotations inserts the placeholder annotations inside the catch body (aligned with Prettier’s behavior), while other branch types still receive annotations before the branch keyword.\n   - Mentions that this behavior is validated by unit tests in `tests/utils/branch-annotation-catch-position.test.ts` and integration tests in `tests/integration/catch-annotation-prettier.integration.test.ts`.\n3. Keep the existing Options and Examples sections intact below the new catch-specific subsection.\n"}
Used tool: modify_file with input: {"filePath":"user-docs/api-reference.md","instruction":"Update the `traceability/require-branch-annotation` rule description to mention catch clause annotation positions and formatter (Prettier) compatibility.\n\nWithin the `### traceability/require-branch-annotation` section:\n\n1. Replace the current single-sentence Description with a short paragraph that:\n   - States the rule ensures significant branches have `@story` and `@req` annotations in comments.\n   - Clarifies that for catch clauses, annotations may either appear immediately before the `catch` keyword or as the first comment-only lines inside the catch block.\n   - Notes that this dual-position behavior is designed to be compatible with common formatters such as Prettier, which move comments from before `catch` into the catch body.\n2. After the options bullet list for `branchTypes`, add a brief \"Behavior notes\" sub-list (plain text, not a separate heading) with two bullets:\n   - One explaining that when annotations exist in both positions for a catch clause, the before-catch comments take precedence.\n   - One explaining that when auto-fixing missing annotations for a catch clause, the rule inserts placeholder comments inside the catch body so that formatters like Prettier preserve them.\n3. Leave the Default Severity and Example code block unchanged.\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/utils/branch-annotation-catch-position.test.ts","tests/integration/catch-annotation-prettier.integration.test.ts"]}
Used tool: get_git_status with input: {}
Used tool: remove_file with input: {"filePath":"tests/fixtures/prettier-catch-before.js"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/utils/branch-annotation-catch-position.test.ts","tests/integration/catch-annotation-prettier.integration.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","instruction":"Refactor gatherBranchCommentText to reduce its size and complexity by extracting the CatchClause-specific logic and the comment-value mapper into dedicated helper functions.\n\n1. Introduce a new top-level helper function above gatherBranchCommentText:\n\n   /**\n    * Extract the raw value from a comment node.\n    * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\n    * @req REQ-TRACEABILITY-MAP-CALLBACK - Trace mapping of comment nodes to their text values\n    */\n   function extractCommentValue(_c: any): string {\n     return _c.value;\n   }\n\n   Remove the inner `commentToValue` function from gatherBranchCommentText and replace uses of it with `extractCommentValue`.\n\n2. Introduce a new helper to encapsulate CatchClause-specific annotation gathering logic, placing it just above gatherBranchCommentText:\n\n   /**\n    * Gather annotation text for CatchClause nodes, supporting both before-catch and inside-catch positions.\n    * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\n    * @req REQ-DUAL-POSITION-DETECTION\n    * @req REQ-FALLBACK-LOGIC\n    */\n   function gatherCatchClauseCommentText(\n     sourceCode: ReturnType<Rule.RuleContext[\"getSourceCode\"]>,\n     node: any,\n     beforeText: string,\n   ): string {\n     // Move the existing CatchClause body from gatherBranchCommentText here,\n     // using extractCommentValue in place of the previous commentToValue helper.\n   }\n\n   The body of this helper should be equivalent to the current CatchClause branch in gatherBranchCommentText (including the getCommentsInside path and the line-based fallback), but operating on the provided `beforeText` and returning the final text.\n\n3. Simplify gatherBranchCommentText:\n\n   - After computing `beforeText`, replace the current CatchClause `if` block with:\n\n     if (node.type === \"CatchClause\") {\n       return gatherCatchClauseCommentText(sourceCode, node, beforeText);\n     }\n\n   - Leave the SwitchCase handling and the final `return beforeText;` unchanged.\n\n4. Ensure TypeScript types remain correct and that all existing functionality is preserved. Do not modify any other functions.\n"}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/utils/branch-annotation-catch-position.test.ts","tests/integration/catch-annotation-prettier.integration.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/utils/branch-annotation-catch-position.test.ts","tests/integration/catch-annotation-prettier.integration.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"fix: ensure catch clause annotations remain valid after prettier formatting"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
---

**This was the result:**
---
## Completed work

### NOW

- [x] Review the catch-annotation position story to extract the specific Prettier compatibility acceptance criteria and end-to-end scenarios that still need to be covered by tests.

I reviewed `docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md` and pulled out:

- Prettier compatibility requirement (code formatted by Prettier with default settings must pass).
- Need for explicit integration test with actual Prettier.
- Edge cases: empty catch blocks and formatter-reflowed comments.
- Documentation requirement: describe both valid positions and Prettier compatibility in rule docs and user-facing API docs.

These directly informed the new integration tests and docs updates below.

---

### NEXT

- [x] Design one concrete end-to-end test scenario that formats code containing CatchClause annotations with Prettier and then validates it with the plugin, ensuring the annotations remain in a valid position and are recognized correctly.
- [x] Implement the new end-to-end test using the existing testing patterns, covering at least both before-catch and inside-catch annotation placements after formatting.
- [x] If needed, add additional end-to-end scenarios to exercise edge cases mentioned in the story, such as empty catch blocks or comments that Prettier may reflow in non-trivial ways.
- [x] Update the catch-annotation story document to mark the Prettier compatibility and integration-test acceptance criteria as satisfied, linking to the new tests.
- [x] Review user-facing rule documentation and API docs to ensure they explicitly describe the valid positions for catch annotations and mention their compatibility with common formatters, updating the text where necessary.

#### 1. Catch + Prettier end-to-end integration tests

**New test file:**

- `tests/integration/catch-annotation-prettier.integration.test.ts`

Key characteristics:

- File-level traceability:

  ```ts
  /**
   * Prettier integration tests for CatchClause annotation positions.
   * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
   * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-PRETTIER-COMPATIBILITY
   */
  ```

- Uses the ESLint CLI + flat config, mirroring the existing CLI integration tests:

  ```ts
  const eslintPkgDir = path.dirname(require.resolve("eslint/package.json"));
  const eslintCliPath = path.join(eslintPkgDir, "bin", "eslint.js");
  const configPath = path.resolve(__dirname, "../../eslint.config.js");
  ```

- Isolates the `traceability/require-branch-annotation` rule and disables unrelated core rules that would otherwise fail on the example code:

  ```ts
  function runEslintWithRequireBranchAnnotation(code: string) {
    const args = [
      "--no-config-lookup",
      "--config",
      configPath,
      "--stdin",
      "--stdin-filename",
      "catch.js",
      "--rule",
      "no-unused-vars:off",
      "--rule",
      "no-magic-numbers:off",
      "--rule",
      "no-undef:off",
      "--rule",
      "no-console:off",
      "--rule",
      "traceability/require-branch-annotation:error",
    ];

    return spawnSync(process.execPath, [eslintCliPath, ...args], {
      encoding: "utf-8",
      input: code,
    });
  }
  ```

- Runs **Prettier v3.6.2 via its CLI** with the TypeScript parser, so we exercise the real formatter behavior rather than stubs:

  ```ts
  const prettierPackageJson = require.resolve("prettier/package.json");
  const prettierCliPath = path.join(
    path.dirname(prettierPackageJson),
    "bin",
    "prettier.cjs",
  );

  function formatWithPrettier(source: string): string {
    const result = spawnSync(
      process.execPath,
      [prettierCliPath, "--parser", "typescript"],
      {
        encoding: "utf-8",
        input: source,
      },
    );

    if (result.status !== 0) {
      throw new Error(
        `Prettier formatting failed: ${result.stderr || result.stdout}`,
      );
    }

    return result.stdout;
  }
  ```

**Scenarios covered:**

1. **Before-catch annotations moved inside by Prettier**

   - Original code:

     ```ts
     function doSomething() {
       return 42;
     }

     function handleError(error) {
       console.error(error);
     }

     // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     // @req REQ-BRANCH-TRY
     try {
       doSomething();
     }
     // @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
     // @req REQ-CATCH-PATH
     catch (error) {
       handleError(error);
     }
     ```

   - Test:

     ```ts
     it(
       "[REQ-PRETTIER-COMPATIBILITY-BEFORE] accepts code where annotations start before catch but are moved inside by Prettier",
       () => {
         const formatted = formatWithPrettier(original);

         // Sanity check: Prettier moved the catch annotations inside the block.
         expect(formatted).toContain("catch (error) {");
         const catchIndex = formatted.indexOf("catch (error) {");
         const storyIndex = formatted.indexOf(
           "@story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md",
         );
         expect(storyIndex).toBeGreaterThan(catchIndex);

         const result = runEslintWithRequireBranchAnnotation(formatted);
         expect(result.status).toBe(0);
       },
     );
     ```

   - This validates that code with comments originally between `try` and `catch` still passes after Prettier moves those comments inside the catch body.

2. **Inside-catch annotations preserved by Prettier**

   - Original code:

     ```ts
     function doSomething() {
       return 42;
     }

     function handleError(error) {
       console.error(error);
     }

     // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     // @req REQ-BRANCH-TRY
     try {
       doSomething();
     } catch (error) {
       // @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
       // @req REQ-CATCH-INSIDE
       handleError(error);
     }
     ```

   - Test name: `[REQ-PRETTIER-COMPATIBILITY-INSIDE] ...`  
     Confirms annotations that already live inside the body stay associated with the catch branch after formatting, and the rule recognizes them.

3. **Empty catch block with only comments (edge case)**

   - Original code:

     ```ts
     function doSomething() {
       return 42;
     }

     // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     // @req REQ-BRANCH-TRY
     try {
       doSomething();
     } catch (error) {
       // @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
       // @req REQ-CATCH-EMPTY
     }
     ```

   - Test name: `[REQ-PRETTIER-COMPATIBILITY-EMPTY] ...`  
     Ensures even when the catch body has no executable statements—only comment annotations—Prettier + ESLint still result in a clean run (no missing-annotation errors).

In all scenarios, we also annotate the `try` branch itself (before `try`) so `require-branch-annotation` succeeds for the `TryStatement`, allowing the tests to focus exclusively on CatchClause behavior.

#### 2. CatchClause detection implementation improvements

To make the integration tests pass with real ESLint `SourceCode`, I fixed the CatchClause detection and kept complexity under lint limits.

**Core change:**

- `src/utils/branch-annotation-helpers.ts`

Previously, CatchClause handling relied only on `sourceCode.getCommentsInside`, which is not guaranteed to be present in ESLint’s `SourceCode`, so real runs did not detect inside-catch annotations even though unit tests (with a custom stub) passed.

Changes:

- Introduced reusable comment-value helper:

  ```ts
  function extractCommentValue(_c: any): string {
    return _c.value;
  }
  ```

- Extracted CatchClause-specific logic into a dedicated helper:

  ```ts
  function gatherCatchClauseCommentText(
    sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
    node: any,
    beforeText: string,
  ): string {
    if (/@story\b/.test(beforeText) || /@req\b/.test(beforeText)) {
      return beforeText;
    }

    const getCommentsInside: unknown = (sourceCode as any).getCommentsInside;
    if (node.body && typeof getCommentsInside === "function") {
      try {
        const insideComments =
          (getCommentsInside as (_node: any) => any[])(node.body) || [];
        const insideText = insideComments.map(extractCommentValue).join(" ");
        if (insideText) {
          return insideText;
        }
      } catch {
        // fall through to line-based fallback
      }
    }

    if (node.body && node.body.loc && node.body.loc.start && node.body.loc.end) {
      const lines = sourceCode.lines;
      const startIndex = node.body.loc.start.line - 1;
      const endIndex = node.body.loc.end.line - 1;
      const comments: string[] = [];
      let i = startIndex + 1;

      while (i <= endIndex) {
        const line = lines[i];
        if (!line || !line.trim()) break;
        if (!/^\s*(\/\/|\/\*)/.test(line)) break;
        comments.push(line.trim());
        i++;
      }

      const insideText = comments.join(" ");
      if (insideText) {
        return insideText;
      }
    }

    return beforeText;
  }
  ```

- `gatherBranchCommentText` is now simpler and delegates CatchClause behavior:

  ```ts
  const beforeComments = sourceCode.getCommentsBefore(node) || [];
  const beforeText = beforeComments.map(extractCommentValue).join(" ");

  if (node.type === "CatchClause") {
    return gatherCatchClauseCommentText(sourceCode, node, beforeText);
  }

  return beforeText;
  ```

This gives us:

- Before-catch annotations (existing behavior).
- A robust fallback that:
  - First tries `getCommentsInside` if available.
  - Otherwise scans the **first comment-only lines inside the catch block body** based on `node.body.loc` and `sourceCode.lines`.
- Compatibility with both stubbed SourceCode (unit tests) and real ESLint `SourceCode` (integration tests).

I kept all existing branch logic and auto-fix behavior unchanged, including insertion positions computed in `getBranchAnnotationInfo`.

**New unit test for the line-based fallback:**

- `tests/utils/branch-annotation-catch-position.test.ts`

  Added:

  ```ts
  it(
    "[REQ-FALLBACK-LOGIC] collects inside-catch comments using line-based fallback when getCommentsInside is unavailable",
    () => {
      const lines = [
        "try {",
        "  doSomething();",
        "} catch (error) {",
        "  // @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md",
        "  // @req REQ-CATCH-LINE-FALLBACK",
        "  handleError(error);",
        "}",
      ];

      const sourceCode: any = {
        lines,
        getCommentsBefore() {
          return [];
        },
      };

      const node: any = {
        type: "CatchClause",
        loc: { start: { line: 3 } },
        body: {
          type: "BlockStatement",
          loc: { start: { line: 3 }, end: { line: 7 } },
          body: [],
        },
      };

      const text = gatherBranchCommentText(sourceCode, node);
      expect(text).toContain(
        "@story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md",
      );
      expect(text).toContain("@req REQ-CATCH-LINE-FALLBACK");
    },
  );
  ```

This directly exercises the new line-based fallback path without relying on any non-standard `getCommentsInside`.

#### 3. Story and documentation updates

**Story:**

- `docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md`

Updates:

- **Acceptance Criteria:**

  - `Prettier Compatibility` now checked, explicitly referencing the new integration tests:

    > … (behavior is validated via inside-catch detection, insert-position logic, and integration tests in `tests/integration/catch-annotation-prettier.integration.test.ts`)

  - `Documentation` now checked, stating both internal rule docs and the API reference describe catch positions and Prettier behavior.

- **Implementation Links:**

  - Added:

    > `tests/integration/catch-annotation-prettier.integration.test.ts` – end-to-end Prettier + ESLint integration tests for CatchClause annotations

- **Prettier Behavior Documentation:**

  - Updated version to `v3.6.2` and noted that behavior is exercised via the CLI in the new integration tests.

- **Definition of Done:**

  - `All acceptance criteria met` now reflects that both tests and docs are in place.
  - `Integration test with actual Prettier-formatted code` marked as done, referencing the new integration test file.
  - `Rule documentation updated with Prettier compatibility notes` marked done.
  - Migration guide remains pending (explicitly left unchecked).

**Internal rule documentation:**

- `docs/rules/require-branch-annotation.md`

  - Expanded **Rule Details**:

    > … For most branch types, the rule expects these annotations in comments immediately preceding the branch node. For `CatchClause` nodes, the rule is more flexible and also accepts annotations placed as the first comment-only lines inside the catch block body, to stay compatible with formatters such as Prettier…

  - Added **“Catch clause annotation positions”** section, describing:

    - Two valid locations:
      1. Immediately before `catch`.
      2. First comment-only lines inside the catch body.
    - Priority when both are present (before-catch wins).
    - That auto-fix for catch inserts placeholders inside the body, while other branches still get annotations before the keyword.
    - References to:
      - `tests/utils/branch-annotation-catch-position.test.ts`
      - `tests/integration/catch-annotation-prettier.integration.test.ts`

**User-facing API documentation:**

- `user-docs/api-reference.md` – `traceability/require-branch-annotation` section

  - Updated description:

    > … Ensures significant code branches (if/else, loops, switch cases, try/catch) have both `@story` and `@req` annotations in comments. For `catch` clauses specifically, the rule accepts annotations either immediately before the `catch` keyword or as the first comment-only lines inside the catch block. This dual-position handling is designed to stay compatible with common formatters such as Prettier…

  - Added behavior notes after the `branchTypes` options:

    - When both before-`catch` and inside-block annotations exist, before-`catch` takes precedence.
    - Auto-fix for catch inserts placeholder comments inside the block so formatters like Prettier preserve them.

This satisfies the “Documentation” acceptance criterion for Story 025.0, for both internal and user-facing docs.

---

### Quality and CI

Locally I ran (and they all passed):

- `npm run build`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run format:check`

Then pushed, which triggered the project’s full CI/CD pipeline (`ci-verify:full`), including:

- Traceability checks
- Dependency safety checks
- Build, lint, duplication, full test coverage, format check
- Secret scanning

The latest “CI/CD Pipeline” workflow on `main` completed with **success**.

---

### Updated Plan

Here is the updated plan with completed items marked:

## NOW

- [x] Review the catch-annotation position story to extract the specific Prettier compatibility acceptance criteria and end-to-end scenarios that still need to be covered by tests.

## NEXT

- [x] Design one concrete end-to-end test scenario that formats code containing CatchClause annotations with Prettier and then validates it with the plugin, ensuring the annotations remain in a valid position and are recognized correctly.
- [x] Implement the new end-to-end test using the existing testing patterns, covering at least both before-catch and inside-catch annotation placements after formatting.
- [x] If needed, add additional end-to-end scenarios to exercise edge cases mentioned in the story, such as empty catch blocks or comments that Prettier may reflow in non-trivial ways.
- [x] Update the catch-annotation story document to mark the Prettier compatibility and integration-test acceptance criteria as satisfied, linking to the new tests.
- [x] Review user-facing rule documentation and API docs to ensure they explicitly describe the valid positions for catch annotations and mention their compatibility with common formatters, updating the text where necessary.

If you’d like, I can next extend similar formatter-integration coverage to other branch types (e.g., `else if` and `switch` cases) as outlined in the LATER section.
---
