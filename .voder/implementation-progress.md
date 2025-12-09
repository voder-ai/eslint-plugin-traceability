# Implementation Progress Assessment

**Generated:** 2025-12-09T03:27:39.698Z

![Progress Chart](./progress-chart.png)

Projection: flat (no recent upward trend)

## IMPLEMENTATION STATUS: INCOMPLETE (93% ± 18% COMPLETE)

## OVERALL ASSESSMENT
Support areas for this project are generally strong (all but one above their required thresholds), but overall status is marked INCOMPLETE because CODE_QUALITY is below its 90% requirement. Testing, execution, documentation, dependencies, security, and version control are all excellent, with strict gates enforced locally and in CI/CD, high coverage, and clear traceability. However, a small amount of structural and complexity debt remains in core rule/helper modules (large files, long functions, and some duplication), which must be addressed before feature-level FUNCTIONALITY can be formally assessed. The next step must therefore focus on targeted code-quality improvement rather than new features.

## NEXT PRIORITY
Fix code complexity and size issues in src/rules/no-redundant-annotation.ts lines 150-260 by extracting small, well-named helper functions to simplify the main logic while keeping behavior unchanged.



## CODE_QUALITY ASSESSMENT (82% ± 17% COMPLETE)
- Code quality is high: linting, strict TypeScript, formatting, duplication checks, and tests all pass and are strongly enforced locally and in CI/CD. ESLint flat config has sensible constraints (complexity, function/file size, magic numbers, params), pre-commit/pre-push hooks are well set up, and there are no broad suppressions or AI-style slop. The main remaining debt is a small set of very large files and long functions in core rule/helper modules (and some large test suites), plus minor duplication in a few helpers.
- All core quality tools pass on the current codebase:
- `npm run lint` (ESLint with flat config and `--max-warnings=0`) passes.
- `npm run type-check` (tsc, strict mode, src+tests) passes.
- `npm run format:check` (Prettier) passes.
- `npm run duplication` (jscpd with strict 3% threshold) passes with ~2.48% duplicated lines.
- `npm test` (Jest) passes: 53 suites, 428 tests.
This establishes a strong baseline of working, validated code.
- ESLint configuration is modern and robust:
- Flat config (`eslint.config.js`) based on `@eslint/js` recommended.
- For TS/JS production code: `complexity: ["error", { max: 18 }]`, `max-lines-per-function: ["error", { max: 55 }]`, `max-lines: ["error", { max: 450 }]`, `no-magic-numbers`, `max-params: ["error", { max: 4 }]`, plus `no-eval`, `no-implied-eval`, `no-new-func`, `no-new-wrappers`.
- Test files intentionally relax complexity/length/magic-number/params rules.
- Build output, node_modules, coverage, docs, and markdown files are ignored appropriately.
- TypeScript configuration and coverage are strong:
- `tsconfig.json` uses `"strict": true`, `forceConsistentCasingInFileNames`, and includes `src` and `tests`.
- Type roots include `node`, `jest`, `eslint`, `@typescript-eslint/utils`.
- `npm run type-check` (tsc --noEmit) passes, so both production and test code are type-safe under strict mode.
- Formatting and style are consistently enforced:
- Prettier configured via `.prettierrc`; `npm run format`/`format:check` wrap it.
- `lint-staged` runs `prettier --write` and `eslint --fix` on staged `src` and `tests` files.
- Pre-commit hook (`.husky/pre-commit`) runs `npx lint-staged`, making formatting and linting automatic and fast on each commit.
- Local hooks and CI/CD pipeline enforce quality rigorously:
- `.husky/pre-commit` runs `lint-staged` (fast, formatted+linted staged changes).
- `.husky/pre-push` runs `npm run ci-verify:full` and `npm run security:secrets`, mirroring CI’s full verification.
- `.github/workflows/ci-cd.yml` runs on every push to `main` and pull requests, across a Node version matrix:
  - `npm ci`, then `npm run ci-verify:full` (build, type-check, lint, tests, duplication, audits, formatting) and `npm run security:secrets`.
  - Artifacts (dry-aged-deps, npm audit, traceability report, jest artifacts) are uploaded.
  - `semantic-release` runs automatically on successful pushes to `main` (Node 22.14.0 job) and optionally smoke-tests the published package.
This gives a true continuous-deployment style quality gate.
- Complexity and maintainability rules are already relatively strict, with room to ratchet further:
- ESLint config enforces `complexity: max 18` on src.
- Probe run `npm run lint -- --rule complexity:["error",{"max":17}]` still passed, proving all functions are currently at or below complexity 17.
- Function and file size rules are present and active on production code, showing intentional control over growth, with tests explicitly exempted where appropriate.
- Main technical debt: a handful of oversized production files and long functions:
- With `max-lines:["error",{"max":449}]`, the following exceed file-length thresholds:
  - `src/rules/helpers/require-story-helpers.ts` (~526 lines).
  - `src/rules/helpers/valid-annotation-options.ts` (~536 lines).
  - `src/rules/helpers/valid-req-reference-helpers.ts` (~452 lines).
  - `src/rules/prefer-implements-annotation.ts` (~639 lines).
  - `src/utils/branch-annotation-helpers.ts` (~548 lines).
  - Large test files: `tests/rules/valid-annotation-format.test.ts` (~692 lines), `tests/rules/valid-story-reference.test.ts` (~488 lines), `tests/utils/req-annotation-detection.test.ts` (~453 lines).
- With `max-lines-per-function:["error",{"max":54}]`, these production functions exceed the limit:
  - `src/rules/no-redundant-annotation.ts`: `getScopePairs` (66 lines), `getRedundantStatementContext` (59 lines).
  - `src/rules/prefer-implements-annotation.ts`: `handleInlineStorySequence` (60 lines).
  - `src/rules/require-req-annotation.ts`: `create` method (65 lines).
  - `src/rules/valid-annotation-format.ts`: `processCommentLine` (80 lines).
  - `src/rules/valid-story-reference.ts`: `processStoryPath` (59 lines).
  - `src/utils/annotation-scope-analyzer.ts`: `getCommentRemovalRange` (56 lines).
  - `src/utils/branch-annotation-helpers.ts`: `validateBranchTypes` (56 lines).
