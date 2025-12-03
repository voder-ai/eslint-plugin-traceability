# Implementation Progress Assessment

**Generated:** 2025-12-03T13:00:40.217Z

![Progress Chart](./progress-chart.png)

Projected completion (from current rate): cycle 152.7

## IMPLEMENTATION STATUS: INCOMPLETE (94% ± 18% COMPLETE)

## OVERALL ASSESSMENT
Overall project health is excellent across code quality, testing, execution, documentation, dependencies, security, and version control, all of which exceed their required thresholds. The only gating gap is functionality: two of thirteen stories remain incomplete, with earliest failure at docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md. Core behaviors of the ESLint plugin, maintenance CLI, CI/CD pipeline, and security posture are robust, well-tested, and thoroughly documented, but full functional coverage of all specified stories has not yet been achieved, so the implementation must be considered incomplete until the remaining story requirements are implemented and validated by traceable tests.

## NEXT PRIORITY
Finish implementing and validating all remaining requirements for docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md, adding traceable tests to raise FUNCTIONALITY to at least 90%.



## CODE_QUALITY ASSESSMENT (94% ± 18% COMPLETE)
- Code quality is excellent: linting, formatting, type-checking, duplication checks, and CI/CD are all well tooled, strictly configured, and currently passing. Maintainability rules (complexity, function/file size, magic numbers, params) are enforced more strictly than typical defaults. Only very minor, well-justified suppressions and small, test-only duplication remain as potential polish areas.
- Linting: `npm run lint` passes using ESLint v9 flat config (`eslint.config.js`) with `@eslint/js` recommended rules and custom maintainability rules. The config correctly distinguishes between TS, JS, and test files, and loads the local plugin from `src` or `lib` with a CI-only hard failure if the plugin is missing.
- Formatting: `npm run format:check` passes; Prettier is configured via `.prettierrc` and `.prettierignore`, and enforced on `src/**/*.ts` and `tests/**/*.ts`. Pre-commit also runs Prettier via `lint-staged`, auto-fixing formatting on changed files.
- Type checking: `npm run type-check` (`tsc --noEmit -p tsconfig.json`) passes. `tsconfig.json` uses `strict: true`, `esModuleInterop: true`, `forceConsistentCasingInFileNames: true`, and includes both `src` and `tests`, ensuring comprehensive type coverage.
- Maintainability rules (ESLint): For TS and JS files, ESLint enforces `complexity: ["error", { max: 18 }]`, `max-lines-per-function: ["error", { max: 55, skipBlankLines: true, skipComments: true }]`, `max-lines: ["error", { max: 300, ... }]`, `no-magic-numbers` (with narrow exceptions), and `max-params: ["error", { max: 4 }]`. These are already stricter than typical defaults (complexity 20) and applied to all production sources.
- Tests configuration: Test files have complexity, max-lines, max-lines-per-function, magic-numbers, and max-params rules explicitly turned off, which is appropriate for test readability. Global Jest globals are configured via an ESLint override to avoid spurious lint errors.
- Duplication: `npm run duplication` (jscpd with `--threshold 3`) passes with low overall duplication: 0.97% of lines and 1.87% of tokens across 66 analyzed files. All reported clones are small, located in test files (`tests/rules/*`, `tests/maintenance/cli.test.ts`, `tests/utils/*`), and there is no evidence of significant duplication in production code.
- Production code purity: `src/` imports only core libraries (Node, ESLint types, internal helpers) and contains no test/mocking frameworks. Jest is only used under `tests/`, and pre-commit/pre-push hooks do not inject test-related code into production paths.
- Error handling & clarity: Key modules (e.g., `src/index.ts`, `src/maintenance/cli.ts`, `src/utils/annotation-checker.ts`, `src/rules/helpers/require-story-helpers.ts`, `src/rules/helpers/valid-story-reference-helpers.ts`) have clear, focused functions, meaningful names, and consistent error handling (clear messages, specific exit codes for the CLI, safe fallbacks in the plugin’s dynamic rule loading).
- Magic numbers & constants: Magic-number usage is controlled by ESLint `no-magic-numbers` and is largely replaced by named constants (e.g., `LOOKBACK_LINES`, `FALLBACK_WINDOW` in `require-story-helpers.ts`, CLI exit codes `EXIT_OK`, `EXIT_STALE`, `EXIT_USAGE` in `maintenance/cli.ts`). Where small literals remain, they tend to be conventional and clearly named/contextual.
- File and function sizes: Lint passes with `max-lines` = 300 and `max-lines-per-function` = 55, indicating that no files exceed these limits and no individual function is excessively long. Inspection of representative files (e.g., `src/maintenance/cli.ts`, `src/utils/annotation-checker.ts`, `src/rules/helpers/require-story-helpers.ts`) shows coherent, single-responsibility functions rather than god objects or giant methods.
- Disabled checks: There are no file-wide `/* eslint-disable */` blocks, no `@ts-nocheck`, and no `@ts-ignore`/`@ts-expect-error` usage detected in `src` or `tests`. The only suppression observed is a single `// eslint-disable-next-line no-unused-vars` in `src/rules/helpers/valid-story-reference-helpers.ts` for a type alias parameter that is intentionally only used for documentation/IDE hints, which is narrowly scoped and clearly commented.
- Error handling consistency: Code consistently uses structured error reporting: the ESLint plugin wraps rule loading in `try/catch` with clear console errors and fallback rules, and the maintenance CLI (`runMaintenanceCli`) maps errors to specific exit codes and human-readable messages, avoiding silent failures.
- Naming and readability: Functions, types, and variables are self-explanatory (e.g., `analyzeCandidateBoundaries`, `performSecurityValidations`, `handleProjectBoundaryForExistence`, `parseFlags`, `handleDetect`, `reportMissing`). JSDoc comments focus on intent and traceability rather than restating obvious implementation details.
- AI slop/placeholder code: There are no generic or nonsensical comments, no empty or near-empty source files, and no obvious AI-generated boilerplate. Traceability annotations (`@story`, `@req`) are specific to actual stories under `docs/stories/` and support meaningful requirements linkage.
- Tooling & hooks: `package.json` scripts provide canonical commands for build (`build`), lint (`lint`), type-check (`type-check`), formatting (`format`, `format:check`), duplication (`duplication`), traceability (`check:traceability`), security/audit (`audit:ci`, `safety:deps`, `security:secrets`), and CI verification (`ci-verify`, `ci-verify:full`, `ci-verify:fast`). Husky pre-commit runs `lint-staged` (Prettier + ESLint on staged files), and pre-push runs `npm run ci-verify:full`, aligning local checks with CI.
- CI/CD configuration: A single unified workflow `.github/workflows/ci-cd.yml` runs on `push` (including `main`), `pull_request`, and a nightly schedule. The `quality-and-deploy` job runs `npm ci`, then `npm run ci-verify:full` (build, type-check, lint, duplication, tests, format:check, audits), then secret scanning, and finally semantic-release + smoke test for automatic publishing on successful pushes to `main`. This ensures all quality gates are enforced before deployment.
- Incremental quality posture: Complexity limits (18), function/file size limits, duplication threshold (3%), strict TS, and absence of broad suppressions show that the project is already operating at or above the target quality thresholds. There is no evidence of intentionally high limits or deferred ratcheting for complexity or function length.

**Next Steps:**
- Optionally refactor small duplicated patterns in tests (e.g., repeated blocks in `tests/rules/valid-story-reference.test.ts` and `tests/maintenance/cli.test.ts`) into shared helpers to slightly reduce duplication and improve long-term test maintainability, while keeping tests readable.
- Review the single `eslint-disable-next-line no-unused-vars` in `src/rules/helpers/valid-story-reference-helpers.ts` to see if you prefer an alternative pattern (e.g., using a leading underscore for intentionally-unused function parameters or reshaping the type) so the rule can remain enabled everywhere without suppression.
- Consider whether you want to tighten complexity or size limits even further in the future (e.g., `complexity` 15, `max-lines-per-function` 40) now that the codebase is in good shape; if you do, use the recommended ratcheting approach by temporarily running ESLint with lower thresholds to identify and refactor the specific hot spots before updating `eslint.config.js`.
- Keep the existing CI/CD and Husky integration as the single source of truth for quality enforcement; when adding new modules or rules, ensure they are covered by ESLint, TypeScript, and jscpd by default so the current high quality bar is maintained.

