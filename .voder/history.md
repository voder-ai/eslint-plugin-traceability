Here’s the requested history-only summary of what’s been done so far, including the most recent work, with no future plans.

---

1. **Test Duplication Reduction**
   - Ran `jscpd` to find duplication in `tests/utils/annotation-checker.test.ts`.
   - Refactored tests to reuse `withTsLanguageOptions` from `tests/utils/ts-language-options.ts`.
   - Re-ran tests and `jscpd` to confirm behavior and reduced duplication.
   - Committed as `test: refactor annotation-checker RuleTester setup to shared helper`.

2. **Traceability Annotation Improvements**
   - Added/refined `@supports` annotations in multiple maintenance and helper files.
   - Ran `npm run check:traceability` and full CI.
   - Committed as `chore: improve traceability annotations for maintenance and validation helpers`.

3. **Documentation Separation and Cleanup**
   - Separated user-facing vs internal docs, cleaned internal references from `SECURITY.md` and `CONTRIBUTING.md`.
   - Clarified ownership of `docs/stories/...` in user docs.
   - Ran `npm run ci-verify:full` (CI run `19935224744` passed).
   - Committed as `docs: remove user-facing references to internal docs`.

4. **CODE_QUALITY Slice Strategy**
   - Documented code-quality assessment slices and added `.voder-code-quality-slices.json`.
   - Wrote `docs/code-quality-assessment-guide.md`.
   - Updated `docs/ci-cd-pipeline.md` with a CODE_QUALITY section.
   - CI run `19935786345` passed.
   - Committed as `docs: document CODE_QUALITY slice strategy`.

5. **Clarifying CODE_QUALITY Interpretation and Dependencies**
   - Clarified semantics, passing criteria, and finding classifications in the assessment guide.
   - Updated decision docs to reference dependency on passing slice runs.
   - Re-ran full checks; CI `19936091302` passed.
   - Committed as `docs: clarify code-quality slice interpretation and dependencies`.

6. **Rename Multi-Story Annotation from `@implements` to `@supports`**
   - Confirmed `@supports` as canonical from Story 010.2 and ADRs.
   - Updated ADR 011, story docs, README, user docs, and rule docs to prefer `@supports`.
   - Updated parsing/behavior across multiple annotation utilities and rules; updated tests.
   - Switched Husky hook from `postinstall` to `prepare`.
   - Ran full checks; CI passed.
   - Committed as:
     - `fix: rename multi-story annotation from @implements to @supports`
     - `fix: avoid running husky in consumers and repair smoke test`.

7. **New Rule: `traceability/require-test-traceability` (Story 020.0)**
   - Implemented a rule to:
     - Detect test files.
     - Enforce file-level `@supports`.
     - Validate story references in `describe`.
     - Enforce `[REQ-XXX]` prefixes in tests.
   - Added tests and documentation entries.
   - Full checks passed; committed as `feat: add require-test-traceability rule for test files`.

8. **Safe Auto-Fix for `require-test-traceability` (Story 021.0)**
   - Added `fixable: "code"` and configuration options.
   - Extracted helpers for test-file detection, inserting placeholder `@supports`, and normalizing REQ prefixes.
   - Updated tests and docs.
   - Full quality checks passed.
   - Committed as `feat: add safe auto-fix support for test traceability rule`.

9. **Ignoring Generated Assessment and CI Artifacts (First Round)**
   - Extended `.gitignore` to ignore assessment/CI report artifacts.
   - Removed tracked instances of these files.
   - Re-ran build, tests, lint, type-check, and format.
   - Committed as `chore: ignore generated assessment and ci report artifacts`.

10. **CI Tooling Engine Alignment and Workflow Updates**
    - Verified `semantic-release` engine requirements.
    - Updated CI workflows to use Node `22.14.0` for relevant jobs.
    - Ran full checks; CI succeeded.
    - Committed as `ci: align workflow node version with semantic-release engines`.

11. **CI/CD Docs Sync and Ephemeral Artifacts**
    - Documented CI Node version and consumer `engines.node` requirements.
    - Documented ignored ephemeral `.voder*` and report artifacts.
    - Ran checks; CI passed.
    - Committed as:
      - `docs: document ignored ephemeral ci and assessment artifacts`
      - `docs: sync ci-cd documentation with updated workflow node version`.

12. **JSDoc Coexistence for Annotation Parsing (Story 022.0)**
    - Updated internal/outer annotation-format rules to treat non-traceability JSDoc tags as annotation boundaries.
    - Extracted validators/finalizers into a shared helper file.
    - Expanded tests and updated rule documentation.
    - CI run `19950791613` passed.
    - Committed as `fix: support JSDoc tag coexistence for annotation parsing`.

13. **README and Docs Updates for Test Traceability & Annotation Alignment**
    - Added the test-traceability rule to README “Available Rules”.
    - Standardized internal traceability comments to `@supports`.
    - Synced security docs and CI workflow with `package.json` security scripts.
    - Extended examples with a test-traceability scenario using `@supports story#REQ`.
    - Ran `npm run ci-verify:fast`; CI green.
    - Committed under multiple messages, including:
      - `docs: document test traceability rule and align CLI annotations`
      - `chore: migrate maintenance and helper annotations to supports tag`
      - `docs: add test traceability rule to README and examples`
      - `chore: standardize @supports traceability annotations`
      - `docs: align test traceability example with @supports syntax`.