These constitute the main maintainability hotspots and justify a modest score penalty.
- Duplication is low overall, with most clones in tests and a few in helpers:
- jscpd summary: 97 TypeScript files, 17,175 lines, 103,361 tokens; 426 duplicated lines (2.48%), 3,891 tokens (3.76%).
- Detected clones are primarily in:
  - Various test suites (integration/perf/maintenance rules), where scenarios are naturally similar.
  - A few src helpers, e.g. repeated blocks in `src/rules/helpers/require-story-visitors.ts`, `src/rules/no-redundant-annotation.ts`, and `src/utils/branch-annotation-helpers.ts`.
- No individual file shows extreme (>20–30%) duplication; the debt is mild and localized.
- Disabled checks and suppressions are minimal and justified:
- No `@ts-nocheck` or `@ts-ignore` found in `src` or `tests`.
- No file-wide `/* eslint-disable */` or similar suppressions were found; `grep -R -n eslint-disable .` revealed only incidental content (e.g. history logs).
- ESLint rules are selectively disabled only in the test configuration (complexity, max-lines, magic numbers, max-params), not via inline annotations.
This indicates quality rules are not being bypassed to hide problems.
- Scripts and dev tooling follow a clean contract-centralization pattern:
- All helper scripts in `scripts/` directory are referenced from `package.json` scripts (e.g., `traceability-check.js` → `check:traceability`, `generate-dev-deps-audit.js` → `audit:dev-high`, `smoke-test.sh` → `smoke-test`, `validate-scripts-nonempty.js` → `check:scripts`).
- There are no orphaned `.sh` or `.js` dev scripts; `scripts/validate-scripts-nonempty.js` itself is run in CI to detect non-empty script definitions.
- Quality tools are always invoked via npm scripts (lint, test, build, format, duplication, audits, secret scan), avoiding configuration drift.
- Error handling and debug behavior are consistent and non-silent:
- `eslint.config.js` plugin loader tries `./src/index.js` then `./lib/src/index.js`; in CI it throws a clear error if neither exists, while in local dev it logs a warning and proceeds without the plugin.
- Rule and utility code uses `TRACEABILITY_DEBUG` env flag to gate detailed logging (`console.log`/`console.error`), avoiding noise in normal operation.
- Catch blocks either log useful context when debug is enabled or allow errors to surface; there are no broad silent failures.
- There are no AI-slop or temporary artifact issues:
- No `.tmp`, `.patch`, `.diff`, `.rej`, or backup files found.
- Comments and structure are highly domain-specific (traceability, ESLint rules), not generic boilerplate.
- Tests are numerous and meaningful, not trivial “assert true” style tests.
- Repository history and docs (e.g., `.voder/history.md`) show deliberate, incremental quality improvements rather than bulk auto-generated code dumps.

**Next Steps:**
- Ratcheting complexity: the codebase already passes at `complexity: max 17`.
- Update `eslint.config.js` to use `complexity: ["error", { max: 17 }]` for TS/JS.
- Run `npm run lint`, `npm run type-check`, `npm test`, `npm run duplication`, and `npm run format:check`.
- Commit with `chore: reduce complexity threshold to 17` and push, letting CI verify.
- Plan the next step for function-length reduction in production code:
- Keep the rule at 55 for now, but target lowering to 54 once key functions are refactored.
- Start with:
  - `src/rules/no-redundant-annotation.ts`: split `getScopePairs` and `getRedundantStatementContext` into smaller helpers (e.g., separate branch vs function scope handling, separate filtering vs reporting logic).
  - `src/rules/prefer-implements-annotation.ts`: break `handleInlineStorySequence` into focused helpers per annotation pattern.
  - `src/rules/require-req-annotation.ts`: extract configuration parsing and visitor wiring from the `create` method.
  - `src/rules/valid-annotation-format.ts`: split `processCommentLine` into parsing, validation, and error-reporting helpers.
  - `src/rules/valid-story-reference.ts`: factor `processStoryPath` into path normalization, existence checking, and error classification.
  - `src/utils/annotation-scope-analyzer.ts`: separate concerns inside `getCommentRemovalRange` (e.g., computing adjacent whitespace vs deciding range direction).
  - `src/utils/branch-annotation-helpers.ts`: factor `validateBranchTypes` into smaller predicate/validation helpers.
- After refactoring these, lower `max-lines-per-function` to 54 and re-run lint before committing.
- Refactor the largest production files into smaller, focused modules:
- Target first:
  - `src/rules/prefer-implements-annotation.ts` (~639 lines).
  - `src/rules/helpers/valid-annotation-options.ts` (~536 lines).
  - `src/utils/branch-annotation-helpers.ts` (~548 lines).
  - `src/rules/helpers/require-story-helpers.ts` (~526 lines).
- Strategy:
  - Identify logical subdomains (option schema/normalization, branch-type helpers, visitor wiring vs pure utilities) and move them into separate files under `rules/helpers` or `utils`.
  - Keep existing exports stable; use internal helper modules so rule entrypoints remain simple.
  - After each refactor, run the full local quality suite (`npm run ci-verify:full`) to ensure behavior is preserved.
- Gradually tighten file-length thresholds after refactors:
- Once the above modules are broken down and file sizes reduced, lower `max-lines` from 450 to 449 in `eslint.config.js` and confirm lint passes.
- Over subsequent cycles, step down further (e.g., 430 → 400) while only touching the files that newly fail at each step.
- Aim long term for something near 350–400 lines for core rule files, removing the explicit `max` once comfortably within ESLint defaults if desired.
- Optionally improve test maintainability in the largest test suites (no direct impact on score but helpful for long-term health):
- For files like `tests/rules/valid-annotation-format.test.ts`, `tests/rules/valid-story-reference.test.ts`, `tests/utils/req-annotation-detection.test.ts`:
  - Split monolithic `describe` or long arrow functions into multiple describes grouped by scenario or requirement.
  - Extract common setup and expectation patterns into shared helper functions or fixtures.
- Although ESLint function/file length rules are disabled for tests, this will make future changes safer and easier to review.
- Continue to avoid broad suppressions and prefer small, targeted refactors:
- If new lint rules are enabled in the future, follow the documented incremental approach: enable one rule at a time, temporarily suppress violations where necessary, then clean up suppressions in small, focused refactors.
- Maintain the current discipline of not using `@ts-nocheck` or file-wide `eslint-disable` in production code.