## TESTING ASSESSMENT (96% ± 19% COMPLETE)
- Testing is mature, comprehensive, and tightly aligned with the project’s traceability goals. Jest is configured correctly, all tests pass, coverage is high and enforced, tests are isolated via temp directories, and story/requirement traceability is consistently embedded in the test suite. Only minor issues remain around some test logic complexity and a few opportunities to cover edge branches more explicitly.
- Test framework & configuration: The project uses Jest with ts-jest (`jest.config.js`) as the established test framework. Jest is configured with `testEnvironment: 'node'`, `preset: 'ts-jest'`, proper `testMatch` for `tests/**/*.test.ts`, and coverage thresholds (branches 80, functions/lines/statements 90). This satisfies the requirement for an established, non-custom test framework.
- Execution & pass status: `npm test` runs `jest --ci --bail` in non-interactive CI mode (no watch flags). The recorded `.voder-test-output.json` shows 0 failed suites/tests and success: true, and an explicit `npm test -- --coverage` run completed without error (the command would have failed the tool call otherwise). This meets the zero-tolerance requirement: all tests are currently passing.
- Coverage & thresholds: Running `npm test -- --coverage` reports overall coverage of ~96.24% statements, 81.81% branches, 100% functions, 96.24% lines. Jest’s configured global thresholds (80% branches, 90% others) are all met or exceeded. Critical core directories (`src/rules`, `src/maintenance`, `src/utils`) all have high coverage, with only a few non-critical branches and lines uncovered.
- CI integration: The unified CI/CD workflow (`.github/workflows/ci-cd.yml`) runs `npm run ci-verify:full`, which includes `npm run test -- --coverage` as well as build, lint, type-check, duplication, traceability, and audit steps. This ensures the full test suite and coverage checks are enforced on every CI run and before publishing, satisfying the requirement that tests are integrated into the quality gate.
- Test isolation & filesystem safety: Tests that perform file operations use OS temp directories and clean up after themselves. Examples: `tests/maintenance/*.test.ts` use `fs.mkdtempSync(path.join(os.tmpdir(), '...'))` to create unique temp dirs and call `fs.rmSync(tmpDir, { recursive: true, force: true })` in `finally` blocks or `afterAll`. `detect-isolated.test.ts`, `update-isolated.test.ts`, `batch.test.ts`, and `report.test.ts` all respect this pattern. No tests write into the repository source/docs directories; they only read fixtures there. This satisfies the requirement that tests not modify repository files and use temp dirs for file IO.
- Non-interactive behavior: The default test script is `"test": "jest --ci --bail"` in `package.json`. There is no use of watch mode or interactive prompts in any test command (`npm test`, `npm run ci-verify`, `npm run ci-verify:full`, `npm run ci-verify:fast`). This matches the non-interactive testing requirement.
- Traceability in tests: Test files consistently include `@story` annotations and requirement references. Examples: `tests/plugin-setup.test.ts` (`@story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md`, `@req REQ-PLUGIN-STRUCTURE`), `tests/rules/require-story-annotation.test.ts` (`@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md`, multiple REQ IDs), `tests/maintenance/cli.test.ts` (`@story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md`, multiple maintenance REQs). Describe blocks also explicitly reference stories, e.g. `describe('Maintenance CLI (Story 009.0-DEV-MAINTENANCE-TOOLS)', ...)`. This is excellent requirement-to-test traceability.
- Test structure & naming: Tests use Jest’s `describe`/`it` structure with behavior-focused names. Examples: `"[REQ-MAINT-SAFE] dry-run does not modify files and exits 0"`, `"[REQ-ERROR-SPECIFIC] missing @story annotation should report specific details and suggestion"`, `"[REQ-DEEP-PARSE] disallow path traversal in story path"`. This reflects clear GIVEN-WHEN-THEN / ARRANGE-ACT-ASSERT thinking, even when not explicitly commented as such. Each test typically checks a single behavior scenario.
- Coverage of implemented functionality: The suite covers all major feature areas implied by the stories:
- Plugin structure & exports: `tests/plugin-setup.test.ts`, `tests/plugin-default-export-and-configs.test.ts`.
- ESLint config and rule options: `tests/config/eslint-config-validation.test.ts`, `tests/config/require-story-annotation-config.test.ts`.
- Core rules: `tests/rules/require-story-annotation.test.ts`, `require-req-annotation.test.ts`, `require-branch-annotation.test.ts`, `valid-annotation-format.test.ts`, `valid-story-reference.test.ts`, `valid-req-reference.test.ts`.
- Maintenance tools & CLI: `tests/maintenance/*.test.ts` cover `detectStaleAnnotations`, `updateAnnotationReferences`, `batchUpdateAnnotations`, `verifyAnnotations`, `generateMaintenanceReport`, and the `traceability-maint` CLI.
- Integration with ESLint CLI: `tests/integration/cli-integration.test.ts` and `tests/cli-error-handling.test.ts` execute the real `eslint` binary with this plugin configured, validating end-to-end behavior.
- Error handling & edge-case testing: Error paths and edge cases are well-tested:
- Rule error messaging specificity and suggestions are validated in `tests/rules/error-reporting.test.ts`.
- File validation error cases (missing files, invalid extensions, path traversal, absolute paths) are tested in `valid-story-reference.test.ts` and `valid-req-reference.test.ts`.
- Maintenance tools test permission errors and security constraints on path traversal in `detect-isolated.test.ts` (e.g., checking that malicious paths are never passed to `fs.existsSync`).
- CLI-level error handling for plugin load failures is covered in `plugin-setup-error.test.ts` and `cli-error-handling.test.ts`.
This satisfies the requirement to test error handling and edge conditions, not just the happy path.
- Test data & builders: Tests use meaningful data and reusable helpers, supporting readability and maintainability. Examples include `withTsLanguageOptions` and `runAnnotationCheckerTests` in `tests/utils/annotation-checker.test.ts`, `makeInvalid` and `makeInvalidStory` patterns in `valid-annotation-format.test.ts`, and structured `TestCase` arrays with `it.each` in `cli-integration.test.ts`. Requirement IDs in test names (e.g., `[REQ-MAINT-DETECT]`, `[REQ-DEEP-PARSE]`) improve traceability and documentation value.
- Test independence & determinism: Tests avoid shared mutable state between suites. Where global state is touched, it is reset:
- `tests/maintenance/cli.test.ts` saves `process.cwd()` in `beforeAll` and restores it in `afterAll`, and each test creates its own temp directory and cleans it up.
- `plugin-setup-error.test.ts` uses `jest.resetModules()` and mocks/restores `console.error` in `beforeEach`/`afterEach`.
- RuleTester-based tests do not rely on execution order; they’re self-contained invocations of `ruleTester.run`. There is no use of random inputs or timing-dependent logic. The test run completes quickly, indicating good speed.
- Test focus on behavior (not internals): Most tests exercise observable behavior:
- Rule tests assert on reported messages, errors, and autofix outputs rather than internal helper functions.
- CLI tests assert on exit codes, console output, and file changes.
- Integration tests drive ESLint via its CLI entrypoint. This aligns tests with externally visible behavior and supports refactoring of internals without breaking tests.
- Naming & file organization: Test file names align with the features they test, e.g. `require-story-annotation.test.ts`, `valid-req-reference.test.ts`, `maintenance/cli.test.ts`. Files that contain "branch" in the name (`require-branch-annotation.test.ts`, `branch-annotation-helpers.test.ts`) actually test branch-related logic (control-flow branches), not coverage metrics, so they do not violate the coverage-terminology rule.
- Minor issue – logic inside tests: Some tests contain non-trivial logic (loops, helper functions, conditionals) within the test body or helpers, e.g. the use of `makeInvalid` and `makeInvalidStory` builders in `valid-annotation-format.test.ts` and the path-tracking and multiple `Array.prototype.some` checks in `detect-isolated.test.ts`. While these patterns are well-structured and localized, they slightly increase cognitive load compared to very simple assertions.
- Minor issue – slight gaps in branch coverage: Although global branch coverage exceeds the configured 80% and per-file coverage is high, a few modules (e.g., `src/maintenance/cli.ts`, `src/utils/reqAnnotationDetection.ts`, `src/rules/helpers/require-story-utils.ts`) still have some uncovered branches and lines, as indicated in the coverage report (e.g., untested error/else paths). None appear to be obviously critical, but they represent potential opportunities to further harden behavior around rare or failure conditions.
- Minor issue – one CLI error-handling test is somewhat synthetic: `tests/cli-error-handling.test.ts` describes simulating a missing rule module, but the comments acknowledge that renaming files in place is not implemented and instead rely on the plugin’s current behavior. This test still verifies that an ESLint run with this plugin exits non-zero and reports a missing annotation message, but it may not fully cover the intended "missing rule module" scenario.
- Tooling around tests: Supporting scripts like `npm run ci-verify` and `npm run ci-verify:full` ensure tests are run in conjunction with type checking, linting, duplication analysis, and traceability checks. Husky is configured via `prepare` and lint-staged entries, which likely provides pre-commit enforcement for format and lint, indirectly protecting test quality (though pre-commit isn’t executing tests themselves).

**Next Steps:**
- Add targeted tests for remaining uncovered branches in a few modules highlighted by the coverage report (e.g., exceptional or edge paths in `src/maintenance/cli.ts`, `src/utils/reqAnnotationDetection.ts`, and `src/rules/helpers/require-story-utils.ts`) to push coverage on important error-handling logic closer to 100% branches where it matters most.
- Simplify or further encapsulate complex test-side logic where feasible, especially in tests that use more involved path tracking or array scanning (for example, `detect-isolated.test.ts`): extract some of the repeated expectations into small, clearly named helper functions to keep individual tests as close as possible to straightforward ARRANGE-ACT-ASSERT sequences.
- Review all `tests/**/*.test.ts` files to ensure every test file starts with a clear JSDoc header that includes `@story` and `@req` annotations (most already do); for any helper-only test files that might be missing this, add concise story references to keep traceability uniformly strong.
- Extend or refine CLI error-handling tests (e.g., `cli-error-handling.test.ts`) to more directly simulate or mock the specific failure conditions described in the comments (such as missing rule modules), ensuring the tests align precisely with the documented scenarios and remain robust if plugin behavior evolves.
- Periodically re-run `npm test -- --coverage` locally after significant changes to rules or maintenance tooling and use the detailed per-file coverage report to spot any newly introduced untested branches, keeping the current high testing standard intact as the codebase evolves.