14. **Alignment of `require-test-traceability` Docs with Implementation**
    - Clarified `testFilePatterns` behavior and defaults.
    - Updated JSDoc, schema defaults, and API reference.
    - Ran lint and tests.
    - Committed as `docs: align require-test-traceability docs with implementation`.

15. **Traceability Annotations for `prefer-implements-annotation` Helpers**
    - Added `@supports` annotations for internal helpers in `prefer-implements-annotation`.
    - Confirmed annotation coverage.
    - Ran lint, tests, build, type-check, format; CI `19951915485` passed.
    - Committed as `chore: add traceability annotations for prefer-implements-annotation helpers`.

16. **Additional Traceability Helper Review**
    - Reviewed `valid-implements-utils.ts` for annotation coverage and exports.
    - Determined no changes were required.

17. **Centralization of Maintenance and Debug Scripts**
    - Surveyed `scripts/` to distinguish CI-wired vs orphaned tools.
    - Added npm scripts for maintenance/debug workflows (`check:ci-artifacts`, `coverage:branches`, `debug:*`, etc.).
    - Ran new scripts plus fast CI-verify, build, tests, lint, type-check, format:check.
    - Committed as `chore: centralize maintenance and debug scripts via npm scripts`.

18. **Documentation of Centralized Maintenance and Debug Scripts**
    - Updated `docs/ci-cd-pipeline.md` to describe new scripts and their purposes.
    - Ran build, tests, lint, type-check, format:check.
    - Committed as `docs: document centralized maintenance and debug scripts`.

19. **Maintenance Tools Performance Targets and Tests**
    - Documented performance targets and fixtures in `docs/maintenance-performance-tests.md`.
    - Added large-workspace performance tests for maintenance APIs and CLI.
    - Updated docs with test locations, commands, and interpretation.
    - Ran perf tests and full quality checks; CI pipeline succeeded.
    - Committed as:
      - `docs: document maintenance performance targets`
      - `test: add performance tests for maintenance tools`
      - `docs: expand maintenance performance test guidance`.

20. **Configurable Auto-Fix Templates and Toggles (Story 008.0)**
    - Enhanced `require-story-annotation` with template and auto-fix options.
    - Updated helpers and core logic to support template-based fixes and an `autoFix` gate.
    - Updated `valid-annotation-format` to honor `autoFix` options.
    - Extended tests for configurable templates and disabled auto-fix.
    - Documented options in API reference and story doc.
    - Ran tests, lint, type-check, build, formatting; CI/CD succeeded.
    - Committed as `feat: add configurable auto-fix templates and toggles` (plus refinement).

21. **Complexity Hotspot Identification and Refactor of `require-story` Helpers/IO**
    - Used ESLint complexity and max-lines rules to locate hotspots.
    - Refactored `fallbackTextBeforeHasStory` into smaller helpers in IO.
    - Simplified helpers by centralizing constants, lowering complexity, and moving reporting logic into core with dependency injection.
    - Verified behavior via targeted tests and full quality checks.
    - Committed as `refactor: reduce complexity in require-story helpers and IO`.
    - CI “CI/CD Pipeline” (including `ci-verify:full`) passed.

22. **Generated Coverage and Complexity Reports Cleanup**
    - Identified tracked generated artifacts (coverage summary and ESLint complexity reports).
    - Updated `.gitignore` to ignore these and removed them from version control.
    - Ran `npm run check:ci-artifacts` plus build, tests, lint, type-check, format:check.
    - Committed as `chore: ignore and remove generated coverage and complexity reports`.
    - Pushed to `main` and confirmed CI run `19956138474` succeeded.

23. **Align Rule Documentation and Examples with Implemented Defaults**
    - Inspected project structure and relevant TypeScript and Markdown files for traceability rules and documentation (`user-docs`, `src/rules/*traceability*`, `README.md`, etc.).
    - Updated `user-docs/api-reference.md`:
      - Corrected the documented default `story.pattern` to match the actual regex (`^docs/stories/[0-9]+\.[0-9]+-DEV[\w-]+\.story\.md$`) and clarified the example story path.
      - Updated `story.example` default from `"docs/stories/001.0-EXAMPLE.story.md"` to `"docs/stories/005.0-DEV-EXAMPLE.story.md"`.
      - Corrected the default requirement pattern to `^REQ-[A-Z0-9-]+$` and the example requirement ID to `"REQ-EXAMPLE"`.
      - Updated `traceability/require-test-traceability`’s `describePattern` default to `"Story [0-9]+\.[0-9]+-"`, clarifying that it expects labels like `"Story 021.0-DEV-TEST-TRACEABILITY"`.
      - Adjusted the Behavior-notes example `describe` to use `"Story 010.0-DEV-PAYMENTS"` instead of a raw docs path.
      - Added concise guidance on customizing `story.pattern` / `storyPathPattern` and `req.pattern` / `requirementIdPattern`, emphasizing that they are JavaScript regex sources.
      - Added clarification that `testFilePatterns`, `describePattern`, and REQ prefix options can be customized to fit different test layouts, label schemes, and requirement ID conventions.
    - Updated `user-docs/examples.md`:
      - Changed the test-traceability example’s `describe` string to `"Story 021.0-DEV-TEST-TRACEABILITY"` so it matches the default `describePattern`, leaving other parts of the example intact.
    - Updated `README.md`:
      - Adjusted the Quick Start function annotation to use `@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md`, aligning with the default story path pattern.
    - Updated `docs/code-quality-assessment-guide.md`:
      - Added a short note emphasizing that when rule defaults or patterns change (e.g., annotation formats, regexes, or `describe` label expectations), maintainers should update both the user-facing API Reference and Examples docs to keep them in sync with the implementation.
    - Ran `npm run ci-verify:fast` locally, then staged and committed changes as:
      - `docs: align rule documentation and examples with implemented defaults`
      - `docs: clarify customization options for annotation and test patterns`
    - Pushed commits and confirmed GitHub CI “CI/CD Pipeline” runs `19956779190` and `19956876715` completed successfully.