## TESTING ASSESSMENT (94% ± 18% COMPLETE)
- Testing is mature and robust: Jest + ts-jest is well-configured, all 53 suites (428 tests) pass, coverage is high with meaningful thresholds, tests use OS temp dirs and clean up correctly, and there is excellent traceability from tests to stories and requirements. Minor issues are limited to one coverage-oriented test file name and some helper logic complexity in performance tests.
- Test framework: Project uses Jest with TypeScript via ts-jest, confirmed in package.json ("test": "jest --ci --bail") and jest.config.js (preset: "ts-jest", testMatch: "<rootDir>/tests/**/*.test.ts"). Decision 002 ADR explicitly selects Jest for ESLint plugin testing, aligning with community best practices.
- Test execution: Running `npm test -- --runInBand` completes successfully with exit code 0, reporting `Test Suites: 53 passed, 53 total` and `Tests: 428 passed, 428 total`. Jest is run with `--ci --bail` (non-interactive), satisfying the requirement that tests not run in watch/interactive mode.
- Coverage: `npm test -- --coverage --runInBand` passes and shows high global coverage (Statements 96.72%, Branches 84.62%, Functions 99.67%, Lines 96.72%), exceeding configured thresholds in jest.config.js (branches 80, functions 90, lines/statements 90). Coverage is enforced and used as a quality gate, not just a metric.
- Isolation and filesystem behavior: Tests that write files (maintenance, CLI, perf tests) do so exclusively in OS temp directories created via `fs.mkdtempSync(path.join(os.tmpdir(), ...))` or via the shared `createTempDir` helper in tests/utils/temp-dir-helpers.ts. All such directories are cleaned up using `fs.rmSync(..., { recursive: true, force: true })` or `temp.cleanup()`. grep of `writeFileSync(` in tests shows only writes under these temp directories, with no modifications to repository-tracked files.
- Working directory changes: CLI and performance tests that change `process.cwd()` (e.g., tests/maintenance/cli.test.ts, tests/perf/maintenance-cli-large-workspace.test.ts) save the original CWD in beforeAll and restore it in afterAll, ensuring environment is reset for subsequent tests and preventing cross-test interference.
- Error handling and edge cases: Multiple suites rigorously test error paths and edge cases: tests/rules/error-reporting.test.ts explicitly verifies error message templates, data, and suggestions for `require-story-annotation`; tests/maintenance/cli.test.ts covers invalid CLI flags, missing arguments, permission errors (simulated by mocking fs.statSync to throw EACCES), non-existent roots, and help-text behavior.
- Performance and determinism: Performance tests in tests/perf/maintenance-large-workspace.test.ts and tests/perf/maintenance-cli-large-workspace.test.ts construct large synthetic workspaces and enforce generous but finite time budgets (< 5000 ms) for detect/verify/report/update and CLI commands. They are fully deterministic (no randomness) and run on OS temp dirs, providing strong evidence that the code remains fast and predictable under load.
- Integration and config tests: tests/config/eslint-config-validation.test.ts uses FlatESLint with the plugin to validate rule schemas, including rejection of unknown options and wrong types. Integration suites under tests/integration (e.g., cli-integration, Prettier-related integration tests) confirm plugin behavior in realistic ESLint + formatter workflows rather than only unit-level logic.
- Test structure and naming: Tests are generally well-structured using an implicit ARRANGE–ACT–ASSERT pattern with clear separation of setup, action, and assertions. Test names are descriptive and behavior-focused (e.g., "[REQ-MAINT-VERIFY] verify exits with code 1 and prints guidance when annotations are stale or invalid"). Each test typically asserts one scenario, and RuleTester `valid`/`invalid` items are named to reflect specific requirements and edge cases.
- Traceability in tests: Test files include JSDoc headers with `@story` and/or `@supports` annotations that reference docs/stories/*.story.md and enumerate requirement IDs. Describe blocks reference stories (e.g., `"Maintenance CLI (Story 009.0-DEV-MAINTENANCE-TOOLS)"`), and test names often begin with requirement IDs in square brackets (e.g., `[REQ-MAINT-DETECT]`). The `require-test-traceability` rule’s own test suite (tests/rules/require-test-traceability.test.ts) verifies enforcement of these conventions, ensuring strong story-to-test traceability.
- Use of test doubles: Jest spies and mocks are used appropriately to isolate behavior (e.g., spying on console.log/error in CLI tests, mocking internal helpers like reqAnnotationDetection in annotation-checker-branches tests). They primarily mock project-owned modules or standard APIs in a controlled way and avoid over-mocking or mocking external libraries directly in a brittle manner.
- Temp helpers and cleanup patterns: tests/utils/temp-dir-helpers.ts centralizes creation/cleanup of temp directories, providing a single, well-documented abstraction used across maintenance/CLI tests. Cleanup functions are safe to call multiple times, and tests wrap assertions in try/finally blocks when necessary, ensuring that resources are cleaned up even if assertions fail.
- Single minor naming issue: tests/utils/annotation-checker-branches.test.ts is explicitly described as "Focused branch coverage tests for annotation-checker helper" and uses "branches" in the file name to refer to coverage branches rather than domain concepts. This conflicts with the rule that test file names should not use branch/branches terminology for coverage. It is a localized naming issue, not a functional or structural flaw.
- Complexity in fixture helpers: Some performance tests (e.g., createLargeWorkspace in tests/perf/maintenance-large-workspace.test.ts) contain loops and stateful counters to generate large synthetic workspaces. While acceptable for perf tests and reasonably documented, this is more logic than ideal in tests themselves; nonetheless, the logic is confined to fixture creation and does not obscure assertions.
- No flaky or order-dependent behavior observed: Tests explicitly manage and restore global state they touch (process.cwd, process.env.NODE_PATH, fs mocks). Running the full suite twice (with and without coverage) produced consistent all-green results, with no indications of ordering assumptions or flakiness in the logs.

**Next Steps:**
- Rename `tests/utils/annotation-checker-branches.test.ts` to a behavior-focused name that avoids coverage terminology, such as `annotation-checker-autofix-placement.test.ts` or `annotation-checker-parent-selection.test.ts`, and update its top-level description comment accordingly so it no longer frames itself as "branch coverage" tests.
- Optionally simplify or annotate workspace-building helper functions in performance tests (e.g., createLargeWorkspace and createCliLargeWorkspace) to make their intent and sizing choices even clearer, and to keep test logic as minimal and obvious as possible while still exercising realistic loads.
- Run the ESLint rule `require-test-traceability` across the entire tests/ directory (using the project’s ESLint config) and fix any residual violations (missing @supports headers, missing story references in describe blocks, or missing [REQ-...] prefixes) to guarantee 100% compliance with the test-traceability conventions project-wide.
- Ensure the Jest testing guide (`docs/jest-testing-guide.md`) explicitly documents `npm test -- --coverage` as the standard way to generate coverage reports, alongside the existing guidance about `--verbose` for traceability review, so contributors know how to reproduce the same coverage checks locally.
- Verify that the existing CI scripts (notably `ci-verify` and `ci-verify:full` along with `scripts/check-no-tracked-ci-artifacts.js`) are indeed executed in the main CI pipeline after `npm test` and that they successfully fail the build if any tracked files are modified or untracked artifacts are left behind, reinforcing the guarantee that tests never dirty the repository.

## EXECUTION ASSESSMENT (95% ± 18% COMPLETE)
- Execution quality is excellent. The ESLint plugin and its maintenance CLI build cleanly, run correctly, and are thoroughly validated via unit, integration, performance, and smoke tests that simulate real-world installation and usage. Local quality gates (build, lint, type-check, formatting, duplication, and traceability checks) all pass without issues.
- Build and type-check succeed cleanly: `npm run build` (tsc) and `npm run type-check` both complete with exit code 0, and the compiled CLI entry `lib/src/maintenance/cli.js` exists as expected.
- The full Jest suite passes: `npm test` runs 53 suites and 428 tests (rules, configs, CLI, integration, perf) with zero failures, demonstrating correct runtime behavior across core plugin and CLI functionality.
- Static quality checks all pass: `npm run lint` (ESLint, max-warnings=0), `npm run format:check` (Prettier), and `npm run duplication` (jscpd) each exit successfully, indicating clean, consistently formatted code with controlled duplication levels.
- Traceability self-check passes: `npm run check:traceability` runs a custom TypeScript-based scanner over `src/` and generates `scripts/traceability-report.md` without errors, confirming required annotations at function/branch level.
- A focused CI-style gate passes locally: `npm run ci-verify:fast` (type-check → traceability check → duplication → Jest over rules & maintenance tests) runs successfully, showing that a combined subset of pipeline checks works end-to-end on a dev machine.
- The `traceability-maint` CLI is robustly implemented and tested: `src/maintenance/cli.ts` includes explicit help, unknown-command handling, and a catch-all error path with clear exit codes, all covered by dedicated tests and integration tests.
- Packaging and real-world usage are validated by `npm run smoke-test`, which packs the module, installs it into a fresh temp project, verifies the plugin loads, runs ESLint with the plugin, and exercises the `traceability-maint` CLI for both success and error paths (including validation of exit codes and error messages).
- Performance and resource management for maintenance tools are validated by `tests/perf/maintenance-large-workspace.test.ts`, which constructs a large synthetic workspace and asserts that detection, verification, reporting, and update operations complete within generous time budgets (<5s) and clean up temporary resources.

**Next Steps:**
- Optionally run the full local CI gate (`npm run ci-verify:full`) before releases to mirror the complete CI/CD pipeline, including coverage, audits, and artifact checks, and confirm there are no environment-specific runtime issues.
- If extremely large repositories ever show performance pressure, consider adding simple in-memory caching of story path existence checks in `detectStaleAnnotations` to further reduce repeated `fs.existsSync` calls.
- Extend the smoke test (if desired) to run ESLint with a small sample file that intentionally violates a traceability rule and assert that the expected error is reported, strengthening end-to-end behavioral guarantees for new consumers.
- Keep the existing test suite and smoke tests up to date as new rules or CLI options are added, ensuring every new user-facing behavior has corresponding runtime validation.

## DOCUMENTATION ASSESSMENT (95% ± 18% COMPLETE)
- User-facing documentation for this ESLint plugin is extensive, accurate, and current. README and user-docs comprehensively cover installation, configuration, rule behavior, the maintenance CLI, migration, and security. Attribution and license requirements are satisfied, links are properly formatted and shipped with the package, and there are no improper references to internal project docs. Only minor wording drift was found (a small mismatch in a rule-count description).
- README.md is clear, complete, and user-focused:
- Explains what `eslint-plugin-traceability` does, supported Node/ESLint versions, and how to install it via npm/Yarn.
- Shows correct flat-config usage with ESLint 9, including minimal and more explicit configurations.
- Documents the canonical function-level rule (`traceability/require-traceability`) and its legacy aliases, consistent with the implementation in src/rules.
- Describes the `traceability-maint` CLI commands (detect, verify, report, update) and usage that match src/maintenance/cli.ts and src/maintenance/commands.ts.
- Provides accurate guidance on running tests and quality checks using package.json scripts that actually exist (npm test, npm run lint, npm run format:check, npm run duplication).
- Includes a clear security and dependency-health summary that aligns with SECURITY.md and the CI scripts in package.json.
- Documents the versioning strategy: semantic-release is used; users are directed to GitHub Releases as the authoritative source.
- Contains the required Attribution section with “Created autonomously by voder.ai” linked to https://voder.ai.
- User-docs are rich and aligned with the implementation:
- user-docs/api-reference.md: thorough rule-by-rule API documentation, including descriptions, options, behavior notes, and examples; matches actual rules in src/rules and the preset wiring in src/index.ts.
- user-docs/eslint-9-setup-guide.md: detailed ESLint v9 flat-config guide (JS, TS, monorepos, tests, common issues). Config and scripts reflect current ESLint 9 conventions and plugin usage.
- user-docs/examples.md: runnable examples for flat configs, CLI invocations, test traceability, and branch annotations with Prettier; the patterns shown correspond to implemented rules like require-test-traceability and require-branch-annotation.
- user-docs/migration-guide.md: explains migration from 0.x to 1.x, including new behavior of valid-story-reference, valid-req-reference, valid-annotation-format, introduction of @supports, and the optional prefer-supports-annotation rule; behavior matches what’s in the code and rule list.
- user-docs/traceability-overview.md: FAQ that helps users choose annotation styles and rule configurations, correctly referencing README, API reference, examples, and migration guide.
- Link formatting and publication are correct:
- All documentation references to other user docs use proper Markdown link syntax, e.g. `[ESLint v9 Setup Guide](user-docs/eslint-9-setup-guide.md)`, `[API Reference](user-docs/api-reference.md)`, `[Examples](user-docs/examples.md)`, `[CHANGELOG.md](CHANGELOG.md)`, `[SECURITY.md](SECURITY.md)`.
- user-docs cross-link via relative Markdown links (e.g. `api-reference.md` → `Migration Guide`, `examples.md`; `traceability-overview.md` → `../README.md#quick-start`), and all referenced files exist.
- package.json "files" includes `lib`, `README.md`, `LICENSE`, `SECURITY.md`, `user-docs`, and `CHANGELOG.md`, so every linked documentation file is shipped in the npm package.
- No user-facing documentation links into internal project docs (`docs/`, `prompts/`, `.voder/`); internal docs are not part of the published files array, preserving the required separation.
- Code references (filenames, commands) are formatted as inline code (backticks), not Markdown links, avoiding the pitfall of linking to non-published source files.
- Versioning and changelog documentation are appropriate for semantic-release:
- .releaserc.json configures semantic-release with changelog, npm, and GitHub plugins, confirming automated versioning.
- CHANGELOG.md explicitly says the project uses semantic-release and directs users to GitHub Releases for current releases, while retaining a historical manual changelog that matches package.json version 1.0.5.
- README reiterates that GitHub Releases are authoritative and that semantic-release is in use; no hard-coded “current version” strings are used in README or user-docs (docs refer generically to the 1.x series and to Releases), which avoids staleness.
- This matches best practice: semantic-release is the source of truth; package.json’s version is allowed to lag without confusing users.
- License and publishing consistency:
- package.json declares "license": "MIT" with a valid SPDX identifier.
- Root LICENSE file contains standard MIT text matching the declared license; there are no additional conflicting LICENSE/LICENCE files.
- Only one package.json exists, so there is no monorepo licensing divergence.
- package.json `files` excludes internal docs (`docs/`), prompts, and tooling configuration, in line with the requirement that internal project docs not be published as user documentation.
- Code documentation and traceability (user-visible aspects):
- Public-facing APIs (rules, presets, maintenance functions, CLI) are well documented in user-docs/api-reference.md, including parameters, options, returns, behavior notes, and example usage.
- Maintenance API docs map one-to-one with the exported functions in src/maintenance/index.ts and the plugin’s `maintenance` export set in src/index.ts.
- The maintenance CLI documentation (commands, options, exit codes, JSON vs text output) matches the implementation in src/maintenance/cli.ts and src/maintenance/commands.ts, ensuring users can rely on the documented behavior.
- The docs clearly explain how `@supports`, `@story`, and `@req` work together, and how rules like require-traceability, valid-annotation-format, valid-story-reference, valid-req-reference, require-test-traceability, and no-redundant-annotation use them; this aligns with the code and reinforces the plugin’s traceability guarantees for end users.
- Separation of user and development documentation is respected:
- User-facing docs: README.md, CHANGELOG.md, LICENSE, SECURITY.md, CONTRIBUTING.md (partially user-facing for contributors), and user-docs/* are written for end users or contributors and are shipped.
- Development docs under docs/ and prompts/ are intentionally referenced only from contributor/developer docs (like CONTRIBUTING.md) and only as plain-text paths, not links; they are not included in package.json "files" and therefore not published.
- No user-facing doc instructs users to read internal docs in docs/ or prompts/; instead, they direct users to the appropriate user-docs/* and GitHub pages.
- Minor issues and nits:
- In user-docs/api-reference.md, the description of the `recommended` preset mentions “six core traceability rules” but then lists nine rules; the actual behavior (as implemented in src/index.ts via TRACEABILITY_RULE_SEVERITIES) is correct. This is a small wording mismatch rather than a behavior error.
- Some docs (especially api-reference and migration-guide) are very detailed and dense. While this is valuable for power users, lighter summaries or tables of key options might further improve scan-ability for new users. This is a quality enhancement opportunity, not a correctness problem.

**Next Steps:**
- Update the wording in user-docs/api-reference.md where it describes the `recommended` preset as enabling “six core traceability rules” so that the count matches the actual current set (or remove the explicit count and just say “core traceability rules”) to avoid confusion for readers comparing docs to configuration.
- When adding or modifying rules or options in src/rules, ensure the corresponding sections in user-docs/api-reference.md and README.md are updated in the same change set so the public documentation remains perfectly aligned with the implementation.
- For future enhancements to the maintenance CLI or presets, continue the established pattern: add concise summaries to README, detailed option/reference sections in user-docs/api-reference.md, and at least one runnable example in user-docs/examples.md.
- Optionally, add small summary tables (per-rule option summaries or quick-start rule presets) at the top of user-docs/api-reference.md to improve readability for users who want a high-level view before digging into details. This is not required for correctness, but would further polish the documentation experience.

## DEPENDENCIES ASSESSMENT (97% ± 19% COMPLETE)
- Dependencies are in excellent shape. All actively used packages install cleanly, tests pass, there are no security or deprecation warnings, the lockfile is committed, and `dry-aged-deps` reports no safe mature updates available. Outdated packages are all too new to meet the 7‑day maturity threshold, so no upgrades are required or allowed at this time.
- `package.json` defines a focused set of devDependencies (ESLint, Jest, TypeScript, Prettier, semantic-release, husky, secretlint, jscpd, dry-aged-deps, etc.) and one peer dependency (`eslint`), all of which are actually used by project scripts and tests.
- The lockfile is properly committed: `git ls-files package-lock.json` returns `package-lock.json`, confirming it’s tracked in git.
- `npm install` completes with exit code 0 and shows no `npm WARN deprecated` messages or other warnings, indicating healthy, non-deprecated dependencies and a clean install process.
- `npm audit` exits with code 0 and reports `found 0 vulnerabilities`, so there are no known security issues in the current dependency tree.
- `npx dry-aged-deps --format=xml` reports 5 outdated packages (`@types/node`, `@typescript-eslint/parser`, `@typescript-eslint/utils`, `dry-aged-deps`, `prettier`), but all have `<filtered>true</filtered>` due to age (`age` 0–5 days) and `<safe-updates>0</safe-updates>`, meaning there are currently no safe mature updates we are allowed to install under the 7‑day policy.
- Because all outdated packages are filtered by age, and no package has `<filtered>false</filtered>` with `<current> < <latest>`, the project is on the latest safe mature versions as defined by `dry-aged-deps` and fully complies with the dependency currency policy.
- `npm ls --all` completes successfully and shows a coherent dependency tree with no hard conflicts or circular dependency issues; some `UNMET OPTIONAL DEPENDENCY` entries are for optional extras (e.g., `node-notifier`, `ts-node`, platform-specific native bindings) that are not needed for current functionality.
- Overrides in `package.json` enforce safe minimum versions for historically vulnerable packages (`glob`, `http-cache-semantics`, `ip`, `semver`, `socks`, `tar`), and `npm ls` confirms these overrides are in effect (entries marked `overridden`).
- All tests pass with the current dependency set: `npm test -- --runInBand` runs 53 suites / 428 tests successfully, demonstrating that the toolchain (Jest, ts-jest, TypeScript, ESLint) is compatible and stable.
- Development scripts are centralized in `package.json` (build, type-check, lint, format, audit, safety checks, etc.), reflecting good package management practices and making dependency-related tooling easy to run consistently.

**Next Steps:**
- Do not upgrade any of the five outdated packages reported by `dry-aged-deps` yet; they are all filtered by age and thus not considered safe. Wait for a future run of `dry-aged-deps` (which happens automatically in this assessment system) to surface them as safe (`<filtered>false</filtered>`) before upgrading.
- When you intentionally change dependencies in the future (adding/removing/updating devDependencies or peerDependencies), re-run `npm install`, `npm test`, and `npx dry-aged-deps --format=xml` to ensure installs remain clean, tests pass, and you stay on the latest safe mature versions.
- Continue to keep `package-lock.json` in sync with any dependency changes (always regenerate via npm commands and ensure the updated lockfile is committed) to preserve deterministic installs across environments.

## SECURITY ASSESSMENT (96% ± 18% COMPLETE)
- Security posture is excellent. Current dependency audits (including dev-only) report 0 known high‑severity vulnerabilities, historical dev‑tooling issues are fully remediated and well‑documented, CI/CD enforces strong security gates before release, secrets handling is correct, and there are no conflicting dependency automation tools.
- Dependency vulnerability status is clean for both production and development:
- `npm audit --omit=dev --audit-level=high` exits 0 with `found 0 vulnerabilities`, so there are no known high‑severity issues in the production (runtime) dependency tree.
- `npm audit --include=dev --audit-level=high` also exits 0 with `found 0 vulnerabilities`, confirming no current high‑severity issues even in dev dependencies.
- `npm run audit:ci`, `npm run audit:dev-high`, and `npm run safety:deps` all succeed, generating advisory reports but not surfacing any new moderate/high issues outside already-documented incidents.
- Historical incidents around semantic‑release/npm are resolved and no longer active:
- `docs/security-incidents/dev-deps-high.json` captures a past state where high‑severity dev‑only vulnerabilities existed in bundled `npm`/`glob`/`brace-expansion` within `@semantic-release/npm`.
- `docs/security-incidents/SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md` documents this as a known error, and its **Resolution** section states the release toolchain has been upgraded to `semantic-release@25.x` / `@semantic-release/npm@13.1.2` and that fresh `npm audit` runs (prod and dev) now report 0 vulnerabilities.
- Current live audits (`npm audit` with and without `--include=dev`) confirm that these issues are no longer present; the known‑error record is now historical documentation, not an active exception.
- Dry‑aged‑deps safety policy is implemented and satisfied:
- `npm run deps:maturity -- --format=json --check` (using `dry-aged-deps`) returns a JSON summary with `packages: []`, `totalOutdated: 0`, `safeUpdates: 0`, under thresholds `{ prod: { minAge: 7, minSeverity: "none" }, dev: { minAge: 7, minSeverity: "none" } }`.
- This indicates there are no pending, mature, vulnerability‑free upgrades that should be applied right now; the project is not lagging behind on any security patches that meet its age/severity policy.
- Security incident handling and documentation are strong and aligned with policy:
- `docs/security-incidents/` contains multiple structured incident reports, a security incident template, a dependency health review (2025‑12‑03), and a clear handling procedure defining roles, overrides, and review cadence.
- The handling procedure and incident records match the behavior observed in scripts and CI (use of `ci/npm-audit.json`, `ci/dry-aged-deps.json`, and `package.json` overrides).
- There are no `*.disputed.md` incidents, so no special audit‑filtering configuration is required; known errors have been resolved rather than merely ignored.
- Hardcoded secrets and .env handling are correct and safe:
- `.env` exists but is 0 bytes; `.gitignore` includes `.env` and related files while explicitly allowing `.env.example`.
- `git ls-files .env` produces no output (file is not tracked), and `git log --all --full-history -- .env` also produces no output (never committed).
- `.env.example` contains only commented, non‑secret placeholders.
- `npm run security:secrets` (secretlint with the recommended preset) passes with exit code 0, indicating no hardcoded secrets in source, configs, or docs.
- This matches the project’s and policy’s definition of secure local secret handling; there is no need for key rotation based on repo contents.
- Code-level review shows no obvious injection or unsafe execution patterns:
- There is no database code, no HTTP server, and no HTML templating; typical SQL injection or XSS vectors are out of scope for this codebase.
- Uses of `child_process` are confined to CI/dev tooling (`scripts/*.js` and tests). All calls use `spawnSync` or `execFileSync` with fixed command names and argument arrays (`npm`, `git`, node script paths), and do **not** use `shell: true` or interpolate user input.
- Dynamic `require` in `src/index.ts` loads from a fixed list of rule names, not user-controlled values, and is therefore not a code‑injection surface.
- File traversal in `src/maintenance/utils.ts` uses `fs` APIs for local filesystem inspection in maintenance tools only; no external attack surface is exposed via this logic.
- Security configuration and CI/CD controls are comprehensive and correctly wired:
- Root `SECURITY.md` defines clear user‑facing guarantees (no high‑severity vulns in production deps at release time, isolation of dev‑tooling risk, secret‑scanning as blocking).
- `docs/security-overview.md` maps those guarantees to concrete scripts and CI checks, including which commands are gating (`npm audit --omit=dev --audit-level=high`, `security:secrets`) versus advisory (full `npm audit` JSON, `dry-aged-deps` reports).
- `.github/workflows/ci-cd.yml` implements a single, unified pipeline that on every push to `main` runs `npm run ci-verify:full`, then `npm run security:secrets`, uploads audit/maturity artifacts, then runs `semantic-release` and a smoke test when appropriate.
- Releases are fully automated and occur in the same workflow run as all security gates; there is no separate, weaker “publish” workflow.
- Local developer workflow mirrors CI security gates:
- Husky hooks (per docs) run linting/formatting on commit and `npm run ci-verify:full` plus `npm run security:secrets` on pre‑push, so the same security gates that protect CI/CD also apply before code leaves a developer’s machine.
- This reduces the likelihood of secret leaks or vulnerable dependency changes reaching `main` in the first place.
- No conflicting automated dependency management tools:
- There is no `.github/dependabot.yml`/`.github/dependabot.yaml` and no `renovate.json`.
- Dependency management is handled via explicit scripts (`dry-aged-deps`, manual updates) and semantic-release; there are no overlapping bots generating conflicting upgrade PRs or competing security signals.

**Next Steps:**
- Clarify the status of `docs/security-incidents/dev-deps-high.json` to avoid confusion:
- Since current audits show 0 high‑severity dev‑only vulnerabilities and the corresponding incident is resolved, either (a) regenerate this snapshot as of the current date and clearly label it, or (b) move it into an `archive/` subfolder and/or add a header note marking it as a historical snapshot only.
- Tighten documentation around manual use of dry-aged-deps:
- The CI wrapper (`scripts/ci-safety-deps.js`) correctly uses `dry-aged-deps --format=json --check`, while a naive `npm run deps:maturity -- --json` fails. Consider updating the `deps:maturity` script to include `--format=json --check` by default, or add a short note in `docs/dependency-health.md` specifying the correct manual invocation so maintainers don’t accidentally run it with unsupported flags.
- Optionally reorganize historical incident files for clarity:
- Several incident markdown files from November 2025 are now fully resolved and superseded by the consolidated known‑error record. To make the current risk posture obvious at a glance, you could move those into a dedicated `docs/security-incidents/archive/` directory or annotate them as historical-only at the top of each file. This is a clarity/readability improvement, not a security requirement.

## VERSION_CONTROL ASSESSMENT (99% ± 19% COMPLETE)
- Version control and CI/CD for this project are in excellent condition. The repo is clean (ignoring expected .voder changes), uses trunk-based development on main, has a single modern CI/CD workflow that runs on every push to main and automatically releases via semantic‑release, and enforces strong local pre‑commit/pre‑push hooks that mirror CI quality gates. There are no deprecated GitHub Actions or hook setups, no built artifacts or CI reports tracked in git, and .voder is handled exactly as required.
- CI/CD workflow configuration
- Single unified workflow: only .github/workflows/ci-cd.yml is present.
- quality-and-deploy job (matrix over Node 18.18.0, 20.0.0, 22.14.0, 24.0.0) performs:
  - Checkout with actions/checkout@v4 (fetch-depth: 0).
  - Node setup with actions/setup-node@v4 and npm cache.
  - Script contract validation (node scripts/validate-scripts-nonempty.js).
  - Dependency install via npm ci.
  - Full quality gate via npm run ci-verify:full.
  - Secret scanning via npm run security:secrets.
  - Artifact uploads (dry-aged-deps, npm-audit, traceability-report, CI artifacts in ci/).
  - Automated release using semantic-release.
  - Post-release smoke test using scripts/smoke-test.sh on the newly published npm version.
- dependency-health job runs only on schedule (nightly) to audit dev dependencies (npm run audit:dev-high) and does not publish or deploy.

Triggers and continuous deployment
- Workflow triggers:
  - on.push.branches: [main] — authoritative CI/CD path.
  - on.pull_request.branches: [main] — feedback CI only (no publishing).
  - on.schedule — nightly dependency health job.
- No workflow_dispatch and no tag-based triggers, so no manual approval or tag-push requirement for releases.
- semantic-release step:
  - Guarded with: github.event_name == 'push' && github.ref == 'refs/heads/main' && matrix['node-version'] == '22.14.0' && success().
  - Runs npx semantic-release with GITHUB_TOKEN and NPM_TOKEN.
  - .releaserc.json configures commit-analyzer, release-notes-generator, changelog, npm publish, and GitHub releases.
  - Handles missing/invalid NPM_TOKEN and OTP (EOTP) gracefully by skipping publish but not failing CI.
  - semantic-release automatically decides whether to publish based on Conventional Commits; no manual intervention.
- Post-deployment smoke test:
  - if: steps.semantic-release.outputs.new_release_published == 'true'.
  - Runs scripts/smoke-test.sh with the new version, which installs from npm and verifies plugin behavior.

Quality gates and parity with hooks
- package.json scripts used by CI and hooks:
  - build: tsc -p tsconfig.json.
  - type-check: tsc --noEmit -p tsconfig.json.
  - lint: eslint with eslint.config.js over src and tests, --max-warnings=0.
  - format / format:check via Prettier.
  - test via Jest (jest --ci --bail).
  - ci-verify: combines type-check, lint, format:check, duplication, check:traceability, test, audit:ci, safety:deps.
  - ci-verify:full: broader CI-equivalent gate running check:traceability, safety:deps, audit:ci, build, type-check, lint-plugin-check, lint, duplication, test --coverage, format:check, npm audit --omit=dev --audit-level=high, audit:dev-high, check:ci-artifacts.
  - security:secrets: secretlint over the repo.
- CI quality gates:
  - quality-and-deploy runs npm run ci-verify:full + npm run security:secrets on each matrix entry.
  - This covers build, type-check, lint, format:check, duplication, traceability analysis, full Jest test suite with coverage, multiple audits, and CI-artifact checks.
- Pre-push hook (.husky/pre-push):
  - set -e; runs npm run ci-verify:full and npm run security:secrets.
  - Mirrors CI’s quality-and-deploy job’s checks (minus CI-only semantic-release and smoke test), satisfying the requirement that hooks and pipeline run the same checks.
  - Referenced and justified in docs/decisions/adr-pre-push-parity.md.
- Pre-commit hook (.husky/pre-commit):
  - set -e; runs npx lint-staged.
  - lint-staged config in package.json runs prettier --write and eslint --fix on staged src/tests files.
  - Provides fast (<10s) formatting and linting on staged content only; no heavy build/test/audit, aligning with the pre-commit vs pre-push division of labor.

GitHub Actions and deprecation checks
- Actions used:
  - actions/checkout@v4.
  - actions/setup-node@v4.
  - actions/upload-artifact@v4.
- These are current, non-deprecated major versions.
- No CodeQL action present, no v1/v2/v3 actions with pending deprecation.
- Tail of latest workflow logs (run 20048133933) shows normal artifact uploads and cleanup, with no deprecation warnings or action-related errors.

Repository status and trunk-based development
- Current branch:
  - git rev-parse --abbrev-ref HEAD → main.
- Sync with remote:
  - git status -sb → '## main...origin/main' with no ahead/behind markers, indicating all local commits are pushed.
- Working tree cleanliness:
  - git status and get_git_status show only modified files under .voder/ (history.md, implementation-progress.md, last-action.md, progress-chart.png, progress-log*.csv).
  - Per assessment rules, .voder contents are intentionally mutable and excluded from cleanliness checks; no other files are modified.
- Commit history (last 10):
  - All commits follow Conventional Commits (test:, docs:, chore:).
  - No recent merge commits visible; history appears linear, consistent with trunk-based dev.
  - docs/ci-cd-pipeline.md explicitly documents main as the single integration branch; PRs are optional feedback paths, not separate long-lived branches.

Repository structure and .gitignore correctness
- .gitignore:
  - Ignores typical JS/Node artifacts: node_modules/, logs, caches, coverage, dist/, build/, lib/, public, ci/, etc.
  - Voder-specific rules:
    - .voder/traceability/ is ignored (transient assessment outputs).
    - .voder/ itself is NOT ignored, so .voder/history.md, .voder/implementation-progress.md, .voder/last-action.md, etc. are tracked.
    - Ignores transient assessment reports: .voder-code-quality-slices.json, .voder-eslint-report.json, .voder-secretlint.json, .voder-test-output.json, .voder-jscpd-report/.
  - Ignores CI/script-generated reports: scripts/eslint-suppressions-report.md, scripts/traceability-report.md, scripts/tsc-output.md, eslint-complexity-report*.json, various test/report JSON files.
- Tracked vs generated artifacts:
  - git ls-files lists only TS sources in src/ and tests/, configs, scripts, docs, user-docs, and .voder metadata.
  - A separate grep over git ls-files with pattern (lib/.*\.(js|d.ts)|dist/|build/|out/) found no matches: no built JS, declaration files, or build directories are tracked.
  - No tracked files match *-report.(md|html|json|xml) or *-output.(md|txt|log) patterns; such paths appear only inside .gitignore and workflow/doc text, not as actual tracked artifacts.
  - scripts/check-no-tracked-ci-artifacts.js is wired into npm run check:ci-artifacts (in ci-verify:full) to programmatically enforce that CI artifacts remain untracked.
- Semantic-release & versioning docs:
  - .releaserc.json defines branches: ["main"] and semantic-release plugins.
  - ADRs 004/006/007 describe automated version bumping, semantic-release usage, and GitHub Releases as primary changelog.
  - docs/ci-cd-pipeline.md documents the workflow, quality gates, and release behavior in detail.

Hooks and tooling setup
- Husky:
  - devDependency "husky": "^9.1.7" (current major).
  - package.json: "prepare": "husky" — modern installation method; no deprecated 'husky install' usage, no .huskyrc.
- Pre-commit vs pre-push responsibilities:
  - Pre-commit: lightweight formatting + linting on staged files using lint-staged; no heavy CI checks.
  - Pre-push: full ci-verify:full plus security:secrets, mirroring CI; pushes blocked on any failure.
- Parity with CI:
  - CI’s quality-and-deploy job and pre-push hook both run ci-verify:full and security:secrets with the same configs (eslint.config.js, tsconfig.json, jest.config.js, .secretlintrc.json), ensuring that local pushes are highly predictive of CI success.

CI stability
- get_github_pipeline_status shows last 10 runs of 'CI/CD Pipeline (main)' all succeeded over recent days, indicating a healthy and stable pipeline without chronic flaky steps or failing gates.
- next_steps:[
- Switch CI script validation step to use npm script
- In .github/workflows/ci-cd.yml, the 'Validate scripts non-empty' step currently runs node scripts/validate-scripts-nonempty.js directly.
- You already expose this as "check:scripts": "node scripts/validate-scripts-nonempty.js" in package.json.
- Change that CI step to run: npm run check:scripts.
- This aligns fully with your own dev-script centralization guideline (all scripts accessible via package.json) and keeps CI using the same contract as local development.

- Add an explicit actionlint script (optional enhancement)
- actionlint is present in devDependencies and referenced in ADR 005.
- Consider adding a script like "ci:actionlint": "npx actionlint" to package.json and documenting it in docs/ci-cd-pipeline.md.
- Optionally, add a non-blocking CI job that runs actionlint on workflow files. This will help catch future workflow syntax or deprecation issues early, though your current workflows already follow best practices.

- Document .voder expectations in CONTRIBUTING.md
- Your .gitignore is correctly configured for .voder/, but human contributors may not know which files are expected to be committed vs ignored.
- Add a short section to CONTRIBUTING.md clarifying:
  - .voder/history.md, .voder/last-action.md, and .voder/implementation-progress.md SHOULD be tracked.
  - .voder/traceability/ and the various .voder-*.json reports are transient and MUST remain untracked.
- This will make it easier for new maintainers to respect the assessment tooling’s expectations without accidentally changing ignore rules.

**Next Steps:**
- Switch CI script validation step to use npm script
- Add an explicit actionlint script (optional enhancement)
- Document .voder expectations in CONTRIBUTING.md

## FUNCTIONALITY ASSESSMENT (undefined% ± 95% COMPLETE)
- Functionality assessment skipped - fix 1 deficient support area(s) first
- Support areas must meet thresholds before assessing feature completion
- Deficient areas: CODE_QUALITY (82%)
- Principle: "Improvement of daily work is higher priority than daily work" - fix foundation before building features

**Next Steps:**
- CODE_QUALITY: Ratcheting complexity: the codebase already passes at `complexity: max 17`.
- Update `eslint.config.js` to use `complexity: ["error", { max: 17 }]` for TS/JS.
- Run `npm run lint`, `npm run type-check`, `npm test`, `npm run duplication`, and `npm run format:check`.
- Commit with `chore: reduce complexity threshold to 17` and push, letting CI verify.
- CODE_QUALITY: Plan the next step for function-length reduction in production code:
- Keep the rule at 55 for now, but target lowering to 54 once key functions are refactored.
- Start with:
  - `src/rules/no-redundant-annotation.ts`: split `getScopePairs` and `getRedundantStatementContext` into smaller helpers (e.g., separate branch vs function scope handling, separate filtering vs reporting logic).
  - `src/rules/prefer-implements-annotation.ts`: break `handleInlineStorySequence` into focused helpers per annotation pattern.
  - `src/rules/require-req-annotation.ts`: extract configuration parsing and visitor wiring from the `create` method.
  - `src/rules/valid-annotation-format.ts`: split `processCommentLine` into parsing, validation, and error-reporting helpers.
  - `src/rules/valid-story-reference.ts`: factor `processStoryPath` into path normalization, existence checking, and error classification.
  - `src/utils/annotation-scope-analyzer.ts`: separate concerns inside `getCommentRemovalRange` (e.g., computing adjacent whitespace vs deciding range direction).
  - `src/utils/branch-annotation-helpers.ts`: factor `validateBranchTypes` into smaller predicate/validation helpers.
- After refactoring these, lower `max-lines-per-function` to 54 and re-run lint before committing.