## EXECUTION ASSESSMENT (94% ± 19% COMPLETE)
- The project’s execution quality is excellent. The TypeScript build, Jest test suite (including integration tests), ESLint linting, Prettier formatting checks, duplication analysis, and a packaged smoke test all run successfully locally. Core runtime behaviors for both the ESLint plugin and the maintenance CLI are thoroughly exercised via automated tests, with robust input validation and clear error reporting. No significant performance or resource‑management issues are evident for the project’s scope.
- Build process validation: `npm run build` succeeds, compiling the TypeScript sources using `tsc -p tsconfig.json` (evidence: `package.json` scripts and successful command output). The compiled artifacts are then validated indirectly by the smoke test, which packs and installs the library from a tarball and requires it in a fresh project (`scripts/smoke-test.sh`).
- Local test execution: `npm test` runs Jest in CI mode (`jest --ci --bail`) and completes without errors (evidence: command output). Jest is configured with `ts-jest` and strict global coverage thresholds (80% branches, 90%+ others) in `jest.config.js`, confirming a broad runtime test surface.
- Static analysis and type checks: `npm run lint` (ESLint with `eslint.config.js` over `src` and `tests`) and `npm run type-check` (TypeScript `--noEmit`) both complete successfully, ensuring the codebase is type‑sound and adheres to lint rules at execution entry points.
- Formatting and duplication checks: `npm run format:check` verifies Prettier formatting for all TypeScript sources and tests with no issues. `npm run duplication` (jscpd) runs and reports only minor, acceptable duplication (~0.97% of lines), demonstrating that auxiliary quality tools execute cleanly and do not block runtime.
- End-to-end library validation (smoke test): `npm run smoke-test` successfully packs the library (`npm pack`), installs the resulting tarball into a temporary npm project, requires `eslint-plugin-traceability` via Node, asserts that `pkg.rules` is present, and then configures ESLint to use the plugin via a generated `eslint.config.js`. The final ESLint invocation (`npx eslint --print-config`) succeeds, demonstrating that the built package loads and integrates correctly with ESLint in a realistic consumer environment.
- ESLint plugin runtime behavior: The plugin entrypoint (`src/index.ts`) dynamically loads rule modules listed in `RULE_NAMES` and supports both CommonJS and ESModule default exports (`mod.default ?? mod`). Failures during `require('./rules/<name>')` are caught; a fallback rule is registered that reports a clear ESLint error, and the failure is logged to `console.error`. This avoids silent failures and ensures ESLint surfaces misconfiguration at runtime.
- Integration with ESLint CLI: `tests/integration/cli-integration.test.ts` uses `spawnSync` to run the real `eslint` CLI (resolved from the installed `eslint` package), passing a flat config and rule overrides via `--rule`. It feeds code snippets via stdin and verifies `result.status` matches expectations (e.g., missing `@story` or `@req` annotations produce a non-zero exit). This provides strong evidence that plugin rules behave correctly in the target execution environment (Node + ESLint CLI).
- Maintenance CLI runtime behavior: The CLI implementation in `src/maintenance/cli.ts` exposes `runMaintenanceCli`, which parses subcommands (`detect`, `verify`, `report`, `update`) and flags (`--root`, `--json`, `--format`, `--from`, `--to`, `--dry-run`) with predictable semantics. Extensive tests in `tests/maintenance/cli.test.ts` cover exit codes, log output, JSON output, dry‑run behavior, and argument validation for each subcommand, confirming correct runtime behavior and input handling.
- CLI input validation and error handling: `runMaintenanceCli` prints help and exits with `EXIT_OK` when no command or `-h/--help` is provided. Unknown commands print an error, show help, and exit with `EXIT_USAGE` (2). Subcommand flag parsing is centralized in `parseFlags` and `applyFlag`, which validate `--format` values (throwing for invalid formats), require `--from`/`--to` for `update` (otherwise printing an error and help, returning `EXIT_USAGE`), and support `--dry-run`. A top-level `try/catch` converts unexpected exceptions into a concise `traceability-maint failed: ...` diagnostic and returns `EXIT_USAGE`, avoiding unhandled exceptions.
- Maintenance operations behavior: `detectStaleAnnotations` (`src/maintenance/detect.ts`) safely handles missing/invalid roots (returns `[]` when the resolved workspace root is not a directory), gracefully skips unreadable files, filters out unsafe story paths (e.g., traversal or invalid extensions) before any filesystem access, and enforces a project boundary via `enforceProjectBoundary`. Stale annotations are accumulated in a `Set` and returned as unique paths. `updateAnnotationReferences` (`src/maintenance/update.ts`) validates the `codebasePath` directory before iterating files, uses a single compiled `RegExp` to update references, and writes back only when content changes, avoiding unnecessary I/O.
- Batch and verification tools: `batchUpdateAnnotations` and `verifyAnnotations` (`src/maintenance/batch.ts`) provide higher-level APIs that compose `updateAnnotationReferences` and `detectStaleAnnotations`. `verifyAnnotations` returns a boolean based on whether any stale annotations exist, and this is integrated into the `verify` CLI subcommand, which prints a clear success or failure message and uses distinct exit codes. This supports automation and scripting workflows around the maintenance tools.
- Reporting behavior: `generateMaintenanceReport` (`src/maintenance/report.ts`) builds a human-readable report by joining stale annotation paths with newlines. The `report` subcommand allows `--format text|json`, emitting either Markdown-like text (including a header and listing stale references) or a JSON payload `{ root, report }`. Tests confirm that human‑readable output contains both the header and the specific stale story paths.
- Resource management and process lifecycle: All core executions (tests, build, smoke test, CLI commands) are short-lived Node processes. The toolchain uses synchronous filesystem APIs (`fs.readFileSync`, `fs.statSync`, `fs.readdirSync`) in linear/recursive traversals appropriate for CLI utilities. There is no long-lived server, open socket, or database connection in this project, so risk of memory leaks or unclosed resources is minimal. Temporary directories created in tests and in the smoke test script are cleaned up deterministically (via `fs.rmSync` in tests and a `trap cleanup EXIT` in `scripts/smoke-test.sh`).
- Performance characteristics: The primary potential hot paths are file traversal and regex scanning in the maintenance utilities. `getAllFiles` (`src/maintenance/utils.ts`) performs a standard recursive directory traversal, accumulating file paths in a reusable array. `detectStaleAnnotations` iterates once over all files and uses a compiled regex per file to extract `@story` annotations. There are no N+1 database queries or similar anti‑patterns; loops are purely in‑memory or involve bounded filesystem calls. For the typical scale of an ESLint-managed codebase, this is appropriate and unlikely to cause performance problems.
- No silent failures for implemented functionality: Plugin rule load failures are logged and converted to ESLint problems; invalid CLI usage prints errors and help text with non-zero exit codes; maintenance functions either return safe defaults (e.g., empty arrays/zeros for invalid directories) or propagate their results back to the CLI. The only intentionally silent behavior is skipping unreadable files during stale detection, which is aligned with the maintenance tool’s resilience goals and does not mask critical failures of documented features.
- Local quality gate automation: Husky hooks are configured. The pre-commit hook runs `lint-staged` to format and lint changed `src` and `tests` files before allowing commits. The pre-push hook runs `npm run ci-verify:full`, which chains type-checking, linting, duplication checks, traceability checks, full tests with coverage, formatting checks, and security audits (`npm audit`, custom audit scripts). This ensures the same executables and checks that back the runtime behavior can be run reliably on developer machines prior to code sharing.

**Next Steps:**
- Add an automated test that exercises the installed `traceability-maint` CLI binary (from the built `lib` output) in a temporary project, similar to the existing smoke test for the plugin, to validate that the published CLI entrypoint and shebang work end-to-end.
- Consider logging a brief warning or debug message when files cannot be read during `detectStaleAnnotations` if such situations are expected to be rare, to aid in diagnosing unexpected permission or filesystem issues without compromising resilience.
- If the maintenance tools are expected to operate on very large monorepos, consider adding optional mechanisms to limit traversal scope (e.g., include/exclude globs) or to parallelize file scanning while preserving current correctness and error-handling behavior.