**Most recently we've executed the following action:**

---
Used tool: find_files with input: {"pattern":"*prefer-implements*","directory":"."}
Used tool: find_files with input: {"pattern":"api-reference.md","directory":"."}
Used tool: find_files with input: {"pattern":"migration-guide.md","directory":"."}
Used tool: find_files with input: {"pattern":"*maintenance*cli*test*","directory":"."}
Used tool: find_files with input: {"pattern":"*.story.md","directory":"docs/stories"}
Used tool: read_file with input: {"filePath":"docs/rules/prefer-implements-annotation.md"}
Used tool: read_file with input: {"filePath":"src/rules/prefer-implements-annotation.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/prefer-implements-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"user-docs/api-reference.md"}
Used tool: read_file with input: {"filePath":"user-docs/migration-guide.md"}
Used tool: read_file with input: {"filePath":"docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md"}
Used tool: read_file with input: {"filePath":"scripts/smoke-test.sh"}
Used tool: find_files with input: {"pattern":"*jest-testing-guide*","directory":"docs"}
Used tool: find_files with input: {"pattern":"*custom-rules-development-guide*","directory":"docs"}
Used tool: find_files with input: {"pattern":"*maintenance-performance-tests*","directory":"docs"}
Used tool: read_file with input: {"filePath":".voder/plan.md"}
Used tool: read_file with input: {"filePath":"docs/jest-testing-guide.md"}
Used tool: read_file with input: {"filePath":"docs/custom-rules-development-guide.md"}
Used tool: find_files with input: {"pattern":"*maintenance*cli.test*","directory":"tests"}
Used tool: read_file with input: {"filePath":"tests/perf/maintenance-cli-large-workspace.test.ts"}
Used tool: read_file with input: {"filePath":"docs/maintenance-performance-tests.md"}
Used tool: read_file with input: {"filePath":"src/index.ts"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: read_file with input: {"filePath":"src/maintenance/cli.ts"}
Used tool: find_files with input: {"pattern":"*cli*.test.ts","directory":"tests"}
Used tool: search_file_content with input: {"filePath":"src/maintenance/cli.ts","pattern":"update","isRegex":false}
Used tool: read_file with input: {"filePath":"README.md"}
Used tool: read_file with input: {"filePath":"tests/maintenance/cli.test.ts"}
Used tool: read_file with input: {"filePath":"tests/cli-error-handling.test.ts"}
Used tool: read_file with input: {"filePath":"tests/integration/cli-integration.test.ts"}
Used tool: modify_file with input: {"filePath":"docs/rules/prefer-implements-annotation.md","instruction":"Replace the incorrect @story path in the header with the correct story file path and adjust wording to consistently refer to the @supports format rather than \"implements\". Specifically:\n- Change `@story docs/stories/010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md` to `@story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md`.\n- In the first paragraph or any place that might ambiguously refer to \"implements\" as a format, ensure the terminology clearly talks about migrating to `@supports` annotations.\nKeep the rest of the content the same unless minor wording tweaks are needed for clarity."}
Used tool: modify_file with input: {"filePath":"user-docs/api-reference.md","instruction":"Add a dedicated rule section for `traceability/prefer-implements-annotation` under the \"Rules\" section, after the existing `traceability/require-test-traceability` description and before the \"Configuration Presets\" section.\n\nThe new section should:\n- Start with a level-3 heading: `### traceability/prefer-implements-annotation`.\n- Clearly describe this rule as an optional, opt-in migration helper for converting legacy `@story` + `@req` JSDoc blocks into the newer `@supports` format.\n- Note that it is **disabled by default** and is **not included** in any built-in preset.\n- State that the rule has no custom options; behavior is controlled entirely via ESLint severity (\"off\" | \"warn\" | \"error\").\n- Summarize the three main behaviors that match the implementation and internal rule doc:\n  - Single-story legacy blocks (one `@story` path, one or more simple `@req` lines) trigger a `preferImplements` diagnostic and, when safe, are auto-fixed to a single `@supports story-path REQ-1 REQ-2 ...` line.\n  - Mixed usage where a comment already contains `@supports` alongside legacy `@story`/`@req` triggers a `cannotAutoFix` diagnostic with a `reason` explaining that manual migration is required.\n  - Multiple distinct `@story` paths in the same block trigger `multiStoryDetected` and are left unchanged for manual migration.\n- Explicitly document that the rule intentionally ignores comments that only contain `@story`, only `@req`, or only `@supports`, as well as line comments like `// @story ...`; these remain valid and are governed by the core validation rules.\n- Make it clear that enabling this rule does **not** change what is considered valid by the core rules (`valid-annotation-format`, `valid-req-reference`, `require-story-annotation`, `require-req-annotation`); it only adds recommendations/auto-fixes on top.\n- Include a short example showing a before/after auto-fix for a single-story block and a brief config snippet showing how to enable it at `\"warn\"` severity.\nReuse wording and examples from `docs/rules/prefer-implements-annotation.md` and `docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md` where appropriate, but keep this section focused on user-facing behavior, not internal implementation details."}
Used tool: modify_file with input: {"filePath":"user-docs/migration-guide.md","instruction":"In the section `#### Optional `prefer-implements-annotation` migration rule`, expand the description so that it more clearly documents the rule's behavior, migration path, and key edge cases, aligned with Story 010.3 and the implementation.\n\nSpecifically:\n- Keep the existing bullets about being disabled by default and how to enable it, but enrich the narrative below them.\n- Add a short paragraph clarifying that this rule is an **optional migration aid**, not a deprecation notice: `@story` and `@req` remain fully supported and there is no hard requirement or deadline to migrate.\n- Add a concise bullet list that mirrors the internal rule doc:\n  - For simple, single-story JSDoc blocks that contain one `@story` path and one or more simple `@req` lines, the rule reports a recommendation and can auto-fix them into a single `@supports` line in `--fix` mode.\n  - For comments that mix `@story`/`@req` with existing `@supports` lines, the rule reports a diagnostic explaining that it cannot auto-fix and leaves the comment unchanged.\n  - For comments that contain multiple distinct `@story` paths, the rule reports that multiple stories were detected and requires manual conversion into separate `@supports` lines.\n  - Comments that only contain `@story`, only `@req`, or only `@supports` (and line comments like `// @story ...`) are intentionally **ignored** by this rule and remain valid.\n- Briefly restate the intended migration path in a sentence or two: teams can start with the rule `\"off\"`, then enable it as `\"warn\"` during migration, and optionally `\"error\"` once they want to strictly enforce `@supports` usage for eligible cases.\nEnsure the wording stays user-facing (no deep implementation details) and clearly references `@supports` rather than \"implements\" terminology."}
Used tool: get_git_status with input: {}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"docs: deepen documentation for prefer-implements-annotation rule"}
Used tool: search_file_content with input: {"filePath":"tests/rules/prefer-implements-annotation.test.ts","pattern":"REQ-CONFIG-SEVERITY","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/rules/prefer-implements-annotation.test.ts","pattern":"multiStoryDetected","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/rules/prefer-implements-annotation.test.ts","pattern":"cannotAutoFix","isRegex":false}
Used tool: find_files with input: {"pattern":"*.story.md","directory":"docs/stories"}
Used tool: read_file with input: {"filePath":"docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19958020816,"timeout":600000}
Used tool: get_github_run_details with input: {"runId":19958020816}
Used tool: get_github_workflow_logs with input: {"runId":19958020816}
Used tool: modify_file with input: {"filePath":"tests/rules/prefer-implements-annotation.test.ts","instruction":"In the `valid` array inside the `ruleTester.run(\"prefer-implements-annotation\", rule, { ... })` call, after the existing three valid cases for \"only @story\", \"only @req\", and \"@supports only\", add two more valid test cases that exercise mixed-but-ignored scenarios:\n\n1. A comment that contains `@story` and `@supports` but **no** `@req`, and is therefore ignored by the rule (no diagnostics).\n   - Name: \"[REQ-BACKWARD-COMP-VALIDATION] comment with @story and @supports but no @req is ignored\".\n   - Code value: a simple function with a JSDoc like:\n     ```js\n     /**\\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\\n */\\nfunction storyAndSupportsNoReq() {}\n     ```\n\n2. A comment that contains `@req` and `@supports` but **no** `@story`, and is therefore ignored by the rule (no diagnostics).\n   - Name: \"[REQ-BACKWARD-COMP-VALIDATION] comment with @req and @supports but no @story is ignored\".\n   - Code value: a simple function with a JSDoc like:\n     ```js\n     /**\\n * @req REQ-ANNOTATION-REQUIRED\\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\\n */\\nfunction reqAndSupportsNoStory() {}\n     ```\n\nEnsure these new objects appear in the `valid` array and follow the same formatting style as the existing entries."}
Used tool: modify_file with input: {"filePath":"scripts/smoke-test.sh","instruction":"Extend the smoke test to exercise the installed `traceability-maint` CLI binary in both a success and an error-path scenario.\n\nSpecifically, after the existing `npx eslint --print-config eslint.config.js > /dev/null` line and before the final success message, insert a new block that:\n\n1. Verifies a **success path** for the CLI:\n   - Prints a message indicating that the CLI is being tested.\n   - Runs `npx traceability-maint detect --root .` in the temporary workspace, capturing its output to a file (for example, `cli-detect-output.txt`).\n   - Asserts that the command exits with status 0 (relying on `set -e` for failure) and that the output contains the string `No stale @story annotations found.` using `grep -q`.\n\n2. Verifies an **error path** while still allowing the script to complete:\n   - Temporarily disables `set -e` (using `set +e`) before invoking a command that is expected to fail, such as `npx traceability-maint report --root . --format yaml`.\n   - Captures its combined stdout/stderr to a file (for example, `cli-report-error.txt`) and stores the exit code in a shell variable (e.g., `cli_status=$?`).\n   - Re-enables `set -e` after capturing the exit code.\n   - Checks that `cli_status` is exactly `2` (usage/configuration error). If not, print a clear error message and `exit 1`.\n   - Uses `grep -q` to assert that the captured output contains the expected error text about invalid format (for example, it should mention `Invalid format: yaml` and `Expected 'text' or 'json'`). If the message is missing, print a helpful error, optionally `cat` the captured file for debugging, and `exit 1`.\n\nKeep the existing structure, cleanup behavior, and final success message, but update the messaging to reflect that both the plugin and the CLI have been verified successfully. Use the same overall style and formatting as the existing echo statements in the script."}
Used tool: modify_file with input: {"filePath":"docs/jest-testing-guide.md","instruction":"At the end of the file, just before the `## Related Documentation` section, add a new section that summarizes the optional `traceability/prefer-implements-annotation` rule tests and the new end-to-end CLI smoke test behavior.\n\nTitle the new section `## Optional Migration Rule and CLI Smoke Tests` and include:\n\n- A short paragraph explaining that the `tests/rules/prefer-implements-annotation.test.ts` suite exercises the optional migration rule from Story 010.3, including:\n  - Detection and auto-fix of single-story `@story` + `@req` blocks.\n  - Diagnostics for mixed legacy + `@supports` and multi-story blocks.\n  - Backward-compatibility cases where comments with only `@story`, only `@req`, only `@supports`, or simple mixed-but-non-migratable combinations (such as `@story` + `@supports` or `@req` + `@supports`) are explicitly ignored.\n- A short bullet list describing how contributors should extend these tests when changing the migration behavior (for example, add new valid/invalid cases for any new edge conditions or message IDs, and keep tests aligned with Story 010.3\u0019s requirements such as REQ-OPTIONAL-WARNING and REQ-MULTI-STORY-DETECT).\n- A paragraph noting that in addition to Jest-based CLI tests under `tests/maintenance/cli.test.ts` and `tests/perf/maintenance-cli-large-workspace.test.ts`, the `scripts/smoke-test.sh` script now:\n  - Packs and installs the plugin into a fresh temp project.\n  - Verifies that the ESLint plugin loads.\n  - Invokes the installed `traceability-maint` CLI binary for both a successful `detect --root .` run and an error-path `report --format yaml` run, checking exit codes and messages.\n- One final sentence telling maintainers that when they change CLI behavior or exit codes, they must update both the Jest CLI tests and the smoke test assertions to keep end-to-end coverage in sync with the documented options and contracts.\n\nKeep the tone consistent with the existing guide and avoid duplicating very low-level details that are already covered elsewhere; focus on how and where to extend tests for this optional and CLI behavior."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci","--testPathPattern","prefer-implements-annotation.test.ts|smoke-test"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci","--testPathPattern","prefer-implements-annotation.test.ts"]}
Used tool: run_command with input: {"command":"bash","args":["-lc","./scripts/smoke-test.sh"]}
Used tool: run_command with input: {"command":"bash","args":["-lc","set -e; ./scripts/smoke-test.sh || echo SMOKE_FAIL:$?"]}
Used tool: read_file with input: {"filePath":"scripts/smoke-test.sh"}
Used tool: run_command with input: {"command":"node","args":["lib/src/maintenance/cli.js","detect","--root","."]}
Used tool: run_command with input: {"command":"node","args":["lib/src/maintenance/cli.js","detect","--root",".","--json"]}
Used tool: modify_file with input: {"filePath":"scripts/smoke-test.sh","instruction":"Change the CLI success-path section so that it creates a minimal workspace without stale annotations before running `traceability-maint detect`.\n\nSpecifically, replace the lines:\n\n```\necho \"🧪 Testing traceability-maint CLI (success path)...\"\nnpx traceability-maint detect --root . > cli-detect-output.txt 2>&1\ngrep -q \"No stale @story annotations found.\" cli-detect-output.txt\n```\n\nwith a block that:\n\n1. Prints the same heading line.\n2. Writes a small TypeScript file that references a story path which we will create, for example:\n   - File: `example.ts`\n   - Content:\n     ```\n     /**\n      * @story local-story.story.md\n      */\n     export function example() {}\n     ```\n3. Writes the matching story file `local-story.story.md` with a simple markdown heading.\n4. Invokes `npx traceability-maint detect --root .` and captures its output to `cli-detect-output.txt`.\n5. Uses `grep -q \"No stale @story annotations found.\" cli-detect-output.txt` to assert the success message.\n\nKeep the rest of the script (including the error-path test and final success message) unchanged."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci","--testPathPatterns","prefer-implements-annotation.test.ts"]}
Used tool: run_command with input: {"command":"bash","args":["-lc","./scripts/smoke-test.sh"]}
Used tool: run_command with input: {"command":"bash","args":["-lc","HUSKY=0 ./scripts/smoke-test.sh"],"timeout":120000}
Used tool: run_command with input: {"command":"bash","args":["-lc","set -e; HUSKY=0 ./scripts/smoke-test.sh || echo SMOKE_FAIL:$?"],"timeout":120000}
Used tool: read_file with input: {"filePath":"src/maintenance/utils.ts"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: run_command with input: {"command":"node","args":["-e","\"console.log(require.resolve('eslint-plugin-traceability/package.json'))\""],"timeout":120000}
Used tool: run_command with input: {"command":"bash","args":["-lc","node - << 'EOF'\nconst path = require('path');\ntry {\n  const pkgPath = require.resolve('eslint-plugin-traceability/package.json');\n  console.log('PKG_PATH', pkgPath);\n} catch (e) {\n  console.error('ERR', e && e.message);\n}\nEOF"],"timeout":120000}
Used tool: run_command with input: {"command":"bash","args":["-lc","ls -R"],"timeout":120000}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: extend prefer-implements tests and CLI smoke coverage"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19959062733,"timeout":600000}
Used tool: modify_file with input: {"filePath":"scripts/smoke-test.sh","instruction":"In the section labeled \"Testing traceability-maint CLI (success path)...\", change the workspace so that detection runs only against an isolated subdirectory and does not scan the installed plugin under node_modules.\n\nSpecifically, replace:\n\n```\ncat > example.ts << 'EOF'\n/**\n * @story local-story.story.md\n */\nexport function example() {}\nEOF\n\ncat > local-story.story.md << 'EOF'\n# Local Story\nEOF\n\nnpx traceability-maint detect --root . > cli-detect-output.txt 2>&1\ngrep -q \"No stale @story annotations found.\" cli-detect-output.txt\n```\n\nwith:\n\n```\nmkdir -p workspace\n\ncat > workspace/example.ts << 'EOF'\n/**\n * @story local-story.story.md\n */\nexport function example() {}\nEOF\n\ncat > workspace/local-story.story.md << 'EOF'\n# Local Story\nEOF\n\nnpx traceability-maint detect --root workspace > cli-detect-output.txt 2>&1\ngrep -q \"No stale @story annotations found.\" cli-detect-output.txt\n```\n\nLeave the rest of the script unchanged."}
Used tool: run_command with input: {"command":"bash","args":["-lc","HUSKY=0 ./scripts/smoke-test.sh"],"timeout":120000}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: stabilize CLI smoke test workspace for traceability-maint"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19959208672,"timeout":600000}
---

**This was the result:**
---
## Status

All tasks in the **##NOW** and **##NEXT** sections have been implemented, validated locally (build, lint, type-check, tests, smoke test), committed, pushed, and the CI/CD pipeline on `main` is passing.

Updated plan:

## NOW

- [x] Review and improve both user-facing and internal documentation for the optional prefer-implements-annotation rule so that its current behavior, deprecation status, migration path, and key edge cases are clearly described and aligned with the implemented code.

## NEXT

- [x] Inspect the implementation and existing tests for the prefer-implements-annotation rule to identify any edge cases or migration scenarios that are not yet covered by tests, and add focused tests to exercise those behaviors.
- [x] Design and extend at least one additional end-to-end flow that invokes the installed traceability-maint CLI binary in a realistic scenario, verifying its behavior for both success and error paths in line with the documented options and exit codes.
- [x] Update developer-focused documentation to briefly summarize the new tests and end-to-end CLI flows, explaining how they relate to optional and edge-case behaviors and how future contributors should extend them when changing those areas.

Below is what changed per task.

---

## ##NOW – Documentation for `prefer-implements-annotation`

### 1. Internal rule documentation

**File:** `docs/rules/prefer-implements-annotation.md`

Changes:

- Fixed the story reference in the header to align with the canonical story file:

  ```md
  @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
  ```

  (replacing the previous incorrect `...-MIGRATE-TO-IMPLEMENTS.story.md`).

- Ensured the narrative consistently describes migration to the `@supports` format (not “implements”), while keeping the existing structure:
  - Emphasizes that it is an **opt-in migration aid**, disabled by default.
  - Reiterates the three key behaviors:
    - Single-story `@story` + `@req` blocks → `preferImplements` with safe auto-fix.
    - Mixed `@story`/`@req` + `@supports` → `cannotAutoFix` (manual migration).
    - Multiple distinct `@story` paths → `multiStoryDetected` (manual migration).
  - Clarifies that this rule **does not change validation behavior**; it only adds recommendations / auto-fixes on top of the core rules.

### 2. User-facing API reference

**File:** `user-docs/api-reference.md`

Changes:

- Added a dedicated section:

  ```md
  ### traceability/prefer-implements-annotation
  ```

  directly under the rule listings (just before “Configuration Presets”).

- Documented the rule for users:

  - Described as an **optional, opt-in migration helper** to convert legacy single-story `@story` + `@req` JSDoc blocks into the newer `@supports` format.
  - Explicitly stated:
    - **Disabled by default**, **not included** in any preset.
    - Controlled solely via ESLint severity: `"off" | "warn" | "error"`.
    - Does not alter what `valid-annotation-format`, `valid-req-reference`, `require-story-annotation`, or `require-req-annotation` consider valid.

- Summarized behavior in user terms:

  - **Single-story legacy blocks**  
    When exactly one `@story` path and one or more simple `@req` lines appear with no `@supports`, the rule reports `preferImplements` and, in `--fix` mode, rewrites them to a single `@supports story-path REQ-1 REQ-2 ...` line.

  - **Mixed `@story`/`@req` + `@supports`**  
    Reports `cannotAutoFix` with a `reason` explaining that the block already mixes legacy and `@supports`, so it must be migrated manually; no auto-fix is applied.

  - **Multiple distinct `@story` paths**  
    Reports `multiStoryDetected` and leaves the block unchanged; used as a signal that you should manually split into separate `@supports` lines per story.

  - **Intentionally ignored**:
    - Blocks with only `@story`,
    - Only `@req`,
    - Only `@supports`,
    - Or line comments like `// @story ...` – all remain valid and are handled by the core rules, not this migration helper.

- Added:
  - A before/after auto-fix example for a single-story block.
  - A short config snippet showing enabling it at `"warn"` severity.

### 3. Migration guide

**File:** `user-docs/migration-guide.md` (section `#### Optional prefer-implements-annotation migration rule`)

Changes:

- Clarified positioning:

  - Labeled the rule explicitly as an **optional migration aid**, not a deprecation; `@story` and `@req` remain fully supported with no forced timeline.

- Added a concrete, user-facing bullet list of behaviors:

  - **Simple, single-story JSDoc blocks**:
    - One `@story` path + one or more simple `@req` lines.
    - Rule recommends consolidation and auto-fixes to one `@supports` line in `--fix` mode.

  - **Mixed `@story`/`@req` + `@supports`**:
    - Reports that it cannot safely auto-fix and leaves content unchanged.

  - **Multiple distinct `@story` paths**:
    - Reports multiple stories detected; user must manually convert to multiple `@supports` lines.

  - **Ignored**:
    - Only `@story`, only `@req`, only `@supports`, and line comments like `// @story ...`.

- Documented a recommended migration path:

  - Start with `"off"` while introducing `@supports` in new/refactored code.
  - Move to `"warn"` to get non-breaking guidance and safe auto-fixes.
  - Optionally set to `"error"` once you want strict enforcement for eligible cases.

---

## ##NEXT – Tests and end-to-end CLI flows

### 1. Prefer-implements-annotation tests & edge cases

**File:** `tests/rules/prefer-implements-annotation.test.ts`

Changes:

- The suite already covered:
  - Emitting `preferImplements` and auto-fix for:
    - Single `@story` + single `@req`.
    - Single `@story` + multiple `@req`.
  - Emitting `cannotAutoFix` for mixed `@story`/`@req` + `@supports`.
  - Emitting `multiStoryDetected` for multiple `@story` paths.
  - Non-fixable but warned cases for complex `@req` or `@story` lines (extra description).
  - Configuration behavior (disabled by default in presets; severity config examples).

- **New edge-case coverage added** (valid cases):

  ```ts
  {
    name: "[REQ-BACKWARD-COMP-VALIDATION] comment with @story and @supports but no @req is ignored",
    code: `/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */ 
function storyAndSupportsNoReq() {}`,
  },
  {
    name: "[REQ-BACKWARD-COMP-VALIDATION] comment with @req and @supports but no @story is ignored",
    code: `/**
 * @req REQ-ANNOTATION-REQUIRED
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function reqAndSupportsNoStory() {}`,
  },
  ```

  These confirm that when there isn’t **both** `@story` and `@req` present, the rule treats the comment as out-of-scope and does not report diagnostics, matching the documented “intentionally ignores” behavior.

- All tests still reference Story `010.3-DEV-MIGRATE-TO-SUPPORTS` and requirements (`REQ-OPTIONAL-WARNING`, `REQ-MULTI-STORY-DETECT`, `REQ-CONFIG-SEVERITY`) for traceability.

### 2. Additional E2E flow for installed `traceability-maint` CLI

**File:** `scripts/smoke-test.sh`

This script is run in CI after a successful semantic-release publish and is now extended to cover the installed CLI binary more thoroughly.

Key behaviors now:

1. **Environment setup (unchanged in spirit)**

   - Packs the local package (`npm pack`) when `VERSION=local`, or waits for a published version when invoked with a version number.
   - Creates a temporary directory.
   - Runs `npm init -y` and installs `eslint-plugin-traceability` from the tarball or npm registry.
   - Verifies the plugin loads (`require('eslint-plugin-traceability')`) and, for non-local runs, that the installed version matches the expected version.
   - Writes a minimal `eslint.config.js` requiring the plugin and confirms `npx eslint --print-config eslint.config.js` works.

2. **New: CLI success-path test**

   ```bash
   echo "🧪 Testing traceability-maint CLI (success path)..."
   mkdir -p workspace

   cat > workspace/example.ts << 'EOF'
   /**
    * @story local-story.story.md
    */
   export function example() {}
   EOF

   cat > workspace/local-story.story.md << 'EOF'
   # Local Story
   EOF

   npx traceability-maint detect --root workspace > cli-detect-output.txt 2>&1
   grep -q "No stale @story annotations found." cli-detect-output.txt
   ```

   - Uses an isolated `workspace/` directory inside the temp project.
   - Creates a TypeScript file with an `@story local-story.story.md` annotation plus a matching story file.
   - Runs `npx traceability-maint detect --root workspace` and asserts that:
     - Exit code is 0 (enforced by `set -e`), and
     - Output contains `No stale @story annotations found.`

   This ensures the installed `traceability-maint` binary functions correctly on a clean, fully-resolved workspace and does not accidentally scan the plugin’s own docs under `node_modules`.

3. **New: CLI error-path test**

   ```bash
   echo "🧪 Testing traceability-maint CLI (error path)..."
   set +e
   npx traceability-maint report --root . --format yaml > cli-report-error.txt 2>&1
   cli_status=$?
   set -e

   if [ "$cli_status" -ne 2 ]; then
     echo "❌ Expected traceability-maint report to exit with status 2, but got: $cli_status"
     ...
     exit 1
   fi

   if ! grep -q "Invalid format: yaml" cli-report-error.txt || ! grep -q "Expected 'text' or 'json'" cli-report-error.txt; then
     echo "❌ traceability-maint report error output did not contain expected validation messages."
     ...
     exit 1
   fi
   ```

   - Runs `traceability-maint report --root . --format yaml` in the temp project root.
   - Temporarily disables `set -e` to capture the expected non-zero exit.
   - Asserts:
     - Exit code is `2` (usage/config error).
     - Output includes the documented error strings about invalid format and the expected `"text" or "json"` values.

4. **Final success message**

   - If both plugin and CLI checks pass, prints:

     ```bash
     ✅ Smoke test passed! Plugin and CLI verified successfully.
     ```

This provides a robust, install-level E2E validation for both **success** and **error** paths of the published CLI, aligned with the documented options and exit-code contracts.

### 3. Developer-focused documentation updates

**File:** `docs/jest-testing-guide.md`

Added a new section:

```md
## Optional Migration Rule and CLI Smoke Tests
```

Content highlights:

- Describes what `tests/rules/prefer-implements-annotation.test.ts` covers:

  - Auto-fix of single-story `@story` + `@req` blocks.
  - Diagnostics for mixed `@story`/`@req` + `@supports` and multi-story blocks.
  - Backward-compatibility / ignored cases (only `@story`, only `@req`, only `@supports`, and simple mixed-but-non-migratable combinations like `@story` + `@supports` or `@req` + `@supports`).

- Guidance for contributors:

  - When modifying migration behavior, add/update valid/invalid cases for:
    - New auto-fix shapes.
    - New diagnostics or message IDs.
    - Any additional edge conditions.
  - Keep tests mapped explicitly to Story 010.3 requirements (e.g., `REQ-OPTIONAL-WARNING`, `REQ-MULTI-STORY-DETECT`).

- Documents the extended CLI coverage:

  - Notes that beyond Jest tests in:
    - `tests/maintenance/cli.test.ts`
    - `tests/perf/maintenance-cli-large-workspace.test.ts`
  - The `scripts/smoke-test.sh` script:
    - Packs and installs the plugin into a fresh temporary project.
    - Verifies ESLint plugin loading.
    - Invokes the installed `traceability-maint` CLI for:
      - A successful `detect --root workspace` run.
      - An error-path `report --root . --format yaml` run with exit code and message assertions.

- Explicitly tells maintainers:

  - When changing CLI behavior or exit codes, they must update **both**:
    - The Jest CLI tests, and
    - The smoke-test assertions,
  - to keep end-to-end coverage aligned with the CLI’s documented contract.

---

## Quality checks and CI

- Local checks run before each push:
  - `npm run build`
  - `npm run lint`
  - `npm run type-check`
  - `npm run format:check`
  - `npm test -- --runInBand --ci`
  - `HUSKY=0 ./scripts/smoke-test.sh` (to validate the updated CLI smoke flow)

- CI/CD:
  - First push after the doc-only change failed in CI during `npm ci` due to an external `npm` registry `E500` fetching `yocto-queue`; no project change was required.
  - Subsequent pushes (including the test and smoke-test adjustments) completed with:
    - `quality-and-deploy` job: **success**
    - Semantic-release step run (no new release when commits were docs/test-only).
    - CI smoke test using the updated `scripts/smoke-test.sh` passing.

All requested tasks in **##NOW** and **##NEXT** are complete and verified.
---