## DOCUMENTATION ASSESSMENT (97% ± 19% COMPLETE)
- User-facing documentation for this project is highly complete, accurate, and current. README, user-docs, rule docs, and changelog all align closely with the actual implementation, licensing is fully consistent, and traceability annotations are present and well-formed across the codebase.
- README attribution requirement is fully satisfied: the root README.md includes an explicit 'Attribution' section with the text 'Created autonomously by voder.ai' linking to https://voder.ai, as required.
- README.md is accurate and aligned with implementation: it documents Node.js >=18.18.0 and ESLint v9+ (matching package.json engines.node and peerDependencies.eslint), shows both flat-config and classic usage patterns, and references the correct rule names (`require-story-annotation`, `require-req-annotation`, `require-branch-annotation`, `valid-annotation-format`, `valid-story-reference`, `valid-req-reference`) that all exist under src/rules/.
- README usage and scripts match the actual project scripts: commands like `npm test`, `npm run lint -- --max-warnings=0`, `npm run format:check`, and `npm run duplication` are documented and correspond exactly to entries in package.json.
- User documentation is clearly separated and well organized under user-docs/: api-reference.md, eslint-9-setup-guide.md, examples.md, and migration-guide.md all begin with the voder.ai attribution, include last-updated timestamps and version 1.0.5 (matching package.json.version), and focus on end-user setup and usage rather than internal development details.
- API Reference (user-docs/api-reference.md) is comprehensive and matches the implementation: it documents each public rule with descriptions, options, defaults, and examples, and these align with the rule meta definitions and schemas in src/rules (e.g., require-story-annotation and require-req-annotation options `scope` and `exportPriority`, valid-annotation-format’s nested `story`/`req` and flat shorthand options, valid-story-reference’s `storyDirectories`/`allowAbsolutePaths`/`requireStoryExtension`, and valid-req-reference having no options and schema []).
- Maintenance API and CLI documentation in api-reference.md accurately reflects the code in src/maintenance/* and src/maintenance/cli.ts: functions like detectStaleAnnotations, updateAnnotationReferences, batchUpdateAnnotations, verifyAnnotations, and generateMaintenanceReport have the documented parameters and return types; CLI commands `detect`, `verify`, `report`, and `update` support the documented flags (`--root`, `--json`, `--format`, `--from`, `--to`, `--dry-run`) and exit codes (0, 1, 2), and their text/JSON outputs match the described formats.
- ESLint 9 Setup Guide (user-docs/eslint-9-setup-guide.md) provides accurate flat-config guidance that matches how this plugin is meant to be consumed (e.g., `import traceability from "eslint-plugin-traceability";` and use of `traceability.configs.recommended`/`strict`), and is consistent with README examples and the exported configs in src/index.ts.
- Examples document (user-docs/examples.md) contains runnable, realistic examples for integrating the plugin into ESLint (flat config presets, strict vs recommended, CLI invocation without config, npm script integration) that are consistent with ESLint 9 behavior and the plugin’s published API.
- Migration guide (user-docs/migration-guide.md) accurately describes changes from v0.x to v1.x: stricter `.story.md` enforcement, security checks for paths, and the move toward ESLint 9 flat config. These behaviors are visible in valid-story-reference.ts and valid-annotation-format.ts (extension checks, regex-based format validation, security and path traversal protections).
- Per-rule documentation in docs/rules/*.md is in sync with implementation: for example, docs/rules/require-story-annotation.md lists supported node types and options that match the DEFAULT_SCOPE and schema in src/rules/helpers/require-story-core.ts and src/rules/require-story-annotation.ts; docs/rules/require-req-annotation.md and docs/rules/require-branch-annotation.md describe options and behavior (e.g., branchTypes validation, configuration error messages) that correspond to the logic in src/utils/branch-annotation-helpers.ts and src/rules/require-branch-annotation.ts.
- Advanced validation behavior for `@implements` annotations is properly documented in docs/rules/valid-annotation-format.md and docs/rules/valid-req-reference.md, and this matches helpers in src/rules/helpers/valid-implements-utils.ts and the parsing/validation logic for `@implements` lines in src/rules/valid-req-reference.ts (token indices, MIN_IMPLEMENTS_TOKENS, per-story requirement scoping).
- CHANGELOG.md is consistent and current with package.json.version (1.0.5): it explains that detailed release notes are now on GitHub Releases and retains a historical changelog for 0.1.0–1.0.5; entries describing added docs (API reference, examples, migration guide) and pipeline changes match the presence of user-docs files and CI configuration in the repo.
- License information is fully consistent: package.json specifies "license": "MIT" using a valid SPDX identifier, and the root LICENSE file contains a standard MIT License notice with copyright (c) 2025 voder.ai. There is only one package.json and one LICENSE, so there are no monorepo alignment issues or conflicting license texts.
- Public API code is well documented with JSDoc-style comments, including parameter and behavior descriptions, though these are primarily developer-facing; user-facing API documentation is provided via markdown in user-docs/ and docs/rules/, which offer detailed descriptions of parameters, return values, configuration shapes, and error semantics supported by practical examples.
- Usage examples and CLI examples are genuinely runnable and match the actual tooling: ESLint invocations (`npx eslint ...`), npm scripts, and the `traceability-maint` CLI commands in README and user-docs/api-reference.md use flags and patterns that are implemented in src/maintenance/cli.ts and src/index.ts.
- Traceability annotations are present and consistently formatted across named functions and significant branches in the implementation: sampled core files (src/index.ts, src/rules/*, src/rules/helpers/*, src/utils/branch-annotation-helpers.ts, src/maintenance/*.ts) all use `@story` and `@req` tags in JSDoc blocks or inline comments, and complex branches (if/switch/loops, try/catch, directory traversal checks) carry inline `@story`/`@req` annotations. No placeholder content like `@story ???` or `@implements ??? UNKNOWN` was found via targeted greps, and annotations reference specific story files under docs/stories rather than generic story map files.
- The traceability format is parseable and aligned with the documented specification: annotations use `@story`, `@req`, and `@implements` in consistent JSDoc or line-comment forms, and the valid-annotation-format rule plus its helpers (valid-annotation-utils.ts, valid-implements-utils.ts) enforce exactly the formats described in docs/rules/valid-annotation-format.md and user-docs/api-reference.md, ensuring future automation can reliably process them.
- Documentation is easily discoverable and logically linked: README.md points to user-docs (ESLint 9 Setup Guide, API Reference, Examples, Migration Guide), rule docs under docs/rules/, the full README on GitHub, the contribution guide, issue tracker, and changelog, giving end users an obvious path from high-level overview to detailed configuration and troubleshooting material.

**Next Steps:**
- Maintain the strong alignment between user-docs/api-reference.md, docs/rules/*.md, and src/rules/* when adding new rules or expanding existing ones (e.g., if support for additional node types or arrow functions is introduced, update both the rule docs and API Reference at the same time).
- Consider adding a compact "feature matrix" section to README or user-docs/api-reference.md that summarizes, in a single table, which rules support auto-fix, deep reference validation, and configuration options, each cell linking to the relevant detailed documentation section.
- Optionally add a short "CLI quick reference" table to README.md summarizing `traceability-maint` commands, key flags, and exit codes, with links into the detailed Maintenance API and CLI section in user-docs/api-reference.md, to make the maintenance tools more discoverable for new users.
- When future breaking changes or deprecations are introduced (e.g., changes to default patterns, directory structures, or CLI flags), continue to document them clearly via both CHANGELOG.md and user-docs/migration-guide.md so that local docs remain sufficient even without consulting GitHub Releases.

## DEPENDENCIES ASSESSMENT (97% ± 18% COMPLETE)
- Dependencies are fully up-to-date according to dry-aged-deps, install cleanly with no deprecation warnings, and are correctly locked and committed. Existing audit tools/scripts are in place; remaining npm audit issues currently have no safe, mature upgrade path.
- dry-aged-deps output (npx dry-aged-deps --format=json) shows totalOutdated=0 and safeUpdates=0 for both prod and dev dependencies, meaning there are no mature (>=7 days) safe upgrade candidates at this time.
- npm install (run twice, with and without --ignore-scripts) completes successfully with no npm WARN deprecated messages, indicating no direct use of deprecated packages in the current dependency set.
- npm ls --depth=0 shows a clean top-level dependency tree with all listed devDependencies installed (eslint 9.x, typescript 5.9.x, jest 30.x, husky 9.x, prettier 3.x, semantic-release 21.x, dry-aged-deps 2.3.1, etc.) and no reported version conflicts or peer dependency errors.
- package-lock.json exists and is tracked in git (confirmed by `git ls-files package-lock.json` → package-lock.json), ensuring reproducible installs and good package management hygiene.
- npm install output reports 3 vulnerabilities (1 low, 2 high) but dry-aged-deps reports no eligible updates; per project policy, this indicates there are currently no sufficiently mature, safe versions available to remediate via version bumps.
- npm audit and npm audit --audit-level=high both fail in this environment with no detailed stderr, but the project already includes dedicated audit and safety scripts (audit:ci, audit:dev-high, safety:deps) wired into ci-verify workflows, demonstrating an existing security/audit process beyond raw npm audit.
- No deprecation or deprecation-related warnings were observed during installation, and the dependency set is aligned with current major versions of the core tooling (eslint 9, typescript 5, jest 30, prettier 3, husky 9), suggesting good forward-compatibility.
- package.json uses overrides for known historically vulnerable transitive packages (glob, http-cache-semantics, ip, semver, socks, tar) to enforce patched versions, improving transitive dependency security posture.

**Next Steps:**
- Keep using `npx dry-aged-deps --format=json` (or the existing npm scripts that wrap it, like `npm run safety:deps` / `npm run ci-verify`) whenever you intentionally change dependencies, and apply any safe upgrades it reports; this is your single source of truth for mature, production-safe versions.
- Investigate locally why `npm audit` and `npm audit --audit-level=high` exit non‑zero without stderr (e.g., re-run with increased verbosity or in a different environment) so that if you rely on raw npm audit outside the existing ci-audit scripts, it behaves predictably.
- If/when dry-aged-deps starts reporting safe updates for packages related to the 3 reported vulnerabilities, apply those upgrades promptly and re-run `npm install`, `npm run ci-verify`, and `npx dry-aged-deps --format=json` to confirm a clean, secure dependency state.

## SECURITY ASSESSMENT (90% ± 18% COMPLETE)
- The project has a strong, well-documented security posture: production dependencies are currently free of moderate+ vulnerabilities, dev-only high-severity issues are confined to semantic-release’s bundled npm/ glob/ brace-expansion and are treated as a formally documented known error with strong compensating controls, secrets handling is robust, and CI/CD integrates security checks (audit, dry-aged-deps, secret scanning). No unaccepted moderate or high vulnerabilities were found.
- Dependency security – production:
  - `npm audit --omit=dev --audit-level=moderate` returned `found 0 vulnerabilities`, so there are currently no moderate-or-higher issues in the production dependency tree.
  - CI enforces `npm audit --omit=dev --audit-level=high` inside `ci-verify:full`, causing the pipeline to fail if any high-severity production vulnerability appears.
  - `package.json` uses `overrides` for several historically vulnerable packages (`glob`, `tar`, `http-cache-semantics`, `ip`, `semver`, `socks`), with rationale documented in `docs/security-incidents/dependency-override-rationale.md`. These overrides address earlier advisories and reduce the remaining attack surface.
- Dependency security – dev-only known issues and dry-aged-deps:
  - Dev dependency vulnerabilities (glob CLI command injection GHSA-5j98-mcp5-4vw2, brace-expansion ReDoS GHSA-v6h2-p8h4-qcjw, and npm transitively) are documented in:
    - `docs/security-incidents/dev-deps-high.json` (exact advisory data and affected nodes)
    - `docs/security-incidents/2025-11-17-glob-cli-incident.md`
    - `docs/security-incidents/2025-11-18-brace-expansion-redos.md`
    - `docs/security-incidents/2025-11-18-bundled-dev-deps-accepted-risk.md`
    - Consolidated as a formal known error in `SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md`.
  - These vulnerabilities exist only in the npm binary bundled inside `@semantic-release/npm@10.0.6` and are used solely in CI release automation; they are not in the published plugin’s runtime dependency tree.
  - The known-error record explains that `npx dry-aged-deps --format=json` currently finds no mature, safe upgrade path for `@semantic-release/npm` in the chosen semantic-release toolchain. Under the project’s policy, that means no SAFE patch is available yet.
  - Compensating controls required when vulnerabilities outlive the 14-day window are in place and documented:
    - Execution is isolated to the `quality-and-deploy` job on GitHub-hosted runners, on pushes to `main` only.
    - Job-level permissions are constrained to `contents`, `issues`, `pull-requests`, and `id-token` (no broad repo-wide or infrastructure access).
    - CI scripts and workflows never invoke `glob` with `-c/--cmd`, so the known injection vector is not used.
    - No untrusted input is fed into the semantic-release/npm CLI paths.
  - `npm run safety:deps` executes `scripts/ci-safety-deps.js`, which runs `npx --no-install dry-aged-deps --format=json` and writes `ci/dry-aged-deps.json`. This satisfies the requirement to run `dry-aged-deps` and ensures any future safe upgrades will be visible via CI artifacts.
- Security incident management and policy alignment:
  - Multiple incident documents exist under `docs/security-incidents/`, including a template and a handling procedure; they demonstrate a mature, documented response process:
    - `handling-procedure.md` defines detection, assessment, documentation, override decisions, and review steps.
    - `dependency-override-rationale.md` ties `package.json` overrides to specific advisories and risk assessments.
    - `SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md` clearly classifies the semantic-release/npm issue as a KNOWN ERROR with compensating controls and ongoing monitoring.
  - There are no `*.disputed.md` files, so no special audit filtering is required for disputed vulnerabilities; this matches the absence of `.nsprc`, `audit-ci.json`, or `audit-resolve.json`.
  - The known-error incident is older than 14 days, but the mandatory remediation rule (either apply safe patches or implement strong controls) is satisfied by the documented controls and by isolating the risk to dev-only tooling. The incident file was updated as of 2025‑12‑03, providing up-to-date justification.
- Security audits and CI integration:
  - `scripts/ci-audit.js` runs `npm audit --json`, writes the output to `ci/npm-audit.json`, and always exits 0 so that audit data is captured as an artifact without breaking the build. This is wired into `npm run audit:ci` and then into `ci-verify` and `ci-verify:full`.
  - `scripts/generate-dev-deps-audit.js` runs `npm audit --omit=prod --audit-level=high --json` and writes results to `ci/npm-audit.json`, focusing on dev dependencies. It is used by `npm run audit:dev-high` and the nightly `dependency-health` job.
  - The main CI/CD workflow `.github/workflows/ci-cd.yml`:
    - Runs on `push` and `pull_request` to `main`, plus a nightly `schedule` for dependency health.
    - Performs full quality and security checks via `npm run ci-verify:full`, which includes:
      - Build, type-check, linting, duplication, traceability checks, Jest tests with coverage, formatting checks.
      - `npm audit --omit=dev --audit-level=high` to enforce a clean production tree.
      - `npm run audit:dev-high` and `npm run safety:deps` to gather dev-only audit and dry-aged-deps reports.
    - Runs `npm run security:secrets` (secretlint) for additional secret scanning on Node 20.
    - Uploads `dry-aged-deps`, `npm-audit`, and traceability reports as CI artifacts so that dependency and security posture are inspectable after each run.
  - A separate `dependency-health` job, triggered nightly, re-runs dependency installation and `npm run audit:dev-high`, ensuring dev dependency vulnerabilities remain under continuous review.
- Secrets management and .env handling:
  - `.env` and environment-specific `.env.*.local` files are explicitly ignored in `.gitignore`, with `.env.example` allowed. This is the desired pattern.
  - `git ls-files .env` and `git log --all --full-history -- .env` both return empty output, proving that `.env` is not tracked and has never been committed. This meets the project’s acceptance criteria for secure local `.env` usage.
  - `.env.example` exists and contains only commented example values (no real secrets), which is safe.
  - Secret scanning is configured via `.secretlintrc.json` with the recommended rule preset and is run in CI using `npm run security:secrets` (`secretlint "**/*" --no-color`). The command completes successfully, indicating secretlint found no obvious hardcoded secrets.
  - CI release uses `GITHUB_TOKEN` and `NPM_TOKEN` from GitHub Actions secrets; the workflow explicitly checks for a missing or invalid `NPM_TOKEN` and handles EINVALIDNPMTOKEN and EOTP failures gracefully without leaking token values.
- Code-level security aspects (no DB, no HTML; safe process usage):
  - The project is an ESLint plugin plus a maintenance CLI; there is no custom database access layer or HTTP server, so SQL injection and XSS vectors are not present in implemented functionality.
  - The primary CLI (`src/maintenance/cli.ts`) parses arguments safely:
    - It does not construct shell commands; it only operates on local file paths and simple flags.
    - It uses explicit argument parsing (`applyFlag`, `parseFlags`), with validation on flags like `--format` to restrict values to `text` or `json`.
    - It uses clear exit codes and catches unexpected errors, printing concise diagnostics without exposing sensitive internals.
  - `child_process.spawnSync` is used only in small CI helper scripts (`scripts/ci-audit.js`, `scripts/ci-safety-deps.js`, `scripts/generate-dev-deps-audit.js`) to call `npm` or `dry-aged-deps`:
    - Calls pass command and arguments as arrays, with no `shell: true` flags and no interpolation of untrusted user input, which prevents shell injection.
    - Outputs are written to files under `ci/` for later inspection; errors are logged minimally.
  - No `eval`, dynamic `Function` constructors, or similar dangerous patterns are present in core plugin or CLI code based on sampled inspection (e.g., `src/index.ts`, `src/maintenance/cli.ts`).
- Configuration and CI/CD security:
  - CI workflow permissions are consciously minimized at the workflow and job levels, referencing ADR-001 for rationale. By default, workflow permissions are `contents: read`, with elevated `write` permissions scoped only to the `quality-and-deploy` job for releases.
  - Releases are fully automated via semantic-release in the same workflow that runs all quality and security checks, complying with the continuous deployment requirement:
    - `semantic-release` only runs on `push` events to `refs/heads/main` and only on Node 20.
    - After a successful publish, a `smoke-test` step installs the newly published package in a temporary project and validates that it loads, ensuring the published artifact is functional.
  - There is no evidence of conflicting dependency automation:
    - No `.github/dependabot.yml` / `.github/dependabot.yaml` files.
    - No `renovate.json` or Renovate-related workflow entries.
  - `.npmignore` and `.gitignore` ensure CI artifact directories (`ci/`), build outputs (`lib/`), and other non-essential files are not packaged or committed, reducing accidental exposure of internal reports or logs.
- Security tooling coverage and limitations:
  - `npm run ci-verify:full` includes `npm run safety:deps` (dry-aged-deps) and `npm run audit:ci`/`npm run audit:dev-high`, giving both a snapshot of current vulnerabilities and a view of safe upgrade paths.
  - The dev-dependency audit helper `scripts/generate-dev-deps-audit.js` uses `npm audit --omit=prod --audit-level=high --json`; current `npm` versions warn that `omit="prod"` is invalid and expect omit to be one or more of `dev`, `optional`, `peer`:
    - This does not reduce security of the project itself (the script still records output and exits 0) but may cause the dev-only audit snapshot to include both prod and dev vulnerabilities rather than being purely dev-focused.
    - Because production dependencies are separately enforced as clean via `npm audit --omit=dev --audit-level=high` inside `ci-verify:full`, this misconfiguration mainly affects reporting clarity rather than risk.
- Policy compliance vs. acceptance criteria:
  - Safety assessment with `dry-aged-deps` is executed via `npm run safety:deps`, and reports are persisted as artifacts. This matches the requirement to use `dry-aged-deps` as the sole source for safe, mature upgrades.
  - New vulnerabilities are surfaced through npm audit in CI; production vulnerabilities of high severity will fail the pipeline, and dev-only ones are captured in JSON reports.
  - The high-severity dev-only vulnerabilities are accepted as residual risk beyond 14 days, but in line with policy by:
    - Demonstrating that no safe, dry-aged upgrade exists for `@semantic-release/npm`.
    - Classifying the issue as a known error with comprehensive compensating controls (environment isolation, permissions hardening, restricted usage patterns, continuous auditing).
  - There are no `.disputed.md` incidents, so the absence of an audit-filter configuration is correct and avoids untracked exceptions.
  - Local `.env` handling meets all specified conditions (ignored, never committed, example file only), and the project rightly does not attempt to rotate or manage those local secrets in code.
- No blocking vulnerabilities found under policy:
  - No moderate-or-higher vulnerabilities in the production dependency tree are present (`npm audit --omit=dev --audit-level=moderate` → 0).
  - Moderate/high dev-only vulnerabilities are known, documented, and controlled as a `*.known-error.md` with evidence that there is currently no safe, dry-aged patch and that strong compensating controls are in place.
  - Therefore, there are no uncovered moderate+ vulnerabilities that violate the project’s acceptance criteria, and the project is not blocked by security at this time.

**Next Steps:**
- Correct the dev-dependency audit command to avoid invalid `omit=prod` usage and clarify scope: update `scripts/generate-dev-deps-audit.js` to run `npm audit --omit=dev --audit-level=high --json` (and adjust any related documentation) so that the dev-only audit snapshot accurately matches its intended purpose without relying on a deprecated/invalid flag.
- Explicitly re-run `npm run ci-verify:full` locally and in CI after any dependency updates to confirm that `npm audit --omit=dev --audit-level=high` continues to report 0 production vulnerabilities and that the semantic-release toolchain (including `@semantic-release/npm`) remains compatible with the existing overrides and compensating controls.
- Review `SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md` against the latest `ci/dry-aged-deps.json` and `ci/npm-audit.json` artifacts to confirm that no new, mature, dry-aged-safe upgrade path for `@semantic-release/npm` has appeared; if one is available and stable, plan and execute a controlled upgrade of the release toolchain to retire this known error.
- Continue to rely on `npm run security:secrets` (secretlint) in CI and, when changing scripts or configuration, rerun it locally to ensure no new hardcoded secrets or credentials are introduced into the repository.

## VERSION_CONTROL ASSESSMENT (98% ± 19% COMPLETE)
- Version control and CI/CD practices in this repo are excellent and very close to ideal: a single unified GitHub Actions workflow runs comprehensive quality checks on every push to main and then performs fully automated semantic-release-based publishing plus smoke tests. Modern Husky hooks enforce local parity with CI, the repository is clean (ignoring .voder), no build artifacts are tracked, and commit history follows conventional commits with small, focused changes.
- CI/CD – Single unified workflow with modern actions:
  - Workflow: .github/workflows/ci-cd.yml, name: "CI/CD Pipeline".
  - Triggers: push to main, pull_request to main, and a daily schedule; quality-and-deploy (including release) runs automatically on every push to main.
  - Uses current GitHub Actions versions (no known deprecations): actions/checkout@v4, actions/setup-node@v4, actions/upload-artifact@v4.
  - No tag-based triggers or workflow_dispatch for releases; releases are driven solely by pushes to main.
- CI/CD – Comprehensive quality gates:
  - quality-and-deploy job runs `npm run ci-verify:full` (see package.json), which in turn executes: traceability checks, dependency safety checks, CI audits, TypeScript build & type-check, ESLint plugin guards, lint with `--max-warnings=0`, duplication detection (jscpd), Jest tests with coverage, formatting check, `npm audit --omit=dev --audit-level=high`, and a dev-deps high audit.
  - Additional secret scanning step for Node 20: `npm run security:secrets` using secretlint.
  - This satisfies and exceeds required gates (build, tests, lint, type-check, format, security).
- CI/CD – Automated publishing & post-release verification:
  - Semantic-release is run inside the same workflow/job after all quality checks, gated by `if: github.event_name == 'push' && github.ref == 'refs/heads/main' && matrix['node-version'] == '20.x' && success()`.
  - Script in the Release with semantic-release step uses `npx semantic-release` with robust error handling for invalid/OTP-locked NPM tokens, marking `new_release_published`/`new_release_version` via $GITHUB_OUTPUT.
  - A Smoke test published package step runs `scripts/smoke-test.sh` against the newly published version when `new_release_published == 'true'`, providing post-publish verification.
  - Recent workflow run (ID 19894103202) shows semantic-release analyzing recent commits and correctly deciding "There are no relevant changes, so no new version is released" – fully automated decision-making with no manual gating.
- CI/CD – Dependency health job:
  - Same workflow contains a dependency-health job that runs only on schedule, not on pushes.
  - It installs dependencies and runs `npm run audit:dev-high`, providing recurring automated checks on dev-dependency security risk without impacting regular CI pushes.
- CI/CD – Pipeline health and deprecations:
  - Last 10 runs of the CI/CD Pipeline on main all succeeded (via get_github_pipeline_status), indicating sustained pipeline stability rather than flaky behavior.
  - Last 100 log lines for the latest run show no GitHub Actions deprecation warnings (e.g., no CodeQL v3 or actions/checkout@v2 notices) and no workflow syntax deprecations.
  - actionlint is present as a devDependency, and there is an ADR (docs/decisions/005-github-actions-validation-tooling.accepted.md) indicating pipeline validation is part of the process, further reducing risk of silent CI drift.
- Repository status & trunk-based development:
  - Current branch is main (`git branch --show-current` → main).
  - `git status -sb` shows only modifications in .voder/history.md and .voder/last-action.md; per assessment rules these .voder files are ignored, so the working tree is effectively clean.
  - `git log origin/main..HEAD --oneline` is empty, so there are no unpushed local commits; HEAD is aligned with origin/main.
  - Recent commit history (last 15 commits) uses strict Conventional Commits (e.g., `docs:`, `refactor:`, `feat:`, `fix:`, `test:`, `chore:`) and consists of small, targeted changes; no recent merge commits or branch merges are visible in that window, consistent with trunk-based development and frequent direct commits to main.
- Repository structure, .gitignore, and build artifacts:
  - .gitignore includes appropriate entries for node_modules, coverage outputs, caches, logs, various framework builds (.next, .nuxt, dist, public, etc.), and explicitly ignores lib/, build/, and dist/ as build outputs.
  - .voder is NOT in .gitignore and IS tracked (e.g., .voder/history.md, .voder/plan.md, .voder/traceability/*), satisfying the requirement to keep assessment history under version control.
  - `git ls-files` output shows no tracked lib/, dist/, build/, or out/ directories and no compiled .js/.d.ts outputs corresponding to src TypeScript sources; compiled output is intentionally omitted from git and only referenced in package.json for publishing ("main": "lib/src/index.js", "types": "lib/src/index.d.ts").
  - A dedicated script scripts/check-no-tracked-ci-artifacts.js and .gitignore entries for ci/ and jscpd-report/ indicate explicit safeguards against accidentally committing generated CI artifacts.
- Pre-commit hooks – fast basic checks with formatting and lint:
  - Husky v9 is configured with a modern setup: package.json has "prepare": "husky install" and a .husky directory.
  - .husky/pre-commit contents: sources Husky shim (`. "$(dirname "$0")/_/husky.sh"`) and runs `npx lint-staged`.
  - lint-staged configuration (in package.json) runs `prettier --write` and `eslint --fix` over src and tests on staged files, providing auto-formatting and linting before commit.
  - This satisfies the pre-commit requirements: fast, file-scoped checks; automatic formatting; and lint-based syntax/quality checks (no heavy build/tests here). No deprecated Husky v4 style (.huskyrc) or deprecated install commands are used.
- Pre-push hooks – full CI-equivalent gate with exact parity:
  - .husky/pre-push executes: `npm run ci-verify:full && echo "Pre-push full CI-equivalent checks completed"` with `set -e`.
  - ADR docs (docs/decisions/adr-pre-push-parity.md) explicitly define that ci-verify:full is the pre-push quality gate and must mirror full CI checks.
  - The GitHub Actions workflow also invokes `npm run ci-verify:full` as its main verification step, meaning local pre-push and CI are guaranteed to run **identical** checks (build, tests, lint, type-check, formatting check, duplication, audits, safety checks, traceability).
  - Environment variable `HUSKY: 0` is set in CI workflow env to disable Husky when running in GitHub Actions, preventing redundant local-style hooks from re-running inside CI.
  - Together, this meets and exceeds the requirement that pushes be blocked when any of the same checks that CI runs would fail.
- Hooks presence and installation:
  - .husky directory is present and tracked, containing pre-commit and pre-push scripts.
  - There are no legacy .git/hooks/pre-commit or pre-push scripts checked into the repo; hooks are managed entirely via Husky.
  - Because "prepare": "husky install" is defined in package.json, cloning and installing dependencies will automatically install Git hooks, ensuring consistent enforcement across developer machines without manual setup.
- Commit history quality and safety:
  - Recent commits are well-structured, descriptive, and follow Conventional Commits strictly (e.g., `docs: formalize dev-deps high-severity incident as known error`, `refactor: extend deep req validation to support implements`, `feat: add configurable annotation format patterns`).
  - There are dedicated docs and ADRs for CI/CD (e.g., docs/ci-cd-pipeline.md, docs/decisions/004-automated-version-bumping-for-ci-cd.md, docs/decisions/006-semantic-release-for-automated-publishing.accepted.md), indicating intentional, documented process rather than ad-hoc configuration.
  - Secret scanning is part of CI (`npm run security:secrets` via secretlint), reducing risk of secrets accidentally committed in history.

**Next Steps:**
- Codify trunk-based expectations in CONTRIBUTING.md (if not already explicit): add a short section stating that all work should land via frequent, small commits to main, and that the semantic-release-driven CI/CD pipeline is the single path to production releases. This aligns documented process with the current implementation and helps new contributors follow the same model.
- Optionally add a short npm script alias such as "verify:full": "npm run ci-verify:full" to make it slightly more discoverable for developers who want to run the full CI-equivalent suite manually outside of a push (the Husky hook already uses ci-verify:full, so this would just improve ergonomics, not behavior).
- Periodically review the set of quality checks aggregated in ci-verify:full to ensure they remain balanced in duration vs. coverage; if the pre-push step ever becomes too slow for developer workflow, consider splitting out a slightly lighter "ci-verify:fast" pre-push option and reserving the full suite for a manual `npm run ci-verify:full` (while keeping CI itself on ci-verify:full). This is not currently necessary but is the main lever if the repo grows significantly.
- Keep an eye on upstream GitHub Actions and Husky release notes and upgrade promptly when a new major version or deprecation notice appears (e.g., if actions/upload-artifact or setup-node introduce a v5 with v4 deprecation warnings). The current setup is fully up-to-date, so this is more about maintaining the current excellent standard.
- Maintain the current discipline around not committing build outputs (lib/, dist/, build/) and CI artifacts; if the build system changes in the future, update .gitignore and scripts/check-no-tracked-ci-artifacts.js accordingly to ensure generated files continue to stay out of version control.

## FUNCTIONALITY ASSESSMENT (85% ± 95% COMPLETE)
- 2 of 13 stories incomplete. Earliest failed: docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
- Total stories assessed: 13 (0 non-spec files excluded)
- Stories passed: 11
- Stories failed: 2
- Earliest incomplete story: docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
- Failure reason: Functionality for Story 010.2-DEV-MULTI-STORY-SUPPORT is largely implemented and well-tested, but the documentation acceptance criterion is not fully satisfied.

Per-criterion assessment:

1. **Core Functionality – Support `@implements story-path REQ-ID1 REQ-ID2 ...`**
   - Implemented in `src/rules/valid-annotation-format.ts` and `src/rules/helpers/valid-implements-utils.ts`.
   - `normalizeCommentLine` and `processCommentLine` detect `@implements`, extract the value, and delegate to `validateImplementsAnnotation`.
   - `validateImplementsAnnotationHelper` enforces that values contain at least a story path plus one requirement ID and validates them against the same patterns used for `@story`/`@req`.
   - Tests in `tests/rules/valid-annotation-format.test.ts` cover valid single and multiple @implements lines.
   - **Status: Met.**

2. **Validation – Validate each requirement exists in its specified story file**
   - Implemented in `src/rules/valid-req-reference.ts` via `parseImplementsLine` and `validateImplementsLine`, which:
     - Extract the story path and all requirement IDs.
     - Resolve and validate the story path, then load/cached requirement IDs from that file.
     - Call `checkRequirementExists` for each ID, reporting `reqMissing` with the storyPath when absent.
   - Tests in `tests/rules/valid-req-reference.test.ts` include both valid and invalid @implements references, confirming behavior.
   - **Status: Met.**

3. **Backward Compatibility – Existing `@story` + `@req` annotations continue working unchanged**
   - The new `@implements` logic is additive: `valid-annotation-format` and `valid-req-reference` still process `@story`/`@req` as before, and `@implements` is handled in a separate branch without changing prior flows.
   - Existing tests for earlier stories (005.0, 007.0, 010.0, 010.1) in `tests/rules/valid-annotation-format.test.ts`, `tests/rules/valid-req-reference.test.ts`, and other rule tests all still pass under `npm test`.
   - **Status: Met.**

4. **Mixed Usage – Support both annotation styles in same codebase/file**
   - `processCommentLine` supports detecting `@implements` alongside `@story` and `@req`, and only `@story`/`@req` participate in the multi-line pending state, while `@implements` is validated immediately per line.
   - `handleAnnotationLine` in `valid-req-reference` allows `@implements` lines to coexist with `@story`/`@req` without overwriting the active story path used for `@req`.
   - Explicit test case `[REQ-MIXED-SUPPORT] valid mixed @story/@req/@implements usage in same block comment` verifies mixed usage at the format level.
   - **Status: Met.**

5. **Error Messages – Clearly indicate which story was checked when requirement validation fails**
   - Deep rule `valid-req-reference` reports errors using:
     - `reqMissing: "Requirement '{{reqId}}' not found in '{{storyPath}}'"`
     - `invalidPath: "Invalid story path '{{storyPath}}'"`
   - Implemented checks for @implements use the same helpers (`checkRequirementExists` and `validateAndResolveStoryPath`), so all errors include the storyPath.
   - Tests in `valid-req-reference.test.ts` assert both `reqId` and `storyPath` data in error objects, including for @implements lines.
   - Format-level invalid @implements errors use `invalidImplementsFormat` with detailed `details` text that includes the example story path.
   - **Status: Met.**

6. **Requirement Scoping – Requirement IDs only need to be unique within their story file**
   - `loadAndCacheRequirements` maintains a `Map<resolvedStoryPath, Set<reqId>>`, so each story file has its own requirement set.
   - Tests use two fixtures, `tests/fixtures/story_multi_a.md` and `tests/fixtures/story_multi_b.md`, both containing `REQ-SHARED-ID` plus their own unique IDs.
   - Valid tests show that using `@implements` against both files with the same `REQ-SHARED-ID` passes; invalid test `REQ-NOT-IN-A` fails only against the respective file.
   - **Status: Met.**

7. **Quality Standards – ESLint rule development best practices**
   - Implementation follows ESLint idioms: `meta` with messages/schema, a `create` function returning visitors, helper modules with clear responsibilities, and tests via `RuleTester`.
   - Errors use structured `messageId` + `data` and reuse shared error-building helpers for consistency.
   - **Status: Met.**

8. **Documentation – Clear examples of both annotation styles and migration guidance**
   - There IS documentation explaining @implements and showing examples:
     - `docs/rules/valid-annotation-format.md` includes an explicit `@implements` example and describes how its story and requirement segments are validated.
     - `docs/rules/valid-req-reference.md` documents how `@implements` participates in deep validation, including interaction with `@story`/`@req` and requirement scoping.
   - However, the story’s acceptance criterion explicitly calls for **"migration guidance"** (how to move from `@story`/`@req`-only usage to `@implements`).
     - A search for "migration" shows no such guidance in `docs/rules/valid-annotation-format.md` or `docs/rules/valid-req-reference.md`.
     - Existing documentation explains behavior and usage but does not provide concrete migration steps, strategies, or examples of converting legacy annotations to @implements.
   - The story itself also tracks this item as unchecked (`[ ] Documentation` in the acceptance criteria and DoD).
   - **Status: Not fully met.**

Because the **Documentation** acceptance criterion (specifically including migration guidance) is not fully satisfied, the story as a whole is **not yet complete**, even though core functionality and tests for multi-story `@implements` support are implemented and passing.


**Next Steps:**
- Complete story: docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
- Functionality for Story 010.2-DEV-MULTI-STORY-SUPPORT is largely implemented and well-tested, but the documentation acceptance criterion is not fully satisfied.

Per-criterion assessment:

1. **Core Functionality – Support `@implements story-path REQ-ID1 REQ-ID2 ...`**
   - Implemented in `src/rules/valid-annotation-format.ts` and `src/rules/helpers/valid-implements-utils.ts`.
   - `normalizeCommentLine` and `processCommentLine` detect `@implements`, extract the value, and delegate to `validateImplementsAnnotation`.
   - `validateImplementsAnnotationHelper` enforces that values contain at least a story path plus one requirement ID and validates them against the same patterns used for `@story`/`@req`.
   - Tests in `tests/rules/valid-annotation-format.test.ts` cover valid single and multiple @implements lines.
   - **Status: Met.**

2. **Validation – Validate each requirement exists in its specified story file**
   - Implemented in `src/rules/valid-req-reference.ts` via `parseImplementsLine` and `validateImplementsLine`, which:
     - Extract the story path and all requirement IDs.
     - Resolve and validate the story path, then load/cached requirement IDs from that file.
     - Call `checkRequirementExists` for each ID, reporting `reqMissing` with the storyPath when absent.
   - Tests in `tests/rules/valid-req-reference.test.ts` include both valid and invalid @implements references, confirming behavior.
   - **Status: Met.**

3. **Backward Compatibility – Existing `@story` + `@req` annotations continue working unchanged**
   - The new `@implements` logic is additive: `valid-annotation-format` and `valid-req-reference` still process `@story`/`@req` as before, and `@implements` is handled in a separate branch without changing prior flows.
   - Existing tests for earlier stories (005.0, 007.0, 010.0, 010.1) in `tests/rules/valid-annotation-format.test.ts`, `tests/rules/valid-req-reference.test.ts`, and other rule tests all still pass under `npm test`.
   - **Status: Met.**

4. **Mixed Usage – Support both annotation styles in same codebase/file**
   - `processCommentLine` supports detecting `@implements` alongside `@story` and `@req`, and only `@story`/`@req` participate in the multi-line pending state, while `@implements` is validated immediately per line.
   - `handleAnnotationLine` in `valid-req-reference` allows `@implements` lines to coexist with `@story`/`@req` without overwriting the active story path used for `@req`.
   - Explicit test case `[REQ-MIXED-SUPPORT] valid mixed @story/@req/@implements usage in same block comment` verifies mixed usage at the format level.
   - **Status: Met.**

5. **Error Messages – Clearly indicate which story was checked when requirement validation fails**
   - Deep rule `valid-req-reference` reports errors using:
     - `reqMissing: "Requirement '{{reqId}}' not found in '{{storyPath}}'"`
     - `invalidPath: "Invalid story path '{{storyPath}}'"`
   - Implemented checks for @implements use the same helpers (`checkRequirementExists` and `validateAndResolveStoryPath`), so all errors include the storyPath.
   - Tests in `valid-req-reference.test.ts` assert both `reqId` and `storyPath` data in error objects, including for @implements lines.
   - Format-level invalid @implements errors use `invalidImplementsFormat` with detailed `details` text that includes the example story path.
   - **Status: Met.**

6. **Requirement Scoping – Requirement IDs only need to be unique within their story file**
   - `loadAndCacheRequirements` maintains a `Map<resolvedStoryPath, Set<reqId>>`, so each story file has its own requirement set.
   - Tests use two fixtures, `tests/fixtures/story_multi_a.md` and `tests/fixtures/story_multi_b.md`, both containing `REQ-SHARED-ID` plus their own unique IDs.
   - Valid tests show that using `@implements` against both files with the same `REQ-SHARED-ID` passes; invalid test `REQ-NOT-IN-A` fails only against the respective file.
   - **Status: Met.**

7. **Quality Standards – ESLint rule development best practices**
   - Implementation follows ESLint idioms: `meta` with messages/schema, a `create` function returning visitors, helper modules with clear responsibilities, and tests via `RuleTester`.
   - Errors use structured `messageId` + `data` and reuse shared error-building helpers for consistency.
   - **Status: Met.**

8. **Documentation – Clear examples of both annotation styles and migration guidance**
   - There IS documentation explaining @implements and showing examples:
     - `docs/rules/valid-annotation-format.md` includes an explicit `@implements` example and describes how its story and requirement segments are validated.
     - `docs/rules/valid-req-reference.md` documents how `@implements` participates in deep validation, including interaction with `@story`/`@req` and requirement scoping.
   - However, the story’s acceptance criterion explicitly calls for **"migration guidance"** (how to move from `@story`/`@req`-only usage to `@implements`).
     - A search for "migration" shows no such guidance in `docs/rules/valid-annotation-format.md` or `docs/rules/valid-req-reference.md`.
     - Existing documentation explains behavior and usage but does not provide concrete migration steps, strategies, or examples of converting legacy annotations to @implements.
   - The story itself also tracks this item as unchecked (`[ ] Documentation` in the acceptance criteria and DoD).
   - **Status: Not fully met.**

Because the **Documentation** acceptance criterion (specifically including migration guidance) is not fully satisfied, the story as a whole is **not yet complete**, even though core functionality and tests for multi-story `@implements` support are implemented and passing.

- Evidence: Story file exists: docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md,Implements-format parsing & validation (format-level): src/rules/valid-annotation-format.ts and src/rules/helpers/valid-implements-utils.ts

- valid-annotation-format.ts defines `validateImplementsAnnotation` and wires it into the main rule:
  ```ts
  import {
    MIN_IMPLEMENTS_TOKENS,
    reportMissingImplementsReqIds,
    reportMissingImplementsValue,
    reportInvalidImplementsReqId,
    reportInvalidImplementsStoryPath,
    validateImplementsAnnotationHelper,
  } from "./helpers/valid-implements-utils";
  ...
  function validateImplementsAnnotation(
    context: any,
    comment: any,
    rawValue: string,
    options: ResolvedAnnotationOptions,
  ): void {
    const deps = {
      MIN_IMPLEMENTS_TOKENS,
      reportMissingImplementsReqIds,
      reportMissingImplementsValue,
      reportInvalidImplementsReqId,
      reportInvalidImplementsStoryPath,
    };

    validateImplementsAnnotationHelper(deps, context, comment, {
      rawValue,
      options,
    });
  }
  ```

- valid-annotation-format-internal.ts normalizes lines and detects @implements alongside @story/@req:
  ```ts
  export function normalizeCommentLine(rawLine: string): string {
    const trimmed = rawLine.trim();
    if (!trimmed) return "";

    const annotationMatch = trimmed.match(/@story\b|@req\b|@implements\b/);
    if (!annotationMatch || annotationMatch.index === undefined) {
      const withoutLeadingStar = trimmed.replace(/^\*\s?/, "");
      return withoutLeadingStar;
    }

    return trimmed.slice(annotationMatch.index);
  }
  ```

- processCommentLine handles mixed usage and treats @implements as a separate, single-line annotation:
  ```ts
  const isStory = /@story\b/.test(normalized);
  const isReq = /@req\b/.test(normalized);
  const isImplements = /@implements\b/.test(normalized);

  // Handle @implements as an immediate, single-line annotation
  if (isImplements) {
    const implementsValue = normalized.replace(/^@implements\b/, "").trim();
    validateImplementsAnnotation(context, comment, implementsValue, options);
    return pending;
  }
  ```

- valid-implements-utils.ts enforces the `@implements <story-path> <REQ-ID>...` value shape and validates story/req formats using the same patterns as @story/@req:
  ```ts
  export const MIN_IMPLEMENTS_TOKENS = 2;

  function parseImplementsTokens(...): ParsedImplementsTokens | null {
    const value = rawValue?.trim() ?? "";
    if (!value) { reportMissingImplementsValue(...); return null; }

    const tokens = value.split(/\s+/);
    if (tokens.length < MIN_IMPLEMENTS_TOKENS) {
      reportMissingImplementsReqIds(...);
      return null;
    }

    const [storyPath, ...reqIds] = tokens;
    return { storyPath, reqIds };
  }

  function validateImplementsTokens(...): void {
    const { storyPath, reqIds } = parsed;

    if (!options.storyPattern.test(storyPath)) {
      reportInvalidImplementsStoryPath(..., storyPath, options);
      return;
    }

    for (const reqId of reqIds) {
      if (!options.reqPattern.test(reqId)) {
        reportInvalidImplementsReqId(context, comment, reqId, options);
      }
    }
  }

  export function validateImplementsAnnotationHelper(...) {
    const parsed = parseImplementsTokens(...);
    if (!parsed) return;
    validateImplementsTokens(...);
  }
  ```,Deep requirement validation for @implements (multi-story + scoped IDs): src/rules/valid-req-reference.ts

- Token positions for @implements:
  ```ts
  const IMPLEMENTS_TOKENS = {
    STORY_INDEX: 1,
    FIRST_REQ_INDEX: 2,
  } as const;
  ```

- Parsing an @implements line into storyPath + reqIds:
  ```ts
  function parseImplementsLine(
    line: string,
  ): { storyPath: string; reqIds: string[] } | null {
    const parts = line.split(/\s+/);
    const storyPath = parts[IMPLEMENTS_TOKENS.STORY_INDEX];
    const reqIds = parts.slice(IMPLEMENTS_TOKENS.FIRST_REQ_INDEX);
    if (!storyPath || reqIds.length === 0) {
      return null;
    }
    return { storyPath, reqIds };
  }
  ```

- Validating each @implements requirement against the specified story file (reusing the same deep validation pipeline as @req):
  ```ts
  function validateImplementsLine(opts: { comment: any; context: any; line: string; cwd: string; reqCache: Map<string, Set<string>>; }): void {
    const { comment, context, line, cwd, reqCache } = opts;
    const parsed = parseImplementsLine(line);
    if (!parsed) return;

    const { storyPath, reqIds } = parsed;

    const { reqSet } = resolveStoryAndRequirements({
      comment,
      context,
      storyPath,
      cwd,
      reqCache,
    });

    if (!reqSet) return;

    for (const reqId of reqIds) {
      checkRequirementExists({ comment, context, reqId, storyPath, reqSet });
    }
  }
  ```

- `handleAnnotationLine` supports mixed @story/@req/@implements usage without interfering behaviors:
  ```ts
  function handleAnnotationLine(...): string | null {
    ...
    if (line.startsWith("@story")) {
      const newPath = extractStoryPath(comment);
      return newPath || storyPath;
    } else if (line.startsWith("@req")) {
      validateReqLine({ comment, context, line, storyPath, cwd, reqCache });
      return storyPath;
    } else if (line.startsWith("@implements")) {
      validateImplementsLine({ comment, context, line, cwd, reqCache });
      return storyPath;
    }
    return storyPath;
  }
  ```

- Deep requirement lookup is scoped per *resolvedStoryPath* (requirement IDs only need to be unique within a single file):
  ```ts
  function loadAndCacheRequirements({ resolvedStoryPath, reqCache }): Set<string> {
    if (!reqCache.has(resolvedStoryPath)) {
      const content = fs.readFileSync(resolvedStoryPath, "utf8");
      const found = new Set<string>();
      const regex = /REQ-[A-Z0-9-]+/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        found.add(match[0]);
      }
      reqCache.set(resolvedStoryPath, found);
    }
    return reqCache.get(resolvedStoryPath)!;
  }
  ```

- Error messages include the story path context for missing requirements (used by both @req and @implements):
  ```ts
  function checkRequirementExists({ comment, context, reqId, storyPath, reqSet }) {
    if (!reqSet.has(reqId)) {
      context.report({
        node: comment as any,
        messageId: "reqMissing",
        data: { reqId, storyPath },
      });
    }
  }

  meta: {
    messages: {
      reqMissing: "Requirement '{{reqId}}' not found in '{{storyPath}}'",
      invalidPath: "Invalid story path '{{storyPath}}'",
    },
  }
  ```,Tests for 010.2 functionality (format-level and deep validation):

- valid-annotation-format tests explicitly reference this story and its requirements:
  ```ts
  /**
   * Tests for: docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
   * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
   * @req REQ-IMPLEMENTS-PARSE - Rule parses @implements annotations with story and requirement references
   * @req REQ-FORMAT-VALIDATION - Rule validates story and requirement formats inside @implements annotations
   * @req REQ-MIXED-SUPPORT - Rule supports mixed @story/@req/@implements usage in the same comment
   */
  ```

- Positive cases (core @implements parsing, multiple lines, and mixed usage):
  ```ts
  {
    name: "[REQ-IMPLEMENTS-PARSE] valid single @implements with one story and one requirement (default patterns)",
    code: `/**
 * @implements docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-IMPLEMENTS-PARSE
 */`,
  },
  {
    name: "[REQ-IMPLEMENTS-PARSE] valid multiple @implements lines with different stories and requirements",
    code: `/**
 * @implements docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-IMPLEMENTS-PARSE REQ-FORMAT-VALIDATION
 * @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-FORMAT-SPECIFICATION
 */`,
  },
  {
    name: "[REQ-MIXED-SUPPORT] valid mixed @story/@req/@implements usage in same block comment",
    code: `/**
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-MIXED-SUPPORT
 * @implements docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-IMPLEMENTS-PARSE REQ-FORMAT-VALIDATION REQ-MIXED-SUPPORT
 */`,
  },
  ```

- Negative cases for @implements format validation (no value, only story, invalid story path, invalid req IDs):
  ```ts
  makeInvalid({
    name: "[REQ-IMPLEMENTS-PARSE] @implements with no value is invalid",
    code: `/**
 * @implements
 */`,
    messageId: "invalidImplementsFormat",
    details:
      'Missing story path and requirement IDs for @implements annotation. Expected a value like "docs/stories/005.0-DEV-EXAMPLE.story.md REQ-EXAMPLE".',
  }),
  makeInvalid({
    name: "[REQ-IMPLEMENTS-PARSE] @implements with only story path and no requirement IDs is invalid",
    code: `/**
 * @implements docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 */`,
    messageId: "invalidImplementsFormat",
    details:
      'Missing requirement IDs for @implements annotation. Expected a value like "docs/stories/005.0-DEV-EXAMPLE.story.md REQ-EXAMPLE".',
  }),
  makeInvalid({
    name: "[REQ-FORMAT-VALIDATION] @implements with invalid story path format",
    code: `/**
 * @implements invalid/path.txt REQ-IMPLEMENTS-PARSE
 */`,
    messageId: "invalidImplementsFormat",
    details:
      'Invalid story path "invalid/path.txt" for @implements annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
  }),
  {
    name: "[REQ-FORMAT-VALIDATION] @implements with invalid requirement ID format",
    code: `/**
 * @implements docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-VALID invalid-format
 */`,
    errors: [
      {
        messageId: "invalidReqFormat",
        data: {
          details:
            'Invalid requirement ID "invalid-format" for @req annotation. Expected an identifier like "REQ-EXAMPLE" (uppercase letters, numbers, and dashes only).',
        },
      },
    ],
  },
  ```

- valid-req-reference tests cover deep validation for @implements and requirement scoping across multiple story files:
  ```ts
  {
    name: "[REQ-DEEP-IMPLEMENTS] single implements line with multiple requirements in multi-story fixture (see 010.2-DEV-MULTI-STORY-SUPPORT)",
    code: `// @implements tests/fixtures/story_multi_a.md REQ-SHARED-ID REQ-ONLY-A`,
  },
  {
    name: "[REQ-DEEP-IMPLEMENTS] multi-story implements with shared requirement IDs (see 010.2-DEV-MULTI-STORY-SUPPORT)",
    code: `// @implements tests/fixtures/story_multi_a.md REQ-SHARED-ID REQ-ONLY-A
// @implements tests/fixtures/story_multi_b.md REQ-SHARED-ID REQ-ONLY-B`,
  },
  {
    name: "[REQ-DEEP-IMPLEMENTS] missing implements requirement in multi-story fixture (see 010.2-DEV-MULTI-STORY-SUPPORT)",
    code: `// @implements tests/fixtures/story_multi_a.md REQ-NOT-IN-A`,
    errors: [
      {
        messageId: "reqMissing",
        data: {
          reqId: "REQ-NOT-IN-A",
          storyPath: "tests/fixtures/story_multi_a.md",
        },
      },
    ],
  },
  {
    name: "[REQ-DEEP-IMPLEMENTS] disallow path traversal in implements story path (see 010.2-DEV-MULTI-STORY-SUPPORT)",
    code: `// @implements ../tests/fixtures/story_multi_a.md REQ-SHARED-ID`,
    errors: [
      {
        messageId: "invalidPath",
        data: {
          storyPath: "../tests/fixtures/story_multi_a.md",
        },
      },
    ],
  },
  ```

- Story fixtures demonstrate scoped requirement IDs (same ID reused in multiple files):
  ```md
  // tests/fixtures/story_multi_a.md
  - REQ-SHARED-ID
  - REQ-ONLY-A

  // tests/fixtures/story_multi_b.md
  - REQ-SHARED-ID
  - REQ-ONLY-B
  ```,Documentation for @implements exists, but lacks explicit migration guidance:

- docs/rules/valid-annotation-format.md documents @implements format and examples:
  ```md
  - **`@implements` format support**
    - The rule validates `@implements` annotations that associate code with one or more stories and requirements, such as:
      ```js
      /**
       * @implements docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-FOO REQ-BAR
       */
      ```
    - The story path that appears first in an `@implements` annotation is validated using the same story pattern as `@story`.
    - All requirement IDs that follow ... are validated using the same requirement pattern as `@req`.
  ```

- docs/rules/valid-req-reference.md documents deep validation behavior for @implements, including multi-story usage and scoped requirement IDs, but does not contain any explicit "migration" or "how to migrate from @story/@req to @implements" section:
  ```md
  Enforces that `@req` and `@implements` annotations reference existing requirements in story files ...

  ### Interaction of `@story`/`@req` and `@implements`

  - `@story` sets a default story file path for all subsequent `@req` lines...
  - Each `@implements` line is self-contained...
  - Requirement IDs only need to be unique within a single story file; duplicates across different story files are allowed...
  ```

- Grep for "migration" shows no migration guidance in these rule docs:
  ```bash
  $ grep -R -n migration docs/rules
  # (no hits in valid-annotation-format.md or valid-req-reference.md)
  ```,Tests run:

- Command executed:
  ```bash
  npm test -- --runInBand --verbose
  ```
  Output:
  ```text
  > eslint-plugin-traceability@1.0.5 test
  > jest --ci --bail --runInBand --verbose
  ```
  The command completed without reported failures (no Jest error output or non-zero exit reported by the tool), indicating all Jest tests, including those for valid-annotation-format and valid-req-reference, are passing.
